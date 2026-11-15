/**
 * Entraînement, en onglets : entraînement libre (niveau et thèmes au choix),
 * modes de révision, examens blancs et entraînement par format.
 */
import { type ComponentType } from 'react';
import { Link, navigate, useRoute } from '@/app/router';
import { FreePractice } from './FreePractice';
import { store, useAppState } from '@/state/store';
import { ALL_UNITS } from '@/content/curriculum';
import { EXAMS } from '@/engine/learning/planner';
import { skillStatus } from '@/engine/learning/mastery';
import { supportsFormat } from '@/engine/learning/formats';
import { AUDIO_TYPES, EXERCISE_LABELS, type ExerciseType } from '@/engine/exercises/types';
import type { SkillState } from '@/engine/learning/types';
import { dayKey } from '@/state/dates';
import { Badge, Button, Card, PageHeader } from '@/ui/kit';
import {
  IconBrain,
  IconChat,
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
  IconKey,
  IconScale,
  IconQuote,
  IconFeather,
  IconScroll,
  IconGlasses,
  IconLayers,
  IconPenTool,
  IconDrama,
} from '@/ui/icons';
import { STAGES, levelTone } from '@/content/levels';
import { PLACEMENT_BANDS } from '@/engine/learning/planner';

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
  keyword: IconKey,
  nuance: IconScale,
  register: IconDrama,
  implicature: IconQuote,
  styleEdit: IconFeather,
  longReading: IconScroll,
  argument: IconGlasses,
  dialogueAnalysis: IconChat,
  textOrder: IconLayers,
  writing: IconPenTool,
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
  keyword: 'Reformuler avec un mot imposé',
  nuance: 'Distinguer des formulations proches',
  register: 'Adapter le ton à la situation',
  implicature: 'Comprendre le sous-entendu',
  styleEdit: 'Choisir la meilleure version',
  longReading: 'Lire un texte long et l’analyser',
  argument: 'Thèse, preuves, failles',
  dialogueAnalysis: 'Intentions des locuteurs',
  textOrder: 'Remettre un texte en ordre',
  writing: 'Rédiger, vérifier, s’auto-évaluer',
};

const BASE_FORMATS: ExerciseType[] = ['mcq', 'cloze', 'wordOrder', 'translateFrEn', 'translateEnFr', 'conjugation', 'errorCorrection', 'transformation', 'contextChoice', 'matching', 'dictation', 'listening', 'dialogue', 'reading'];
const ADVANCED_FORMATS: ExerciseType[] = ['keyword', 'nuance', 'register', 'implicature', 'styleEdit', 'longReading', 'argument', 'dialogueAnalysis', 'textOrder', 'writing'];

/** Compétences utilisées pour un entraînement centré sur un format. */
function poolForFormat(type: ExerciseType, skills: Record<string, SkillState>, now: number): string[] {
  if (type === 'reading') return ['reading'];
  if (type === 'dialogue') return ['dialogues'];
  const candidates = ALL_UNITS.flatMap((u) => u.skills).filter((id) => id !== 'reading' && id !== 'dialogues' && supportsFormat(id, type));
  if (!candidates.length) return [];
  const unlocked = store.unlocked(now);
  const open = candidates.filter((id) => skillStatus(id, skills, now, unlocked) !== 'locked');
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

const TABS = [
  { id: 'libre', label: 'Libre' },
  { id: 'revisions', label: 'Révisions' },
  { id: 'examens', label: 'Examens' },
  { id: 'formats', label: 'Formats' },
] as const;
type TabId = (typeof TABS)[number]['id'];

export function PracticePage() {
  const s = useAppState((st) => st);
  const route = useRoute();
  const raw = route.query.get('onglet');
  const tab: TabId = TABS.some((t) => t.id === raw) ? (raw as TabId) : 'libre';
  const now = Date.now();
  const due = store.dueCounts(now);
  const audio = s.audioSupported && s.settings.audio.enabled && now >= s.listenPausedUntil;
  const listenPaused = s.audioSupported && s.settings.audio.enabled && now < s.listenPausedUntil;
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
      <PageHeader eyebrow="Entraînement" title="Choisissez votre séance" subtitle="Niveau et thèmes au choix, révisions ciblées ou examens blancs : les exercices sont générés à la volée, sans répétition récente." />

      <div className="practice-tabs" role="tablist" aria-label="Type d’entraînement">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls="practice-panel"
            className={`practice-tab${tab === t.id ? ' is-active' : ''}`}
            onClick={() => navigate(t.id === 'libre' ? '/entrainement' : `/entrainement?onglet=${t.id}`, { replace: true })}
          >
            {t.label}
          </button>
        ))}
      </div>

      {listenPaused && (
        <div className="notice notice-warning listen-pause">
          <IconHeadphones size={20} aria-hidden />
          <p>Exercices d’écoute en pause jusqu’à {new Date(s.listenPausedUntil).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}.</p>
          <Button size="sm" variant="secondary" onClick={() => store.resumeListening()}>
            Réactiver
          </Button>
        </div>
      )}

      <div id="practice-panel" role="tabpanel" aria-labelledby={`tab-${tab}`} className="stack">
      {tab === 'libre' && (
        <section aria-labelledby="free-title">
          <h2 id="free-title" className="section-title">
            Entraînement libre
          </h2>
          <p className="muted section-sub">Choisissez un niveau, puis les thèmes à travailler. Tous les niveaux sont accessibles, même ceux que le parcours n’a pas encore ouverts.</p>
          <FreePractice audio={audio} />
        </section>
      )}

      {tab === 'revisions' && (
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
              <span className="mode-text">Test adaptatif de A2 à {PLACEMENT_BANDS[PLACEMENT_BANDS.length - 1].level} ({PLACEMENT_BANDS.reduce((n, b) => n + b.skills.length, 0)} questions au plus) : il s’arrête dès que le niveau est atteint.</span>
            </span>
          </Link>
        </div>
      </section>
      )}

      {tab === 'examens' && <ExamsSection />}
      {tab === 'formats' && <FormatsSection audio={audio} />}
      </div>
    </div>
  );
}

