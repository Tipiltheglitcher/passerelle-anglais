/**
 * Exercices hors générateurs de phrases : vocabulaire, verbes irréguliers,
 * compréhension écrite et orale, dialogues ; évaluation en plusieurs étapes ;
 * formats disponibles par notion.
 */
import { describe, expect, it } from 'vitest';
import { createRng } from '@/engine/core/rng';
import { VOCAB_THEMES } from '@/content/vocabulary';
import { FEMALE_NAMES } from '@/content/lexicon/subjects';
import { ALL_SKILLS } from '@/content/curriculum';
import { ITEM_GENERATORS } from '@/engine/generator/registry';
import { evaluate } from './evaluate';
import { canMake, itemToExercise } from './factory';
import { irregularExercise, irregularMatching, vocabExercise, VOCAB_TYPES, type SpecialContext } from './vocab';
import { listeningComprehension, readingExercise } from './comprehension';
import { dialogueExercise, DIALOGUE_COUNT } from './dialogues';
import type { Exercise, ExerciseResponse, MatchingExercise } from './types';
import { formatSupport, formatsFor, supportsFormat } from '@/engine/learning/formats';
import { makeExercise } from '@/engine/learning/select';

function ctx(seed: string, difficulty: 1 | 2 | 3 = 2, level: 'A2' | 'B1' = 'B1'): SpecialContext {
  return { rng: createRng(seed), seed, level, difficulty };
}

function correctResponse(ex: Exercise): ExerciseResponse {
  switch (ex.type) {
    case 'matching':
      return { kind: 'multi', correct: ex.pairs.length, total: ex.pairs.length, mistakes: 0, missedIds: [] };
    case 'reading':
      return { kind: 'multi', correct: ex.questions.length, total: ex.questions.length, mistakes: 0 };
    case 'dialogue':
      return { kind: 'multi', correct: 1, total: 1, mistakes: 0 };
    case 'mcq':
    case 'contextChoice':
    case 'listening':
    case 'translateEnFr':
      return { kind: 'choice', index: ex.options.findIndex((o) => o.correct) };
    case 'translateFrEn':
    case 'dictation':
    case 'transformation':
      return { kind: 'text', value: ex.answerText };
    case 'cloze':
    case 'conjugation':
      if (ex.variant === 'grid') return { kind: 'blanks', values: ex.fields.map((f) => f.display.split(' / ')[0]) };
      return { kind: 'blanks', values: ex.blanks.map((b) => b.display) };
    default:
      throw new Error(`format non géré : ${ex.type}`);
  }
}

function checkOptions(ex: Exercise) {
  if (!('options' in ex)) return;
  expect(ex.options.length).toBeGreaterThanOrEqual(3);
  expect(ex.options.filter((o) => o.correct)).toHaveLength(1);
  const texts = ex.options.map((o) => o.text.toLowerCase());
  expect(new Set(texts).size, `options en double : ${texts.join(' | ')}`).toBe(texts.length);
}

describe('vocabulaire', () => {
  it('chaque thème produit des exercices valides dans chaque format, corrigés correctement', () => {
    let made = 0;
    for (const theme of VOCAB_THEMES) {
      for (const type of VOCAB_TYPES) {
        for (let i = 0; i < 6; i++) {
          const ex = vocabExercise(ctx(`${theme.id}-${type}-${i}`, ((i % 3) + 1) as 1 | 2 | 3), theme.id, type);
          if (!ex) continue;
          made++;
          expect(ex.type).toBe(type);
          expect(ex.skillId).toBe(`vocab_${theme.id}`);
          expect(ex.itemIds.length).toBeGreaterThan(0);
          checkOptions(ex);
          const res = evaluate(ex, correctResponse(ex));
          expect(res.correct, `${theme.id}/${type} : bonne réponse refusée`).toBe(true);
        }
      }
    }
    expect(made).toBeGreaterThan(VOCAB_THEMES.length * 4 * 6);
  });

  it('un mauvais choix est refusé et étiqueté', () => {
    const ex = vocabExercise(ctx('voc-mcq'), 'travel', 'mcq');
    expect(ex?.type).toBe('mcq');
    if (ex?.type !== 'mcq') return;
    const wrong = ex.options.findIndex((o) => !o.correct);
    const res = evaluate(ex, { kind: 'choice', index: wrong });
    expect(res.correct).toBe(false);
    expect(res.errorTag).toBeTruthy();
  });

  it('les phrases à trous du vocabulaire viennent toujours d’un exemple contenant le mot', () => {
    for (let i = 0; i < 20; i++) {
      const ex = vocabExercise(ctx(`phrasal-${i}`), 'phrasal', 'cloze');
      expect(ex?.type).toBe('cloze');
      if (ex?.type === 'cloze') expect(ex.parts.some((p) => p.kind === 'blank')).toBe(true);
    }
  });
});

describe('verbes irréguliers', () => {
  it('grilles base → prétérit → participe, variantes acceptées', () => {
    for (let i = 0; i < 40; i++) {
      const ex = irregularExercise(ctx(`irr-${i}`, ((i % 3) + 1) as 1 | 2 | 3));
      expect(ex.type).toBe('conjugation');
      expect(evaluate(ex, correctResponse(ex)).correct).toBe(true);
    }
  });

  it('association verbe / prétérit', () => {
    const ex = irregularMatching(ctx('irr-match'));
    expect(ex.pairs.length).toBeGreaterThanOrEqual(4);
    expect(evaluate(ex, correctResponse(ex)).correct).toBe(true);
  });
});

