/**
 * Verbes suivis de -ing ou de to + infinitif (enjoy doing / decide to do).
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench } from '@/engine/core/text';
import { enVerb, frVerb } from '@/content/lexicon/verbs';
import { predicate } from '@/content/lexicon/predicates';
import { frPersonOf } from '@/content/lexicon/subjects';
import { enInfinitivePhrase, frInfinitivePhrase, type Clause } from '../clause';
import { buildItem, indicesByRole } from '../item';
import { lexemesOf, pickObject, pickSubject, subjectFits } from '../pick';
import type { Distractor, ItemGenerator } from '../types';

interface Pattern {
  en: string;
  form: 'ing' | 'to';
  /** Les deux constructions sont correctes (like, love, hate). */
  both?: boolean;
  fr: string;
  frPrep: 'de' | 'à' | null;
  frPron?: boolean;
  /** « avoir besoin de » */
  frBesoin?: boolean;
  tenses: ('presSimple' | 'pastSimple' | 'would')[];
  with: string[];
  lv: 'A2' | 'B1';
}

const ACTIVITIES = ['play_sport', 'play_instrument', 'go_swimming', 'cook_dinner', 'travel_train', 'read', 'take_photos', 'walk_dog', 'go_shopping', 'dance', 'sing', 'go_running', 'ride_bike', 'go_cycling', 'listen_music_bare', 'watch_tv'];
const PLANS = ['travel_world', 'visit_city', 'go_country', 'learn_language', 'buy_thing', 'stay_hotel', 'go_city', 'fly_country', 'rent_flat', 'sell_thing'];

const PATTERNS: Pattern[] = [
  { en: 'enjoy', form: 'ing', fr: 'aimer', frPrep: null, tenses: ['presSimple', 'pastSimple'], with: ACTIVITIES, lv: 'A2' },
  { en: 'love', form: 'ing', both: true, fr: 'adorer', frPrep: null, tenses: ['presSimple'], with: ACTIVITIES, lv: 'A2' },
  { en: 'hate', form: 'ing', both: true, fr: 'détester', frPrep: null, tenses: ['presSimple'], with: ['get_up', 'do_homework', 'tidy_room', 'do_shopping', 'do_washing_up', 'wait_for_bus', 'do_housework'], lv: 'A2' },
  { en: 'finish', form: 'ing', fr: 'finir', frPrep: 'de', tenses: ['pastSimple'], with: ['do_homework', 'tidy_room', 'cook_dinner', 'read', 'clean_room', 'write', 'paint_room', 'do_washing_up'], lv: 'A2' },
  { en: 'stop', form: 'ing', fr: 'arrêter', frPrep: 'de', tenses: ['pastSimple'], with: ['drink_coffee_evening', 'eat_too_much', 'play_video_games', 'watch_tv', 'work_late', 'play_sport', 'play_instrument'], lv: 'A2' },
  { en: 'avoid', form: 'ing', fr: 'éviter', frPrep: 'de', tenses: ['presSimple'], with: ['eat_too_much', 'drink_coffee_evening', 'work_late', 'take_taxi'], lv: 'B1' },
  { en: 'keep', form: 'ing', fr: 'continuer', frPrep: 'à', tenses: ['pastSimple'], with: ['play_video_games', 'watch_tv', 'work_late', 'look_for_item'], lv: 'B1' },
  { en: 'practise', form: 'ing', fr: 'entraîner', frPron: true, frPrep: 'à', tenses: ['presSimple'], with: ['speak_language', 'play_instrument', 'drive', 'swim', 'sing'], lv: 'B1' },
  { en: 'want', form: 'to', fr: 'vouloir', frPrep: null, tenses: ['presSimple', 'pastSimple'], with: PLANS, lv: 'A2' },
  { en: 'would like', form: 'to', fr: 'aimer', frPrep: null, tenses: ['would'], with: PLANS, lv: 'A2' },
  { en: 'hope', form: 'to', fr: 'espérer', frPrep: null, tenses: ['presSimple'], with: [...PLANS, 'pass_exam'], lv: 'A2' },
  { en: 'decide', form: 'to', fr: 'décider', frPrep: 'de', tenses: ['pastSimple'], with: PLANS, lv: 'A2' },
  { en: 'plan', form: 'to', fr: 'prévoir', frPrep: 'de', tenses: ['presSimple'], with: PLANS, lv: 'B1' },
  { en: 'need', form: 'to', fr: 'avoir', frBesoin: true, frPrep: 'de', tenses: ['presSimple'], with: ['do_shopping', 'charge_phone', 'see_doctor', 'tidy_room', 'call_person', 'revise_exam', 'get_up'], lv: 'A2' },
  { en: 'learn', form: 'to', fr: 'apprendre', frPrep: 'à', tenses: ['pastSimple', 'presSimple'], with: ['swim', 'drive', 'dance', 'play_instrument', 'speak_language'], lv: 'A2' },
  { en: 'agree', form: 'to', fr: 'accepter', frPrep: 'de', tenses: ['pastSimple'], with: ['help_person', 'pay_bill', 'cook_dinner', 'do_washing_up'], lv: 'B1' },
  { en: 'promise', form: 'to', fr: 'promettre', frPrep: 'de', tenses: ['pastSimple'], with: ['call_person', 'help_person', 'tidy_room', 'visit_family', 'do_homework'], lv: 'B1' },
  { en: 'refuse', form: 'to', fr: 'refuser', frPrep: 'de', tenses: ['pastSimple'], with: ['do_homework', 'tidy_room', 'pay_bill', 'help_person', 'do_washing_up'], lv: 'B1' },
  { en: 'forget', form: 'to', fr: 'oublier', frPrep: 'de', tenses: ['pastSimple'], with: ['charge_phone', 'take_umbrella', 'call_person', 'do_homework', 'water_plants', 'close_window', 'pay_bill'], lv: 'A2' },
  { en: 'try', form: 'to', fr: 'essayer', frPrep: 'de', tenses: ['pastSimple'], with: ['find_item', 'repair_thing', 'call_person', 'get_up', 'sell_thing'], lv: 'A2' },
  { en: 'manage', form: 'to', fr: 'réussir', frPrep: 'à', tenses: ['pastSimple'], with: ['find_item', 'pass_exam', 'repair_thing', 'sell_thing', 'book_table'], lv: 'B1' },
  { en: 'offer', form: 'to', fr: 'proposer', frPrep: 'de', tenses: ['pastSimple'], with: ['help_person', 'pay_bill', 'cook_dinner', 'wash_car'], lv: 'B1' },
];

