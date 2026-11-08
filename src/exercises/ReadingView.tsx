/** Compréhension écrite : texte puis questions à choix (correction immédiate par question). */
import { useEffect, useState } from 'react';
import type { ReadingExercise } from '@/engine/exercises/types';
import type { ExerciseViewProps } from './common';
import { AudioButton } from './audio';
import { IconCheck, IconClose } from '@/ui/icons';

export function ReadingView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<ReadingExercise>) {
  const [answers, setAnswers] = useState<Record<number, number>>({});
  useEffect(() => setAnswers({}), [ex.id]);

  const pick = (qi: number, oi: number) => {
    if (answers[qi] !== undefined || phase === 'checked') return;
    const next = { ...answers, [qi]: oi };
    setAnswers(next);
    if (Object.keys(next).length === ex.questions.length) {
      const correct = ex.questions.filter((q, i) => q.options[next[i]]?.correct).length;
      const tags = ex.questions.filter((q, i) => !q.options[next[i]]?.correct).map(() => 'meaning');
      onChange({ kind: 'multi', correct, total: ex.questions.length, mistakes: ex.questions.length - correct, tags });
      setTimeout(onSubmit, 900);
    }
  };

  return (
    <div className="ex-reading">
      <article className="reading-text" lang="en">
        <header className="row">
          <h3>{ex.title}</h3>
          <span className="spacer" />
          <AudioButton text={ex.text.replace(/\n/g, ' ')} label="Écouter le texte" />
        </header>
        {ex.text.split('\n').map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </article>
      <ol className="questions">
        {ex.questions.map((q, qi) => {
          const a = answers[qi];
          return (
            <li key={qi} className="question">
              <p className="question-text" lang="en">
                {q.q}
              </p>
              <div className="options options-compact">
                {q.options.map((o, oi) => {
                  const state = a === undefined ? '' : o.correct ? 'is-correct' : a === oi ? 'is-wrong' : 'is-dim';
                  return (
                    <button key={oi} type="button" className={`option ${state}`} onClick={() => pick(qi, oi)} disabled={a !== undefined} lang="en">
                      <span className="option-key" aria-hidden>
                        {a !== undefined && o.correct ? <IconCheck size={14} /> : a === oi ? <IconClose size={14} /> : String.fromCharCode(65 + oi)}
                      </span>
                      <span className="option-text">{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {a !== undefined && <p className={`question-why ${q.options[a]?.correct ? 'ok' : 'ko'}`}>{q.explanation}</p>}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
