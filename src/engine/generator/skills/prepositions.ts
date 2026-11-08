/**
 * Prépositions de temps (at / on / in) et de lieu (in, on, under, next to…).
 */
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench } from '@/engine/core/text';
import { NOUN_BY_ID } from '@/content/lexicon/nouns';
import { frPersonOf } from '@/content/lexicon/subjects';
import { allowsHabit } from '@/content/lexicon/predicates';
import { realizeEn, realizeFr, type Clause } from '../clause';
import { buildItem, indicesByRole } from '../item';
import { lexemesOf, pickSubject } from '../pick';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { chooseParts } from './common';

interface TimePrep {
  prep: string[];
  rest: string[];
  fr: string;
  kind: 'clock' | 'part' | 'holiday' | 'day' | 'date' | 'month' | 'year' | 'season';
}

const T: TimePrep[] = [
  { prep: ['at'], rest: ["seven o'clock", 'seven', '7', '7:00'], fr: 'à 7 heures', kind: 'clock' },
  { prep: ['at'], rest: ['half past six', '6:30', 'six thirty'], fr: 'à 6 heures et demie', kind: 'clock' },
  { prep: ['at'], rest: ['midnight'], fr: 'à minuit', kind: 'clock' },
  { prep: ['at'], rest: ['noon', 'midday'], fr: 'à midi', kind: 'clock' },
  { prep: ['at'], rest: ['lunchtime'], fr: "à l'heure du déjeuner", kind: 'clock' },
  { prep: ['at'], rest: ['night'], fr: 'la nuit', kind: 'part' },
  { prep: ['at', 'on'], rest: ['the weekend', 'weekends'], fr: 'le week-end', kind: 'part' },
  { prep: ['at'], rest: ['Christmas'], fr: 'à Noël', kind: 'holiday' },
  { prep: ['at'], rest: ['Easter'], fr: 'à Pâques', kind: 'holiday' },
  { prep: ['on'], rest: ['Monday', 'Mondays'], fr: 'le lundi', kind: 'part' },
  { prep: ['on'], rest: ['Saturday'], fr: 'samedi', kind: 'day' },
  { prep: ['on'], rest: ['Friday evening'], fr: 'vendredi soir', kind: 'day' },
  { prep: ['on'], rest: ['Sunday morning'], fr: 'dimanche matin', kind: 'day' },
  { prep: ['on'], rest: ['my birthday'], fr: 'le jour de mon anniversaire', kind: 'day' },
  { prep: ['on'], rest: ['5 May', 'May 5th', 'May 5', '5th May', 'the fifth of May'], fr: 'le 5 mai', kind: 'date' },
  { prep: ['on'], rest: ['12 October', 'October 12th', 'October 12', '12th October', 'the twelfth of October'], fr: 'le 12 octobre', kind: 'date' },
  { prep: ['on'], rest: ['Christmas Day'], fr: 'le jour de Noël', kind: 'day' },
  { prep: ['in'], rest: ['July'], fr: 'en juillet', kind: 'month' },
  { prep: ['in'], rest: ['March'], fr: 'en mars', kind: 'month' },
  { prep: ['in'], rest: ['December'], fr: 'en décembre', kind: 'month' },
  { prep: ['in'], rest: ['1998'], fr: 'en 1998', kind: 'year' },
  { prep: ['in'], rest: ['2010'], fr: 'en 2010', kind: 'year' },
  { prep: ['in'], rest: ['the morning'], fr: 'le matin', kind: 'part' },
  { prep: ['in'], rest: ['the afternoon'], fr: "l'après-midi", kind: 'part' },
  { prep: ['in'], rest: ['the evening'], fr: 'le soir', kind: 'part' },
  { prep: ['in'], rest: ['summer', 'the summer'], fr: 'en été', kind: 'season' },
  { prep: ['in'], rest: ['winter', 'the winter'], fr: 'en hiver', kind: 'season' },
  { prep: ['in'], rest: ['spring', 'the spring'], fr: 'au printemps', kind: 'season' },
  { prep: ['in'], rest: ['autumn', 'the autumn', 'fall', 'the fall'], fr: 'en automne', kind: 'season' },
];

