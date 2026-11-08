/**
 * Futur : will, be going to, choix de la forme selon le contexte, présent
 * après when / as soon as (propositions de temps).
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench, lowerFirst } from '@/engine/core/text';
import { ACCIDENTS, BARE_SKILLS, FUTURE_STATES, predicate } from '@/content/lexicon/predicates';
import { NOUN_BY_ID } from '@/content/lexicon/nouns';
import type { Predicate } from '@/content/lexicon/types';
import { subjectPronounEn, subjectPronounFr } from '@/content/lexicon/subjects';
import { realizeEn, realizeFr, type Clause, type ObjChoice } from '../clause';
import { buildItem, clauseAnswers, clauseItem, clauseText, indicesByRole } from '../item';
import { lexemesOf, pickObject, pickTime, pickTimeFor } from '../pick';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { cap, chooseParts, mutate, pn, verbOf } from './common';

function words(text: string, role = 'w'): Slot[] {
  return text.split(' ').map((w) => s(w, { role, proper: w === 'I' || /^[A-Z]/.test(w) }));
}

interface Weather {
  id: string;
  base: string;
  /** Formes : will, going to, présent continu, could. */
  will: [string, string];
  goingTo: [string, string];
}

const WEATHER: Weather[] = [
  { id: 'rain', base: 'rain', will: ['will rain', 'il pleuvra'], goingTo: ['is going to rain', 'il va pleuvoir'] },
  { id: 'snow', base: 'snow', will: ['will snow', 'il neigera'], goingTo: ['is going to snow', 'il va neiger'] },
  { id: 'sunny', base: 'be', will: ['will be sunny', 'il fera beau'], goingTo: ['is going to be sunny', 'il va faire beau'] },
  { id: 'cold', base: 'be', will: ['will be cold', 'il fera froid'], goingTo: ['is going to be cold', 'il va faire froid'] },
  { id: 'hot', base: 'be', will: ['will be hot', 'il fera chaud'], goingTo: ['is going to be hot', 'il va faire chaud'] },
];

function weatherWill(ctx: GenContext) {
  const w = ctx.rng.pick(WEATHER);
  const time = pickTime(ctx, ['future']);
  const verb = w.will[0].split(' ').slice(1).join(' ');
  const slots: Slot[] = [...words('I think it', 'pre'), s(w.will[0], { role: 'vp' }), s(time.en, { role: 'time' })];
  const rest = w.base === 'be' ? verb.replace(/^be /, '') : '';
  return buildItem({
    skillId: 'future_will',
    templateId: `will.weather.${w.id}`,
    level: 'A2',
    slots,
    end: '.',
    fr: joinFrench([FR.frJoin(['je', 'pense', 'que', ...w.will[1].split(' '), time.fr])], '.'),
    blankGroups: [indicesByRole(slots, ['vp'])],
    hints: [w.base === 'be' ? `be ${rest}` : w.base],
    distractors: [
      { text: `will to ${verb}`, tag: 'will_to' },
      { text: w.base === 'be' ? `will is ${rest}` : `will ${w.base}s`, tag: 'will_inflected' },
      { text: w.base === 'be' ? `is ${rest}` : `${w.base}s`, tag: 'future_choice' },
    ],
    explanation: `Prédiction (opinion : I think) → will + base verbale : it ${w.will[0]}.`,
    lexemes: [`weather:${w.id}`, `time:${time.id}`],
  });
}

