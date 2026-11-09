/** Bilan de fin de séance (exercices, examens blancs, test de niveau). */
import { useMemo } from 'react';
import { navigate } from '@/app/router';
import { useAppState } from '@/state/store';
import { summarize, type Session } from '@/engine/learning/session';
import { SKILL_BY_ID } from '@/content/curriculum';
import { ERROR_TAGS } from '@/engine/generator/errors';
import { EXAMS, PLACEMENT_BANDS } from '@/engine/learning/planner';
import { gateOutcome } from '@/engine/learning/progression';
import { DOMAIN_LABELS, type Domain } from '@/content/levels';
import { formatDuration } from '@/state/dates';
import { Button, ProgressRing } from '@/ui/kit';
import { IconArrowRight, IconClock, IconFlame, IconHome, IconRepeat, IconTarget, IconTrophy, IconZap } from '@/ui/icons';
import { EXERCISE_LABELS } from '@/engine/exercises/types';

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        dx: `${Math.round((Math.random() - 0.5) * 520)}px`,
        dy: `${Math.round(120 + Math.random() * 380)}px`,
        rot: `${Math.round(Math.random() * 720 - 360)}deg`,
        delay: `${(i % 6) * 40}ms`,
        hue: ['var(--primary)', 'var(--accent)', 'var(--streak)', 'var(--xp)', 'var(--success)'][i % 5],
      })),
    [],
  );
  return (
    <div className="confetti" aria-hidden>
      {pieces.map((p, i) => (
        <span key={i} style={{ ['--dx' as string]: p.dx, ['--dy' as string]: p.dy, ['--rot' as string]: p.rot, animationDelay: p.delay, background: p.hue }} />
      ))}
    </div>
  );
}

