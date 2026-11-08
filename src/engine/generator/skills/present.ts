/**
 * Présent simple, négation/questions, adverbes de fréquence, présent continu,
 * contraste simple/continu et verbes d'état.
 */
import * as EN from '@/engine/lang/en/morphology';
import { FREQ_ADVERBS } from '@/content/lexicon/time';
import { allowsHabit, allowsProgressive, timeScale } from '@/content/lexicon/predicates';
import type { Predicate } from '@/content/lexicon/types';
import { PRONOUNS } from '@/content/lexicon/subjects';
import { spec } from '@/engine/core/lattice';
import type { Clause } from '../clause';
import { clauseAnswers, clauseItem, clauseText } from '../item';
import { pickTime } from '../pick';
import type { Distractor, GenContext, ItemGenerator, SentenceItem } from '../types';
import {
  cap,
  chooseParts,
  continuousDistractors,
  ingRule,
  isThird,
  mutate,
  pn,
  presSimpleDistractors,
  s3Rule,
  verbOf,
} from './common';

function habitMarker(ctx: GenContext): Pick<Clause, 'freq' | 'time'> {
  if (ctx.rng.chance(0.4)) {
    return { freq: ctx.rng.pick(FREQ_ADVERBS.filter((f) => f.id !== 'never')) };
  }
  return { time: pickTime(ctx, ['habit']) };
}

/** « now » pour une action ponctuelle ; « this week / these days » seulement pour une situation temporaire. */
function nowTime(ctx: GenContext, p: Predicate) {
  const short = timeScale(p) === 'day';
  return pickTime(ctx, ['now'], (t) => (short ? ['now', 'right_now', 'at_moment'].includes(t.id) : true));
}

function markerText(c: Clause): string {
  return c.freq ? c.freq.en : c.time ? c.time.en : '';
}

// ---------------------------------------------------------------------------

export const presentSimple: ItemGenerator = (ctx) => {
  const third = ctx.rng.chance(0.65);
  const parts = chooseParts(ctx, (p) => (allowsHabit(p) || p.k === 'state') && !p.be && p.v !== 'be', third ? { third: true } : { notThird: true });
  if (!parts) return null;
  const c: Clause = { ...parts, tense: 'presSimple', ...(allowsHabit(parts.pred) ? habitMarker(ctx) : {}) };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const form = EN.presentSimple(v, p, n);
  const why = markerText(c) ? `Habitude (${markerText(c)}) → présent simple.` : 'Fait général ou état → présent simple.';
  const explanation = isThird(c.subj)
    ? `${why} Avec « ${c.subj.en} » (3ᵉ personne du singulier), ${s3Rule(v)}.`
    : `${why} Avec « ${c.subj.en} », le verbe reste à la base verbale : ${form}.`;

  let transform: SentenceItem['transform'];
  if (isThird(c.subj) && ctx.rng.chance(0.5)) {
    const src: Clause = { ...c, subj: ctx.rng.pick(PRONOUNS.filter((s) => s.id === 'i' || s.id === 'we' || s.id === 'they')) };
    transform = {
      instruction: `Réécrivez la phrase en remplaçant « ${src.subj.en} » par « ${c.subj.en} ».`,
      source: clauseText(src),
      target: { lattices: clauseAnswers(c) },
      targetText: clauseText(c),
    };
  }
  return clauseItem({
    skillId: 'present_simple',
    templateId: `ps.aff.${isThird(c.subj) ? '3sg' : 'x'}.${c.pred.k}`,
    level: 'A2',
    clause: c,
    blankRoles: [['verb']],
    hints: [v.base],
    distractors: presSimpleDistractors(v, p, n),
    neighbours: mutate(ctx, c, ['neg', 'subj', { tense: 'pastSimple', time: undefined }]),
    transform,
    explanation,
    options: { timeFront: ctx.rng.chance(0.2) },
  });
};

// ---------------------------------------------------------------------------

