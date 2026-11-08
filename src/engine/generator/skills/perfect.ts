/**
 * Present perfect : expérience (ever/never, been to), just/already/yet,
 * for/since, et contraste avec le prétérit.
 */
import * as EN from '@/engine/lang/en/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { allowsDuration } from '@/content/lexicon/predicates';
import { realizeEn, realizeFr, type Clause, type TimeSpec } from '../clause';
import { buildItem, clauseAnswers, clauseItem, indicesByRole } from '../item';
import { lexemesOf, pickTime, pickTimeFor } from '../pick';
import type { Distractor, ItemGenerator } from '../types';
import { cap, chooseParts, mutate, pastSimpleDistractors, pn, presPerfDistractors, verbOf } from './common';

const EXPERIENCE = [
  'go_country', 'go_city', 'go_place', 'visit_city', 'play_sport', 'play_game', 'lose_item',
  'break_thing', 'forget_item', 'fly_country', 'stay_hotel', 'cook_dish', 'take_taxi', 'win_lottery', 'play_instrument',
  'miss_bus', 'learn_language',
];

const RESULT = [
  'do_homework', 'finish_work', 'lose_item', 'find_item', 'buy_thing', 'pay_bill', 'book_table', 'clean_room', 'tidy_room',
  'do_shopping', 'do_washing_up', 'send_message', 'charge_phone', 'download_app', 'sell_thing', 'break_thing', 'have_lunch',
  'have_breakfast', 'cook_dinner', 'repair_thing', 'arrive', 'write', 'read', 'wash_car', 'water_plants', 'open_window',
  'close_window', 'cook_dish',
];

const TIMES_EXP: TimeSpec[] = [
  { id: 'twice', en: 'twice', fr: 'deux fois' },
  { id: 'three_times', en: 'three times', fr: 'trois fois' },
  { id: 'many_times', en: 'many times', alts: ['lots of times', 'several times'], fr: 'plusieurs fois' },
];

function ppWordOf(c: Clause): string {
  const v = verbOf(c);
  return c.pred.ppBeen && c.ppAdv !== 'just' ? 'been' : EN.ppForms(v)[0];
}

export const ppExperience: ItemGenerator = (ctx) => {
  const mode = ctx.rng.pick(['ever', 'ever', 'never', 'times'] as const);
  const TRIPS = ['go_country', 'go_city', 'visit_city', 'fly_country'];
  const parts = chooseParts(ctx, (p) => (mode === 'times' ? TRIPS : EXPERIENCE).includes(p.id), mode === 'ever' ? { exclude: ['i', 'i_f', 'we'] } : {});
  if (!parts) return null;
  const c: Clause =
    mode === 'ever'
      ? { ...parts, tense: 'presPerf', form: 'yn', ppAdv: 'ever' }
      : mode === 'never'
        ? { ...parts, tense: 'presPerf', ppAdv: 'never' }
        : { ...parts, tense: 'presPerf', time: ctx.rng.pick(TIMES_EXP) };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const pp = ppWordOf(c);
  const distractors: Distractor[] = [
    ...(pp === 'been' ? [{ text: 'gone', tag: 'been_gone' }] : []),
    { text: EN.pastForms(v)[0], tag: 'past_vs_pp' },
    ...(EN.isIrregular(v) ? [{ text: EN.regularEd({ base: v.base, dbl: v.dbl })[0], tag: 'irregular_pp' }] : []),
    { text: v.base, tag: 'pp_needed' },
  ];
  const have = EN.haveForm(p, n);
  return clauseItem({
    skillId: 'pp_experience',
    templateId: `ppx.${mode}.${pp === 'been' ? 'been' : 'pp'}`,
    level: 'A2',
    clause: c,
    blankRoles: mode === 'times' ? [['aux', 'verb']] : [['verb']],
    hints: [v.base],
    distractors: mode === 'times' ? presPerfDistractors(v, p, n, pp) : distractors,
    neighbours: mutate(ctx, c, ['subj', { tense: 'pastSimple', time: pickTime(ctx, ['past']) }]),
    explanation:
      (pp === 'been'
        ? `Expérience de voyage : have/has been to (on y est allé et revenu). « gone » signifierait que la personne y est encore. `
        : `Expérience (sans date précise) → present perfect : ${have} + participe passé (${v.base} → ${pp}). `) +
      (mode === 'ever' ? 'ever (déjà, au moins une fois) se place entre le sujet et le participe.' : mode === 'never' ? 'never (jamais) se place entre have/has et le participe ; pas de not.' : ''),
  });
};

