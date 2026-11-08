/**
 * Curriculum A2 → B1 : unités ordonnées, compétences, prérequis.
 * L'ordre suit une progression classique du CECRL : on consolide le présent et
 * le passé (A2), puis on aborde le futur, les modaux, le present perfect et
 * les structures complexes (B1).
 */
import type { Level } from './lexicon/types';
import { VOCAB_THEMES } from './vocabulary';

export type SkillKind = 'grammar' | 'vocab' | 'function';

export interface SkillDef {
  id: string;
  title: string;
  /** Intitulé anglais court. */
  en: string;
  unit: string;
  level: Level;
  kind: SkillKind;
  prereq: string[];
  /** Description courte (une ligne). */
  summary: string;
}

export interface UnitDef {
  id: string;
  title: string;
  subtitle: string;
  level: Level;
  icon: string;
  skills: string[];
  kind: SkillKind;
}

const G = (id: string, title: string, en: string, unit: string, level: Level, prereq: string[], summary: string): SkillDef => ({
  id,
  title,
  en,
  unit,
  level,
  kind: 'grammar',
  prereq,
  summary,
});

export const GRAMMAR_SKILLS: SkillDef[] = [
  G('present_simple', 'Le présent simple', 'Present simple', 'u_present', 'A2', [], 'Habitudes et vérités générales ; le -s de la 3ᵉ personne.'),
  G('present_simple_neg_q', 'Négation et questions au présent', "Don't / doesn't, Do…?", 'u_present', 'A2', ['present_simple'], 'do / does pour nier et interroger.'),
  G('frequency_adverbs', 'Les adverbes de fréquence', 'Always, usually, often…', 'u_present', 'A2', ['present_simple'], 'Leur sens et leur place dans la phrase.'),
  G('present_continuous', 'Le présent continu', 'Present continuous', 'u_present', 'A2', ['present_simple'], 'be + -ing pour une action en cours.'),
  G('simple_vs_continuous', 'Présent simple ou continu ?', 'Simple vs continuous', 'u_present', 'A2', ['present_continuous', 'present_simple_neg_q'], 'Choisir le bon présent ; les verbes d\'état.'),
  G('past_simple_regular', 'Le prétérit des verbes réguliers', 'Past simple: -ed', 'u_past', 'A2', ['present_simple'], 'Formation et orthographe de -ed.'),
  G('past_simple_irregular', 'Les verbes irréguliers au prétérit', 'Irregular verbs', 'u_past', 'A2', ['past_simple_regular'], 'went, bought, saw… les formes à connaître.'),
  G('past_simple_neg_q', 'Négation et questions au prétérit', "Didn't, Did…?", 'u_past', 'A2', ['past_simple_irregular', 'present_simple_neg_q'], 'did / didn\'t + base verbale.'),
  G('was_were', 'Was / were', 'Past of be', 'u_past', 'A2', ['past_simple_regular'], 'Le passé du verbe be.'),
  G('past_continuous', 'Le past continuous', 'Past continuous', 'u_past', 'A2', ['present_continuous', 'past_simple_irregular'], 'Action en cours dans le passé ; when / while.'),
  G('wh_questions', 'Les questions ouvertes', 'Wh- questions', 'u_questions', 'A2', ['present_simple_neg_q'], 'What, where, when, how often… et l\'ordre des mots.'),
  G('short_answers', 'Les réponses courtes', 'Short answers', 'u_questions', 'A2', ['present_simple_neg_q'], 'Yes, I do. / No, she isn\'t.'),
  G('articles', 'Les articles a, an, the, ∅', 'Articles', 'u_nouns', 'A2', [], 'a/an selon le son, the, et l\'absence d\'article.'),
  G('countable_quantifiers', 'Dénombrables et quantifieurs', 'Some, any, much, many…', 'u_nouns', 'A2', ['articles'], 'some/any, much/many, a few/a little.'),
  G('there_is_are', 'There is / there are', 'There is / are', 'u_nouns', 'A2', ['countable_quantifiers'], '« Il y a » au présent, passé et futur.'),
  G('pronouns_possessives', 'Pronoms et possessifs', 'Pronouns & possessives', 'u_nouns', 'A2', [], 'him/her, his/her, mine, Tom\'s…'),
  G('comparatives', 'Le comparatif', 'Comparatives', 'u_compare', 'A2', [], '-er / more … than, et les irréguliers.'),
  G('superlatives', 'Le superlatif', 'Superlatives', 'u_compare', 'A2', ['comparatives'], 'the -est / the most.'),
  G('prepositions_time', 'Prépositions de temps', 'At, on, in (time)', 'u_prepositions', 'A2', [], 'at 7, on Monday, in July…'),
  G('prepositions_place', 'Prépositions de lieu', 'In, on, under, next to…', 'u_prepositions', 'A2', [], 'Situer un objet ou un lieu.'),
  G('future_will', 'Le futur avec will', 'Will', 'u_future', 'A2', ['present_simple'], 'Prédictions, décisions, promesses.'),
  G('going_to', 'Be going to', 'Going to', 'u_future', 'A2', ['present_continuous'], 'Projets et prédictions évidentes.'),
  G('future_forms', 'Choisir la forme du futur', 'Future forms', 'u_future', 'B1', ['future_will', 'going_to'], 'will, going to, présent continu ou présent simple ?'),
  G('can_could', 'Can / could', 'Can, could', 'u_modals', 'A2', ['present_simple'], 'Capacité, permission, demande polie.'),
  G('must_have_to', 'Must / have to', 'Obligation', 'u_modals', 'A2', ['can_could'], 'Obligation ; mustn\'t ≠ don\'t have to.'),
  G('should', 'Should (conseil)', 'Should', 'u_modals', 'A2', ['can_could'], 'Donner un conseil.'),
  G('requests_offers', 'Demandes et propositions', 'Requests & offers', 'u_modals', 'A2', ['can_could'], 'Could you…? Would you like…? Shall I…?'),
  G('might_may', 'Might / may', 'Possibility', 'u_modals', 'B1', ['should'], 'Exprimer une possibilité.'),
  G('pp_experience', 'Present perfect : l\'expérience', 'Ever, never, been', 'u_perfect', 'A2', ['past_simple_irregular'], 'Have you ever…? I\'ve never…'),
  G('pp_just_already_yet', 'Just, already, yet', 'Just / already / yet', 'u_perfect', 'B1', ['pp_experience'], 'Résultat présent d\'une action passée.'),
  G('pp_for_since', 'For et since', 'For / since', 'u_perfect', 'B1', ['pp_experience'], 'Une durée qui continue jusqu\'à maintenant.'),
  G('pp_vs_past', 'Present perfect ou prétérit ?', 'PP vs past simple', 'u_perfect', 'B1', ['pp_just_already_yet', 'pp_for_since'], 'Moment daté ou lien avec le présent ?'),
  G('gerund_infinitive', 'Verbe + -ing ou to + infinitif', 'Gerund or infinitive', 'u_verbs', 'B1', ['present_simple'], 'enjoy doing / decide to do.'),
  G('used_to', 'Used to', 'Used to', 'u_verbs', 'B1', ['past_simple_neg_q'], 'Habitudes passées révolues.'),
  G('adverbs_manner', 'Les adverbes de manière', 'Adverbs of manner', 'u_verbs', 'B1', ['comparatives'], 'quickly, carefully, well…'),
  G('ed_ing_adjectives', 'Adjectifs en -ed / -ing', '-ed / -ing adjectives', 'u_verbs', 'B1', [], 'bored / boring, interested / interesting.'),
  G('as_as_too_enough', 'As … as, too, enough', 'As…as, too, enough', 'u_verbs', 'B1', ['comparatives'], 'Égalité, excès, suffisance.'),
  G('zero_conditional', 'Le conditionnel de type 0', 'Zero conditional', 'u_conditionals', 'A2', ['present_simple'], 'Vérités générales : If + présent, présent.'),
  G('first_conditional', 'Le conditionnel de type 1', 'First conditional', 'u_conditionals', 'B1', ['zero_conditional', 'future_will'], 'If + présent, will + base.'),
  G('time_clauses', 'When, as soon as + présent', 'Time clauses', 'u_conditionals', 'B1', ['first_conditional'], 'Pas de will après when.'),
  G('second_conditional', 'Le conditionnel de type 2', 'Second conditional', 'u_conditionals', 'B1', ['first_conditional', 'past_simple_irregular'], 'If + prétérit, would + base.'),
  G('connectors', 'Les connecteurs logiques', 'Linking words', 'u_complex', 'A2', ['past_simple_irregular'], 'because, so, but, although, however…'),
  G('relative_clauses', 'Les propositions relatives', 'Relative clauses', 'u_complex', 'B1', ['connectors'], 'who, which, that, where, whose.'),
  G('subject_questions', 'Questions sur le sujet', 'Subject questions', 'u_complex', 'B1', ['wh_questions', 'past_simple_neg_q'], 'Who called? vs Who did you call?'),
  G('question_tags', 'Les question tags', 'Question tags', 'u_complex', 'B1', ['short_answers'], '…, isn\'t it? …, don\'t you?'),
  G('passive', 'La voix passive', 'The passive', 'u_complex', 'B1', ['pp_experience'], 'be + participe passé.'),
  G('reported_speech', 'Le discours indirect', 'Reported speech', 'u_complex', 'B1', ['past_continuous', 'future_will'], 'She said (that)…'),
];

