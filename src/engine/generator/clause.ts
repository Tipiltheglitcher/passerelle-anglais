/**
 * Réalisation d'un « cadre de proposition » (sujet + prédicat + temps + polarité
 * + forme + compléments) en anglais ET en français.
 *
 * L'anglais est produit sous forme de cases (Slot) annotées par leur fonction
 * (sujet, auxiliaire, verbe…), ce qui permet ensuite de créer des trous, des
 * distracteurs, des tuiles, etc. Le français est produit sous forme de texte
 * correctement accordé, élidé et ponctué.
 */
import { s, type Slot } from '@/engine/core/lattice';
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { joinFrench } from '@/engine/core/text';
import { enVerb, frVerb } from '@/content/lexicon/verbs';
import type { EnDet, Noun, Predicate, Subject } from '@/content/lexicon/types';
import type { FreqAdverb } from '@/content/lexicon/time';
import { frPersonOf, SUBJECT_ALTS } from '@/content/lexicon/subjects';

export type Tense =
  | 'presSimple'
  | 'presCont'
  | 'pastSimple'
  | 'pastCont'
  | 'presPerf'
  | 'presPerfCont'
  | 'will'
  | 'would'
  | 'goingTo'
  | 'usedTo'
  | 'can'
  | 'could'
  | 'must'
  | 'haveTo'
  | 'hadTo'
  | 'should'
  | 'might'
  // niveaux B2 → C1
  | 'pastPerf'
  | 'pastPerfCont'
  | 'futPerf'
  | 'futCont'
  | 'wouldHave'
  | 'mustHave'
  | 'cantHave'
  | 'mightHave'
  | 'couldHave'
  | 'shouldHave';

export const TENSE_LABELS: Record<Tense, string> = {
  presSimple: 'présent simple',
  presCont: 'présent continu (be + -ing)',
  pastSimple: 'prétérit (past simple)',
  pastCont: 'past continuous (was/were + -ing)',
  presPerf: 'present perfect (have + participe passé)',
  presPerfCont: 'present perfect continu',
  will: 'futur avec will',
  would: 'conditionnel (would)',
  goingTo: 'futur avec be going to',
  usedTo: 'used to',
  can: 'can',
  could: 'could',
  must: 'must',
  haveTo: 'have to',
  hadTo: 'had to',
  should: 'should',
  might: 'might',
  pastPerf: 'past perfect (had + participe passé)',
  pastPerfCont: 'past perfect continu (had been + -ing)',
  futPerf: 'futur antérieur (will have + participe passé)',
  futCont: 'futur continu (will be + -ing)',
  wouldHave: 'conditionnel passé (would have + participe passé)',
  mustHave: 'must have + participe passé (déduction)',
  cantHave: "can't have + participe passé (impossibilité)",
  mightHave: 'might have + participe passé (possibilité)',
  couldHave: 'could have + participe passé',
  shouldHave: 'should have + participe passé (reproche, regret)',
};

export interface ObjChoice {
  noun: Noun;
  det: EnDet;
  plural: boolean;
}

export interface TimeSpec {
  id?: string;
  en: string;
  alts?: string[];
  fr: string;
  front?: boolean;
  cls?: string;
}

export type WhTarget = 'obj' | 'place' | 'time' | 'clock' | 'freq' | 'dur' | 'subj';

export interface Clause {
  subj: Subject;
  pred: Predicate;
  obj?: ObjChoice;
  tense: Tense;
  neg?: boolean;
  form?: 'decl' | 'yn' | 'wh';
  wh?: WhTarget;
  freq?: FreqAdverb;
  ppAdv?: 'just' | 'already' | 'yet' | 'ever' | 'never';
  time?: TimeSpec;
  manner?: { en: string; fr: string };
  /** Sens de can/could : capacité (savoir), permission/possibilité (pouvoir), demande polie. */
  modalSense?: 'ability' | 'permission' | 'request';
  /** Pronom complément remplaçant l'objet (I call her / je l'appelle). */
  objPronoun?: ObjPronoun;
  /** Force le temps français (ex. imparfait après « si » au conditionnel de type 2). */
  frTense?: FR.FrTense;
}