const PREP_WHY: Record<string, string> = {
  at: 'at + heure ou moment précis (at 7, at midnight, at night, at the weekend, at Christmas).',
  on: 'on + jour ou date (on Monday, on 5 May, on my birthday).',
  in: 'in + mois, année, saison ou partie de la journée (in July, in 1998, in summer, in the morning).',
};

function timeDistractors(correct: string[]): Distractor[] {
  return ['at', 'on', 'in', 'during']
    .filter((p) => !correct.includes(p))
    .map((p) => ({ text: p, tag: 'prep_time' }));
}

export const prepositionsTime: ItemGenerator = (ctx) => {
  const tp = ctx.rng.pick(T);
  let c: Clause | null = null;
  if (tp.kind === 'year' || (tp.kind === 'month' && ctx.rng.chance(0.4))) {
    // « She was born in 1998. »
    const subj = pickSubject(ctx, { pronouns: 0.5 });
    const be = subj.person === 2 || subj.num === 'pl' ? 'were' : 'was';
    const slots: Slot[] = [s(subj.en, { role: 'subj', proper: !!subj.proper }), s(be, { role: 'be' }), s('born', { role: 'verb' }), s(tp.prep, { role: 'prep' }), s(tp.rest, { role: 'time', proper: true })];
    const fp = frPersonOf(subj);
    const pp = FR.participle({ inf: 'naître', pp: 'né' }, subj.g, subj.num === 'pl');
    const fr = joinFrench([FR.frJoin([subj.fr, FR.present(FR.ETRE, fp), pp, tp.fr])], '.');
    return mk(ctx, slots, '.', fr, tp, [`subj:${subj.id}`]);
  }
  if (tp.kind === 'date') {
    const subj = ctx.rng.pick([{ en: 'My birthday', fr: 'mon anniversaire' }, { en: 'The exam', fr: "l'examen" }, { en: 'The party', fr: 'la fête' }, { en: 'Our wedding anniversary', fr: 'notre anniversaire de mariage' }]);
    const slots: Slot[] = [s(subj.en, { role: 'subj', proper: true }), s('is', { role: 'be' }), s(tp.prep, { role: 'prep' }), s(tp.rest, { role: 'time', proper: true })];
    const fr = joinFrench([FR.frJoin([subj.fr, 'est', tp.fr])], '.');
    return mk(ctx, slots, '.', fr, tp, []);
  }
  if (tp.kind === 'clock') {
    const r0 = tp.rest[0];
    const okPred = (id: string) =>
      r0 === 'midnight' ? id === 'go_bed_t' : r0 === 'noon' || r0 === 'lunchtime' ? id === 'have_lunch_t' : id !== 'go_bed_t' && id !== 'have_lunch_t';
    const parts = chooseParts(ctx, (p) => !!p.routine && okPred(p.id));
    if (!parts) return null;
    c = { ...parts, tense: 'presSimple' };
  } else if (tp.kind === 'part' || tp.kind === 'holiday' || tp.kind === 'season') {
    const parts = chooseParts(ctx, (p) => allowsHabit(p) && !p.be && !p.routine && p.id !== 'go_place' && (tp.kind !== 'season' || ['go_skiing', 'go_swimming', 'go_cycling', 'play_sport', 'travel_train', 'visit_family'].includes(p.id)));
    if (!parts) return null;
    c = { ...parts, tense: 'presSimple' };
  } else {
    const parts = chooseParts(ctx, (p) => ['go_cinema', 'visit_family', 'play_sport', 'meet_friends', 'have_meeting', 'go_city', 'see_doctor', 'cook_dinner', 'go_place'].includes(p.id));
    if (!parts) return null;
    c = { ...parts, tense: ctx.rng.pick(['goingTo', 'pastSimple'] as const) };
  }
  const r = realizeEn(c);
  const slots: Slot[] = [...r.slots, s(tp.prep, { role: 'prep' }), s(tp.rest, { role: 'time', proper: /^[A-Z0-9]/.test(tp.rest[0]) })];
  const fr = joinFrench([`${realizeFr(c).replace(/\.$/, '')} ${tp.fr}`], '.');
  return mk(ctx, slots, '.', fr, tp, lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj }));
};

