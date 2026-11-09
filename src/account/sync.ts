/**
 * Compte et synchronisation de la progression.
 *
 * Principes :
 *  - IndexedDB reste la source locale (mode invité inchangé) ;
 *  - connecté, l'appareil envoie un instantané compressé de sa progression
 *    après chaque séance, puis au plus toutes les 5 minutes s'il reste des
 *    changements, et quand l'onglet passe en arrière-plan ;
 *  - chaque instantané porte un numéro de version : le serveur refuse
 *    d'écraser une version plus récente. En cas de divergence, ou lors de la
 *    première connexion avec une progression locale, l'utilisateur choisit :
 *    rien n'est jamais remplacé silencieusement par une version plus ancienne ;
 *  - les séances terminées sont déclarées au serveur, qui recalcule et
 *    plafonne les XP du classement.
 */
import { useRef, useSyncExternalStore } from 'react';
import type { AppState } from '@/state/store';
import { estimateProfile } from '@/engine/learning/progression';
import { api, apiAvailable, ApiError, deriveLoginKey, type Leaderboard, type ProgressMeta, type PublicUser, type ReportedSession, type Summary } from './api';

export type SyncStatus = 'disabled' | 'guest' | 'checking' | 'synced' | 'pending' | 'syncing' | 'offline' | 'error' | 'conflict';

export interface ConflictInfo {
  /** first-login : compte vide, progression locale existante ; device-data : les deux existent ; diverged : modifiées des deux côtés. */
  kind: 'first-login' | 'device-data' | 'diverged';
  local: Summary;
  remote: Summary | null;
  remoteVersion: number;
}

export interface AccountState {
  status: SyncStatus;
  user: PublicUser | null;
  lastSyncAt: number | null;
  message: string | null;
  conflict: ConflictInfo | null;
  /** L'utilisateur a choisi de décider plus tard (fenêtre de choix masquée). */
  deferred: boolean;
  scores: { weekXp: number; totalXp: number } | null;
}

interface Persisted {
  token: string | null;
  user: PublicUser | null;
  /** Compte auquel la progression locale est rattachée. */
  linkedUserId: string | null;
  syncedVersion: number;
  dirty: boolean;
  /** Fin de la dernière séance déclarée au classement. */
  reportedUpTo: number;
  lastSyncAt: number | null;
}

export interface SyncStore {
  getState(): AppState;
  subscribe(l: () => void): () => void;
  exportSnapshot(attemptsLimit?: number): Promise<string>;
  importData(text: string): Promise<void>;
  reset(): Promise<void>;
}

export interface KeyValue {
  getItem(k: string): string | null;
  setItem(k: string, v: string): void;
  removeItem(k: string): void;
}

const STORAGE_KEY = 'passerelle.account.v1';
const PUSH_INTERVAL_MS = 5 * 60000;
const RETRY_MS = 60000;
const MAX_DATA = 1_850_000;
const PERSIST_KEYS = ['settings', 'profile', 'skills', 'items', 'sessions', 'daily', 'mistakes', 'writings'] as const;

const EMPTY: Persisted = { token: null, user: null, linkedUserId: null, syncedVersion: 0, dirty: false, reportedUpTo: 0, lastSyncAt: null };

// ---------------------------------------------------------------------------
// Encodage de l'instantané (gzip + base64)

function toBase64(bytes: Uint8Array): string {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
}

function fromBase64(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s);
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export async function encodeSnapshot(json: string): Promise<string> {
  if (typeof CompressionStream === 'undefined') return json;
  const stream = new Blob([json]).stream().pipeThrough(new CompressionStream('gzip'));
  return `gz:${toBase64(new Uint8Array(await new Response(stream).arrayBuffer()))}`;
}

export async function decodeSnapshot(data: string): Promise<string> {
  if (!data.startsWith('gz:')) return data;
  const stream = new Blob([fromBase64(data.slice(3))]).stream().pipeThrough(new DecompressionStream('gzip'));
  return new Response(stream).text();
}

// ---------------------------------------------------------------------------
// Résumés

export function summarizeState(s: AppState, now = Date.now()): Summary {
  const est = estimateProfile(s.skills, s.profile, now);
  return {
    xp: Math.max(0, Math.round(s.profile.totalXp || 0)),
    exercises: Object.values(s.daily).reduce((n, d) => n + (d.exercises || 0), 0),
    sessions: s.sessions.length,
    lastActivity: s.sessions.reduce((m, x) => Math.max(m, x.endedAt || 0), 0),
    level: est.undetermined ? '?' : est.label,
  };
}

export function hasProgress(s: AppState): boolean {
  return s.profile.totalXp > 0 || s.sessions.length > 0 || s.profile.placementDone || Object.keys(s.items).length > 0;
}

