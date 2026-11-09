/**
 * API Passerelle (Cloudflare Workers + D1) : comptes, synchronisation de la
 * progression et classement entre amis.
 *
 * Routes (JSON) :
 *   POST   /auth/register   { pseudo, key }              → { token, user }
 *   POST   /auth/login      { pseudo, key }              → { token, user }
 *   POST   /auth/logout                                  → 204
 *   GET    /me                                           → { user, progress, scores }
 *   PATCH  /me              { hidden }                   → { user }
 *   DELETE /me              { key }                      → 204 (suppression définitive)
 *   GET    /progress                                     → { version, updatedAt, data, summary }
 *   PUT    /progress        { baseVersion, data, summary } → { version, updatedAt } | 409
 *   POST   /scores          { sessions: [...] }          → { accepted, weekXp, totalXp }
 *   GET    /leaderboard?period=week|all                  → { period, rows, me }
 *
 * « key » est la clé dérivée du mot de passe par le navigateur (voir crypto.ts).
 */
import { b64url, fromB64url, hashKey, randomBytes, SERVER_ITERATIONS, sha256Hex, timingSafeEqual } from './crypto';
import {
  KEY_RE,
  LIMITS,
  MAX_BODY_LENGTH,
  MAX_DATA_LENGTH,
  PSEUDO_RE,
  pseudoKey,
  scoreSession,
  SESSION_TTL_MS,
  TOKEN_RE,
  validateSummary,
  weekStart,
  XP_RULES,
  type ScoredSession,
} from './rules';
import type { Env, UserRow } from './types';

class HttpError extends Error {
  constructor(
    public status: number,
    message: string,
    public extra?: Record<string, unknown>,
    public headers?: Record<string, string>,
  ) {
    super(message);
  }
}

// ---------------------------------------------------------------------------
// Réponses et CORS

function allowedOrigin(req: Request, env: Env): string | null {
  const origin = req.headers.get('Origin');
  if (!origin) return null;
  const list = (env.ALLOWED_ORIGINS || '').split(',').map((s) => s.trim()).filter(Boolean);
  return list.includes(origin) ? origin : null;
}

function corsHeaders(origin: string | null): Record<string, string> {
  if (!origin) return {};
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'GET, POST, PUT, PATCH, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Authorization, Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(data === null ? null : JSON.stringify(data), {
    status,
    headers: {
      ...(data === null ? {} : { 'Content-Type': 'application/json; charset=utf-8' }),
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      ...headers,
    },
  });
}

async function readBody(req: Request): Promise<Record<string, unknown>> {
  const len = Number(req.headers.get('Content-Length') ?? 0);
  if (len > MAX_BODY_LENGTH) throw new HttpError(413, 'Données trop volumineuses.');
  const text = await req.text();
  if (text.length > MAX_BODY_LENGTH) throw new HttpError(413, 'Données trop volumineuses.');
  if (!text) return {};
  try {
    const v = JSON.parse(text);
    if (!v || typeof v !== 'object' || Array.isArray(v)) throw new Error();
    return v as Record<string, unknown>;
  } catch {
    throw new HttpError(400, 'Requête invalide.');
  }
}

// ---------------------------------------------------------------------------
// Limitation des tentatives

async function countAttempts(env: Env, bucket: string, windowMs: number, now: number): Promise<number> {
  const r = await env.DB.prepare('SELECT COUNT(*) AS n FROM attempts WHERE bucket = ? AND at > ?').bind(bucket, now - windowMs).first<{ n: number }>();
  return r?.n ?? 0;
}

async function recordAttempt(env: Env, buckets: string[], now: number): Promise<void> {
  await env.DB.batch([
    ...buckets.map((b) => env.DB.prepare('INSERT INTO attempts (bucket, at) VALUES (?, ?)').bind(b, now)),
    env.DB.prepare('DELETE FROM attempts WHERE at < ?').bind(now - 86400000),
  ]);
}

async function ipBucket(req: Request, prefix: string): Promise<string> {
  const ip = req.headers.get('CF-Connecting-IP') ?? 'local';
  return `${prefix}:${(await sha256Hex(`passerelle:${ip}`)).slice(0, 24)}`;
}

