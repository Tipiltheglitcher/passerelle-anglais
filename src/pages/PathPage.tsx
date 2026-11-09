import { useMemo } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { SKILL_BY_ID, unitsOfStage } from '@/content/curriculum';
import { STAGES, levelTone, type StageDef } from '@/content/levels';
import { effectiveMastery, skillStatus, type SkillStatus } from '@/engine/learning/mastery';
import { EXAMS, nextGuidedSkill } from '@/engine/learning/planner';
import { stageStates, type StageState } from '@/engine/learning/progression';
import { Badge, Button, Card, PageHeader, ProgressBar } from '@/ui/kit';
import { symbol } from '@/ui/symbols';
import { IconCheck, IconCircleCheck, IconGraduation, IconLock, IconRepeat, IconSparkles, IconStar } from '@/ui/icons';

const STATUS_LABEL: Record<SkillStatus, string> = {
  locked: 'À débloquer',
  available: 'Nouveau',
  learning: 'En cours',
  mastered: 'Maîtrisé',
  review: 'À revoir',
};

const STATUS_TONE: Record<SkillStatus, 'neutral' | 'primary' | 'success' | 'warning' | 'accent'> = {
  locked: 'neutral',
  available: 'primary',
  learning: 'accent',
  mastered: 'success',
  review: 'warning',
};

function StatusIcon({ st }: { st: SkillStatus }) {
  if (st === 'mastered') return <IconCheck size={18} aria-hidden />;
  if (st === 'locked') return <IconLock size={16} aria-hidden />;
  if (st === 'review') return <IconRepeat size={16} aria-hidden />;
  if (st === 'learning') return <IconStar size={16} aria-hidden />;
  return <IconSparkles size={16} aria-hidden />;
}

const pct = (v: number) => `${Math.round(v * 100)} %`;

/** Conditions d'ouverture d'une étape fermée. */
function StageGate({ stage, state }: { stage: StageDef; state: StageState }) {
  const gate = EXAMS.find((e) => e.gate === stage.from);
  const r = state.readiness;
  return (
    <Card className="stage-gate-card">
      <div className="stage-gate">
        <div>
          <strong>
            <IconLock size={16} aria-hidden /> Étape à ouvrir
          </strong>
          <p className="small muted" style={{ margin: '4px 0 0' }}>
            Réussissez l’évaluation de fin de niveau {stage.from} (70 % au total, 60 % dans chaque domaine), ou passez le test de niveau. Le nombre d’XP n’entre pas en compte.
          </p>
          {r && (
            <ul className="gate-criteria" aria-label={`Préparation à l'évaluation ${stage.from}`}>
              <li className={r.coverage >= 0.7 ? 'ok' : 'ko'}>
                <IconCircleCheck size={16} aria-hidden /> Notions {stage.from} travaillées au moins quatre fois : {pct(r.coverage)} (conseillé : 70 %)
              </li>
              <li className={r.mastery >= 0.6 ? 'ok' : 'ko'}>
                <IconCircleCheck size={16} aria-hidden /> Maîtrise moyenne : {pct(r.mastery)} (conseillé : 60 %)
              </li>
              {r.weakestDomain && (
                <li className={r.weakestDomain.mastery >= 0.5 ? 'ok' : 'ko'}>
                  <IconCircleCheck size={16} aria-hidden /> Domaine le plus fragile : {pct(r.weakestDomain.mastery)} (conseillé : 50 %)
                </li>
              )}
            </ul>
          )}
        </div>
        <div className="row row-wrap">
          {gate && (
            <Button variant={r?.ready ? 'primary' : 'secondary'} icon={IconGraduation} onClick={() => navigate(`/seance?mode=exam&exam=${gate.id}&t=${Date.now()}`)}>
              {gate.title}
            </Button>
          )}
          <Button variant="ghost" onClick={() => navigate('/test-niveau')}>
            Test de niveau
          </Button>
        </div>
      </div>
    </Card>
  );
}

