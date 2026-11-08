/**
 * Construction d'items à partir de propositions réalisées : marquage des
 * trous, filtrage des distracteurs, ordres alternatifs, traductions erronées
 * pour les QCM, variantes pour la compréhension orale.
 */
import {
  lattice,
  latticeRaw,
  latticeText,
  matchAnswer,
  spec,
  type Lattice,
  type Slot,
} from '@/engine/core/lattice';
import { normalizeText } from '@/engine/core/text';
import type { Level } from '@/content/lexicon/types';
import { realizeEn, realizeFr, type Clause, type RealizeOptions } from './clause';
import type { Blank, Distractor, SentenceItem, TransformSpec } from './types';
import { lexemesOf } from './pick';
import { validateItem } from './validate';

type RejectListener = (problems: string[], item: SentenceItem) => void;
let rejectListener: RejectListener | null = null;

/** Permet aux tests d'observer les items rejetés par la validation. */
export function setRejectListener(fn: RejectListener | null): void {
  rejectListener = fn;
}

export interface BuildArgs {
  skillId: string;
  templateId: string;
  level: Level;
  slots: Slot[];
  end: '.' | '?' | '!';
  altOrders?: Slot[][];
  extraAnswers?: Lattice[];
  fr: string;
  /** Indices des cases de chaque trou (le trou 0 reçoit les distracteurs). */
  blankGroups: number[][];
  hints?: (string | undefined)[];
  distractors?: Distractor[];
  frDistractors?: string[];
  enVariants?: string[];
  transform?: TransformSpec;
  instruction?: string;
  context?: string;
  showTranslation?: boolean;
  explanation: string;
  lexemes: string[];
  itemIds?: string[];
  noFinalContraction?: boolean;
  mcqOnly?: boolean;
}

/** Indices des cases dont le rôle figure dans la liste. */
export function indicesByRole(slots: readonly Slot[], roles: readonly string[]): number[] {
  const out: number[] = [];
  slots.forEach((sl, i) => {
    if (sl.role && roles.includes(sl.role)) out.push(i);
  });
  return out;
}

/** Découpe une liste d'indices en groupes contigus. */
export function contiguousGroups(indices: readonly number[]): number[][] {
  const groups: number[][] = [];
  for (const i of [...indices].sort((a, b) => a - b)) {
    const last = groups[groups.length - 1];
    if (last && last[last.length - 1] === i - 1) last.push(i);
    else groups.push([i]);
  }
  return groups;
}

export function blankFromSlots(slots: readonly Slot[], hint?: string): Blank {
  const l = lattice(slots.map((sl) => ({ ...sl })), '');
  return { answer: spec(l), display: latticeRaw(l), hint };
}