export const presentSimpleNegQ: ItemGenerator = (ctx) => {
  const mode = ctx.rng.pick(['neg', 'neg', 'yn', 'yn', 'wh'] as const);
  const parts = chooseParts(ctx, (p) => (allowsHabit(p) || p.k === 'state') && !p.be && p.v !== 'be', mode === 'neg' ? {} : { exclude: ['i', 'i_f'] });
  if (!parts) return null;
  const habit = allowsHabit(parts.pred);
  const v = verbOf({ ...parts, tense: 'presSimple' } as Clause);
  if (mode === 'neg') {
    const c: Clause = { ...parts, tense: 'presSimple', neg: true, ...(habit && ctx.rng.chance(0.5) ? { time: pickTime(ctx, ['habit']) } : {}) };
    const { p, n } = pn(c);
    const aux = EN.doForm(p, n);
    const wrongAux = aux === 'does' ? 'do' : 'does';
    const distractors: Distractor[] = [
      { text: `${wrongAux}n't ${v.base}`, tag: 'do_wrong_person' },
      { text: `${aux}n't ${EN.presentSimple(v, p, n) === v.base ? EN.thirdPerson(v) : EN.presentSimple(v, p, n)}`, tag: 'aux_plus_inflected' },
      { text: `not ${v.base}`, tag: 'do_support' },
      { text: `${EN.beForm('present', p, n) === 'am' ? 'am not' : `${EN.beForm('present', p, n)}n't`} ${v.base}`, tag: 'be_plus_base' },
    ];
    const affirm: Clause = { ...c, neg: false };
    return clauseItem({
      skillId: 'present_simple_neg_q',
      templateId: `ps.neg.${aux}`,
      level: 'A2',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [`not / ${v.base}`],
      distractors,
      neighbours: mutate(ctx, c, ['neg', 'subj', 'obj']),
      transform: {
        instruction: 'Mettez la phrase à la forme négative.',
        source: clauseText(affirm),
        target: { lattices: clauseAnswers(c) },
        targetText: clauseText(c),
      },
      explanation: `Négation au présent simple : ${aux} not (${aux}n't) + base verbale. Avec « ${c.subj.en} », on utilise ${aux}, et le verbe ne prend jamais de -s après ${aux}n't : ${aux}n't ${v.base}.`,
    });
  }
  if (mode === 'yn') {
    const c: Clause = { ...parts, tense: 'presSimple', form: 'yn', ...(habit && ctx.rng.chance(0.5) ? { time: pickTime(ctx, ['habit']) } : {}) };
    const { p, n } = pn(c);
    const aux = EN.doForm(p, n);
    const twoBlanks = ctx.rng.chance(0.4);
    const decl: Clause = { ...c, form: 'decl' };
    const distractors: Distractor[] = [
      { text: cap(aux === 'does' ? 'do' : 'does'), tag: 'do_wrong_person' },
      { text: cap(EN.beForm('present', p, n)), tag: 'be_plus_base' },
      { text: cap(p === 3 && n === 'sg' ? 'are' : 'is'), tag: 'be_plus_base' },
    ];
    return clauseItem({
      skillId: 'present_simple_neg_q',
      templateId: `ps.yn.${twoBlanks ? 'full' : 'aux'}`,
      level: 'A2',
      clause: c,
      blankRoles: twoBlanks ? [['aux'], ['verb']] : [['aux']],
      hints: twoBlanks ? [undefined, v.base] : [undefined],
      distractors: twoBlanks ? [] : distractors,
      neighbours: mutate(ctx, c, ['subj', 'obj', 'neg']),
      transform: {
        instruction: 'Transformez la phrase en question (réponse oui/non).',
        source: clauseText(decl),
        target: { lattices: clauseAnswers(c) },
        targetText: clauseText(c),
      },
      explanation: `Question au présent simple : ${cap(aux)} + sujet + base verbale ? On emploie ${aux} avec « ${c.subj.en} », et le verbe reste à la base (${v.base}).`,
    });
  }
  // question en wh
  const whOptions: Clause['wh'][] = [];
  if (parts.pred.obj?.cats?.some((x) => ['city', 'country', 'place'].includes(x))) whOptions.push('place');
  if (parts.obj && !parts.pred.obj?.cats?.some((x) => ['city', 'country', 'place', 'sport', 'language'].includes(x))) whOptions.push('obj');
  if (habit && !['get_dressed', 'brush_teeth', 'have_shower'].includes(parts.pred.id)) whOptions.push('freq');
  if (!whOptions.length) return null;
  const wh = ctx.rng.pick(whOptions);
  const c: Clause = { ...parts, tense: 'presSimple', form: 'wh', wh, ...(wh === 'freq' ? { time: pickTime(ctx, ['habit']) } : {}) };
  const { p, n } = pn(c);
  const aux = EN.doForm(p, n);
  return clauseItem({
    skillId: 'present_simple_neg_q',
    templateId: `ps.wh.${wh}`,
    level: 'A2',
    clause: c,
    blankRoles: [['aux'], ['verb']],
    hints: [undefined, v.base],
    neighbours: mutate(ctx, c, ['subj']),
    explanation: `Question ouverte au présent simple : mot interrogatif + ${aux} + sujet + base verbale. « ${c.subj.en} » → ${aux} ; le verbe reste à la base : ${v.base}.`,
  });
};

// ---------------------------------------------------------------------------

export const frequencyAdverbs: ItemGenerator = (ctx) => {
  const useBe = ctx.rng.chance(0.3);
  const parts = chooseParts(ctx, (p) => (useBe ? !!p.be && p.k === 'state' : allowsHabit(p) && !p.be));
  if (!parts) return null;
  const freq = ctx.rng.pick(FREQ_ADVERBS);
  const c: Clause = { ...parts, tense: 'presSimple', freq };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const mode = ctx.rng.pick(['position', 'position', 'meaning', 'transform'] as const);
  const bare: Clause = { ...c, freq: undefined };
  const transform = {
    instruction: `Ajoute l'adverbe « ${freq.en} » à la bonne place.`,
    source: clauseText(bare),
    target: { lattices: clauseAnswers(c) },
    targetText: clauseText(c),
  };
  if (useBe) {
    const be = EN.beForm('present', p, n);
    const explanation = `Avec le verbe be, l'adverbe de fréquence se place APRÈS be : ${be} ${freq.en}. (« ${freq.fr} »)`;
    return clauseItem({
      skillId: 'frequency_adverbs',
      templateId: `freq.be.${mode}`,
      level: 'A2',
      clause: c,
      blankRoles: mode === 'meaning' ? [['adv']] : [['aux', 'adv']],
      hints: mode === 'meaning' ? [freq.fr] : [`${freq.en} / be`],
      distractors:
        mode === 'meaning'
          ? FREQ_ADVERBS.filter((f) => f.id !== freq.id).map((f) => ({ text: f.en, tag: 'meaning' }))
          : [
              { text: `${freq.en} ${be}`, tag: 'freq_position' },
              { text: `${be}`, tag: 'freq_position' },
            ],
      neighbours: mutate(ctx, c, ['subj']),
      transform: mode === 'transform' ? transform : undefined,
      instruction: mode === 'meaning' ? "Choisissez l'adverbe qui correspond à la traduction." : undefined,
      explanation,
    });
  }
  const form = EN.presentSimple(v, p, n);
  const explanation = `L'adverbe de fréquence se place AVANT le verbe principal : ${freq.en} ${form}. (« ${freq.fr} »)${freq.neg ? ' never a déjà un sens négatif : pas de don\'t.' : ''}`;
  return clauseItem({
    skillId: 'frequency_adverbs',
    templateId: `freq.verb.${mode}`,
    level: 'A2',
    clause: c,
    blankRoles: mode === 'meaning' ? [['adv']] : [['adv', 'verb']],
    hints: mode === 'meaning' ? [freq.fr] : [`${freq.en} / ${v.base}`],
    distractors:
      mode === 'meaning'
        ? FREQ_ADVERBS.filter((f) => f.id !== freq.id).map((f) => ({ text: f.en, tag: 'meaning' }))
        : [
            { text: `${form} ${freq.en}`, tag: 'freq_position' },
            { text: `${freq.en} ${v.base === form ? EN.thirdPerson(v) : v.base}`, tag: isThird(c.subj) ? 's3_missing' : 's3_extra' },
            ...(freq.neg ? [{ text: `don't never ${v.base}`, tag: 'freq_position' }] : []),
          ],
    neighbours: mutate(ctx, c, ['subj']),
    transform: mode === 'transform' ? transform : undefined,
    instruction: mode === 'meaning' ? "Choisissez l'adverbe qui correspond à la traduction." : undefined,
    explanation,
  });
};

// ---------------------------------------------------------------------------

export const presentContinuous: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => allowsProgressive(p) && !p.be);
  if (!parts) return null;
  const mode = ctx.rng.pick(['aff', 'aff', 'neg', 'yn', 'wh'] as const);
  const time = ctx.rng.chance(0.75) ? nowTime(ctx, parts.pred) : undefined;
  const base: Clause = { ...parts, tense: 'presCont', time };
  const v = verbOf(base);
  if (mode === 'aff' || mode === 'neg') {
    const c: Clause = { ...base, neg: mode === 'neg' };
    const { p, n } = pn(c);
    const be = EN.beForm('present', p, n);
    const habitual: Clause = { ...c, tense: 'presSimple', time: pickTime(ctx, ['habit']) };
    return clauseItem({
      skillId: 'present_continuous',
      templateId: `pc.${mode}.${be}`,
      level: 'A2',
      clause: c,
      blankRoles: [['aux', 'verb']],
      hints: [mode === 'neg' ? `not / ${v.base}` : v.base],
      distractors: continuousDistractors(v, p, n, 'present', mode === 'neg'),
      neighbours: mutate(ctx, c, ['neg', 'subj', { tense: 'presSimple', time: undefined }]),
      transform:
        mode === 'aff' && time
          ? {
              instruction: `Mettez la phrase au présent continu en remplaçant « ${habitual.time!.en} » par « ${time.en} ».`,
              source: clauseText(habitual),
              target: { lattices: clauseAnswers(c) },
              targetText: clauseText(c),
            }
          : undefined,
      explanation: `Action en cours${time ? ` (${time.en})` : ''} → présent continu : ${be}${mode === 'neg' ? ' not' : ''} + verbe-ing. Avec « ${c.subj.en} » : ${be}. Orthographe : ${ingRule(v)}.`,
    });
  }
  if (mode === 'yn') {
    if (base.subj.person === 1 && base.subj.num === 'sg') return null;
    const c: Clause = { ...base, form: 'yn' };
    const { p, n } = pn(c);
    const be = EN.beForm('present', p, n);
    return clauseItem({
      skillId: 'present_continuous',
      templateId: 'pc.yn',
      level: 'A2',
      clause: c,
      blankRoles: [['aux'], ['verb']],
      hints: [undefined, v.base],
      neighbours: mutate(ctx, c, ['subj', 'neg']),
      explanation: `Question au présent continu : ${cap(be)} + sujet + verbe-ing ? (pas de do). ${ingRule(v)}.`,
    });
  }
  // wh : « What is she reading? »
  if (!parts.obj || parts.pred.obj?.cats?.some((x) => ['sport', 'language', 'city', 'country'].includes(x))) return null;
  const c: Clause = { ...base, form: 'wh', wh: 'obj' };
  const { p, n } = pn(c);
  const be = EN.beForm('present', p, n);
  return clauseItem({
    skillId: 'present_continuous',
    templateId: 'pc.wh',
    level: 'A2',
    clause: c,
    blankRoles: [['aux'], ['verb']],
    hints: [undefined, v.base],
    neighbours: mutate(ctx, c, ['subj']),
    explanation: `Question ouverte au présent continu : mot interrogatif + ${be} + sujet + verbe-ing ?`,
  });
};