export const gerundInfinitive: ItemGenerator = (ctx) => {
  const pool = PATTERNS.filter((p) => ctx.level === 'B1' || p.lv === 'A2');
  const pat = ctx.rng.pick(pool);
  const predId = ctx.rng.pick(pat.with);
  const pred = predicate(predId);
  const subj = pickSubject(ctx, { adult: !!pred.adult });
  if (!subjectFits(pred, subj)) return null;
  const obj = pred.obj ? pickObject(ctx, pred) : undefined;
  if (pred.obj && !obj) return null;
  const tense = ctx.rng.pick(pat.tenses);
  const inner: Clause = { subj, pred, obj, tense: 'presSimple' };
  // --- anglais
  const third = subj.person === 3 && subj.num === 'sg';
  const patVerbBase = pat.en === 'would like' ? 'like' : pat.en;
  const pv = enVerb(patVerbBase);
  let headSlots: Slot[];
  if (tense === 'would') headSlots = [s('would', { role: 'pverb' }), s('like', { role: 'pverb' })];
  else if (tense === 'pastSimple') headSlots = [s(EN.pastForms(pv), { role: 'pverb' })];
  else headSlots = [s(third ? EN.thirdPerson(pv) : pv.base, { role: 'pverb' })];
  const comp = enInfinitivePhrase(inner, pat.form).map((sl, i) => (i < (pat.form === 'to' ? 2 : 1) ? { ...sl, role: 'comp' } : sl));
  let compSlots: Slot[] = comp;
  if (pat.both) {
    // like / love / hate : les deux constructions sont correctes
    const vv = enVerb(pred.v);
    compSlots = [s([EN.ing(vv), `to ${vv.base}`], { role: 'comp' }), ...comp.filter((x) => x.role !== 'comp')];
  }
  const slots: Slot[] = [
    s(subj.en, { role: 'subj', proper: !!subj.proper }),
    ...headSlots,
    ...compSlots,
  ];
  // --- français
  const fp = frPersonOf(subj);
  const fv = frVerb(pat.fr);
  const frTense: FR.FrTense = tense === 'would' ? 'conditionnel' : tense === 'pastSimple' ? (pat.fr === 'vouloir' ? 'imparfait' : 'pc') : 'present';
  const frHead = FR.frVerbPhrase(fv, { tense: frTense, person: fp, gender: subj.g, plural: subj.num === 'pl', pronominal: !!pat.frPron });
  const frComp = frInfinitivePhrase(inner);
  const frWords = [subj.fr, ...frHead, ...(pat.frBesoin ? ['besoin'] : []), ...(pat.frPrep ? [pat.frPrep] : []), ...frComp];
  const fr = joinFrench([FR.frJoin(frWords)], '.');
  // --- distracteurs
  const v = enVerb(pred.v);
  const distractors: Distractor[] =
    pat.form === 'ing'
      ? [
          ...(pat.both ? [] : [{ text: `to ${v.base}`, tag: 'gerund_needed' }]),
          { text: `to ${EN.ing(v)}`, tag: 'gerund_needed' },
          { text: v.base, tag: 'gerund_needed' },
        ]
      : [
          { text: EN.ing(v), tag: 'infinitive_needed' },
          { text: `to ${EN.ing(v)}`, tag: 'infinitive_needed' },
          { text: `for ${v.base}`, tag: 'infinitive_needed' },
        ];
  return buildItem({
    skillId: 'gerund_infinitive',
    templateId: `gi.${pat.en.replace(/ /g, '_')}`,
    level: pat.lv,
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['comp'])],
    hints: [v.base],
    distractors,
    explanation:
      pat.form === 'ing'
        ? `${pat.en} est suivi de la forme en -ing : ${pat.en} ${EN.ing(v)}.${pat.both ? ` (to ${v.base} est aussi possible après ${pat.en}.)` : ''}`
        : `${pat.en} est suivi de to + base verbale : ${pat.en} to ${v.base}.`,
    lexemes: [...lexemesOf({ subj, pred, obj }), `pattern:${pat.en}`],
  });
};
