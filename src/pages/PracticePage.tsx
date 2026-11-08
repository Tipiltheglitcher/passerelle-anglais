/**
 * Entraînement : modes de révision, examens blancs, entraînement par format
 * et séance libre composée par l'utilisateur.
 */
import { useMemo, useState, type ComponentType } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { ALL_UNITS, SKILL_BY_ID } from '@/content/curriculum';
import { EXAMS } from '@/engine/learning/planner';
import { skillStatus, effectiveMastery } from '@/engine/learning/mastery';
import { supportsFormat } from '@/engine/learning/formats';
import { AUDIO_TYPES, EXERCISE_LABELS, type ExerciseType } from '@/engine/exercises/types';
import { SESSION_SIZES, type SkillState } from '@/engine/learning/types';
import { dayKey } from '@/state/dates';
import { Badge, Button, Card, PageHeader, Segmented } from '@/ui/kit';
import {
  IconBrain,
  IconChat,
  IconCheck,
  IconEar,
  IconFile,
  IconGraduation,
  IconHeadphones,
  IconLanguages,
  IconLink,
  IconListChecks,
  IconMedal,
  IconPen,
  IconPlay,
  IconPuzzle,
  IconRepeat,
  IconShuffle,
  IconSparkles,
  IconTarget,
  IconTimer,
  IconTrophy,
  IconWand,
} from '@/ui/icons';

type IconT = ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;

const FORMAT_ICONS: Record<ExerciseType, IconT> = {
  wordOrder: IconShuffle,
  cloze: IconPen,
  mcq: IconListChecks,
  translateFrEn: IconLanguages,
  translateEnFr: IconLanguages,
  errorCorrection: IconTarget,
  conjugation: IconWand,
  matching: IconLink,
  dialogue: IconChat,
  reading: IconFile,
  listening: IconHeadphones,
  contextChoice: IconPuzzle,
  transformation: IconRepeat,
  dictation: IconEar,
};

const FORMAT_HINTS: Record<ExerciseType, string> = {
  wordOrder: 'Construire la phrase avec des étiquettes',
  cloze: 'Écrire le mot manquant',
  mcq: 'Choisir la bonne réponse',
  translateFrEn: 'Écrire la phrase en anglais',
  translateEnFr: 'Choisir la bonne traduction',
  errorCorrection: "Repérer et corriger l'erreur",
  conjugation: 'Conjuguer le verbe',
  matching: 'Relier les paires',
  dialogue: 'Choisir ses répliques',
  reading: 'Lire un texte et répondre',
  listening: 'Écouter et choisir',
  contextChoice: 'Choisir selon la situation',
  transformation: 'Transformer une phrase',
  dictation: 'Écouter et écrire',
};

const FORMAT_ORDER: ExerciseType[] = ['mcq', 'cloze', 'wordOrder', 'translateFrEn', 'translateEnFr', 'conjugation', 'errorCorrection', 'transformation', 'contextChoice', 'matching', 'dictation', 'listening', 'dialogue', 'reading'];

/** Compétences utilisées pour un entraînement centré sur un format. */
function poolForFormat(type: ExerciseType, skills: Record<string, SkillState>, now: number): string[] {
  if (type === 'reading') return ['reading'];
  if (type === 'dialogue') return ['dialogues'];
  const candidates = ALL_UNITS.flatMap((u) => u.skills).filter((id) => id !== 'reading' && id !== 'dialogues' && supportsFormat(id, type));
  const open = candidates.filter((id) => skillStatus(id, skills, now) !== 'locked');
  // priorité aux notions déjà travaillées, puis aux notions disponibles
  const practiced = open.filter((id) => (skills[id]?.attempts ?? 0) > 0);
  const base = practiced.length >= 3 ? practiced : open;
  const pool = (base.length ? base : candidates).slice();
  if (type === 'listening' && !pool.includes('listening')) pool.push('listening');
  return pool.slice(0, 12);
}

