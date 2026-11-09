/**
 * Past perfect (B2) : antériorité dans un récit au passé.
 * Trois modèles : « had already … when X called », « By the time X arrived,
 * … had … », « After … had …, … ». Les distracteurs sont choisis pour être
 * fautifs dans tous les cas (le prétérit simple, correct après after, n'est
 * jamais proposé comme distracteur).
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench, lowerFirst } from '@/engine/core/text';
import { predicate } from '@/content/lexicon/predicates';
import { enVerb } from '@/content/lexicon/verbs';
import { FEMALE_NAMES, MALE_NAMES, subjectPronounEn, subjectPronounFr } from '@/content/lexicon/subjects';
import type { Subject } from '@/content/lexicon/types';
import { realizeEn, realizeFr, type Clause } from '../clause';
import { buildItem, indicesByRole } from '../item';
import { lexemesOf, pickSubject } from '../pick';
import type { Distractor, ItemGenerator } from '../types';
import { objFor } from './future';

/** Paires « action antérieure → action postérieure » (même sujet). */
const SEQUENCES: [string, string][] = [
  ['finish_work', 'go_home'],
  ['do_homework', 'watch_tv'],
  ['have_breakfast', 'go_work'],
  ['do_shopping', 'cook_dinner'],
  ['have_shower', 'get_dressed'],
  ['check_emails', 'start_work'],
  ['tidy_room', 'relax_sofa'],
  ['finish_work', 'meet_friends'],
  ['cook_dinner', 'invite_friends'],
  ['pay_bill', 'go_home'],
];

/** Actions terminées avant un autre événement (modèles « already … when » et « by the time »). */
const DONE_BEFORE = ['finish_work', 'do_homework', 'have_dinner', 'cook_dinner', 'tidy_room', 'do_shopping', 'go_home', 'write_report', 'pay_bill', 'book_table', 'do_washing_up'];

function pronounVersion(s0: Subject): Subject {
  const en = subjectPronounEn(s0);
  return { ...s0, id: `pron_${s0.id}`, en, fr: subjectPronounFr(s0), pron: true, proper: en === 'I' };
}

const lower = (sl: Slot[]) => sl.map((x, i) => (i === 0 && !x.proper ? { ...x, alts: x.alts.map(lowerFirst) } : x));
const frBody = (c: Clause) => realizeFr(c).replace(/\.$/, '');

function ppDistractors(v: EN.EnVerb, already: boolean, p: EN.Person, n: EN.GNumber): Distractor[] {
  const pp = EN.ppForms(v)[0];
  const past = EN.pastForms(v)[0];
  const adv = already ? 'already ' : '';
  const have = EN.haveForm(p, n);
  const out: Distractor[] = [{ text: `${have} ${adv}${pp}`, tag: 'pastperf_vs_presperf' }];
  if (v.base !== pp) out.push({ text: `had ${adv}${v.base}`, tag: 'pp_form' });
  if (past !== pp) out.push({ text: `had ${adv}${past}`, tag: 'irregular_pp' });
  out.push({ text: `had ${adv}${EN.ing(v)}`, tag: 'pp_form' });
  return out;
}

