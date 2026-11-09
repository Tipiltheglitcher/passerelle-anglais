/**
 * Statistiques : niveau et maîtrise actuels, puis, pour la période choisie,
 * indicateurs, activité, évolution de la réussite, réussite par format,
 * erreurs fréquentes et historique des séances.
 */
import { useEffect, useMemo, useState } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { ALL_UNITS, SKILL_BY_ID } from '@/content/curriculum';
import { ERROR_TAGS } from '@/engine/generator/errors';
import { EXERCISE_LABELS } from '@/engine/exercises/types';
import { effectiveMastery, skillStatus } from '@/engine/learning/mastery';
import { estimateProfile, levelEvidence, unlockedStages } from '@/engine/learning/progression';
import { CEFR_LEVELS, DOMAINS, DOMAIN_LABELS, STAGE_BY_ID } from '@/content/levels';
import type { AttemptRecord, SessionMode } from '@/engine/learning/types';
import { formatDuration, liveStreak } from '@/state/dates';
import { attemptsSince, bucketize, byFormat, periodDays, previousDays, sessionsSince, topErrors, totalsOf, type Period } from '@/state/stats';
import { BarRows, ColumnChart, LineChart, type ChartPoint } from '@/ui/charts';
import { Badge, Button, Card, EmptyState, PageHeader, ProgressRing, Segmented, Spinner, Stat } from '@/ui/kit';
import { IconArrowRight, IconCalendar, IconClock, IconFlame, IconListChecks, IconPlay, IconStats, IconTable, IconTarget, IconZap } from '@/ui/icons';

const MODE_LABELS: Record<SessionMode, string> = {
  guided: 'Parcours',
  practice: 'Libre',
  adaptive: 'Adaptatif',
  review: 'Révision',
  vocab: 'Vocabulaire',
  mistakes: 'Erreurs',
  daily: 'Défi du jour',
  exam: 'Examen',
  placement: 'Test de niveau',
  sprint: 'Sprint',
};

const pct = (x: number) => `${Math.round(x * 100)} %`;

function Delta({ cur, prev, unit = '' }: { cur: number; prev: number; unit?: string }) {
  if (!prev && !cur) return null;
  const d = cur - prev;
  if (d === 0) return <span className="delta">= période précédente</span>;
  return (
    <span className={`delta ${d > 0 ? 'delta-up' : 'delta-down'}`}>
      <span aria-hidden>{d > 0 ? '▲' : '▼'}</span> {d > 0 ? '+' : '−'}
      {Math.abs(Math.round(d))}
      {unit} vs période précédente
    </span>
  );
}