// ---------------------------------------------------------------------------

export class AccountSync {
  private p: Persisted;
  private state: AccountState;
  private listeners = new Set<() => void>();
  private started = false;
  private applying = false;
  private inflight: Promise<void> | null = null;
  private again = false;
  private refs: unknown[] = [];
  private changes = 0;
  private lastAttempt = 0;
  private pushTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    private store: SyncStore,
    private kv: KeyValue | null,
    private o: { now?: () => number; timers?: boolean } = {},
  ) {
    this.p = this.load();
    this.state = { status: apiAvailable() ? 'guest' : 'disabled', user: this.p.user, lastSyncAt: this.p.lastSyncAt, message: null, conflict: null, deferred: false, scores: null };
  }

  private now(): number {
    return this.o.now ? this.o.now() : Date.now();
  }

  // --- état observable ---------------------------------------------------

  getState = (): AccountState => this.state;

  subscribe = (l: () => void): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private set(patch: Partial<AccountState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  private load(): Persisted {
    try {
      const raw = this.kv?.getItem(STORAGE_KEY);
      return raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY };
    } catch {
      return { ...EMPTY };
    }
  }

  private save(patch: Partial<Persisted>) {
    this.p = { ...this.p, ...patch };
    try {
      this.kv?.setItem(STORAGE_KEY, JSON.stringify(this.p));
    } catch {
      /* stockage indisponible : la session ne survivra pas au rechargement */
    }
  }

  private get linked(): boolean {
    return !!this.p.token && !!this.p.user && this.p.linkedUserId === this.p.user.id;
  }

  // --- démarrage -----------------------------------------------------------

  /** À appeler une fois la progression locale chargée. */
  start(): void {
    if (this.started || !apiAvailable()) return;
    this.started = true;
    this.captureRefs();
    this.store.subscribe(this.onStoreChange);
    if (this.o.timers !== false && typeof window !== 'undefined') {
      setInterval(() => this.tick(), 60000);
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'hidden' && this.p.dirty && this.linked) void this.push();
      });
      window.addEventListener('online', () => this.tick(true));
    }
    if (this.p.token) void this.check();
    else this.set({ status: 'guest' });
  }

  private captureRefs() {
    const st = this.store.getState();
    this.refs = PERSIST_KEYS.map((k) => st[k]);
  }

  private onStoreChange = () => {
    if (this.applying) return;
    const st = this.store.getState();
    if (st.status !== 'ready') return;
    const next = PERSIST_KEYS.map((k) => st[k]);
    if (next.every((r, i) => r === this.refs[i])) return;
    const sessionsChanged = next[4] !== this.refs[4] && st.sessions[0]?.id !== (this.refs[4] as AppState['sessions'] | undefined)?.[0]?.id;
    this.refs = next;
    this.changes += 1;
    if (!this.linked) return;
    if (!this.p.dirty) this.save({ dirty: true });
    if (this.state.status === 'synced') this.set({ status: 'pending' });
    // fin de séance : synchronisation rapide
    if (sessionsChanged) this.schedulePush(1500);
  };

  private schedulePush(ms: number) {
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.pushTimer = setTimeout(() => {
      this.pushTimer = null;
      void this.push();
    }, ms);
  }

  /** Vérification périodique : changements en attente, nouvelle tentative après une erreur. */
  tick(force = false) {
    if (!this.linked || this.state.conflict || this.inflight) return;
    const since = this.now() - this.lastAttempt;
    const failing = this.state.status === 'offline' || this.state.status === 'error';
    if (this.p.dirty && (force || since >= (failing ? RETRY_MS : PUSH_INTERVAL_MS))) void this.push();
  }

  // --- connexion -------------------------------------------------------------

  async register(pseudo: string, password: string): Promise<void> {
    const key = await deriveLoginKey(pseudo, password);
    const r = await api.register(pseudo.trim(), key);
    await this.signedIn(r.token, r.user);
  }

  async login(pseudo: string, password: string): Promise<void> {
    const key = await deriveLoginKey(pseudo, password);
    const r = await api.login(pseudo.trim(), key);
    await this.signedIn(r.token, r.user);
  }

  private async signedIn(token: string, user: PublicUser) {
    // une autre personne sur cet appareil : la progression locale n'est plus rattachée
    const sameUser = this.p.linkedUserId === user.id;
    this.save({ token, user, ...(sameUser ? {} : { linkedUserId: null, syncedVersion: 0, dirty: false }) });
    this.set({ user, message: null, conflict: null });
    await this.check();
  }

  /** Vérifie la session et rapproche la progression locale de celle du compte. */
  async check(): Promise<void> {
    if (!this.p.token) return;
    this.set({ status: 'checking' });
    try {
      const me = await api.me(this.p.token);
      this.save({ user: me.user });
      this.set({ user: me.user, scores: me.scores });
      await this.reconcile(me.progress);
    } catch (e) {
      this.fail(e);
    }
  }

  private async reconcile(meta: ProgressMeta) {
    const st = this.store.getState();
    const local = summarizeState(st, this.now());
    if (this.linked) {
      if (meta.version === this.p.syncedVersion) {
        if (this.p.dirty) await this.push();
        else this.set({ status: 'synced', message: null });
      } else if (meta.version > this.p.syncedVersion && !this.p.dirty) {
        await this.applyRemote();
      } else {
        this.set({ status: 'conflict', deferred: false, conflict: { kind: 'diverged', local, remote: meta.summary, remoteVersion: meta.version } });
      }
      return;
    }
    const has = hasProgress(st);
    if (meta.version === 0) {
      if (has) this.set({ status: 'conflict', deferred: false, conflict: { kind: 'first-login', local, remote: null, remoteVersion: 0 } });
      else {
        this.link(0, true);
        await this.push();
      }
    } else if (has) {
      this.set({ status: 'conflict', deferred: false, conflict: { kind: 'device-data', local, remote: meta.summary, remoteVersion: meta.version } });
    } else {
      await this.applyRemote();
    }
  }

  private link(version: number, dirty: boolean, reportedUpTo = this.now()) {
    this.save({ linkedUserId: this.p.user!.id, syncedVersion: version, dirty, reportedUpTo });
  }

  /**
   * Choix de l'utilisateur :
   *  - account : récupérer la progression du compte sur cet appareil ;
   *  - device : envoyer celle de cet appareil vers le compte ;
   *  - fresh : partir de zéro (première connexion) ;
   *  - later : décider plus tard (synchronisation suspendue).
   */
  async resolve(choice: 'account' | 'device' | 'fresh' | 'later'): Promise<void> {
    const c = this.state.conflict;
    if (!c || !this.p.user) return;
    if (choice === 'later') {
      this.set({ status: 'conflict', deferred: true });
      return;
    }
    this.set({ conflict: null, deferred: false, status: 'syncing' });
    try {
      if (choice === 'account') {
        await this.applyRemote();
        return;
      }
      if (choice === 'fresh') {
        this.applying = true;
        try {
          await this.store.reset();
        } finally {
          this.applying = false;
        }
        this.captureRefs();
      }
      this.link(c.remoteVersion, true, c.kind === 'diverged' ? this.p.reportedUpTo : this.now());
      await this.push();
    } catch (e) {
      this.set({ conflict: c });
      this.fail(e);
    }
  }

  private async applyRemote() {
    const token = this.p.token!;
    const r = await api.getProgress(token);
    if (r.data) {
      let text: string;
      try {
        text = await decodeSnapshot(r.data);
      } catch {
        throw new ApiError(500, 'La progression du compte est illisible.');
      }
      this.applying = true;
      try {
        await this.store.importData(text);
      } finally {
        this.applying = false;
      }
    }
    this.captureRefs();
    const latest = this.store.getState().sessions.reduce((m, s) => Math.max(m, s.endedAt || 0), 0);
    this.link(r.version, false, Math.max(this.p.reportedUpTo, latest));
    this.save({ lastSyncAt: this.now() });
    this.set({ status: 'synced', lastSyncAt: this.p.lastSyncAt, message: null, conflict: null });
  }

  // --- envoi -----------------------------------------------------------------

  /** Envoie la progression locale (si elle est rattachée au compte). */
  async push(): Promise<void> {
    if (!this.linked || this.state.conflict) return;
    if (this.inflight) {
      this.again = true;
      return this.inflight;
    }
    this.inflight = this.doPush().finally(() => {
      this.inflight = null;
    });
    await this.inflight;
    if (this.again) {
      this.again = false;
      if (this.p.dirty) await this.push();
    }
  }

  private async doPush() {
    const token = this.p.token!;
    this.lastAttempt = this.now();
    const mark = this.changes;
    this.set({ status: 'syncing' });
    try {
      let data = await encodeSnapshot(await this.store.exportSnapshot());
      if (data.length > MAX_DATA) data = await encodeSnapshot(await this.store.exportSnapshot(200));
      if (data.length > MAX_DATA) throw new ApiError(413, 'Progression trop volumineuse pour être synchronisée.');
      const r = await api.putProgress(token, this.p.syncedVersion, data, summarizeState(this.store.getState(), this.now()));
      this.save({ syncedVersion: r.version, dirty: this.changes !== mark, lastSyncAt: this.now() });
      await this.reportSessions();
      this.set({ status: this.p.dirty ? 'pending' : 'synced', lastSyncAt: this.p.lastSyncAt, message: null });
    } catch (e) {
      if (e instanceof ApiError && e.status === 409) {
        const b = e.body as { version?: number; summary?: Summary | null };
        this.set({
          status: 'conflict',
          deferred: false,
          conflict: { kind: 'diverged', local: summarizeState(this.store.getState(), this.now()), remote: b.summary ?? null, remoteVersion: b.version ?? this.p.syncedVersion },
        });
      } else this.fail(e);
    }
  }

  /** Déclare au serveur les séances terminées depuis la dernière déclaration. */
  private async reportSessions() {
    const user = this.p.user;
    if (!user || !this.p.token) return;
    const list: ReportedSession[] = this.store
      .getState()
      .sessions.filter((s) => s.endedAt > this.p.reportedUpTo && s.endedAt >= user.createdAt && s.total > 0)
      .sort((a, b) => a.endedAt - b.endedAt)
      .slice(-50)
      .map((s) => ({ id: s.id, mode: s.mode, total: s.total, correct: s.correct, xp: s.xp, durationMs: s.durationMs, startedAt: s.startedAt, endedAt: s.endedAt }));
    if (!list.length) return;
    try {
      const r = await api.reportSessions(this.p.token, list);
      this.save({ reportedUpTo: list[list.length - 1].endedAt });
      this.set({ scores: { weekXp: r.weekXp, totalXp: r.totalXp } });
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) throw e;
      /* nouvelle tentative au prochain envoi */
    }
  }

  private fail(e: unknown) {
    if (e instanceof ApiError && e.status === 401) {
      this.save({ ...EMPTY });
      this.set({ status: 'guest', user: null, conflict: null, scores: null, message: 'Votre session a expiré : reconnectez-vous pour reprendre la synchronisation.' });
      return;
    }
    const offline = e instanceof ApiError && e.offline;
    this.set({ status: offline ? 'offline' : 'error', message: e instanceof Error ? e.message : String(e) });
  }

  /** Rouvre la fenêtre de choix après « plus tard ». */
  reopenConflict() {
    if (this.state.conflict) this.set({ deferred: false });
  }

  /** Synchronisation manuelle. */
  async syncNow(): Promise<void> {
    if (!this.p.token || this.state.conflict) return;
    await this.check();
  }

  // --- compte ------------------------------------------------------------------

  async logout(o: { wipeLocal?: boolean } = {}): Promise<void> {
    const token = this.p.token;
    if (token && this.linked && this.p.dirty) await this.push().catch(() => undefined);
    if (token) await api.logout(token).catch(() => undefined);
    await this.signOutLocally(o.wipeLocal);
  }

  async deleteAccount(password: string, o: { wipeLocal?: boolean } = {}): Promise<void> {
    if (!this.p.token || !this.p.user) return;
    const key = await deriveLoginKey(this.p.user.pseudo, password);
    await api.deleteAccount(this.p.token, key);
    await this.signOutLocally(o.wipeLocal);
  }

  private async signOutLocally(wipe?: boolean) {
    if (this.pushTimer) clearTimeout(this.pushTimer);
    this.save({ ...EMPTY });
    this.set({ status: 'guest', user: null, conflict: null, scores: null, message: null, lastSyncAt: null });
    if (wipe) {
      this.applying = true;
      try {
        await this.store.reset();
      } finally {
        this.applying = false;
      }
      this.captureRefs();
    }
  }

  async setHidden(hidden: boolean): Promise<void> {
    if (!this.p.token) return;
    const r = await api.setHidden(this.p.token, hidden);
    this.save({ user: r.user });
    this.set({ user: r.user });
  }

  async leaderboard(period: 'week' | 'all'): Promise<Leaderboard> {
    if (!this.p.token) throw new ApiError(401, 'Connexion requise.');
    try {
      return await api.leaderboard(this.p.token, period);
    } catch (e) {
      if (e instanceof ApiError && e.status === 401) this.fail(e);
      throw e;
    }
  }
}

export function browserStorage(): KeyValue | null {
  try {
    const ls = window.localStorage;
    ls.setItem('passerelle.probe', '1');
    ls.removeItem('passerelle.probe');
    return ls;
  } catch {
    return null;
  }
}

/** Abonnement React à l'état du compte (même principe que useAppState). */
export function useSyncState<T>(sync: AccountSync, selector: (s: AccountState) => T): T {
  const cache = useRef<{ state: AccountState; value: T } | null>(null);
  const get = () => {
    const st = sync.getState();
    if (cache.current && cache.current.state === st) return cache.current.value;
    const value = selector(st);
    cache.current = { state: st, value };
    return value;
  };
  return useSyncExternalStore(sync.subscribe, get, get);
}