function mk(_ctx: GenContext, slots: Slot[], end: '.' | '?', fr: string, tp: TimePrep, lex: string[]) {
  return buildItem({
    skillId: 'prepositions_time',
    templateId: `pt.${tp.prep[0]}.${tp.kind}`,
    level: 'A2',
    slots,
    end,
    fr,
    blankGroups: [indicesByRole(slots, ['prep'])],
    distractors: timeDistractors(tp.prep),
    explanation: tp.prep.length > 1 ? `${PREP_WHY.at} En anglais américain, on dit aussi on the weekend.` : PREP_WHY[tp.prep[0]],
    lexemes: [...lex, `tprep:${tp.rest[0]}`],
  });
}

// ---------------------------------------------------------------------------

interface PObj {
  en: string;
  fr: string;
  g: 'm' | 'f';
  pl?: boolean;
  kind: 'animal' | 'small' | 'medium' | 'food';
}

const OBJS: PObj[] = [
  { en: 'cat', fr: 'chat', g: 'm', kind: 'animal' },
  { en: 'dog', fr: 'chien', g: 'm', kind: 'animal' },
  { en: 'keys', fr: 'clés', g: 'f', pl: true, kind: 'small' },
  { en: 'phone', fr: 'téléphone', g: 'm', kind: 'small' },
  { en: 'book', fr: 'livre', g: 'm', kind: 'small' },
  { en: 'glasses', fr: 'lunettes', g: 'f', pl: true, kind: 'small' },
  { en: 'remote control', fr: 'télécommande', g: 'f', kind: 'small' },
  { en: 'laptop', fr: 'ordinateur portable', g: 'm', kind: 'small' },
  { en: 'bag', fr: 'sac', g: 'm', kind: 'medium' },
  { en: 'shoes', fr: 'chaussures', g: 'f', pl: true, kind: 'medium' },
  { en: 'umbrella', fr: 'parapluie', g: 'm', kind: 'medium' },
  { en: 'milk', fr: 'lait', g: 'm', kind: 'food' },
];

interface PRef {
  en: string;
  fr: string;
  g: 'm' | 'f';
  rels: string[];
  ok: PObj['kind'][];
}

const REFS: PRef[] = [
  { en: 'table', fr: 'table', g: 'f', rels: ['on', 'under', 'next to'], ok: ['animal', 'small', 'medium', 'food'] },
  { en: 'bed', fr: 'lit', g: 'm', rels: ['on', 'under', 'next to'], ok: ['animal', 'small', 'medium'] },
  { en: 'sofa', fr: 'canapé', g: 'm', rels: ['on', 'under', 'behind', 'next to'], ok: ['animal', 'small', 'medium'] },
  { en: 'chair', fr: 'chaise', g: 'f', rels: ['on', 'under', 'next to'], ok: ['animal', 'small', 'medium'] },
  { en: 'desk', fr: 'bureau', g: 'm', rels: ['on', 'under'], ok: ['animal', 'small', 'medium'] },
  { en: 'box', fr: 'boîte', g: 'f', rels: ['in', 'on', 'next to'], ok: ['animal', 'small'] },
  { en: 'drawer', fr: 'tiroir', g: 'm', rels: ['in'], ok: ['small'] },
  { en: 'fridge', fr: 'frigo', g: 'm', rels: ['in'], ok: ['food'] },
  { en: 'door', fr: 'porte', g: 'f', rels: ['behind', 'next to', 'in front of'], ok: ['animal', 'medium'] },
  { en: 'window', fr: 'fenêtre', g: 'f', rels: ['next to', 'in front of'], ok: ['animal', 'medium'] },
  { en: 'car', fr: 'voiture', g: 'f', rels: ['in', 'behind', 'in front of', 'next to'], ok: ['animal', 'small', 'medium'] },
];

