/**
 * Association : on sélectionne un élément à gauche puis un élément à droite
 * (souris, toucher ou clavier). Les paires trouvées se verrouillent.
 */
import { useEffect, useMemo, useState } from 'react';
import type { MatchingExercise } from '@/engine/exercises/types';
import { createRng } from '@/engine/core/rng';
import type { ExerciseViewProps } from './common';
import { useSpeech } from './audio';

export function MatchingView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<MatchingExercise>) {
  const right = useMemo(() => createRng(ex.id).shuffle(ex.pairs.map((p) => ({ id: p.id, text: p.right }))), [ex.id, ex.pairs]);
  const [selLeft, setSelLeft] = useState<string | null>(null);
  const [selRight, setSelRight] = useState<string | null>(null);
  const [done, setDone] = useState<string[]>([]);
  const [wrong, setWrong] = useState<string | null>(null);
  const [mistakes, setMistakes] = useState(0);
  const [missed, setMissed] = useState<string[]>([]);
  const { say, supported } = useSpeech();

  useEffect(() => {
    setDone([]);
    setMistakes(0);
    setMissed([]);
    setSelLeft(null);
    setSelRight(null);
  }, [ex.id]);

  const tryPair = (l: string | null, r: string | null) => {
    if (!l || !r) return;
    if (l === r) {
      const next = [...done, l];
      setDone(next);
      setSelLeft(null);
      setSelRight(null);
      if (next.length === ex.pairs.length) {
        onChange({ kind: 'multi', correct: ex.pairs.length, total: ex.pairs.length, mistakes, missedIds: missed });
        setTimeout(onSubmit, 350);
      }
    } else {
      setMistakes((m) => m + 1);
      // les deux éléments confondus seront revus plus tôt dans la révision espacée
      setMissed((cur) => [...new Set([...cur, l, r])]);
      setWrong(`${l}|${r}`);
      setTimeout(() => {
        setWrong(null);
        // n'efface que la paire fausse (une nouvelle sélection faite entre-temps est conservée)
        setSelLeft((cur) => (cur === l ? null : cur));
        setSelRight((cur) => (cur === r ? null : cur));
      }, 550);
    }
  };

  const pickLeft = (id: string) => {
    if (phase === 'checked' || done.includes(id)) return;
    setSelLeft(id);
    const pair = ex.pairs.find((p) => p.id === id);
    if (supported && pair) void say(pair.left);
    tryPair(id, selRight);
  };

  const pickRight = (id: string) => {
    if (phase === 'checked' || done.includes(id)) return;
    setSelRight(id);
    tryPair(selLeft, id);
  };

  const isWrong = (side: 'l' | 'r', id: string) => !!wrong && wrong.split('|')[side === 'l' ? 0 : 1] === id;

  return (
    <div className="ex-match">
      <div className="match-cols">
        <div className="match-col" role="group" aria-label={ex.leftLabel}>
          <p className="match-head">{ex.leftLabel}</p>
          {ex.pairs.map((p) => (
            <button
              key={p.id}
              type="button"
              lang="en"
              className={`match-item${selLeft === p.id ? ' is-selected' : ''}${done.includes(p.id) ? ' is-done' : ''}${isWrong('l', p.id) ? ' is-wrong' : ''}`}
              onClick={() => pickLeft(p.id)}
              disabled={done.includes(p.id) || phase === 'checked'}
              aria-pressed={selLeft === p.id}
            >
              {p.left}
            </button>
          ))}
        </div>
        <div className="match-col" role="group" aria-label={ex.rightLabel}>
          <p className="match-head">{ex.rightLabel}</p>
          {right.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`match-item${selRight === r.id ? ' is-selected' : ''}${done.includes(r.id) ? ' is-done' : ''}${isWrong('r', r.id) ? ' is-wrong' : ''}`}
              onClick={() => pickRight(r.id)}
              disabled={done.includes(r.id) || phase === 'checked'}
              aria-pressed={selRight === r.id}
            >
              {r.text}
            </button>
          ))}
        </div>
      </div>
      <p className="faint small" aria-live="polite">
        {done.length}/{ex.pairs.length} paires trouvées{mistakes ? ` · ${mistakes} erreur${mistakes > 1 ? 's' : ''}` : ''}
      </p>
    </div>
  );
}