export interface ObjPronoun {
  en: string;
  /** Pronom français (le, la, les, lui, leur, me, te, nous, vous). */
  fr: string;
  /** Complément direct : accord du participe passé au passé composé. */
  direct: boolean;
  g: 'm' | 'f';
  plural: boolean;
}

export interface EnRealization {
  slots: Slot[];
  end: '.' | '?';
}

export interface RealizeOptions {
  /** Affiche les négations contractées (doesn't) plutôt que développées. */
  contract?: boolean;
  /** Place l'expression de temps en tête de phrase. */
  timeFront?: boolean;
}

// ---------------------------------------------------------------------------
// Anglais
// ---------------------------------------------------------------------------

const NEG_CONTRACT: Record<string, string[]> = {
  is: ["isn't"], are: ["aren't"], was: ["wasn't"], were: ["weren't"],
  do: ["don't"], does: ["doesn't"], did: ["didn't"],
  have: ["haven't"], has: ["hasn't"], had: ["hadn't"],
  will: ["won't"], would: ["wouldn't"], can: ["can't", 'cannot'], could: ["couldn't"],
  should: ["shouldn't"], must: ["mustn't"], might: ["mightn't"],
};

/** Formes acceptées pour « auxiliaire + not ». */
export function negForms(op: string, contract: boolean): string[] {
  const full = op === 'can' ? 'can not' : `${op} not`;
  const short = NEG_CONTRACT[op] ?? [];
  if (op === 'am') return ['am not'];
  if (op === 'might') return contract ? ['might not', "mightn't"] : ['might not', "mightn't"];
  return contract ? [...short, full] : [full, ...short];
}

export interface VerbGroup {
  op: string | null;
  words: string[][];
}

export function personOf(c: Clause): { p: EN.Person; n: EN.GNumber } {
  if (c.form === 'wh' && c.wh === 'subj') return { p: 3, n: 'sg' };
  return { p: c.subj.person, n: c.subj.num };
}

function isQuestion(c: Clause): boolean {
  return c.form === 'yn' || (c.form === 'wh' && c.wh !== 'subj');
}

