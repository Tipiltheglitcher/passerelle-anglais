/**
 * Séance d'exercices immersive : progression, vérification, explication,
 * enchaînement, possibilité de quitter et de reprendre, bilan final.
 */
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { evaluate } from '@/engine/exercises/evaluate';
import type { EvalResult, ExerciseResponse, ExerciseType } from '@/engine/exercises/types';
import { currentItem, isAnswered, progressOf, summarize, type Session } from '@/engine/learning/session';
import type { SessionMode } from '@/engine/learning/types';
import { ExerciseView, FeedbackPanel, exerciseHeader, isSelfChecking } from '@/exercises/ExerciseView';
import { playError, playFanfare, playSuccess } from '@/audio/sfx';
import { stopSpeaking } from '@/audio/tts';
import { Button, IconButton, Modal, ProgressBar } from '@/ui/kit';
import { IconClose, IconFlame, IconSkip, IconTimer, IconZap } from '@/ui/icons';
import { SessionSummary } from './SessionSummary';
import { prefersReducedMotion } from '@/app/theme';

const MODES: SessionMode[] = ['guided', 'practice', 'adaptive', 'review', 'vocab', 'mistakes', 'daily', 'exam', 'placement', 'sprint'];

export function SessionPage({ query }: { query: URLSearchParams }) {
  const [session, setSession] = useState<Session | null>(null);
  const [phase, setPhase] = useState<'answering' | 'checked'>('answering');
  const [result, setResult] = useState<EvalResult | null>(null);
  const [ready, setReady] = useState(false);
  const [quitOpen, setQuitOpen] = useState(false);
  const [shake, setShake] = useState(false);
  const [toast, setToast] = useState<string | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const sounds = useAppState((s) => s.settings.sounds);
  const motion = useAppState((s) => s.settings.motion);
  const created = useRef(false);
  const responseRef = useRef<ExerciseResponse | null>(null);
  const startRef = useRef(Date.now());
  const sessionRef = useRef<Session | null>(null);
  const phaseRef = useRef(phase);
  sessionRef.current = session;
  phaseRef.current = phase;

  // création ou reprise de la séance
  useEffect(() => {
    if (created.current) return;
    created.current = true;
    const active = store.getState().activeSession;
    if (query.get('resume')) {
      // l'exercice en cours avait déjà été corrigé avant l'interruption : on passe au suivant
      if (active) setSession(isAnswered(active) ? store.next(active) : active);
      // plus de séance à reprendre (terminée entre-temps) : retour à l'accueil, sans en créer une autre
      else navigate('/', { replace: true });
      return;
    }
    // rafraîchissement de la page : la séance créée par cette même adresse est reprise
    const origin = query.toString();
    if (active && active.origin === origin) {
      setSession(isAnswered(active) ? store.next(active) : active);
      return;
    }
    const m = query.get('mode') as SessionMode | null;
    const mode: SessionMode = m && MODES.includes(m) ? m : 'guided';
    const list = (k: string) => query.get(k)?.split(',').filter(Boolean);
    const sizeRaw = Number(query.get('size'));
    const s = store.startSession(mode, {
      focusSkills: list('skills'),
      focusTypes: list('types') as ExerciseType[] | undefined,
      vocabThemes: list('themes'),
      examId: query.get('exam') ?? undefined,
      size: Number.isFinite(sizeRaw) && sizeRaw >= 4 && sizeRaw <= 40 ? Math.round(sizeRaw) : undefined,
      origin,
    });
    setSession(s);
  }, [query]);

  // minuteur du sprint
  useEffect(() => {
    if (!session?.timeLimitMs || session.finished) return;
    const t = setInterval(() => {
      const n = Date.now();
      setNow(n);
      const cur = sessionRef.current;
      if (cur && !cur.finished && cur.timeLimitMs && n - cur.startedAt >= cur.timeLimitMs) {
        setSession(store.end(cur));
      }
    }, 250);
    return () => clearInterval(t);
  }, [session?.timeLimitMs, session?.finished]);

  useEffect(() => () => stopSpeaking(), []);

  const item = session ? currentItem(session) : null;

  useEffect(() => {
    startRef.current = Date.now();
    responseRef.current = null;
    setReady(false);
    // chaque nouvel exercice repart du haut de la zone de défilement
    document.getElementById('main')?.scrollTo?.({ top: 0 });
  }, [item?.exercise.id]);

  const onChange = useCallback((r: ExerciseResponse | null) => {
    responseRef.current = r;
    setReady(!!r);
  }, []);

  const goNext = useCallback(() => {
    const cur = sessionRef.current;
    if (!cur) return;
    stopSpeaking();
    const n = store.next(cur);
    setSession(n);
    setPhase('answering');
    setResult(null);
    setReady(false);
    responseRef.current = null;
    if (n.finished && sounds) {
      const sum = summarize(n, Date.now());
      if (sum.accuracy >= 0.8 && sum.total >= 4) playFanfare();
    }
  }, [sounds]);

  const submit = useCallback(
    (forced?: ExerciseResponse, skipped = false) => {
      const cur = sessionRef.current;
      const it = cur ? currentItem(cur) : null;
      if (!cur || !it || phaseRef.current !== 'answering') return;
      const resp = forced ?? responseRef.current;
      if (!resp) return;
      const ms = Date.now() - startRef.current;
      const evaluated = evaluate(it.exercise, resp);
      // « Je ne sais pas » : on montre la réponse sans attribuer de catégorie d'erreur
      const res = skipped ? { ...evaluated, correct: false, score: 0, errorTag: undefined, diff: undefined, note: undefined, headline: 'Voici la bonne réponse' } : evaluated;
      const next = store.answer(cur, res, ms);
      if (!cur.feedback) {
        // examen / test de niveau : pas de correction immédiate
        setToast('Réponse enregistrée');
        setTimeout(() => setToast(null), 900);
        sessionRef.current = next;
        setSession(next);
        setTimeout(() => goNext(), 0);
        return;
      }
      setSession(next);
      setResult(res);
      setPhase('checked');
      if (sounds) (res.correct ? playSuccess : playError)();
      if (!res.correct && !prefersReducedMotion(motion)) {
        setShake(true);
        setTimeout(() => setShake(false), 500);
      }
    },
    [goNext, sounds, motion],
  );

  const onSubmit = useCallback(() => {
    if (phaseRef.current === 'checked') goNext();
    else submit();
  }, [goNext, submit]);

  const skip = () => {
    const it = item;
    if (!it) return;
    // « Je ne sais pas » : réponse vide, comptée comme une erreur avec explication
    const empty: ExerciseResponse =
      it.exercise.type === 'wordOrder'
        ? { kind: 'order', tiles: [] }
        : it.exercise.type === 'cloze' || it.exercise.type === 'conjugation'
          ? { kind: 'blanks', values: [] }
          : it.exercise.type === 'errorCorrection'
            ? { kind: 'error', index: -1, correction: '' }
            : it.exercise.type === 'matching' || it.exercise.type === 'dialogue' || it.exercise.type === 'reading'
              ? { kind: 'multi', correct: 0, total: 1, mistakes: 1 }
              : 'options' in it.exercise
                ? { kind: 'choice', index: -1 }
                : { kind: 'text', value: '' };
    submit(empty, true);
  };

  // touche Entrée globale : vérifier / continuer
  useEffect(() => {
    const on = (e: KeyboardEvent) => {
      if (e.key !== 'Enter' || e.defaultPrevented || quitOpen) return;
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'TEXTAREA' || t.tagName === 'INPUT')) return;
      if (t && t.tagName === 'BUTTON' && !t.classList.contains('option') && phaseRef.current === 'answering') return;
      e.preventDefault();
      onSubmit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [onSubmit, quitOpen]);

  const header = useMemo(() => (item ? exerciseHeader(item.exercise) : null), [item]);

  if (!session) {
    return (
      <div className="session-shell">
        <div className="session-loading">Préparation de la séance…</div>
      </div>
    );
  }

  if (session.finished || !item) {
    return <SessionSummary session={session} />;
  }

  const progress = progressOf(session, now);
  const remaining = session.timeLimitMs ? Math.max(0, Math.ceil((session.timeLimitMs - (now - session.startedAt)) / 1000)) : null;
  const selfChecking = isSelfChecking(item.exercise);

  return (
    <div className="session-shell">
      <header className="session-top">
        <IconButton icon={IconClose} label="Quitter la séance" onClick={() => setQuitOpen(true)} />
        <div className="session-progress">
          <ProgressBar value={progress} label="Progression de la séance" size="lg" tone={session.timeLimitMs ? 'warning' : 'primary'} />
        </div>
        {remaining !== null ? (
          <span className={`session-chip${remaining <= 10 ? ' is-urgent' : ''}`}>
            <IconTimer size={16} aria-hidden /> {remaining} s
          </span>
        ) : (
          <span className="session-chip" title="Exercice en cours / total">
            {Math.min(session.index + 1, session.items.length)}/{session.items.length}
          </span>
        )}
        {session.feedback && (
          <span className={`session-chip session-combo${session.combo >= 3 ? ' is-hot' : ''}`} title="Bonnes réponses d'affilée">
            <IconFlame size={16} aria-hidden /> {session.combo}
          </span>
        )}
        {session.mode !== 'placement' && (
          <span className="session-chip session-xp" title="XP de la séance">
            <IconZap size={16} aria-hidden /> {session.xp}
          </span>
        )}
      </header>

      <main className="session-main" id="main">
        <div key={item.exercise.id} className={`exercise-card animate-rise${shake ? ' is-shaking' : ''}`}>
          <div className="exercise-meta">
            <span className="badge badge-primary">{header?.label}</span>
            {item.retry && <span className="badge badge-warning">Nouvelle tentative</span>}
            <span className="exercise-skill">{header?.skill}</span>
          </div>
          <h1 className="exercise-instruction">{item.exercise.instruction}</h1>
          <ExerciseView exercise={item.exercise} phase={phase} result={result} onChange={onChange} onSubmit={onSubmit} />
        </div>
      </main>

      <footer className={`session-bottom${phase === 'checked' && result ? (result.correct ? ' is-correct' : ' is-wrong') : ''}`}>
        <div className="session-bottom-inner">
          {phase === 'checked' && result ? (
            <>
              <FeedbackPanel exercise={item.exercise} result={result} />
              <Button size="lg" variant={result.correct ? 'success' : 'danger'} onClick={goNext} autoFocus className="continue-btn">
                Continuer
              </Button>
            </>
          ) : (
            <div className="action-row">
              {!selfChecking && session.mode !== 'placement' && (
                <Button variant="ghost" onClick={skip} icon={IconSkip}>
                  Je ne sais pas
                </Button>
              )}
              {session.mode === 'placement' && (
                <Button variant="ghost" onClick={skip} icon={IconSkip}>
                  Passer
                </Button>
              )}
              <span className="spacer" />
              {!selfChecking && (
                <Button size="lg" onClick={() => submit()} disabled={!ready}>
                  {session.feedback ? 'Vérifier' : 'Valider'}
                </Button>
              )}
              {selfChecking && <span className="faint small">Répondez directement dans l'exercice.</span>}
            </div>
          )}
        </div>
      </footer>

      {toast && <div className="toast">{toast}</div>}

      <Modal
        open={quitOpen}
        onClose={() => setQuitOpen(false)}
        title="Quitter la séance ?"
        footer={
          <>
            <Button variant="ghost" onClick={() => setQuitOpen(false)}>
              Continuer la séance
            </Button>
            {session.answers.length > 0 && (
              <Button
                variant="secondary"
                onClick={() => {
                  setQuitOpen(false);
                  setSession(store.end(session));
                }}
              >
                Terminer et voir le bilan
              </Button>
            )}
            <Button
              onClick={() => {
                stopSpeaking();
                store.saveActive(session);
                navigate('/');
              }}
            >
              Reprendre plus tard
            </Button>
          </>
        }
      >
        <p>Vos réponses sont déjà enregistrées. Vous pourrez reprendre cette séance depuis l'accueil, ou la terminer maintenant pour voir votre bilan.</p>
        <button
          type="button"
          className="link-btn danger"
          onClick={() => {
            stopSpeaking();
            store.discardActive();
            navigate('/');
          }}
        >
          Abandonner définitivement cette séance
        </button>
      </Modal>
    </div>
  );
}