export const ppJustAlreadyYet: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => RESULT.includes(p.id), { exclude: ['i', 'i_f'] });
  if (!parts) return null;
  const adv = ['lose_item', 'break_thing'].includes(parts.pred.id) ? 'just' : ctx.rng.pick(['just', 'already', 'yet', 'yet'] as const);
  const yetQuestion = adv === 'yet' && ctx.rng.chance(0.4);
  const c: Clause = {
    ...parts,
    tense: 'presPerf',
    ppAdv: adv,
    neg: adv === 'yet' && !yetQuestion,
    form: adv === 'already' && ctx.rng.chance(0.2) ? 'yn' : yetQuestion ? 'yn' : 'decl',
  };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const pp = ppWordOf(c);
  const mode = ctx.rng.pick(['adv', 'verb'] as const);
  const advDistractors: Distractor[] = (['just', 'already', 'yet', 'still', 'ever'] as const)
    .filter((a) => a !== adv)
    .filter((a) => !(adv === 'already' && a === 'just') && !(adv === 'just' && a === 'already'))
    .filter((a) => !(c.form === 'yn' && adv === 'yet' && a === 'already') && !(c.form === 'yn' && adv === 'already' && a === 'yet'))
    .map((a) => ({ text: a, tag: 'just_already_yet' }));
  const explain: Record<typeof adv, string> = {
    just: `just = « venir de » : action toute récente. Place : entre ${EN.haveForm(p, n)} et le participe (${EN.haveForm(p, n)} just ${pp}).`,
    already: `already = « déjà » (plus tôt que prévu). Place : entre have/has et le participe.`,
    yet: c.neg
      ? `yet en fin de phrase négative = « pas encore » : ${EN.haveForm(p, n)}n't ${pp} … yet.`
      : `yet en fin de question = « déjà ? » (attendu à ce moment-là).`,
  };
  return clauseItem({
    skillId: 'pp_just_already_yet',
    templateId: `ppjay.${adv}.${mode}`,
    level: 'B1',
    clause: c,
    blankRoles: mode === 'adv' ? [['adv']] : c.form === 'yn' ? [['verb']] : [['verb']],
    hints: mode === 'adv' ? [undefined] : [v.base],
    distractors: mode === 'adv' ? advDistractors : presPerfDistractors(v, p, n, pp).filter((d) => !d.text.includes(' ')),
    neighbours: mutate(ctx, c, ['subj', { tense: 'pastSimple', time: pickTime(ctx, ['past']) }]),
    instruction: mode === 'adv' ? 'Complétez avec just, already ou yet (aidez-vous de la traduction).' : undefined,
    explanation: explain[adv],
  });
};

/** Sépare « for three years » en [for] [three years] pour pouvoir viser la préposition. */
function splitTimeSlot(slots: Slot[]): Slot[] {
  const out: Slot[] = [];
  for (const sl of slots) {
    if (sl.role === 'time') {
      const text = sl.alts[0];
      const m = /^(for|since) (.+)$/.exec(text);
      if (m) {
        out.push(s(m[1], { role: 'prep' }), s(m[2], { role: 'time' }));
        continue;
      }
    }
    out.push(sl);
  }
  return out;
}

export const ppForSince: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => allowsDuration(p));
  if (!parts) return null;
  const cls = ctx.rng.chance(0.5) ? 'for' : 'since';
  const time = pickTime(ctx, [cls]);
  const mode = ctx.rng.pick(['prep', 'verb', 'verb', 'howlong'] as const);
  if (mode === 'howlong') {
    const c: Clause = { ...parts, tense: 'presPerf', form: 'wh', wh: 'dur', time };
    const v = verbOf(c);
    return clauseItem({
      skillId: 'pp_for_since',
      templateId: 'ppfs.howlong',
      level: 'B1',
      clause: c,
      blankRoles: [['aux'], ['verb']],
      hints: [undefined, v.base],
      neighbours: mutate(ctx, c, ['subj']),
      explanation: `« Depuis combien de temps… ? » = How long + have/has + sujet + participe passé ? (✗ Since when do you…).`,
    });
  }
  const c: Clause = { ...parts, tense: 'presPerf', time };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const r = realizeEn(c);
  const slots = splitTimeSlot(r.slots);
  const fr = realizeFr(c);
  const have = EN.haveForm(p, n);
  const pp = EN.ppForms(v)[0];
  if (mode === 'prep') {
    return buildItem({
      skillId: 'pp_for_since',
      templateId: `ppfs.prep.${cls}`,
      level: 'B1',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['prep'])],
      distractors: [
        { text: cls === 'for' ? 'since' : 'for', tag: 'for_since' },
        { text: 'during', tag: 'for_since' },
        { text: 'from', tag: 'for_since' },
        { text: 'ago', tag: 'for_since' },
      ],
      frDistractors: [realizeFr({ ...c, tense: 'pastSimple' })],
      explanation: cls === 'for' ? `for + durée (« ${time.en.replace(/^for /, '')} » est une durée).` : `since + point de départ (« ${time.en.replace(/^since /, '')} » est un moment précis).`,
      lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj, time: c.time }),
    });
  }
  const presentForm = EN.presentSimple(v, p, n);
  return clauseItem({
    skillId: 'pp_for_since',
    templateId: `ppfs.verb.${cls}`,
    level: 'B1',
    clause: c,
    blankRoles: [['aux', 'verb']],
    hints: [v.base],
    distractors: [
      { text: presentForm, tag: 'present_with_since' },
      ...(c.pred.k !== 'state' ? [{ text: `${EN.beForm('present', p, n)} ${EN.ing(v)}`, tag: 'present_with_since' }] : []),
      { text: EN.pastForms(v)[0], tag: 'pp_needed' },
      { text: `${have === 'has' ? 'have' : 'has'} ${pp}`, tag: 'have_wrong_person' },
    ],
    neighbours: mutate(ctx, c, ['subj', 'neg']),
    explanation: `Situation commencée dans le passé et qui dure encore (${time.en}) → present perfect : ${have} ${pp}. Le français dit « depuis » + présent, mais l'anglais exige le present perfect.`,
    extraAnswers:
      c.pred.k === 'act'
        ? clauseAnswers({ ...c, tense: 'presPerfCont' })
        : undefined,
  });
};

