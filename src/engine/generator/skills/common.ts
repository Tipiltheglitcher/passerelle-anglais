/**
 * Outils partagés par les générateurs de compétences : choix cohérent des
 * constituants, distracteurs de formes verbales, mutations (traductions
 * erronées / variantes orales), petites explications.
 */
import * as EN from '@/engine/lang/en/morphology';
import { enVerb } from '@/content/lexicon/verbs';
import type { Predicate, Subject } from '@/content/lexicon/types';
import { ALL_SUBJECTS, PRONOUNS } from '@/content/lexicon/subjects';
import { NOUN_BY_ID, NOUNS } from '@/content/lexicon/nouns';
import { FREQ_ADVERBS, TIME_EXPRESSIONS, type TimeClass } from '@/content/lexicon/time';
import type { Clause, ObjChoice, Tense, TimeSpec } from '../clause';
import { personOf } from '../clause';
import type { Distractor, GenContext } from '../types';
import { pickObject, pickPredicate, pickSubject, subjectFits, type SubjectFilter } from '../pick';

export interface Parts {
  subj: Subject;
  pred: Predicate;
  obj?: ObjChoice;
}

/** Sujet + prédicat + objet compatibles (plusieurs essais). */
export function chooseParts(ctx: GenContext, predFilter: (p: Predicate) => boolean, subjFilter: SubjectFilter = {}): Parts | null {
  for (let i = 0; i < 16; i++) {
    const pred = pickPredicate(ctx, predFilter);
    if (!pred) return null;
    const subj = pickSubject(ctx, { ...subjFilter, adult: subjFilter.adult || pred.adult });
    if (!subjectFits(pred, subj)) continue;
    const obj = pickObject(ctx, pred);
    if (pred.obj && !obj) continue;
    return { subj, pred, obj };
  }
  return null;
}

export function isThird(s: Subject): boolean {
  return s.person === 3 && s.num === 'sg';
}

export function timeSpec(id: string): TimeSpec {
  const t = TIME_EXPRESSIONS.find((x) => x.id === id);
  if (!t) throw new Error(`Expression de temps inconnue : ${id}`);
  return t;
}

export function randomTime(ctx: GenContext, cls: TimeClass): TimeSpec {
  const pool = TIME_EXPRESSIONS.filter((t) => t.cls === cls && (ctx.level === 'B1' || t.lv === 'A2'));
  return ctx.rng.pick(pool);
}

// ---------- Distracteurs de formes verbales ----------

export function s3SpellingError(v: EN.EnVerb): string | null {
  const b = v.base;
  const correct = EN.thirdPerson(v);
  const naive = `${b}s`;
  if (naive !== correct) return naive; // watchs, studys, gos, haves
  if (/[^aeiou]y$/.test(b)) return null;
  if (/y$/.test(b)) return `${b.slice(0, -1)}ies`; // plaies
  return null;
}

export function ingSpellingError(v: EN.EnVerb): string | null {
  const b = v.base;
  const correct = EN.ingForms(v);
  if (b === 'be') return null;
  if (v.dbl) return `${b}ing`; // runing
  if (/ie$/.test(b)) return `${b}ing`; // lieing
  if (/[^aeiou]e$/.test(b)) return `${b}ing`; // makeing
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(b) && !correct.includes(`${b}${b[b.length - 1]}ing`)) return `${b}${b[b.length - 1]}ing`; // visitting
  if (/y$/.test(b)) return `${b.slice(0, -1)}ing`; // studing
  return null;
}

export function edSpellingError(v: EN.EnVerb): string | null {
  const b = v.base;
  const correct = EN.regularEd(v);
  if (/e$/.test(b)) return `${b}ed`; // likeed
  if (/[^aeiou]y$/.test(b)) return `${b}ed`; // studyed
  if (/[aeiou]y$/.test(b)) return `${b.slice(0, -1)}ied`; // plaied
  if (v.dbl) return `${b}ed`; // stoped
  if (v.lUK) return null; // travelled/traveled : les deux sont acceptés
  if (/[^aeiou][aeiou][^aeiouwxy]$/.test(b)) {
    const doubled = `${b}${b[b.length - 1]}ed`;
    if (!correct.includes(doubled)) return doubled; // visitted
  }
  return null;
}

