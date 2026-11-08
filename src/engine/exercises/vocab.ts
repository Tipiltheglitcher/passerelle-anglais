/**
 * Exercices de vocabulaire et de verbes irréguliers.
 */
import { lattice, s, spec, specFromStrings } from '@/engine/core/lattice';
import { shortHash, type Rng } from '@/engine/core/rng';
import { capitalizeFirst, normalizeText } from '@/engine/core/text';
import { IRREGULAR_VERBS, type IrregularVerb } from '@/content/lexicon/verbs';
import { ALL_VOCAB, POS_LABELS, VOCAB_THEMES, type VocabItem } from '@/content/vocabulary';
import type {
  ClozeExercise,
  DictationExercise,
  Exercise,
  ExerciseType,
  GridExercise,
  ListeningExercise,
  MatchingExercise,
  McqExercise,
  TranslateFrEnExercise,
} from './types';

export interface SpecialContext {
  rng: Rng;
  seed: string;
  level: 'A2' | 'B1';
  difficulty: 1 | 2 | 3;
  /** Poids d'un élément mémorisable (révision espacée, nouveauté). */
  itemWeight?: (itemId: string) => number;
}

const clean = (t: string) => t.replace(/\s*\([^)]*\)\s*/g, ' ').trim();

function weightedPick<T extends { id: string }>(ctx: SpecialContext, items: T[]): T {
  return ctx.rng.pickWeighted(items, (it) => (ctx.itemWeight ? ctx.itemWeight(it.id) : 1));
}

function themeItems(themeId: string, level: 'A2' | 'B1'): VocabItem[] {
  const t = VOCAB_THEMES.find((x) => x.id === themeId);
  if (!t) return [];
  return t.items.filter((i) => level === 'B1' || i.lv === 'A2');
}

function base(ctx: SpecialContext, type: ExerciseType, skillId: string, sig: string, instruction: string, explanation: string, itemIds: string[], lexemes: string[]) {
  return {
    id: `${type}-${shortHash(`${ctx.seed}|${sig}`)}`,
    type,
    skillId,
    level: ctx.level,
    difficulty: ctx.difficulty,
    instruction,
    explanation,
    signature: shortHash(`${type}|${sig}`),
    structure: `${skillId}.${type}`,
    lexemes,
    itemIds,
    seed: ctx.seed,
  };
}

function vocabExplanation(it: VocabItem): string {
  const pos = POS_LABELS[it.pos] ?? it.pos;
  const ex = it.ex ? ` Exemple : « ${it.ex.en} » (${it.ex.fr})` : '';
  return `${it.en.join(' / ')} (${pos}) = ${it.fr.join(' / ')}.${ex}`;
}

/** Formats disponibles pour un thème de vocabulaire. */
export const VOCAB_TYPES: ExerciseType[] = ['matching', 'mcq', 'translateFrEn', 'listening', 'dictation', 'cloze', 'contextChoice'];

