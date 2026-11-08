/**
 * Conditionnels de type 0, 1 et 2 à partir de paires condition → conséquence.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench, lowerFirst } from '@/engine/core/text';
import { predicate } from '@/content/lexicon/predicates';
import { enVerb } from '@/content/lexicon/verbs';
import { subjectPronounEn, subjectPronounFr } from '@/content/lexicon/subjects';
import type { Subject } from '@/content/lexicon/types';
import { realizeEn, realizeFr, type Clause, type Tense } from '../clause';
import { buildItem, indicesByRole } from '../item';
import { lexemesOf, pickSubject } from '../pick';
import type { Distractor, ItemGenerator } from '../types';
import { objFor } from './future';

type CondType = 'zero' | 'first' | 'second';

interface Pair {
  c: string;
  cObj?: string;
  r: string;
  rObj?: string;
  rNeg?: boolean;
  types: CondType[];
}

const PAIRS: Pair[] = [
  { c: 'be_tired', r: 'go_bed_early', types: ['zero', 'first'] },
  { c: 'have_time', r: 'visit_family', rObj: 'grandparents', types: ['first', 'second'] },
  { c: 'miss_bus', r: 'be_late', types: ['zero', 'first'] },
  { c: 'study_hard', r: 'pass_exam', types: ['first', 'second'] },
  { c: 'be_hungry', r: 'cook_dish', rObj: 'sandwich', types: ['zero', 'first'] },
  { c: 'have_money', r: 'buy_thing', rObj: 'car', types: ['first', 'second'] },
  { c: 'win_lottery', r: 'travel_world', types: ['second'] },
  { c: 'be_rich', r: 'buy_thing', rObj: 'house', types: ['second'] },
  { c: 'be_ill', r: 'stay_home', types: ['zero', 'first'] },
  { c: 'drink_coffee_evening', r: 'sleep_well', rNeg: true, types: ['zero'] },
  { c: 'eat_too_much', r: 'feel_sick', types: ['zero'] },
  { c: 'be_late', r: 'take_taxi', types: ['zero', 'first'] },
  { c: 'have_car', r: 'drive_work', types: ['second'] },
  { c: 'be_holiday', r: 'go_swimming', types: ['second'] },
  { c: 'live_country', cObj: 'japan', r: 'learn_language', rObj: 'japanese', types: ['second'] },
  { c: 'get_up', r: 'have_breakfast', types: ['zero'] },
  { c: 'be_cold', r: 'put_on_jumper', types: ['zero', 'first'] },
  { c: 'forget_item', cObj: 'umbrella', r: 'get_wet', types: ['first'] },
  { c: 'be_thirsty', r: 'drink', rObj: 'water', types: ['zero'] },
  { c: 'have_time', r: 'go_cinema', types: ['first', 'second'] },
  { c: 'live_city', cObj: 'london', r: 'visit_museum', rObj: 'museum', types: ['second'] },
  { c: 'speak_language', cObj: 'spanish', r: 'travel_world', types: ['second'] },
];

const TENSES: Record<CondType, { cond: Tense; res: Tense; frCond: FR.FrTense; frRes: FR.FrTense }> = {
  zero: { cond: 'presSimple', res: 'presSimple', frCond: 'present', frRes: 'present' },
  first: { cond: 'presSimple', res: 'will', frCond: 'present', frRes: 'futur' },
  second: { cond: 'pastSimple', res: 'would', frCond: 'imparfait', frRes: 'conditionnel' },
};

function pronounVersion(s0: Subject): Subject {
  const en = subjectPronounEn(s0);
  return { ...s0, en, fr: subjectPronounFr(s0), pron: true, proper: en === 'I' };
}

function makeConditional(type: CondType): ItemGenerator {
  return (ctx) => {
    const pool = PAIRS.filter((p) => p.types.includes(type));
    const pair = ctx.rng.pick(pool);
    const pc = predicate(pair.c);
    const pr = predicate(pair.r);
    if (ctx.level === 'A2' && (pc.lv === 'B1' || pr.lv === 'B1')) return null;
    const subj = pickSubject(ctx, { pronouns: 0.7, adult: pc.adult || pr.adult });
    const t = TENSES[type];
    const cond: Clause = { subj, pred: pc, obj: objFor(ctx, pc, pair.cObj), tense: t.cond, frTense: t.frCond };
    const res: Clause = { subj: pronounVersion(subj), pred: pr, obj: objFor(ctx, pr, pair.rObj), tense: t.res, neg: !!pair.rNeg };
    if ((pc.obj && !cond.obj) || (pr.obj && !res.obj)) return null;
    const rc = realizeEn(cond);
    const rr = realizeEn(res);
    // « were » au conditionnel 2 avec be
    const condSlots = rc.slots.map((sl) => {
      const role = sl.role === 'aux' || sl.role === 'verb' ? `c_${sl.role}` : sl.role;
      if (type === 'second' && pc.v === 'be' && sl.role === 'aux' && sl.alts[0] === 'was') return { ...sl, role, alts: ['were', 'was'] };
      return { ...sl, role };
    });
    const resSlots = rr.slots.map((sl) => ({ ...sl, role: sl.role === 'aux' || sl.role === 'verb' ? `r_${sl.role}` : sl.role }));
    const lowerFirstSlot = (sl: Slot[]) => sl.map((x, i) => (i === 0 && !x.proper ? { ...x, alts: x.alts.map(lowerFirst) } : x));
    const slots: Slot[] = [s('If', { role: 'if', proper: true }), ...lowerFirstSlot(condSlots), s(',', { role: 'punct' }), ...lowerFirstSlot(resSlots)];
    const altOrder: Slot[] = [...resSlots, s('if', { role: 'if' }), ...lowerFirstSlot(condSlots)];
    const frCond = realizeFr(cond).replace(/\.$/, '');
    const frRes = realizeFr(res).replace(/\.$/, '');
    const fr = joinFrench([`${FR.frJoin(['si', ...(subj.proper && !subj.pron ? frCond : lowerFirst(frCond)).split(' ')])}, ${lowerFirst(frRes)}`], '.');
    const blankCond = type === 'zero' || ctx.rng.chance(0.5);
    const baseC = cond.pred.v;
    const baseR = res.pred.v;
    const vC = enVerb(baseC);
    const vR = enVerb(baseR);
    const condForm = condSlots.filter((x) => x.role === 'c_aux' || x.role === 'c_verb').map((x) => x.alts[0]).join(' ');
    // forme « tête » de la proposition en if (be / have / verbe lexical)
    const condWord = (tense: 'present' | 'past') =>
      baseC === 'be'
        ? EN.beForm(tense, subj.person, subj.num)
        : tense === 'present'
          ? EN.presentSimple(vC, subj.person, subj.num)
          : EN.pastSimple(vC, subj.person, subj.num);
    let distractors: Distractor[];
    if (blankCond) {
      distractors = [
        { text: `will ${baseC}`, tag: 'conditional_will_in_if' },
        { text: `would ${baseC}`, tag: 'conditional_will_in_if' },
        type === 'second'
          ? { text: condWord('present'), tag: 'second_conditional' }
          : { text: condWord('past'), tag: 'first_conditional' },
      ];
    } else {
      const neg = !!res.neg;
      distractors =
        type === 'first'
          ? [
              { text: `${neg ? "wouldn't" : 'would'} ${baseR}`, tag: 'first_conditional' },
              { text: `${neg ? "won't" : 'will'} to ${baseR}`, tag: 'will_to' },
              { text: `${neg ? "won't" : 'will'} ${EN.thirdPerson(vR)}`, tag: 'will_inflected' },
            ]
          : [
              { text: `${neg ? "won't" : 'will'} ${baseR}`, tag: 'second_conditional' },
              { text: `${neg ? "wouldn't" : 'would'} to ${baseR}`, tag: 'modal_to' },
              { text: `${neg ? "wouldn't" : 'would'} ${EN.pastSimple(vR)}`, tag: 'second_conditional' },
            ];
    }
    const why: Record<CondType, string> = {
      zero: `Conditionnel 0 (vérité générale, habitude) : If + présent, présent. Jamais de will après if.`,
      first: `Conditionnel 1 (situation possible dans le futur) : If + présent (${condForm}), will + base verbale. Pas de will dans la proposition en if.`,
      second: `Conditionnel 2 (situation imaginaire) : If + prétérit (${condForm}), would + base verbale.${pc.v === 'be' ? ' Avec be, on préfère were à toutes les personnes (If I were…).' : ''}`,
    };
    return buildItem({
      skillId: `${type}_conditional`,
      templateId: `cond.${type}.${blankCond ? 'if' : 'main'}.${pair.c}`,
      level: type === 'zero' ? 'A2' : 'B1',
      slots,
      end: '.',
      altOrders: [altOrder],
      fr,
      blankGroups: [blankCond ? indicesByRole(slots, ['c_aux', 'c_verb']) : indicesByRole(slots, ['r_aux', 'r_verb'])],
      hints: [blankCond ? (pair.c.startsWith('be_') ? 'be' : baseC) : `${res.neg ? 'not / ' : ''}${baseR}`],
      distractors,
      explanation: why[type],
      lexemes: [...lexemesOf({ subj, pred: pc, obj: cond.obj }), `pred:${pr.id}`, `verb:${pr.v}`],
    });
  };
}

export const zeroConditional = makeConditional('zero');
export const firstConditional = makeConditional('first');
export const secondConditional = makeConditional('second');
