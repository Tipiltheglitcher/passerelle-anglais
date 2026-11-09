/**
 * Choix commentés (nuance, registre, implicite, style) : après la
 * vérification, chaque option affiche son explication.
 */
import { useEffect, useState } from 'react';
import type { InsightExercise } from '@/engine/exercises/types';
import type { ExerciseViewProps } from './common';
import { AudioButton } from './audio';
import { IconCheck, IconClose } from '@/ui/icons';

export function InsightView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<InsightExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [ex.id]);

  useEffect(() => {
    if (phase !== 'answering') return;
    const on = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      const n = Number(e.key);
      if (n >= 1 && n <= ex.options.length) {
        setPicked(n - 1);
        onChange({ kind: 'choice', index: n - 1 });
      }
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [ex.options.length, phase, onChange]);

  const choose = (i: number) => {
    if (phase !== 'answering') return;
    setPicked(i);
    onChange({ kind: 'choice', index: i });
  };

  const checked = phase === 'checked';
  const audio = ex.passage ?? ex.lines?.map((l) => l.text).join(' ');

  return (
    <div className={`ex-insight insight-${ex.type}`}>
      {ex.situation && <p className="situation">{ex.situation}</p>}
      {ex.passage && (
        <div className="insight-passage">
          <p lang="en">{ex.passage}</p>
          {audio && <AudioButton text={audio} label="Écouter" />}
        </div>
      )}
      {ex.lines && (
        <div className="exchange" lang="en">
          {ex.lines.map((l, i) => (
            <p key={i} className="exchange-line">
              <span className="exchange-speaker">{l.speaker}</span>
              <span>{l.text}</span>
            </p>
          ))}
          {audio && <AudioButton text={audio} label="Écouter l'échange" />}
        </div>
      )}
      <p className="question-big">{ex.question}</p>
      <div className="options options-long insight-options" role="radiogroup" aria-label="Propositions">
        {ex.options.map((o, i) => {
          const state = checked ? (o.correct ? 'is-correct' : picked === i ? 'is-wrong' : 'is-dim') : picked === i ? 'is-picked' : '';
          return (
            <div key={`${ex.id}-${i}`} className="insight-option">
              <button
                type="button"
                role="radio"
                aria-checked={picked === i}
                className={`option ${state}`}
                onClick={() => choose(i)}
                onDoubleClick={() => phase === 'answering' && onSubmit()}
                disabled={checked}
                lang="en"
              >
                <span className="option-key" aria-hidden>
                  {checked && o.correct ? <IconCheck size={16} /> : checked && picked === i ? <IconClose size={16} /> : i + 1}
                </span>
                <span className="option-text">{o.text}</span>
                {checked && o.label && <span className="insight-label">{o.label}</span>}
              </button>
              {checked && <p className={`insight-why ${o.correct ? 'ok' : 'ko'}`}>{o.why}</p>}
            </div>
          );
        })}
      </div>
    </div>
  );
}
