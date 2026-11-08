/**
 * Création d'un exercice pour une compétence : choix du format selon le
 * niveau de maîtrise, génération d'un item, dé-duplication (on évite de
 * reproposer un exercice identique vu récemment).
 */
import { createRng, type Rng } from '@/engine/core/rng';
import { ITEM_GENERATORS } from '@/engine/generator/registry';
import type { GenContext } from '@/engine/generator/types';
import { canMake, itemToExercise } from '@/engine/exercises/factory';
import { irregularExercise, irregularMatching, vocabExercise, type SpecialContext } from '@/engine/exercises/vocab';
import { listeningComprehension, readingExercise } from '@/engine/exercises/comprehension';
import { dialogueExercise } from '@/engine/exercises/dialogues';
import { AUDIO_TYPES, type Exercise, type ExerciseType } from '@/engine/exercises/types';

export type Tier = 1 | 2 | 3;

export interface SelectContext {
  seed: string;
  level: 'A2' | 'B1';
  /** Synthèse vocale disponible et activée. */
  audio: boolean;
  /** Exercice (signature) vu récemment ? */
  recent?: (signature: string) => boolean;
  /** Poids d'exposition d'un lexème (variété). */
  lexWeight?: (lexId: string) => number;
  /** Poids d'un élément mémorisable (vocabulaire / verbe irrégulier). */
  itemWeight?: (itemId: string) => number;
  /** Dernier format proposé (pour varier). */
  lastType?: ExerciseType;
}

export function tierFor(mastery: number): Tier {
  if (mastery < 0.35) return 1;
  if (mastery < 0.7) return 2;
  return 3;
}

const GRAMMAR_WEIGHTS: Record<Tier, Partial<Record<ExerciseType, number>>> = {
  1: { mcq: 4, wordOrder: 3, translateEnFr: 2, listening: 1.2, contextChoice: 4, cloze: 1.2, conjugation: 0.8 },
  2: { cloze: 3.5, conjugation: 2.5, errorCorrection: 2, mcq: 2, transformation: 1.5, wordOrder: 1.5, translateEnFr: 1.2, listening: 1, dictation: 0.8, contextChoice: 2 },
  3: { translateFrEn: 3.5, cloze: 2.5, transformation: 2.5, errorCorrection: 2, dictation: 1.2, conjugation: 1.5, wordOrder: 1, contextChoice: 1, mcq: 0.6 },
};

const VOCAB_WEIGHTS: Record<Tier, Partial<Record<ExerciseType, number>>> = {
  1: { matching: 3, mcq: 4, listening: 1.5, contextChoice: 1.5 },
  2: { mcq: 2.5, translateFrEn: 2.5, cloze: 2, contextChoice: 2, matching: 1.5, listening: 1, dictation: 0.8 },
  3: { translateFrEn: 3.5, cloze: 2.5, dictation: 1.5, contextChoice: 1.5, mcq: 1 },
};

function chooseType(rng: Rng, weights: Partial<Record<ExerciseType, number>>, candidates: ExerciseType[], last?: ExerciseType): ExerciseType | null {
  const pool = candidates.filter((t) => (weights[t] ?? 0) > 0);
  if (!pool.length) return candidates.length ? rng.pick(candidates) : null;
  return rng.pickWeighted(pool, (t) => (weights[t] ?? 0) * (t === last ? 0.15 : 1));
}

function special(sc: SelectContext, seed: string, tier: Tier): SpecialContext {
  return { rng: createRng(seed), seed, level: sc.level, difficulty: tier, itemWeight: sc.itemWeight };
}

/** Exercice pour une compétence ; renvoie null si aucun exercice valide n'a pu être produit. */
export function makeExercise(skillId: string, sc: SelectContext, want: { type?: ExerciseType; tier?: Tier; types?: ExerciseType[] } = {}): Exercise | null {
  const tier: Tier = want.tier ?? 2;
  const allowed = (t: ExerciseType) => (sc.audio || !AUDIO_TYPES.has(t)) && (!want.types || want.types.includes(t));
  for (let attempt = 0; attempt < 12; attempt++) {
    const seed = `${sc.seed}#${skillId}#${attempt}`;
    const rng = createRng(seed);
    let ex: Exercise | null = null;
    if (skillId === 'reading') ex = readingExercise(special(sc, seed, tier));
    else if (skillId === 'listening') ex = sc.audio ? listeningComprehension(special(sc, seed, tier)) : null;
    else if (skillId === 'dialogues') ex = dialogueExercise(special(sc, seed, tier));
    else if (skillId.startsWith('vocab_')) {
      const theme = skillId.slice('vocab_'.length);
      const types = (Object.keys(VOCAB_WEIGHTS[tier]) as ExerciseType[]).filter(allowed);
      const type = want.type && allowed(want.type) ? want.type : chooseType(rng, VOCAB_WEIGHTS[tier], types, sc.lastType);
      if (type) ex = vocabExercise(special(sc, seed, tier), theme, type);
    } else if (skillId === 'past_simple_irregular' && !want.type && rng.chance(0.3) && (!want.types || want.types.includes('conjugation') || want.types.includes('matching'))) {
      ex = rng.chance(0.65) || (want.types && !want.types.includes('matching')) ? irregularExercise(special(sc, seed, tier)) : irregularMatching(special(sc, seed, tier));
    } else {
      const gen = ITEM_GENERATORS[skillId];
      if (!gen) return null;
      const ctx: GenContext = { rng, level: sc.level, difficulty: tier, lexWeight: sc.lexWeight };
      const item = gen(ctx);
      if (!item) continue;
      const candidates = (Object.keys(GRAMMAR_WEIGHTS[3]) as ExerciseType[])
        .concat(['mcq', 'wordOrder', 'translateEnFr', 'listening', 'contextChoice'])
        .filter((t, i, arr) => arr.indexOf(t) === i)
        .filter((t) => allowed(t) && canMake(item, t));
      const type = want.type && candidates.includes(want.type) ? want.type : chooseType(rng, GRAMMAR_WEIGHTS[tier], candidates, sc.lastType);
      if (!type) continue;
      ex = itemToExercise(item, type, { rng: rng.fork('ex'), seed, difficulty: tier });
    }
    if (!ex) continue;
    if (want.types && !want.types.includes(ex.type)) continue;
    if (sc.recent && sc.recent(ex.signature) && attempt < 11) continue;
    return ex;
  }
  return null;
}
