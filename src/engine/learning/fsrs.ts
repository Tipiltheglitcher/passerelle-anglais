/**
 * Répétition espacée : implémentation de l'algorithme FSRS (v4.5, poids par
 * défaut). La note (1 à 4) est déduite automatiquement de la performance :
 * erreur → 1, réussite laborieuse (lente, faute de frappe) → 2, réussite → 3,
 * réussite rapide et répétée → 4.
 */
import type { FsrsCard } from './types';

export type Grade = 1 | 2 | 3 | 4;

const W = [0.4872, 1.4003, 3.7145, 13.8206, 5.1618, 1.2298, 0.8975, 0.031, 1.6474, 0.1367, 1.0461, 2.1072, 0.0793, 0.3246, 1.587, 0.2272, 2.8755];
const DECAY = -0.5;
const FACTOR = 19 / 81;
export const DAY = 24 * 60 * 60 * 1000;
const MAX_INTERVAL_DAYS = 365;
/** Rétention visée. */
export const TARGET_RETENTION = 0.9;

const clamp = (x: number, a: number, b: number) => Math.min(b, Math.max(a, x));

export function retrievability(elapsedDays: number, stability: number): number {
  if (stability <= 0) return 0;
  return Math.pow(1 + (FACTOR * Math.max(0, elapsedDays)) / stability, DECAY);
}

function initStability(g: Grade): number {
  return Math.max(0.1, W[g - 1]);
}

function initDifficulty(g: Grade): number {
  return clamp(W[4] - (g - 3) * W[5], 1, 10);
}

function nextDifficulty(d: number, g: Grade): number {
  const next = d - W[6] * (g - 3);
  return clamp(W[7] * initDifficulty(3) + (1 - W[7]) * next, 1, 10);
}

function recallStability(d: number, s: number, r: number, g: Grade): number {
  const hard = g === 2 ? W[15] : 1;
  const easy = g === 4 ? W[16] : 1;
  return s * (1 + Math.exp(W[8]) * (11 - d) * Math.pow(s, -W[9]) * (Math.exp((1 - r) * W[10]) - 1) * hard * easy);
}

function forgetStability(d: number, s: number, r: number): number {
  return Math.min(s, W[11] * Math.pow(d, -W[12]) * (Math.pow(s + 1, W[13]) - 1) * Math.exp((1 - r) * W[14]));
}

export function intervalDays(stability: number, retention = TARGET_RETENTION): number {
  const days = (stability / FACTOR) * (Math.pow(retention, 1 / DECAY) - 1);
  return clamp(Math.round(days), 1, MAX_INTERVAL_DAYS);
}

export function newCard(now: number): FsrsCard {
  return { stability: 0, difficulty: 0, due: now, last: 0, reps: 0, lapses: 0, state: 'new' };
}

/** Applique une révision notée à une carte (renvoie une nouvelle carte). */
export function review(card: FsrsCard, g: Grade, now: number): FsrsCard {
  if (card.state === 'new' || card.reps === 0) {
    const s = initStability(g);
    const d = initDifficulty(g);
    if (g === 1) {
      return { stability: s, difficulty: d, due: now + 10 * 60 * 1000, last: now, reps: 1, lapses: 0, state: 'learning' };
    }
    return { stability: s, difficulty: d, due: now + intervalDays(s) * DAY, last: now, reps: 1, lapses: 0, state: 'review' };
  }
  const elapsed = (now - card.last) / DAY;
  // Révision le même jour : on ne modifie pas la mémoire à long terme,
  // mais une erreur ramène la carte rapidement.
  if (elapsed < 0.5) {
    if (g === 1) return { ...card, due: now + 10 * 60 * 1000, state: card.state === 'review' ? 'relearning' : card.state, last: card.last };
    if (card.state === 'learning' || card.state === 'relearning') {
      return { ...card, due: now + intervalDays(Math.max(card.stability, 1)) * DAY, state: 'review' };
    }
    return card;
  }
  const r = retrievability(elapsed, card.stability);
  const d = nextDifficulty(card.difficulty, g);
  if (g === 1) {
    const s = Math.max(0.1, forgetStability(card.difficulty, card.stability, r));
    return { stability: s, difficulty: d, due: now + 10 * 60 * 1000, last: now, reps: card.reps + 1, lapses: card.lapses + 1, state: 'relearning' };
  }
  const s = recallStability(card.difficulty, card.stability, r, g);
  return { stability: s, difficulty: d, due: now + intervalDays(s) * DAY, last: now, reps: card.reps + 1, lapses: card.lapses, state: 'review' };
}

/** Probabilité de rappel actuelle d'une carte. */
export function cardRetrievability(card: FsrsCard | null, now: number): number {
  if (!card || card.reps === 0) return 0;
  return retrievability((now - card.last) / DAY, card.stability);
}

export function isDue(card: FsrsCard | null, now: number): boolean {
  return !!card && card.reps > 0 && card.due <= now;
}

/** Note déduite d'un résultat d'exercice. */
export function gradeFromResult(r: { correct: boolean; score: number; typo?: boolean; ms: number; expectedMs: number; streak: number }): Grade {
  if (!r.correct) return r.score >= 0.5 ? 2 : 1;
  if (r.typo || r.score < 0.95 || r.ms > r.expectedMs * 1.8) return 2;
  if (r.ms < r.expectedMs * 0.6 && r.streak >= 2) return 4;
  return 3;
}
