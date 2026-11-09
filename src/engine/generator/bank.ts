/**
 * Banques d'items rédigés (niveaux B2 → C2).
 *
 * Aux niveaux avancés, la justesse d'une phrase dépend de nuances qu'un
 * assemblage automatique ne garantit pas. Chaque entrée est donc rédigée et
 * contrôlée à la main, puis le moteur la fait varier (prénoms, pronoms,
 * accords, variantes lexicales alignées anglais/français) et la convertit en
 * item standard : la fabrique d'exercices en dérive ensuite les formats
 * habituels (texte à trous, QCM, correction d'erreur, transformation…),
 * avec la même validation que les items générés.
 *
 * Syntaxe des phrases anglaises :
 *  - [had left|had gone]   trou (le premier trou reçoit les distracteurs) ;
 *  - (that|)               case non évaluée à variantes (vide = facultatif) ;
 *  - {P} {he} {He} {him} {his} {His} {himself}   personne tirée au sort ;
 *  - {Q}                   seconde personne (prénom seulement) ;
 *  - {x}                   variante lexicale définie dans `vars`.
 * Côté français : {P} {Q} {il} {Il} {e} (accord) {le} {Le} {sil} {Sil} {x}.
 */
import { lattice, latticeText, s, spec, type Lattice, type Slot } from '@/engine/core/lattice';
import type { CefrLevel } from '@/content/lexicon/types';
import type { ExerciseType, KeywordExercise } from '@/engine/exercises/types';
import { shortHash } from '@/engine/core/rng';
import { buildItem } from './item';
import type { Distractor, GenContext, ItemGenerator, SentenceItem, TransformSpec } from './types';

export interface BankEntry {
  id: string;
  lv: CefrLevel;
  en: string;
  fr: string;
  /** Distracteurs du trou n° 0 : « texte=étiquette; texte=étiquette ». */
  d?: string;
  why: string;
  hint?: string;
  /** Ligne de contexte anglaise affichée au-dessus de la phrase. */
  ctx?: string;
  /** Consigne spécifique. */
  instr?: string;
  /** Traductions françaises erronées (choix de la traduction). */
  frd?: string[];
  /** Phrases anglaises proches (compréhension orale). */
  env?: string[];
  /** Transformation de phrase complète. */
  tr?: { task: string; src: string; ans: string[] };
  /** Reformulation avec mot imposé : « gap » contient ___ à la place du trou. */
  kw?: { src: string; key: string; gap: string; ans: string[]; min?: number; max?: number };
  /** Formats supplémentaires autorisés (wordOrder, translateFrEn) quand toutes les réponses sont prévues. */
  ok?: ExerciseType[];
  /** Autres traductions anglaises complètes acceptées. */
  alt?: string[];
  /** Toujours afficher la traduction. */
  show?: boolean;
  /** Variantes lexicales alignées : { lieu: "the station=la gare; the airport=l'aéroport" }. */
  vars?: Record<string, string>;
}

export interface Bank {
  skillId: string;
  entries: BankEntry[];
}

/** Formats dérivables d'un item rédigé sans risque de refuser une réponse correcte. */
const SAFE_TYPES: ExerciseType[] = ['cloze', 'mcq', 'contextChoice', 'errorCorrection', 'translateEnFr', 'transformation', 'dictation', 'listening'];

// ---------------------------------------------------------------------------
// Variables

interface Person {
  name: string;
  female: boolean;
}

const FEMALE = ['Sarah', 'Laura', 'Julia', 'Megan', 'Rachel', 'Katie', 'Lucy', 'Nina', 'Hannah', 'Claire'];
const MALE = ['Tom', 'David', 'James', 'Mark', 'Paul', 'Ben', 'Daniel', 'Sam', 'Peter', 'Jack'];
const ALL_NAMES = new Set([...FEMALE, ...MALE]);

export interface Bindings {
  P: Person;
  Q: string;
  vars: Record<string, { en: string; fr: string }>;
}

function parseVars(spec: string): { en: string; fr: string }[] {
  return spec
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.indexOf('=');
      return i < 0 ? { en: pair, fr: pair } : { en: pair.slice(0, i).trim(), fr: pair.slice(i + 1).trim() };
    });
}

export function bindVariables(ctx: GenContext, e: BankEntry): Bindings {
  const female = ctx.rng.chance(0.5);
  const name = ctx.rng.pick(female ? FEMALE : MALE);
  const Q = ctx.rng.pick([...FEMALE, ...MALE].filter((n) => n !== name));
  const vars: Bindings['vars'] = {};
  for (const [k, v] of Object.entries(e.vars ?? {})) vars[k] = ctx.rng.pick(parseVars(v));
  return { P: { name, female }, Q, vars };
}

