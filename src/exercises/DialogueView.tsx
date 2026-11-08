/**
 * Dialogue interactif : les répliques s'affichent comme une conversation ;
 * à chaque point de choix, l'apprenant sélectionne la réponse adaptée et
 * reçoit immédiatement un retour.
 */
import { useEffect, useRef, useState } from 'react';
import type { DialogueExercise } from '@/engine/exercises/types';
import type { ExerciseViewProps } from './common';
import { AudioButton, useSpeech } from './audio';
import { IconCheck, IconClose } from '@/ui/icons';

export function DialogueView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<DialogueExercise>) {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [tags, setTags] = useState<string[]>([]);
  const endRef = useRef<HTMLDivElement>(null);
  const { say, supported, autoplay } = useSpeech();

  useEffect(() => {
    setStep(0);
    setAnswers({});
    setTags([]);
  }, [ex.id]);

  // avance automatiquement sur les répliques de l'interlocuteur
  useEffect(() => {
    const t = ex.turns[step];
    if (!t) return;
    if (t.text) {
      if (supported && autoplay) void say(t.text);
      const timer = setTimeout(() => setStep((s) => s + 1), 900);
      return () => clearTimeout(timer);
    }
  }, [step, ex.turns, say, supported, autoplay]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [step, answers]);

  const choiceTurns = ex.turns.map((t, i) => (t.choice ? i : -1)).filter((i) => i >= 0);

  const answer = (turnIdx: number, optIdx: number) => {
    if (answers[turnIdx] !== undefined || phase === 'checked') return;
    const next = { ...answers, [turnIdx]: optIdx };
    setAnswers(next);
    const opt = ex.turns[turnIdx].choice!.options[optIdx];
    if (opt.correct && supported) void say(opt.text);
    const nextTags = !opt.correct && opt.tag ? [...tags, opt.tag] : tags;
    setTags(nextTags);
    setTimeout(() => setStep(turnIdx + 1), opt.correct ? 700 : 1600);
    if (Object.keys(next).length === choiceTurns.length) {
      const correct = choiceTurns.filter((i) => ex.turns[i].choice!.options[next[i]].correct).length;
      onChange({ kind: 'multi', correct, total: choiceTurns.length, mistakes: choiceTurns.length - correct, tags: nextTags });
      setTimeout(onSubmit, 1700);
    }
  };

  return (
    <div className="ex-dialogue">
      <div className="dialogue-head">
        <h3>{ex.title}</h3>
        <p className="muted small">{ex.setting}</p>
      </div>
      <div className="chat" aria-live="polite">
        {ex.turns.slice(0, step + 1).map((t, i) => {
          if (t.text) {
            return (
              <div key={i} className={`bubble-row ${t.side}`}>
                <div className="bubble">
                  <span className="bubble-speaker">{t.speaker}</span>
                  <span lang="en">{t.text}</span>
                  {t.fr && <span className="bubble-fr">{t.fr}</span>}
                </div>
                <AudioButton text={t.text} label="Réécouter" />
              </div>
            );
          }
          const choice = t.choice!;
          const picked = answers[i];
          if (picked !== undefined) {
            const opt = choice.options[picked];
            const good = choice.options.find((o) => o.correct)!;
            return (
              <div key={i} className="bubble-row right">
                <div className={`bubble bubble-me ${opt.correct ? 'is-correct' : 'is-wrong'}`}>
                  <span className="bubble-speaker">
                    {opt.correct ? <IconCheck size={14} aria-hidden /> : <IconClose size={14} aria-hidden />} Vous
                  </span>
                  <span lang="en">{opt.text}</span>
                </div>
                {!opt.correct && (
                  <div className="bubble-fix">
                    <span lang="en">
                      <strong>Mieux :</strong> {good.text}
                    </span>
                    <span className="small">{choice.explanation}</span>
                  </div>
                )}
              </div>
            );
          }
          return (
            <div key={i} className="choice-panel animate-rise">
              <p className="small muted">Que répondez-vous ?</p>
              <div className="options options-long">
                {choice.options.map((o, k) => (
                  <button key={k} type="button" className="option" onClick={() => answer(i, k)} lang="en">
                    <span className="option-key" aria-hidden>
                      {k + 1}
                    </span>
                    <span className="option-text">{o.text}</span>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
        <div ref={endRef} />
      </div>
    </div>
  );
}
