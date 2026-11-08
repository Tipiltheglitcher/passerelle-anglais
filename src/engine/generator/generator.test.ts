/**
 * Validation massive des générateurs : pour chaque compétence, des centaines
 * d'items sont générés avec des graines reproductibles, puis convertis dans
 * tous les formats possibles. On vérifie la justesse (anglais, français),
 * la cohérence des corrections et l'absence de répétitions.
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync } from 'node:fs';
import { createRng } from '@/engine/core/rng';
import { matchAnswer, lattice, latticeText } from '@/engine/core/lattice';
import { ITEM_GENERATORS } from './registry';
import { setRejectListener } from './item';
import { validateItem } from './validate';
import type { GenContext, SentenceItem } from './types';
import { canMake, itemToExercise } from '@/engine/exercises/factory';
import { evaluate } from '@/engine/exercises/evaluate';
import { EXERCISE_TYPES, type Exercise, type ExerciseResponse } from '@/engine/exercises/types';

const N = 260;

function ctxFor(skill: string, i: number): GenContext {
  return { rng: createRng(`${skill}#${i}`), level: i % 3 === 0 ? 'A2' : 'B1', difficulty: ((i % 3) + 1) as 1 | 2 | 3 };
}

function correctResponse(ex: Exercise): ExerciseResponse | null {
  switch (ex.type) {
    case 'wordOrder': {
      const pool = [...ex.tiles];
      const ids: string[] = [];
      for (const w of ex.accepted[0]) {
        const idx = pool.findIndex((t) => t.text.toLowerCase() === w.toLowerCase());
        if (idx < 0) return null;
        ids.push(pool[idx].id);
        pool.splice(idx, 1);
      }
      return { kind: 'order', tiles: ids };
    }
    case 'cloze':
    case 'conjugation':
      if (ex.variant === 'grid') return { kind: 'blanks', values: ex.fields.map((f) => f.display) };
      return { kind: 'blanks', values: ex.blanks.map((b) => b.display) };
    case 'mcq':
    case 'contextChoice':
    case 'translateEnFr':
    case 'listening':
      return { kind: 'choice', index: ex.options.findIndex((o) => o.correct) };
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

describe('générateurs de grammaire', () => {
  const rejects: Record<string, string[]> = {};
  setRejectListener((problems, item) => {
    (rejects[item.skillId] ??= []).push(...problems);
  });
  const samples: string[] = [];

  for (const [skill, gen] of Object.entries(ITEM_GENERATORS)) {
    it(`${skill} : génère des items valides et variés`, () => {
      const items: SentenceItem[] = [];
      for (let i = 0; i < N; i++) {
        const it = gen(ctxFor(skill, i));
        if (it) items.push(it);
      }
      // taux de succès suffisant (sinon le générateur est trop contraint ou buggé)
      expect(items.length, `${skill} : ${items.length}/${N} items ; rejets : ${(rejects[skill] ?? []).slice(0, 5).join(' | ')}`).toBeGreaterThan(N * 0.6);
      // validation explicite
      for (const it of items) expect(validateItem(it)).toEqual([]);
      // variété
      const texts = new Set(items.map((x) => latticeText(lattice(x.slots, x.end))));
      const minDistinct = ['requests_offers', 'future_forms'].includes(skill) ? 8 : 40;
      expect(texts.size, `${skill} : seulement ${texts.size} phrases distinctes`).toBeGreaterThanOrEqual(minDistinct);
      // reproductibilité
      const again = gen(ctxFor(skill, 7));
      const first = gen(ctxFor(skill, 7));
      expect(again && latticeText(lattice(again.slots, again.end))).toBe(first && latticeText(lattice(first.slots, first.end)));
      // la phrase complète est acceptée par son propre treillis
      for (const it of items.slice(0, 60)) {
        const text = latticeText(lattice(it.slots, it.end));
        expect(matchAnswer(text, { lattices: [lattice(it.slots, it.end)] }).ok, text).toBe(true);
      }
      items.slice(0, 6).forEach((x) => samples.push(`[${skill}] ${latticeText(lattice(x.slots, x.end))}  ||  ${x.fr}`));
    });

    it(`${skill} : chaque format d'exercice se corrige correctement`, () => {
      let made = 0;
      for (let i = 0; i < 80; i++) {
        const ctx = ctxFor(skill, i + 1000);
        const item = gen(ctx);
        if (!item) continue;
        for (const type of EXERCISE_TYPES) {
          if (!canMake(item, type)) continue;
          const ex = itemToExercise(item, type, { rng: ctx.rng.fork(type), seed: `t${i}`, difficulty: ctx.difficulty });
          if (!ex) continue;
          made++;
          const resp = correctResponse(ex);
          expect(resp, `${skill}/${type}`).not.toBeNull();
          const res = evaluate(ex, resp!);
          expect(res.correct, `${skill}/${type} : la bonne réponse est refusée (${res.expected} / ${res.userAnswer})`).toBe(true);
          // une mauvaise réponse est refusée
          if (ex.type === 'mcq' || ex.type === 'contextChoice' || ex.type === 'translateEnFr' || ex.type === 'listening') {
            const wrong = ex.options.findIndex((o) => !o.correct);
            if (wrong >= 0) expect(evaluate(ex, { kind: 'choice', index: wrong }).correct).toBe(false);
            expect(ex.options.filter((o) => o.correct).length).toBe(1);
          }
          if (ex.type === 'cloze') {
            for (const d of ex.known.slice(0, 2)) {
              if (!d.text || d.text === '∅' || ex.blanks.length !== 1) continue;
              expect(evaluate(ex, { kind: 'blanks', values: [d.text] }).correct, `${skill} : distracteur « ${d.text} » accepté`).toBe(false);
            }
          }
          if (ex.type === 'errorCorrection') {
            const outside = ex.tokens.findIndex((_, k) => (k < ex.wrong[0] || k > ex.wrong[1]) && !/^[.,!?]$/.test(ex.tokens[k]));
            if (outside >= 0) expect(evaluate(ex, { kind: 'error', index: outside, correction: ex.correctionText }).correct).toBe(false);
          }
        }
      }
      expect(made).toBeGreaterThan(20);
    });
  }

  it('écrit un échantillon pour relecture humaine (si SAMPLE_OUT est défini)', () => {
    const out = process.env.SAMPLE_OUT;
    if (out) writeFileSync(out, samples.join('\n'), 'utf8');
    expect(true).toBe(true);
  });
});