/** Le groupe verbal anglais : opérateur (auxiliaire inversable) + mots suivants. */
export function verbGroup(c: Clause): VerbGroup {
  const v = enVerb(c.pred.v);
  const { p, n } = personOf(c);
  const needOp = !!c.neg || isQuestion(c);
  const isBe = v.base === 'be';
  const ppBeen = !!c.pred.ppBeen && c.tense === 'presPerf' && c.ppAdv !== 'just';
  switch (c.tense) {
    case 'presSimple':
      if (isBe) return { op: EN.beForm('present', p, n), words: [] };
      if (needOp) return { op: EN.doForm(p, n), words: [[v.base]] };
      return { op: null, words: [[EN.presentSimple(v, p, n)]] };
    case 'pastSimple':
      if (isBe) return { op: EN.beForm('past', p, n), words: [] };
      if (needOp) return { op: 'did', words: [[v.base]] };
      return { op: null, words: [EN.pastForms(v)] };
    case 'presCont':
      return { op: EN.beForm('present', p, n), words: [EN.ingForms(v)] };
    case 'pastCont':
      return { op: EN.beForm('past', p, n), words: [EN.ingForms(v)] };
    case 'presPerf':
      return { op: EN.haveForm(p, n), words: [ppBeen ? ['been'] : EN.ppForms(v)] };
    case 'presPerfCont':
      return { op: EN.haveForm(p, n), words: [['been'], EN.ingForms(v)] };
    case 'will':
      return { op: 'will', words: [[v.base]] };
    case 'would':
      return { op: 'would', words: [[v.base]] };
    case 'goingTo':
      return { op: EN.beForm('present', p, n), words: [['going'], ['to'], [v.base]] };
    case 'usedTo':
      if (needOp) return { op: 'did', words: [['use'], ['to'], [v.base]] };
      return { op: null, words: [['used'], ['to'], [v.base]] };
    case 'haveTo':
      if (needOp) return { op: EN.doForm(p, n), words: [['have'], ['to'], [v.base]] };
      return { op: null, words: [[EN.haveForm(p, n)], ['to'], [v.base]] };
    case 'hadTo':
      if (needOp) return { op: 'did', words: [['have'], ['to'], [v.base]] };
      return { op: null, words: [['had'], ['to'], [v.base]] };
    case 'can':
    case 'could':
    case 'must':
    case 'should':
    case 'might':
      return { op: c.tense, words: [[v.base]] };
    case 'pastPerf':
      return { op: 'had', words: [EN.ppForms(v)] };
    case 'pastPerfCont':
      return { op: 'had', words: [['been'], EN.ingForms(v)] };
    case 'futPerf':
      return { op: 'will', words: [['have'], EN.ppForms(v)] };
    case 'futCont':
      return { op: 'will', words: [['be'], EN.ingForms(v)] };
    case 'wouldHave':
      return { op: 'would', words: [['have'], EN.ppForms(v)] };
    case 'mustHave':
      return { op: 'must', words: [['have'], EN.ppForms(v)] };
    case 'cantHave':
      return { op: 'can', words: [['have'], EN.ppForms(v)] };
    case 'mightHave':
      return { op: 'might', words: [['have'], EN.ppForms(v)] };
    case 'couldHave':
      return { op: 'could', words: [['have'], EN.ppForms(v)] };
    case 'shouldHave':
      return { op: 'should', words: [['have'], EN.ppForms(v)] };
    default:
      return { op: null, words: [[v.base]] };
  }
}

/** Adjectif possessif anglais du sujet (his, her, their…). */
export function possAdjEn(subj: Subject): string {
  return EN.pronounsFor(subj.person, subj.num, subj.g).possAdj;
}

function nounForms(n: Noun, plural: boolean): string[] {
  const forms = [n.en, ...n.syn];
  if (n.po || !plural) return forms;
  return forms.map((f, i) => (i === 0 && n.pl ? n.pl : EN.pluralize(f)));
}

/** Pluriel effectif en anglais (les noms « po » sont toujours pluriels). */
export function enPlural(o: ObjChoice): boolean {
  return !!o.noun.po || (o.plural && !o.noun.u);
}

/** Groupe nominal anglais (une seule case : article + nom, avec synonymes). */
export function enNounPhrase(o: ObjChoice, ctx: { neg: boolean; question: boolean; subj: Subject; habitual?: boolean }): Slot[] {
  const n = o.noun;
  const plural = enPlural(o);
  const forms = nounForms(n, plural);
  const proper = !!n.proper;
  switch (o.det) {
    case 'none':
      return [s(n.the ? forms.map((f) => `the ${f}`) : forms, { role: 'obj', proper })];
    case 'the':
      return [s(forms.map((f) => `the ${f}`), { role: 'obj' })];
    case 'this': {
      const d = plural ? 'these' : 'this';
      return [s(forms.map((f) => `${d} ${f}`), { role: 'obj' })];
    }
    case 'poss': {
      const pa = possAdjEn(ctx.subj);
      return [s(pa, { role: 'poss' }), s(forms, { role: 'obj' })];
    }
    case 'gen':
      if (n.u || n.po) return [s(forms, { role: 'obj' })];
      return [s(nounForms(n, true), { role: 'obj' })];
    case 'a':
    default: {
      if (!n.u && !plural) return [s(forms.map((f) => EN.withIndefinite(f)), { role: 'obj' })];
      if (ctx.neg) return [s(ctx.habitual ? ['', 'any'] : ['any', ''], { role: 'det' }), s(forms, { role: 'obj' })];
      if (ctx.question) return [s(['any', 'some', ''], { role: 'det' }), s(forms, { role: 'obj' })];
      return [s(ctx.habitual ? ['', 'some'] : ['some', ''], { role: 'det' }), s(forms, { role: 'obj' })];
    }
  }
}

