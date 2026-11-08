/**
 * Prétérit (réguliers, irréguliers, négation/questions, was/were),
 * past continuous et used to.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { enVerb } from '@/content/lexicon/verbs';
import { BARE_SKILLS, allowsHabit, allowsProgressive } from '@/content/lexicon/predicates';
import { subjectPronounEn, subjectPronounFr, frPersonOf } from '@/content/lexicon/subjects';
import { joinFrench } from '@/engine/core/text';
import { s, type Slot } from '@/engine/core/lattice';
import { realizeEn, realizeFr, type Clause, type TimeSpec } from '../clause';
import { buildItem, clauseAnswers, clauseItem, clauseText, indicesByRole } from '../item';
import { lexemesOf, pickTime, pickTimeFor } from '../pick';
import type { Distractor, ItemGenerator } from '../types';
import { cap, chooseParts, continuousDistractors, edRule, mutate, pastSimpleDistractors, pn, verbOf } from './common';

const isIrr = (base: string) => EN.isIrregular(enVerb(base));
const USED_TO_BAD = new Set(['look_for_item', 'wait_for_bus', 'wait_for_person', 'hurry', 'rest', 'charge_phone', 'check_emails', 'take_transport', 'have_shower', 'get_dressed', 'brush_teeth', 'relax_sofa', 'use_laptop', 'send_message', 'order_dish', 'buy_food', 'wear_clothes']);

export const pastSimpleRegular: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => !p.be && !isIrr(p.v) && p.k !== 'state' && !BARE_SKILLS.has(p.id) && !p.routine);
  if (!parts) return null;
  const c: Clause = { ...parts, tense: 'pastSimple', time: pickTimeFor(ctx, 'past', parts.pred) };
  const v = verbOf(c);
  return clauseItem({
    skillId: 'past_simple_regular',
    templateId: `pst.reg.${/e$/.test(v.base) ? 'e' : /[^aeiou]y$/.test(v.base) ? 'y' : v.dbl ? 'dbl' : 'plain'}`,
    level: 'A2',
    clause: c,
    blankRoles: [['verb']],
    hints: [v.base],
    distractors: pastSimpleDistractors(v),
    neighbours: mutate(ctx, c, ['neg', 'subj', { tense: 'presSimple', time: undefined }]),
    explanation: `Action terminée dans le passé (${c.time!.en}) → prétérit. Verbe ${edRule(v)}. Le prétérit est identique à toutes les personnes.`,
    options: { timeFront: ctx.rng.chance(0.3) },
    itemIds: [],
  });
};

export const pastSimpleIrregular: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => !p.be && isIrr(p.v) && p.k !== 'state' && !BARE_SKILLS.has(p.id) && !p.routine);
  if (!parts) return null;
  const c: Clause = { ...parts, tense: 'pastSimple', time: pickTimeFor(ctx, 'past', parts.pred) };
  const v = verbOf(c);
  const past = EN.pastForms(v);
  return clauseItem({
    skillId: 'past_simple_irregular',
    templateId: `pst.irr.${v.base}`,
    level: 'A2',
    clause: c,
    blankRoles: [['verb']],
    hints: [v.base],
    distractors: pastSimpleDistractors(v),
    neighbours: mutate(ctx, c, ['neg', 'subj', { tense: 'presPerf', time: undefined }]),
    explanation: `« ${v.base} » est irrégulier : ${v.base} → ${past.join(' / ')} (participe passé : ${EN.ppForms(v)[0]}). Le prétérit ne change pas selon la personne.`,
    options: { timeFront: ctx.rng.chance(0.3) },
    itemIds: [`irr:${v.base}`],
  });
};

export const pastSimpleNegQ: ItemGenerator = (ctx) => {
  const mode = ctx.rng.pick(['neg', 'neg', 'yn', 'wh'] as const);
  const parts = chooseParts(ctx, (p) => !p.be && p.k !== 'state' && !BARE_SKILLS.has(p.id) && (mode === 'wh' || !p.routine), mode === 'neg' ? {} : { exclude: ['i', 'i_f'] });
  if (!parts) return null;
  const v = enVerb(parts.pred.v);
  const time = pickTimeFor(ctx, 'past', parts.pred);
  const past = EN.pastSimple(v);
  if (mode === 'neg') {
    const c: Clause = { ...parts, tense: 'pastSimple', neg: true, time };
    const distractors: Distractor[] = [
      { text: `didn't ${past}`, tag: 'aux_plus_inflected' },
      { text: `not ${past}`, tag: 'do_support' },
      { text: `don't ${v.base}`, tag: 'tense_past' },
      { text: `wasn't ${v.base}`, tag: 'be_plus_base' },
    ];
    return clauseItem({
      skillId: 'past_simple_neg_q',
      templateId: 'pst.neg',
      level: 'A2',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [`not / ${v.base}`],
      distractors,
      neighbours: mutate(ctx, c, ['neg', 'subj', { tense: 'presSimple', time: undefined }]),
      transform: {
        instruction: 'Mettez la phrase à la forme négative.',
        source: clauseText({ ...c, neg: false }),
        target: { lattices: clauseAnswers(c) },
        targetText: clauseText(c),
      },
      explanation: `Négation au prétérit : didn't + base verbale, pour toutes les personnes. Le verbe ne se met pas au passé après didn't : didn't ${v.base} (✗ didn't ${past}).`,
      options: { timeFront: ctx.rng.chance(0.25) },
    });
  }
  if (mode === 'yn') {
    const c: Clause = { ...parts, tense: 'pastSimple', form: 'yn', time };
    const { p, n } = pn(c);
    return clauseItem({
      skillId: 'past_simple_neg_q',
      templateId: 'pst.yn',
      level: 'A2',
      clause: c,
      blankRoles: [['aux']],
      distractors: [
        { text: cap(EN.doForm(p, n)), tag: 'tense_past' },
        { text: cap(EN.beForm('past', p, n)), tag: 'be_plus_base' },
        { text: 'Have', tag: 'pp_finished_time' },
      ],
      neighbours: mutate(ctx, c, ['subj', { tense: 'presPerf', time: undefined }]),
      transform: {
        instruction: 'Transformez la phrase en question.',
        source: clauseText({ ...c, form: 'decl' }),
        target: { lattices: clauseAnswers(c) },
        targetText: clauseText(c),
      },
      explanation: `Question au prétérit : Did + sujet + base verbale ? (Did ${c.subj.en} ${v.base}…?)`,
    });
  }
  const whs: Clause['wh'][] = ['time'];
  if (parts.pred.obj?.cats?.some((x) => ['city', 'country', 'place'].includes(x))) whs.push('place', 'place');
  if (parts.obj && !parts.pred.obj?.cats?.some((x) => ['city', 'country', 'place', 'sport', 'language'].includes(x))) whs.push('obj');
  const wh = ctx.rng.pick(whs);
  const c: Clause = { ...parts, tense: 'pastSimple', form: 'wh', wh, time };
  return clauseItem({
    skillId: 'past_simple_neg_q',
    templateId: `pst.wh.${wh}`,
    level: 'A2',
    clause: c,
    blankRoles: [['aux'], ['verb']],
    hints: [undefined, v.base],
    neighbours: mutate(ctx, c, ['subj']),
    explanation: `Question ouverte au prétérit : mot interrogatif + did + sujet + base verbale (${v.base}, pas ${past}).`,
  });
};

export const wasWere: ItemGenerator = (ctx) => {
  const mode = ctx.rng.pick(['aff', 'aff', 'neg', 'yn'] as const);
  const parts = chooseParts(ctx, (p) => !!p.be && p.fv === 'être' && !['be_married', 'be_rich'].includes(p.id), mode === 'yn' ? { exclude: ['i', 'i_f'] } : {});
  if (!parts) return null;
  const c: Clause = {
    ...parts,
    tense: 'pastSimple',
    neg: mode === 'neg',
    form: mode === 'yn' ? 'yn' : 'decl',
    time: pickTimeFor(ctx, 'past', parts.pred),
  };
  const { p, n } = pn(c);
  const be = EN.beForm('past', p, n);
  const wrong = be === 'was' ? 'were' : 'was';
  const neg = mode === 'neg';
  const shown = (b: string) => (neg ? `${b}n't` : mode === 'yn' ? cap(b) : b);
  return clauseItem({
    skillId: 'was_were',
    templateId: `wasw.${mode}.${be}`,
    level: 'A2',
    clause: c,
    blankRoles: [['aux']],
    hints: [neg ? 'not / be' : 'be'],
    distractors: [
      { text: shown(wrong), tag: 'be_wrong_form' },
      { text: shown(EN.beForm('present', p, n)), tag: 'tense_past' },
      { text: neg ? "didn't be" : mode === 'yn' ? 'Did' : 'did be', tag: 'do_support' },
    ],
    neighbours: mutate(ctx, c, ['subj', { tense: 'presSimple', time: undefined }, 'neg']),
    explanation: `Prétérit de be : I/he/she/it was, you/we/they were. Avec « ${c.subj.en} » → ${be}. ${neg ? `Négation : ${be}n't (pas de didn't avec be).` : mode === 'yn' ? `Question : ${cap(be)} + sujet… ? (pas de did).` : ''}`,
    options: { timeFront: ctx.rng.chance(0.3) },
  });
};

// ---------------------------------------------------------------------------
// Past continuous : « I was watching TV when the phone rang. »

interface PastEvent {
  en: string;
  fr: string;
  verb: string;
  /** Mot du verbe au prétérit dans la phrase. */
  word: string;
}

