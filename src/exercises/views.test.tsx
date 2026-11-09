/**
 * Interactions essentielles des exercices : clic / toucher, clavier,
 * validation par Entrée, association, correction d'erreur, retour affiché.
 */
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ExerciseView, FeedbackPanel } from './ExerciseView';
import { makeExercise } from '@/engine/learning/select';
import { vocabExercise } from '@/engine/exercises/vocab';
import { evaluate } from '@/engine/exercises/evaluate';
import { createRng } from '@/engine/core/rng';
import type { Exercise, ExerciseResponse, ExerciseType, InsightExercise, MatchingExercise, TextOrderExercise, WritingExercise } from '@/engine/exercises/types';
import { SPECIAL_ENGINES } from '@/engine/learning/advancedSkills';

function make(type: ExerciseType, skill = 'present_simple'): Exercise {
  for (let i = 0; i < 40; i++) {
    const ex = makeExercise(skill, { seed: `ui-${type}-${i}`, level: 'A2', audio: false }, { types: [type] });
    if (ex && ex.type === type) return ex;
  }
  throw new Error(`aucun exercice ${type}`);
}

function unexpected(): never {
  throw new Error('format inattendu');
}

function setup(ex: Exercise) {
  const onChange = vi.fn<(r: ExerciseResponse | null) => void>();
  const onSubmit = vi.fn();
  render(<ExerciseView exercise={ex} phase="answering" result={null} onChange={onChange} onSubmit={onSubmit} />);
  const last = () => onChange.mock.calls.at(-1)?.[0] ?? null;
  return { onChange, onSubmit, last, user: userEvent.setup() };
}

describe('remettre dans l’ordre', () => {
  it('au clic / toucher : la phrase construite est correcte', async () => {
    const ex = make('wordOrder');
    if (ex.type !== 'wordOrder') unexpected();
    const { last, user } = setup(ex);
    for (const word of ex.accepted[0]) {
      const btn = screen.getAllByRole('button', { name: `${ex.tiles.find((t) => t.text.toLowerCase() === word.toLowerCase())!.text} — placer` })[0];
      await user.click(btn);
    }
    const r = last();
    expect(r?.kind).toBe('order');
    expect(evaluate(ex, r!).correct).toBe(true);
  });

  it('au clavier : Entrée place, flèches déplacent, Retour arrière retire', async () => {
    const ex = make('wordOrder');
    const { user } = setup(ex);
    const line = screen.getByLabelText('Votre phrase');
    const bank = () => screen.getAllByRole('button', { name: /— placer$/ });
    bank()[0].focus();
    await user.keyboard('{Enter}');
    bank()[0].focus();
    await user.keyboard('{Enter}');
    const placed = () => within(line).getAllByRole('button').map((b) => b.textContent);
    const before = placed();
    expect(before).toHaveLength(2);
    // déplacer le premier mot placé vers la droite
    within(line).getAllByRole('button')[0].focus();
    await user.keyboard('{ArrowRight}');
    expect(placed()).toEqual([before[1], before[0]]);
    // le retirer
    within(line).getAllByRole('button')[1].focus();
    await user.keyboard('{Backspace}');
    expect(placed()).toEqual([before[1]]);
  });
});

describe('choix multiple', () => {
  it('touches 1 à 4, double-clic pour valider', async () => {
    const ex = make('mcq');
    const { last, onSubmit, user } = setup(ex);
    await user.keyboard('2');
    expect(last()).toEqual({ kind: 'choice', index: 1 });
    expect(screen.getAllByRole('radio')[1]).toHaveAttribute('aria-checked', 'true');
    await user.dblClick(screen.getAllByRole('radio')[0]);
    expect(last()).toEqual({ kind: 'choice', index: 0 });
    expect(onSubmit).toHaveBeenCalled();
  });
});

describe('phrase à trous', () => {
  it('saisie puis Entrée pour vérifier', async () => {
    const ex = make('cloze');
    if (ex.type !== 'cloze') unexpected();
    const { last, onSubmit, user } = setup(ex);
    const input = screen.getAllByRole('textbox')[0];
    const answer = ex.blanks[0].display;
    await user.type(input, answer);
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalled();
    if (ex.blanks.length === 1) expect(evaluate(ex, last()!).correct).toBe(true);
  });
});

describe("correction d'erreur", () => {
  it('sélection du mot fautif puis correction', async () => {
    const ex = make('errorCorrection');
    if (ex.type !== 'errorCorrection') unexpected();
    const { last, onSubmit, user } = setup(ex);
    const words = screen.getAllByRole('button').filter((b) => b.classList.contains('tok'));
    const target = words.find((b) => b.textContent === ex.tokens[ex.wrong[0]])!;
    await user.click(target);
    const input = await screen.findByLabelText('Correction :');
    // la vue donne le focus au champ (et sélectionne son texte) après un court délai :
    // on l'attend pour ne pas taper pendant ce délai
    await waitFor(() => expect(input).toHaveFocus());
    await user.clear(input);
    await user.type(input, ex.correctionText);
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalled();
    expect(evaluate(ex, last()!).correct).toBe(true);
  });
});

