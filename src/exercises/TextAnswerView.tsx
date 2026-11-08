import { useEffect, useRef, useState } from 'react';
import type { DictationExercise, TransformationExercise, TranslateFrEnExercise } from '@/engine/exercises/types';
import { englishInputProps, type ExerciseViewProps } from './common';
import { AudioButton } from './audio';
import { IconArrowRight } from '@/ui/icons';

type TextExercise = TranslateFrEnExercise | TransformationExercise | DictationExercise;

export function TextAnswerView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<TextExercise>) {
  const [value, setValue] = useState('');
  const ref = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    setValue('');
    const t = setTimeout(() => ref.current?.focus({ preventScroll: true }), ex.type === 'dictation' ? 400 : 50);
    return () => clearTimeout(t);
  }, [ex.id, ex.type]);
  const short = ex.type === 'translateFrEn' && ex.wordMode;
  return (
    <div className="ex-text">
      {ex.type === 'translateFrEn' && (
        <div className="source-card">
          <span className="source-flag" aria-hidden>
            FR
          </span>
          <p className="sentence sentence-source" lang="fr">
            {ex.source}
          </p>
        </div>
      )}
      {ex.type === 'transformation' && (
        <div className="source-card">
          <p className="sentence sentence-source" lang="en">
            {ex.source}
          </p>
          <IconArrowRight size={20} aria-hidden className="faint" />
        </div>
      )}
      {ex.type === 'dictation' && (
        <div className="listen-box">
          <AudioButton text={ex.audioText} big autoPlay showSlow label="Écouter" />
          <p className="faint small">Écoutez autant de fois que nécessaire. La ponctuation et les majuscules ne comptent pas.</p>
        </div>
      )}
      <label className="sr-only" htmlFor={`ans-${ex.id}`}>
        Votre réponse en anglais
      </label>
      <textarea
        id={`ans-${ex.id}`}
        ref={ref}
        className={`textarea answer-input${short ? ' answer-short' : ''}`}
        rows={short ? 1 : 2}
        value={value}
        placeholder={ex.type === 'dictation' ? 'Écrivez ce que vous entendez…' : short ? 'Mot ou expression en anglais' : 'Écrivez votre réponse en anglais…'}
        onChange={(e) => {
          setValue(e.target.value);
          onChange(e.target.value.trim() ? { kind: 'text', value: e.target.value } : null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            onSubmit();
          }
        }}
        disabled={phase === 'checked'}
        {...englishInputProps}
      />
    </div>
  );
}
