/**
 * Moteurs des compétences avancées : quels formats chaque compétence peut
 * produire, et comment. Les compétences de grammaire passent par les
 * générateurs d'items (registry.ts) ; on y ajoute ici les formats
 * complémentaires (reformulation avec mot imposé, nuances commentées).
 */
import type { Bank } from '@/engine/generator/bank';
import { bankKeyword } from '@/engine/generator/bank';
import type { GenContext } from '@/engine/generator/types';
import {
  insightExercise,
  passageExercise,
  textOrderExercise,
  writingExercise,
  type AdvancedContext,
  type InsightItem,
  type OrderItem,
  type PassageItem,
  type WritingPrompt,
} from '@/engine/exercises/advanced';
import type { Exercise, ExerciseType } from '@/engine/exercises/types';
import { B2_BANKS } from '@/content/advanced/b2-grammar';
import { ARGUMENT_B2, DIALOGUE_B2, NUANCE_B2, READING_B2, REGISTER_B2, TEXT_ORDER_B2, WRITING_B2 } from '@/content/advanced/b2-comm';
import { C1_BANKS } from '@/content/advanced/c1-grammar';
import { ARGUMENT_C1, DIALOGUE_C1, IMPLICATURE_C1, NUANCE_C1, PRECISION_C1, READING_C1, REGISTER_C1, STYLE_C1, TEXT_ORDER_C1, WRITING_C1 } from '@/content/advanced/c1-comm';
import { C2_BANKS } from '@/content/advanced/c2-grammar';
import { ARGUMENT_C2, CONNOTATION_C2, DIALOGUE_C2, IRONY_C2, NUANCE_C2, READING_C2, REGISTER_C2, STYLE_C2, TEXT_ORDER_C2, WRITING_C2 } from '@/content/advanced/c2-comm';

/** Banques de grammaire rédigées, par compétence. */
export const GRAMMAR_BANKS: Record<string, Bank> = Object.fromEntries([...B2_BANKS, ...C1_BANKS, ...C2_BANKS].map((b) => [b.skillId, b]));

/** Choix commentés de nuance rattachés à une notion de grammaire. */
export const NUANCE_EXTRAS: Record<string, InsightItem[]> = { ...NUANCE_B2, ...NUANCE_C1, ...NUANCE_C2 };

/** Formats complémentaires disponibles pour une compétence de grammaire. */
export function grammarExtras(skillId: string): ExerciseType[] {
  const out: ExerciseType[] = [];
  if (GRAMMAR_BANKS[skillId]?.entries.some((e) => e.kw)) out.push('keyword');
  if (NUANCE_EXTRAS[skillId]?.length) out.push('nuance');
  return out;
}

export function makeGrammarExtra(skillId: string, type: ExerciseType, gen: GenContext, adv: AdvancedContext): Exercise | null {
  if (type === 'keyword') {
    const bank = GRAMMAR_BANKS[skillId];
    return bank ? bankKeyword(bank, gen, adv.seed) : null;
  }
  if (type === 'nuance') return insightExercise(adv, skillId, 'nuance', NUANCE_EXTRAS[skillId] ?? []);
  return null;
}

// ---------------------------------------------------------------------------
// Compétences de communication et de lexique « commentées »

export interface SpecialEngine {
  formats: ExerciseType[];
  make: (ctx: AdvancedContext, type: ExerciseType) => Exercise | null;
}

interface CommContent {
  reading?: PassageItem[];
  argument?: PassageItem[];
  dialogue?: PassageItem[];
  order?: OrderItem[];
  register?: InsightItem[];
  nuance?: InsightItem[];
  implicature?: InsightItem[];
  style?: InsightItem[];
  writing?: WritingPrompt[];
}

function engine(skillId: string, c: CommContent): SpecialEngine {
  const formats: ExerciseType[] = [];
  if (c.reading?.length) formats.push('longReading');
  if (c.argument?.length) formats.push('argument');
  if (c.dialogue?.length) formats.push('dialogueAnalysis');
  if (c.order?.length) formats.push('textOrder');
  if (c.register?.length) formats.push('register');
  if (c.nuance?.length) formats.push('nuance');
  if (c.implicature?.length) formats.push('implicature');
  if (c.style?.length) formats.push('styleEdit');
  if (c.writing?.length) formats.push('writing');
  return {
    formats,
    make: (ctx, type) => {
      switch (type) {
        case 'longReading':
          return passageExercise(ctx, skillId, 'longReading', c.reading ?? []);
        case 'argument':
          return passageExercise(ctx, skillId, 'argument', c.argument ?? []);
        case 'dialogueAnalysis':
          return passageExercise(ctx, skillId, 'dialogueAnalysis', c.dialogue ?? []);
        case 'textOrder':
          return textOrderExercise(ctx, skillId, c.order ?? []);
        case 'register':
          return insightExercise(ctx, skillId, 'register', c.register ?? []);
        case 'nuance':
          return insightExercise(ctx, skillId, 'nuance', c.nuance ?? []);
        case 'implicature':
          return insightExercise(ctx, skillId, 'implicature', c.implicature ?? []);
        case 'styleEdit':
          return insightExercise(ctx, skillId, 'styleEdit', c.style ?? []);
        case 'writing':
          return writingExercise(ctx, skillId, c.writing ?? []);
        default:
          return null;
      }
    },
  };
}

export const SPECIAL_ENGINES: Record<string, SpecialEngine> = {
  reading_b2: engine('reading_b2', { reading: READING_B2 }),
  argument_b2: engine('argument_b2', { argument: ARGUMENT_B2, order: TEXT_ORDER_B2 }),
  dialogue_b2: engine('dialogue_b2', { dialogue: DIALOGUE_B2 }),
  register_b2: engine('register_b2', { register: REGISTER_B2 }),
  writing_b2: engine('writing_b2', { writing: WRITING_B2 }),
  precision_c1: engine('precision_c1', { nuance: PRECISION_C1 }),
  reading_c1: engine('reading_c1', { reading: READING_C1 }),
  argument_c1: engine('argument_c1', { argument: ARGUMENT_C1, order: TEXT_ORDER_C1 }),
  style_c1: engine('style_c1', { style: STYLE_C1, register: REGISTER_C1 }),
  implicature_c1: engine('implicature_c1', { implicature: IMPLICATURE_C1, dialogue: DIALOGUE_C1 }),
  writing_c1: engine('writing_c1', { writing: WRITING_C1 }),
  connotation_c2: engine('connotation_c2', { nuance: CONNOTATION_C2 }),
  reading_c2: engine('reading_c2', { reading: READING_C2 }),
  argument_c2: engine('argument_c2', { argument: ARGUMENT_C2, order: TEXT_ORDER_C2 }),
  irony_c2: engine('irony_c2', { implicature: IRONY_C2, dialogue: DIALOGUE_C2 }),
  register_c2: engine('register_c2', { register: REGISTER_C2 }),
  style_c2: engine('style_c2', { style: STYLE_C2 }),
  writing_c2: engine('writing_c2', { writing: WRITING_C2 }),
};

/** Pondération des formats des compétences commentées (tirage quand plusieurs formats coexistent). */
export const SPECIAL_WEIGHTS: Partial<Record<ExerciseType, number>> = {
  longReading: 1,
  argument: 1.4,
  dialogueAnalysis: 1,
  textOrder: 1,
  register: 1,
  nuance: 1,
  implicature: 1,
  styleEdit: 1,
  writing: 1,
};