/** Distracteurs pour une forme de présent simple affirmatif. */
export function presSimpleDistractors(v: EN.EnVerb, p: EN.Person, n: EN.GNumber): Distractor[] {
  const out: Distractor[] = [];
  const third = p === 3 && n === 'sg';
  if (third) {
    out.push({ text: v.base, tag: 's3_missing' });
    const sp = s3SpellingError(v);
    if (sp) out.push({ text: sp, tag: 's3_spelling' });
    out.push({ text: `is ${v.base}`, tag: 'be_plus_base' });
  } else {
    out.push({ text: EN.thirdPerson(v), tag: 's3_extra' });
    out.push({ text: `${EN.beForm('present', p, n)} ${v.base}`, tag: 'be_plus_base' });
  }
  out.push({ text: EN.ing(v), tag: 'continuous_missing_be' });
  return out;
}

/** Distracteurs pour be + -ing (présent ou passé). */
export function continuousDistractors(v: EN.EnVerb, p: EN.Person, n: EN.GNumber, tense: 'present' | 'past', neg: boolean): Distractor[] {
  const be = EN.beForm(tense, p, n);
  const beTxt = (b: string) => (neg ? (b === 'am' ? 'am not' : `${b}n't`) : b);
  const wrongBe = tense === 'present' ? (be === 'are' ? 'is' : 'are') : be === 'was' ? 'were' : 'was';
  const ingForm = EN.ing(v);
  const tenseTag = tense === 'present' ? 'tense_simple_vs_cont' : 'past_cont_vs_simple';
  const out: Distractor[] = [];
  if (neg) {
    const doAux = tense === 'present' ? EN.doForm(p, n) : 'did';
    out.push({ text: `${doAux}n't ${v.base}`, tag: tenseTag });
    out.push({ text: `not ${ingForm}`, tag: 'continuous_missing_be' });
  } else {
    out.push({ text: tense === 'present' ? EN.presentSimple(v, p, n) : EN.pastSimple(v, p, n), tag: tenseTag });
    out.push({ text: ingForm, tag: 'continuous_missing_be' });
  }
  out.push({ text: `${beTxt(be)} ${v.base}`, tag: 'continuous_missing_ing' });
  out.push({ text: `${beTxt(wrongBe)} ${ingForm}`, tag: 'be_wrong_form' });
  const sp = ingSpellingError(v);
  if (sp) out.push({ text: `${beTxt(be)} ${sp}`, tag: 'ing_spelling' });
  return out;
}

/** Distracteurs pour un prétérit affirmatif. */
export function pastSimpleDistractors(v: EN.EnVerb): Distractor[] {
  const out: Distractor[] = [];
  const past = EN.pastForms(v);
  if (EN.isIrregular(v)) {
    const reg = EN.regularEd({ base: v.base, dbl: v.dbl });
    if (!past.includes(reg[0])) out.push({ text: reg[0], tag: 'irregular_past' });
    const pp = EN.ppForms(v)[0];
    if (!past.includes(pp)) out.push({ text: pp, tag: 'past_vs_pp' });
  } else {
    const sp = edSpellingError(v);
    if (sp) out.push({ text: sp, tag: 'ed_spelling' });
  }
  out.push({ text: v.base, tag: 'tense_past' });
  out.push({ text: `did ${v.base}`, tag: 'do_support' });
  return out;
}

/** Distracteurs pour have/has + participe passé. */
export function presPerfDistractors(v: EN.EnVerb, p: EN.Person, n: EN.GNumber, ppWord: string): Distractor[] {
  const have = EN.haveForm(p, n);
  const wrongHave = have === 'has' ? 'have' : 'has';
  const out: Distractor[] = [];
  const past = EN.pastForms(v)[0];
  if (past !== ppWord && v.base !== 'be') out.push({ text: `${have} ${past}`, tag: 'past_vs_pp' });
  if (EN.isIrregular(v)) {
    const reg = EN.regularEd({ base: v.base, dbl: v.dbl })[0];
    if (reg !== ppWord) out.push({ text: `${have} ${reg}`, tag: 'irregular_pp' });
  }
  out.push({ text: `${wrongHave} ${ppWord}`, tag: 'have_wrong_person' });
  out.push({ text: v.base === 'be' ? EN.pastSimple(v, p, n) : past, tag: 'pp_needed' });
  return out;
}

// ---------- Mutations ----------