export function SessionSummary({ session }: { session: Session }) {
  const sum = useMemo(() => summarize(session, Date.now()), [session]);
  const profile = useAppState((s) => s.profile);
  const mistakes = useAppState((s) => s.mistakes.length);
  const pct = Math.round(sum.accuracy * 100);
  const isExam = session.mode === 'exam';
  const isPlacement = session.mode === 'placement';
  const exam = isExam ? EXAMS.find((e) => e.id === session.examId) : null;
  const gate = exam?.gate ? gateOutcome(sum.bySkill) : null;
  const complete = sum.total >= Math.min(exam?.size ?? 0, session.items.length);
  const passed = isExam && (gate ? gate.passed && complete : sum.accuracy >= 0.7);
  const skillsRows = Object.entries(sum.bySkill).sort((a, b) => a[1].correct / a[1].total - b[1].correct / b[1].total);
  const topErrors = Object.entries(sum.errors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4);
  const title = isPlacement ? 'Test de niveau terminé' : gate ? (passed ? `Niveau ${exam!.gate} validé !` : 'Évaluation terminée') : isExam ? (passed ? 'Examen réussi !' : 'Examen terminé') : pct >= 80 ? 'Excellente séance !' : pct >= 50 ? 'Bonne séance !' : 'Séance terminée';

  if (sum.total === 0) {
    return (
      <div className="session-shell">
        <main className="session-main summary">
          <div className="card summary-card">
            <h1>Séance vide</h1>
            <p className="muted">Aucun exercice n'a pu être préparé pour cette sélection. Essayez un autre mode ou d'autres notions.</p>
            <Button onClick={() => navigate('/entrainement')}>Retour à l'entraînement</Button>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="session-shell">
      {(pct >= 80 || passed) && <Confetti />}
      <main className="session-main summary" id="main">
        <div className="card summary-card animate-rise">
          <p className="eyebrow">{session.title}</p>
          <h1>{title}</h1>
          {isPlacement ? (
            <div className="placement-result">
              <ProgressRing value={sum.accuracy} size={150} stroke={12} tone="accent">
                <div>
                  <div className="ring-big">{profile.placementLevel ?? '—'}</div>
                  <div className="faint small">niveau estimé</div>
                </div>
              </ProgressRing>
              <p className="muted">
                Vous avez réussi {sum.correct} questions sur {sum.total}. Le parcours a été adapté : les notions que vous maîtrisez déjà sont débloquées, et les exercices commenceront au bon niveau.
                {session.items[session.items.length - 1]?.slot.band !== PLACEMENT_BANDS[PLACEMENT_BANDS.length - 1].id && ' Le test s’est arrêté dès que les questions sont devenues nettement trop difficiles.'}
              </p>
              <p className="faint small">Estimation pédagogique fondée sur la grammaire, le lexique et l’usage, pas une certification CECRL.</p>
            </div>
          ) : (
            <div className="summary-hero">
              <ProgressRing value={sum.accuracy} size={150} stroke={12} tone={pct >= 70 ? 'success' : 'primary'} label={`${pct} % de réussite`}>
                <div>
                  <div className="ring-big">{pct}%</div>
                  <div className="faint small">réussite</div>
                </div>
              </ProgressRing>
              <div className="summary-stats">
                <div className="summary-stat">
                  <IconTarget size={18} aria-hidden />
                  <span>
                    <strong>{sum.correct}</strong>/{sum.total} bonnes réponses
                  </span>
                </div>
                <div className="summary-stat">
                  <IconZap size={18} aria-hidden />
                  <span>
                    <strong>+{sum.xp}</strong> XP
                  </span>
                </div>
                <div className="summary-stat">
                  <IconFlame size={18} aria-hidden />
                  <span>
                    Meilleure série : <strong>{sum.bestCombo}</strong>
                  </span>
                </div>
                <div className="summary-stat">
                  <IconClock size={18} aria-hidden />
                  <span>{formatDuration(sum.durationMs)} d'exercices</span>
                </div>
                {isExam && !gate && (
                  <div className={`summary-stat ${passed ? 'ok' : 'ko'}`}>
                    <IconTrophy size={18} aria-hidden />
                    <span>{passed ? 'Seuil de réussite (70 %) atteint' : 'Seuil de réussite : 70 %'}</span>
                  </div>
                )}
                {gate && (
                  <div className={`summary-stat ${passed ? 'ok' : 'ko'}`}>
                    <IconTrophy size={18} aria-hidden />
                    <span>{passed ? `Niveau ${exam!.gate} validé : étape suivante ouverte` : !complete ? 'Évaluation interrompue : non comptabilisée' : gate.overall < 0.7 ? 'Il faut au moins 70 % au total' : `Domaine à renforcer : ${gate.weakDomains.map((d) => DOMAIN_LABELS[d]).join(', ')}`}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {gate && (
            <section className="summary-section">
              <h2>Par domaine</h2>
              <ul className="summary-skills">
                {(Object.entries(gate.byDomain) as [Domain, { total: number; correct: number; rate: number }][]).map(([d, b]) => (
                  <li key={d}>
                    <span className="summary-skill-name">{DOMAIN_LABELS[d]}</span>
                    <span className={`summary-skill-score ${b.rate >= 0.6 ? 'ok' : b.rate >= 0.4 ? 'mid' : 'ko'}`}>
                      {Math.round(b.rate * 100)} % ({b.correct}/{b.total})
                    </span>
                  </li>
                ))}
              </ul>
              <p className="faint small">Réussite : au moins 70 % au total et 60 % dans chaque domaine comptant au moins trois exercices. Résultat indicatif, pas une certification.</p>
            </section>
          )}

          <section className="summary-section">
            <h2>Par notion</h2>
            <ul className="summary-skills">
              {skillsRows.map(([id, b]) => {
                const r = b.correct / b.total;
                return (
                  <li key={id}>
                    <span className="summary-skill-name">{SKILL_BY_ID[id]?.title ?? id}</span>
                    <span className={`summary-skill-score ${r >= 0.7 ? 'ok' : r >= 0.4 ? 'mid' : 'ko'}`}>
                      {b.correct}/{b.total}
                    </span>
                  </li>
                );
              })}
            </ul>
          </section>

          {topErrors.length > 0 && (
            <section className="summary-section">
              <h2>Points à retravailler</h2>
              <ul className="summary-errors">
                {topErrors.map(([tag, n]) => (
                  <li key={tag}>
                    <strong>{ERROR_TAGS[tag]?.label ?? tag}</strong> <span className="faint">×{n}</span>
                    <p className="muted small">{ERROR_TAGS[tag]?.explanation}</p>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {(isExam || isPlacement) && (
            <section className="summary-section">
              <h2>Vos réponses</h2>
              <ol className="answers-review">
                {session.answers.map((a, i) => (
                  <li key={i} className={a.correct ? 'ok' : 'ko'}>
                    <span className="badge">{EXERCISE_LABELS[a.type]}</span> <span className="small">{SKILL_BY_ID[a.skillId]?.title}</span>
                    {!a.correct && a.expected && (
                      <p className="small" lang="en">
                        Attendu : <strong>{a.expected}</strong>
                        {a.userAnswer && (
                          <>
                            {' '}
                            · Votre réponse : <span className="faint">{a.userAnswer}</span>
                          </>
                        )}
                      </p>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          <div className="summary-actions">
            {isPlacement ? (
              <Button size="lg" iconRight={IconArrowRight} onClick={() => navigate('/parcours')}>
                Voir mon parcours
              </Button>
            ) : (
              <Button size="lg" iconRight={IconArrowRight} onClick={() => navigate(`/seance?mode=${session.mode === 'exam' ? 'review' : session.mode}${session.focusSkills?.length ? `&skills=${session.focusSkills.join(',')}` : ''}&t=${Date.now()}`)}>
                {isExam ? 'Réviser mes points faibles' : 'Nouvelle séance'}
              </Button>
            )}
            {mistakes > 0 && !isPlacement && (
              <Button variant="secondary" icon={IconRepeat} onClick={() => navigate(`/seance?mode=mistakes&t=${Date.now()}`)}>
                Revoir mes erreurs ({mistakes})
              </Button>
            )}
            <Button variant="ghost" icon={IconHome} onClick={() => navigate('/')}>
              Accueil
            </Button>
          </div>
          {exam && <p className="faint small">Examen : {exam.subtitle}</p>}
        </div>
      </main>
    </div>
  );
}