const EVENTS: PastEvent[] = [
  { en: 'the phone rang', fr: 'le téléphone a sonné', verb: 'ring', word: 'rang' },
  { en: 'someone knocked at the door', fr: 'quelqu\'un a frappé à la porte', verb: 'knock', word: 'knocked' },
  { en: 'the lights went out', fr: 'les lumières se sont éteintes', verb: 'go', word: 'went' },
  { en: 'it started to rain', fr: 'il a commencé à pleuvoir', verb: 'start', word: 'started' },
  { en: 'I heard a strange noise', fr: "j'ai entendu un bruit bizarre", verb: 'hear', word: 'heard' },
  { en: 'the bus arrived', fr: 'le bus est arrivé', verb: 'arrive', word: 'arrived' },
  { en: 'my mum called', fr: 'ma mère a appelé', verb: 'call', word: 'called' },
  { en: 'the teacher came in', fr: 'le professeur est entré', verb: 'come', word: 'came' },
  { en: 'the doorbell rang', fr: 'on a sonné à la porte', verb: 'ring', word: 'rang' },
  { en: 'we saw an accident', fr: 'nous avons vu un accident', verb: 'see', word: 'saw' },
  { en: 'a dog started barking', fr: 'un chien a commencé à aboyer', verb: 'start', word: 'started' },
  { en: 'my friend sent me a message', fr: "mon ami m'a envoyé un message", verb: 'send', word: 'sent' },
  { en: 'the fire alarm went off', fr: "l'alarme incendie s'est déclenchée", verb: 'go', word: 'went' },
  { en: 'I found an old photo', fr: "j'ai trouvé une vieille photo", verb: 'find', word: 'found' },
];

