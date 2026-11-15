/**
 * Entraînement libre : on choisit un niveau, puis un ou plusieurs thèmes de
 * ce niveau (grammaire, vocabulaire, compréhension), éventuellement les
 * formats et la durée. Tous les niveaux sont accessibles, même ceux dont
 * l'étape n'est pas encore ouverte dans le parcours.
 */
import { useMemo, useState } from 'react';
import { navigate } from '@/app/router';
import { useAppState } from '@/state/store';
import { SKILL_BY_ID } from '@/content/curriculum';
import { themesFor, type ThemeGroup as Group } from './freeThemes';
import { CEFR_LEVELS, levelTone } from '@/content/levels';
import type { CefrLevel } from '@/content/lexicon/types';
import { estimateProfile } from '@/engine/learning/progression';
import { effectiveMastery } from '@/engine/learning/mastery';
import { supportsFormat } from '@/engine/learning/formats';
import { AUDIO_TYPES, EXERCISE_LABELS, type ExerciseType } from '@/engine/exercises/types';
import { SESSION_SIZES } from '@/engine/learning/types';
import { Button, Card, Segmented } from '@/ui/kit';
import { IconCheck, IconPlay } from '@/ui/icons';
import { symbol } from '@/ui/symbols';

const GROUP_TITLES: Record<Group, string> = {
  grammar: 'Grammaire',
  vocab: 'Vocabulaire',
  function: 'Compréhension et expression',
};

const LEVEL_HINTS: Record<CefrLevel, string> = {
  A2: 'Les bases : présent, passé, questions, vocabulaire du quotidien.',
  B1: 'Raconter, donner son avis, present perfect, conditions.',
  B2: 'Argumenter, nuancer, textes plus longs, hypothèses sur le passé.',
  C1: 'Syntaxe complexe, style, implicite, textes exigeants.',
  C2: 'Finesse, idiomaticité, ironie, analyse critique.',
};

const FORMATS: ExerciseType[] = [
  'mcq',
  'cloze',
  'wordOrder',
  'translateFrEn',
  'translateEnFr',
  'conjugation',
  'errorCorrection',
  'transformation',
  'contextChoice',
  'matching',
  'dictation',
  'listening',
  'dialogue',
  'reading',
  'keyword',
  'nuance',
  'register',
  'implicature',
  'styleEdit',
  'longReading',
  'argument',
  'dialogueAnalysis',
  'textOrder',
  'writing',
];