interface ModeCard {
  id: string;
  title: string;
  text: string;
  icon: IconT;
  tone: string;
  to: string;
  badge?: string;
  disabled?: boolean;
  disabledText?: string;
}

export function PracticePage() {
  const s = useAppState((st) => st);
  const now = Date.now();
  const due = store.dueCounts(now);
  const audio = s.audioSupported && s.settings.audio.enabled;
  const practicedCount = Object.values(s.skills).filter((k) => k.attempts > 0).length;

  const modes: ModeCard[] = [
    {
      id: 'adaptive',
      title: 'Entraînement adaptatif',
      text: 'Cible vos notions fragiles, vos erreurs récentes et les révisions dues.',
      icon: IconSparkles,
      tone: 'primary',
      to: `/seance?mode=adaptive&t=${now}`,
    },
    {
      id: 'review',
      title: 'Révision grammaticale',
      text: 'Les notions arrivées à échéance dans la révision espacée.',
      icon: IconRepeat,
      tone: 'accent',
      to: `/seance?mode=review&t=${now}`,
      badge: due.skillsDue ? `${due.skillsDue} à revoir` : undefined,
      disabled: practicedCount === 0,
      disabledText: 'Disponible après votre première séance',
    },
    {
      id: 'vocab',
      title: 'Révision du vocabulaire',
      text: 'Les mots et verbes irréguliers à réviser, puis de nouveaux mots.',
      icon: IconBrain,
      tone: 'success',
      to: `/seance?mode=vocab&t=${now}`,
      badge: due.itemsDue ? `${due.itemsDue} à revoir` : undefined,
    },
    {
      id: 'mistakes',
      title: 'Révision des erreurs',
      text: 'Vos erreurs à refaire : chacune disparaît après deux réussites.',
      icon: IconTarget,
      tone: 'danger',
      to: `/seance?mode=mistakes&t=${now}`,
      badge: s.mistakes.length ? `${s.mistakes.length}` : undefined,
      disabled: s.mistakes.length === 0,
      disabledText: 'Aucune erreur à revoir pour le moment',
    },
    {
      id: 'daily',
      title: 'Défi du jour',
      text: '12 exercices identiques pour toute la journée, du plus simple au plus exigeant.',
      icon: IconTrophy,
      tone: 'warning',
      to: `/seance?mode=daily&t=${now}`,
      badge: s.profile.dailyDone === dayKey(now) ? 'Terminé' : undefined,
    },
    {
      id: 'sprint',
      title: 'Sprint 90 secondes',
      text: 'Un maximum de bonnes réponses en 90 secondes, sur les notions déjà travaillées.',
      icon: IconTimer,
      tone: 'streak',
      to: `/seance?mode=sprint&t=${now}`,
    },
  ];

  return (
    <div className="stack practice">
      <PageHeader eyebrow="Entraînement" title="Choisissez votre séance" subtitle="Révisions ciblées, examens blancs ou séance sur mesure : tous les exercices sont générés à la volée, sans répétition récente." />

      <section aria-labelledby="modes-title">
        <h2 id="modes-title" className="section-title">
          Modes de révision
        </h2>
        <div className="mode-grid">
          {modes.map((m) => (
            <button key={m.id} type="button" className={`mode-card tone-${m.tone}`} disabled={m.disabled} onClick={() => navigate(m.to)}>
              <span className="mode-icon">
                <m.icon size={22} aria-hidden />
              </span>
              <span className="mode-body">
                <span className="mode-title">
                  {m.title}
                  {m.badge && <Badge tone={m.badge === 'Terminé' ? 'success' : 'primary'}>{m.badge}</Badge>}
                </span>
                <span className="mode-text">{m.disabled && m.disabledText ? m.disabledText : m.text}</span>
              </span>
            </button>
          ))}
          <Link to="/test-niveau" className="mode-card tone-neutral">
            <span className="mode-icon">
              <IconGraduation size={22} aria-hidden />
            </span>
            <span className="mode-body">
              <span className="mode-title">
                Test de niveau
                {s.profile.placementLevel && <Badge tone="accent">{s.profile.placementLevel}</Badge>}
              </span>
              <span className="mode-text">18 questions pour situer votre niveau et adapter le parcours.</span>
            </span>
          </Link>
        </div>
      </section>

      <ExamsSection />
      <FormatsSection audio={audio} />
      <CustomSession audio={audio} />
    </div>
  );
}

