/**
 * Accès aux données de progression : chargement initial, enregistrements
 * incrémentaux, export / import JSON, réinitialisation.
 */
import type {
  AttemptRecord,
  DailyStat,
  ExposureRecord,
  ItemState,
  MistakeRecord,
  Profile,
  SessionRecord,
  Settings,
  SkillState,
} from '@/engine/learning/types';
import { DEFAULT_SETTINGS } from '@/engine/learning/types';
import type { Backend, StoreName } from './db';

export interface LoadedData {
  settings: Settings;
  profile: Profile;
  skills: Record<string, SkillState>;
  items: Record<string, ItemState>;
  sessions: SessionRecord[];
  daily: Record<string, DailyStat>;
  mistakes: MistakeRecord[];
  exposure: Record<string, ExposureRecord>;
  activeSession: unknown | null;
}

export function defaultProfile(now: number): Profile {
  return { id: 'me', createdAt: now, placementDone: false, streak: 0, bestStreak: 0, totalXp: 0 };
}

/** Fusionne les réglages enregistrés avec les valeurs par défaut (robustesse aux anciennes versions). */
export function sanitizeSettings(raw: unknown): Settings {
  const r = (raw && typeof raw === 'object' ? raw : {}) as Partial<Settings>;
  const audio = (r.audio && typeof r.audio === 'object' ? r.audio : {}) as Partial<Settings['audio']>;
  const num = (v: unknown, d: number, min: number, max: number) => (typeof v === 'number' && Number.isFinite(v) ? Math.min(max, Math.max(min, v)) : d);
  return {
    id: 'settings',
    theme: r.theme === 'light' || r.theme === 'dark' || r.theme === 'system' ? r.theme : DEFAULT_SETTINGS.theme,
    dailyGoalXp: num(r.dailyGoalXp, DEFAULT_SETTINGS.dailyGoalXp, 20, 500),
    sessionLength: r.sessionLength === 'short' || r.sessionLength === 'long' || r.sessionLength === 'medium' ? r.sessionLength : DEFAULT_SETTINGS.sessionLength,
    audio: {
      enabled: typeof audio.enabled === 'boolean' ? audio.enabled : DEFAULT_SETTINGS.audio.enabled,
      rate: num(audio.rate, DEFAULT_SETTINGS.audio.rate, 0.5, 1.5),
      voiceURI: typeof audio.voiceURI === 'string' ? audio.voiceURI : null,
      autoplay: typeof audio.autoplay === 'boolean' ? audio.autoplay : DEFAULT_SETTINGS.audio.autoplay,
      accent: audio.accent === 'en-US' || audio.accent === 'any' || audio.accent === 'en-GB' ? audio.accent : DEFAULT_SETTINGS.audio.accent,
    },
    showTranslations: typeof r.showTranslations === 'boolean' ? r.showTranslations : DEFAULT_SETTINGS.showTranslations,
    motion: r.motion === 'reduce' || r.motion === 'full' || r.motion === 'system' ? r.motion : DEFAULT_SETTINGS.motion,
    sounds: typeof r.sounds === 'boolean' ? r.sounds : DEFAULT_SETTINGS.sounds,
  };
}

export async function loadAll(b: Backend, now: number): Promise<LoadedData> {
  const [settings, profile, skills, items, sessions, daily, mistakes, exposure, active] = await Promise.all([
    b.get<Settings>('settings', 'settings'),
    b.get<Profile>('profile', 'me'),
    b.getAll<SkillState>('skills'),
    b.getAll<ItemState>('items'),
    b.getLatest<SessionRecord>('sessions', 'startedAt', 300),
    b.getAll<DailyStat>('daily'),
    b.getAll<MistakeRecord>('mistakes'),
    b.getAll<ExposureRecord>('exposure'),
    b.get<{ id: string; session: unknown }>('meta', 'active'),
  ]);
  return {
    settings: sanitizeSettings(settings),
    profile: profile ?? defaultProfile(now),
    skills: Object.fromEntries(skills.filter((s) => s && typeof s.id === 'string').map((s) => [s.id, { ...s, errors: s.errors ?? {} }])),
    items: Object.fromEntries(items.filter((i) => i && typeof i.id === 'string' && i.card).map((i) => [i.id, i])),
    sessions,
    daily: Object.fromEntries(daily.map((d) => [d.date, d])),
    mistakes: mistakes.filter((m) => m && m.exercise),
    exposure: Object.fromEntries(exposure.map((e) => [e.key, e])),
    activeSession: active?.session ?? null,
  };
}

export async function recentAttempts(b: Backend, n = 2000): Promise<AttemptRecord[]> {
  return b.getLatest<AttemptRecord>('attempts', 'ts', n);
}

// ---------------------------------------------------------------------------
// Export / import

export const EXPORT_APP = 'passerelle';
export const EXPORT_VERSION = 1;

const ALL_STORES: StoreName[] = ['settings', 'profile', 'skills', 'items', 'attempts', 'sessions', 'daily', 'mistakes', 'exposure'];

export interface ExportFile {
  app: typeof EXPORT_APP;
  version: number;
  exportedAt: string;
  data: Record<string, unknown[]>;
}

export async function exportAll(b: Backend): Promise<ExportFile> {
  const data: Record<string, unknown[]> = {};
  for (const s of ALL_STORES) data[s] = await b.getAll(s);
  return { app: EXPORT_APP, version: EXPORT_VERSION, exportedAt: new Date().toISOString(), data };
}

export class ImportError extends Error {}

/** Vérifie la structure d'un fichier exporté avant tout écrasement. */
export function validateExport(raw: unknown): ExportFile {
  if (!raw || typeof raw !== 'object') throw new ImportError('Fichier illisible : JSON attendu.');
  const f = raw as Partial<ExportFile>;
  if (f.app !== EXPORT_APP) throw new ImportError("Ce fichier ne provient pas de l'application Passerelle.");
  if (typeof f.version !== 'number' || f.version > EXPORT_VERSION) throw new ImportError('Version de sauvegarde non prise en charge.');
  if (!f.data || typeof f.data !== 'object') throw new ImportError('Sauvegarde incomplète.');
  for (const s of ALL_STORES) {
    const arr = (f.data as Record<string, unknown>)[s];
    if (arr !== undefined && !Array.isArray(arr)) throw new ImportError(`Section « ${s} » invalide.`);
  }
  const skills = (f.data.skills ?? []) as SkillState[];
  for (const sk of skills) {
    if (!sk || typeof sk.id !== 'string' || typeof sk.mastery !== 'number') throw new ImportError('Données de compétences invalides.');
  }
  const items = (f.data.items ?? []) as ItemState[];
  for (const it of items) {
    if (!it || typeof it.id !== 'string' || !it.card || typeof it.card.due !== 'number') throw new ImportError('Données de révision invalides.');
  }
  return f as ExportFile;
}

export async function importAll(b: Backend, file: ExportFile): Promise<void> {
  for (const s of ALL_STORES) await b.clear(s);
  await b.delete('meta', 'active');
  for (const s of ALL_STORES) {
    const arr = (file.data[s] ?? []) as unknown[];
    if (s === 'settings') {
      if (arr[0]) await b.put('settings', sanitizeSettings(arr[0]));
      continue;
    }
    await b.putMany(s, arr);
  }
}

export async function resetAll(b: Backend): Promise<void> {
  for (const s of [...ALL_STORES, 'meta' as StoreName]) await b.clear(s);
}