export function StatsPage() {
  const s = useAppState((st) => st);
  const [period, setPeriod] = useState<Period>('30');
  const [attempts, setAttempts] = useState<AttemptRecord[] | null>(null);
  const [showTable, setShowTable] = useState(false);
  const [historyCount, setHistoryCount] = useState(12);
  const now = Date.now();

  useEffect(() => {
    let alive = true;
    void store.loadAttempts(5000).then((a) => alive && setAttempts(a));
    return () => {
      alive = false;
    };
  }, [s.sessions.length]);

  const days = useMemo(() => periodDays(period, s.daily, now), [period, s.daily, now]);
  const totals = useMemo(() => totalsOf(days, s.daily), [days, s.daily]);
  const prev = useMemo(() => (period === 'all' ? null : totalsOf(previousDays(days), s.daily)), [days, period, s.daily]);
  const { granularity, buckets } = useMemo(() => bucketize(days, s.daily), [days, s.daily]);
  const periodAttempts = useMemo(() => (attempts ? attemptsSince(attempts, days[0]) : null), [attempts, days]);
  const formats = useMemo(() => (periodAttempts ? byFormat(periodAttempts).sort((a, b) => a.correct / a.total - b.correct / b.total) : []), [periodAttempts]);
  const errors = useMemo(() => (periodAttempts ? topErrors(periodAttempts) : null), [periodAttempts]);
  const sessions = useMemo(() => sessionsSince(s.sessions, days[0]), [s.sessions, days]);
  const level = useMemo(() => estimateProfile(s.skills, s.profile, now), [s.skills, s.profile, now]);
  const unlocked = useMemo(() => unlockedStages(s.profile, s.skills, now), [s.profile, s.skills, now]);
  const [openWriting, setOpenWriting] = useState<string | null>(null);
  const everExercises = Object.values(s.daily).reduce((n, d) => n + d.exercises, 0);

  if (everExercises === 0) {
    return (
      <div className="stack">
        <PageHeader eyebrow="Statistiques" title="Votre progression" />
        <Card>
          <EmptyState icon={IconStats} title="Pas encore de statistiques">
            <p>Vos courbes d'activité, votre réussite par notion et par format, vos erreurs fréquentes et l'historique de vos séances apparaîtront ici dès votre première séance.</p>
            <Button icon={IconPlay} onClick={() => navigate(`/seance?mode=guided&t=${Date.now()}`)}>
              Commencer une séance
            </Button>
          </EmptyState>
        </Card>
      </div>
    );
  }

  const unit = granularity === 'day' ? 'jour' : granularity === 'week' ? 'semaine' : 'mois';
  const activityPoints: ChartPoint[] = buckets.map((b) => ({
    key: b.key,
    axis: b.axis,
    value: b.totals.exercises,
    valueText: `${b.totals.exercises} exercice${b.totals.exercises > 1 ? 's' : ''}`,
    detail: [b.label, b.totals.exercises ? `${pct(b.totals.correct / b.totals.exercises)} de réussite · ${formatDuration(b.totals.ms)}` : 'Aucune activité'],
  }));
  const accuracyPoints: ChartPoint[] = buckets.map((b) => ({
    key: b.key,
    axis: b.axis,
    value: b.totals.exercises ? b.totals.correct / b.totals.exercises : null,
    valueText: b.totals.exercises ? `${pct(b.totals.correct / b.totals.exercises)} de réussite` : 'Aucun exercice',
    detail: [b.label, b.totals.exercises ? `${b.totals.correct} / ${b.totals.exercises} bonnes réponses` : ''],
  }));
  const hasActivity = totals.exercises > 0;
  const fragile = Object.values(s.skills)
    .filter((k) => k.attempts >= 3 && SKILL_BY_ID[k.id])
    .map((k) => ({ k, m: effectiveMastery(k, now) }))
    .filter((x) => x.m < 0.6)
    .sort((a, b) => a.m - b.m)
    .slice(0, 5);

  return (
    <div className="stack stats">
      <PageHeader eyebrow="Statistiques" title="Votre progression" subtitle="Toutes les données proviennent de vos propres séances, enregistrées sur cet appareil." />

      <section aria-labelledby="now-title" className="stack">
        <h2 id="now-title" className="section-title">
          Aujourd'hui
        </h2>
        <div className="grid stats-now">
          <Card className="level-card">
            <ProgressRing value={level.progress} size={128} stroke={11} label={`Progression vers ${STAGE_BY_ID[level.stage].to} : ${pct(level.progress)}`}>
              <div>
                <div className="ring-big">{level.label}</div>
                <div className="faint tiny">niveau estimé</div>
              </div>
            </ProgressRing>
            <div className="stack" style={{ gap: 6 }}>
              <p className="small muted" style={{ margin: 0 }}>
                {level.description}
              </p>
              <dl className="mini-dl" aria-label="Niveau estimé par domaine">
                {DOMAINS.map((d) => (
                  <div key={d}>
                    <dt>{DOMAIN_LABELS[d]}</dt>
                    <dd>{level.domains[d].label ?? '—'}</dd>
                  </div>
                ))}
              </dl>
              <p className="faint tiny" style={{ margin: 0 }}>Estimation pédagogique, pas une certification CECRL.</p>
              <span className="small">
                <IconFlame size={16} className="c-streak" aria-hidden /> Série : <strong>{liveStreak(s.profile.streak, s.profile.lastActiveDate, now)}</strong> j · record {s.profile.bestStreak} j
              </span>
            </div>
          </Card>
          <Card>
            <div className="card-title">
              <h3>Maîtrise par unité</h3>
              <Link to="/parcours" className="small">
                Parcours
              </Link>
            </div>
            <BarRows
              label="Maîtrise moyenne de chaque unité"
              rows={ALL_UNITS.filter((u) => unlocked.has(u.stage) || u.skills.some((id) => (s.skills[id]?.attempts ?? 0) > 0)).map((u) => {
                const ms = u.skills.map((id) => effectiveMastery(s.skills[id], now));
                const avg = ms.reduce((a, b) => a + b, 0) / Math.max(1, ms.length);
                const mastered = u.skills.filter((id) => skillStatus(id, s.skills, now, unlocked) === 'mastered').length;
                return { key: u.id, label: u.title, value: avg, valueText: pct(avg), sub: `${mastered}/${u.skills.length} maîtrisées` };
              })}
            />
          </Card>
        </div>
        <Card>
          <div className="card-title">
            <h3>Profil par niveau</h3>
            <span className="small faint">compétences évaluées de façon fiable</span>
          </div>
          <BarRows
            label="Maîtrise moyenne et couverture des compétences de chaque niveau"
            rows={CEFR_LEVELS.map((lv) => {
              const ev = levelEvidence(lv, s.skills, now);
              const passed = (s.profile.levelsPassed ?? []).includes(lv);
              return { key: lv, label: `Niveau ${lv}${passed ? ' · validé' : ''}`, value: ev.mastery, valueText: pct(ev.mastery), sub: `${pct(ev.coverage)} des notions travaillées` };
            })}
          />
        </Card>
        {s.writings.length > 0 && (
          <Card>
            <div className="card-title">
              <h3>Mes rédactions</h3>
              <span className="small faint">{s.writings.length} texte{s.writings.length > 1 ? 's' : ''}</span>
            </div>
            <p className="small muted">Score automatique : longueur, éléments imposés, erreurs certaines. L’auto-évaluation est indicative.</p>
            <ul className="writing-history">
              {s.writings.slice(0, 20).map((w) => (
                <li key={w.id}>
                  <button type="button" className="link-btn" aria-expanded={openWriting === w.id} onClick={() => setOpenWriting(openWriting === w.id ? null : w.id)}>
                    {w.title}
                  </button>
                  <span className="small faint">
                    {' '}
                    · {new Date(w.ts).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} · {w.words} mots · vérifications {pct(w.autoScore)}
                    {w.selfScore !== undefined ? ` · auto-évaluation ${pct(w.selfScore)}` : ''}
                  </span>
                  {openWriting === w.id && (
                    <div className="writing-model" lang="en">
                      {w.text.split(/\n/).map((l, i) => (l.trim() ? <p key={i}>{l}</p> : null))}
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </Card>
        )}
        {fragile.length > 0 && (
          <Card>
            <div className="card-title">
              <h3>Notions fragiles</h3>
              <Button size="sm" variant="soft" onClick={() => navigate(`/seance?mode=adaptive&t=${Date.now()}`)}>
                Les travailler
              </Button>
            </div>
            <BarRows
              label="Notions les moins maîtrisées"
              rows={fragile.map(({ k, m }) => ({
                key: k.id,
                label: <Link to={`/lecon/${k.id}`}>{SKILL_BY_ID[k.id].title}</Link>,
                value: m,
                valueText: pct(m),
                sub: `${k.correct}/${k.attempts} réussis`,
              }))}
            />
          </Card>
        )}
      </section>

      <div className="filter-row" role="toolbar" aria-label="Période des statistiques">
        <IconCalendar size={18} aria-hidden className="faint" />
        <Segmented
          label="Période"
          value={period}
          onChange={(p) => {
            setPeriod(p);
            setHistoryCount(12);
          }}
          options={[
            { value: '7', label: '7 jours' },
            { value: '30', label: '30 jours' },
            { value: '90', label: '90 jours' },
            { value: 'all', label: 'Tout' },
          ]}
        />
      </div>

      <Card>
        <div className="stats-kpis">
          <Stat icon={IconListChecks} label="Exercices" value={totals.exercises} sub={prev && <Delta cur={totals.exercises} prev={prev.exercises} />} />
          <Stat
            icon={IconTarget}
            tone="success"
            label="Réussite"
            value={totals.exercises ? pct(totals.correct / totals.exercises) : '—'}
            sub={prev && prev.exercises > 0 && totals.exercises > 0 && <Delta cur={(totals.correct / totals.exercises) * 100} prev={(prev.correct / prev.exercises) * 100} unit=" pts" />}
          />
          <Stat icon={IconClock} tone="accent" label="Temps d'entraînement" value={formatDuration(totals.ms)} sub={`${totals.activeDays} jour${totals.activeDays > 1 ? 's' : ''} actif${totals.activeDays > 1 ? 's' : ''}`} />
          <Stat icon={IconZap} tone="warning" label="XP gagnés" value={totals.xp} sub={`${totals.sessions} séance${totals.sessions > 1 ? 's' : ''}`} />
        </div>
      </Card>

      {!hasActivity ? (
        <Card>
          <EmptyState icon={IconCalendar} title="Aucune activité sur cette période">
            Choisissez une période plus longue pour voir vos statistiques.
          </EmptyState>
        </Card>
      ) : (
        <>
          <div className="grid grid-2">
            <figure className="card chart-card">
              <figcaption className="card-title">
                <div>
                  <h3>Exercices par {unit}</h3>
                </div>
              </figcaption>
              <ColumnChart points={activityPoints} ariaLabel={`Nombre d'exercices par ${unit}`} />
            </figure>
            <figure className="card chart-card">
              <figcaption className="card-title">
                <div>
                  <h3>Réussite par {unit}</h3>
                </div>
              </figcaption>
              <LineChart points={accuracyPoints} ariaLabel={`Taux de réussite par ${unit}`} />
            </figure>
          </div>
          <div>
            <Button variant="ghost" size="sm" icon={IconTable} aria-expanded={showTable} onClick={() => setShowTable((v) => !v)}>
              {showTable ? 'Masquer le tableau des données' : 'Afficher les données sous forme de tableau'}
            </Button>
            {showTable && (
              <div className="table-wrap card">
                <table className="data-table">
                  <caption className="sr-only">Activité et réussite par {unit}</caption>
                  <thead>
                    <tr>
                      <th scope="col">Période</th>
                      <th scope="col">Exercices</th>
                      <th scope="col">Réussite</th>
                      <th scope="col">Temps</th>
                      <th scope="col">XP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[...buckets].reverse().map((b) => (
                      <tr key={b.key}>
                        <td>{b.label}</td>
                        <td>{b.totals.exercises}</td>
                        <td>{b.totals.exercises ? pct(b.totals.correct / b.totals.exercises) : '—'}</td>
                        <td>{b.totals.ms ? formatDuration(b.totals.ms) : '—'}</td>
                        <td>{b.totals.xp}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="grid grid-2">
            <Card>
              <div className="card-title">
                <h3>Réussite par format</h3>
              </div>
              {!periodAttempts ? (
                <Spinner label="Chargement des réponses…" />
              ) : formats.length === 0 ? (
                <p className="muted small">Aucune réponse enregistrée sur cette période.</p>
              ) : (
                <BarRows
                  label="Taux de réussite par format d'exercice, du plus faible au plus élevé"
                  rows={formats.map((f) => ({
                    key: f.type,
                    label: EXERCISE_LABELS[f.type],
                    value: f.correct / f.total,
                    valueText: pct(f.correct / f.total),
                    sub: `${f.total} réponse${f.total > 1 ? 's' : ''}${f.total < 5 ? ' · peu de données' : ''}`,
                  }))}
                />
              )}
            </Card>
            <Card>
              <div className="card-title">
                <h3>Principales difficultés</h3>
                {s.mistakes.length > 0 && (
                  <Button size="sm" variant="soft" iconRight={IconArrowRight} onClick={() => navigate(`/seance?mode=mistakes&t=${Date.now()}`)}>
                    Revoir mes erreurs
                  </Button>
                )}
              </div>
              {!errors ? (
                <Spinner label="Chargement des réponses…" />
              ) : errors.totalErrors === 0 ? (
                <p className="muted small">Aucune erreur sur cette période. Bravo !</p>
              ) : (
                <>
                  <ol className="difficulties">
                    {errors.errors.map((e) => (
                      <li key={e.tag}>
                        <div className="difficulty-head">
                          <strong>{ERROR_TAGS[e.tag]?.label ?? e.tag}</strong>
                          <Badge tone="warning">×{e.count}</Badge>
                        </div>
                        {ERROR_TAGS[e.tag]?.explanation && <p className="small muted">{ERROR_TAGS[e.tag].explanation}</p>}
                        {SKILL_BY_ID[e.topSkill] && (
                          <Link to={`/lecon/${e.topSkill}`} className="small">
                            Leçon : {SKILL_BY_ID[e.topSkill].title}
                          </Link>
                        )}
                      </li>
                    ))}
                  </ol>
                  {errors.untagged > 0 && (
                    <p className="faint small">
                      + {errors.untagged} erreur{errors.untagged > 1 ? 's' : ''} sans catégorie précise (réponse vide, traduction libre…).
                    </p>
                  )}
                </>
              )}
            </Card>
          </div>
        </>
      )}

      <Card>
        <div className="card-title">
          <h3>Historique des séances</h3>
          <span className="small faint">
            {sessions.length} séance{sessions.length > 1 ? 's' : ''} sur la période
          </span>
        </div>
        {sessions.length === 0 ? (
          <p className="muted small">Aucune séance terminée sur cette période.</p>
        ) : (
          <>
            <div className="table-wrap">
              <table className="data-table history-table">
                <thead>
                  <tr>
                    <th scope="col">Date</th>
                    <th scope="col">Séance</th>
                    <th scope="col">Score</th>
                    <th scope="col">XP</th>
                    <th scope="col">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.slice(0, historyCount).map((r) => (
                    <tr key={r.id}>
                      <td className="nowrap">{new Date(r.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}</td>
                      <td>
                        <Badge>{MODE_LABELS[r.mode]}</Badge> <span className="small">{r.title}</span>
                        {r.result && r.mode === 'placement' && <span className="small faint"> · niveau {r.result}</span>}
                      </td>
                      <td className="nowrap">
                        {r.correct}/{r.total} <span className="faint">({r.total ? pct(r.correct / r.total) : '—'})</span>
                      </td>
                      <td>{r.xp}</td>
                      <td className="nowrap">{formatDuration(r.durationMs)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sessions.length > historyCount && (
              <Button variant="ghost" size="sm" onClick={() => setHistoryCount((c) => c + 20)}>
                Afficher plus
              </Button>
            )}
          </>
        )}
      </Card>
    </div>
  );
}
