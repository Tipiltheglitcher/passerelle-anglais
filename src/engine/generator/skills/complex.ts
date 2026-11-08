/**
 * Phrases complexes : connecteurs logiques, propositions relatives, passif,
 * discours indirect.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { lattice, latticeText, s, type Slot } from '@/engine/core/lattice';
import { capitalizeFirst, joinFrench, lowerFirst } from '@/engine/core/text';
import { NOUN_BY_ID } from '@/content/lexicon/nouns';
import { predicate } from '@/content/lexicon/predicates';
import { NAMES, PEOPLE, PRONOUNS, subjectPronounEn, subjectPronounFr } from '@/content/lexicon/subjects';
import { enVerb, frVerb } from '@/content/lexicon/verbs';
import type { Subject } from '@/content/lexicon/types';
import { realizeEn, realizeFr, type Clause, type Tense } from '../clause';
import { buildItem, clauseText, indicesByRole } from '../item';
import { lexemesOf, pickSubject, pickTime } from '../pick';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { objFor } from './future';

function words(text: string, role = 'w'): Slot[] {
  return text.split(' ').filter(Boolean).map((w) => s(w, { role, proper: w === 'I' || /^[A-Z]/.test(w) }));
}

function pronounVersion(s0: Subject): Subject {
  const en = subjectPronounEn(s0);
  return { ...s0, en, fr: subjectPronounFr(s0), pron: true, proper: en === 'I' };
}

const lowerSlots = (sl: Slot[]) => sl.map((x, i) => (i === 0 && !x.proper ? { ...x, alts: x.alts.map(lowerFirst) } : x));
const capSlots = (sl: Slot[]) => sl.map((x, i) => (i === 0 ? { ...x, alts: x.alts.map(capitalizeFirst), proper: true } : x));
const frBody = (c: Clause) => realizeFr(c).replace(/\.$/, '');
const frLower = (c: Clause) => (c.subj.proper && !c.subj.pron ? frBody(c) : lowerFirst(frBody(c)));

// ---------------------------------------------------------------------------
// Connecteurs

interface ClauseSpec {
  p: string;
  o?: string;
  neg?: boolean;
}

const CAUSES: [ClauseSpec, ClauseSpec][] = [
  [{ p: 'be_tired' }, { p: 'go_bed_early' }],
  [{ p: 'be_hungry' }, { p: 'cook_dish', o: 'sandwich' }],
  [{ p: 'miss_bus' }, { p: 'be_late' }],
  [{ p: 'be_ill' }, { p: 'stay_home' }],
  [{ p: 'have_exam' }, { p: 'study_hard' }],
  [{ p: 'forget_item', o: 'umbrella' }, { p: 'get_wet' }],
  [{ p: 'be_cold' }, { p: 'put_on_jumper' }],
  [{ p: 'be_late' }, { p: 'take_taxi' }],
  [{ p: 'be_thirsty' }, { p: 'drink', o: 'water' }],
  [{ p: 'have_time', neg: true }, { p: 'cook_dinner', neg: true }],
  [{ p: 'lose_item', o: 'key' }, { p: 'stay_home' }],
];

const CONTRASTS: [ClauseSpec, ClauseSpec][] = [
  [{ p: 'be_tired' }, { p: 'do_homework' }],
  [{ p: 'be_ill' }, { p: 'go_work' }],
  [{ p: 'study_hard' }, { p: 'pass_exam', neg: true }],
  [{ p: 'have_money' }, { p: 'buy_thing', o: 'car', neg: true }],
  [{ p: 'be_tired' }, { p: 'go_running' }],
  [{ p: 'be_cold' }, { p: 'go_swimming' }],
  [{ p: 'be_busy' }, { p: 'help_person', o: 'sister' }],
  [{ p: 'be_late' }, { p: 'hurry', neg: true }],
];

const CONNECTOR_FR: Record<string, string> = {
  so: 'donc',
  because: 'parce que',
  but: 'mais',
  although: 'même si',
  'even though': 'même si',
  however: 'cependant',
  'as a result': 'par conséquent',
};

export const connectors: ItemGenerator = (ctx) => {
  const contrast = ctx.rng.chance(0.5);
  const pair = ctx.rng.pick(contrast ? CONTRASTS : CAUSES);
  const pa = predicate(pair[0].p);
  const pb = predicate(pair[1].p);
  const subj = pickSubject(ctx, { pronouns: 0.5, adult: pa.adult || pb.adult });
  const a: Clause = { subj, pred: pa, obj: objFor(ctx, pa, pair[0].o), tense: 'pastSimple', neg: !!pair[0].neg };
  const pron = pronounVersion(subj);
  const b: Clause = { subj: pron, pred: pb, obj: objFor(ctx, pb, pair[1].o), tense: 'pastSimple', neg: !!pair[1].neg };
  if ((pa.obj && !a.obj) || (pb.obj && !b.obj)) return null;
  const options = contrast ? ['but', 'but', 'although', 'even though', 'however'] : ['so', 'so', 'because', 'because', 'as a result'];
  const conn = ctx.rng.pick(options.filter((o) => ctx.level === 'B1' || ['so', 'because', 'but'].includes(o)));
  const ra = realizeEn(a).slots;
  const rb = realizeEn(b).slots;
  let slots: Slot[];
  let fr: string;
  const connSlot = (txt: string, capital = false) => s(capital ? capitalizeFirst(txt) : txt, { role: 'conn', proper: capital });
  switch (conn) {
    case 'so':
    case 'but':
      slots = [...ra, s(',', { role: 'punct' }), connSlot(conn), ...lowerSlots(rb)];
      fr = joinFrench([`${frBody(a)}, ${CONNECTOR_FR[conn]} ${frLower(b)}`], '.');
      break;
    case 'because': {
      // B because A : « Emma went to bed early because she was tired. »
      const b2: Clause = { ...b, subj };
      const a2: Clause = { ...a, subj: pron };
      slots = [...realizeEn(b2).slots, connSlot('because'), ...lowerSlots(realizeEn(a2).slots)];
      fr = joinFrench([FR.frJoin([...frBody(b2).split(' '), 'parce', 'que', ...frLower(a2).split(' ')])], '.');
      break;
    }
    case 'although':
    case 'even though':
      slots = [connSlot(conn, true), ...lowerSlots(ra), s(',', { role: 'punct' }), ...lowerSlots(rb)];
      fr = joinFrench([`${FR.frJoin(['même', 'si', ...(subj.proper && !subj.pron ? frBody(a) : lowerFirst(frBody(a))).split(' ')])}, ${frLower(b)}`], '.');
      break;
    default:
      // however / as a result : deux phrases
      slots = [...ra, s('.', { role: 'punct' }), connSlot(conn, true), s(',', { role: 'punct' }), ...lowerSlots(rb)];
      fr = joinFrench([`${frBody(a)}. ${capitalizeFirst(CONNECTOR_FR[conn])}, ${frLower(b)}`], '.');
  }
  const wrong: Record<string, string[]> = {
    so: ['because', 'but', 'although'],
    but: ['so', 'because', 'and so'],
    because: ['so', 'but', 'although'],
    although: ['because', 'so', 'but'],
    'even though': ['because', 'so', 'despite'],
    however: ['because', 'so', 'although'],
    'as a result': ['however', 'although', 'because'],
  };
  const why: Record<string, string> = {
    so: 'so introduit la conséquence (« donc »).',
    because: 'because introduit la cause (« parce que »).',
    but: 'but exprime une opposition simple (« mais »).',
    although: 'although + proposition = « bien que / même si » (concession).',
    'even though': 'even though = although, en plus fort (« même si »).',
    however: 'however (« cependant ») commence une nouvelle phrase et est suivi d\'une virgule.',
    'as a result': 'as a result (« par conséquent ») introduit la conséquence, en début de phrase.',
  };
  return buildItem({
    skillId: 'connectors',
    templateId: `conn.${conn.replace(/ /g, '_')}`,
    level: ['so', 'because', 'but'].includes(conn) ? 'A2' : 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['conn'])],
    distractors: wrong[conn].map((w) => ({ text: ['although', 'even though', 'however', 'as a result'].includes(conn) ? capitalizeFirst(w) : w, tag: 'connector' })),
    explanation: why[conn],
    lexemes: [...lexemesOf({ subj, pred: pa }), `pred:${pb.id}`, `conn:${conn}`],
  });
};

// ---------------------------------------------------------------------------
// Propositions relatives

type Agr = (g: 'm' | 'f', pl: boolean) => string;
const agr = (base: string): Agr => (g, pl) => `${base}${g === 'f' ? 'e' : ''}${pl ? 's' : ''}`;

interface Head {
  en: string;
  enPl?: string;
  fr: string;
  g: 'm' | 'f';
  pl?: boolean;
  kind: 'person' | 'thing' | 'place';
}

const HEADS: Head[] = [
  { en: 'man', fr: 'homme', g: 'm', kind: 'person' },
  { en: 'woman', fr: 'femme', g: 'f', kind: 'person' },
  { en: 'girl', fr: 'fille', g: 'f', kind: 'person' },
  { en: 'boy', fr: 'garçon', g: 'm', kind: 'person' },
  { en: 'doctor', fr: 'médecin', g: 'm', kind: 'person' },
  { en: 'waiter', fr: 'serveur', g: 'm', kind: 'person' },
  { en: 'people', fr: 'gens', g: 'm', pl: true, kind: 'person' },
  { en: 'book', fr: 'livre', g: 'm', kind: 'thing' },
  { en: 'film', fr: 'film', g: 'm', kind: 'thing' },
  { en: 'car', fr: 'voiture', g: 'f', kind: 'thing' },
  { en: 'phone', fr: 'téléphone', g: 'm', kind: 'thing' },
  { en: 'cake', fr: 'gâteau', g: 'm', kind: 'thing' },
  { en: 'dress', fr: 'robe', g: 'f', kind: 'thing' },
  { en: 'photos', fr: 'photos', g: 'f', pl: true, kind: 'thing' },
  { en: 'restaurant', fr: 'restaurant', g: 'm', kind: 'place' },
  { en: 'hotel', fr: 'hôtel', g: 'm', kind: 'place' },
  { en: 'town', fr: 'ville', g: 'f', kind: 'place' },
  { en: 'house', fr: 'maison', g: 'f', kind: 'place' },
];

interface RelClause {
  type: 'subj' | 'obj' | 'where' | 'whose';
  for: Head['kind'][];
  en: string;
  enPl?: string;
  fr: Agr;
  frPl?: Agr;
  only?: string[];
}

const RCS: RelClause[] = [
  { type: 'subj', for: ['person'], en: 'lives next door', enPl: 'live next door', fr: () => 'qui habite à côté', frPl: () => 'qui habitent à côté' },
  { type: 'subj', for: ['person'], en: 'works at the hospital', enPl: 'work at the hospital', fr: () => "qui travaille à l'hôpital", frPl: () => "qui travaillent à l'hôpital" },
  { type: 'subj', for: ['person'], en: 'speaks five languages', enPl: 'speak five languages', fr: () => 'qui parle cinq langues', frPl: () => 'qui parlent cinq langues' },
  { type: 'subj', for: ['person'], en: 'won the competition', fr: () => 'qui a gagné le concours', frPl: () => 'qui ont gagné le concours' },
  { type: 'subj', for: ['person'], en: 'helped me yesterday', fr: () => "qui m'a aidé hier", frPl: () => "qui m'ont aidé hier" },
  { type: 'subj', for: ['thing'], en: 'costs fifty euros', enPl: 'cost fifty euros', fr: () => 'qui coûte cinquante euros', frPl: () => 'qui coûtent cinquante euros', only: ['book', 'phone', 'dress', 'cake'] },
  { type: 'subj', for: ['thing'], en: 'is on the table', enPl: 'are on the table', fr: () => 'qui est sur la table', frPl: () => 'qui sont sur la table', only: ['book', 'phone', 'cake', 'photos'] },
  { type: 'subj', for: ['thing'], en: 'won the prize', fr: () => 'qui a gagné le prix', only: ['book', 'film'] },
  { type: 'obj', for: ['person'], en: 'I met at the party', fr: (g, pl) => `que j'ai ${agr('rencontré')(g, pl)} à la fête` },
  { type: 'obj', for: ['person'], en: 'we saw yesterday', fr: (g, pl) => `que nous avons ${agr('vu')(g, pl)} hier` },
  { type: 'obj', for: ['thing'], en: 'I bought yesterday', fr: (g, pl) => `que j'ai ${agr('acheté')(g, pl)} hier`, only: ['book', 'car', 'phone', 'cake', 'dress'] },
  { type: 'obj', for: ['thing'], en: 'you recommended', fr: (g, pl) => `que tu m'as ${agr('recommandé')(g, pl)}`, only: ['book', 'film', 'phone'] },
  { type: 'obj', for: ['thing'], en: 'my parents gave me', fr: (g, pl) => `que mes parents m'ont ${agr('offert')(g, pl)}`, only: ['book', 'phone', 'dress', 'car'] },
  { type: 'obj', for: ['thing'], en: 'we watched last night', fr: (g, pl) => `que nous avons ${agr('regardé')(g, pl)} hier soir`, only: ['film'] },
  { type: 'obj', for: ['thing'], en: 'I took on holiday', fr: (g, pl) => `que j'ai ${agr('pris')(g, pl)} en vacances`, only: ['photos'] },
  { type: 'where', for: ['place'], en: 'we had dinner', fr: () => 'où nous avons dîné', only: ['restaurant', 'hotel', 'house'] },
  { type: 'where', for: ['place'], en: 'I was born', fr: () => 'où je suis né', only: ['town', 'house'] },
  { type: 'where', for: ['place'], en: 'we stayed last summer', fr: () => "où nous avons logé l'été dernier", only: ['hotel', 'town', 'house'] },
  { type: 'where', for: ['place'], en: 'my parents live', fr: () => 'où vivent mes parents', only: ['town', 'house'] },
  { type: 'whose', for: ['person'], en: 'son is a doctor', fr: () => 'dont le fils est médecin', only: ['man', 'woman'] },
  { type: 'whose', for: ['person'], en: 'car was stolen', fr: () => 'dont la voiture a été volée', only: ['man', 'woman'] },
];

interface MainFrame {
  pre: string;
  preFr: string;
  /** Préposition française qui se contracte avec l'article (penser à → au, à la). */
  frPrep?: 'à';
  post: string;
  postFr: Agr;
  for: Head['kind'][];
  only?: string[];
}

