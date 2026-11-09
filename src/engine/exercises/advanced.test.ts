/**
 * Niveaux avancés (B2 → C2) : contenus rédigés, formats commentés,
 * reformulations, organisation de texte, rédaction, progression.
 */
import { describe, expect, it } from 'vitest';
import { createRng } from '@/engine/core/rng';
import { analyseWriting, type AdvancedContext } from './advanced';
import { evaluate, keyPresent } from './evaluate';
import type { Exercise, ExerciseResponse, InsightExercise, ReadingExercise, TextOrderExercise, WritingExercise } from './types';
import { bindVariables, countWords, keywordExercise, type Bindings } from '@/engine/generator/bank';
import { GRAMMAR_BANKS, NUANCE_EXTRAS, SPECIAL_ENGINES, grammarExtras } from '@/engine/learning/advancedSkills';
import { makeExercise } from '@/engine/learning/select';
import { ALL_SKILLS, SKILL_BY_ID } from '@/content/curriculum';
import { VOCAB_THEMES } from '@/content/vocabulary';
import { LESSONS } from '@/content/lessons';
import { vocabExercise } from './vocab';

function adv(seed: string): AdvancedContext {
  return { rng: createRng(seed), seed, difficulty: 2 };
}

/** Réponse correcte pour les formats à choix / texte / ordre. */
function correctOf(ex: Exercise): ExerciseResponse | null {
  switch (ex.type) {
    case 'nuance':
    case 'register':
    case 'implicature':
    case 'styleEdit':
    case 'mcq':
    case 'contextChoice':
    case 'translateEnFr':
    case 'listening':
      return { kind: 'choice', index: ex.options.findIndex((o) => o.correct) };
    case 'longReading':
    case 'argument':
    case 'dialogueAnalysis':
    case 'reading':
      return { kind: 'multi', correct: ex.questions.length, total: ex.questions.length, mistakes: 0 };
    case 'textOrder':
      return { kind: 'sequence', ids: ex.orders[0] };
    case 'keyword':
      return { kind: 'text', value: ex.answerText };
    case 'cloze':
    case 'conjugation':
      if (ex.variant === 'grid') return { kind: 'blanks', values: ex.fields.map((f) => f.display) };
      return { kind: 'blanks', values: ex.blanks.map((b) => b.display) };
    case 'translateFrEn':
    case 'transformation':
    case 'dictation':
      return { kind: 'text', value: ex.answerText };
    case 'errorCorrection':
      return { kind: 'error', index: ex.wrong[0], correction: ex.correctionText };
    default:
      return null;
  }
}

const bothGenders = (seed: string, e: Parameters<typeof bindVariables>[1]): Bindings[] => {
  const out: Bindings[] = [];
  for (let i = 0; i < 40 && out.length < 2; i++) {
    const b = bindVariables({ rng: createRng(`${seed}-${i}`), level: 'B1', difficulty: 2 }, e);
    if (!out.some((x) => x.P.female === b.P.female)) out.push(b);
  }
  return out;
};

describe('compétences avancées : curriculum et leçons', () => {
  it('chaque compétence avancée a un moteur, un générateur ou un thème, et une leçon (hors vocabulaire)', () => {
    for (const s of ALL_SKILLS.filter((x) => x.stage !== 'a2b1')) {
      if (s.kind === 'vocab') expect(VOCAB_THEMES.some((t) => `vocab_${t.id}` === s.id), s.id).toBe(true);
      else if (s.kind === 'function') expect(SPECIAL_ENGINES[s.id], s.id).toBeDefined();
      else expect(GRAMMAR_BANKS[s.id] || ['past_perfect', 'third_conditional'].includes(s.id), s.id).toBeTruthy();
      if (s.kind !== 'vocab') expect(LESSONS[s.id], s.id).toBeDefined();
    }
  });

  it('les thèmes de vocabulaire avancés ont le niveau de leur étape et des exemples utilisables', () => {
    for (const t of VOCAB_THEMES.filter((x) => x.level)) {
      const def = SKILL_BY_ID[`vocab_${t.id}`];
      expect(def, t.id).toBeDefined();
      expect(def.level, t.id).toBe(t.level);
      for (const type of ['mcq', 'matching', 'cloze', 'translateFrEn', 'contextChoice'] as const) {
        const ex = vocabExercise({ rng: createRng(`${t.id}-${type}`), seed: `${t.id}-${type}`, level: 'B1', difficulty: 2 }, t.id, type);
        expect(ex, `${t.id}/${type}`).toBeTruthy();
        expect(evaluate(ex!, correctOf(ex!) ?? { kind: 'multi', correct: 5, total: 5, mistakes: 0 }).correct, `${t.id}/${type}`).toBe(true);
      }
    }
  });
});

