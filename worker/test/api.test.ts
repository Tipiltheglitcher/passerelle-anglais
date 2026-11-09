// @vitest-environment node
/**
 * API Passerelle : comptes, sessions, limitation des tentatives,
 * synchronisation versionnée, validation des XP et classement.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { handle } from '../src/index';
import { b64url, randomBytes } from '../src/crypto';
import { scoreSession, weekStart, XP_RULES } from '../src/rules';
import type { Env } from '../src/types';
import { createTestD1 } from './sqlite-d1';

const ORIGIN = 'https://site.test';
const T0 = Date.UTC(2026, 10, 11, 12); // mercredi
let env: Env & { DB: ReturnType<typeof createTestD1> };

beforeEach(() => {
  env = { DB: createTestD1(), ALLOWED_ORIGINS: ORIGIN };
});

const newKey = () => b64url(randomBytes(32));

async function call(method: string, path: string, o: { body?: unknown; token?: string; origin?: string | null; now?: number; ip?: string } = {}) {
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  if (o.origin !== null) headers.Origin = o.origin ?? ORIGIN;
  if (o.token) headers.Authorization = `Bearer ${o.token}`;
  if (o.ip) headers['CF-Connecting-IP'] = o.ip;
  const res = await handle(new Request(`https://api.test${path}`, { method, headers, body: o.body === undefined ? undefined : JSON.stringify(o.body) }), env, o.now ?? T0);
  const text = await res.text();
  return { status: res.status, data: text ? JSON.parse(text) : null, res };
}

async function signup(pseudo = 'Alice', key = newKey(), now = T0) {
  const r = await call('POST', '/auth/register', { body: { pseudo, key }, now, ip: `ip-${pseudo}` });
  expect(r.status).toBe(201);
  return { token: r.data.token as string, key, user: r.data.user };
}

const session = (id: string, over: Record<string, unknown> = {}) => ({
  id,
  mode: 'practice',
  total: 10,
  correct: 8,
  xp: 120,
  durationMs: 120000,
  startedAt: T0 - 200000,
  endedAt: T0 - 10000,
  ...over,
});

describe('comptes', () => {
  it('inscription, pseudo unique (insensible à la casse), mot de passe jamais stocké en clair', async () => {
    const { key, user } = await signup('Alice');
    expect(user.pseudo).toBe('Alice');
    const dup = await call('POST', '/auth/register', { body: { pseudo: 'alice', key: newKey() } });
    expect(dup.status).toBe(409);
    const row = env.DB.raw.prepare('SELECT * FROM users').get() as Record<string, string>;
    expect(JSON.stringify(row)).not.toContain(key);
    expect(row.pw_hash).toMatch(/^[0-9a-f]{64}$/);
    // le jeton de session n'est conservé que sous forme hachée
    const s = env.DB.raw.prepare('SELECT token_hash FROM auth_sessions').get() as { token_hash: string };
    expect(s.token_hash).toMatch(/^[0-9a-f]{64}$/);
  });

  it('pseudo et clé validés', async () => {
    expect((await call('POST', '/auth/register', { body: { pseudo: 'a', key: newKey() } })).status).toBe(400);
    expect((await call('POST', '/auth/register', { body: { pseudo: 'Bob <script>', key: newKey() } })).status).toBe(400);
    expect((await call('POST', '/auth/register', { body: { pseudo: 'Bob', key: 'motdepasse' } })).status).toBe(400);
  });

  it('connexion, déconnexion et routes protégées', async () => {
    const { key } = await signup('Alice');
    expect((await call('GET', '/me')).status).toBe(401);
    const bad = await call('POST', '/auth/login', { body: { pseudo: 'alice', key: newKey() } });
    expect(bad.status).toBe(401);
    const ok = await call('POST', '/auth/login', { body: { pseudo: 'ALICE', key } });
    expect(ok.status).toBe(200);
    const me = await call('GET', '/me', { token: ok.data.token });
    expect(me.data.user.pseudo).toBe('Alice');
    expect((await call('POST', '/auth/logout', { token: ok.data.token })).status).toBe(204);
    expect((await call('GET', '/me', { token: ok.data.token })).status).toBe(401);
  });

  it('session expirée au bout de 90 jours sans utilisation', async () => {
    const { token } = await signup('Alice');
    expect((await call('GET', '/me', { token, now: T0 + 89 * 86400000 })).status).toBe(200);
    // utilisation récente : la session est prolongée
    expect((await call('GET', '/me', { token, now: T0 + 170 * 86400000 })).status).toBe(200);
    expect((await call('GET', '/me', { token, now: T0 + 300 * 86400000 })).status).toBe(401);
  });

  it('limitation des tentatives de connexion', async () => {
    const { key } = await signup('Alice');
    for (let i = 0; i < 5; i++) expect((await call('POST', '/auth/login', { body: { pseudo: 'Alice', key: newKey() } })).status).toBe(401);
    const blocked = await call('POST', '/auth/login', { body: { pseudo: 'Alice', key } });
    expect(blocked.status).toBe(429);
    expect(blocked.res.headers.get('Retry-After')).toBe('900');
    // après la fenêtre de 15 minutes, la connexion redevient possible
    expect((await call('POST', '/auth/login', { body: { pseudo: 'Alice', key }, now: T0 + 16 * 60000 })).status).toBe(200);
  });

  it('limitation des inscriptions par adresse', async () => {
    for (let i = 0; i < 5; i++) expect((await call('POST', '/auth/register', { body: { pseudo: `user${i}`, key: newKey() }, ip: '1.2.3.4' })).status).toBe(201);
    expect((await call('POST', '/auth/register', { body: { pseudo: 'user9', key: newKey() }, ip: '1.2.3.4' })).status).toBe(429);
  });

  it('suppression définitive du compte et de toutes ses données', async () => {
    const { token, key } = await signup('Alice');
    await call('PUT', '/progress', { token, body: { baseVersion: 0, data: '{}', summary: { xp: 1, exercises: 1, sessions: 1, lastActivity: T0, level: 'A2' } } });
    await call('POST', '/scores', { token, body: { sessions: [session('s1')] } });
    expect((await call('DELETE', '/me', { token, body: { key: newKey() } })).status).toBe(403);
    expect((await call('DELETE', '/me', { token, body: { key } })).status).toBe(204);
    for (const t of ['users', 'auth_sessions', 'progress', 'scores']) {
      expect((env.DB.raw.prepare(`SELECT COUNT(*) AS n FROM ${t}`).get() as { n: number }).n).toBe(0);
    }
    expect((await call('GET', '/me', { token })).status).toBe(401);
  });
});

describe('CORS', () => {
  it('origine autorisée : en-têtes CORS ; autre origine : refus', async () => {
    const pre = await handle(new Request('https://api.test/me', { method: 'OPTIONS', headers: { Origin: ORIGIN } }), env, T0);
    expect(pre.status).toBe(204);
    expect(pre.headers.get('Access-Control-Allow-Origin')).toBe(ORIGIN);
    expect(pre.headers.get('Access-Control-Allow-Headers')).toContain('Authorization');
    const evil = await call('POST', '/auth/register', { body: { pseudo: 'Mallory', key: newKey() }, origin: 'https://evil.test' });
    expect(evil.status).toBe(403);
  });
});

describe('progression', () => {
  const summary = { xp: 50, exercises: 10, sessions: 2, lastActivity: T0, level: 'B1' };

  it('écriture versionnée : une version plus récente n’est jamais écrasée', async () => {
    const { token } = await signup('Alice');
    expect((await call('GET', '/progress', { token })).data.version).toBe(0);
    const v1 = await call('PUT', '/progress', { token, body: { baseVersion: 0, data: 'gz:AAA', summary } });
    expect(v1.data.version).toBe(1);
    const v2 = await call('PUT', '/progress', { token, body: { baseVersion: 1, data: 'gz:BBB', summary } });
    expect(v2.data.version).toBe(2);
    // un autre appareil resté en version 1 : conflit, rien n'est écrasé
    const stale = await call('PUT', '/progress', { token, body: { baseVersion: 1, data: 'gz:OLD', summary: { ...summary, xp: 10 } } });
    expect(stale.status).toBe(409);
    expect(stale.data.version).toBe(2);
    expect(stale.data.summary.xp).toBe(50);
    const stale0 = await call('PUT', '/progress', { token, body: { baseVersion: 0, data: 'gz:OLD', summary } });
    expect(stale0.status).toBe(409);
    const got = await call('GET', '/progress', { token });
    expect(got.data).toMatchObject({ version: 2, data: 'gz:BBB' });
  });

  it('données validées (taille, résumé, niveau)', async () => {
    const { token } = await signup('Alice');
    expect((await call('PUT', '/progress', { token, body: { baseVersion: 0, data: 'x'.repeat(1_950_000), summary } })).status).toBe(413);
    expect((await call('PUT', '/progress', { token, body: { baseVersion: 0, data: 'x', summary: { xp: -1 } } })).status).toBe(400);
    expect((await call('PUT', '/progress', { token, body: { baseVersion: -1, data: 'x', summary } })).status).toBe(400);
    await call('PUT', '/progress', { token, body: { baseVersion: 0, data: 'x', summary: { ...summary, level: '<b>C2</b>' } } });
    expect((env.DB.raw.prepare('SELECT level_label FROM users').get() as { level_label: string }).level_label).toBe('?');
  });
});

describe('XP du classement', () => {
  it('règles de validation d’une séance', () => {
    const created = T0 - 86400000;
    expect(scoreSession(session('a'), T0, created)?.xp).toBe(120);
    // XP déclarés impossibles : plafonnés au maximum atteignable
    expect(scoreSession(session('b', { xp: 99999 }), T0, created)?.xp).toBe(8 * XP_RULES.maxPerCorrect + 2 * XP_RULES.maxPerWrong);
    // trop rapide, incohérente, antérieure au compte, trop ancienne, future
    expect(scoreSession(session('c', { durationMs: 5000 }), T0, created)).toBeNull();
    expect(scoreSession(session('d', { correct: 11 }), T0, created)).toBeNull();
    expect(scoreSession(session('e', { endedAt: created - 1, startedAt: created - 300000 }), T0, created)).toBeNull();
    expect(scoreSession(session('f', { endedAt: T0 - 8 * 86400000, startedAt: T0 - 8 * 86400000 - 200000 }), T0, T0 - 30 * 86400000)).toBeNull();
    expect(scoreSession(session('g', { endedAt: T0 + 3600000 }), T0, created)).toBeNull();
    expect(scoreSession(session('h', { durationMs: 900000 }), T0, created)).toBeNull();
    expect(scoreSession(session('i', { mode: 'placement' }), T0, created)?.xp).toBe(0);
  });

  it('séances dédupliquées, plafond quotidien, total et semaine', async () => {
    const { token } = await signup('Alice', newKey(), T0 - 86400000);
    const r1 = await call('POST', '/scores', { token, body: { sessions: [session('s1'), session('s1'), session('bad', { durationMs: 10 })] } });
    expect(r1.data).toMatchObject({ accepted: 1, weekXp: 120, totalXp: 120 });
    // renvoyer la même séance ne compte pas deux fois
    expect((await call('POST', '/scores', { token, body: { sessions: [session('s1')] } })).data.accepted).toBe(0);
    // plafond quotidien
    const many = Array.from({ length: 20 }, (_, i) => session(`m${i}`, { total: 20, correct: 20, xp: 280, durationMs: 100000 }));
    const r2 = await call('POST', '/scores', { token, body: { sessions: many } });
    expect(r2.data.totalXp).toBe(XP_RULES.dailyCap);
  });

  it('classement hebdomadaire et global, rang personnel, comptes masqués', async () => {
    const a = await signup('Alice', newKey(), T0 - 20 * 86400000);
    const b = await signup('Bruno', newKey(), T0 - 20 * 86400000);
    const c = await signup('Chloe', newKey(), T0 - 20 * 86400000);
    const lastWeek = T0 - 7 * 86400000;
    // Alice : beaucoup d'XP la semaine dernière ; Bruno : cette semaine
    await call('POST', '/scores', { token: a.token, now: lastWeek + 3600000, body: { sessions: [session('a1', { endedAt: lastWeek, startedAt: lastWeek - 300000, xp: 300, total: 20, correct: 20, durationMs: 200000 })] } });
    await call('POST', '/scores', { token: b.token, body: { sessions: [session('b1', { xp: 100 })] } });
    const week = await call('GET', '/leaderboard?period=week', { token: c.token });
    expect(week.data.rows.map((r: { pseudo: string }) => r.pseudo)).toEqual(['Bruno', 'Alice', 'Chloe']);
    expect(week.data.rows[0]).toMatchObject({ rank: 1, weekXp: 100, totalXp: 100 });
    // égalité à 0 XP : même rang
    expect(week.data.rows[1].rank).toBe(2);
    expect(week.data.rows[2].rank).toBe(2);
    expect(week.data.me).toMatchObject({ pseudo: 'Chloe', rank: 2, me: true });
    const all = await call('GET', '/leaderboard?period=all', { token: c.token });
    expect(all.data.rows[0]).toMatchObject({ pseudo: 'Alice', totalXp: 300, weekXp: 0 });
    // aucune donnée privée exposée
    expect(Object.keys(all.data.rows[0]).sort()).toEqual(['level', 'me', 'pseudo', 'rank', 'totalXp', 'weekXp']);
    // compte masqué : absent pour les autres, visible pour lui-même sans rang
    await call('PATCH', '/me', { token: a.token, body: { hidden: true } });
    const after = await call('GET', '/leaderboard?period=all', { token: c.token });
    expect(after.data.rows.map((r: { pseudo: string }) => r.pseudo)).not.toContain('Alice');
    const self = await call('GET', '/leaderboard?period=all', { token: a.token });
    expect(self.data.me).toMatchObject({ pseudo: 'Alice', rank: null, hidden: true });
    expect(weekStart(T0)).toBe(Date.UTC(2026, 10, 9));
  });
});