function tooMany(minutes: number): HttpError {
  return new HttpError(429, `Trop de tentatives. Réessayez dans ${minutes} minutes.`, undefined, { 'Retry-After': String(minutes * 60) });
}

// ---------------------------------------------------------------------------
// Comptes et sessions

function publicUser(u: UserRow) {
  return { id: u.id, pseudo: u.pseudo, createdAt: u.created_at, hidden: !!u.hidden };
}

async function createSession(env: Env, userId: string, now: number): Promise<string> {
  const token = b64url(randomBytes(32));
  await env.DB.prepare('INSERT INTO auth_sessions (token_hash, user_id, created_at, last_used_at, expires_at) VALUES (?, ?, ?, ?, ?)')
    .bind(await sha256Hex(token), userId, now, now, now + SESSION_TTL_MS)
    .run();
  return token;
}

async function verifyKey(u: UserRow, key: string): Promise<boolean> {
  const h = await hashKey(key, fromB64url(u.pw_salt), u.pw_iter);
  return timingSafeEqual(h, u.pw_hash);
}

function readCredentials(body: Record<string, unknown>): { pseudo: string; key: string } {
  const pseudo = typeof body.pseudo === 'string' ? body.pseudo.trim() : '';
  const key = typeof body.key === 'string' ? body.key : '';
  if (!PSEUDO_RE.test(pseudo)) throw new HttpError(400, 'Pseudo invalide : 3 à 20 caractères (lettres, chiffres, . _ -).');
  if (!KEY_RE.test(key)) throw new HttpError(400, 'Mot de passe invalide.');
  return { pseudo, key };
}

async function register(req: Request, env: Env, now: number): Promise<Response> {
  const bucket = await ipBucket(req, 'reg');
  if ((await countAttempts(env, bucket, LIMITS.registerWindowMs, now)) >= LIMITS.registerPerIp) throw tooMany(60);
  const { pseudo, key } = readCredentials(await readBody(req));
  await recordAttempt(env, [bucket], now);
  const exists = await env.DB.prepare('SELECT 1 AS x FROM users WHERE pseudo_key = ?').bind(pseudoKey(pseudo)).first();
  if (exists) throw new HttpError(409, 'Ce pseudo est déjà pris.');
  const salt = randomBytes(16);
  const user: UserRow = {
    id: crypto.randomUUID(),
    pseudo,
    pseudo_key: pseudoKey(pseudo),
    pw_hash: await hashKey(key, salt, SERVER_ITERATIONS),
    pw_salt: b64url(salt),
    pw_iter: SERVER_ITERATIONS,
    created_at: now,
    level_label: null,
    hidden: 0,
  };
  try {
    await env.DB.prepare('INSERT INTO users (id, pseudo, pseudo_key, pw_hash, pw_salt, pw_iter, created_at, hidden) VALUES (?, ?, ?, ?, ?, ?, ?, 0)')
      .bind(user.id, user.pseudo, user.pseudo_key, user.pw_hash, user.pw_salt, user.pw_iter, user.created_at)
      .run();
  } catch {
    throw new HttpError(409, 'Ce pseudo est déjà pris.');
  }
  const token = await createSession(env, user.id, now);
  return json({ token, user: publicUser(user) }, 201);
}

async function login(req: Request, env: Env, now: number): Promise<Response> {
  const { pseudo, key } = readCredentials(await readBody(req));
  const pBucket = `login:${pseudoKey(pseudo)}`;
  const iBucket = await ipBucket(req, 'login-ip');
  if ((await countAttempts(env, pBucket, LIMITS.loginWindowMs, now)) >= LIMITS.loginPerPseudo) throw tooMany(15);
  if ((await countAttempts(env, iBucket, LIMITS.loginWindowMs, now)) >= LIMITS.loginPerIp) throw tooMany(15);
  const user = await env.DB.prepare('SELECT * FROM users WHERE pseudo_key = ?').bind(pseudoKey(pseudo)).first<UserRow>();
  const ok = user ? await verifyKey(user, key) : (await hashKey(key, randomBytes(16), SERVER_ITERATIONS), false);
  if (!user || !ok) {
    await recordAttempt(env, [pBucket, iBucket], now);
    throw new HttpError(401, 'Pseudo ou mot de passe incorrect.');
  }
  await env.DB.prepare('DELETE FROM attempts WHERE bucket = ?').bind(pBucket).run();
  const token = await createSession(env, user.id, now);
  return json({ token, user: publicUser(user) });
}

