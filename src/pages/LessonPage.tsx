/**
 * Leçon d'une notion : explications en français, exemples à écouter, pièges
 * des francophones, progression personnelle et accès direct à l'entraînement.
 */
import { useEffect } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { SKILL_BY_ID, UNIT_BY_ID } from '@/content/curriculum';
import { DOMAIN_LABELS, STAGE_BY_ID, levelTone } from '@/content/levels';
import { lessonFor, type LessonBlock } from '@/content/lessons';
import { ERROR_TAGS } from '@/engine/generator/errors';
import { effectiveMastery, skillStatus } from '@/engine/learning/mastery';
import { formatsFor } from '@/engine/learning/formats';
import { AUDIO_TYPES, EXERCISE_LABELS } from '@/engine/exercises/types';
import { relativeDue } from '@/state/dates';
import { AudioButton } from '@/exercises/audio';
import { Rich } from '@/ui/rich';
import { Badge, Button, Card, EmptyState, ProgressBar } from '@/ui/kit';
import { IconArrowLeft, IconBook, IconCheck, IconCircleCheck, IconCircleX, IconLightbulb, IconLock, IconPlay, IconWarning } from '@/ui/icons';
import { VocabThemePage } from './VocabPage';

function Block({ b }: { b: LessonBlock }) {
  return (
    <section className="lesson-block card">
      <h2>{b.title}</h2>
      {b.text && (
        <p>
          <Rich text={b.text} />
        </p>
      )}
      {b.points && (
        <ul className="lesson-points">
          {b.points.map((p, i) => (
            <li key={i}>
              <Rich text={p} />
            </li>
          ))}
        </ul>
      )}
      {b.table && (
        <div className="table-wrap">
          <table className="lesson-table">
            <thead>
              <tr>
                {b.table.head.map((h, i) => (
                  <th key={i} scope="col">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {b.table.rows.map((r, i) => (
                <tr key={i}>
                  {r.map((c, j) => (
                    <td key={j}>
                      <Rich text={c} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {b.examples && (
        <ul className="lesson-examples">
          {b.examples.map((e, i) => (
            <li key={i}>
              <AudioButton text={e.en} label={`Écouter : ${e.en}`} />
              <div>
                <p className="lesson-en" lang="en">
                  {e.en}
                </p>
                <p className="lesson-fr">
                  <Rich text={e.fr} />
                  {e.note && <span className="lesson-note">{e.note}</span>}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export function LessonPage({ skillId }: { skillId: string }) {
  const def = SKILL_BY_ID[skillId];
  if (def?.kind === 'vocab') return <VocabThemePage themeId={skillId.replace('vocab_', '')} />;
  return <GrammarLesson skillId={skillId} />;
}

function GrammarLesson({ skillId }: { skillId: string }) {
  const def = SKILL_BY_ID[skillId];
  const lesson = lessonFor(skillId);
  const skills = useAppState((s) => s.skills);
  const profile = useAppState((s) => s.profile);
  const audio = useAppState((s) => s.audioSupported && s.settings.audio.enabled);
  const now = Date.now();

  useEffect(() => {
    if (def && lesson) store.markLessonSeen(skillId);
  }, [skillId, def, lesson]);

  if (!def || !lesson) {
    return (
      <Card>
        <EmptyState icon={IconBook} title="Leçon introuvable">
          <Link to="/parcours">Retour au parcours</Link>
        </EmptyState>
      </Card>
    );
  }

  const st = skills[skillId];
  void profile;
  const unlocked = store.unlocked(now);
  const stageOpen = unlocked.has(def.stage);
  const status = skillStatus(skillId, skills, now, unlocked);
  const mastery = effectiveMastery(st, now);
  const unit = UNIT_BY_ID[def.unit];
  const formats = formatsFor(skillId).filter((t) => audio || !AUDIO_TYPES.has(t));
  const errors = Object.entries(st?.errors ?? {})
    .filter(([, n]) => n >= 0.5)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3);
  const accuracy = st && st.attempts ? st.correct / st.attempts : null;
  const isComm = def.kind === 'function';
  const isWriting = !!def.selfAssessed;
  const blocked = skillId === 'listening' && !audio;
  const startGuided = () => navigate(isComm ? `/seance?mode=practice&skills=${skillId}&size=${isWriting ? 1 : 6}&t=${Date.now()}` : `/seance?mode=guided&skills=${skillId}&t=${Date.now()}`);

  return (
    <div className="lesson">
      <Link to="/parcours" className="back-link">
        <IconArrowLeft size={16} aria-hidden /> Parcours
      </Link>
      <header className="lesson-header">
        <p className="eyebrow">{unit?.title}</p>
        <h1>{def.title}</h1>
        <div className="row row-wrap">
          <span className="lesson-en-title" lang="en">
            {def.en}
          </span>
          <Badge tone={levelTone(def.level)}>{def.level}</Badge>
          <Badge>{DOMAIN_LABELS[def.domain]}</Badge>
          {!stageOpen && (
            <Badge>
              <IconLock size={12} aria-hidden /> étape {STAGE_BY_ID[def.stage].title} à ouvrir
            </Badge>
          )}
          {stageOpen && status === 'locked' && (
            <Badge>
              <IconLock size={12} aria-hidden /> prérequis à consolider
            </Badge>
          )}
          {status === 'mastered' && <Badge tone="success">Maîtrisé</Badge>}
          {status === 'review' && <Badge tone="warning">À revoir</Badge>}
        </div>
        {def.prereq.length > 0 && (
          <p className="small muted lesson-prereq">
            S'appuie sur :{' '}
            {def.prereq.map((p, i) => (
              <span key={p}>
                {i > 0 && ', '}
                <Link to={`/lecon/${p}`}>{SKILL_BY_ID[p]?.title}</Link>
                {effectiveMastery(skills[p], now) >= 0.45 && <IconCheck size={14} className="c-success" aria-label="acquis" />}
              </span>
            ))}
          </p>
        )}
      </header>

      <div className="lesson-layout">
        <div className="lesson-main stack">
          <Card className="lesson-intro">
            <p>
              <Rich text={lesson.intro} />
            </p>
          </Card>

          {lesson.blocks.map((b, i) => (
            <Block key={i} b={b} />
          ))}

          {lesson.pitfalls.length > 0 && (
            <section className="lesson-block card pitfalls">
              <h2>
                <IconWarning size={20} aria-hidden /> Les pièges des francophones
              </h2>
              <ul>
                {lesson.pitfalls.map((p, i) => (
                  <li key={i} className="pitfall">
                    <div className="pitfall-pair">
                      <span className="pitfall-wrong" lang="en">
                        <IconCircleX size={16} aria-label="Incorrect" /> <s>{p.wrong}</s>
                      </span>
                      <span className="pitfall-right" lang="en">
                        <IconCircleCheck size={16} aria-label="Correct" /> {p.right}
                      </span>
                    </div>
                    <p className="small muted">
                      <Rich text={p.why} />
                    </p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="lesson-block card remember">
            <h2>
              <IconLightbulb size={20} aria-hidden /> À retenir
            </h2>
            <ul className="lesson-points">
              {lesson.remember.map((r, i) => (
                <li key={i}>
                  <Rich text={r} />
                </li>
              ))}
            </ul>
          </section>
        </div>

        <aside className="lesson-side">
          <Card className="lesson-cta">
            <h2>S'entraîner</h2>
            <p className="small muted">{isWriting ? 'Une rédaction guidée : vérifications automatiques, modèle et auto-évaluation.' : isComm ? 'Quelques exercices de ce type, adaptés à votre niveau.' : 'Une séance centrée sur cette notion, avec quelques révisions intercalées.'}</p>
            {!stageOpen && <p className="small muted">Cette étape n’est pas encore ouverte dans le parcours guidé, mais vous pouvez déjà vous entraîner librement.</p>}
            {isWriting && <p className="small warning-text">Évaluation partielle : la qualité d’ensemble d’un texte libre ne peut pas être mesurée automatiquement de façon fiable.</p>}
            {blocked && <p className="small warning-text">La synthèse vocale est indisponible ou désactivée (voir Paramètres).</p>}
            <Button block size="lg" icon={IconPlay} onClick={startGuided} disabled={blocked}>
              {st?.attempts ? 'Continuer' : 'Commencer'}
            </Button>
            {(!isComm || formats.length > 1) && !isWriting && formats.length > 0 && (
              <>
                <p className="small faint lesson-formats-label">Ou un seul format :</p>
                <div className="chips">
                  {formats.slice(0, 8).map((t) => (
                    <button key={t} type="button" className="chip" onClick={() => navigate(`/seance?mode=practice&skills=${skillId}&types=${t}&size=8&t=${Date.now()}`)}>
                      {EXERCISE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </>
            )}
          </Card>

          <Card className="lesson-progress">
            <h2>Votre progression</h2>
            <ProgressBar value={mastery} tone={mastery >= 0.8 ? 'success' : 'accent'} label={`Maîtrise : ${Math.round(mastery * 100)} %`} />
            <p className="small muted">Maîtrise estimée : {Math.round(mastery * 100)} %</p>
            {st && st.attempts > 0 ? (
              <dl className="mini-dl">
                <div>
                  <dt>Exercices</dt>
                  <dd>{st.attempts}</dd>
                </div>
                <div>
                  <dt>Réussite</dt>
                  <dd>{accuracy !== null ? `${Math.round(accuracy * 100)} %` : '—'}</dd>
                </div>
                <div>
                  <dt>Prochaine révision</dt>
                  <dd>{st.card && st.card.reps > 0 ? relativeDue(st.card.due, now) : 'après la séance'}</dd>
                </div>
              </dl>
            ) : (
              <p className="small faint">Pas encore d'exercice sur cette notion.</p>
            )}
            {errors.length > 0 && (
              <div className="lesson-errors">
                <p className="small">
                  <strong>Vos erreurs fréquentes</strong>
                </p>
                <ul>
                  {errors.map(([tag]) => (
                    <li key={tag} className="small">
                      <strong>{ERROR_TAGS[tag]?.label ?? tag}</strong>
                      {ERROR_TAGS[tag]?.explanation && <span className="muted"> — {ERROR_TAGS[tag].explanation}</span>}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </Card>
        </aside>
      </div>
    </div>
  );
}
