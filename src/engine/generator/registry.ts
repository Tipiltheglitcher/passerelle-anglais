/**
 * Registre des générateurs d'items par compétence de grammaire.
 */
import type { ItemGenerator } from './types';
import * as present from './skills/present';
import * as past from './skills/past';
import * as perfect from './skills/perfect';
import * as future from './skills/future';
import * as questions from './skills/questions';
import * as nouns from './skills/nouns';
import * as compare from './skills/compare';
import * as prepositions from './skills/prepositions';
import * as modals from './skills/modals';
import * as verbs from './skills/verbs';
import * as conditionals from './skills/conditionals';
import * as complex from './skills/complex';
import * as narrative from './skills/narrative';
import { bankGenerator } from './bank';
import { B2_BANKS } from '@/content/advanced/b2-grammar';
import { C1_BANKS } from '@/content/advanced/c1-grammar';

export const ITEM_GENERATORS: Record<string, ItemGenerator> = {
  present_simple: present.presentSimple,
  present_simple_neg_q: present.presentSimpleNegQ,
  frequency_adverbs: present.frequencyAdverbs,
  present_continuous: present.presentContinuous,
  simple_vs_continuous: present.simpleVsContinuous,
  past_simple_regular: past.pastSimpleRegular,
  past_simple_irregular: past.pastSimpleIrregular,
  past_simple_neg_q: past.pastSimpleNegQ,
  was_were: past.wasWere,
  past_continuous: past.pastContinuous,
  used_to: past.usedTo,
  pp_experience: perfect.ppExperience,
  pp_just_already_yet: perfect.ppJustAlreadyYet,
  pp_for_since: perfect.ppForSince,
  pp_vs_past: perfect.ppVsPast,
  future_will: future.futureWill,
  going_to: future.goingTo,
  future_forms: future.futureForms,
  time_clauses: future.timeClauses,
  wh_questions: questions.whQuestions,
  short_answers: questions.shortAnswers,
  subject_questions: questions.subjectQuestions,
  question_tags: questions.questionTags,
  articles: nouns.articles,
  countable_quantifiers: nouns.quantifiers,
  there_is_are: nouns.thereIsAre,
  pronouns_possessives: nouns.pronounsPossessives,
  comparatives: compare.comparatives,
  superlatives: compare.superlatives,
  as_as_too_enough: compare.asAsTooEnough,
  adverbs_manner: compare.adverbsManner,
  ed_ing_adjectives: compare.edIngAdjectives,
  prepositions_time: prepositions.prepositionsTime,
  prepositions_place: prepositions.prepositionsPlace,
  can_could: modals.canCould,
  must_have_to: modals.mustHaveTo,
  should: modals.shouldAdvice,
  might_may: modals.mightMay,
  requests_offers: modals.requestsOffers,
  gerund_infinitive: verbs.gerundInfinitive,
  zero_conditional: conditionals.zeroConditional,
  first_conditional: conditionals.firstConditional,
  second_conditional: conditionals.secondConditional,
  connectors: complex.connectors,
  relative_clauses: complex.relativeClauses,
  passive: complex.passive,
  reported_speech: complex.reportedSpeech,
  // B1 → B2 (générateurs compositionnels)
  past_perfect: narrative.pastPerfect,
  third_conditional: conditionals.thirdConditional,
  // banques d'items rédigés
  ...Object.fromEntries([...B2_BANKS, ...C1_BANKS].map((b) => [b.skillId, bankGenerator(b)])),
};

export function hasItemGenerator(skillId: string): boolean {
  return skillId in ITEM_GENERATORS;
}
