import { useMemo } from 'react';
import { Link } from '@/app/router';
import { useAppState } from '@/state/store';
import { ALL_UNITS, SKILL_BY_ID } from '@/content/curriculum';
import { effectiveMastery, skillStatus, type SkillStatus } from '@/engine/learning/mastery';
import { nextGuidedSkill } from '@/engine/learning/planner';
import { Badge, PageHeader, ProgressBar } from '@/ui/kit';
import { symbol } from '@/ui/symbols';
import { IconCheck, IconLock, IconRepeat, IconSparkles, IconStar } from '@/ui/icons';

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

export function PathPage() {
  const skills = useAppState((s) => s.skills);
  const now = Date.now();
  const next = useMemo(() => nextGuidedSkill(skills, now), [skills, now]);

  return (
    <div>
      <PageHeader
        eyebrow="Parcours guidé"
        title="De A2 à B1, étape par étape"
        subtitle="Chaque notion s'appuie sur les précédentes. Vous pouvez ouvrir n'importe quelle leçon, mais le parcours vous recommande la prochaine étape logique."
      />
      <div className="units">
        {ALL_UNITS.map((u, ui) => {
          const Icon = symbol(u.icon);
          const ms = u.skills.map((id) => effectiveMastery(skills[id], now));
          const avg = ms.length ? ms.reduce((a, b) => a + b, 0) / ms.length : 0;
          return (
            <section key={u.id} className="unit card" aria-labelledby={`unit-${u.id}`}>
              <header className="unit-head">
                <div className={`unit-icon unit-tone-${ui % 6}`}>
                  <Icon size={22} aria-hidden />
                </div>
                <div className="spacer">
                  <h2 id={`unit-${u.id}`}>{u.title}</h2>
                  <p className="muted small" style={{ margin: 0 }}>
                    {u.subtitle}
                  </p>
                </div>
                <Badge tone={u.level === 'B1' ? 'accent' : 'primary'}>{u.kind === 'vocab' ? 'A2–B1' : u.level}</Badge>
              </header>
              <ProgressBar value={avg} size="sm" tone="accent" label={`Maîtrise de l'unité ${u.title}`} />
              <ul className="skill-list">
                {u.skills.map((id) => {
                  const def = SKILL_BY_ID[id];
                  const st = skillStatus(id, skills, now);
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
                          {id !== next && <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>}
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
    </div>
  );
}