export const GRAMMAR_UNITS: UnitDef[] = [
  { id: 'u_present', title: 'Le présent', subtitle: 'Habitudes et actions en cours', level: 'A2', icon: 'clock', kind: 'grammar', skills: [] },
  { id: 'u_past', title: 'Raconter au passé', subtitle: 'Prétérit et past continuous', level: 'A2', icon: 'history', kind: 'grammar', skills: [] },
  { id: 'u_questions', title: 'Poser des questions', subtitle: 'Questions ouvertes et réponses courtes', level: 'A2', icon: 'help', kind: 'grammar', skills: [] },
  { id: 'u_nouns', title: 'Noms et déterminants', subtitle: 'Articles, quantités, possessifs', level: 'A2', icon: 'box', kind: 'grammar', skills: [] },
  { id: 'u_compare', title: 'Comparer', subtitle: 'Comparatifs et superlatifs', level: 'A2', icon: 'scale', kind: 'grammar', skills: [] },
  { id: 'u_prepositions', title: 'Le temps et le lieu', subtitle: 'Prépositions essentielles', level: 'A2', icon: 'map', kind: 'grammar', skills: [] },
  { id: 'u_future', title: 'Parler du futur', subtitle: 'will, going to et les autres formes', level: 'A2', icon: 'rocket', kind: 'grammar', skills: [] },
  { id: 'u_modals', title: 'Les verbes modaux', subtitle: 'Capacité, obligation, conseil, politesse', level: 'A2', icon: 'key', kind: 'grammar', skills: [] },
  { id: 'u_perfect', title: 'Le present perfect', subtitle: 'Expérience, résultat, durée', level: 'B1', icon: 'link', kind: 'grammar', skills: [] },
  { id: 'u_verbs', title: 'Enrichir ses phrases', subtitle: 'Verbes, adverbes et adjectifs', level: 'B1', icon: 'wand', kind: 'grammar', skills: [] },
  { id: 'u_conditionals', title: 'Hypothèses et conditions', subtitle: 'if, when, as soon as', level: 'B1', icon: 'split', kind: 'grammar', skills: [] },
  { id: 'u_complex', title: 'Phrases complexes', subtitle: 'Connecteurs, relatives, passif, discours indirect', level: 'B1', icon: 'layers', kind: 'grammar', skills: [] },
];