const EN_PRON: Record<string, (f: boolean) => string> = {
  he: (f) => (f ? 'she' : 'he'),
  He: (f) => (f ? 'She' : 'He'),
  him: (f) => (f ? 'her' : 'him'),
  his: (f) => (f ? 'her' : 'his'),
  His: (f) => (f ? 'Her' : 'His'),
  himself: (f) => (f ? 'herself' : 'himself'),
};

const FR_PRON: Record<string, (f: boolean) => string> = {
  il: (f) => (f ? 'elle' : 'il'),
  Il: (f) => (f ? 'Elle' : 'Il'),
  e: (f) => (f ? 'e' : ''),
  le: (f) => (f ? 'la' : 'le'),
  Le: (f) => (f ? 'La' : 'Le'),
  sil: (f) => (f ? 'si elle' : "s'il"),
  Sil: (f) => (f ? 'Si elle' : "S'il"),
  lui: () => 'lui',
};

export function substitute(text: string, b: Bindings, lang: 'en' | 'fr'): string {
  return text.replace(/\{(\w+)\}/g, (m, k: string) => {
    if (k === 'P') return b.P.name;
    if (k === 'Q') return b.Q;
    if (b.vars[k]) return lang === 'en' ? b.vars[k].en : b.vars[k].fr;
    const table = lang === 'en' ? EN_PRON : FR_PRON;
    if (table[k]) return table[k](b.P.female);
    return m;
  });
}

// ---------------------------------------------------------------------------
// Analyse des phrases

interface Parsed {
  slots: Slot[];
  end: '.' | '?' | '!';
  blanks: number[][];
}

/** Découpe une phrase annotée en cases (trous, variantes, mots, ponctuation). */
export function parseSentence(text: string): Parsed {
  const t = text.trim();
  let end: '.' | '?' | '!' = '.';
  let body = t;
  const last = t[t.length - 1];
  if (last === '.' || last === '?' || last === '!') {
    end = last;
    body = t.slice(0, -1);
  }
  const slots: Slot[] = [];
  const blanks: number[][] = [];
  let i = 0;
  let word = '';
  const pushWord = (w: string) => {
    if (!w) return;
    const m = /^(.*?)([,;:]+)$/.exec(w);
    const core = m ? m[1] : w;
    if (core) {
      const first = slots.length === 0;
      const proper = core === 'I' || /^I'/.test(core) || ALL_NAMES.has(core.replace(/'s$/, '')) || (!first && /^[A-Z]/.test(core));
      slots.push(s(core, { role: 'w', proper }));
    }
    if (m) slots.push(s(m[2], { role: 'punct' }));
  };
  while (i < body.length) {
    const c = body[i];
    if (c === '[' || c === '(') {
      pushWord(word);
      word = '';
      const close = body.indexOf(c === '[' ? ']' : ')', i);
      if (close < 0) throw new Error(`Crochet non fermé dans « ${text} »`);
      const alts = body.slice(i + 1, close).split('|').map((a) => a.trim());
      if (c === '[') {
        const idx = blanks.length;
        blanks.push([slots.length]);
        slots.push(s(alts, { role: 'blank', focus: true, proper: /^[A-Z]/.test(alts[0]) && slots.length > 0 }));
        void idx;
      } else {
        slots.push(s(alts, { role: 'opt' }));
      }
      i = close + 1;
      // ponctuation collée après le groupe
      const after = /^[,;:]+/.exec(body.slice(i));
      if (after) {
        slots.push(s(after[0], { role: 'punct' }));
        i += after[0].length;
      }
      continue;
    }
    if (/\s/.test(c)) {
      pushWord(word);
      word = '';
    } else word += c;
    i++;
  }
  pushWord(word);
  return { slots, end, blanks };
}

/** Treillis d'une réponse complète (variantes entre parenthèses ou crochets). */
export function answerLattice(text: string): Lattice {
  const p = parseSentence(text);
  return lattice(p.slots.map((sl) => ({ alts: sl.alts, proper: sl.proper, role: sl.role })), p.end);
}

/** Texte de référence d'une réponse annotée. */
export function plainText(text: string): string {
  return latticeText(answerLattice(text));
}

/** Treillis d'un fragment (trou de reformulation) sans ponctuation finale. */
export function fragmentLattice(text: string): Lattice {
  const p = parseSentence(text.replace(/[.?!]$/, ''));
  return lattice(p.slots.map((sl) => ({ alts: sl.alts })), '');
}

function parseDistractors(d: string | undefined): Distractor[] {
  if (!d) return [];
  return d
    .split(';')
    .map((x) => x.trim())
    .filter(Boolean)
    .map((pair) => {
      const i = pair.lastIndexOf('=');
      return i < 0 ? { text: pair, tag: 'grammar' } : { text: pair.slice(0, i).trim(), tag: pair.slice(i + 1).trim() };
    });
}

// ---------------------------------------------------------------------------
// Construction

