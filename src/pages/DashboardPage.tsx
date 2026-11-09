import { useMemo } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { effectiveMastery, priority } from '@/engine/learning/mastery';
import { EXAMS, nextGuidedSkill } from '@/engine/learning/planner';
import { estimateProfile, readinessFor, unlockedStages } from '@/engine/learning/progression';
import { DOMAINS, DOMAIN_LABELS, DOMAIN_DETAILS, STAGE_BY_ID } from '@/content/levels';
import { SKILL_BY_ID } from '@/content/curriculum';
import { dayKey, formatDuration, lastDays, liveStreak, shortDayLabel } from '@/state/dates';
import { Badge, Button, Card, ProgressBar, ProgressRing, Stat } from '@/ui/kit';
import {
  IconArrowRight,
  IconBrain,
  IconCalendar,
  IconClock,
  IconFlame,
  IconGraduation,
  IconListChecks,
  IconPlay,
  IconRepeat,
  IconSparkles,
  IconTarget,
  IconTimer,
  IconTrophy,
  IconZap,
} from '@/ui/icons';

export function DashboardPage() {
  const s = useAppState((st) => st);
  const now = Date.now();
  const level = useMemo(() => estimateProfile(s.skills, s.profile, now), [s.skills, s.profile, now]);
  const unlocked = useMemo(() => unlockedStages(s.profile, s.skills, now), [s.profile, s.skills, now]);
  const next = useMemo(() => nextGuidedSkill(s.skills, now, unlocked), [s.skills, now, unlocked]);
  const stage = STAGE_BY_ID[level.stage];
  const gateExam = EXAMS.find((e) => e.gate === stage.to);
  const gatePassed = (s.profile.levelsPassed ?? []).includes(stage.to);
  const readiness = useMemo(() => readinessFor(stage.to, s.skills, now), [stage.to, s.skills, now]);
  const nextDef = SKILL_BY_ID[next];
  const today = dayKey(now);
  const todayStat = s.daily[today];
  const xp = todayStat?.xp ?? 0;
  const goal = s.settings.dailyGoalXp;
  const due = store.dueCounts(now);
  const totals = useMemo(() => {
    let exercises = 0;
    let correct = 0;
    let ms = 0;
    for (const d of Object.values(s.daily)) {
      exercises += d.exercises;
      correct += d.correct;
      ms += d.ms;
    }
    return { exercises, correct, ms };
  }, [s.daily]);
  const week = lastDays(7, now);
  const weekMs = week.reduce((acc, d) => acc + (s.daily[d]?.ms ?? 0), 0);
  const weak = useMemo(
    () =>
      Object.values(s.skills)
        .filter((sk) => sk.attempts >= 3 && SKILL_BY_ID[sk.id])
        .sort((a, b) => priority(b, now) - priority(a, now))
        .slice(0, 3),
    [s.skills, now],
  );
  const days14 = lastDays(14, now);
  const maxEx = Math.max(10, ...days14.map((d) => s.daily[d]?.exercises ?? 0));
  const active = s.activeSession;
  const isNew = totals.exercises === 0;
  const dailyDone = s.profile.dailyDone === today;
  const streak = liveStreak(s.profile.streak, s.profile.lastActiveDate, now);

  return (
    <div className="stack dashboard">
      {active && (
        <Card className="resume-card animate-rise">
          <div className="row row-wrap">
            <div className="resume-icon">
              <IconPlay size={22} aria-hidden />
            </div>
            <div className="spacer">
              <strong>Séance en cours : {active.title}</strong>
              <p className="muted small" style={{ margin: 0 }}>
                {active.answers.length} exercice{active.answers.length > 1 ? 's' : ''} réalisé{active.answers.length > 1 ? 's' : ''} sur {active.items.length}
              </p>
            </div>
            <Button onClick={() => navigate('/seance?resume=1')} iconRight={IconArrowRight}>
              Reprendre
            </Button>
            <Button variant="ghost" onClick={() => store.discardActive()}>
              Abandonner
            </Button>
          </div>
        </Card>
      )}

      <section className="hero card">
        <div className="hero-main">
          <p className="eyebrow">{isNew ? 'Bienvenue !' : 'Votre progression'}</p>
          <h1>{isNew ? `Passez du niveau ${stage.from} au niveau ${stage.to}` : nextDef ? `Prochaine étape : ${nextDef.title}` : 'Continuez sur votre lancée'}</h1>
          <p className="page-subtitle">
            {isNew
              ? 'Des exercices générés à l\'infini, une révision espacée qui revient au bon moment, et un parcours qui s\'adapte à vos réussites comme à vos erreurs.'
              : nextDef?.summary}
          </p>
          <div className="hero-actions">
            <Button size="lg" iconRight={IconArrowRight} onClick={() => navigate(`/seance?mode=guided&t=${now}`)}>
              {isNew ? 'Commencer la première leçon' : 'Continuer le parcours'}
            </Button>
            {!s.profile.placementDone && (
              <Button size="lg" variant="secondary" icon={IconGraduation} onClick={() => navigate('/test-niveau')}>
                Test de niveau
              </Button>
            )}
            {nextDef && (
              <Link to={`/lecon/${next}`} className="btn btn-ghost btn-lg">
                Voir la leçon
              </Link>
            )}
          </div>
        </div>
        <div className="hero-level">
          <ProgressRing value={level.progress} size={168} stroke={13} label={`Progression vers ${stage.to} : ${Math.round(level.progress * 100)} %`}>
            <div>
              <div className="ring-big">{level.label}</div>
              <div className="faint small">niveau estimé</div>
            </div>
          </ProgressRing>
          <div className="level-scale" aria-hidden>
            <span>{stage.from}</span>
            <ProgressBar value={level.progress} size="sm" tone="accent" />
            <span>{stage.to}</span>
          </div>
          <p className="small muted center">{level.description}</p>
        </div>
      </section>

      {gateExam && !gatePassed && readiness.ready && (
        <Card className="resume-card animate-rise">
          <div className="row row-wrap">
            <div className="resume-icon">
              <IconGraduation size={22} aria-hidden />
            </div>
            <div className="spacer">
              <strong>Vous êtes prêt pour l’évaluation de fin de niveau {stage.to}</strong>
              <p className="muted small" style={{ margin: 0 }}>
                Notions travaillées : {Math.round(readiness.coverage * 100)} % · maîtrise moyenne : {Math.round(readiness.mastery * 100)} %. Sa réussite valide le niveau et ouvre l’étape suivante.
              </p>
            </div>
            <Button onClick={() => navigate(`/seance?mode=exam&exam=${gateExam.id}&t=${now}`)} iconRight={IconArrowRight}>
              Passer l’évaluation
            </Button>
          </div>
        </Card>
      )}

      <div className="grid grid-3">
        <Card className="goal-card">
          <div className="card-title">
            <h2>Objectif du jour</h2>
            {xp >= goal && <Badge tone="success">Atteint !</Badge>}
          </div>
          <div className="row">
            <ProgressRing value={xp / goal} size={92} stroke={9} tone="accent">
              <div>
                <strong className="ring-mid">{xp}</strong>
                <div className="tiny faint">/ {goal} XP</div>
              </div>
            </ProgressRing>
            <div className="stack" style={{ gap: 6 }}>
              <span className="row small">
                <IconFlame size={18} className="c-streak" aria-hidden /> <strong>{streak}</strong> jour{streak > 1 ? 's' : ''} de série
              </span>
              <span className="small faint">Record : {s.profile.bestStreak} jour{s.profile.bestStreak > 1 ? 's' : ''}</span>
              <span className="small faint">
                {todayStat?.exercises ?? 0} exercice{(todayStat?.exercises ?? 0) > 1 ? 's' : ''} aujourd'hui
              </span>
            </div>
          </div>
        </Card>

        <Card>
          <div className="card-title">
            <h2>Révisions</h2>
            <IconCalendar size={20} className="faint" aria-hidden />
          </div>
          <div className="stack" style={{ gap: 10 }}>
            <div className="due-row">
              <span>Notions à revoir maintenant</span>
              <strong>{due.skillsDue}</strong>
            </div>
            <div className="due-row">
              <span>Mots et verbes à réviser</span>
              <strong>{due.itemsDue}</strong>
            </div>
            <div className="due-row faint">
              <span>Prévu d'ici demain</span>
              <strong>{due.tomorrow}</strong>
            </div>
            <div className="row row-wrap">
              <Button size="sm" variant="soft" icon={IconRepeat} onClick={() => navigate(`/seance?mode=review&t=${now}`)} disabled={!due.skillsDue && totals.exercises === 0}>
                Grammaire
              </Button>
              <Button size="sm" variant="soft" icon={IconBrain} onClick={() => navigate(`/seance?mode=vocab&t=${now}`)}>
                Vocabulaire
              </Button>
            </div>
          </div>
        </Card>

        <Card className="daily-card">
          <div className="card-title">
            <h2>Défi du jour</h2>
            {dailyDone ? <Badge tone="success">Terminé</Badge> : <Badge tone="warning">Nouveau</Badge>}
          </div>
          <p className="muted small">12 exercices variés, identiques pour la journée : grammaire, vocabulaire, lecture ou écoute.</p>
          <Button block variant={dailyDone ? 'secondary' : 'primary'} icon={IconTrophy} onClick={() => navigate(`/seance?mode=daily&t=${now}`)}>
            {dailyDone ? 'Rejouer le défi' : 'Relever le défi'}
          </Button>
        </Card>
      </div>

      <Card>
        <div className="stats-row">
          <Stat icon={IconListChecks} label="Exercices réalisés" value={totals.exercises} />
          <Stat icon={IconTarget} tone="success" label="Précision globale" value={totals.exercises ? `${Math.round((totals.correct / totals.exercises) * 100)} %` : '—'} />
          <Stat icon={IconClock} tone="accent" label="Cette semaine" value={formatDuration(weekMs)} />
          <Stat icon={IconZap} tone="warning" label="XP au total" value={s.profile.totalXp} />
        </div>
      </Card>

      {!isNew && (
        <Card>
          <div className="card-title">
            <h2>Votre niveau par domaine</h2>
            <Link to="/statistiques" className="small">
              Détails
            </Link>
          </div>
          <div className="domain-grid">
            {DOMAINS.map((d) => {
              const dv = level.domains[d];
              return (
                <div key={d} className="domain-cell">
                  <span className="small muted">{DOMAIN_LABELS[d]}</span>
                  <strong>{dv.label ?? '—'}</strong>
                  <span className="faint">{dv.label ? DOMAIN_DETAILS[d] : 'Pas encore assez de résultats'}</span>
                </div>
              );
            })}
          </div>
          <p className="faint small" style={{ marginBottom: 0 }}>Estimation pédagogique, pas une certification CECRL. L’expression orale n’est pas évaluée.</p>
        </Card>
      )}

      <div className="grid grid-2">
        <Card>
          <div className="card-title">
            <h2>Activité (14 jours)</h2>
            <Link to="/statistiques" className="small">
              Statistiques
            </Link>
          </div>
          <div className="mini-bars" role="img" aria-label="Nombre d'exercices réalisés par jour sur les 14 derniers jours">
            {days14.map((d) => {
              const v = s.daily[d]?.exercises ?? 0;
              return (
                <div key={d} className="mini-bar-col" title={`${shortDayLabel(d)} : ${v} exercice${v > 1 ? 's' : ''}`}>
                  <div className="mini-bar-track">{v > 0 && <div className="mini-bar" style={{ height: `${(v / maxEx) * 100}%` }} />}</div>
                  <span className={`mini-bar-label${d === today ? ' is-today' : ''}`}>{shortDayLabel(d).split(' ')[1]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        <Card>
          <div className="card-title">
            <h2>Points à consolider</h2>
          </div>
          {weak.length === 0 ? (
            <p className="muted">Faites quelques séances : vos points faibles apparaîtront ici, et l'entraînement adaptatif les ciblera automatiquement.</p>
          ) : (
            <ul className="weak-list">
              {weak.map((w) => (
                <li key={w.id}>
                  <Link to={`/lecon/${w.id}`} className="weak-item">
                    <span className="weak-name">{SKILL_BY_ID[w.id].title}</span>
                    <ProgressBar value={effectiveMastery(w, now)} size="sm" tone={effectiveMastery(w, now) < 0.4 ? 'danger' : 'warning'} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
          <div className="row row-wrap" style={{ marginTop: 12 }}>
            <Button size="sm" icon={IconSparkles} onClick={() => navigate(`/seance?mode=adaptive&t=${now}`)} disabled={isNew}>
              Entraînement adaptatif
            </Button>
            <Button size="sm" variant="ghost" icon={IconRepeat} onClick={() => navigate(`/seance?mode=mistakes&t=${now}`)} disabled={!s.mistakes.length}>
              Mes erreurs ({s.mistakes.length})
            </Button>
            <Button size="sm" variant="ghost" icon={IconTimer} onClick={() => navigate(`/seance?mode=sprint&t=${now}`)}>
              Sprint 90 s
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}