interface Authed {
  user: UserRow;
  tokenHash: string;
}

async function authenticate(req: Request, env: Env, now: number): Promise<Authed> {
  const m = /^Bearer (.+)$/.exec(req.headers.get('Authorization') ?? '');
  if (!m || !TOKEN_RE.test(m[1])) throw new HttpError(401, 'Connexion requise.');
  const tokenHash = await sha256Hex(m[1]);
  const row = await env.DB.prepare(
    'SELECT s.expires_at AS s_expires, s.last_used_at AS s_used, u.* FROM auth_sessions s JOIN users u ON u.id = s.user_id WHERE s.token_hash = ?',
  )
    .bind(tokenHash)
    .first<UserRow & { s_expires: number; s_used: number }>();
  if (!row || row.s_expires < now) {
    if (row) await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(tokenHash).run();
    throw new HttpError(401, 'Session expirée : reconnectez-vous.');
  }
  // session glissante : prolongée au plus une fois par jour
  if (now - row.s_used > 86400000) {
    await env.DB.prepare('UPDATE auth_sessions SET last_used_at = ?, expires_at = ? WHERE token_hash = ?').bind(now, now + SESSION_TTL_MS, tokenHash).run();
  }
  const { s_expires: _e, s_used: _u, ...user } = row;
  return { user, tokenHash };
}

// ---------------------------------------------------------------------------
// Progression

async function progressMeta(env: Env, userId: string) {
  const p = await env.DB.prepare('SELECT version, updated_at, summary FROM progress WHERE user_id = ?').bind(userId).first<{ version: number; updated_at: number; summary: string }>();
  return p ? { version: p.version, updatedAt: p.updated_at, summary: JSON.parse(p.summary) } : { version: 0, updatedAt: 0, summary: null };
}

async function putProgress(req: Request, env: Env, a: Authed, now: number): Promise<Response> {
  const body = await readBody(req);
  const base = body.baseVersion;
  if (typeof base !== 'number' || !Number.isInteger(base) || base < 0) throw new HttpError(400, 'Version invalide.');
  if (typeof body.data !== 'string' || !body.data || body.data.length > MAX_DATA_LENGTH) throw new HttpError(413, 'Progression trop volumineuse pour être synchronisée.');
  const summary = validateSummary(body.summary);
  if (!summary) throw new HttpError(400, 'Résumé de progression invalide.');
  const sJson = JSON.stringify(summary);
  // écriture conditionnelle : elle échoue si une version plus récente existe déjà
  const res =
    base === 0
      ? await env.DB.prepare('INSERT INTO progress (user_id, version, updated_at, data, summary) VALUES (?, 1, ?, ?, ?) ON CONFLICT(user_id) DO NOTHING')
          .bind(a.user.id, now, body.data, sJson)
          .run()
      : await env.DB.prepare('UPDATE progress SET version = version + 1, updated_at = ?, data = ?, summary = ? WHERE user_id = ? AND version = ?')
          .bind(now, body.data, sJson, a.user.id, base)
          .run();
  if (!res.meta.changes) {
    const meta = await progressMeta(env, a.user.id);
    throw new HttpError(409, 'Une version plus récente de votre progression existe.', { conflict: true, ...meta });
  }
  await env.DB.prepare('UPDATE users SET level_label = ? WHERE id = ?').bind(summary.level, a.user.id).run();
  return json({ version: base + 1, updatedAt: now });
}

// ---------------------------------------------------------------------------
// Classement