function tailSlots(text: string, c: Clause, neg: boolean, question: boolean, habitual = false): Slot[] {
  const out: Slot[] = [];
  for (const w of text.split(' ')) {
    if (!w) continue;
    if (w === '{poss}') out.push(s(possAdjEn(c.subj), { role: 'poss' }));
    else if (w === '{some}') {
      const alts = question ? ['any', 'some', ''] : neg ? ['any', ''] : ['some', ''];
      out.push(s(habitual && !question ? ['', ...alts.filter((a) => a !== '')] : alts, { role: 'det' }));
    }
    else out.push(s(w, { role: 'tail', proper: /[A-Z]/.test(w) }));
  }
  return out;
}

function whWordEn(c: Clause): string[] {
  switch (c.wh) {
    case 'obj': {
      const person = c.obj && c.obj.noun.c.includes('person');
      return person ? ['who', 'whom'] : ['what'];
    }
    case 'place':
      return ['where'];
    case 'time':
      return ['when'];
    case 'clock':
      return ['what time', 'when'];
    case 'freq':
      return ['how often'];
    case 'dur':
      return ['how long'];
    case 'subj':
      return ['who'];
    default:
      return ['what'];
  }
}

/** Réalise la proposition en anglais. */
export function realizeEn(c: Clause, o: RealizeOptions = {}): EnRealization {
  const form = c.form ?? 'decl';
  const question = isQuestion(c);
  const contract = o.contract ?? true;
  const vg = verbGroup(c);
  // « never » a un sens négatif : any / pas de some (He never eats any meat / He never eats meat)
  const neg = !!c.neg || !!c.freq?.neg;
  const habitual = c.tense === 'presSimple' || c.tense === 'usedTo';

  const subjAlts = SUBJECT_ALTS[c.subj.id] ?? [c.subj.en];
  const subjSlot = s(subjAlts, { role: 'subj', proper: !!c.subj.proper });

  // opérateur (+ négation)
  let opSlot: Slot | null = null;
  if (vg.op) {
    opSlot = c.neg ? s(negForms(vg.op, contract), { role: 'aux' }) : s(vg.op, { role: 'aux' });
  }

  // adverbe (fréquence / present perfect), placé après l'opérateur
  const advText = c.freq?.en ?? (c.ppAdv && c.ppAdv !== 'yet' ? c.ppAdv : null);
  const advSlot = advText ? s([advText, ...(c.freq?.alts ?? [])], { role: 'adv' }) : null;

  const verbSlots = vg.words.map((alts) => s(alts, { role: 'verb' }));
  const prtSlot = c.pred.prt ? s(c.pred.prt, { role: 'prt' }) : null;

  const dropObj = form === 'wh' && (c.wh === 'obj' || c.wh === 'place');
  const objSlots = c.objPronoun
    ? [s(c.objPronoun.en, { role: 'obj' })]
    : c.obj && !dropObj
      ? enNounPhrase(c.obj, { neg, question, subj: c.subj, habitual })
      : [];
  const dropPrt = form === 'wh' && c.wh === 'place';

  const tail = c.pred.tail ? tailSlots(c.pred.tail, c, neg, question, habitual) : [];
  const manner = c.manner ? [s(c.manner.en, { role: 'manner' })] : [];
  const dropTime = form === 'wh' && (c.wh === 'time' || c.wh === 'clock' || c.wh === 'freq' || c.wh === 'dur');
  const timeSlot = c.time && !dropTime ? s([c.time.en, ...(c.time.alts ?? [])], { role: 'time' }) : null;
  const yetSlot = c.ppAdv === 'yet' ? s('yet', { role: 'adv' }) : null;

  const afterVerb: Slot[] = [
    ...verbSlots,
    ...(prtSlot && !dropPrt ? [prtSlot] : []),
    ...objSlots,
    ...tail,
    ...manner,
  ];

  let slots: Slot[];
  if (form === 'decl' || (form === 'wh' && c.wh === 'subj')) {
    const subj = form === 'wh' ? s('who', { role: 'wh' }) : subjSlot;
    slots = [subj, ...(opSlot ? [opSlot] : []), ...(advSlot ? [advSlot] : []), ...afterVerb];
    if (timeSlot) {
      if (o.timeFront && c.time?.front) slots = [timeSlot, s(',', { role: 'punct' }), ...slots];
      else slots.push(timeSlot);
    }
    if (yetSlot) slots.push(yetSlot);
  } else {
    // questions : (mot interrogatif) + opérateur + sujet + adverbe + reste
    const op = opSlot ?? s(vg.op ?? 'do', { role: 'aux' });
    const head = form === 'wh' ? [s(whWordEn(c), { role: 'wh' })] : [];
    slots = [...head, op, subjSlot, ...(advSlot ? [advSlot] : []), ...afterVerb];
    if (timeSlot) slots.push(timeSlot);
    if (yetSlot) slots.push(yetSlot);
  }
  return { slots, end: form === 'decl' ? '.' : '?' };
}

