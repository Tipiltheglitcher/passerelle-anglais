/**
 * Curriculum des étapes avancées (B1 → B2, B2 → C1, C1 → C2).
 * Chaque compétence précise son domaine (grammaire, lexique, écrit, oral) ;
 * les thèmes de vocabulaire avancés sont définis dans vocabulary-advanced.ts.
 */
import type { Domain, StageId } from '../levels';
import type { CefrLevel } from '../lexicon/types';

export interface AdvancedSkillSpec {
  id: string;
  title: string;
  en: string;
  unit: string;
  level: CefrLevel;
  kind: 'grammar' | 'vocab' | 'function';
  domain: Domain;
  prereq: string[];
  summary: string;
  /** Production libre : évaluation partielle + auto-évaluation. */
  selfAssessed?: boolean;
}

export interface AdvancedUnitSpec {
  id: string;
  title: string;
  subtitle: string;
  level: CefrLevel;
  stage: StageId;
  icon: string;
  kind: 'grammar' | 'vocab' | 'function';
}

const g = (id: string, title: string, en: string, unit: string, level: CefrLevel, prereq: string[], summary: string, domain: Domain = 'grammar'): AdvancedSkillSpec => ({ id, title, en, unit, level, kind: 'grammar', domain, prereq, summary });
const v = (theme: string, title: string, unit: string, level: CefrLevel, summary: string): AdvancedSkillSpec => ({ id: `vocab_${theme}`, title, en: title, unit, level, kind: 'vocab', domain: 'lexis', prereq: [], summary });
const f = (id: string, title: string, en: string, unit: string, level: CefrLevel, domain: Domain, summary: string, extra: Partial<AdvancedSkillSpec> = {}): AdvancedSkillSpec => ({ id, title, en, unit, level, kind: 'function', domain, prereq: [], summary, ...extra });

// ---------------------------------------------------------------------------
// B1 → B2

export const B2_UNITS: AdvancedUnitSpec[] = [
  { id: 'u_b2_time', title: 'Raconter avec précision', subtitle: 'Past perfect, futur antérieur, futur continu', level: 'B2', stage: 'b1b2', icon: 'history', kind: 'grammar' },
  { id: 'u_b2_hypo', title: 'Hypothèses, regrets, déductions', subtitle: 'Conditionnels 3 et mixtes, wish, modaux au passé', level: 'B2', stage: 'b1b2', icon: 'split', kind: 'grammar' },
  { id: 'u_b2_struct', title: 'Structures du B2', subtitle: 'Passif, causatif, discours rapporté, concession', level: 'B2', stage: 'b1b2', icon: 'layers', kind: 'grammar' },
  { id: 'u_b2_lexis', title: 'Lexique du B2', subtitle: 'Collocations, phrasal verbs, expressions, argumentation', level: 'B2', stage: 'b1b2', icon: 'book', kind: 'vocab' },
  { id: 'u_b2_comm', title: 'Comprendre et argumenter', subtitle: 'Textes longs, arguments, dialogues, registre, rédaction', level: 'B2', stage: 'b1b2', icon: 'chat', kind: 'function' },
];