describe('formats commentés et textes', () => {
  for (const [skillId, engine] of Object.entries(SPECIAL_ENGINES)) {
    it(`${skillId} : chaque format produit des exercices valides, bien corrigés`, () => {
      for (const type of engine.formats.filter((x) => x !== 'writing')) {
        const seen = new Set<string>();
        for (let i = 0; i < 12; i++) {
          const ex = engine.make(adv(`${skillId}-${type}-${i}`), type);
          expect(ex, `${skillId}/${type}`).toBeTruthy();
          if (!ex) continue;
          seen.add(ex.signature);
          expect(ex.skillId).toBe(skillId);
          expect(ex.explanation.length).toBeGreaterThan(20);
          const good = correctOf(ex)!;
          expect(evaluate(ex, good).correct, `${skillId}/${type} : bonne réponse refusée`).toBe(true);
          if ('options' in ex) {
            const opts = (ex as InsightExercise).options;
            expect(opts.filter((o) => o.correct)).toHaveLength(1);
            expect(new Set(opts.map((o) => o.text)).size).toBe(opts.length);
            for (const o of opts) expect(o.why.length, o.text).toBeGreaterThan(5);
            const wrong = opts.findIndex((o) => !o.correct);
            expect(evaluate(ex, { kind: 'choice', index: wrong }).correct).toBe(false);
          }
          if (ex.type === 'longReading' || ex.type === 'argument' || ex.type === 'dialogueAnalysis') {
            const r = ex as ReadingExercise;
            expect(r.questions.length).toBeGreaterThanOrEqual(4);
            for (const q of r.questions) {
              expect(q.options.filter((o) => o.correct)).toHaveLength(1);
              expect(new Set(q.options.map((o) => o.text)).size).toBe(q.options.length);
              expect(q.focus).toBeTruthy();
              expect(q.explanation.length).toBeGreaterThan(5);
            }
            if (ex.type === 'longReading') expect(r.text.split(/\s+/).length).toBeGreaterThan(200);
            expect(evaluate(ex, { kind: 'multi', correct: 1, total: r.questions.length, mistakes: r.questions.length - 1 }).correct).toBe(false);
          }
        }
        expect(seen.size, `${skillId}/${type} : variété`).toBeGreaterThanOrEqual(2);
      }
    });
  }

  it("organisation du texte : l'ordre attendu est accepté, un ordre inversé est refusé avec un score partiel cohérent", () => {
    const ex = SPECIAL_ENGINES.argument_b2.make(adv('order'), 'textOrder') as TextOrderExercise;
    expect(evaluate(ex, { kind: 'sequence', ids: ex.orders[0] }).correct).toBe(true);
    const reversed = [...ex.orders[0]].reverse();
    const r = evaluate(ex, { kind: 'sequence', ids: reversed });
    expect(r.correct).toBe(false);
    expect(r.score).toBe(0);
    const swapped = [...ex.orders[0]];
    [swapped[0], swapped[1]] = [swapped[1], swapped[0]];
    const p = evaluate(ex, { kind: 'sequence', ids: swapped });
    expect(p.correct).toBe(false);
    expect(p.score).toBeGreaterThan(0);
    expect(p.score).toBeLessThan(1);
  });
});