// ---------------------------------------------------------------------------
// Français
// ---------------------------------------------------------------------------

const POSS_FR: Record<number, { m: string; f: string; pl: string }> = {
  0: { m: 'mon', f: 'ma', pl: 'mes' },
  1: { m: 'ton', f: 'ta', pl: 'tes' },
  2: { m: 'son', f: 'sa', pl: 'ses' },
  3: { m: 'notre', f: 'notre', pl: 'nos' },
  4: { m: 'votre', f: 'votre', pl: 'vos' },
  5: { m: 'leur', f: 'leur', pl: 'leurs' },
};

function agree(m: string, f: string, g: 'm' | 'f', plural: boolean): string {
  const base = g === 'f' ? f : m;
  if (!plural) return base;
  if (/[sx]$/.test(base)) return base;
  return `${base}s`;
}

/** Remplace les marqueurs {poss:…}, {agr:…} et ~article d'un complément français. */
export function frTail(text: string, subj: Subject, negated: boolean): string[] {
  const person = frPersonOf(subj);
  const plural = subj.num === 'pl';
  const words = text.split(' ').filter(Boolean);
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const possM = /^\{poss:(m|f|pl)\}$/.exec(w);
    if (possM) {
      const set = POSS_FR[person];
      const next = words[i + 1] ?? '';
      const kind = possM[1] as 'm' | 'f' | 'pl';
      out.push(kind === 'f' && FR.startsWithVowelSound(next) ? set.m : set[kind]);
      continue;
    }
    const agrM = /^\{agr:([^|}]+)\|([^}]+)\}$/.exec(w);
    if (agrM) {
      out.push(agree(agrM[1], agrM[2], subj.g, plural));
      continue;
    }
    if (w.startsWith('~')) {
      const art = w.slice(1);
      if (negated) {
        // ~de la / ~de l'xxx / ~du / ~des / ~un / ~une → de
        if (art === 'de' && (words[i + 1] === 'la' || /^l'/.test(words[i + 1] ?? ''))) {
          if (words[i + 1] === 'la') i++;
          else words[i + 1] = (words[i + 1] ?? '').replace(/^l'/, '');
        }
        out.push('de');
      } else out.push(art);
      continue;
    }
    out.push(w);
  }
  return out;
}

function frNounOf(n: Noun): FR.FrNoun {
  return { fr: n.fr, g: n.g, pl: n.fpl };
}