export function FreePractice({ audio }: { audio: boolean }) {
  const skillsState = useAppState((s) => s.skills);
  const profile = useAppState((s) => s.profile);
  const defaultLength = useAppState((s) => s.settings.sessionLength);
  const now = Date.now();
  const startLevel = useMemo<CefrLevel>(() => {
    const e = estimateProfile(skillsState, profile, Date.now());
    if (e.undetermined) return 'A2';
    const l = e.label.slice(0, 2) as CefrLevel;
    return CEFR_LEVELS.includes(l) ? l : 'A2';
    // niveau proposé à l'arrivée sur l'onglet uniquement
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const [level, setLevel] = useState<CefrLevel>(startLevel);
  const [selected, setSelected] = useState<string[]>([]);
  const [excluded, setExcluded] = useState<string[]>([]);
  const [types, setTypes] = useState<ExerciseType[]>([]);
  const [length, setLength] = useState<'short' | 'medium' | 'long'>(defaultLength);

  const themes = useMemo(() => themesFor(level), [level]);
  const chosen = themes.filter((t) => selected.includes(t.id));
  const notions = chosen.flatMap((t) => t.skills);
  const skills = notions.filter((id) => !excluded.includes(id));

  const compatible = useMemo(() => new Set(FORMATS.filter((t) => skills.some((id) => supportsFormat(id, t)))), [skills]);
  const okTypes = types.filter((t) => compatible.has(t) && (audio || !AUDIO_TYPES.has(t)));
  const usable = skills.filter((id) => !okTypes.length || okTypes.some((t) => supportsFormat(id, t)));

  const changeLevel = (l: CefrLevel) => {
    setLevel(l);
    setSelected([]);
    setExcluded([]);
    setTypes([]);
  };
  const toggleTheme = (id: string) => setSelected((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleNotion = (id: string) => setExcluded((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));
  const toggleType = (t: ExerciseType) => setTypes((cur) => (cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t]));
  const allSelected = themes.length > 0 && selected.length === themes.length;

  const start = () => {
    if (!usable.length) return;
    const params = new URLSearchParams({ mode: 'practice', skills: usable.join(','), size: String(SESSION_SIZES[length]), t: String(Date.now()) });
    if (okTypes.length) params.set('types', okTypes.join(','));
    navigate(`/seance?${params.toString()}`);
  };

  const groups = (['grammar', 'vocab', 'function'] as Group[]).map((g) => ({ g, list: themes.filter((t) => t.group === g) })).filter((x) => x.list.length);

  return (
    <Card className="free-card">
      <div className="free-step">
        <h3>1. Niveau</h3>
        <div className="level-picks" role="radiogroup" aria-label="Niveau">
          {CEFR_LEVELS.map((l) => (
            <button key={l} type="button" role="radio" aria-checked={level === l} className={`level-pick tone-${levelTone(l)}${level === l ? ' is-on' : ''}`} onClick={() => changeLevel(l)}>
              {l}
            </button>
          ))}
        </div>
        <p className="muted small free-hint">{LEVEL_HINTS[level]}</p>
      </div>

      <div className="free-step">
        <div className="free-step-head">
          <h3>2. Thèmes</h3>
          <button type="button" className="link-btn" onClick={() => setSelected(allSelected ? [] : themes.map((t) => t.id))}>
            {allSelected ? 'Tout désélectionner' : 'Tout le niveau'}
          </button>
        </div>
        {groups.map(({ g, list }) => (
          <div key={g} className="free-group">
            <p className="free-group-title">{GROUP_TITLES[g]}</p>
            <div className="theme-grid">
              {list.map((t) => {
                const on = selected.includes(t.id);
                const Icon = symbol(t.icon);
                const m = t.skills.reduce((n, id) => n + effectiveMastery(skillsState[id], now), 0) / t.skills.length;
                return (
                  <button key={t.id} type="button" className={`theme-card${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleTheme(t.id)}>
                    <span className="theme-icon" aria-hidden>
                      {on ? <IconCheck size={18} /> : <Icon size={18} />}
                    </span>
                    <span className="theme-body">
                      <span className="theme-title">{t.title}</span>
                      <span className="theme-sub">{t.subtitle}</span>
                      {m > 0 && (
                        <span className="theme-meter" aria-label={`maîtrise ${Math.round(m * 100)} %`}>
                          <span style={{ width: `${Math.round(m * 100)}%` }} />
                        </span>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
        {notions.length > 1 && (
          <div className="free-notions">
            <p className="small muted">Notions incluses (touchez pour en retirer) :</p>
            <div className="chips">
              {notions.map((id) => {
                const on = !excluded.includes(id);
                return (
                  <button key={id} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} onClick={() => toggleNotion(id)}>
                    {on && <IconCheck size={14} aria-hidden />}
                    {SKILL_BY_ID[id].title}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      <div className="free-step">
        <h3>3. Formats (facultatif)</h3>
        <p className="muted small">{skills.length ? 'Sans choix, les formats varient selon votre maîtrise.' : 'Choisissez d’abord au moins un thème.'}</p>
        <div className="chips">
          {FORMATS.filter((t) => compatible.has(t)).map((t) => {
            const on = types.includes(t);
            const disabled = AUDIO_TYPES.has(t) && !audio;
            return (
              <button key={t} type="button" className={`chip${on ? ' is-on' : ''}`} aria-pressed={on} disabled={disabled} title={disabled ? 'Écoute indisponible ou en pause' : undefined} onClick={() => toggleType(t)}>
                {on && <IconCheck size={14} aria-hidden />}
                {EXERCISE_LABELS[t]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="free-step free-foot">
        <div>
          <h3>4. Durée</h3>
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
        <Button size="lg" icon={IconPlay} disabled={!usable.length} onClick={start}>
          {usable.length ? `Lancer · niveau ${level}` : 'Choisissez un thème'}
        </Button>
      </div>
    </Card>
  );
}