function uniqueBy<T>(items: T[], key: (t: T) => string): T[] {
  const seen = new Set<string>();
  return items.filter((it) => {
    const k = key(it);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

export function buildItem(a: BuildArgs): SentenceItem | null {
  const slots = a.slots.map((sl) => ({ ...sl, blank: undefined as number | undefined }));
  a.blankGroups.forEach((group, bi) => {
    for (const idx of group) if (slots[idx]) slots[idx].blank = bi;
  });
  const blanks = a.blankGroups.map((group, bi) => blankFromSlots(group.map((i) => slots[i]), a.hints?.[bi]));
  const first = blanks[0];
  const distractors = uniqueBy(
    (a.distractors ?? []).filter((d) => {
      if (!d.text.trim()) return false;
      if (!first) return true;
      return !matchAnswer(d.text, first.answer, { maxTypos: 0 }).ok;
    }),
    (d) => normalizeText(d.text),
  );
  const correctFr = a.fr;
  const frDistractors = uniqueBy(
    (a.frDistractors ?? []).filter((t) => normalizeText(t) !== normalizeText(correctFr)),
    (t) => normalizeText(t),
  );
  const canonical = latticeText(lattice(slots, a.end));
  const enVariants = uniqueBy(
    (a.enVariants ?? []).filter((t) => normalizeText(t) !== normalizeText(canonical)),
    (t) => normalizeText(t),
  );
  const item: SentenceItem = {
    skillId: a.skillId,
    templateId: a.templateId,
    level: a.level,
    slots,
    end: a.end,
    altOrders: a.altOrders,
    extraAnswers: a.extraAnswers,
    fr: a.fr,
    blanks,
    distractors,
    frDistractors,
    enVariants,
    transform: a.transform,
    instruction: a.instruction,
    context: a.context,
    showTranslation: a.showTranslation,
    explanation: a.explanation,
    lexemes: a.lexemes,
    itemIds: a.itemIds,
    noFinalContraction: a.noFinalContraction,
    mcqOnly: a.mcqOnly,
  };
  const problems = validateItem(item);
  if (problems.length) {
    rejectListener?.(problems, item);
    return null;
  }
  return item;
}

export function sentenceText(slots: readonly Slot[], end: '.' | '?' | '!'): string {
  return latticeText(lattice([...slots], end));
}

export interface ClauseItemArgs {
  skillId: string;
  templateId: string;
  level: Level;
  clause: Clause;
  /** Rôles composant chaque trou ; chaque entrée = un trou. */
  blankRoles: string[][];
  hints?: (string | undefined)[];
  distractors?: Distractor[];
  /** Propositions voisines (traductions erronées, variantes orales). */
  neighbours?: Clause[];
  transform?: TransformSpec;
  instruction?: string;
  context?: string;
  showTranslation?: boolean;
  explanation: string;
  extraLexemes?: string[];
  itemIds?: string[];
  options?: RealizeOptions;
  extraAnswers?: Lattice[];
}

/** Item complet à partir d'une proposition. */
export function clauseItem(a: ClauseItemArgs): SentenceItem | null {
  const r = realizeEn(a.clause, a.options);
  const altOrders: Slot[][] = [];
  if (a.clause.time?.front && (a.clause.form ?? 'decl') === 'decl') {
    const other = realizeEn(a.clause, { ...a.options, timeFront: !a.options?.timeFront });
    altOrders.push(other.slots);
  }
  const blankGroups = a.blankRoles.map((roles) => indicesByRole(r.slots, roles)).filter((g) => g.length > 0);
  if (blankGroups.length !== a.blankRoles.length) return null;
  const fr = realizeFr(a.clause);
  const neighbours = a.neighbours ?? [];
  const frDistractors = neighbours.map((n) => realizeFr(n));
  const enVariants = neighbours.map((n) => {
    const nr = realizeEn(n, a.options);
    return latticeText(lattice(nr.slots, nr.end));
  });
  return buildItem({
    skillId: a.skillId,
    templateId: a.templateId,
    level: a.level,
    slots: r.slots,
    end: r.end,
    altOrders,
    extraAnswers: a.extraAnswers,
    fr,
    blankGroups,
    hints: a.hints,
    distractors: a.distractors,
    frDistractors,
    enVariants,
    transform: a.transform,
    instruction: a.instruction,
    context: a.context,
    showTranslation: a.showTranslation,
    explanation: a.explanation,
    lexemes: [...lexemesOf({ subj: a.clause.subj, pred: a.clause.pred, obj: a.clause.obj, time: a.clause.time }), ...(a.extraLexemes ?? [])],
    itemIds: a.itemIds,
  });
}

/** Lattice complète d'une proposition (pour les transformations). */
export function clauseLattice(c: Clause, o?: RealizeOptions): Lattice {
  const r = realizeEn(c, o);
  return lattice(r.slots, r.end);
}

export function clauseText(c: Clause, o?: RealizeOptions): string {
  return latticeText(clauseLattice(c, o));
}

/** Toutes les formulations acceptées d'une proposition (ordres alternatifs inclus). */
export function clauseAnswers(c: Clause): Lattice[] {
  const out = [clauseLattice(c)];
  if (c.time?.front && (c.form ?? 'decl') === 'decl') out.push(clauseLattice(c, { timeFront: true }));
  return out;
}