const MAINS: MainFrame[] = [
  { pre: 'I know the', preFr: 'je connais', post: '', postFr: () => '', for: ['person'] },
  { pre: 'I love the', preFr: "j'adore", post: '', postFr: () => '', for: ['thing', 'place'] },
  { pre: 'The', preFr: '', post: 'is very nice', postFr: () => 'est très sympa', for: ['person'] },
  { pre: 'The', preFr: '', post: 'was really expensive', postFr: (g) => `était vraiment ${g === 'f' ? 'chère' : 'cher'}`, for: ['thing'] },
  { pre: 'The', preFr: '', post: 'is very popular', postFr: () => 'est très populaire', for: ['place'], only: ['restaurant', 'hotel'] },
  { pre: 'I often think about the', preFr: 'je pense souvent', frPrep: 'à', post: '', postFr: () => '', for: ['place'] },
];

export const relativeClauses: ItemGenerator = (ctx) => {
  const rc = ctx.rng.pick(RCS);
  const heads = HEADS.filter((h) => rc.for.includes(h.kind) && (!rc.only || rc.only.includes(h.en)));
  if (!heads.length) return null;
  const head = ctx.rng.pick(heads);
  const mains = MAINS.filter((m) => m.for.includes(head.kind) && !(m.pre === 'The' && head.pl) && (!m.only || m.only.includes(head.en)));
  const main = ctx.rng.pick(mains);
  const pl = !!head.pl;
  const enRc = pl && rc.enPl ? rc.enPl : rc.en;
  const pronAlts =
    rc.type === 'subj'
      ? head.kind === 'person'
        ? ['who', 'that']
        : ['which', 'that']
      : rc.type === 'obj'
        ? head.kind === 'person'
          ? ['who', 'that', 'whom', '']
          : ['which', 'that', '']
        : rc.type === 'where'
          ? ['where']
          : ['whose'];
  const slots: Slot[] = [
    ...words(main.pre, 'pre'),
    s(head.en, { role: 'head' }),
    s(pronAlts, { role: 'rel' }),
    ...words(enRc, 'rc'),
    ...words(main.post, 'post'),
  ];
  if (main.pre === 'The') slots[0] = s('The', { role: 'pre', proper: true });
  const frHead = FR.frNP({ fr: head.fr, g: head.g }, 'def', { plural: pl, prep: main.frPrep ?? null });
  const frRcText = (pl && rc.frPl ? rc.frPl : rc.fr)(head.g, pl);
  const frWords = [...(main.preFr ? main.preFr.split(' ') : []), ...frHead, ...frRcText.split(' '), ...main.postFr(head.g, pl).split(' ').filter(Boolean)];
  const fr = joinFrench([FR.frJoin(frWords)], '.');
  const pool = ['who', 'which', 'where', 'whose', 'what'];
  const distractors: Distractor[] = pool
    .filter((p) => !pronAlts.includes(p))
    .map((p) => ({ text: p, tag: 'relative_pronoun' }));
  if (rc.type === 'whose') distractors.push({ text: "who's", tag: 'relative_pronoun' });
  const why: Record<RelClause['type'], string> = {
    subj: head.kind === 'person' ? 'Antécédent = personne, pronom sujet → who (ou that).' : 'Antécédent = chose, pronom sujet → which (ou that).',
    obj: `Pronom complément (« que ») : ${head.kind === 'person' ? 'who / that' : 'which / that'}, souvent omis à l'oral.`,
    where: 'Antécédent = lieu → where (« où »).',
    whose: 'Possession (« dont le / la ») → whose.',
  };
  return buildItem({
    skillId: 'relative_clauses',
    templateId: `rel.${rc.type}.${head.kind}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['rel'])],
    distractors: distractors.slice(0, 4),
    explanation: why[rc.type],
    lexemes: [`relhead:${head.en}`, `rc:${rc.en}`],
  });
};

// ---------------------------------------------------------------------------
// Passif

interface PassiveFact {
  en: [string, string, string];
  pp: string;
  be: 'was' | 'were' | 'is' | 'are';
  base: string;
  fr: string;
}

const FACTS: PassiveFact[] = [
  { en: ['The Mona Lisa', 'painted', 'by Leonardo da Vinci'], pp: 'painted', be: 'was', base: 'paint', fr: 'La Joconde a été peinte par Léonard de Vinci.' },
  { en: ['Romeo and Juliet', 'written', 'by Shakespeare'], pp: 'written', be: 'was', base: 'write', fr: 'Roméo et Juliette a été écrit par Shakespeare.' },
  { en: ['Penicillin', 'discovered', 'by Alexander Fleming'], pp: 'discovered', be: 'was', base: 'discover', fr: 'La pénicilline a été découverte par Alexander Fleming.' },
  { en: ['The Eiffel Tower', 'built', 'in 1889'], pp: 'built', be: 'was', base: 'build', fr: 'La tour Eiffel a été construite en 1889.' },
  { en: ['The Harry Potter books', 'written', 'by J. K. Rowling'], pp: 'written', be: 'were', base: 'write', fr: 'Les livres Harry Potter ont été écrits par J. K. Rowling.' },
  { en: ['Paper', 'invented', 'in China'], pp: 'invented', be: 'was', base: 'invent', fr: 'Le papier a été inventé en Chine.' },
  { en: ['The 2024 Olympic Games', 'held', 'in Paris'], pp: 'held', be: 'were', base: 'hold', fr: 'Les Jeux olympiques de 2024 ont eu lieu à Paris.' },
  { en: ['Spanish', 'spoken', 'in Mexico'], pp: 'spoken', be: 'is', base: 'speak', fr: "L'espagnol est parlé au Mexique." },
  { en: ['Portuguese', 'spoken', 'in Brazil'], pp: 'spoken', be: 'is', base: 'speak', fr: 'Le portugais est parlé au Brésil.' },
  { en: ['Coffee', 'grown', 'in Brazil and Colombia'], pp: 'grown', be: 'is', base: 'grow', fr: 'Le café est cultivé au Brésil et en Colombie.' },
  { en: ['Tea', 'grown', 'in India and China'], pp: 'grown', be: 'is', base: 'grow', fr: 'Le thé est cultivé en Inde et en Chine.' },
  { en: ['The letters', 'delivered', 'every morning'], pp: 'delivered', be: 'are', base: 'deliver', fr: 'Les lettres sont distribuées tous les matins.' },
  { en: ['These shoes', 'made', 'in Italy'], pp: 'made', be: 'are', base: 'make', fr: 'Ces chaussures sont fabriquées en Italie.' },
  { en: ['English', 'spoken', 'all over the world'], pp: 'spoken', be: 'is', base: 'speak', fr: "L'anglais est parlé dans le monde entier." },
];

const PASSIVE_PREDS: { pred: string; nouns: string[]; frPp?: string }[] = [
  { pred: 'clean_room', nouns: ['kitchen', 'bathroom', 'bedroom', 'living_room'] },
  { pred: 'paint_room', nouns: ['kitchen', 'bedroom', 'bathroom'] },
  { pred: 'repair_thing', nouns: ['bike', 'car', 'computer', 'washing_machine'] },
  { pred: 'break_thing', nouns: ['window', 'lamp', 'camera'] },
  { pred: 'sell_thing', nouns: ['car', 'house', 'bike'] },
  { pred: 'write', nouns: ['letter', 'email', 'story', 'poem'] },
  { pred: 'cook_dish', nouns: ['cake', 'pizza', 'salad'] },
  { pred: 'send_message', nouns: ['email', 'letter', 'postcard', 'message'] },
];

function passiveFact(ctx: GenContext) {
  const f = ctx.rng.pick(FACTS);
  const slots: Slot[] = [s(f.en[0], { role: 'subj', proper: true }), s(f.be, { role: 'be' }), s(f.pp, { role: 'pp' }), ...words(f.en[2], 'post')];
  const v = enVerb(f.base);
  const wrongBe = f.be === 'was' ? 'were' : f.be === 'were' ? 'was' : f.be === 'is' ? 'are' : 'is';
  return buildItem({
    skillId: 'passive',
    templateId: `pass.fact.${f.be}`,
    level: 'B1',
    slots,
    end: '.',
    fr: f.fr,
    blankGroups: [indicesByRole(slots, ['be', 'pp'])],
    hints: [f.base],
    distractors: [
      { text: `${f.be} ${v.base}`, tag: 'passive_form' },
      { text: `${wrongBe} ${f.pp}`, tag: 'passive_form' },
      { text: EN.pastSimple(v), tag: 'passive_form' },
      { text: `has ${f.pp}`, tag: 'passive_form' },
    ],
    explanation: `Passif : be (${f.be}) + participe passé (${f.pp}). On insiste sur ce qui subit l'action ; l'auteur est introduit par by.`,
    lexemes: [`fact:${f.en[0]}`],
  });
}

export const passive: ItemGenerator = (ctx) => {
  if (ctx.rng.chance(0.35)) return passiveFact(ctx);
  const pp = ctx.rng.pick(PASSIVE_PREDS);
  const pred = predicate(pp.pred);
  if (ctx.level === 'A2' && pred.lv === 'B1') return null;
  const nounId = ctx.rng.pick(pp.nouns);
  const noun = NOUN_BY_ID[nounId];
  if (!noun) return null;
  const v = enVerb(pred.v);
  const fv = frVerb(pred.fv);
  const past = !['clean_room', 'send_message'].includes(pp.pred) || ctx.rng.chance(0.6);
  const plural = !noun.u && !noun.po && ctx.rng.chance(0.25);
  const nEn = plural ? EN.pluralize(noun.en) : noun.en;
  const det = ctx.rng.pick(['The', 'My', 'Our']);
  const be = past ? (plural ? 'were' : 'was') : plural ? 'are' : 'is';
  const ppEn = EN.ppForms(v)[0];
  const withAgent = past && ctx.rng.chance(0.5);
  const agent = withAgent ? ctx.rng.pick([...NAMES, ...PEOPLE.filter((p) => !p.pron)]) : null;
  const time = past ? (withAgent ? null : pickTime(ctx, ['past'])) : pickTime(ctx, ['habit'], (t) => ['every_day', 'every_week', 'every_morning', 'twice_week', 'once_month'].includes(t.id));
  const slots: Slot[] = [
    s(det, { role: 'det', proper: true }),
    s([nEn, ...noun.syn.map((x) => (plural ? EN.pluralize(x) : x))], { role: 'obj' }),
    s(be, { role: 'be' }),
    s(EN.ppForms(v), { role: 'pp' }),
    ...(agent ? [s('by', { role: 'by' }), s(agent.en, { role: 'agent', proper: !!agent.proper })] : []),
    ...(time ? [s([time.en, ...(time.alts ?? [])], { role: 'time' })] : []),
  ];
  const frN = { fr: noun.fr, g: noun.g, pl: noun.fpl };
  const frSubj = det === 'The' ? FR.frNP(frN, 'def', { plural }) : FR.frNP(frN, 'poss', { plural, possessor: { person: det === 'My' ? 0 : 3 } });
  const etre = past ? ['a', 'été'] : ['est'];
  if (plural) etre[0] = past ? 'ont' : 'sont';
  const frPp = FR.participle(fv, noun.g, plural || !!noun.fpo);
  const fr = joinFrench([FR.frJoin([...frSubj, ...etre, frPp, ...(agent ? ['par', ...agent.fr.split(' ')] : []), ...(time ? [time.fr] : [])])], '.');
  const wrongBe = be === 'was' ? 'were' : be === 'were' ? 'was' : be === 'is' ? 'are' : 'is';
  // phrase active de départ (transformation)
  const someone: Subject = { id: 'someone', en: 'someone', fr: "quelqu'un", person: 3, num: 'sg', g: 'm' };
  const activeSubj: Subject = agent ?? someone;
  const active: Clause = {
    subj: activeSubj,
    pred: { ...pred, obj: undefined, tail: `${det.toLowerCase()} ${nEn}` },
    tense: past ? 'pastSimple' : 'presSimple',
    time: time ?? undefined,
  };
  let activeText = '';
  try {
    activeText = clauseText(active);
  } catch {
    activeText = '';
  }
  const targetLattice = lattice(slots.map((x) => ({ ...x })), '.');
  return buildItem({
    skillId: 'passive',
    templateId: `pass.${past ? 'past' : 'present'}.${agent ? 'agent' : 'noagent'}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['be', 'pp'])],
    hints: [v.base],
    distractors: [
      { text: `${be} ${v.base}`, tag: 'passive_form' },
      { text: `${wrongBe} ${ppEn}`, tag: 'passive_form' },
      { text: past ? `is ${ppEn}` : `was ${ppEn}`, tag: 'tense_past' },
      { text: `has ${ppEn}`, tag: 'passive_form' },
    ],
    transform: activeText
      ? {
          instruction: agent ? 'Mettez la phrase au passif (avec by).' : 'Mettez la phrase au passif (sans complément d\'agent).',
          source: activeText,
          target: { lattices: [targetLattice] },
          targetText: latticeText(targetLattice),
        }
      : undefined,
    explanation: `Passif ${past ? 'au prétérit' : 'au présent'} : ${be} + participe passé (${v.base} → ${ppEn}).${agent ? ' L\'auteur de l\'action est introduit par by.' : ''}`,
    lexemes: [`noun:${noun.id}`, `pred:${pred.id}`, `verb:${pred.v}`],
  });
};