export const B2_SKILLS: AdvancedSkillSpec[] = [
  g('past_perfect', 'Le past perfect', 'Past perfect', 'u_b2_time', 'B2', [], "L'antériorité dans un récit : had + participe passé."),
  g('past_perfect_cont', 'Le past perfect continu', 'Past perfect continuous', 'u_b2_time', 'B2', ['past_perfect'], 'had been + -ing : durée avant un moment passé.'),
  g('future_perf_cont', 'Futur antérieur et futur continu', 'Future perfect & continuous', 'u_b2_time', 'B2', [], 'will have done, will be doing, will have been doing.'),
  g('third_conditional', 'Le conditionnel de type 3', 'Third conditional', 'u_b2_hypo', 'B2', ['past_perfect'], 'If + past perfect, would have + participe passé.'),
  g('mixed_conditionals', 'Les conditionnels mixtes', 'Mixed conditionals', 'u_b2_hypo', 'B2', ['third_conditional'], 'Passé → présent, présent → passé.'),
  g('wish_if_only', 'Wish, if only, I’d rather', 'Wishes & regrets', 'u_b2_hypo', 'B2', ['third_conditional'], 'Regrets et souhaits : le temps recule.'),
  g('modals_past', 'Les modaux au passé', 'Past modals', 'u_b2_hypo', 'B2', [], "must have, can't have, should have, needn't have…"),
  g('passive_advanced', 'Le passif avancé', 'Advanced passive', 'u_b2_struct', 'B2', [], 'It is said that…, he is believed to have…, modaux.'),
  g('causative', 'Le causatif', 'Causative have / get', 'u_b2_struct', 'B2', ['passive_advanced'], 'have something done, get somebody to do.'),
  g('reporting_verbs', 'Les verbes introducteurs', 'Reporting verbs', 'u_b2_struct', 'B2', [], 'suggest doing, advise somebody to, deny, accuse of…'),
  g('linking_contrast', 'Opposition et concession', 'Contrast & concession', 'u_b2_struct', 'B2', [], 'despite, although, whereas, however, even so.'),
  v('colloc_b2', 'Collocations essentielles', 'u_b2_lexis', 'B2', 'meet a deadline, raise awareness, heavy traffic…'),
  v('phrasal_b2', 'Phrasal verbs avancés', 'u_b2_lexis', 'B2', 'come up with, put up with, turn out…'),
  v('idioms_b2', 'Expressions idiomatiques (B2)', 'u_b2_lexis', 'B2', 'hit the nail on the head, a long shot…'),
  v('debate_b2', 'Débattre et argumenter', 'u_b2_lexis', 'B2', 'drawback, outweigh, evidence, to some extent…'),
  f('reading_b2', 'Textes longs (B2)', 'Long texts', 'u_b2_comm', 'B2', 'written', "Articles et reportages : idée principale, détails, inférences, position de l'auteur."),
  f('argument_b2', "Comprendre une argumentation", 'Arguments', 'u_b2_comm', 'B2', 'written', 'Thèse, preuves, concessions, failles ; organisation des textes.'),
  f('dialogue_b2', 'Dialogues naturels (B2)', 'Natural dialogues', 'u_b2_comm', 'B2', 'oral', 'Intentions, litotes, ironie légère, fermeté polie.'),
  f('register_b2', 'Choisir le bon registre', 'Register', 'u_b2_comm', 'B2', 'written', 'Familier, neutre, formel : adapter sa formulation.'),
  f('writing_b2', 'Rédaction B2', 'Writing', 'u_b2_comm', 'B2', 'written', "Essai d'opinion, réclamation, critique.", { selfAssessed: true }),
];

/** Ordre du parcours guidé B1 → B2 (grammaire, lexique et communication alternés). */
export const B2_GUIDED: string[] = [
  'past_perfect',
  'vocab_colloc_b2',
  'past_perfect_cont',
  'reading_b2',
  'future_perf_cont',
  'vocab_phrasal_b2',
  'third_conditional',
  'register_b2',
  'mixed_conditionals',
  'dialogue_b2',
  'wish_if_only',
  'vocab_idioms_b2',
  'modals_past',
  'argument_b2',
  'passive_advanced',
  'causative',
  'vocab_debate_b2',
  'reporting_verbs',
  'linking_contrast',
  'writing_b2',
];

export const ADVANCED_UNITS: AdvancedUnitSpec[] = [...B2_UNITS];
export const ADVANCED_SKILLS: AdvancedSkillSpec[] = [...B2_SKILLS];
export const ADVANCED_GUIDED: Record<Exclude<StageId, 'a2b1'>, string[]> = {
  b1b2: B2_GUIDED,
  b2c1: [],
  c1c2: [],
};