async function xpTotals(env: Env, userId: string, now: number) {
  const r = await env.DB.prepare('SELECT COALESCE(SUM(xp), 0) AS total, COALESCE(SUM(CASE WHEN ended_at >= ? THEN xp ELSE 0 END), 0) AS week FROM scores WHERE user_id = ?')
    .bind(weekStart(now), userId)
    .first<{ total: number; week: number }>();
  return { weekXp: r?.week ?? 0, totalXp: r?.total ?? 0 };
}

async function postScores(req: Request, env: Env, a: Authed, now: number): Promise<Response> {
  const body = await readBody(req);
  if (!Array.isArray(body.sessions) || body.sessions.length > XP_RULES.maxSessionsPerRequest) throw new HttpError(400, 'Liste de séances invalide.');
  const valid = body.sessions.map((s) => scoreSession(s, now, a.user.created_at)).filter((s): s is ScoredSession => !!s);
  let accepted = 0;
  const dayTotals = new Map<string, number>();
  for (const s of valid) {
    if (!dayTotals.has(s.day)) {
      const r = await env.DB.prepare('SELECT COALESCE(SUM(xp), 0) AS xp FROM scores WHERE user_id = ? AND day = ?').bind(a.user.id, s.day).first<{ xp: number }>();
      dayTotals.set(s.day, r?.xp ?? 0);
    }
    const already = dayTotals.get(s.day)!;
    const xp = Math.max(0, Math.min(s.xp, XP_RULES.dailyCap - already));
    const res = await env.DB.prepare(
      'INSERT OR IGNORE INTO scores (user_id, session_id, ended_at, day, exercises, correct, xp, received_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
    )
      .bind(a.user.id, s.id, s.endedAt, s.day, s.exercises, s.correct, xp, now)
      .run();
    if (res.meta.changes) {
      accepted += 1;
      dayTotals.set(s.day, already + xp);
    }
  }
  return json({ accepted, ...(await xpTotals(env, a.user.id, now)) });
}

interface BoardRow {
  id: string;
  pseudo: string;
  level_label: string | null;
  hidden: number;
  total: number;
  week: number;
}

async function leaderboard(url: URL, env: Env, a: Authed, now: number): Promise<Response> {
  const period = url.searchParams.get('period') === 'all' ? 'all' : 'week';
  const { results } = await env.DB.prepare(
    `SELECT u.id, u.pseudo, u.level_label, u.hidden,
            COALESCE(SUM(s.xp), 0) AS total,
            COALESCE(SUM(CASE WHEN s.ended_at >= ? THEN s.xp ELSE 0 END), 0) AS week
       FROM users u LEFT JOIN scores s ON s.user_id = u.id
      GROUP BY u.id`,
  )
    .bind(weekStart(now))
    .all<BoardRow>();
  const key = period === 'week' ? 'week' : 'total';
  const toRow = (r: BoardRow, rank: number | null) => ({ rank, pseudo: r.pseudo, weekXp: r.week, totalXp: r.total, level: r.level_label ?? '?', me: r.id === a.user.id });
  // les comptes masqués n'apparaissent pas ; rang partagé en cas d'égalité
  const sorted = results.filter((r) => !r.hidden).sort((x, y) => y[key] - x[key] || x.pseudo.localeCompare(y.pseudo));
  let rank = 0;
  const ranked = sorted.map((r, i) => {
    if (i === 0 || r[key] !== sorted[i - 1][key]) rank = i + 1;
    return toRow(r, rank);
  });
  const self = results.find((r) => r.id === a.user.id);
  const me = ranked.find((r) => r.me) ?? (self ? { ...toRow(self, null), hidden: true } : null);
  return json({ period, weekStart: weekStart(now), rows: ranked.slice(0, 100), me, players: ranked.length });
}

// ---------------------------------------------------------------------------
// Routeur