const REL_FR: Record<string, { words: string[]; de?: boolean }> = {
  on: { words: ['sur'] },
  under: { words: ['sous'] },
  'next to': { words: ['à', 'côté'], de: true },
  behind: { words: ['derrière'] },
  'in front of': { words: ['devant'] },
  in: { words: ['dans'] },
  opposite: { words: ['en', 'face'], de: true },
  near: { words: ['près'], de: true },
};

const REL_SYNONYMS: Record<string, string[]> = {
  'next to': ['next to', 'beside'],
  under: ['under', 'underneath'],
  near: ['near', 'close to'],
  opposite: ['opposite', 'across from'],
};

const BUILDINGS = ['bank', 'post_office', 'bakery', 'pharmacy', 'cafe', 'cinema', 'supermarket', 'station', 'hotel', 'museum', 'library', 'church', 'restaurant', 'bookshop'];

function placeDistractors(rel: string): Distractor[] {
  const pool = ['in', 'on', 'under', 'next to', 'behind', 'in front of', 'opposite', 'between'].filter(
    (r) => r !== rel && !(REL_SYNONYMS[rel] ?? []).includes(r),
  );
  const extra: Distractor[] = rel === 'in front of' ? [{ text: 'in front', tag: 'prep_place' }] : rel === 'next to' ? [{ text: 'next', tag: 'prep_place' }] : [];
  return [...extra, ...pool.slice(0, 4).map((r) => ({ text: r, tag: 'prep_place' }))];
}