export const pastPerfect: ItemGenerator = (ctx) => {
  const model = ctx.rng.pick(['when', 'bytime', 'after'] as const);
  const other = ctx.rng.chance(0.5) ? { name: ctx.rng.pick(FEMALE_NAMES), g: 'f' as const } : { name: ctx.rng.pick(MALE_NAMES), g: 'm' as const };
  if (model === 'after') {
    const [a, b] = ctx.rng.pick(SEQUENCES);
    const pa = predicate(a);
    const pb = predicate(b);
    const subj = pickSubject(ctx, { pronouns: 0.4, adult: pa.adult || pb.adult });
    const first: Clause = { subj, pred: pa, obj: objFor(ctx, pa), tense: 'pastPerf' };
    const second: Clause = { subj: pronounVersion(subj), pred: pb, obj: objFor(ctx, pb), tense: 'pastSimple' };
    if ((pa.obj && !first.obj) || (pb.obj && !second.obj)) return null;
    const r1 = realizeEn(first).slots.map((sl) => ({ ...sl, role: sl.role === 'aux' || sl.role === 'verb' ? `pp_${sl.role}` : sl.role }));
    const r2 = realizeEn(second).slots;
    const slots: Slot[] = [s('After', { role: 'conn', proper: true }), ...lower(r1), s(',', { role: 'punct' }), ...lower(r2)];
    const fr = joinFrench([`${FR.frJoin(['après', 'que', ...(subj.proper && !subj.pron ? frBody(first) : lowerFirst(frBody(first))).split(' ')])}, ${lowerFirst(frBody(second))}`], '.');
    const v = enVerb(pa.v);
    const { person: p, num: n } = subj;
    return buildItem({
      skillId: 'past_perfect',
      templateId: `pp.after.${a}`,
      level: 'B2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['pp_aux', 'pp_verb'])],
      hints: [v.base],
      distractors: ppDistractors(v, false, p, n),
      explanation: `Le past perfect (had + participe passé) marque l'action la plus ancienne d'un récit au passé : ${EN.ppForms(v)[0]} a eu lieu avant la seconde action. Après after, le prétérit simple serait aussi admis, mais le présent parfait (have/has) ne l'est jamais dans un récit au passé.`,
      lexemes: [...lexemesOf({ subj, pred: pa, obj: first.obj }), `pred:${pb.id}`],
    });
  }
  const pid = ctx.rng.pick(DONE_BEFORE);
  const pa = predicate(pid);
  const subj = pickSubject(ctx, { pronouns: 0.5, adult: pa.adult });
  if (subj.en === other.name) return null;
  const main: Clause = { subj, pred: pa, obj: objFor(ctx, pa), tense: 'pastPerf', ppAdv: model === 'when' ? 'already' : undefined };
  if (pa.obj && !main.obj) return null;
  const rm = realizeEn(main).slots.map((sl) => ({ ...sl, role: sl.role === 'aux' || sl.role === 'verb' || sl.role === 'adv' ? `pp_${sl.role}` : sl.role }));
  const v = enVerb(pa.v);
  const arrivedFr = other.g === 'f' ? 'arrivée' : 'arrivé';
  let slots: Slot[];
  let fr: string;
  if (model === 'when') {
    slots = [...rm, s('when', { role: 'conn' }), s(other.name, { role: 'w', proper: true }), s('called', { role: 'w' })];
    fr = joinFrench([`${frBody(main)} quand ${other.name} a appelé`], '.');
  } else {
    slots = [s('By', { role: 'conn', proper: true }), s('the', { role: 'conn' }), s('time', { role: 'conn' }), s(other.name, { role: 'w', proper: true }), s('arrived', { role: 'w' }), s(',', { role: 'punct' }), ...lower(rm)];
    const body = frBody({ ...main, ppAdv: 'already' });
    fr = joinFrench([`quand ${other.name} est ${arrivedFr}, ${subj.proper && !subj.pron ? body : lowerFirst(body)}`], '.');
  }
  return buildItem({
    skillId: 'past_perfect',
    templateId: `pp.${model}.${pid}`,
    level: 'B2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['pp_aux', 'pp_adv', 'pp_verb'])],
    hints: [v.base],
    distractors: ppDistractors(v, model === 'when', subj.person, subj.num),
    explanation:
      model === 'when'
        ? `had already + participe passé : l'action était déjà terminée au moment où l'autre événement s'est produit (« avait déjà… quand… »). Le present perfect (have/has) est impossible dans un récit au passé.`
        : `By the time + prétérit, … had + participe passé : l'action était accomplie avant ce moment du passé (« le temps que… / quand… était arrivé »).`,
    lexemes: [...lexemesOf({ subj, pred: pa, obj: main.obj }), `pp:${model}`],
  });
};