function ExamsSection() {
  const sessions = useAppState((s) => s.sessions);
  const levelsPassed = useAppState((s) => s.profile.levelsPassed ?? []);
  const now = Date.now();
  return (
    <section aria-labelledby="exams-title">
      <h2 id="exams-title" className="section-title">
        Examens blancs progressifs
      </h2>
      <p className="muted section-sub">Sans correction pendant l'épreuve, comme un vrai examen. Seuil de réussite : 70 %. Les évaluations de fin de niveau exigent aussi 60 % dans chaque domaine ; leur réussite valide le niveau et ouvre l'étape suivante. Résultats indicatifs, pas une certification.</p>
      {STAGES.map((stage) => {
        const exams = EXAMS.filter((e) => (stage.id === 'a2b1' ? e.level === 'A2' || e.level === 'B1' : e.level === stage.to));
        if (!exams.length) return null;
        return (
          <div key={stage.id} className="exam-group">
            <h3 className="exam-group-title">
              <Badge tone={levelTone(stage.to)}>
                {stage.from} → {stage.to}
              </Badge>{' '}
              {stage.title}
            </h3>
      <div className="exam-grid">
        {exams.map((e) => {
          const i = EXAMS.indexOf(e);
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
                {(e.gate ? (levelsPassed.includes(e.gate)) : passed) && (
                  <span className="exam-pass" title={e.gate ? `Niveau ${e.gate} validé` : 'Examen réussi'}>
                    <IconMedal size={22} aria-hidden />
                  </span>
                )}
              </div>
              {e.gate && <Badge tone="warning">Évaluation de fin de niveau {e.gate}</Badge>}
              <p className="small faint exam-units">{e.covers ?? e.units.map((u) => ALL_UNITS.find((x) => x.id === u)?.title).join(' · ')}</p>
              <div className="exam-foot">
                <span className="small muted">
                  {e.size} exercices · niveau {e.level}
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
          </div>
        );
      })}
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
      {[
        { id: 'base', title: 'Formats fondamentaux', list: BASE_FORMATS },
        { id: 'adv', title: 'Formats avancés (B2 → C2)', list: ADVANCED_FORMATS },
      ].map((g) => (
        <div key={g.id} className="format-group">
          <h3 className="exam-group-title">{g.title}</h3>
      <div className="format-grid">
        {g.list.map((t) => {
          const Icon = FORMAT_ICONS[t];
          const needsAudio = AUDIO_TYPES.has(t);
          const disabled = needsAudio && !audio;
          return (
            <button
              key={t}
              type="button"
              className="format-card"
              disabled={disabled}
              title={disabled ? 'Écoute indisponible ou en pause (voir Réglages)' : undefined}
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
        </div>
      ))}
    </section>
  );
}
