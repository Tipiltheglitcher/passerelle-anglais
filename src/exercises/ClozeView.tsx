import { useEffect, useRef, useState } from 'react';
import type { ClozeExercise, GridExercise } from '@/engine/exercises/types';
import { ContextLine, englishInputProps, Sentence, Translation, type ExerciseViewProps } from './common';

export function ClozeView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<ClozeExercise>) {
  const [values, setValues] = useState<string[]>(() => ex.blanks.map(() => ''));
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, [ex.id]);
  const update = (i: number, v: string) => {
    const next = values.map((x, k) => (k === i ? v : x));
    setValues(next);
    const complete = next.every((x, k) => x.trim() !== '' || ex.blanks[k].display === '');
    onChange(complete ? { kind: 'blanks', values: next } : null);
  };
  return (
    <div className="ex-cloze">
      <ContextLine text={ex.context} />
      <Sentence
        parts={ex.parts}
        renderBlank={(i) => {
          const b = ex.blanks[i];
          const width = Math.max(4, Math.min(22, b.display.length + 2));
          return (
            <span className="blank-wrap">
              <input
                ref={i === 0 ? first : undefined}
                className={`blank-input${phase === 'checked' ? ' is-locked' : ''}`}
                style={{ width: `${width}ch` }}
                value={values[i]}
                onChange={(e) => update(i, e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    onSubmit();
                  }
                }}
                disabled={phase === 'checked'}
                aria-label={`Trou ${i + 1}${b.hint ? ` (indice : ${b.hint})` : ''}`}
                {...englishInputProps}
              />
              {b.hint && <span className="blank-hint">({b.hint})</span>}
            </span>
          );
        }}
      />
      <div className="ex-tools">
        <Translation text={ex.translation} force={ex.showTranslation} />
      </div>
    </div>
  );
}

export function GridView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<GridExercise>) {
  const [values, setValues] = useState<string[]>(() => ex.fields.map(() => ''));
  const first = useRef<HTMLInputElement>(null);
  useEffect(() => {
    first.current?.focus({ preventScroll: true });
  }, [ex.id]);
  const update = (i: number, v: string) => {
    const next = values.map((x, k) => (k === i ? v : x));
    setValues(next);
    onChange(next.every((x) => x.trim()) ? { kind: 'blanks', values: next } : null);
  };
  return (
    <div className="ex-grid">
      <div className="verb-card">
        <span className="verb-main" lang="en">
          {ex.prompt}
        </span>
        <span className="verb-meaning">« {ex.meaning} »</span>
      </div>
      <div className="grid-fields">
        {ex.fields.map((f, i) => (
          <label key={f.label} className="field">
            <span>{f.label}</span>
            <input
              ref={i === 0 ? first : undefined}
              className="input input-lg"
              value={values[i]}
              onChange={(e) => update(i, e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  onSubmit();
                }
              }}
              disabled={phase === 'checked'}
              {...englishInputProps}
            />
          </label>
        ))}
      </div>
    </div>
  );
}