describe('association', () => {
  it('paires trouvées, erreur comptée, validation automatique', async () => {
    const ex = vocabExercise({ rng: createRng('ui-match'), seed: 'ui-match', level: 'B1', difficulty: 1 }, 'travel', 'matching') as MatchingExercise;
    const { last, onSubmit, user } = setup(ex);
    const left = (p: { left: string }) => screen.getByRole('button', { name: p.left });
    const right = (p: { right: string }) => screen.getByRole('button', { name: p.right });
    // une erreur volontaire
    await user.click(left(ex.pairs[0]));
    await user.click(right(ex.pairs[1]));
    await new Promise((r) => setTimeout(r, 650));
    for (const p of ex.pairs) {
      await user.click(left(p));
      await user.click(right(p));
    }
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const r = last();
    expect(r).toMatchObject({ kind: 'multi', correct: ex.pairs.length, total: ex.pairs.length, mistakes: 1 });
    const res = evaluate(ex, r!);
    expect(res.correct).toBe(true);
    expect(res.itemOutcomes?.[ex.pairs[0].id]).toBe(false);
    expect(res.itemOutcomes?.[ex.pairs[2].id]).toBe(true);
  });
});

describe('retour après vérification', () => {
  it('affiche la réponse attendue et l’explication', () => {
    const ex = make('cloze');
    if (ex.type !== 'cloze') unexpected();
    const res = evaluate(ex, { kind: 'blanks', values: ex.blanks.map(() => 'zzz') });
    render(<FeedbackPanel exercise={ex} result={res} />);
    expect(screen.getByRole('status')).toHaveTextContent(res.headline);
    expect(screen.getByText('Réponse attendue :')).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(ex.explanation.slice(0, 20));
  });
});

describe('formats avancés', () => {
  const adv = (seed: string) => ({ rng: createRng(seed), seed, difficulty: 2 as const });

  it('choix commenté : sélection, puis explication de chaque option après vérification', async () => {
    const ex = SPECIAL_ENGINES.register_b2.make(adv('ui-reg'), 'register') as InsightExercise;
    const { last, user } = setup(ex);
    const good = ex.options.findIndex((o) => o.correct);
    await user.click(screen.getAllByRole('radio')[good]);
    expect(last()).toEqual({ kind: 'choice', index: good });
    expect(evaluate(ex, last()!).correct).toBe(true);
    render(<ExerciseView exercise={ex} phase="checked" result={evaluate(ex, last()!)} onChange={() => {}} onSubmit={() => {}} />);
    for (const o of ex.options) expect(screen.getAllByText(o.why).length).toBeGreaterThan(0);
  });

  it('reformulation avec mot imposé : saisie, compteur de mots, Entrée', async () => {
    const ex = makeExercise('modals_past', { seed: 'ui-kw', level: 'B1', audio: false }, { type: 'keyword' });
    if (ex?.type !== 'keyword') unexpected();
    const { last, onSubmit, user } = setup(ex);
    const input = screen.getByLabelText('Mots manquants');
    await waitFor(() => expect(input).toHaveFocus());
    await user.type(input, ex.answerText);
    expect(screen.getByText(/mots? \(attendu/)).toBeInTheDocument();
    await user.keyboard('{Enter}');
    expect(onSubmit).toHaveBeenCalled();
    expect(evaluate(ex, last()!).correct).toBe(true);
  });

  it('organisation du texte : les boutons déplacent les parties', async () => {
    const ex = SPECIAL_ENGINES.argument_b2.make(adv('ui-order'), 'textOrder') as TextOrderExercise;
    const { last, user } = setup(ex);
    expect(last()).toEqual({ kind: 'sequence', ids: ex.segments.map((s) => s.id) });
    await user.click(screen.getAllByRole('button', { name: 'Descendre' })[0]);
    const ids = (last() as { ids: string[] }).ids;
    expect(ids[1]).toBe(ex.segments[0].id);
    expect(ids[0]).toBe(ex.segments[1].id);
  });

  it('rédaction : rédiger, analyser, s’auto-évaluer, valider', async () => {
    const ex = SPECIAL_ENGINES.writing_b2.make(adv('ui-w'), 'writing') as WritingExercise;
    const { last, onSubmit, user } = setup(ex);
    const area = screen.getByLabelText('Votre texte en anglais');
    await user.click(area);
    await user.paste(ex.model);
    await user.click(screen.getByRole('button', { name: 'Analyser mon texte' }));
    expect(screen.getByText('Vérifications automatiques')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Complétez l’auto-évaluation' })).toBeDisabled();
    for (const group of screen.getAllByRole('radiogroup')) await user.click(within(group).getByRole('radio', { name: 'Oui' }));
    await user.click(screen.getByRole('button', { name: 'Valider' }));
    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const r = last();
    expect(r?.kind).toBe('writing');
    const res = evaluate(ex, r!);
    expect(res.correct).toBe(true);
    expect(res.approximate).toBe(true);
    expect(res.selfScore).toBe(1);
  });
});
