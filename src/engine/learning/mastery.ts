/**
 * Modèle de maîtrise des compétences et estimation du niveau CECRL.
 */
import { ALL_SKILLS, GRAMMAR_SKILLS, SKILL_BY_ID } from '@/content/curriculum';
import { cardRetrievability } from './fsrs';
import { newSkillState, type SkillState } from './types';

export interface AttemptInput {
  correct: boolean;
  score: number;
  difficulty: 1 | 2 | 3;
  ms: number;
  errorTag?: string;
  now: number;
}

/**
 * Mise à jour de la maîtrise par moyenne mobile pondérée :
 * - l'apprentissage est rapide au début puis se stabilise ;
 * - une réussite sur un exercice difficile compte davantage ;
 * - une erreur sur un exercice facile pénalise davantage.
 */
export function updateSkill(prev: SkillState | undefined, id: string, a: AttemptInput): SkillState {
  const s: SkillState = prev ? { ...prev, errors: { ...prev.errors } } : newSkillState(id);
  const n = s.attempts;
  const alpha = Math.max(0.1, 1 / (n + 3));
  const target = a.correct ? Math.max(a.score, 0.85) : Math.min(a.score, 0.4);
  const weight = a.correct ? 0.7 + 0.2 * a.difficulty : 1.2 - 0.15 * a.difficulty;
  s.mastery = Math.min(1, Math.max(0, s.mastery + Math.min(0.5, alpha * weight) * (target - s.mastery)));
  s.attempts = n + 1;
  s.correct += a.correct ? 1 : 0;
  s.streak = a.correct ? s.streak + 1 : 0;
  s.lastSeen = a.now;
  s.avgMs = s.avgMs ? s.avgMs * 0.8 + a.ms * 0.2 : a.ms;
  // décroissance des erreurs passées, puis ajout de la nouvelle
  for (const k of Object.keys(s.errors)) {
    s.errors[k] = Math.round(s.errors[k] * 0.9 * 100) / 100;
    if (s.errors[k] < 0.2) delete s.errors[k];
  }
  if (!a.correct && a.errorTag) s.errors[a.errorTag] = (s.errors[a.errorTag] ?? 0) + 1;
  return s;
}

/** Maîtrise effective : la maîtrise s'érode si la compétence n'est pas révisée. */
export function effectiveMastery(s: SkillState | undefined, now: number): number {
  if (!s) return 0;
  if (!s.card || s.card.reps === 0) return s.mastery;
  const r = cardRetrievability(s.card, now);
  return s.mastery * (0.55 + 0.45 * r);
}

export type SkillStatus = 'locked' | 'available' | 'learning' | 'mastered' | 'review';

export function skillStatus(id: string, skills: Record<string, SkillState>, now: number): SkillStatus {
  const s = skills[id];
  const def = SKILL_BY_ID[id];
  const eff = effectiveMastery(s, now);
  if (s && s.attempts > 0) {
    if (s.card && s.card.reps > 0 && s.card.due <= now && eff < 0.85) return 'review';
    if (eff >= 0.8 && s.attempts >= 8) return 'mastered';
    return 'learning';
  }
  if (!def) return 'available';
  const ok = def.prereq.every((p) => effectiveMastery(skills[p], now) >= 0.45 || (skills[p]?.placed ?? false));
  return ok ? 'available' : 'locked';
}

export interface LevelEstimate {
  /** Libellé CECRL (A2−, A2, A2+, B1−, B1, B1+). */
  label: string;
  /** Progression globale de A2 vers B1 (0–1). */
  progress: number;
  a2: number;
  b1: number;
  vocab: number;
  description: string;
}

export function estimateLevel(skills: Record<string, SkillState>, now: number): LevelEstimate {
  const avg = (ids: string[]) => (ids.length ? ids.reduce((acc, id) => acc + effectiveMastery(skills[id], now), 0) / ids.length : 0);
  const a2 = avg(GRAMMAR_SKILLS.filter((s) => s.level === 'A2').map((s) => s.id));
  const b1 = avg(GRAMMAR_SKILLS.filter((s) => s.level === 'B1').map((s) => s.id));
  const vocab = avg(ALL_SKILLS.filter((s) => s.kind === 'vocab').map((s) => s.id));
  const comm = avg(ALL_SKILLS.filter((s) => s.kind === 'function').map((s) => s.id));
  const progress = Math.min(1, 0.45 * a2 + 0.35 * b1 + 0.12 * vocab + 0.08 * comm);
  let label: string;
  let description: string;
  if (a2 < 0.35) {
    label = 'A2−';
    description = 'Vous consolidez les bases du niveau A2.';
  } else if (a2 < 0.65) {
    label = 'A2';
    description = 'Vous maîtrisez une partie des structures A2 : continuez à les consolider.';
  } else if (b1 < 0.3) {
    label = 'A2+';
    description = 'Le niveau A2 est solide : vous pouvez aborder les notions B1.';
  } else if (b1 < 0.55) {
    label = 'B1−';
    description = 'Vous entrez dans le niveau B1.';
  } else if (b1 < 0.8) {
    label = 'B1';
    description = 'Vous utilisez la plupart des structures B1.';
  } else {
    label = 'B1+';
    description = 'Excellent : les structures B1 sont bien maîtrisées.';
  }
  return { label, progress, a2, b1, vocab, description };
}

/** Priorité d'une compétence pour l'entraînement adaptatif (plus haut = plus urgent). */
export function priority(s: SkillState | undefined, now: number): number {
  if (!s || s.attempts === 0) return 0;
  const eff = effectiveMastery(s, now);
  const weakness = 1 - eff;
  const due = s.card && s.card.reps > 0 && s.card.due <= now ? 0.35 : 0;
  const errors = Math.min(0.3, Object.values(s.errors).reduce((a, b) => a + b, 0) * 0.05);
  const staleDays = (now - s.lastSeen) / (24 * 3600 * 1000);
  const stale = Math.min(0.2, staleDays * 0.02);
  return weakness + due + errors + stale;
}
