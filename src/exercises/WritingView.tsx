/**
 * Rédaction guidée en deux temps :
 *  1. rédiger (éléments imposés suivis en direct, expressions utiles) ;
 *  2. analyser : vérifications automatiques fiables (longueur, éléments
 *     imposés, erreurs certaines), modèle, puis auto-évaluation sur une grille.
 * Seules les vérifications automatiques comptent dans le score ; l'auto-
 * évaluation est conservée à titre indicatif.
 */
import { useEffect, useMemo, useState } from 'react';
import type { WritingExercise, WritingReport } from '@/engine/exercises/types';
import { analyseWriting } from '@/engine/exercises/advanced';
import { assessProduction } from '@/engine/evaluation/production';
import { Button } from '@/ui/kit';
import type { ExerciseViewProps } from './common';
import { IconCheck, IconCircleCheck, IconCircleX, IconInfo, IconPen } from '@/ui/icons';

const LEVELS = [
  { v: 1, label: 'Oui' },
  { v: 0.5, label: 'En partie' },
  { v: 0, label: 'Non' },
];

export function WritingView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<WritingExercise>) {
  const [text, setText] = useState('');
  const [step, setStep] = useState<'write' | 'review'>('write');
  const [report, setReport] = useState<WritingReport | null>(null);
  const [self, setSelf] = useState<(number | null)[]>(() => ex.rubric.map(() => null));
  const [showModel, setShowModel] = useState(false);
  const [comments, setComments] = useState<string[] | null>(null);
  useEffect(() => {
    setText('');
    setStep('write');
    setReport(null);
    setSelf(ex.rubric.map(() => null));
    setShowModel(false);
    setComments(null);
  }, [ex.id, ex.rubric]);

  const live = useMemo(() => analyseWriting(ex, text), [ex, text]);
  const done = phase === 'checked';

  const analyse = () => {
    setReport(analyseWriting(ex, text));
    setStep('review');
    // évaluateur complémentaire éventuel (par défaut : local uniquement)
    void assessProduction(ex, text).then((a) => setComments(a.source === 'external' && a.comments?.length ? a.comments : null));
  };

  const validate = () => {
    if (!report) return;
    onChange({ kind: 'writing', text, report, self: self.map((v) => v ?? 0) });
    setTimeout(onSubmit, 0);
  };

  if (step === 'write' && !done) {
    return (
      <div className="ex-writing">
        <div className="writing-brief">
          <p>{ex.prompt}</p>
          <p className="writing-task" lang="en">
            <IconPen size={16} aria-hidden /> {ex.task}
          </p>
        </div>
        <details className="writing-phrases">
          <summary>Expressions utiles</summary>
          <ul lang="en">
            {ex.phrases.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </details>
        <ul className="writing-checks" aria-label="Éléments attendus">
          {ex.checks.map((c, i) => (
            <li key={c.id} className={live.checks[i].ok ? 'is-ok' : ''}>
              {live.checks[i].ok ? <IconCheck size={14} aria-hidden /> : <span className="dot" aria-hidden />} {c.label}
            </li>
          ))}
        </ul>
        <label className="sr-only" htmlFor={`w-${ex.id}`}>
          Votre texte en anglais
        </label>
        <textarea
          id={`w-${ex.id}`}
          className="textarea writing-area"
          rows={10}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Write your text here…"
          lang="en"
          spellCheck={false}
          autoCorrect="off"
          autoCapitalize="off"
        />
        <div className="writing-foot">
          <span className={`small ${live.words > ex.maxWords ? 'warning-text' : 'faint'}`} aria-live="polite">
            {live.words} mot{live.words > 1 ? 's' : ''} · attendu : {ex.minWords} à {ex.maxWords}
          </span>
          <Button onClick={analyse} disabled={live.words < Math.min(20, ex.minWords)}>
            Analyser mon texte
          </Button>
        </div>
      </div>
    );
  }

  const rep = report ?? live;
  const allRated = self.every((v) => v !== null);
  return (
    <div className="ex-writing is-review">
      <section className="writing-section" aria-labelledby={`auto-${ex.id}`}>
        <h3 id={`auto-${ex.id}`}>Vérifications automatiques</h3>
        <p className="faint small">Ces points sont vérifiés de façon fiable. Ils ne mesurent ni la pertinence des idées ni la correction d’ensemble.</p>
        <ul className="writing-results">
          <li className={rep.lengthOk ? 'ok' : 'ko'}>
            {rep.lengthOk ? <IconCircleCheck size={18} aria-hidden /> : <IconCircleX size={18} aria-hidden />} Longueur : {rep.words} mots (attendu : {ex.minWords} à {ex.maxWords})
          </li>
          {rep.checks.map((c) => (
            <li key={c.id} className={c.ok ? 'ok' : 'ko'}>
              {c.ok ? <IconCircleCheck size={18} aria-hidden /> : <IconCircleX size={18} aria-hidden />} {c.label}
              {c.found.length > 0 && <span className="faint small" lang="en"> ({c.found.join(', ')})</span>}
            </li>
          ))}
        </ul>
        {rep.issues.length > 0 ? (
          <div className="writing-issues">
            <h4>Erreurs certaines repérées</h4>
            <ul>
              {rep.issues.map((iss, i) => (
                <li key={i}>
                  <span lang="en">
                    <del>{iss.found}</del> → <ins>{iss.fix}</ins>
                  </span>
                  <span className="small muted"> : {iss.why}</span>
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <p className="small writing-noissue">
            <IconInfo size={16} aria-hidden /> Aucune des erreurs fréquentes recherchées n’a été trouvée, ce qui ne garantit pas que le texte est sans faute.
          </p>
        )}
        {comments && (
          <div className="writing-issues">
            <h4>Avis complémentaire (indicatif)</h4>
            <ul>
              {comments.map((c, i) => (
                <li key={i} className="small">{c}</li>
              ))}
            </ul>
          </div>
        )}
        {rep.repeated.length > 0 && (
          <p className="small muted">
            Mots très répétés : {rep.repeated.map((r) => `${r.word} (${r.count})`).join(', ')}. Pensez aux synonymes ou aux reprises (this, it, such…).
          </p>
        )}
      </section>

      <section className="writing-section">
        <button type="button" className="link-btn" onClick={() => setShowModel((s) => !s)} aria-expanded={showModel}>
          {showModel ? 'Masquer le modèle' : 'Voir un modèle de réponse'}
        </button>
        {showModel && (
          <div className="writing-model" lang="en">
            {ex.model.split('\n').map((l, i) => (l.trim() ? <p key={i}>{l}</p> : null))}
          </div>
        )}
        <details className="writing-mine">
          <summary>Relire mon texte</summary>
          <div lang="en">
            {text.split('\n').map((l, i) => (l.trim() ? <p key={i}>{l}</p> : null))}
          </div>
        </details>
      </section>

      <section className="writing-section" aria-labelledby={`self-${ex.id}`}>
        <h3 id={`self-${ex.id}`}>Auto-évaluation</h3>
        <p className="faint small">Comparez votre texte au modèle et répondez honnêtement : ce bilan est indicatif et n’entre pas dans le score.</p>
        <ol className="rubric">
          {ex.rubric.map((r, i) => (
            <li key={r}>
              <span>{r}</span>
              <span className="rubric-choices" role="radiogroup" aria-label={r}>
                {LEVELS.map((l) => (
                  <button
                    key={l.v}
                    type="button"
                    role="radio"
                    aria-checked={self[i] === l.v}
                    className={`chip${self[i] === l.v ? ' is-on' : ''}`}
                    disabled={done}
                    onClick={() => setSelf((cur) => cur.map((v, k) => (k === i ? l.v : v)))}
                  >
                    {l.label}
                  </button>
                ))}
              </span>
            </li>
          ))}
        </ol>
      </section>

      {!done && (
        <div className="writing-foot">
          <Button variant="ghost" onClick={() => setStep('write')}>
            Modifier mon texte
          </Button>
          <Button onClick={validate} disabled={!allRated}>
            {allRated ? 'Valider' : 'Complétez l’auto-évaluation'}
          </Button>
        </div>
      )}
    </div>
  );
}