export const futureWill: ItemGenerator = (ctx) => {
  if (ctx.rng.chance(0.2)) return weatherWill(ctx);
  const mode = ctx.rng.pick(['aff', 'neg', 'yn', 'think'] as const);
  const parts = chooseParts(ctx, (p) => !p.routine && (p.k !== 'state' || FUTURE_STATES.has(p.id)) && !BARE_SKILLS.has(p.id) && !ACCIDENTS.has(p.id), mode === 'yn' ? { exclude: ['i', 'i_f'] } : mode === 'think' ? { exclude: ['i', 'i_f'] } : {});
  if (!parts) return null;
  const c: Clause = { ...parts, tense: 'will', time: pickTimeFor(ctx, 'future', parts.pred), neg: mode === 'neg', form: mode === 'yn' ? 'yn' : 'decl' };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const distractors: Distractor[] =
    mode === 'neg'
      ? [
          { text: `don't ${v.base}`, tag: 'future_choice' },
          { text: `won't to ${v.base}`, tag: 'will_to' },
          { text: `won't ${EN.presentSimple(v, 3, 'sg')}`, tag: 'will_inflected' },
          { text: `willn't ${v.base}`, tag: 'will_inflected' },
        ]
      : [
          { text: `will to ${v.base}`, tag: 'will_to' },
          { text: `will ${EN.presentSimple(v, 3, 'sg')}`, tag: 'will_inflected' },
          { text: `will ${EN.pastSimple(v, p, n)}`, tag: 'will_inflected' },
          { text: EN.presentSimple(v, p, n), tag: 'future_choice' },
        ];
  if (mode === 'think') {
    const r = realizeEn(c);
    const slots: Slot[] = [...words('I think', 'pre'), ...r.slots.map((sl, i) => (i === 0 && !c.subj.proper ? { ...sl, alts: sl.alts.map((a) => lowerFirst(a)) } : sl))];
    const frClause = realizeFr(c).replace(/\.$/, '');
    const frBody = c.subj.proper && !c.subj.pron ? frClause : lowerFirst(frClause);
    return buildItem({
      skillId: 'future_will',
      templateId: 'will.think',
      level: 'A2',
      slots,
      end: '.',
      fr: joinFrench([FR.frJoin(['je', 'pense', 'que', ...frBody.split(' ')])], '.'),
      blankGroups: [indicesByRole(slots, ['aux', 'verb'])],
      hints: [v.base],
      distractors,
      explanation: `Prédiction ou opinion sur l'avenir (I think…) → will + base verbale : will ${v.base}.`,
      lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj, time: c.time }),
    });
  }
  return clauseItem({
    skillId: 'future_will',
    templateId: `will.${mode}`,
    level: 'A2',
    clause: c,
    blankRoles: mode === 'yn' ? [['aux'], ['verb']] : [['aux', 'verb']],
    hints: mode === 'yn' ? [undefined, v.base] : [mode === 'neg' ? `not / ${v.base}` : v.base],
    distractors: mode === 'yn' ? [] : distractors,
    neighbours: mutate(ctx, c, ['subj', 'neg', { tense: 'goingTo' }]),
    transform:
      mode === 'neg'
        ? { instruction: 'Mettez la phrase à la forme négative.', source: clauseText({ ...c, neg: false }), target: { lattices: clauseAnswers(c) }, targetText: clauseText(c) }
        : undefined,
    explanation:
      mode === 'neg'
        ? `Futur négatif : won't (= will not) + base verbale, à toutes les personnes.`
        : mode === 'yn'
          ? `Question au futur : Will + sujet + base verbale ?`
          : `Futur avec will : will + base verbale, identique à toutes les personnes (pas de -s, pas de to).`,
    options: { timeFront: ctx.rng.chance(0.2) },
  });
};