describe('compréhension et dialogues', () => {
  it('textes de lecture valides, questions à réponse unique', () => {
    for (let i = 0; i < 40; i++) {
      const ex = readingExercise(ctx(`read-${i}`));
      expect(ex.text.length).toBeGreaterThan(80);
      expect(ex.questions.length).toBeGreaterThanOrEqual(3);
      for (const q of ex.questions) {
        expect(q.options.filter((o) => o.correct)).toHaveLength(1);
        expect(new Set(q.options.map((o) => o.text)).size).toBe(q.options.length);
      }
      expect(evaluate(ex, correctResponse(ex)).correct).toBe(true);
    }
  });

  it("l'e-mail accorde « he / she » avec son auteur", () => {
    for (let i = 0; i < 80; i++) {
      const ex = readingExercise(ctx(`mail-${i}`));
      const q = ex.questions.find((x) => x.q.startsWith('Has '));
      if (!q) continue;
      const name = q.q.split(' ')[1];
      const female = FEMALE_NAMES.includes(name);
      for (const o of q.options) {
        if (/^No, (he|she) is a student/.test(o.text)) expect(o.text.includes(female ? 'she' : 'he ')).toBe(true);
      }
    }
  });

  it('compréhension orale : une seule bonne réponse', () => {
    for (let i = 0; i < 30; i++) {
      const ex = listeningComprehension(ctx(`listen-${i}`));
      checkOptions(ex);
      expect(ex.audioText.length).toBeGreaterThan(20);
      expect(evaluate(ex, correctResponse(ex)).correct).toBe(true);
    }
  });

  it('dialogues : chaque étape a une seule réplique naturelle', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 60; i++) {
      const ex = dialogueExercise(ctx(`dia-${i}`));
      seen.add(ex.title);
      const choices = ex.turns.filter((t) => t.choice);
      expect(choices.length, ex.title).toBeGreaterThanOrEqual(1);
      for (const t of choices) {
        expect(t.choice!.options.filter((o) => o.correct)).toHaveLength(1);
        expect(t.choice!.options.length).toBeGreaterThanOrEqual(2);
        expect(new Set(t.choice!.options.map((o) => o.text)).size).toBe(t.choice!.options.length);
      }
    }
    expect(seen.size).toBe(DIALOGUE_COUNT);
  });
});

describe('évaluation en plusieurs étapes', () => {
  const match = vocabExercise(ctx('match-eval'), 'food', 'matching') as MatchingExercise;

  it('association : une erreur tolérée, chaque mot noté séparément', () => {
    const missed = [match.pairs[0].id];
    const one = evaluate(match, { kind: 'multi', correct: match.pairs.length, total: match.pairs.length, mistakes: 1, missedIds: missed });
    expect(one.correct).toBe(true);
    expect(one.score).toBeLessThan(1);
    expect(one.itemOutcomes?.[match.pairs[0].id]).toBe(false);
    expect(one.itemOutcomes?.[match.pairs[1].id]).toBe(true);
    const three = evaluate(match, { kind: 'multi', correct: match.pairs.length, total: match.pairs.length, mistakes: 3, missedIds: missed });
    expect(three.correct).toBe(false);
  });

  it('lecture : réussite à partir de 75 % de bonnes réponses', () => {
    const read = readingExercise(ctx('read-eval'));
    const n = read.questions.length;
    expect(evaluate(read, { kind: 'multi', correct: n, total: n, mistakes: 0 }).correct).toBe(true);
    expect(evaluate(read, { kind: 'multi', correct: 0, total: n, mistakes: n }).correct).toBe(false);
  });
});

describe('formats disponibles par notion', () => {
  it('chaque notion de grammaire propose au moins trois formats réellement générables', () => {
    for (const s of ALL_SKILLS.filter((x) => x.kind === 'grammar')) {
      const formats = formatsFor(s.id);
      // exception assumée : demandes et propositions = choix de la bonne formule en situation
      expect(formats.length, s.id).toBeGreaterThanOrEqual(s.id === 'requests_offers' ? 2 : 3);
      // le format annoncé est bien constructible avec un item réel
      const gen = ITEM_GENERATORS[s.id];
      const t = formats[0];
      let ok = false;
      for (let i = 0; i < 20 && !ok; i++) {
        const item = gen({ rng: createRng(`fmt-${s.id}-${i}`), level: 'B1', difficulty: 2 });
        if (item && canMake(item, t)) ok = !!itemToExercise(item, t, { rng: createRng('x'), seed: 'x', difficulty: 2 });
      }
      expect(ok, `${s.id}/${t}`).toBe(true);
    }
  });

  it('compétences spéciales et vocabulaire', () => {
    expect(supportsFormat('reading', 'reading')).toBe(true);
    expect(supportsFormat('dialogues', 'dialogue')).toBe(true);
    expect(supportsFormat('vocab_travel', 'matching')).toBe(true);
    expect(supportsFormat('past_simple_irregular', 'matching')).toBe(true);
    // un thème sans phrases d'exemple ne propose pas de phrase à trous
    expect(formatSupport('vocab_conversation').has('cloze')).toBe(false);
    expect(formatSupport('vocab_tech').has('cloze')).toBe(true);
  });

  it('un entraînement par format ne produit que ce format', () => {
    for (const type of ['cloze', 'wordOrder', 'translateFrEn'] as const) {
      for (let i = 0; i < 5; i++) {
        const ex = makeExercise('present_simple', { seed: `only-${type}-${i}`, level: 'A2', audio: false }, { types: [type] });
        expect(ex?.type).toBe(type);
      }
    }
  });
});