export const ppVsPast: ItemGenerator = (ctx) => {
  const parts = chooseParts(ctx, (p) => RESULT.includes(p.id) || EXPERIENCE.includes(p.id));
  if (!parts) return null;
  const usePast = ctx.rng.chance(0.5);
  const id = parts.pred.id;
  const kinds: ('ever' | 'never' | 'already' | 'just' | 'yetNeg')[] = [];
  if (EXPERIENCE.includes(id)) kinds.push('ever', 'never');
  if (RESULT.includes(id)) kinds.push(...(['lose_item', 'break_thing'].includes(id) ? (['just'] as const) : (['already', 'just', 'yetNeg'] as const)));
  const ppKind = ctx.rng.pick(kinds);
  const c: Clause = usePast
    ? { ...parts, tense: 'pastSimple', time: pickTimeFor(ctx, 'past', parts.pred), ...(ctx.rng.chance(0.3) && parts.subj.person !== 1 ? { form: 'yn' as const } : {}) }
    : ppKind === 'ever'
      ? { ...parts, tense: 'presPerf', form: 'yn', ppAdv: 'ever' }
      : ppKind === 'yetNeg'
        ? { ...parts, tense: 'presPerf', neg: true, ppAdv: 'yet' }
        : { ...parts, tense: 'presPerf', ppAdv: ppKind };
  const v = verbOf(c);
  const { p, n } = pn(c);
  const question = c.form === 'yn';
  const pp = ppWordOf(c);
  const have = EN.haveForm(p, n);
  const past = EN.pastForms(v)[0];
  let distractors: Distractor[];
  let blankRoles: string[][];
  let hints: (string | undefined)[];
  if (question) {
    blankRoles = [['aux'], ['verb']];
    hints = [undefined, v.base];
    distractors = [];
  } else if (usePast) {
    blankRoles = [['verb']];
    hints = [v.base];
    distractors = [
      { text: `${have} ${EN.ppForms(v)[0]}`, tag: 'pp_finished_time' },
      ...pastSimpleDistractors(v).filter((d) => d.tag !== 'do_support'),
    ];
  } else if (c.neg) {
    blankRoles = [['aux', 'verb']];
    hints = [`not / ${v.base}`];
    distractors = [
      { text: `didn't ${v.base}`, tag: 'pp_needed' },
      { text: `${have}n't ${past}`, tag: 'past_vs_pp' },
    ];
  } else {
    blankRoles = [['aux', 'adv', 'verb']];
    hints = [`${c.ppAdv} / ${v.base}`];
    distractors = [
      { text: `${c.ppAdv} ${past}`, tag: 'pp_needed' },
      { text: `${have} ${c.ppAdv} ${past}`, tag: 'past_vs_pp' },
    ];
  }
  const marker = c.time?.en ?? c.ppAdv ?? '';
  return clauseItem({
    skillId: 'pp_vs_past',
    templateId: `ppvp.${usePast ? 'past' : ppKind}.${question ? 'q' : 'd'}`,
    level: 'B1',
    clause: c,
    blankRoles,
    hints,
    distractors,
    neighbours: mutate(ctx, c, ['subj', usePast ? { tense: 'presPerf', time: undefined } : { tense: 'pastSimple', time: pickTime(ctx, ['past']) }]),
    instruction: 'Present perfect ou prétérit ?',
    explanation: usePast
      ? `« ${marker} » situe l'action à un moment passé terminé → prétérit (${past}). Le present perfect est impossible avec un moment daté.`
      : `« ${marker} » : pas de moment daté, lien avec le présent → present perfect (${have} ${pp}).`,
  });
};

/** Liste exposée pour d'autres générateurs (mini-défis). */
export const PP_RESULT_PREDICATES = RESULT;
export { cap };
