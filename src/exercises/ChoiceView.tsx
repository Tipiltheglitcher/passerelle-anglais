import { useEffect, useState } from 'react';
import type { ListeningExercise, McqExercise, TranslateEnFrExercise } from '@/engine/exercises/types';
import { ZERO_LABEL } from '@/engine/generator/types';
import { ContextLine, Sentence, Translation, type ExerciseViewProps } from './common';
import { AudioButton } from './audio';
import { IconCheck, IconClose } from '@/ui/icons';

type ChoiceExercise = McqExercise | TranslateEnFrExercise | ListeningExercise;

export function ChoiceView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<ChoiceExercise>) {
  const [picked, setPicked] = useState<number | null>(null);
  useEffect(() => setPicked(null), [ex.id]);
  // raccourcis clavier 1–4
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

  const lang = ex.type === 'translateEnFr' ? 'fr' : 'en';
  const filled = picked !== null ? ex.options[picked].text : null;

  return (
    <div className="ex-choice">
      {ex.type === 'listening' && (
        <div className="listen-box">
          <AudioButton text={ex.audioText} big autoPlay showSlow label="Écouter" />
          {phase === 'checked' && (
            <p className="transcript" lang="en">
              <strong>Transcription :</strong> {ex.transcript}
            </p>
          )}
          {ex.mode === 'comprehension' && <p className="question-line">{ex.question}</p>}
        </div>
      )}
      {ex.type === 'translateEnFr' && (
        <div className="source-line">
          <p className="sentence sentence-source" lang="en">
            {ex.source}
          </p>
          <AudioButton text={ex.source} autoPlay />
        </div>
      )}
      {(ex.type === 'mcq' || ex.type === 'contextChoice') && (
        <>
          {ex.context && (ex.stem ? <ContextLine text={ex.context} /> : <p className="situation">{ex.context}</p>)}
          {ex.stem && (
            <Sentence
              parts={ex.stem}
              renderBlank={() => <span className={`blank-chip${filled ? ' is-filled' : ''}`}>{filled && filled !== ZERO_LABEL ? filled : filled === ZERO_LABEL ? '∅' : '\u00a0'}</span>}
            />
          )}
          {!ex.stem && ex.question && !ex.context && <p className="question-big">{ex.question}</p>}
        </>
      )}
      <div className={`options${ex.options.some((o) => o.text.length > 32) ? ' options-long' : ''}`} role="radiogroup" aria-label="Propositions">
        {ex.options.map((o, i) => {
          const state = phase === 'checked' ? (o.correct ? 'is-correct' : picked === i ? 'is-wrong' : 'is-dim') : picked === i ? 'is-picked' : '';
          return (
            <button key={`${ex.id}-${i}`} type="button" role="radio" aria-checked={picked === i} className={`option ${state}`} onClick={() => choose(i)} onDoubleClick={() => phase === 'answering' && onSubmit()} disabled={phase === 'checked'} lang={lang}>
              <span className="option-key" aria-hidden>
                {phase === 'checked' && o.correct ? <IconCheck size={16} /> : phase === 'checked' && picked === i ? <IconClose size={16} /> : i + 1}
              </span>
              <span className="option-text">{o.text}</span>
            </button>
          );
        })}
      </div>
      {(ex.type === 'mcq' || ex.type === 'contextChoice') && <Translation text={ex.translation} force={ex.showTranslation} />}
      {ex.type === 'listening' && phase === 'checked' && ex.translation && <p className="translation">{ex.translation}</p>}
    </div>
  );
}
