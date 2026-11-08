import { useEffect, useRef, useState } from 'react';
import type { ErrorExercise } from '@/engine/exercises/types';
import { englishInputProps, Translation, type ExerciseViewProps } from './common';

export function ErrorView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<ErrorExercise>) {
  const [sel, setSel] = useState<number | null>(null);
  const [fix, setFix] = useState('');
  const input = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setSel(null);
    setFix('');
  }, [ex.id]);

  const isPunct = (t: string) => /^[.,!?;:]$/.test(t);
  const inRange = (k: number) => k >= ex.wrong[0] && k <= ex.wrong[1];

  const select = (k: number) => {
    if (phase === 'checked') return;
    setSel(k);
    // pré-remplit avec le groupe de mots sélectionné
    const start = inRange(k) ? ex.wrong[0] : k;
    const end = inRange(k) ? ex.wrong[1] : k;
    const text = ex.tokens.slice(start, end + 1).join(' ');
    setFix(text);
    onChange(text.trim() ? { kind: 'error', index: k, correction: text } : null);
    setTimeout(() => {
      input.current?.focus();
      input.current?.select();
    }, 30);
  };

  return (
    <div className="ex-error">
      <p className="sentence error-sentence" lang="en">
        {ex.tokens.map((t, k) =>
          isPunct(t) ? (
            <span key={k} className="tok-punct">
              {t}
            </span>
          ) : (
            <button
              key={k}
              type="button"
              className={`tok${sel !== null && (inRange(sel) ? inRange(k) : sel === k) ? ' is-selected' : ''}${phase === 'checked' && inRange(k) ? ' is-error' : ''}`}
              onClick={() => select(k)}
              disabled={phase === 'checked'}
              aria-pressed={sel === k}
            >
              {t}
            </button>
          ),
        )}
      </p>
      {sel !== null && (
        <div className="fix-row animate-rise">
          <label htmlFor={`fix-${ex.id}`} className="small muted">
            Correction :
          </label>
          <input
            id={`fix-${ex.id}`}
            ref={input}
            className="input"
            value={fix}
            onChange={(e) => {
              setFix(e.target.value);
              onChange(e.target.value.trim() ? { kind: 'error', index: sel, correction: e.target.value } : null);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                onSubmit();
              }
            }}
            disabled={phase === 'checked'}
            {...englishInputProps}
          />
        </div>
      )}
      {sel === null && phase === 'answering' && <p className="faint small">Touchez le mot (ou le groupe de mots) qui contient l'erreur.</p>}
      <Translation text={ex.translation} />
    </div>
  );
}