export function vocabExercise(ctx: SpecialContext, themeId: string, type: ExerciseType): Exercise | null {
  const items = themeItems(themeId, ctx.level);
  if (items.length < 5) return null;
  const skillId = `vocab_${themeId}`;
  // phrase à trous / choix en contexte : il faut un exemple contenant le mot
  const candidates = type === 'cloze' || type === 'contextChoice' ? items.filter(hasUsableExample) : items;
  if (!candidates.length) return null;
  const target = weightedPick(ctx, candidates);
  const others = items.filter((i) => i.id !== target.id && i.pos === target.pos);
  const pool = others.length >= 3 ? others : items.filter((i) => i.id !== target.id);
  switch (type) {
    case 'matching': {
      const chosen = [target, ...ctx.rng.sample(items.filter((i) => i.id !== target.id), 4)];
      // évite deux traductions identiques
      const seen = new Set<string>();
      const pairs = chosen
        .filter((i) => {
          const k = normalizeText(i.fr[0]);
          if (seen.has(k)) return false;
          seen.add(k);
          return true;
        })
        .map((i) => ({ id: i.id, left: i.en[0], right: clean(i.fr[0]) }));
      if (pairs.length < 4) return null;
      const ex: MatchingExercise = {
        ...base(ctx, 'matching', skillId, pairs.map((p) => p.id).sort().join(','), 'Associez chaque mot anglais à sa traduction.', pairs.map((p) => `${p.left} = ${p.right}`).join(' · '), pairs.map((p) => p.id), []),
        type: 'matching',
        pairs,
        leftLabel: 'Anglais',
        rightLabel: 'Français',
      };
      return ex;
    }
    case 'mcq':
    case 'contextChoice': {
      const enToFr = type === 'mcq' ? ctx.rng.chance(0.5) : false;
      if (type === 'contextChoice') {
        // phrase d'exemple à compléter (choix du mot en contexte)
        if (!target.ex) return null;
        const word = target.en.find((w) => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(target.ex!.en));
        if (!word) return null;
        const parts = splitAround(target.ex.en, word);
        if (!parts) return null;
        const distract = ctx.rng.sample(pool, 3).map((d) => d.en[0]);
        const ex: McqExercise = {
          ...base(ctx, 'contextChoice', skillId, `${target.id}|ctx`, 'Choisissez le mot qui convient dans cette phrase.', vocabExplanation(target), [target.id], []),
          type: 'contextChoice',
          stem: [{ kind: 'text', text: parts[0] }, { kind: 'blank', index: 0 }, { kind: 'text', text: parts[1] }],
          options: ctx.rng.shuffle([{ text: word, correct: true }, ...distract.map((d) => ({ text: d, correct: false, tag: 'vocabulary' }))]),
          translation: target.ex.fr,
          showTranslation: true,
          audioText: target.ex.en,
        };
        return ex;
      }
      const distract = ctx.rng.sample(pool, 3);
      const ex: McqExercise = {
        ...base(ctx, 'mcq', skillId, `${target.id}|${enToFr ? 'ef' : 'fe'}`, enToFr ? `Que signifie « ${target.en[0]} » ?` : `Comment dit-on « ${clean(target.fr[0])} » en anglais ?`, vocabExplanation(target), [target.id], []),
        type: 'mcq',
        question: enToFr ? `« ${target.en[0]} »` : `« ${clean(target.fr[0])} »`,
        options: ctx.rng.shuffle([
          { text: enToFr ? clean(target.fr[0]) : target.en[0], correct: true },
          ...distract.map((d) => ({ text: enToFr ? clean(d.fr[0]) : d.en[0], correct: false, tag: target.pos === 'ff' ? 'false_friend' : 'vocabulary' })),
        ]),
        showTranslation: false,
        audioText: target.en[0],
      };
      return ex;
    }
    case 'translateFrEn': {
      const ex: TranslateFrEnExercise = {
        ...base(ctx, 'translateFrEn', skillId, `${target.id}|tr`, `Traduisez en anglais : « ${clean(target.fr[0])} »`, vocabExplanation(target), [target.id], []),
        type: 'translateFrEn',
        source: target.fr.map(clean).join(' / '),
        answer: specFromStrings(target.en),
        answerText: target.en[0],
        known: pool.slice(0, 3).map((d) => ({ text: d.en[0], tag: 'vocabulary' })),
        wordMode: true,
        audioText: target.en[0],
      };
      return ex;
    }
    case 'listening': {
      const distract = ctx.rng.sample(pool, 3);
      const ex: ListeningExercise = {
        ...base(ctx, 'listening', skillId, `${target.id}|ls`, 'Écoutez et choisissez le mot que vous entendez.', vocabExplanation(target), [target.id], []),
        type: 'listening',
        mode: 'which',
        audioText: target.en[0],
        question: 'Quel mot avez-vous entendu ?',
        options: ctx.rng.shuffle([{ text: target.en[0], correct: true }, ...distract.map((d) => ({ text: d.en[0], correct: false, tag: 'vocabulary' }))]),
        transcript: target.en[0],
        translation: clean(target.fr[0]),
      };
      return ex;
    }
    case 'dictation': {
      const text = target.ex?.en ?? null;
      const answerText = text ?? target.en[0];
      const ex: DictationExercise = {
        ...base(ctx, 'dictation', skillId, `${target.id}|dict`, text ? 'Écoutez la phrase et écrivez-la.' : 'Écoutez le mot et écrivez-le.', vocabExplanation(target), [target.id], []),
        type: 'dictation',
        audioText: answerText,
        answer: text ? spec(lattice([s(text.replace(/[.!?]$/, ''))], (text.match(/[.!?]$/)?.[0] as '.' | '?' | '!') ?? '.')) : specFromStrings(target.en),
        answerText,
        translation: text ? target.ex!.fr : clean(target.fr[0]),
      };
      return ex;
    }
    case 'cloze': {
      if (!target.ex) return null;
      const word = target.en.find((w) => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(target.ex!.en));
      if (!word) return null;
      const parts = splitAround(target.ex.en, word);
      if (!parts) return null;
      const ex: ClozeExercise = {
        ...base(ctx, 'cloze', skillId, `${target.id}|cl`, 'Complétez la phrase avec le mot qui convient (aide : la traduction).', vocabExplanation(target), [target.id], []),
        type: 'cloze',
        variant: 'sentence',
        parts: [{ kind: 'text', text: parts[0] }, { kind: 'blank', index: 0 }, { kind: 'text', text: parts[1] }],
        blanks: [{ answer: specFromStrings([word]), display: word, hint: clean(target.fr[0]) }],
        translation: target.ex.fr,
        showTranslation: true,
        answerText: target.ex.en,
        known: [],
        audioText: target.ex.en,
      };
      return ex;
    }
    default:
      return null;
  }
}