for (const u of GRAMMAR_UNITS) u.skills = GRAMMAR_SKILLS.filter((s) => s.unit === u.id).map((s) => s.id);

/** Thèmes de vocabulaire : une compétence par thème. */
const B1_THEMES = new Set(['professional', 'idioms', 'phrasal', 'falsefriends']);

export const VOCAB_SKILLS: SkillDef[] = VOCAB_THEMES.map((t) => ({
  id: `vocab_${t.id}`,
  title: t.title,
  en: t.title,
  unit: 'u_vocab',
  level: B1_THEMES.has(t.id) ? 'B1' : 'A2',
  kind: 'vocab' as const,
  prereq: [],
  summary: `${t.items.length} mots et expressions`,
}));

export const VOCAB_UNIT: UnitDef = {
  id: 'u_vocab',
  title: 'Vocabulaire thématique',
  subtitle: 'Mots, expressions, phrasal verbs et faux amis',
  level: 'A2',
  icon: 'book',
  kind: 'vocab',
  skills: VOCAB_SKILLS.map((s) => s.id),
};

/** Compétences de communication (compréhension écrite, orale, dialogues). */
export const COMM_SKILLS: SkillDef[] = [
  { id: 'reading', title: 'Compréhension écrite', en: 'Reading', unit: 'u_skills', level: 'A2', kind: 'function', prereq: [], summary: 'Profils, récits, e-mails et annonces.' },
  { id: 'listening', title: 'Compréhension orale', en: 'Listening', unit: 'u_skills', level: 'A2', kind: 'function', prereq: [], summary: 'Annonces, messages vocaux, météo.' },
  { id: 'dialogues', title: 'Dialogues du quotidien', en: 'Everyday dialogues', unit: 'u_skills', level: 'A2', kind: 'function', prereq: [], summary: 'Café, hôtel, magasin, médecin, téléphone…' },
];

export const COMM_UNIT: UnitDef = {
  id: 'u_skills',
  title: 'Communiquer',
  subtitle: 'Lire, écouter et dialoguer',
  level: 'A2',
  icon: 'chat',
  kind: 'function',
  skills: COMM_SKILLS.map((s) => s.id),
};

export const ALL_SKILLS: SkillDef[] = [...GRAMMAR_SKILLS, ...VOCAB_SKILLS, ...COMM_SKILLS];
export const SKILL_BY_ID: Record<string, SkillDef> = Object.fromEntries(ALL_SKILLS.map((s) => [s.id, s]));
export const ALL_UNITS: UnitDef[] = [...GRAMMAR_UNITS, COMM_UNIT, VOCAB_UNIT];
export const UNIT_BY_ID: Record<string, UnitDef> = Object.fromEntries(ALL_UNITS.map((u) => [u.id, u]));

export function skillDef(id: string): SkillDef {
  const s = SKILL_BY_ID[id];
  if (!s) throw new Error(`Compétence inconnue : ${id}`);
  return s;
}

/** Ordre global du parcours guidé (grammaire puis vocabulaire entrelacé). */
export const GUIDED_ORDER: string[] = GRAMMAR_UNITS.flatMap((u) => u.skills);
