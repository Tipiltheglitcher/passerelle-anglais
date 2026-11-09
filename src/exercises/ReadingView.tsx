/**
 * Texte (ou dialogue) suivi de questions à choix, corrigées question par
 * question : compréhension écrite, textes longs, analyse d'arguments et de
 * dialogues.
 */
import { useEffect, useState } from 'react';
import { FOCUS_LABELS, type ReadingExercise } from '@/engine/exercises/types';
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
      const tags = ex.questions.flatMap((q, i) => (q.options[next[i]]?.correct ? [] : [q.focus ? `reading_${q.focus}` : 'meaning']));
      onChange({ kind: 'multi', correct, total: ex.questions.length, mistakes: ex.questions.length - correct, tags });
      setTimeout(onSubmit, 900);
    }
  };

  const long = ex.type !== 'reading';
  const paragraphs = ex.text ? ex.text.split(long ? /\n\s*\n/ : '\n') : [];
  const audio = ex.lines ? ex.lines.map((l) => l.text).join(' ') : ex.text.replace(/\n+/g, ' ');

  return (
    <div className={`ex-reading${long ? ' is-long' : ''}`}>
      <article className="reading-text" lang="en">
        <header className="row">
          <div className="spacer">
            {ex.genre && <p className="reading-genre">{ex.genre}</p>}
            <h3>{ex.title}</h3>
          </div>
          <AudioButton text={audio} label={ex.lines ? "Écouter l'échange" : 'Écouter le texte'} />
        </header>
        {ex.lines ? (
          <div className="exchange">
            {ex.lines.map((l, i) => (
              <p key={i} className="exchange-line">
                <span className="exchange-speaker">{l.speaker}</span>
                <span>{l.text}</span>
              </p>
            ))}
          </div>
        ) : (
          paragraphs.map((p, i) =>
            long ? (
              <p key={i} className="reading-para">
                <span className="para-num" aria-label={`Paragraphe ${i + 1}`}>
                  {i + 1}
                </span>
                {p}
              </p>
            ) : (
              <p key={i}>{p}</p>
            ),
          )
        )}
      </article>
      <ol className="questions">
        {ex.questions.map((q, qi) => {
          const a = answers[qi];
          return (
            <li key={qi} className="question">
              {q.focus && <span className="question-focus">{FOCUS_LABELS[q.focus]}</span>}
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
