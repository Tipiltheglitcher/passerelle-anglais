/** Reformulation avec mot imposé : phrase de départ, mot clé, phrase à compléter. */
import { useEffect, useRef, useState } from 'react';
import type { KeywordExercise } from '@/engine/exercises/types';
import { countWords } from '@/engine/generator/bank';
import { englishInputProps, type ExerciseViewProps } from './common';

export function KeywordView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<KeywordExercise>) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLInputElement>(null);
  useEffect(() => {
    setValue('');
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), 60);
    return () => clearTimeout(t);
  }, [ex.id]);
  const n = countWords(value);
  const inRange = n >= ex.minWords && n <= ex.maxWords;
  return (
    <div className="ex-keyword">
      <div className="source-card">
        <p className="sentence sentence-source" lang="en">
          {ex.source}
        </p>
      </div>
      <p className="keyword-key">
        Mot imposé : <strong lang="en">{ex.key}</strong>
      </p>
      <p className="sentence keyword-gap" lang="en">
        <span>{ex.before} </span>
        <label className="sr-only" htmlFor={`kw-${ex.id}`}>
          Mots manquants
        </label>
        <input
          id={`kw-${ex.id}`}
          ref={ref}
          className="input keyword-input"
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            onChange(e.target.value.trim() ? { kind: 'text', value: e.target.value } : null);
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault();
              onSubmit();
            }
          }}
          disabled={phase === 'checked'}
          size={Math.max(14, value.length + 2)}
          {...englishInputProps}
        />
        <span> {ex.after}</span>
      </p>
      <p className={`small keyword-count${value && !inRange ? ' warning-text' : ' faint'}`} aria-live="polite">
        {value ? `${n} mot${n > 1 ? 's' : ''} (attendu : ${ex.minWords} à ${ex.maxWords}, une contraction compte pour deux)` : `${ex.minWords} à ${ex.maxWords} mots, en incluant le mot imposé.`}
      </p>
    </div>
  );
}