/** Le complément d'objet français. */
export function frObject(c: Clause, negated: boolean): string[] {
  if (!c.obj) return [];
  const o = c.obj;
  const n = o.noun;
  const enPl = enPlural(o);
  const plural = !!n.fpo || (enPl && !n.po);
  if (c.pred.floc && n.fprep) {
    // à Londres, en Espagne, au Japon, aux États-Unis
    return [n.fprep, n.fr];
  }
  let det: FR.FrDet;
  switch (o.det) {
    case 'a':
      if (n.u && !n.fpo) det = 'part';
      else det = 'indef';
      break;
    case 'the':
      det = 'def';
      break;
    case 'poss':
      det = 'poss';
      break;
    case 'this':
      det = 'dem';
      break;
    case 'gen':
      det = c.pred.fdet?.gen ?? 'def';
      break;
    case 'none':
    default:
      det = c.pred.fdet?.none ?? 'none';
  }
  return FR.frNP(frNounOf(n), det, {
    plural,
    prep: c.pred.fprep ?? null,
    negated: negated && (det === 'indef' || det === 'part'),
    possessor: { person: frPersonOf(c.subj) },
  });
}

interface FrTenseChoice {
  tense: FR.FrTense;
  neg: string | null;
  adv: string | null;
}

function frTenseFor(c: Clause): FrTenseChoice {
  const neverAdv = c.freq?.neg || c.ppAdv === 'never';
  let neg: string | null = c.neg ? 'pas' : null;
  if (neverAdv) neg = 'jamais';
  let adv: string | null = c.freq && !c.freq.neg ? c.freq.fr : null;
  const isState = c.pred.k === 'state' || !!c.pred.be;
  switch (c.tense) {
    case 'presSimple':
      return { tense: 'present', neg, adv };
    case 'presCont':
      return { tense: c.time ? 'present' : 'enTrainDe', neg, adv };
    case 'pastSimple':
      return { tense: isState ? 'imparfait' : 'pc', neg, adv };
    case 'pastCont':
      return { tense: 'imparfait', neg, adv };
    case 'usedTo':
      return { tense: 'imparfait', neg, adv };
    case 'presPerf': {
      if (c.ppAdv === 'just') return { tense: 'venirDe', neg, adv };
      if (c.ppAdv === 'already' || c.ppAdv === 'ever') adv = 'déjà';
      if (c.ppAdv === 'yet') {
        if (c.neg) neg = 'pas encore';
        else adv = 'déjà';
      }
      if ((c.time?.cls === 'since' || c.time?.cls === 'for') && !neg) return { tense: 'present', neg, adv };
      return { tense: 'pc', neg, adv };
    }
    case 'presPerfCont':
      return { tense: 'present', neg, adv };
    case 'will':
      return { tense: 'futur', neg, adv };
    case 'would':
      return { tense: 'conditionnel', neg, adv };
    case 'goingTo':
      return { tense: 'futurProche', neg, adv };
    case 'pastPerf':
      if (c.ppAdv === 'already') adv = 'déjà';
      return { tense: 'pqp', neg, adv };
    case 'pastPerfCont':
      return { tense: 'imparfait', neg, adv };
    case 'futPerf':
      return { tense: 'futAnt', neg, adv };
    case 'futCont':
      return { tense: 'futur', neg, adv };
    case 'wouldHave':
      return { tense: 'condPasse', neg, adv };
    default:
      return { tense: 'present', neg, adv };
  }
}