export const prepositionsPlace: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['object', 'object', 'town', 'at'] as const);
  if (kind === 'object') {
    const obj = ctx.rng.pick(OBJS);
    const refs = REFS.filter((r) => r.ok.includes(obj.kind));
    const ref = ctx.rng.pick(refs);
    const rels = obj.kind === 'food' ? ref.rels.filter((r) => (ref.en === 'fridge' ? r === 'in' : r === 'on')) : ref.rels;
    if (!rels.length) return null;
    const rel = ctx.rng.pick(rels);
    const own = obj.kind === 'animal' || obj.kind === 'food' ? 'The' : ctx.rng.pick(['The', 'My']);
    const be = obj.pl ? 'are' : 'is';
    const slots: Slot[] = [s(own, { role: 'det', proper: true }), s(obj.en, { role: 'obj' }), s(be, { role: 'be' }), s(REL_SYNONYMS[rel] ?? [rel], { role: 'prep' }), s('the', { role: 'det2' }), s(ref.en === 'TV' ? 'TV' : ref.en, { role: 'ref' })];
    const frObj = own === 'My' ? FR.frNP({ fr: obj.fr, g: obj.g }, 'poss', { plural: !!obj.pl, possessor: { person: 0 } }) : FR.frNP({ fr: obj.fr, g: obj.g }, 'def', { plural: !!obj.pl });
    const rf = REL_FR[rel];
    const frRef = FR.frNP({ fr: ref.fr, g: ref.g }, 'def', { prep: rf.de ? 'de' : null });
    const fr = joinFrench([FR.frJoin([...frObj, obj.pl ? 'sont' : 'est', ...rf.words, ...frRef])], '.');
    return buildItem({
      skillId: 'prepositions_place',
      templateId: `pl.obj.${rel.replace(/ /g, '_')}`,
      level: 'A2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['prep'])],
      distractors: placeDistractors(rel),
      explanation: `« ${rf.words.join(' ')}${rf.de ? ' de' : ''} » = ${rel}. ${rel === 'in front of' ? "N'oubliez pas of : in front of." : rel === 'next to' ? "N'oubliez pas to : next to." : ''}`,
      lexemes: [`pobj:${obj.en}`, `pref:${ref.en}`],
    });
  }
  if (kind === 'town') {
    const ids = ctx.rng.sample(BUILDINGS, 3);
    const [a, b, c] = ids.map((id) => NOUN_BY_ID[id]).filter(Boolean);
    if (!a || !b || !c) return null;
    const rel = ctx.rng.pick(['next to', 'opposite', 'behind', 'between', 'near', 'in front of']);
    const nEn = (n: typeof a) => [n.en, ...n.syn].map((x) => `the ${x}`);
    const slots: Slot[] = [s('The', { role: 'det', proper: true }), s([a.en, ...a.syn], { role: 'obj' }), s('is', { role: 'be' }), s(REL_SYNONYMS[rel] ?? [rel], { role: 'prep' }), s(nEn(b), { role: 'ref' }), ...(rel === 'between' ? [s('and', { role: 'and' }), s(nEn(c), { role: 'ref2' })] : [])];
    const frA = FR.frNP({ fr: a.fr, g: a.g }, 'def');
    let frRest: string[];
    if (rel === 'between') frRest = ['entre', ...FR.frNP({ fr: b.fr, g: b.g }, 'def'), 'et', ...FR.frNP({ fr: c.fr, g: c.g }, 'def')];
    else {
      const rf = REL_FR[rel];
      frRest = [...rf.words, ...FR.frNP({ fr: b.fr, g: b.g }, 'def', { prep: rf.de ? 'de' : null })];
    }
    const fr = joinFrench([FR.frJoin([...frA, 'est', ...frRest])], '.');
    return buildItem({
      skillId: 'prepositions_place',
      templateId: `pl.town.${rel.replace(/ /g, '_')}`,
      level: 'A2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['prep'])],
      distractors: placeDistractors(rel),
      explanation: rel === 'between' ? 'between … and … = entre … et …' : rel === 'opposite' ? 'opposite = en face de (sans of).' : `${rel} = ${REL_FR[rel]?.words.join(' ')}${REL_FR[rel]?.de ? ' de' : ''}.`,
      lexemes: ids.map((id) => `noun:${id}`),
    });
  }
  // at + lieu ponctuel
  const places = [
    { en: 'the station', fr: 'à la gare' },
    { en: 'home', fr: 'à la maison' },
    { en: 'work', fr: 'au travail' },
    { en: 'school', fr: "à l'école" },
    { en: 'the airport', fr: "à l'aéroport" },
    { en: 'the bus stop', fr: "à l'arrêt de bus" },
    { en: 'a party', fr: 'à une fête' },
    { en: 'the doctor\'s', fr: 'chez le médecin' },
  ];
  const pl = ctx.rng.pick(places);
  const subj = pickSubject(ctx, { pronouns: 0.5, adult: pl.en === 'work' });
  const past = ctx.rng.chance(0.4);
  const be = past ? (subj.person === 2 || subj.num === 'pl' ? 'were' : subj.person === 1 ? 'was' : 'was') : subj.num === 'pl' || subj.person === 2 ? 'are' : subj.person === 1 ? 'am' : 'is';
  const slots: Slot[] = [s(subj.en, { role: 'subj', proper: !!subj.proper }), s(be, { role: 'be' }), s('at', { role: 'prep' }), ...pl.en.split(' ').map((w) => s(w, { role: 'place' }))];
  const fp = frPersonOf(subj);
  const fr = joinFrench([FR.frJoin([subj.fr, past ? FR.imparfait(FR.ETRE, fp) : FR.present(FR.ETRE, fp), ...pl.fr.split(' ')])], '.');
  return buildItem({
    skillId: 'prepositions_place',
    templateId: `pl.at.${pl.en.replace(/\W/g, '_')}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['prep'])],
    distractors: [
      { text: 'in', tag: 'prep_place' },
      { text: 'to', tag: 'prep_place' },
      { text: 'on', tag: 'prep_place' },
    ],
    explanation: `at + lieu vu comme un point ou une activité : at home, at work, at school, at the station, at a party. « to » indique un mouvement (go to).`,
    lexemes: [`subj:${subj.id}`, `atplace:${pl.en}`],
  });
};