export const goingTo: ItemGenerator = (ctx) => {
  if (ctx.rng.chance(0.15)) {
    // prédiction fondée sur un indice visible
    const w = ctx.rng.pick(WEATHER);
    const clue = ctx.rng.pick([
      { en: 'Look at those black clouds!', fr: 'Regarde ces nuages noirs !', ok: ['rain'] },
      { en: 'Look at the sky!', fr: 'Regarde le ciel !', ok: ['rain', 'snow', 'sunny'] },
    ]);
    if (!clue.ok.includes(w.id)) return null;
    const verbPart = w.goingTo[0];
    const slots: Slot[] = [...words(clue.en, 'pre'), s('It', { role: 'subj', proper: true }), s(verbPart, { role: 'vp' })];
    const after = verbPart.replace(/^is going to /, '');
    return buildItem({
      skillId: 'going_to',
      templateId: `goingto.evidence.${w.id}`,
      level: 'A2',
      slots,
      end: '.',
      fr: joinFrench([`${clue.fr} ${cap(w.goingTo[1])}`], '.'),
      blankGroups: [indicesByRole(slots, ['vp'])],
      hints: [w.base === 'be' ? after : w.base],
      distractors: [
        { text: `going to ${after}`, tag: 'going_to_form' },
        { text: `is going ${after}`, tag: 'going_to_form' },
        { text: `is going to ${w.base === 'be' ? after.replace(/^be /, 'being ') : `${w.base}ing`}`, tag: 'going_to_form' },
      ],
      explanation: `Prédiction fondée sur un indice visible maintenant (les nuages…) → be going to : it is going to ${after}.`,
      lexemes: [`weather:${w.id}`],
    });
  }
  const mode = ctx.rng.pick(['aff', 'aff', 'neg', 'yn', 'wh'] as const);
  const parts = chooseParts(ctx, (p) => !p.routine && (p.k !== 'state' || FUTURE_STATES.has(p.id)) && !BARE_SKILLS.has(p.id) && !ACCIDENTS.has(p.id), mode === 'yn' || mode === 'wh' ? { exclude: ['i', 'i_f'] } : {});
  if (!parts) return null;
  const wh = parts.pred.obj?.cats?.some((x) => ['city', 'country', 'place'].includes(x)) ? 'place' : parts.obj ? 'obj' : null;
  if (mode === 'wh' && !wh) return null;
  const c: Clause = {
    ...parts,
    tense: 'goingTo',
    time: pickTimeFor(ctx, 'future', parts.pred),
    neg: mode === 'neg',
    form: mode === 'yn' ? 'yn' : mode === 'wh' ? 'wh' : 'decl',
    ...(mode === 'wh' ? { wh: wh! } : {}),
  };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const be = EN.beForm('present', p, n);
  const beTxt = mode === 'neg' ? (be === 'am' ? 'am not' : `${be}n't`) : be;
  const wrongBe = be === 'is' ? 'are' : 'is';
  return clauseItem({
    skillId: 'going_to',
    templateId: `goingto.${mode}`,
    level: 'A2',
    clause: c,
    blankRoles: mode === 'yn' || mode === 'wh' ? [['aux'], ['verb']] : [['aux', 'verb']],
    hints: mode === 'yn' || mode === 'wh' ? [undefined, `going to / ${v.base}`] : [mode === 'neg' ? `not / going to / ${v.base}` : `going to / ${v.base}`],
    distractors:
      mode === 'aff' || mode === 'neg'
        ? [
            { text: `${mode === 'neg' ? 'not ' : ''}going to ${v.base}`, tag: 'going_to_form' },
            { text: `${beTxt} going to ${EN.ing(v)}`, tag: 'going_to_form' },
            { text: `${beTxt} go to ${v.base}`, tag: 'going_to_form' },
            { text: `${mode === 'neg' ? `${wrongBe}n't` : wrongBe} going to ${v.base}`, tag: 'be_wrong_form' },
          ]
        : [],
    neighbours: mutate(ctx, c, ['subj', 'neg', { tense: 'pastSimple', time: pickTime(ctx, ['past']) }]),
    explanation: `Projet, intention déjà décidée → be going to + base verbale : ${be} going to ${v.base}. Le français emploie le futur proche (aller + infinitif).`,
    options: { timeFront: ctx.rng.chance(0.2) },
  });
};

// ---------------------------------------------------------------------------
// Choix de la forme du futur (contexte explicite = pas d'ambiguïté)

interface FixedFuture {
  id: string;
  context: string;
  before: string;
  answer: string[];
  after: string;
  fr: string;
  hint: string;
  distractors: Distractor[];
  explanation: string;
}

const FIXED_FUTURES: FixedFuture[] = [
  {
    id: 'phone', context: 'Décision prise à l\'instant', before: 'The phone is ringing. I', answer: ['will answer', "'ll answer"], after: 'it.',
    fr: 'Le téléphone sonne. Je vais répondre.', hint: 'answer',
    distractors: [{ text: 'am going to answer', tag: 'future_choice' }, { text: 'answer', tag: 'future_choice' }, { text: 'am answering', tag: 'future_choice' }],
    explanation: 'Décision prise au moment où l\'on parle → will.',
  },
  {
    id: 'bag', context: 'Proposition d\'aide spontanée', before: 'That bag looks heavy. I', answer: ['will help', "'ll help"], after: 'you.',
    fr: 'Ce sac a l\'air lourd. Je vais t\'aider.', hint: 'help',
    distractors: [{ text: 'help', tag: 'future_choice' }, { text: 'am helping', tag: 'future_choice' }, { text: 'will to help', tag: 'will_to' }],
    explanation: 'Offre spontanée → will (I\'ll help you).',
  },
  {
    id: 'promise', context: 'Promesse', before: 'Don\'t worry, I', answer: ["won't tell", 'will not tell'], after: 'anyone.',
    fr: 'Ne t\'inquiète pas, je ne le dirai à personne.', hint: 'not / tell',
    distractors: [{ text: "don't tell", tag: 'future_choice' }, { text: "won't to tell", tag: 'will_to' }, { text: "won't tells", tag: 'will_inflected' }],
    explanation: 'Promesse → will / won\'t + base verbale.',
  },
  {
    id: 'cold', context: 'Décision prise à l\'instant', before: 'It\'s cold in here. I', answer: ['will close', "'ll close"], after: 'the window.',
    fr: 'Il fait froid ici. Je vais fermer la fenêtre.', hint: 'close',
    distractors: [{ text: 'close', tag: 'future_choice' }, { text: 'am going to close', tag: 'future_choice' }, { text: 'will closing', tag: 'will_inflected' }],
    explanation: 'Décision prise au moment où l\'on parle → will.',
  },
  {
    id: 'order', context: 'Au restaurant, vous choisissez maintenant', before: 'I', answer: ['will have', "'ll have"], after: 'the chicken, please.',
    fr: 'Je vais prendre le poulet, s\'il vous plaît.', hint: 'have',
    distractors: [{ text: 'am having', tag: 'future_choice' }, { text: 'have', tag: 'future_choice' }, { text: 'will to have', tag: 'will_to' }],
    explanation: 'Choix fait sur le moment (commande au restaurant) → I\'ll have…',
  },
  {
    id: 'train', context: 'Horaire officiel', before: 'The train', answer: ['leaves'], after: 'at 7.15 tomorrow morning.',
    fr: 'Le train part à 7 h 15 demain matin.', hint: 'leave',
    distractors: [{ text: 'leave', tag: 's3_missing' }, { text: 'is leave', tag: 'be_plus_base' }, { text: 'leaving', tag: 'continuous_missing_be' }],
    explanation: 'Horaires et programmes officiels (trains, films, cours) → présent simple, même pour le futur.',
  },
  {
    id: 'film', context: 'Programme officiel', before: 'The film', answer: ['starts', 'begins'], after: 'at eight o\'clock tonight.',
    fr: 'Le film commence à huit heures ce soir.', hint: 'start',
    distractors: [{ text: 'start', tag: 's3_missing' }, { text: 'is start', tag: 'be_plus_base' }, { text: 'starting', tag: 'continuous_missing_be' }],
    explanation: 'Programme fixé (cinéma, transports) → présent simple.',
  },
];

export const futureForms: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['fixed', 'fixed', 'plan', 'arrangement', 'prediction'] as const);
  if (kind === 'fixed') {
    const f = ctx.rng.pick(FIXED_FUTURES);
    const slots: Slot[] = [...words(f.before, 'pre'), s(f.answer, { role: 'vp' }), ...words(f.after.replace(/\.$/, ''), 'post')];
    return buildItem({
      skillId: 'future_forms',
      templateId: `ff.fixed.${f.id}`,
      level: 'B1',
      slots,
      end: '.',
      fr: f.fr,
      blankGroups: [indicesByRole(slots, ['vp'])],
      hints: [f.hint],
      distractors: f.distractors,
      instruction: `Contexte : ${f.context}. Choisissez la bonne forme du futur.`,
      explanation: f.explanation,
      lexemes: [`ff:${f.id}`],
    });
  }
  if (kind === 'plan') {
    const parts = chooseParts(ctx, (p) => !p.routine && p.k !== 'state' && !BARE_SKILLS.has(p.id) && !ACCIDENTS.has(p.id));
    if (!parts) return null;
    const c: Clause = { ...parts, tense: 'goingTo', time: pickTimeFor(ctx, 'future', parts.pred) };
    const v = verbOf(c);
    const { p, n } = pn(c);
    const be = EN.beForm('present', p, n);
    return clauseItem({
      skillId: 'future_forms',
      templateId: 'ff.plan',
      level: 'B1',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [v.base],
      distractors: [
        { text: `will ${v.base}`, tag: 'future_choice' },
        { text: `going to ${v.base}`, tag: 'going_to_form' },
        { text: `${be} going to ${EN.ing(v)}`, tag: 'going_to_form' },
      ],
      neighbours: mutate(ctx, c, ['subj', 'neg']),
      instruction: 'Contexte : intention déjà décidée (projet personnel). Choisissez la bonne forme du futur.',
      explanation: `Intention décidée AVANT le moment où l'on parle → be going to : ${be} going to ${v.base}.`,
    });
  }
  if (kind === 'arrangement') {
    const ids = ['meet_friends', 'go_cinema', 'visit_family', 'play_sport', 'have_meeting', 'see_doctor', 'go_city', 'fly_country'];
    const parts = chooseParts(ctx, (p) => ids.includes(p.id));
    if (!parts) return null;
    const time = pickTime(ctx, ['future'], (t) => (['go_city', 'fly_country'].includes(parts.pred.id) ? ['next_weekend', 'next_week', 'next_month'] : ['tomorrow', 'tonight', 'next_weekend', 'next_week']).includes(t.id));
    const c: Clause = { ...parts, tense: 'presCont', time };
    const v = verbOf(c);
    const { p, n } = pn(c);
    const be = EN.beForm('present', p, n);
    return clauseItem({
      skillId: 'future_forms',
      templateId: 'ff.arrangement',
      level: 'B1',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [v.base],
      distractors: [
        { text: EN.presentSimple(v, p, n), tag: 'future_choice' },
        { text: EN.ing(v), tag: 'continuous_missing_be' },
        { text: `${be} ${v.base}`, tag: 'continuous_missing_ing' },
      ],
      neighbours: mutate(ctx, c, ['subj', 'neg']),
      instruction: 'Contexte : rendez-vous déjà fixé (date, heure, personnes). Choisissez la bonne forme.',
      explanation: `Rendez-vous ou arrangement organisé → présent continu à valeur de futur : ${be} ${EN.ing(v)} ${time.en}. (be going to serait aussi possible, mais pas le présent simple.)`,
    });
  }
  // prédiction d'opinion → will
  const parts = chooseParts(ctx, (p) => !p.routine && (p.k !== 'state' || FUTURE_STATES.has(p.id)) && !BARE_SKILLS.has(p.id) && !ACCIDENTS.has(p.id), { exclude: ['i', 'i_f'] });
  if (!parts) return null;
  const c: Clause = { ...parts, tense: 'will', time: pickTimeFor(ctx, 'future', parts.pred) };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const r = realizeEn(c);
  const slots: Slot[] = [...words('I think', 'pre'), ...r.slots.map((sl, i) => (i === 0 && !c.subj.proper ? { ...sl, alts: sl.alts.map(lowerFirst) } : sl))];
  const frClause = realizeFr(c).replace(/\.$/, '');
  return buildItem({
    skillId: 'future_forms',
    templateId: 'ff.prediction',
    level: 'B1',
    slots,
    end: '.',
    fr: joinFrench([FR.frJoin(['je', 'pense', 'que', ...(c.subj.proper && !c.subj.pron ? frClause : lowerFirst(frClause)).split(' ')])], '.'),
    blankGroups: [indicesByRole(slots, ['aux', 'verb'])],
    hints: [v.base],
    distractors: [
      { text: EN.presentSimple(v, p, n), tag: 'future_choice' },
      { text: `will ${EN.presentSimple(v, 3, 'sg')}`, tag: 'will_inflected' },
      { text: `will to ${v.base}`, tag: 'will_to' },
    ],
    instruction: 'Contexte : opinion sur l\'avenir (I think…). Choisissez la bonne forme.',
    explanation: `Prédiction fondée sur une opinion (I think, probably, I'm sure) → will + base verbale.`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj, time: c.time }),
  });
};