// ---------------------------------------------------------------------------
// Discours indirect

const BACKSHIFT: Partial<Record<Tense, { to: Tense; fr: FR.FrTense | null; label: string }>> = {
  presSimple: { to: 'pastSimple', fr: 'imparfait', label: 'présent simple → prétérit' },
  presCont: { to: 'pastCont', fr: 'imparfait', label: 'présent continu → past continuous' },
  will: { to: 'would', fr: null, label: 'will → would' },
  can: { to: 'could', fr: null, label: 'can → could' },
};

export const reportedSpeech: ItemGenerator = (ctx) => {
  const speaker = ctx.rng.pick([...NAMES, ...PRONOUNS.filter((p) => p.id === 'he' || p.id === 'she')]);
  const direct = ctx.rng.pick(['presSimple', 'presSimple', 'presCont', 'will', 'can'] as const);
  const shift = BACKSHIFT[direct]!;
  const i = PRONOUNS.find((p) => p.id === (speaker.g === 'f' ? 'i_f' : 'i'))!;
  const parts = (() => {
    for (let k = 0; k < 10; k++) {
      const byTense: Record<string, string[]> = {
        presSimple: ['be_tired', 'be_hungry', 'be_busy', 'be_ready', 'live_city', 'like_food', 'speak_language', 'be_home', 'be_late'],
        presCont: ['work_late', 'cook_dinner', 'tidy_room', 'go_cinema', 'visit_family', 'do_homework', 'wait_for_bus'],
        will: ['call_person', 'help_person', 'visit_family', 'tidy_room', 'cook_dinner', 'go_cinema', 'do_shopping', 'be_late'],
        can: ['swim', 'drive', 'speak_language', 'help_person', 'cook_dinner', 'play_instrument'],
      };
      const pred = ctx.rng.pick(byTense[direct]);
      const p = predicate(pred);
      const o = objFor(ctx, p);
      if (p.obj && !o) continue;
      return { pred: p, obj: o };
    }
    return null;
  })();
  if (!parts) return null;
  const sense = parts.pred.skill ? 'ability' : 'permission';
  const directClause: Clause = { subj: i, pred: parts.pred, obj: parts.obj, tense: direct, modalSense: sense };
  const directText = clauseText(directClause);
  const pron = pronounVersion(speaker);
  const reported: Clause = { subj: pron, pred: parts.pred, obj: parts.obj, tense: shift.to, modalSense: sense, ...(shift.fr ? { frTense: shift.fr } : {}) };
  const useTell = ctx.rng.chance(0.4);
  const r = realizeEn(reported);
  const vSlots = r.slots.map((x) => ({ ...x, role: x.role === 'aux' || x.role === 'verb' ? `r_${x.role}` : x.role }));
  const mode = ctx.rng.pick(['verb', 'verb', 'saytell'] as const);
  const slots: Slot[] = [
    s(speaker.en, { role: 'speaker', proper: !!speaker.proper || true }),
    ...(useTell ? [s('told', { role: 'say' }), s('me', { role: 'me' })] : [s('said', { role: 'say' })]),
    s(['that', ''], { role: 'that' }),
    ...lowerSlots(vSlots),
  ];
  const frSay = useTell ? ["m'a", 'dit'] : ['a', 'dit'];
  const frRep = frLower(reported);
  const fr = joinFrench([FR.frJoin([speaker.fr, ...frSay, 'que', ...frRep.split(' ')])], '.');
  const v = enVerb(parts.pred.v);
  const distractors: Distractor[] =
    mode === 'saytell'
      ? useTell
        ? [{ text: 'said', tag: 'say_tell' }, { text: 'talked', tag: 'say_tell' }, { text: 'spoke', tag: 'say_tell' }]
        : [{ text: 'told', tag: 'say_tell' }, { text: 'talked', tag: 'say_tell' }, { text: 'spoke', tag: 'say_tell' }]
      : [
          {
            text: (() => {
              const g = realizeEn({ ...reported, tense: direct }).slots.filter((x) => x.role === 'aux' || x.role === 'verb').map((x) => x.alts[0]).join(' ');
              return g;
            })(),
            tag: 'reported_speech',
          },
          { text: direct === 'will' ? `will ${v.base}` : direct === 'can' ? `can ${v.base}` : `has ${EN.ppForms(v)[0]}`, tag: 'reported_speech' },
        ];
  return buildItem({
    skillId: 'reported_speech',
    templateId: `rep.${direct}.${mode}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [mode === 'saytell' ? indicesByRole(slots, ['say']) : indicesByRole(slots, ['r_aux', 'r_verb'])],
    hints: [mode === 'saytell' ? undefined : parts.pred.v === 'be' ? 'be' : v.base],
    distractors,
    context: `“${directText.replace(/\.$/, '')},” ${speaker.en} said.`,
    transform: {
      instruction: `Rapporte ces paroles au discours indirect : « ${speaker.en} said (that)… »`,
      source: `"${directText}"`,
      target: { lattices: [lattice(slots, '.')] },
      targetText: latticeText(lattice(slots, '.')),
    },
    explanation:
      mode === 'saytell'
        ? useTell
          ? 'tell est suivi de la personne à qui l\'on parle : told me / told him (said me est incorrect).'
          : 'say s\'emploie sans complément de personne : She said (that)… (✗ she said me).'
        : `Discours indirect au passé : on recule le temps (${shift.label}) et on adapte les pronoms (I → ${pron.en}).`,
    lexemes: [...lexemesOf({ subj: speaker, pred: parts.pred, obj: parts.obj }), `rep:${direct}`],
  });
};

export { lowerFirst, capSlots };