export function bankItem(skillId: string, e: BankEntry, b: Bindings): SentenceItem | null {
  const sub = (t: string) => substitute(t, b, 'en');
  const subFr = (t: string) => substitute(t, b, 'fr');
  const parsed = parseSentence(sub(e.en));
  if (!parsed.blanks.length) return null;
  const transform: TransformSpec | undefined = e.tr
    ? {
        instruction: e.tr.task,
        source: plainText(sub(e.tr.src)),
        target: spec(...e.tr.ans.map((a) => answerLattice(sub(a)))),
        targetText: plainText(sub(e.tr.ans[0])),
      }
    : undefined;
  const allowed = [...SAFE_TYPES, ...(e.ok ?? [])];
  const extra = (e.alt ?? []).map((a) => answerLattice(sub(a)));
  const lexemes = [`bank:${e.id}`, ...Object.entries(b.vars).map(([k, v]) => `var:${e.id}:${k}:${v.en}`)];
  return buildItem({
    skillId,
    templateId: `${skillId}.${e.id}`,
    level: e.lv,
    slots: parsed.slots,
    end: parsed.end,
    extraAnswers: extra,
    fr: subFr(e.fr),
    blankGroups: parsed.blanks,
    hints: e.hint ? [sub(e.hint)] : undefined,
    distractors: parseDistractors(e.d).map((x) => ({ ...x, text: sub(x.text) })),
    frDistractors: (e.frd ?? []).map(subFr),
    enVariants: (e.env ?? []).map((v) => plainText(sub(v))),
    transform,
    instruction: e.instr,
    context: e.ctx ? sub(e.ctx) : undefined,
    showTranslation: e.show,
    explanation: sub(e.why),
    lexemes,
    allowedTypes: allowed,
  });
}

function pickEntry(ctx: GenContext, entries: BankEntry[]): BankEntry {
  return ctx.rng.pickWeighted(entries, (e) => (ctx.lexWeight ? ctx.lexWeight(`bank:${e.id}`) : 1));
}

/** Générateur d'items à partir d'une banque. */
export function bankGenerator(bank: Bank): ItemGenerator {
  return (ctx) => {
    for (let k = 0; k < 4; k++) {
      const e = pickEntry(ctx, bank.entries);
      const item = bankItem(bank.skillId, e, bindVariables(ctx, e));
      if (item) return item;
    }
    return null;
  };
}

// ---------------------------------------------------------------------------
// Reformulation avec mot imposé

export function countWords(text: string): number {
  // Comme aux examens de Cambridge, une contraction compte pour deux mots.
  return text
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .reduce((n, w) => n + (/n't$|'(re|ve|ll|d|m|s)$/i.test(w) && !/^(let's)$/i.test(w) ? 2 : 1), 0);
}

export function keywordExercise(skillId: string, e: BankEntry, b: Bindings, o: { seed: string; difficulty: 1 | 2 | 3 }): KeywordExercise | null {
  if (!e.kw) return null;
  const sub = (t: string) => substitute(t, b, 'en');
  const gap = sub(e.kw.gap);
  const [before, after] = gap.split('___');
  if (after === undefined) return null;
  const answers = e.kw.ans.map((a) => sub(a));
  const answerText = plainText(answers[0]).replace(/[.?!]$/, '');
  const src = plainText(sub(e.kw.src));
  const sig = `${src}|${e.kw.key}|${answerText}`;
  return {
    id: `keyword-${shortHash(`${o.seed}|${sig}`)}`,
    type: 'keyword',
    skillId,
    level: e.lv,
    difficulty: o.difficulty,
    instruction: `Complétez la seconde phrase pour qu'elle ait le même sens que la première, en utilisant le mot imposé (sans le modifier) et ${e.kw.min ?? 2} à ${e.kw.max ?? 5} mots.`,
    explanation: sub(e.why),
    signature: shortHash(`keyword|${sig}`),
    structure: `${skillId}.kw.${e.id}`,
    lexemes: [`bank:${e.id}`],
    itemIds: [],
    seed: o.seed,
    audioText: `${before.trim()} ${answerText} ${after.trim()}`.replace(/\s+([,.!?;:])/g, '$1').trim(),
    source: src,
    key: e.kw.key,
    before: before.trimEnd(),
    after: after.trimStart(),
    answer: spec(...answers.map(fragmentLattice)),
    answerText,
    minWords: e.kw.min ?? 2,
    maxWords: e.kw.max ?? 5,
  };
}

/** Exercice de reformulation tiré d'une banque (null si la banque n'en contient pas). */
export function bankKeyword(bank: Bank, ctx: GenContext, seed: string): KeywordExercise | null {
  const pool = bank.entries.filter((e) => e.kw);
  if (!pool.length) return null;
  const e = pickEntry(ctx, pool);
  return keywordExercise(bank.skillId, e, bindVariables(ctx, e), { seed, difficulty: ctx.difficulty });
}
