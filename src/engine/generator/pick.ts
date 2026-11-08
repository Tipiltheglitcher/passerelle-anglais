/**
 * Sélection pondérée des éléments lexicaux : on favorise les lexèmes peu vus
 * (variété) et les éléments à réviser (répétition pédagogique), dans le
 * respect du niveau visé.
 */
import type { GenContext } from './types';
import type { Noun, Predicate, Subject } from '@/content/lexicon/types';
import { NOUN_BY_ID, NOUNS } from '@/content/lexicon/nouns';
import { NARROW, PREDICATES, timeFits } from '@/content/lexicon/predicates';
import { ALL_SUBJECTS, NAMES, PEOPLE, PRONOUNS } from '@/content/lexicon/subjects';
import { TIME_EXPRESSIONS, type TimeClass, type TimeExpr } from '@/content/lexicon/time';
import type { ObjChoice } from './clause';

export function weightOf(ctx: GenContext, lexId: string): number {
  let w = ctx.lexWeight ? ctx.lexWeight(lexId) : 1;
  if (ctx.prefer?.has(lexId)) w *= 4;
  return w;
}

function levelOk(ctx: GenContext, lv: 'A2' | 'B1'): boolean {
  return ctx.level === 'B1' || lv === 'A2';
}

export interface SubjectFilter {
  /** Proportion de pronoms (0–1). */
  pronouns?: number;
  /** Uniquement 3ᵉ personne du singulier. */
  third?: boolean;
  /** Exclure la 3ᵉ personne du singulier. */
  notThird?: boolean;
  /** Exclure les enfants (prédicats d'adultes). */
  adult?: boolean;
  exclude?: readonly string[];
  /** Exclure « you » (ambigu dans certaines consignes). */
  noYou?: boolean;
}

export function pickSubject(ctx: GenContext, f: SubjectFilter = {}): Subject {
  const rng = ctx.rng;
  const usePron = rng.chance(f.pronouns ?? 0.55);
  let pool: Subject[] = usePron ? PRONOUNS : rng.chance(0.5) ? NAMES : PEOPLE;
  const ok = (s: Subject) =>
    (!f.third || (s.person === 3 && s.num === 'sg')) &&
    (!f.notThird || !(s.person === 3 && s.num === 'sg')) &&
    (!f.adult || !s.child) &&
    (!f.noYou || s.person !== 2) &&
    !(f.exclude ?? []).includes(s.id);
  pool = pool.filter(ok);
  if (pool.length === 0) pool = ALL_SUBJECTS.filter(ok);
  return rng.pickWeighted(pool, (s) => weightOf(ctx, `subj:${s.id}`));
}

export function pickPredicate(ctx: GenContext, filter: (p: Predicate) => boolean): Predicate | null {
  let pool = PREDICATES.filter((p) => levelOk(ctx, p.lv) && filter(p));
  // Les prédicats très spécifiques ne sont tirés que par des filtres explicites (listes courtes).
  if (pool.length > 25) pool = pool.filter((p) => !NARROW.has(p.id));
  if (pool.length === 0) return null;
  return ctx.rng.pickWeighted(pool, (p) => weightOf(ctx, `pred:${p.id}`) * weightOf(ctx, `verb:${p.v}`));
}

export function subjectFits(p: Predicate, s: Subject): boolean {
  return !(p.adult && s.child);
}

/** Choisit un complément d'objet compatible avec le prédicat. */
export function pickObject(ctx: GenContext, p: Predicate, opts: { det?: ObjChoice['det'] } = {}): ObjChoice | undefined {
  if (!p.obj) return undefined;
  const spec = p.obj;
  let pool: Noun[] = [];
  if (spec.nouns) pool = spec.nouns.map((id) => NOUN_BY_ID[id]).filter(Boolean);
  if (spec.cats) pool = pool.concat(NOUNS.filter((n) => n.c.some((c) => spec.cats!.includes(c))));
  pool = pool.filter((n) => levelOk(ctx, n.lv));
  if (pool.length === 0) return undefined;
  const noun = ctx.rng.pickWeighted(pool, (n) => weightOf(ctx, `noun:${n.id}`));
  const det = opts.det && spec.dets.includes(opts.det) ? opts.det : ctx.rng.pick(spec.dets);
  let plural = false;
  if (!noun.u && !noun.po) {
    if (spec.pl !== undefined) plural = spec.pl;
    else if (det === 'gen') plural = true;
    else if (det === 'none') plural = false;
    else if (pluralFriendly(noun)) plural = ctx.rng.chance(det === 'a' ? 0.3 : 0.25);
  }
  return { noun, det, plural };
}

const PLURAL_CATS = new Set(['count_food', 'veg', 'fruit', 'reading', 'writing', 'watch', 'smallitem', 'clothes', 'gift', 'person', 'family', 'listen', 'friend']);
const SINGULAR_CATS = new Set(['vehicle', 'home', 'device', 'appliance', 'furniture', 'room', 'place', 'transport', 'building', 'container']);
const SINGULAR_IDS = new Set(['mother', 'father', 'grandmother', 'grandfather', 'boss', 'teacher', 'doctor', 'bag', 'umbrella', 'wallet', 'passport', 'password', 'notebook', 'coat', 'jacket', 'hat', 'scarf']);

/** Le pluriel est-il naturel pour ce nom (mes clés oui, mes voitures non) ? */
export function pluralFriendly(n: Noun): boolean {
  if (SINGULAR_IDS.has(n.id)) return false;
  if (n.c.some((c) => SINGULAR_CATS.has(c))) return false;
  return n.c.some((c) => PLURAL_CATS.has(c));
}

export function pickTime(ctx: GenContext, classes: TimeClass[], filter?: (t: TimeExpr) => boolean): TimeExpr {
  let pool = TIME_EXPRESSIONS.filter((t) => classes.includes(t.cls) && levelOk(ctx, t.lv) && (!filter || filter(t)));
  if (pool.length === 0) pool = TIME_EXPRESSIONS.filter((t) => classes.includes(t.cls) && (!filter || filter(t)));
  if (pool.length === 0) pool = TIME_EXPRESSIONS.filter((t) => classes.includes(t.cls));
  return ctx.rng.pickWeighted(pool, (t) => weightOf(ctx, `time:${t.id}`));
}

/** Expression de temps passée ou future adaptée à l'échelle du prédicat. */
export function pickTimeFor(ctx: GenContext, cls: 'past' | 'future', p: Predicate): TimeExpr {
  return pickTime(ctx, [cls], (t) => timeFits(p, t.id, cls));
}

/** Identifiants de lexèmes d'une proposition (pour l'exposition et la révision). */
export function lexemesOf(parts: { subj?: Subject; pred?: Predicate; obj?: ObjChoice; time?: { id?: string } }): string[] {
  const out: string[] = [];
  if (parts.subj) out.push(`subj:${parts.subj.id}`);
  if (parts.pred) out.push(`pred:${parts.pred.id}`, `verb:${parts.pred.v}`);
  if (parts.obj) out.push(`noun:${parts.obj.noun.id}`);
  if (parts.time?.id) out.push(`time:${parts.time.id}`);
  return out;
}