/** L'exemple contient-il le mot tel quel (utilisable pour une phrase à trous) ? */
export function hasUsableExample(i: VocabItem): boolean {
  return !!i.ex && i.en.some((w) => new RegExp(`\\b${escapeRe(w)}\\b`, 'i').test(i.ex!.en));
}

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function splitAround(sentence: string, word: string): [string, string] | null {
  const m = new RegExp(`\\b${escapeRe(word)}\\b`, 'i').exec(sentence);
  if (!m) return null;
  return [sentence.slice(0, m.index).trimEnd(), sentence.slice(m.index + m[0].length).trimStart()];
}

// ---------------------------------------------------------------------------
// Verbes irréguliers (grille base → prétérit → participe)

export function irregularExercise(ctx: SpecialContext): Exercise {
  const pool = IRREGULAR_VERBS.filter((v) => ctx.level === 'B1' || v.lv === 'A2').map((v) => ({ ...v, id: `irr:${v.base}` }));
  const v = weightedPick(ctx, pool) as IrregularVerb & { id: string };
  const mode = ctx.difficulty === 1 && ctx.rng.chance(0.5) ? 'reverse' : 'forms';
  if (mode === 'reverse') {
    const ex: GridExercise = {
      ...base(ctx, 'conjugation', 'past_simple_irregular', `${v.base}|rev`, "Retrouvez l'infinitif de ce verbe irrégulier.", irregularExplanation(v), [`irr:${v.base}`], [`verb:${v.base}`]),
      type: 'conjugation',
      variant: 'grid',
      prompt: `${v.past[0]} — ${v.pp[0]}`,
      meaning: v.fr,
      fields: [{ label: 'Base verbale', answer: specFromStrings([v.base]), display: v.base }],
    };
    return ex;
  }
  const ex: GridExercise = {
    ...base(ctx, 'conjugation', 'past_simple_irregular', `${v.base}|forms`, 'Donnez le prétérit et le participe passé de ce verbe irrégulier.', irregularExplanation(v), [`irr:${v.base}`], [`verb:${v.base}`]),
    type: 'conjugation',
    variant: 'grid',
    prompt: `to ${v.base}`,
    meaning: v.fr,
    fields: [
      { label: 'Prétérit', answer: specFromStrings(v.past), display: v.past.join(' / ') },
      { label: 'Participe passé', answer: specFromStrings(v.pp), display: v.pp.join(' / ') },
    ],
  };
  return ex;
}

function irregularExplanation(v: IrregularVerb): string {
  const pattern: Record<IrregularVerb['pattern'], string> = {
    AAA: 'les trois formes sont identiques',
    ABB: 'prétérit et participe passé identiques',
    ABA: 'la base et le participe passé sont identiques',
    ABC: 'trois formes différentes',
  };
  return `${v.base} → ${v.past.join(' / ')} → ${v.pp.join(' / ')} (« ${v.fr} ») : ${pattern[v.pattern]}.`;
}

export function irregularMatching(ctx: SpecialContext): MatchingExercise {
  const pool = IRREGULAR_VERBS.filter((v) => ctx.level === 'B1' || v.lv === 'A2').map((v) => ({ ...v, id: `irr:${v.base}` }));
  const chosen = ctx.rng.sample(pool, 5);
  const pairs = chosen.map((v) => ({ id: v.id, left: v.base, right: v.past[0] }));
  return {
    ...base(ctx, 'matching', 'past_simple_irregular', pairs.map((p) => p.id).sort().join(','), 'Associez chaque verbe à son prétérit.', chosen.map((v) => `${v.base} → ${v.past[0]}`).join(' · '), chosen.map((v) => v.id), []),
    type: 'matching',
    pairs,
    leftLabel: 'Base verbale',
    rightLabel: 'Prétérit',
  };
}

export function allVocabIds(): string[] {
  return ALL_VOCAB.map((v) => v.id);
}

export { capitalizeFirst };