// ---------------------------------------------------------------------------

const STATIVE_IDS = ['want_thing', 'need_thing', 'understand_question', 'remember_name', 'prefer_tea', 'know_city', 'have_car', 'like_food'];

export const simpleVsContinuous: ItemGenerator = (ctx) => {
  const stative = ctx.rng.chance(0.3);
  if (stative) {
    const parts = chooseParts(ctx, (p) => STATIVE_IDS.includes(p.id) && p.id !== 'like_food');
    if (!parts) return null;
    const time = ctx.rng.pick([pickTime(ctx, ['now'], (t) => t.id === 'now' || t.id === 'at_moment')]);
    const neg = ctx.rng.chance(0.3);
    const c: Clause = { ...parts, tense: 'presSimple', neg, time };
    const v = verbOf(c);
    const { p, n } = pn(c);
    const be = EN.beForm('present', p, n);
    const correctForm = neg ? `${EN.doForm(p, n)}n't ${v.base}` : EN.presentSimple(v, p, n);
    return clauseItem({
      skillId: 'simple_vs_continuous',
      templateId: `svc.stative.${v.base}`,
      level: 'A2',
      clause: c,
      blankRoles: neg ? [['aux', 'verb']] : [['verb']],
      hints: [neg ? `not / ${v.base}` : v.base],
      distractors: [
        { text: `${neg ? (be === 'am' ? 'am not' : `${be}n't`) : be} ${EN.ing(v)}`, tag: 'stative_continuous' },
        { text: neg ? `not ${v.base}` : `${be} ${v.base}`, tag: neg ? 'do_support' : 'be_plus_base' },
      ],
      neighbours: mutate(ctx, c, ['neg', 'subj']),
      instruction: 'Présent simple ou présent continu ?',
      explanation: `« ${v.base} » est un verbe d'état : on l'emploie au présent simple même pour parler de maintenant (${correctForm}), pas à la forme continue.`,
    });
  }
  const parts = chooseParts(ctx, (p) => allowsHabit(p) && allowsProgressive(p) && !p.be);
  if (!parts) return null;
  const now = ctx.rng.chance(0.5);
  const neg = ctx.rng.chance(0.25);
  const c: Clause = now
    ? { ...parts, tense: 'presCont', neg, time: nowTime(ctx, parts.pred) }
    : { ...parts, tense: 'presSimple', neg, ...habitMarker(ctx) };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const be = EN.beForm('present', p, n);
  const doAux = EN.doForm(p, n);
  const simpleForm = neg ? `${doAux}n't ${v.base}` : EN.presentSimple(v, p, n);
  const contForm = `${neg ? (be === 'am' ? 'am not' : `${be}n't`) : be} ${EN.ing(v)}`;
  const distractors: Distractor[] = now
    ? [
        { text: simpleForm, tag: 'tense_simple_vs_cont' },
        { text: `${neg ? (be === 'am' ? 'am not' : `${be}n't`) : be} ${v.base}`, tag: 'continuous_missing_ing' },
      ]
    : [
        { text: contForm, tag: 'tense_simple_vs_cont' },
        { text: neg ? `${be === 'am' ? 'am not' : `${be}n't`} ${v.base}` : `${be} ${v.base}`, tag: 'be_plus_base' },
      ];
  const marker = c.freq?.en ?? c.time?.en ?? '';
  return clauseItem({
    skillId: 'simple_vs_continuous',
    templateId: `svc.${now ? 'cont' : 'simple'}.${neg ? 'neg' : 'aff'}`,
    level: 'A2',
    clause: c,
    blankRoles: now || neg ? [['aux', 'verb']] : [['verb']],
    hints: [neg ? `not / ${v.base}` : v.base],
    distractors,
    neighbours: mutate(ctx, c, ['subj', 'neg']),
    instruction: 'Présent simple ou présent continu ?',
    explanation: now
      ? `« ${marker} » indique une action en cours → présent continu : ${contForm}.`
      : `« ${marker} » indique une habitude → présent simple : ${simpleForm}.`,
    options: { timeFront: ctx.rng.chance(0.25) },
  });
};

/** Utilisé par les tests : spécification de réponse d'une proposition. */
export function answerOf(c: Clause) {
  return spec(...clauseAnswers(c));
}
