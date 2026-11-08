import type { EvalResult, Exercise } from '@/engine/exercises/types';
import { EXERCISE_LABELS } from '@/engine/exercises/types';
import { errorExplanation, errorLabel } from '@/engine/exercises/evaluate';
import { SKILL_BY_ID } from '@/content/curriculum';
import type { DiffOp } from '@/engine/core/lattice';
import type { ExerciseViewProps } from './common';
import { ClozeView, GridView } from './ClozeView';
import { ChoiceView } from './ChoiceView';
import { WordOrderView } from './WordOrderView';
import { TextAnswerView } from './TextAnswerView';
import { ErrorView } from './ErrorView';
import { MatchingView } from './MatchingView';
import { DialogueView } from './DialogueView';
import { ReadingView } from './ReadingView';
import { AudioButton } from './audio';
import { IconCircleCheck, IconCircleX, IconLightbulb } from '@/ui/icons';

export function ExerciseView(props: ExerciseViewProps) {
  const ex = props.exercise;
  switch (ex.type) {
    case 'cloze':
      return <ClozeView {...props} exercise={ex} />;
    case 'conjugation':
      return ex.variant === 'grid' ? <GridView {...props} exercise={ex} /> : <ClozeView {...props} exercise={ex} />;
    case 'mcq':
    case 'contextChoice':
    case 'translateEnFr':
    case 'listening':
      return <ChoiceView {...props} exercise={ex} />;
    case 'wordOrder':
      return <WordOrderView {...props} exercise={ex} />;
    case 'translateFrEn':
    case 'transformation':
    case 'dictation':
      return <TextAnswerView {...props} exercise={ex} />;
    case 'errorCorrection':
      return <ErrorView {...props} exercise={ex} />;
    case 'matching':
      return <MatchingView {...props} exercise={ex} />;
    case 'dialogue':
      return <DialogueView {...props} exercise={ex} />;
    case 'reading':
      return <ReadingView {...props} exercise={ex} />;
    default:
      return <p>Format d'exercice inconnu.</p>;
  }
}

/** Exercices en plusieurs étapes : la validation est intégrée à l'exercice. */
export function isSelfChecking(ex: Exercise): boolean {
  return ex.type === 'matching' || ex.type === 'dialogue' || ex.type === 'reading';
}

export function exerciseHeader(ex: Exercise): { label: string; skill: string } {
  return { label: EXERCISE_LABELS[ex.type], skill: SKILL_BY_ID[ex.skillId]?.title ?? '' };
}

function Diff({ ops }: { ops: DiffOp[] }) {
  return (
    <p className="diff" lang="en" aria-label="Différences avec votre réponse">
      {ops.map((o, i) => {
        if (o.kind === 'same') return <span key={i}>{o.text} </span>;
        if (o.kind === 'missing') return <ins key={i}>{o.text} </ins>;
        if (o.kind === 'extra') return <del key={i}>{o.text} </del>;
        return (
          <span key={i}>
            <del>{o.text}</del> <ins>{o.expected}</ins>{' '}
          </span>
        );
      })}
    </p>
  );
}

export function FeedbackPanel({ exercise, result }: { exercise: Exercise; result: EvalResult }) {
  const tagText = errorExplanation(result.errorTag);
  const tagLabel = errorLabel(result.errorTag);
  const multi = exercise.type === 'matching' || exercise.type === 'dialogue' || exercise.type === 'reading';
  const audioText = 'answerText' in exercise && typeof exercise.answerText === 'string' ? exercise.answerText : exercise.audioText;
  return (
    <div className={`feedback ${result.correct ? 'is-correct' : 'is-wrong'}`} role="status" aria-live="assertive">
      <div className="feedback-head">
        {result.correct ? <IconCircleCheck size={26} aria-hidden /> : <IconCircleX size={26} aria-hidden />}
        <strong>{result.headline}</strong>
        {multi && <span className="feedback-score">{result.userAnswer}</span>}
      </div>
      {!result.correct && !multi && result.expected && (
        <div className="feedback-answer">
          <span className="small">Réponse attendue :</span>
          <p lang="en" className="feedback-expected">
            {result.expected}
          </p>
          {result.diff && result.userAnswer && <Diff ops={result.diff} />}
        </div>
      )}
      {result.note && <p className="feedback-note">{result.note}</p>}
      <div className="feedback-explain">
        <IconLightbulb size={18} aria-hidden />
        <div>
          {!result.correct && tagLabel && <p className="feedback-tag">{tagLabel}</p>}
          <p>{!result.correct && tagText ? tagText : exercise.explanation}</p>
          {!result.correct && tagText && exercise.explanation && tagText !== exercise.explanation && <p className="muted small">{exercise.explanation}</p>}
        </div>
      </div>
      {audioText && !multi && exercise.type !== 'listening' && (
        <div className="feedback-audio">
          <AudioButton text={audioText} label="Écouter la bonne réponse" />
        </div>
      )}
    </div>
  );
}
