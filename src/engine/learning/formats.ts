/**
 * Formats d'exercice réalisables pour chaque compétence.
 * Pour la grammaire, on échantillonne (de façon déterministe) quelques items
 * du générateur et on regarde quels formats ils permettent ; le résultat est
 * mis en cache pour la durée de la session.
 */
import { createRng } from '@/engine/core/rng';
import { ITEM_GENERATORS } from '@/engine/generator/registry';
import { canMake } from '@/engine/exercises/factory';
import { hasUsableExample, VOCAB_TYPES } from '@/engine/exercises/vocab';
import type { ExerciseType } from '@/engine/exercises/types';
import { VOCAB_THEMES } from '@/content/vocabulary';

const SENTENCE_TYPES: ExerciseType[] = [
  'cloze',
  'mcq',
  'contextChoice',
  'wordOrder',
  'translateFrEn',
  'translateEnFr',
  'errorCorrection',
  'conjugation',
  'transformation',
  'dictation',
  'listening',
];

const SAMPLES = 10;
const cache = new Map<string, Map<ExerciseType, number>>();

/** Proportion (0–1) des exercices de la compétence réalisables dans chaque format. */
export function formatSupport(skillId: string): Map<ExerciseType, number> {
  const hit = cache.get(skillId);
  if (hit) return hit;
  const out = new Map<ExerciseType, number>();
  if (skillId === 'reading') out.set('reading', 1);
  else if (skillId === 'listening') out.set('listening', 1);
  else if (skillId === 'dialogues') out.set('dialogue', 1);
  else if (skillId.startsWith('vocab_')) {
    const theme = VOCAB_THEMES.find((t) => `vocab_${t.id}` === skillId);
    if (theme) {
      const withExample = theme.items.filter(hasUsableExample).length;
      for (const t of VOCAB_TYPES) {
        // il faut assez d'exemples pour ne pas reproposer toujours la même phrase
        if (t === 'cloze' || t === 'contextChoice') {
          if (withExample >= 4) out.set(t, withExample / theme.items.length);
        } else out.set(t, 1);
      }
    }
  } else {
    const gen = ITEM_GENERATORS[skillId];
    if (gen) {
      const counts = new Map<ExerciseType, number>();
      let made = 0;
      for (let i = 0; i < SAMPLES * 3 && made < SAMPLES; i++) {
        const item = gen({ rng: createRng(`formats-${skillId}-${i}`), level: 'B1', difficulty: 2 });
        if (!item) continue;
        made++;
        for (const t of SENTENCE_TYPES) if (canMake(item, t)) counts.set(t, (counts.get(t) ?? 0) + 1);
      }
      for (const [t, n] of counts) out.set(t, n / Math.max(1, made));
      if (skillId === 'past_simple_irregular') {
        out.set('conjugation', 1);
        out.set('matching', 1);
      }
    }
  }
  cache.set(skillId, out);
  return out;
}

/** La compétence peut-elle produire régulièrement ce format ? */
export function supportsFormat(skillId: string, type: ExerciseType, min = 0.3): boolean {
  return (formatSupport(skillId).get(type) ?? 0) >= min;
}

/** Formats bien représentés pour une compétence (triés par disponibilité). */
export function formatsFor(skillId: string, min = 0.3): ExerciseType[] {
  return [...formatSupport(skillId).entries()]
    .filter(([, v]) => v >= min)
    .sort((a, b) => b[1] - a[1])
    .map(([t]) => t);
}
