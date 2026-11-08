/**
 * Déroulement d'une séance (logique pure, sérialisable pour pouvoir
 * reprendre une séance interrompue) : enchaînement des exercices, XP,
 * combo, remise en file des notions échouées, bilan.
 */
import type { EvalResult, Exercise } from '@/engine/exercises/types';
import type { PlanSlot } from './planner';
import type { SessionMode } from './types';

export interface SessionItem {
  exercise: Exercise;
  slot: PlanSlot;
  /** Variante proposée après une erreur. */
  retry?: boolean;
}

export interface AnswerLog {
  exerciseId: string;
  skillId: string;
  type: Exercise['type'];
  correct: boolean;
  score: number;
  ms: number;
  xp: number;
  errorTag?: string;
  userAnswer: string;
  expected: string;
  retry?: boolean;
}

export interface Session {
  id: string;
  mode: SessionMode;
  title: string;
  subtitle?: string;
  startedAt: number;
  items: SessionItem[];
  index: number;
  answers: AnswerLog[];
  /** Correction affichée après chaque exercice (désactivée en examen et test de niveau). */
  feedback: boolean;
  timeLimitMs?: number;
  examId?: string;
  focusSkills?: string[];
  /** Adresse (paramètres) qui a créé la séance : un rafraîchissement de la page la reprend. */
  origin?: string;
  combo: number;
  bestCombo: number;
  xp: number;
  retries: number;
  finished: boolean;
}

export interface SessionOptions {
  id: string;
  mode: SessionMode;
  title: string;
  subtitle?: string;
  now: number;
  feedback?: boolean;
  timeLimitMs?: number;
  examId?: string;
  focusSkills?: string[];
  origin?: string;
}

export function createSession(items: SessionItem[], o: SessionOptions): Session {
  return {
    id: o.id,
    mode: o.mode,
    title: o.title,
    subtitle: o.subtitle,
    startedAt: o.now,
    items,
    index: 0,
    answers: [],
    feedback: o.feedback ?? true,
    timeLimitMs: o.timeLimitMs,
    examId: o.examId,
    focusSkills: o.focusSkills,
    origin: o.origin,
    combo: 0,
    bestCombo: 0,
    xp: 0,
    retries: 0,
    finished: items.length === 0,
  };
}

/** L'exercice courant a-t-il déjà reçu sa réponse ? */
export function isAnswered(s: Session): boolean {
  return s.answers.length > s.index;
}

export function currentItem(s: Session): SessionItem | null {
  return s.finished ? null : s.items[s.index] ?? null;
}

/** XP gagnés pour une réponse. */
export function xpFor(result: EvalResult, tier: 1 | 2 | 3, combo: number, mode: SessionMode): number {
  if (mode === 'placement') return 0;
  if (!result.correct) return Math.round(result.score * 4);
  const base = 8 + tier * 2;
  const bonus = combo >= 3 ? Math.min(6, Math.floor(combo / 3) * 2) : 0;
  return base + bonus - (result.typo ? 2 : 0);
}

export const MAX_RETRIES = 3;

/**
 * Enregistre la réponse à l'exercice courant. Si l'apprenant se trompe
 * (hors examen), une variante de la même notion est ajoutée plus loin.
 */
export function answerCurrent(s: Session, result: EvalResult, ms: number, makeRetry?: (item: SessionItem) => SessionItem | null): Session {
  const item = currentItem(s);
  if (!item) return s;
  // exercice courant déjà corrigé (en attente de passage au suivant) : on ne compte pas deux fois
  if (isAnswered(s)) return s;
  const combo = result.correct ? s.combo + 1 : 0;
  const xp = xpFor(result, item.slot.tier, combo, s.mode);
  const log: AnswerLog = {
    exerciseId: item.exercise.id,
    skillId: item.exercise.skillId,
    type: item.exercise.type,
    correct: result.correct,
    score: result.score,
    ms,
    xp,
    errorTag: result.errorTag,
    userAnswer: result.userAnswer,
    expected: result.expected,
    retry: item.retry,
  };
  let items = s.items;
  let retries = s.retries;
  if (!result.correct && s.feedback && s.mode !== 'sprint' && retries < MAX_RETRIES && makeRetry && !item.retry) {
    const r = makeRetry(item);
    if (r) {
      const pos = Math.min(items.length, s.index + 3);
      items = [...items.slice(0, pos), { ...r, retry: true }, ...items.slice(pos)];
      retries += 1;
    }
  }
  return {
    ...s,
    items,
    retries,
    answers: [...s.answers, log],
    combo,
    bestCombo: Math.max(s.bestCombo, combo),
    xp: s.xp + xp,
  };
}

export function advance(s: Session, now: number): Session {
  const next = s.index + 1;
  const timeUp = s.timeLimitMs !== undefined && now - s.startedAt >= s.timeLimitMs;
  if (next >= s.items.length || timeUp) return { ...s, index: Math.min(next, s.items.length), finished: true };
  return { ...s, index: next };
}

export function finish(s: Session): Session {
  return { ...s, finished: true };
}

export interface SessionSummary {
  total: number;
  correct: number;
  accuracy: number;
  xp: number;
  durationMs: number;
  bestCombo: number;
  bySkill: Record<string, { total: number; correct: number }>;
  errors: Record<string, number>;
}

export function summarize(s: Session, _now?: number): SessionSummary {
  const bySkill: Record<string, { total: number; correct: number }> = {};
  const errors: Record<string, number> = {};
  let correct = 0;
  for (const a of s.answers) {
    const b = (bySkill[a.skillId] ??= { total: 0, correct: 0 });
    b.total += 1;
    if (a.correct) {
      b.correct += 1;
      correct += 1;
    } else if (a.errorTag) errors[a.errorTag] = (errors[a.errorTag] ?? 0) + 1;
  }
  const total = s.answers.length;
  return {
    total,
    correct,
    accuracy: total ? correct / total : 0,
    xp: s.xp,
    // temps réellement passé sur les exercices (une pause ou une reprise le lendemain ne compte pas)
    durationMs: s.answers.reduce((n, a) => n + Math.min(Math.max(0, a.ms), 5 * 60000), 0),
    bestCombo: s.bestCombo,
    bySkill,
    errors,
  };
}

/** Progression affichée (0–1). */
export function progressOf(s: Session, now: number): number {
  if (s.timeLimitMs) return Math.min(1, (now - s.startedAt) / s.timeLimitMs);
  if (!s.items.length) return 1;
  return Math.min(1, s.answers.length / s.items.length);
}