/** Groupe verbal français (sans sujet). */
export function frVerbWords(c: Clause): { words: string[]; negated: boolean } {
  const fv = frVerb(c.pred.fv);
  const person = c.form === 'wh' && c.wh === 'subj' ? 2 : frPersonOf(c.subj);
  const gender = c.form === 'wh' && c.wh === 'subj' ? 'm' : c.subj.g;
  const plural = c.form === 'wh' && c.wh === 'subj' ? false : c.subj.num === 'pl';
  const base = {
    person,
    gender,
    plural,
    pronominal: !!c.pred.fpron,
    objPronoun: c.objPronoun?.fr ?? null,
    objAgree: c.objPronoun?.direct ? { g: c.objPronoun.g, plural: c.objPronoun.plural } : null,
  };
  const negWord = c.neg ? 'pas' : null;
  const sense = c.modalSense ?? (c.pred.skill ? 'ability' : 'permission');
  const modal = (inf: string, tense: 'present' | 'conditionnel' | 'imparfait' | 'futur' | 'pc' | 'condPasse', n: string | null = negWord, adv: string | null = null) =>
    FR.frModalPhrase(frVerb(inf), tense, fv, { ...base, neg: n, adv });

  switch (c.tense) {
    case 'can':
      return { words: modal(sense === 'ability' ? 'savoir' : 'pouvoir', 'present'), negated: !!c.neg };
    case 'could':
      if (sense === 'request') return { words: modal('pouvoir', 'conditionnel'), negated: !!c.neg };
      return { words: modal(sense === 'ability' ? 'savoir' : 'pouvoir', 'imparfait'), negated: !!c.neg };
    case 'must':
      return { words: modal('devoir', 'present'), negated: !!c.neg };
    case 'should':
      return { words: modal('devoir', 'conditionnel'), negated: !!c.neg };
    case 'haveTo':
      if (c.neg) {
        const head = FR.frVerbPhrase(FR.AVOIR, { ...base, pronominal: false, tense: 'present', neg: 'pas' });
        const refl = c.pred.fpron ? [FR.reflexive(person)] : [];
        return { words: [...head, 'besoin', 'de', ...refl, fv.inf], negated: true };
      }
      return { words: modal('devoir', 'present', null, c.freq && !c.freq.neg ? c.freq.fr : null), negated: false };
    case 'hadTo':
      if (c.neg) {
        const head = FR.frVerbPhrase(FR.AVOIR, { ...base, pronominal: false, tense: 'pc', neg: 'pas' });
        const refl = c.pred.fpron ? [FR.reflexive(person)] : [];
        return { words: [...head, 'besoin', 'de', ...refl, fv.inf], negated: true };
      }
      return { words: modal('devoir', 'pc', null), negated: false };
    case 'might':
      if (c.neg) {
        const w = FR.frVerbPhrase(fv, { ...base, tense: 'futur', neg: 'pas' });
        // « ne viendra pas » → « ne viendra peut-être pas »
        const i = w.lastIndexOf('pas');
        w.splice(i, 0, 'peut-être');
        return { words: w, negated: true };
      }
      return { words: FR.frVerbPhrase(fv, { ...base, tense: 'futur', neg: null, adv: 'peut-être' }), negated: false };
    case 'mustHave':
      return { words: modal('devoir', 'pc'), negated: !!c.neg };
    case 'cantHave':
      // can't have done : impossibilité logique → « n'a pas pu »
      return { words: modal('pouvoir', 'pc', 'pas'), negated: true };
    case 'mightHave':
      if (c.neg) {
        const w = FR.frVerbPhrase(fv, { ...base, tense: 'pc', neg: 'pas' });
        const i = w.lastIndexOf('pas');
        w.splice(i, 0, 'peut-être');
        return { words: w, negated: true };
      }
      return { words: FR.frVerbPhrase(fv, { ...base, tense: 'pc', neg: null, adv: 'peut-être' }), negated: false };
    case 'couldHave':
      return { words: modal('pouvoir', 'condPasse'), negated: !!c.neg };
    case 'shouldHave':
      return { words: modal('devoir', 'condPasse'), negated: !!c.neg };
    default: {
      const t = frTenseFor(c);
      return { words: FR.frVerbPhrase(fv, { ...base, tense: c.frTense ?? t.tense, neg: t.neg, adv: t.adv }), negated: !!t.neg };
    }
  }
}

const FR_WH: Record<WhTarget, string[]> = {
  obj: ['que', 'est-ce', 'que'],
  place: ['où', 'est-ce', 'que'],
  time: ['quand', 'est-ce', 'que'],
  clock: ['à', 'quelle', 'heure', 'est-ce', 'que'],
  freq: ['à', 'quelle', 'fréquence', 'est-ce', 'que'],
  dur: ['depuis', 'combien', 'de', 'temps', 'est-ce', 'que'],
  subj: ['qui'],
};