describe('reformulation avec mot imposé', () => {
  it('chaque réponse prévue contient le mot imposé, respecte le nombre de mots et est acceptée', () => {
    let n = 0;
    for (const bank of Object.values(GRAMMAR_BANKS)) {
      for (const e of bank.entries.filter((x) => x.kw)) {
        for (const b of bothGenders(e.id, e)) {
          const ex = keywordExercise(bank.skillId, e, b, { seed: e.id, difficulty: 2 })!;
          expect(ex, e.id).toBeTruthy();
          for (const raw of e.kw!.ans) {
            const ans = raw.replace(/\{(\w+)\}/g, (m, k) => (k === 'P' ? b.P.name : k === 'Q' ? b.Q : b.vars[k]?.en ?? ({ he: b.P.female ? 'she' : 'he', his: b.P.female ? 'her' : 'his', him: b.P.female ? 'her' : 'him' } as Record<string, string>)[k] ?? m));
            expect(keyPresent(ans, e.kw!.key), `${e.id} : « ${ans} » sans ${e.kw!.key}`).toBe(true);
            const w = countWords(ans);
            expect(w, `${e.id} : « ${ans} » (${w} mots)`).toBeGreaterThanOrEqual(ex.minWords);
            expect(w, `${e.id} : « ${ans} » (${w} mots)`).toBeLessThanOrEqual(ex.maxWords);
            expect(evaluate(ex, { kind: 'text', value: ans }).correct, `${e.id} : « ${ans} » refusée`).toBe(true);
          }
          expect(evaluate(ex, { kind: 'text', value: 'something completely different' }).correct).toBe(false);
          n++;
        }
      }
    }
    expect(n).toBeGreaterThan(20);
  });

  it('une réponse sans le mot imposé est refusée avec une remarque', () => {
    const bank = GRAMMAR_BANKS.modals_past;
    const e = bank.entries.find((x) => x.id === 'mp8')!;
    const ex = keywordExercise(bank.skillId, e, bothGenders('x', e)[0], { seed: 's', difficulty: 2 })!;
    const r = evaluate(ex, { kind: 'text', value: 'probably forgot' });
    expect(r.correct).toBe(false);
    expect(r.errorTag).toBe('keyword_missing');
    expect(r.note).toMatch(/mot imposé/);
  });

  it('les notions de grammaire B2 proposent leurs formats complémentaires', () => {
    expect(grammarExtras('modals_past')).toEqual(expect.arrayContaining(['keyword', 'nuance']));
    const ex = makeExercise('modals_past', { seed: 'kw', level: 'B1', audio: false }, { type: 'keyword' });
    expect(ex?.type).toBe('keyword');
    const nu = makeExercise('past_perfect', { seed: 'nu', level: 'B1', audio: false }, { type: 'nuance' });
    expect(nu?.type).toBe('nuance');
    for (const items of Object.values(NUANCE_EXTRAS)) for (const it of items) expect(new Set(it.o.map((o) => o[0])).size).toBe(it.o.length);
  });
});

describe('rédaction guidée', () => {
  const writingSkills = Object.entries(SPECIAL_ENGINES).filter(([, e]) => e.formats.includes('writing'));

  it('chaque modèle respecte la longueur, contient les éléments imposés et ne déclenche aucune erreur certaine', () => {
    for (const [skillId, engine] of writingSkills) {
      for (let i = 0; i < 10; i++) {
        const ex = engine.make(adv(`${skillId}-w-${i}`), 'writing') as WritingExercise;
        const rep = analyseWriting(ex, ex.model);
        expect(rep.lengthOk, `${ex.title} : ${rep.words} mots`).toBe(true);
        for (const c of rep.checks) expect(c.ok, `${ex.title} : ${c.label}`).toBe(true);
        expect(rep.issues, ex.title).toEqual([]);
        expect(ex.rubric.length).toBeGreaterThanOrEqual(4);
      }
    }
  });

  it('repère les erreurs certaines sans faux positif sur les noms composés', () => {
    const ex = { minWords: 5, maxWords: 200, checks: [] };
    const rep = analyseWriting(ex, 'I am agree with you. We need more informations and it depends of the weather. I have lived here since three years.');
    const tags = rep.issues.map((i) => i.tag);
    expect(tags).toEqual(expect.arrayContaining(['agree', 'uncountable', 'depend_on', 'for_since']));
    expect(rep.issues.find((i) => i.tag === 'agree')?.fix).toBe('I agree');
    expect(analyseWriting(ex, 'There are too many informations here.').issues[0].fix).toBe('much information');
    const clean = analyseWriting(ex, 'Go to the information desk, then ask for a research grant. She has a good knowledge of French and an evidence-based approach.');
    expect(clean.issues).toEqual([]);
  });

  it("l'évaluation est marquée comme partielle et conserve le texte", () => {
    const [skillId, engine] = writingSkills[0];
    const ex = engine.make(adv(`${skillId}-eval`), 'writing') as WritingExercise;
    const report = analyseWriting(ex, ex.model);
    const r = evaluate(ex, { kind: 'writing', text: ex.model, report, self: [1, 1, 0.5, 1, 1] });
    expect(r.correct).toBe(true);
    expect(r.approximate).toBe(true);
    expect(r.selfScore).toBeCloseTo(0.9);
    expect(r.production).toBe(ex.model);
    const short = analyseWriting(ex, 'Too short.');
    expect(evaluate(ex, { kind: 'writing', text: 'Too short.', report: short, self: [] }).correct).toBe(false);
  });
});