/** Sujet différent (autre personne grammaticale française). */
export function otherSubject(ctx: GenContext, s: Subject, adult = false): Subject {
  const pool = ALL_SUBJECTS.filter(
    (x) => x.id !== s.id && (x.person !== s.person || x.num !== s.num || x.g !== s.g) && (!adult || !x.child) && x.fr !== s.fr,
  );
  return ctx.rng.pick(pool);
}

export function otherPronoun(ctx: GenContext, s: Subject): Subject {
  const pool = PRONOUNS.filter((x) => x.fr !== s.fr);
  return ctx.rng.pick(pool);
}

export function otherObject(ctx: GenContext, c: Clause): ObjChoice | undefined {
  if (!c.obj || !c.pred.obj) return undefined;
  for (let i = 0; i < 6; i++) {
    const o = pickObject(ctx, c.pred, { det: c.obj.det });
    if (o && o.noun.id !== c.obj.noun.id) return { ...o, det: c.obj.det };
  }
  // repli : un nom de même catégorie
  const cat = c.obj.noun.c[0];
  const pool = NOUNS.filter((nn) => nn.c.includes(cat) && nn.id !== c.obj!.noun.id);
  return pool.length ? { noun: ctx.rng.pick(pool), det: c.obj.det, plural: c.obj.plural } : undefined;
}

export type Mutation = 'neg' | 'subj' | 'obj' | { tense: Tense; time?: TimeSpec };

/** Propositions voisines : mêmes mots, sens différent. */
export function mutate(ctx: GenContext, c: Clause, muts: Mutation[]): Clause[] {
  const out: Clause[] = [];
  for (const m of muts) {
    if (m === 'neg') {
      if (c.freq?.neg) out.push({ ...c, freq: undefined, neg: false });
      // « don't sometimes / don't rarely » sonne faux : la variante négative crédible est « never »
      else if (c.freq && (c.freq.id === 'sometimes' || c.freq.id === 'rarely') && !c.neg) out.push({ ...c, freq: FREQ_ADVERBS.find((f) => f.id === 'never') });
      else out.push({ ...c, neg: !c.neg });
    } else if (m === 'subj') out.push({ ...c, subj: otherSubject(ctx, c.subj, c.pred.adult) });
    else if (m === 'obj') {
      const o = otherObject(ctx, c);
      if (o) out.push({ ...c, obj: o });
    } else out.push({ ...c, tense: m.tense, time: m.time ?? c.time });
  }
  return out;
}

export function verbOf(c: Clause): EN.EnVerb {
  return enVerb(c.pred.v);
}

export function pn(c: Clause): { p: EN.Person; n: EN.GNumber } {
  return personOf(c);
}

/** Règle d'orthographe de la 3ᵉ personne appliquée à un verbe. */
export function s3Rule(v: EN.EnVerb): string {
  const f = EN.thirdPerson(v);
  if (v.base === 'have') return 'have devient has (irrégulier)';
  if (f.endsWith('ies')) return `consonne + y → -ies : ${v.base} → ${f}`;
  if (f.endsWith('es') && !v.base.endsWith('e')) return `-es après -s, -sh, -ch, -x, -o : ${v.base} → ${f}`;
  return `on ajoute -s : ${v.base} → ${f}`;
}

export function ingRule(v: EN.EnVerb): string {
  const f = EN.ing(v);
  const b = v.base;
  if (/ie$/.test(b)) return `-ie → -ying : ${b} → ${f}`;
  if (v.dbl) return `consonne finale doublée : ${b} → ${f}`;
  if (/[^aeiou]e$/.test(b) && f === `${b.slice(0, -1)}ing`) return `on retire le -e final : ${b} → ${f}`;
  return `${b} → ${f}`;
}

export function edRule(v: EN.EnVerb): string {
  const f = EN.pastForms(v)[0];
  const b = v.base;
  if (EN.isIrregular(v)) return `verbe irrégulier : ${b} → ${f}`;
  if (/e$/.test(b)) return `verbe en -e : on ajoute -d (${b} → ${f})`;
  if (/[^aeiou]y$/.test(b)) return `consonne + y → -ied (${b} → ${f})`;
  if (v.dbl) return `consonne finale doublée (${b} → ${f})`;
  if (v.lUK) return `${b} → ${f} (britannique) ou ${EN.pastForms(v)[1] ?? f} (américain)`;
  return `régulier : ${b} → ${f}`;
}

export function nounById(id: string) {
  return NOUN_BY_ID[id];
}

/** Majuscule de la première lettre (pour les indices affichés). */
export function cap(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}