function ExamsSection() {
  const sessions = useAppState((s) => s.sessions);
  const now = Date.now();
  return (
    <section aria-labelledby="exams-title">
      <h2 id="exams-title" className="section-title">
        Examens blancs progressifs
      </h2>
      <p className="muted section-sub">Sans correction pendant l'épreuve, comme un vrai examen. Seuil de réussite : 70 %. Le bilan détaille chaque réponse.</p>
      <div className="exam-grid">
        {EXAMS.map((e, i) => {
          const past = sessions.filter((r) => r.mode === 'exam' && r.title?.startsWith(e.title));
          const best = past.reduce((acc, r) => Math.max(acc, r.total ? r.correct / r.total : 0), 0);
          const passed = past.length > 0 && best >= 0.7;
          return (
            <Card key={e.id} className="exam-card">
              <div className="exam-head">
                <span className={`exam-num level-${e.level}`}>{i + 1}</span>
                <div className="spacer">
                  <h3>{e.title}</h3>
                  <p className="muted small" style={{ margin: 0 }}>
                    {e.subtitle}
                  </p>
                </div>
                {passed && (
                  <span className="exam-pass" title="Examen réussi">
                    <IconMedal size={22} aria-hidden />
                  </span>
                )}
              </div>
              <p className="small faint exam-units">{e.units.map((u) => ALL_UNITS.find((x) => x.id === u)?.title).join(' · ')}</p>
              <div className="exam-foot">
                <span className="small muted">
                  {e.size} questions · niveau {e.level}
                  {past.length > 0 && (
                    <>
                      {' '}
                      · meilleur score <strong>{Math.round(best * 100)} %</strong>
                    </>
                  )}
                </span>
                <Button size="sm" variant={passed ? 'secondary' : 'primary'} icon={IconPlay} onClick={() => navigate(`/seance?mode=exam&exam=${e.id}&t=${now}`)}>
                  {past.length ? 'Repasser' : 'Commencer'}
                </Button>
              </div>
            </Card>
          );
        })}
      </div>
    </section>
  );
}

function FormatsSection({ audio }: { audio: boolean }) {
  const skills = useAppState((s) => s.skills);
  const now = Date.now();
  return (
    <section aria-labelledby="formats-title">
      <h2 id="formats-title" className="section-title">
        S'entraîner par format
      </h2>
      <p className="muted section-sub">Un seul type d'exercice, sur les notions que vous avez déjà abordées.</p>
      <div className="format-grid">
        {FORMAT_ORDER.map((t) => {
          const Icon = FORMAT_ICONS[t];
          const needsAudio = AUDIO_TYPES.has(t);
          const disabled = needsAudio && !audio;
          return (
            <button
              key={t}
              type="button"
              className="format-card"
              disabled={disabled}
              title={disabled ? 'Nécessite la synthèse vocale (voir Paramètres)' : undefined}
              onClick={() => {
                const pool = poolForFormat(t, skills, Date.now());
                navigate(`/seance?mode=practice&types=${t}&skills=${pool.join(',')}&t=${now}`);
              }}
            >
              <span className="format-icon">
                <Icon size={20} aria-hidden />
              </span>
              <span className="format-name">{EXERCISE_LABELS[t]}</span>
              <span className="format-hint">{disabled ? 'Audio indisponible' : FORMAT_HINTS[t]}</span>
            </button>
          );
        })}
      </div>
    </section>
  );
}