async function route(req: Request, env: Env, url: URL, now: number): Promise<Response> {
  const p = url.pathname.replace(/\/+$/, '') || '/';
  const m = req.method;
  if (p === '/' && m === 'GET') return json({ app: 'passerelle-api', ok: true });
  if (p === '/auth/register' && m === 'POST') return register(req, env, now);
  if (p === '/auth/login' && m === 'POST') return login(req, env, now);

  const known = ['/auth/logout', '/me', '/progress', '/scores', '/leaderboard'];
  if (!known.includes(p)) throw new HttpError(404, 'Ressource introuvable.');
  const a = await authenticate(req, env, now);

  if (p === '/auth/logout' && m === 'POST') {
    await env.DB.prepare('DELETE FROM auth_sessions WHERE token_hash = ?').bind(a.tokenHash).run();
    return json(null, 204);
  }
  if (p === '/me' && m === 'GET') {
    return json({ user: publicUser(a.user), progress: await progressMeta(env, a.user.id), scores: await xpTotals(env, a.user.id, now) });
  }
  if (p === '/me' && m === 'PATCH') {
    const body = await readBody(req);
    if (typeof body.hidden !== 'boolean') throw new HttpError(400, 'Requête invalide.');
    await env.DB.prepare('UPDATE users SET hidden = ? WHERE id = ?').bind(body.hidden ? 1 : 0, a.user.id).run();
    return json({ user: publicUser({ ...a.user, hidden: body.hidden ? 1 : 0 }) });
  }
  if (p === '/me' && m === 'DELETE') {
    const body = await readBody(req);
    const bucket = `delete:${a.user.id}`;
    if ((await countAttempts(env, bucket, LIMITS.loginWindowMs, now)) >= LIMITS.loginPerPseudo) throw tooMany(15);
    if (typeof body.key !== 'string' || !KEY_RE.test(body.key) || !(await verifyKey(a.user, body.key))) {
      await recordAttempt(env, [bucket], now);
      throw new HttpError(403, 'Mot de passe incorrect.');
    }
    await env.DB.batch([
      env.DB.prepare('DELETE FROM scores WHERE user_id = ?').bind(a.user.id),
      env.DB.prepare('DELETE FROM progress WHERE user_id = ?').bind(a.user.id),
      env.DB.prepare('DELETE FROM auth_sessions WHERE user_id = ?').bind(a.user.id),
      env.DB.prepare('DELETE FROM attempts WHERE bucket IN (?, ?)').bind(bucket, `login:${a.user.pseudo_key}`),
      env.DB.prepare('DELETE FROM users WHERE id = ?').bind(a.user.id),
    ]);
    return json(null, 204);
  }
  if (p === '/progress' && m === 'GET') {
    const r = await env.DB.prepare('SELECT version, updated_at, data, summary FROM progress WHERE user_id = ?')
      .bind(a.user.id)
      .first<{ version: number; updated_at: number; data: string; summary: string }>();
    if (!r) return json({ version: 0, updatedAt: 0, data: null, summary: null });
    return json({ version: r.version, updatedAt: r.updated_at, data: r.data, summary: JSON.parse(r.summary) });
  }
  if (p === '/progress' && m === 'PUT') return putProgress(req, env, a, now);
  if (p === '/scores' && m === 'POST') return postScores(req, env, a, now);
  if (p === '/leaderboard' && m === 'GET') return leaderboard(url, env, a, now);
  throw new HttpError(405, 'Méthode non autorisée.');
}

export async function handle(req: Request, env: Env, now = Date.now()): Promise<Response> {
  const origin = allowedOrigin(req, env);
  const cors = corsHeaders(origin);
  // un site non autorisé ne peut pas utiliser l'API depuis un navigateur
  if (req.headers.get('Origin') && !origin) return json({ error: 'Origine non autorisée.' }, 403);
  if (req.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
  try {
    const res = await route(req, env, new URL(req.url), now);
    for (const [k, v] of Object.entries(cors)) res.headers.set(k, v);
    return res;
  } catch (e) {
    if (e instanceof HttpError) return json({ error: e.message, ...(e.extra ?? {}) }, e.status, { ...cors, ...(e.headers ?? {}) });
    console.error(e);
    return json({ error: 'Erreur interne du serveur.' }, 500, cors);
  }
}

export default {
  fetch(req: Request, env: Env): Promise<Response> {
    return handle(req, env);
  },
};