// ---------------------------------------------------------------------------
// Propositions de temps : « When I get home, I'll call you. »

const SEQUENCES: { first: string; second: string; firstObj?: string; secondObj?: string }[] = [
  { first: 'finish_work', second: 'go_place', secondObj: 'gym' },
  { first: 'get_home_t', second: 'have_dinner' },
  { first: 'do_homework', second: 'watch_tv' },
  { first: 'have_time', second: 'visit_family', secondObj: 'grandparents' },
  { first: 'get_up', second: 'have_shower' },
  { first: 'finish_work', second: 'call_person', secondObj: 'mother' },
  { first: 'arrive', second: 'send_message', secondObj: 'message' },
  { first: 'have_breakfast', second: 'go_school' },
  { first: 'have_money', second: 'buy_thing', secondObj: 'car' },
  { first: 'pass_exam', second: 'travel_world' },
  { first: 'do_shopping', second: 'cook_dinner' },
];

export const timeClauses: ItemGenerator = (ctx) => {
  const seq = ctx.rng.pick(SEQUENCES);
  const p1 = predicate(seq.first);
  const p2 = predicate(seq.second);
  const parts = chooseParts(ctx, (p) => p.id === p1.id, { adult: p1.adult || p2.adult, pronouns: 0.8 });
  if (!parts) return null;
  const subj = parts.subj;
  const conj = ctx.rng.pick([
    { en: 'when', fr: 'quand' },
    { en: 'as soon as', fr: 'dès que' },
  ]);
  const o1 = parts.obj;
  const o2 = objFor(ctx, p2, seq.secondObj);
  const c1: Clause = { subj, pred: p1, obj: o1, tense: 'presSimple' };
  const pronSubj = { ...subj, en: subjectPronounEn(subj), fr: subjectPronounFr(subj), pron: true, proper: subjectPronounEn(subj) === 'I' };
  const c2: Clause = { subj: pronSubj, pred: p2, obj: o2, tense: 'will' };
  const r1 = realizeEn(c1);
  const r2 = realizeEn(c2);
  const v1 = verbOf(c1);
  const v2 = verbOf(c2);
  const { p, n } = pn(c1);
  const slots: Slot[] = [
    s(cap(conj.en), { role: 'conj' }),
    ...r1.slots.map((sl) => ({ ...sl, role: sl.role === 'verb' || sl.role === 'aux' ? 'v1' : sl.role })),
    s(',', { role: 'punct' }),
    ...r2.slots.map((sl, i) => (i === 0 && !pronSubj.proper ? { ...sl, alts: sl.alts.map(lowerFirst) } : sl)),
  ];
  const fr1 = realizeFr({ ...c1, tense: 'will' }).replace(/\.$/, '');
  const fr2 = realizeFr(c2).replace(/\.$/, '');
  const fr = joinFrench([FR.frJoin([conj.fr, ...(subj.proper && !subj.pron ? fr1 : lowerFirst(fr1)).split(' ')]) + ',', lowerFirst(fr2)], '.');
  const blankMain = ctx.rng.chance(0.3);
  const present = EN.presentSimple(v1, p, n);
  return buildItem({
    skillId: 'time_clauses',
    templateId: `tc.${conj.en.replace(/ /g, '_')}.${blankMain ? 'main' : 'sub'}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [blankMain ? indicesByRole(slots, ['aux', 'verb']) : indicesByRole(slots, ['v1'])],
    hints: [blankMain ? v2.base : v1.base],
    distractors: blankMain
      ? [
          { text: EN.presentSimple(v2, pronSubj.person, pronSubj.num), tag: 'first_conditional' },
          { text: `will ${EN.presentSimple(v2, 3, 'sg')}`, tag: 'will_inflected' },
        ]
      : [
          { text: `will ${v1.base}`, tag: 'future_in_time_clause' },
          { text: `am going to ${v1.base}`.replace(/^am/, EN.beForm('present', p, n)), tag: 'future_in_time_clause' },
          ...(present !== v1.base ? [{ text: v1.base, tag: 's3_missing' }] : []),
        ],
    explanation: `Après « ${conj.en} », on emploie le présent simple pour parler du futur (${present}), même si le français dit « ${conj.fr} » + futur. La proposition principale est au futur (will ${v2.base}).`,
    lexemes: [...lexemesOf({ subj, pred: p1, obj: o1 }), `pred:${p2.id}`, `verb:${p2.v}`],
  });
};

/** Objet d'un prédicat : nom imposé (s'il est autorisé) ou tirage. */
export function objFor(ctx: GenContext, p: Predicate, nounId?: string): ObjChoice | undefined {
  if (!p.obj) return undefined;
  const n = nounId ? NOUN_BY_ID[nounId] : undefined;
  if (n) {
    const det = ctx.rng.pick(p.obj.dets);
    return { noun: n, det, plural: !n.u && !n.po && det === 'gen' };
  }
  return pickObject(ctx, p);
}