export const pastContinuous: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => allowsProgressive(p) && !p.be);
  if (!parts) return null;
  const useWhen = ctx.rng.chance(0.75);
  const neg = !useWhen && ctx.rng.chance(0.3);
  const c: Clause = { ...parts, tense: 'pastCont', neg, ...(useWhen ? {} : { time: pickTime(ctx, ['pastPoint']) }) };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const be = EN.beForm('past', p, n);
  const r = realizeEn(c, { timeFront: ctx.rng.chance(0.3) });
  const frMain = realizeFr(c).replace(/\.$/, '');
  if (!useWhen) {
    return clauseItem({
      skillId: 'past_continuous',
      templateId: `pcont.time.${neg ? 'neg' : 'aff'}`,
      level: 'A2',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [neg ? `not / ${v.base}` : v.base],
      distractors: continuousDistractors(v, p, n, 'past', neg),
      neighbours: mutate(ctx, c, ['subj', { tense: 'pastSimple' }]),
      explanation: `Action en cours à un moment précis du passé (${c.time!.en}) → past continuous : ${be}${neg ? 'n\'t' : ''} + verbe-ing.`,
    });
  }
  const ev = ctx.rng.pick(EVENTS);
  const evVerb = enVerb(ev.verb);
  const blankEvent = ctx.rng.chance(0.35);
  const evWords = ev.en.split(' ');
  const evSlots: Slot[] = evWords.map((w) => s(w, { role: w === ev.word ? 'evverb' : 'ev', proper: w === 'I' }));
  const slots: Slot[] = [...r.slots, s('when', { role: 'conj' }), ...evSlots];
  const fr = joinFrench([`${frMain} quand ${ev.fr}`], '.');
  const vpIdx = indicesByRole(slots, ['aux', 'verb']);
  const evIdx = indicesByRole(slots, ['evverb']);
  const distractors: Distractor[] = blankEvent
    ? [
        { text: `was ${EN.ing(evVerb)}`, tag: 'past_cont_vs_simple' },
        { text: evVerb.base, tag: 'tense_past' },
        ...(EN.isIrregular(evVerb) ? [{ text: EN.regularEd({ base: evVerb.base })[0], tag: 'irregular_past' }] : []),
      ]
    : continuousDistractors(v, p, n, 'past', false);
  // traduction erronée : action principale au passé composé
  const wrongMain = realizeFr({ ...c, tense: 'pastSimple' }).replace(/\.$/, '');
  const wrongEvent = realizeFr({ ...c, tense: 'presCont', time: undefined }).replace(/\.$/, '');
  return buildItem({
    skillId: 'past_continuous',
    templateId: `pcont.when.${blankEvent ? 'event' : 'main'}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [blankEvent ? evIdx : vpIdx],
    hints: [blankEvent ? evVerb.base : v.base],
    distractors,
    frDistractors: [joinFrench([`${wrongMain} quand ${ev.fr}`], '.'), joinFrench([`${wrongEvent} quand ${ev.fr}`], '.')],
    explanation: blankEvent
      ? `L'action courte qui interrompt (${ev.en}) est au prétérit ; l'action en cours (le « décor ») est au past continuous.`
      : `L'action longue en cours au moment où quelque chose se produit → past continuous : ${be} + ${EN.ing(v)}. L'interruption (« ${ev.en} ») est au prétérit.`,
    lexemes: [...lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj }), `verb:${ev.verb}`],
  });
};

// ---------------------------------------------------------------------------
// used to

function childhood(subjEn: string, subjFr: string, p: EN.Person, n: EN.GNumber, frPerson: FR.FrPerson): TimeSpec {
  const be = EN.beForm('past', p, n);
  const etre = FR.imparfait(FR.ETRE, frPerson);
  return {
    en: `when ${subjEn} ${be} ${n === 'pl' ? 'children' : 'a child'}`,
    fr: FR.frJoin(['quand', subjFr, etre, n === 'pl' ? 'enfants' : 'enfant']),
    front: true,
  };
}

export const usedTo: ItemGenerator = (ctx) => {
  const parts = chooseParts(
    ctx,
    (p) => (allowsHabit(p) && p.k === 'act' && !p.routine && !p.adult && !USED_TO_BAD.has(p.id)) || ['live_city', 'live_country', 'like_food', 'be_afraid_dogs', 'wear_glasses'].includes(p.id),
    { pronouns: 0.8 },
  );
  if (!parts) return null;
  const mode = ctx.rng.pick(['aff', 'aff', 'neg', 'yn'] as const);
  const { subj } = parts;
  const pronEn = subjectPronounEn(subj);
  const pronFr = subjectPronounFr(subj);
  const time = childhood(pronEn, pronFr, subj.person, subj.num, frPersonOf(subj));
  // habitude passée : objets au pluriel générique (eat omelettes, watch cartoons)
  const obj = parts.obj && parts.obj.det === 'a' && !parts.obj.noun.u && !parts.obj.noun.po ? { ...parts.obj, plural: true } : parts.obj;
  const c: Clause = { ...parts, obj, tense: 'usedTo', neg: mode === 'neg', form: mode === 'yn' ? 'yn' : 'decl', time };
  const v = verbOf(c);
  const distractors: Distractor[] =
    mode === 'aff'
      ? [
          { text: `use to ${v.base}`, tag: 'used_to_form' },
          { text: `used to ${EN.ing(v)}`, tag: 'used_to_form' },
          { text: `was used to ${v.base}`, tag: 'used_to_form' },
          { text: `used ${v.base}`, tag: 'used_to_form' },
        ]
      : mode === 'neg'
        ? [
            { text: `didn't used to ${v.base}`, tag: 'used_to_form' },
            { text: `didn't use to ${EN.ing(v)}`, tag: 'used_to_form' },
            { text: `don't use to ${v.base}`, tag: 'used_to_form' },
          ]
        : [];
  return clauseItem({
    skillId: 'used_to',
    templateId: `usedto.${mode}`,
    level: 'B1',
    clause: c,
    blankRoles: mode === 'yn' ? [['aux'], ['verb']] : [['aux', 'verb']],
    hints: mode === 'yn' ? [undefined, `use to / ${v.base}`] : [mode === 'neg' ? `not / used to / ${v.base}` : `used to / ${v.base}`],
    distractors,
    neighbours: mutate(ctx, c, ['subj', { tense: 'presSimple', time: undefined }]),
    explanation:
      mode === 'aff'
        ? `Habitude passée révolue → used to + base verbale (${'used to ' + v.base}). En français : imparfait.`
        : `Négation et question avec did : didn't use to / Did … use to + base (sans -d à use après did).`,
    options: { timeFront: ctx.rng.chance(0.4) },
  });
};