export function PathPage() {
  const skills = useAppState((s) => s.skills);
  const profile = useAppState((s) => s.profile);
  const now = Date.now();
  const states = useMemo(() => stageStates(profile, skills, now), [profile, skills, now]);
  const unlocked = useMemo(() => new Set(states.filter((s) => s.unlocked).map((s) => s.id)), [states]);
  const next = useMemo(() => nextGuidedSkill(skills, now, unlocked), [skills, now, unlocked]);
  void store;

  return (
    <div>
      <PageHeader
        eyebrow="Parcours guidé"
        title="De A2 à C2, étape par étape"
        subtitle="Quatre étapes, chacune ouverte par un résultat représentatif. Toutes les leçons restent consultables ; le parcours vous recommande la prochaine étape logique."
      />
      {STAGES.map((stage, si) => {
        const state = states[si];
        const units = unitsOfStage(stage.id);
        const ids = units.flatMap((u) => u.skills);
        const avg = ids.length ? ids.reduce((a, id) => a + effectiveMastery(skills[id], now), 0) / ids.length : 0;
        const passed = (profile.levelsPassed ?? []).includes(stage.to);
        return (
          <section key={stage.id} className={`stage${state.unlocked ? '' : ' is-locked'}`} aria-labelledby={`stage-${stage.id}`}>
            <header className="stage-head">
              <span className="stage-badge">
                {stage.from} → {stage.to}
              </span>
              <div>
                <h2 id={`stage-${stage.id}`}>{stage.title}</h2>
                <p className="muted small">{stage.subtitle}</p>
              </div>
              <div className="row row-wrap">
                {passed && <Badge tone="success">Niveau {stage.to} validé</Badge>}
                {state.via === 'placement' && <Badge tone="accent">Ouverte par le test de niveau</Badge>}
                {state.via === 'gate' && <Badge tone="success">Ouverte</Badge>}
                {!state.unlocked && <Badge>Fermée</Badge>}
              </div>
            </header>
            {stage.id !== 'a2b1' && (
              <details className="stage-descriptors-wrap">
                <summary className="small">Objectifs de l’étape (d’après le CECRL)</summary>
                <ul className="stage-descriptors">
                  {stage.descriptors.map((d) => (
                    <li key={d}>{d}</li>
                  ))}
                </ul>
              </details>
            )}
            <ProgressBar value={avg} size="sm" tone="accent" label={`Maîtrise de l'étape ${stage.title}`} />
            {!state.unlocked && <StageGate stage={stage} state={state} />}
            <div className="units">
              {units.map((u, ui) => {
                const Icon = symbol(u.icon);
                const ms = u.skills.map((id) => effectiveMastery(skills[id], now));
                const uAvg = ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 0;
                return (
                  <section key={u.id} className="unit card" aria-labelledby={`unit-${u.id}`}>
                    <header className="unit-head">
                      <div className={`unit-icon unit-tone-${(ui + si) % 6}`}>
                        <Icon size={22} aria-hidden />
                      </div>
                      <div className="spacer">
                        <h3 id={`unit-${u.id}`} className="unit-title">
                          {u.title}
                        </h3>
                        <p className="muted small" style={{ margin: 0 }}>
                          {u.subtitle}
                        </p>
                      </div>
                      <Badge tone={levelTone(u.level)}>{u.kind === 'vocab' && stage.id === 'a2b1' ? 'A2–B1' : u.level}</Badge>
                    </header>
                    <ProgressBar value={uAvg} size="sm" tone="accent" label={`Maîtrise de l'unité ${u.title}`} />
                    <ul className="skill-list">
                      {u.skills.map((id) => {
                        const def = SKILL_BY_ID[id];
                        const st = skillStatus(id, skills, now, unlocked);
                        const m = effectiveMastery(skills[id], now);
                        const to = def.kind === 'vocab' ? `/vocabulaire/${id.replace('vocab_', '')}` : `/lecon/${id}`;
                        return (
                          <li key={id}>
                            <Link to={to} className={`skill-row status-${st}${id === next ? ' is-next' : ''}`}>
                              <span className={`skill-status-dot tone-${STATUS_TONE[st]}`}>
                                <StatusIcon st={st} />
                              </span>
                              <span className="skill-text">
                                <span className="skill-title">{def.title}</span>
                                <span className="skill-sub" lang="en">
                                  {def.kind === 'vocab' ? def.summary : def.en}
                                </span>
                              </span>
                              <span className="skill-right">
                                {id === next && <Badge tone="primary">Prochaine étape</Badge>}
                                {id !== next && <Badge tone={STATUS_TONE[st]}>{def.selfAssessed && st !== 'locked' ? 'Auto-évaluée' : STATUS_LABEL[st]}</Badge>}
                                <span className="skill-mastery" aria-label={`Maîtrise : ${Math.round(m * 100)} %`}>
                                  <ProgressBar value={m} size="sm" tone={m >= 0.8 ? 'success' : m >= 0.45 ? 'accent' : 'primary'} />
                                </span>
                              </span>
                            </Link>
                          </li>
                        );
                      })}
                    </ul>
                  </section>
                );
              })}
            </div>
          </section>
        );
      })}
    </div>
  );
}
