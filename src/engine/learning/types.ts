/**
 * Modèle de données de la progression (persisté dans IndexedDB).
 */
import type { Exercise, ExerciseType } from '@/engine/exercises/types';
import type { CefrLevel } from '@/content/lexicon/types';

export type CardState = 'new' | 'learning' | 'review' | 'relearning';

/** Carte de répétition espacée (algorithme FSRS). */
export interface FsrsCard {
  stability: number;
  difficulty: number;
  /** Échéance (ms epoch). */
  due: number;
  /** Dernière révision (ms epoch). */
  last: number;
  reps: number;
  lapses: number;
  state: CardState;
}

export interface SkillState {
  id: string;
  /** Maîtrise estimée (0–1). */
  mastery: number;
  attempts: number;
  correct: number;
  /** Réussites consécutives. */
  streak: number;
  lastSeen: number;
  /** Carte FSRS de la compétence (révision espacée). */
  card: FsrsCard | null;
  /** Erreurs récentes par étiquette (décroissance progressive). */
  errors: Record<string, number>;
  /** Temps de réponse moyen (ms). */
  avgMs: number;
  /** Leçon consultée. */
  lessonSeen: boolean;
  /** Maîtrise initialisée par le test de niveau. */
  placed?: boolean;
}

export interface ItemState {
  id: string;
  card: FsrsCard;
  seen: number;
  correct: number;
  lastSeen: number;
}

export type SessionMode =
  | 'guided'
  | 'practice'
  | 'adaptive'
  | 'review'
  | 'vocab'
  | 'mistakes'
  | 'daily'
  | 'exam'
  | 'placement'
  | 'sprint';

export interface AttemptRecord {
  id?: number;
  ts: number;
  sessionId: string;
  mode: SessionMode;
  exerciseId: string;
  type: ExerciseType;
  skillId: string;
  correct: boolean;
  score: number;
  ms: number;
  errorTag?: string;
  signature: string;
  structure: string;
}

export interface SessionRecord {
  id: string;
  mode: SessionMode;
  startedAt: number;
  endedAt: number;
  total: number;
  correct: number;
  xp: number;
  durationMs: number;
  skills: string[];
  /** Score par compétence (examens). */
  bySkill?: Record<string, { total: number; correct: number }>;
  title?: string;
  /** Résultat du test de niveau ou de l'examen. */
  result?: string;
}

export interface DailyStat {
  /** AAAA-MM-JJ (heure locale). */
  date: string;
  exercises: number;
  correct: number;
  xp: number;
  ms: number;
  sessions: number;
}

export interface Profile {
  id: 'me';
  createdAt: number;
  placementDone: boolean;
  placementLevel?: string;
  streak: number;
  bestStreak: number;
  lastActiveDate?: string;
  totalXp: number;
  /** Défi quotidien terminé (date). */
  dailyDone?: string;
  /** Niveaux validés par une évaluation de fin de niveau réussie. */
  levelsPassed?: CefrLevel[];
  /** Version du schéma de données (migrations). */
  dataVersion?: number;
}

/** Production écrite conservée (rédaction guidée). */
export interface WritingRecord {
  id: string;
  ts: number;
  skillId: string;
  title: string;
  text: string;
  words: number;
  /** Score des vérifications automatiques (0–1). */
  autoScore: number;
  /** Auto-évaluation déclarée (0–1). */
  selfScore?: number;
}

export type ThemePref = 'system' | 'light' | 'dark';

export interface Settings {
  id: 'settings';
  theme: ThemePref;
  dailyGoalXp: number;
  sessionLength: 'short' | 'medium' | 'long';
  audio: {
    enabled: boolean;
    rate: number;
    voiceURI: string | null;
    autoplay: boolean;
    accent: 'en-GB' | 'en-US' | 'any';
  };
  /** Afficher la traduction des phrases par défaut. */
  showTranslations: boolean;
  /** Réduction des animations : système, forcée ou désactivée. */
  motion: 'system' | 'reduce' | 'full';
  /** Sons de retour (succès/erreur). */
  sounds: boolean;
}

export interface MistakeRecord {
  id: string;
  ts: number;
  skillId: string;
  exercise: Exercise;
  userAnswer: string;
  expected: string;
  errorTag?: string;
  /** Nombre de réussites ultérieures (retiré après 2). */
  fixed: number;
}

export interface ExposureRecord {
  key: string;
  count: number;
  last: number;
}

export interface ActiveSessionSnapshot {
  id: 'active';
  session: unknown;
  savedAt: number;
}

export const DEFAULT_SETTINGS: Settings = {
  id: 'settings',
  theme: 'system',
  dailyGoalXp: 100,
  sessionLength: 'medium',
  audio: { enabled: true, rate: 0.95, voiceURI: null, autoplay: true, accent: 'en-GB' },
  showTranslations: false,
  motion: 'system',
  sounds: true,
};

export const SESSION_SIZES: Record<Settings['sessionLength'], number> = { short: 8, medium: 14, long: 22 };

export function newSkillState(id: string): SkillState {
  return { id, mastery: 0, attempts: 0, correct: 0, streak: 0, lastSeen: 0, card: null, errors: {}, avgMs: 0, lessonSeen: false };
}
