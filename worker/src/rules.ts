/**
 * Validation des données reçues et règles du classement.
 *
 * Les XP du classement ne sont jamais repris tels quels : chaque séance est
 * vérifiée (cohérence des nombres, durée minimale, date) et ses XP sont
 * plafonnés au maximum atteignable avec ses réponses. Un plafond quotidien
 * limite les abus. Ce n'est pas un système anti-triche complet : le serveur
 * ne rejoue pas les exercices.
 */

export const PSEUDO_RE = /^[A-Za-z0-9_.-]{3,20}$/;
/** Clé dérivée côté client : 32 octets en base64url. */
export const KEY_RE = /^[A-Za-z0-9_-]{43}$/;
export const TOKEN_RE = /^[A-Za-z0-9_-]{43}$/;

export const LEVEL_LABELS = ['?', 'A2−', 'A2', 'A2+', 'B1−', 'B1', 'B1+', 'B2−', 'B2', 'B2+', 'C1−', 'C1', 'C1+', 'C2−', 'C2'];
export const MODES = ['guided', 'practice', 'adaptive', 'review', 'vocab', 'mistakes', 'daily', 'exam', 'placement', 'sprint'];

export const MAX_DATA_LENGTH = 1_900_000;
export const MAX_BODY_LENGTH = 2_000_000;

export const XP_RULES = {
  /** XP maximum pour une bonne réponse (barème de l'application : 14 + bonus de série 6). */
  maxPerCorrect: 20,
  /** XP maximum pour une réponse fausse (réponse partiellement juste). */
  maxPerWrong: 4,
  /** Durée moyenne minimale par exercice. */
  minMsPerExercise: 1500,
  maxExercisesPerSession: 80,
  /** Plafond d'XP comptés au classement par jour (UTC). */
  dailyCap: 2000,
  /** Une séance doit être déclarée dans les 7 jours. */
  maxAgeMs: 7 * 86400000,
  maxSessionsPerRequest: 50,
};

export const SESSION_TTL_MS = 90 * 86400000;

export const LIMITS = {
  /** Échecs de connexion par pseudo sur 15 minutes. */
  loginPerPseudo: 5,
  /** Échecs de connexion par adresse IP sur 15 minutes. */
  loginPerIp: 30,
  loginWindowMs: 15 * 60000,
  /** Inscriptions par adresse IP et par heure. */
  registerPerIp: 5,
  registerWindowMs: 3600000,
};

export function pseudoKey(pseudo: string): string {
  return pseudo.toLowerCase();
}

const isInt = (v: unknown, min: number, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max;

export interface Summary {
  xp: number;
  exercises: number;
  sessions: number;
  lastActivity: number;
  level: string;
}

/** Résumé affiché lors d'un conflit de synchronisation (et niveau du classement). */
export function validateSummary(raw: unknown): Summary | null {
  if (!raw || typeof raw !== 'object') return null;
  const r = raw as Record<string, unknown>;
  if (!isInt(r.xp, 0, 1e9) || !isInt(r.exercises, 0, 1e8) || !isInt(r.sessions, 0, 1e7) || !isInt(r.lastActivity, 0, 1e14)) return null;
  const level = typeof r.level === 'string' && LEVEL_LABELS.includes(r.level) ? r.level : '?';
  return { xp: r.xp, exercises: r.exercises, sessions: r.sessions, lastActivity: r.lastActivity, level };
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

export interface ScoredSession {
  id: string;
  endedAt: number;
  day: string;
  exercises: number;
  correct: number;
  xp: number;
}

export function dayOf(ts: number): string {
  return new Date(ts).toISOString().slice(0, 10);
}

/** Lundi 00:00 UTC de la semaine en cours. */
export function weekStart(now: number): number {
  const d = new Date(now);
  const back = (d.getUTCDay() + 6) % 7;
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back);
}

/**
 * Vérifie une séance déclarée. Renvoie null si elle est incohérente ; sinon,
 * les XP retenus (plafonnés au maximum atteignable).
 */
export function scoreSession(raw: unknown, now: number, accountCreatedAt: number): ScoredSession | null {
  if (!raw || typeof raw !== 'object') return null;
  const s = raw as Partial<ReportedSession>;
  if (typeof s.id !== 'string' || !/^[A-Za-z0-9_:.-]{1,80}$/.test(s.id)) return null;
  if (typeof s.mode !== 'string' || !MODES.includes(s.mode)) return null;
  if (!isInt(s.total, 1, XP_RULES.maxExercisesPerSession) || !isInt(s.correct, 0, s.total)) return null;
  if (!isInt(s.xp, 0, 1e6) || !isInt(s.durationMs, 0, 1e9)) return null;
  if (!isInt(s.startedAt, 0, 1e14) || !isInt(s.endedAt, 0, 1e14) || s.startedAt > s.endedAt) return null;
  // séance terminée après la création du compte, récemment, et pas dans le futur
  if (s.endedAt < accountCreatedAt || s.endedAt > now + 5 * 60000 || s.endedAt < now - XP_RULES.maxAgeMs) return null;
  // trop rapide pour être réelle
  if (s.durationMs < s.total * XP_RULES.minMsPerExercise) return null;
  // le temps passé sur les exercices ne peut pas dépasser la durée réelle de la séance
  if (s.durationMs > s.endedAt - s.startedAt + 60000) return null;
  const max = s.correct * XP_RULES.maxPerCorrect + (s.total - s.correct) * XP_RULES.maxPerWrong;
  const xp = s.mode === 'placement' ? 0 : Math.min(s.xp, max);
  return { id: s.id, endedAt: s.endedAt, day: dayOf(s.endedAt), exercises: s.total, correct: s.correct, xp };
}
