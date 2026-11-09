// @vitest-environment node
/**
 * Synchronisation de bout en bout : deux « appareils » (deux stores locaux)
 * et l'API réelle (Worker) sur une base SQLite en mémoire.
 */
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { Store } from '@/state/store';
import { MemoryBackend } from '@/storage/db';
import { handle } from '../../worker/src/index';
import { createTestD1 } from '../../worker/test/sqlite-d1';
import { configureApi } from './api';
import { AccountSync, decodeSnapshot, encodeSnapshot, type KeyValue } from './sync';

let env: { DB: ReturnType<typeof createTestD1>; ALLOWED_ORIGINS: string };

beforeAll(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
  configureApi('https://api.test', (input, init) => handle(new Request(input as string, init), env));
});
afterAll(() => vi.useRealTimers());
beforeEach(() => {
  env = { DB: createTestD1(), ALLOWED_ORIGINS: '' };
});

function memoryKv(): KeyValue {
  const m = new Map<string, string>();
  return { getItem: (k) => m.get(k) ?? null, setItem: (k, v) => void m.set(k, v), removeItem: (k) => void m.delete(k) };
}

async function device() {
  const store = new Store();
  await store.init(new MemoryBackend());
  const sync = new AccountSync(store, memoryKv(), { timers: false });
  sync.start();
  return { store, sync };
}

/** Progression locale fictive : quelques séances récentes et des XP. */
function progressFile(xp: number, sessions: { id: string; endedAt: number; xp: number }[]) {
  const t = Date.now();
  return JSON.stringify({
    app: 'passerelle',
    version: 2,
    exportedAt: new Date(t).toISOString(),
    data: {
      profile: [{ id: 'me', createdAt: t - 86400000, placementDone: false, streak: 1, bestStreak: 1, totalXp: xp, levelsPassed: [], dataVersion: 2 }],
      sessions: sessions.map((s) => ({
        id: s.id,
        mode: 'practice',
        startedAt: s.endedAt - 200000,
        endedAt: s.endedAt,
        total: 10,
        correct: 8,
        xp: s.xp,
        durationMs: 150000,
        skills: ['present_simple'],
        bySkill: { present_simple: { total: 10, correct: 8 } },
        title: 'Entraînement libre',
      })),
      daily: [{ date: '2026-11-09', exercises: sessions.length * 10, correct: sessions.length * 8, xp, ms: 1000, sessions: sessions.length }],
      skills: [],
      items: [],
    },
  });
}

describe('synchronisation entre appareils', () => {
  it('compression de l’instantané réversible', async () => {
    const json = progressFile(10, []);
    const enc = await encodeSnapshot(json);
    expect(enc.startsWith('gz:')).toBe(true);
    expect(await decodeSnapshot(enc)).toBe(json);
  });

  it('première connexion, autre appareil, divergence, classement', async () => {
    // Appareil A : progression d'invité, puis création du compte
    const A = await device();
    await A.store.importData(progressFile(150, [{ id: 'old', endedAt: Date.now() - 3600000, xp: 150 }]));
    await A.sync.register('Alice', 'motdepasse-solide');
    // la progression locale n'est pas envoyée sans accord
    expect(A.sync.getState().conflict?.kind).toBe('first-login');
    expect((await env.DB.prepare('SELECT COUNT(*) AS n FROM progress').first<{ n: number }>())?.n).toBe(0);
    await A.sync.resolve('device');
    expect(A.sync.getState().status).toBe('synced');
    let row = await env.DB.prepare('SELECT version, summary FROM progress').first<{ version: number; summary: string }>();
    expect(row?.version).toBe(1);
    expect(JSON.parse(row!.summary).xp).toBe(150);
    // séance antérieure à la création du compte : pas comptée au classement
    expect((await A.sync.leaderboard('all')).me?.totalXp).toBe(0);

    // Appareil B, vierge : la progression du compte est récupérée
    const B = await device();
    await B.sync.login('alice', 'motdepasse-solide');
    expect(B.sync.getState().status).toBe('synced');
    expect(B.store.getState().profile.totalXp).toBe(150);
    expect(B.store.getState().sessions.map((s) => s.id)).toEqual(['old']);

    // B progresse (nouvelle séance après la création du compte) et synchronise
    await B.store.importData(progressFile(270, [{ id: 'new', endedAt: Date.now() + 1000, xp: 120 }, { id: 'old', endedAt: Date.now() - 3600000, xp: 150 }]));
    expect(B.sync.getState().status).toBe('pending');
    await B.sync.push();
    expect(B.sync.getState().status).toBe('synced');
    const board = await B.sync.leaderboard('week');
    expect(board.me).toMatchObject({ pseudo: 'Alice', weekXp: 120, totalXp: 120, rank: 1 });

    // A, sans modification locale, récupère la version plus récente
    await A.sync.syncNow();
    expect(A.store.getState().profile.totalXp).toBe(270);

    // Divergence : A et B modifient chacun leur copie
    await A.store.importData(progressFile(300, []));
    await B.store.importData(progressFile(500, []));
    await B.sync.push();
    await A.sync.push();
    const c = A.sync.getState().conflict;
    expect(c?.kind).toBe('diverged');
    expect(c?.remote?.xp).toBe(500);
    expect(c?.local.xp).toBe(300);
    // rien n'a été écrasé sur le serveur
    row = await env.DB.prepare('SELECT version, summary FROM progress').first<{ version: number; summary: string }>();
    expect(JSON.parse(row!.summary).xp).toBe(500);
    // A choisit la progression du compte
    await A.sync.resolve('account');
    expect(A.store.getState().profile.totalXp).toBe(500);
    expect(A.sync.getState().status).toBe('synced');
  });

  it('déconnexion : la progression reste sur l’appareil, la reconnexion demande quoi garder', async () => {
    const A = await device();
    await A.sync.register('Bruno', 'motdepasse-solide');
    expect(A.sync.getState().status).toBe('synced');
    await A.store.importData(progressFile(80, []));
    await A.sync.push();
    await A.sync.logout();
    expect(A.sync.getState()).toMatchObject({ status: 'guest', user: null });
    expect(A.store.getState().profile.totalXp).toBe(80);
    await A.sync.login('Bruno', 'motdepasse-solide');
    expect(A.sync.getState().conflict?.kind).toBe('device-data');
    await A.sync.logout({ wipeLocal: true });
    expect(A.store.getState().profile.totalXp).toBe(0);
  });

  it('mauvais mot de passe et suppression du compte', async () => {
    const A = await device();
    await A.sync.register('Chloe', 'motdepasse-solide');
    const B = await device();
    await expect(B.sync.login('Chloe', 'mauvais-mot-de-passe')).rejects.toThrow('Pseudo ou mot de passe incorrect.');
    await expect(A.sync.deleteAccount('mauvais-mot-de-passe')).rejects.toThrow('Mot de passe incorrect.');
    await A.sync.deleteAccount('motdepasse-solide');
    expect(A.sync.getState().user).toBeNull();
    expect((await env.DB.prepare('SELECT COUNT(*) AS n FROM users').first<{ n: number }>())?.n).toBe(0);
  });
});