function CustomSession({ audio }: { audio: boolean }) {
  const skills = useAppState((s) => s.skills);
  const defaultLength = useAppState((s) => s.settings.sessionLength);
  const [selected, setSelected] = useState<string[]>([]);
  const [types, setTypes] = useState<ExerciseType[]>([]);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>(defaultLength);
  const now = Date.now();

  const toggle = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleType = (t: ExerciseType) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));

  // formats compatibles avec la sélection actuelle
  const compatible = useMemo(() => {
    if (!selected.length) return new Set<ExerciseType>();
    return new Set(FORMAT_ORDER.filter((t) => selected.some((id) => supportsFormat(id, t))));
  }, [selected]);
  const usable = selected.filter((id) => !types.length || types.some((t) => supportsFormat(id, t)));
  const ignored = selected.length - usable.length;

  const start = () => {
    if (!usable.length) return;
    const params = new URLSearchParams({ mode: 'practice', skills: usable.join(','), size: String(SESSION_SIZES[length]), t: String(Date.now()) });
    const okTypes = types.filter((t) => compatible.has(t));
    if (okTypes.length) params.set('types', okTypes.join(','));
    navigate(`/seance?${params.toString()}`);
  };

  return (
    <section aria-labelledby="custom-title">
      <h2 id="custom-title" className="section-title">
        Séance sur mesure
      </h2>
      <Card className="custom-card">
        <div className="custom-step">
          <h3>1. Notions à travailler</h3>
          <p className="muted small">Choisissez une ou plusieurs notions, de grammaire comme de vocabulaire. Les notions verrouillées restent accessibles ici.</p>
          <div className="unit-picks">
            {ALL_UNITS.map((u) => (
              <fieldset key={u.id} className="unit-pick">
                <legend>{u.title}</legend>
                <div className="chips">
                  {u.skills.map((id) => {
                    const def = SKILL_BY_ID[id];
                    const on = selected.includes(id);
                    const m = effectiveMastery(skills[id], now);
                    return (
                      <button key={id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggle(id)}>
                        {on && <IconCheck size={14} aria-hidden />}
                        {def.title}
                        {m > 0 && <span className="chip-meter" style={{ ['--m' as string]: m }} aria-label={`maîtrise ${Math.round(m * 100)} %`} />}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
        </div>

        <div className="custom-step">
          <h3>2. Formats (facultatif)</h3>
          <p className="muted small">{selected.length ? 'Sans choix, les formats varient selon votre niveau de maîtrise.' : 'Sélectionnez d\'abord au moins une notion.'}</p>
          <div className="chips">
            {FORMAT_ORDER.map((t) => {
              const on = types.includes(t);
              const disabled = !compatible.has(t) || (AUDIO_TYPES.has(t) && !audio);
              return (
                <button key={t} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} disabled={disabled} onClick={() => toggleType(t)}>
                  {on && <IconCheck size={14} aria-hidden />}
                  {EXERCISE_LABELS[t]}
                </button>
              );
            })}
          </div>
        </div>

        <div className="custom-step custom-foot">
          <div>
            <h3>3. Durée</h3>
            <Segmented
              label="Durée de la séance"
              value={length}
              onChange={setLength}
              options={[
                { value: 'short', label: `Courte · ${SESSION_SIZES.short}` },
                { value: 'medium', label: `Moyenne · ${SESSION_SIZES.medium}` },
                { value: 'long', label: `Longue · ${SESSION_SIZES.long}` },
              ]}
            />
          </div>
          <div className="custom-launch">
            {ignored > 0 && (
              <p className="small warning-text">
                {ignored} notion{ignored > 1 ? 's' : ''} ne propose{ignored > 1 ? 'nt' : ''} pas ces formats et ser{ignored > 1 ? 'ont' : 'a'} ignorée{ignored > 1 ? 's' : ''}.
              </p>
            )}
            <Button size="lg" icon={IconPlay} disabled={!usable.length} onClick={start}>
              Lancer la séance
            </Button>
          </div>
        </div>
      </Card>
    </section>
  );
}