/** Réalise la proposition en français (texte final). */
export function realizeFr(c: Clause): string {
  const form = c.form ?? 'decl';
  const { words: vp, negated } = frVerbWords(c);
  const fvInf = c.pred.fv;
  const objNegated = negated && fvInf !== 'être';
  const dropObj = (form === 'wh' && (c.wh === 'obj' || c.wh === 'place')) || !!c.objPronoun;
  const obj = dropObj ? [] : frObject(c, objNegated);
  const tail = c.pred.ftail ? frTail(c.pred.ftail, c.subj, objNegated) : [];
  const dropTime = form === 'wh' && (c.wh === 'time' || c.wh === 'clock' || c.wh === 'freq' || c.wh === 'dur');
  const time = c.time && !dropTime ? [c.time.fr] : [];
  const manner = c.manner ? [c.manner.fr] : [];
  const complements = c.pred.ftailFirst ? [...tail, ...obj] : [...obj, ...tail];
  const subj = c.subj.fr;

  let words: string[];
  if (form === 'decl') {
    words = [subj, ...vp, ...complements, ...manner, ...time];
  } else if (form === 'yn') {
    words = ['est-ce', 'que', subj, ...vp, ...complements, ...manner, ...time];
  } else if (c.wh === 'subj') {
    words = ['qui', ...vp, ...complements, ...manner, ...time];
  } else {
    let wh = FR_WH[c.wh ?? 'obj'];
    if (c.wh === 'obj') {
      const person = c.obj && c.obj.noun.c.includes('person');
      const prep = c.pred.fprep;
      if (person) wh = [...(prep ? [prep] : []), 'qui', 'est-ce', 'que'];
      else if (prep) wh = [prep, 'quoi', 'est-ce', 'que'];
    }
    words = [...wh, subj, ...vp, ...complements, ...manner, ...time];
  }
  const text = FR.frJoin(words);
  return joinFrench([text], form === 'decl' ? '.' : '?');
}

// ---------------------------------------------------------------------------
// Aides
// ---------------------------------------------------------------------------

/** Infinitif anglais avec complément (« get up early », « play the piano »). */
export function enInfinitivePhrase(c: Clause, form: 'base' | 'ing' | 'to' | 'pp'): Slot[] {
  const v = enVerb(c.pred.v);
  const verbAlts =
    form === 'ing' ? EN.ingForms(v) : form === 'pp' ? EN.ppForms(v) : [v.base];
  const head = form === 'to' ? [s('to', { role: 'verb' }), s(verbAlts, { role: 'verb' })] : [s(verbAlts, { role: 'verb' })];
  const prt = c.pred.prt ? [s(c.pred.prt, { role: 'prt' })] : [];
  const obj = c.obj ? enNounPhrase(c.obj, { neg: !!c.neg, question: false, subj: c.subj }) : [];
  const tail = c.pred.tail ? tailSlots(c.pred.tail, c, !!c.neg, false) : [];
  return [...head, ...prt, ...obj, ...tail];
}

/** Infinitif français avec complément (« me lever tôt », « jouer du piano »). */
export function frInfinitivePhrase(c: Clause, opts: { neg?: boolean } = {}): string[] {
  const fv = frVerb(c.pred.fv);
  const person = frPersonOf(c.subj);
  const refl = c.pred.fpron ? [FR.reflexive(person)] : [];
  const negPart = opts.neg ? ['ne', 'pas'] : [];
  const obj = frObject(c, !!opts.neg);
  const tail = c.pred.ftail ? frTail(c.pred.ftail, c.subj, !!opts.neg) : [];
  const complements = c.pred.ftailFirst ? [...tail, ...obj] : [...obj, ...tail];
  return [...negPart, ...refl, fv.inf, ...complements];
}
