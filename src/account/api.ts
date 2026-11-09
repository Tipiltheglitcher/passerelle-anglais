/**
 * Client de l'API des comptes (Cloudflare Worker).
 *
 * L'adresse de l'API est fournie au build par VITE_API_URL. Sans elle, les
 * comptes et le classement sont simplement absents de l'interface :
 * l'application reste entièrement utilisable en mode local.
 */

let base = ((import.meta.env.VITE_API_URL as string | undefined) ?? '').trim().replace(/\/+$/, '');
let fetcher: typeof fetch = (...args) => fetch(...args);

export function apiAvailable(): boolean {
  return !!base;
}

/** Tests : adresse de l'API et transport. */
export function configureApi(url: string, f?: typeof fetch): void {
  base = url.replace(/\/+$/, '');
  if (f) fetcher = f;
}

export class ApiError extends Error {
  constructor(
    public status: number,
    message: string,
    public body: Record<string, unknown> = {},
  ) {
    super(message);
  }
  get offline(): boolean {
    return this.status === 0;
  }
}

export interface PublicUser {
  id: string;
  pseudo: string;
  createdAt: number;
  hidden: boolean;
}

export interface Summary {
  xp: number;
  exercises: number;
  sessions: number;
  lastActivity: number;
  level: string;
}

export interface ProgressMeta {
  version: number;
  updatedAt: number;
  summary: Summary | null;
}

export interface LeaderRow {
  rank: number | null;
  pseudo: string;
  weekXp: number;
  totalXp: number;
  level: string;
  me: boolean;
  hidden?: boolean;
}

export interface Leaderboard {
  period: 'week' | 'all';
  weekStart: number;
  rows: LeaderRow[];
  me: LeaderRow | null;
  players: number;
}

export interface ReportedSession {
  id: string;
  mode: string;
  total: number;
  correct: number;
  xp: number;
  durationMs: number;
  startedAt: number;
  endedAt: number;
}

async function call<T>(method: string, path: string, o: { token?: string | null; body?: unknown } = {}): Promise<T> {
  if (!base) throw new ApiError(0, 'Les comptes ne sont pas configurés sur cette version.');
  const headers: Record<string, string> = {};
  if (o.body !== undefined) headers['Content-Type'] = 'application/json';
  if (o.token) headers.Authorization = `Bearer ${o.token}`;
  let res: Response;
  try {
    res = await fetcher(`${base}${path}`, { method, headers, body: o.body === undefined ? undefined : JSON.stringify(o.body), cache: 'no-store' });
  } catch {
    throw new ApiError(0, 'Serveur injoignable : vérifiez votre connexion.');
  }
  const text = await res.text();
  let data: Record<string, unknown> = {};
  try {
    data = text ? JSON.parse(text) : {};
  } catch {
    /* réponse non JSON */
  }
  if (!res.ok) throw new ApiError(res.status, typeof data.error === 'string' ? data.error : `Erreur du serveur (${res.status}).`, data);
  return data as T;
}

export const api = {
  register: (pseudo: string, key: string) => call<{ token: string; user: PublicUser }>('POST', '/auth/register', { body: { pseudo, key } }),
  login: (pseudo: string, key: string) => call<{ token: string; user: PublicUser }>('POST', '/auth/login', { body: { pseudo, key } }),
  logout: (token: string) => call<void>('POST', '/auth/logout', { token }),
  me: (token: string) => call<{ user: PublicUser; progress: ProgressMeta; scores: { weekXp: number; totalXp: number } }>('GET', '/me', { token }),
  setHidden: (token: string, hidden: boolean) => call<{ user: PublicUser }>('PATCH', '/me', { token, body: { hidden } }),
  deleteAccount: (token: string, key: string) => call<void>('DELETE', '/me', { token, body: { key } }),
  getProgress: (token: string) => call<ProgressMeta & { data: string | null }>('GET', '/progress', { token }),
  putProgress: (token: string, baseVersion: number, data: string, summary: Summary) =>
    call<{ version: number; updatedAt: number }>('PUT', '/progress', { token, body: { baseVersion, data, summary } }),
  reportSessions: (token: string, sessions: ReportedSession[]) => call<{ accepted: number; weekXp: number; totalXp: number }>('POST', '/scores', { token, body: { sessions } }),
  leaderboard: (token: string, period: 'week' | 'all') => call<Leaderboard>('GET', `/leaderboard?period=${period}`, { token }),
};

// ---------------------------------------------------------------------------
// Mot de passe : dérivation côté client

const enc = new TextEncoder();
export const CLIENT_ITERATIONS = 600_000;

function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Clé de connexion dérivée du mot de passe (PBKDF2-SHA256, 600 000
 * itérations, sel lié au pseudo). Le mot de passe lui-même n'est jamais
 * envoyé ; le serveur hache à nouveau cette clé avec un sel aléatoire.
 */
export async function deriveLoginKey(pseudo: string, password: string, iterations = CLIENT_ITERATIONS): Promise<string> {
  const material = await crypto.subtle.importKey('raw', enc.encode(password.normalize('NFC')), 'PBKDF2', false, ['deriveBits']);
  const salt = enc.encode(`passerelle/v1/${pseudo.trim().toLowerCase()}`);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, 256);
  return b64url(new Uint8Array(bits));
}

export const PSEUDO_RE = /^[A-Za-z0-9_.-]{3,20}$/;
export const PASSWORD_MIN = 8;
