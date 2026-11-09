/** Leçons de toutes les compétences de grammaire et de communication. */
import type { Lesson } from './types';
import { PRESENT_PAST_LESSONS } from './present-past';
import { NOUNS_FUTURE_LESSONS } from './nouns-future';
import { MODALS_PERFECT_LESSONS } from './modals-perfect';
import { COMPLEX_COMM_LESSONS } from './complex-comm';
import { B2_LESSONS } from './b2';
import { C1_LESSONS } from './c1';

export type { Lesson, LessonBlock, LessonExample, Pitfall } from './types';

export const LESSONS: Record<string, Lesson> = {
  ...PRESENT_PAST_LESSONS,
  ...NOUNS_FUTURE_LESSONS,
  ...MODALS_PERFECT_LESSONS,
  ...COMPLEX_COMM_LESSONS,
  ...B2_LESSONS,
  ...C1_LESSONS,
};

export function lessonFor(skillId: string): Lesson | undefined {
  return LESSONS[skillId];
}
