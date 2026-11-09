/**
 * Store central de l'application : état en mémoire (lecture instantanée),
 * persistance asynchrone dans IndexedDB, et toutes les actions pédagogiques
 * (démarrer une séance, enregistrer une réponse, clore une séance…).
 */
import { useRef, useSyncExternalStore } from 'react';
import { createRng, randomSeed } from '@/engine/core/rng';
import { SKILL_BY_ID, skillDef } from '@/content/curriculum';
import type { EvalResult, Exercise, ExerciseType } from '@/engine/exercises/types';
import { cardRetrievability, gradeFromResult, newCard, review, type Grade } from '@/engine/learning/fsrs';
import { effectiveMastery, estimateLevel, updateSkill } from '@/engine/learning/mastery';
import { EXAMS, GATE_TITLES, PLACEMENT_CONTINUE, placementResult, planSession, type PlanSlot } from '@/engine/learning/planner';
import { gateOutcome, passedLevelsFromHistory, unlockedStages } from '@/engine/learning/progression';
import type { StageId } from '@/content/levels';
import { makeExercise, type SelectContext } from '@/engine/learning/select';
import { advance as advanceSession, answerCurrent, createSession, currentItem, isAnswered, summarize, xpFor, type Session, type SessionItem } from '@/engine/learning/session';
import {
  DEFAULT_SETTINGS,
  SESSION_SIZES,
  newSkillState,
  type AttemptRecord,
  type DailyStat,
  type ExposureRecord,
  type ItemState,
  type MistakeRecord,
  type Profile,
  type SessionMode,
  type SessionRecord,
  type Settings,
  type SkillState,
  type WritingRecord,
} from '@/engine/learning/types';
import { openBackend, type Backend } from '@/storage/db';
import {
  defaultProfile,
  exportAll,
  importAll,
  loadAll,
  recentAttempts,
  resetAll,
  validateExport,
} from '@/storage/repository';
import { ttsSupported } from '@/audio/tts';
import { addDays, dayKey } from './dates';

export interface AppState {
  status: 'loading' | 'ready' | 'error';
  error?: string;
  storage: 'indexeddb' | 'memory';
  settings: Settings;
  profile: Profile;
  skills: Record<string, SkillState>;
  items: Record<string, ItemState>;
  sessions: SessionRecord[];
  daily: Record<string, DailyStat>;
  mistakes: MistakeRecord[];
  exposure: Record<string, ExposureRecord>;
  activeSession: Session | null;
  audioSupported: boolean;
  /** Productions écrites (les plus récentes d'abord). */
  writings: WritingRecord[];
}

const EXPECTED_MS: Partial<Record<ExerciseType, number>> = {
  mcq: 8000,
  contextChoice: 10000,
  wordOrder: 15000,
  cloze: 12000,
  conjugation: 12000,
  translateEnFr: 12000,
  translateFrEn: 25000,
  errorCorrection: 20000,
  transformation: 25000,
  dictation: 25000,
  listening: 15000,
  matching: 30000,
  dialogue: 60000,
  reading: 120000,
  keyword: 30000,
  nuance: 25000,
  register: 20000,
  implicature: 25000,
  styleEdit: 35000,
  longReading: 300000,
  argument: 240000,
  dialogueAnalysis: 180000,
  textOrder: 90000,
  writing: 900000,
};

/** Formats « rejouables » conservés dans la révision des erreurs. */
const REPLAYABLE = new Set<ExerciseType>(['cloze', 'mcq', 'wordOrder', 'translateFrEn', 'translateEnFr', 'errorCorrection', 'conjugation', 'transformation', 'contextChoice', 'dictation', 'listening', 'keyword', 'nuance', 'register', 'implicature', 'styleEdit', 'textOrder']);

const MODE_TITLES: Record<SessionMode, string> = {
  guided: 'Parcours guidé',
  practice: 'Entraînement libre',
  adaptive: 'Entraînement adaptatif',
  review: 'Révision grammaticale',
  vocab: 'Révision du vocabulaire',
  mistakes: 'Révision des erreurs',
  daily: 'Défi du jour',
  exam: 'Examen blanc',
  placement: 'Test de niveau',
  sprint: 'Sprint chrono',
};

export interface StartOptions {
  focusSkills?: string[];
  focusTypes?: ExerciseType[];
  vocabThemes?: string[];
  examId?: string;
  size?: number;
  /** Paramètres d'adresse ayant créé la séance (reprise après rafraîchissement). */
  origin?: string;
}

type Listener = () => void;

function initialState(): AppState {
  const now = Date.now();
  return {
    status: 'loading',
    storage: 'indexeddb',
    settings: DEFAULT_SETTINGS,
    profile: defaultProfile(now),
    skills: {},
    items: {},
    sessions: [],
    daily: {},
    mistakes: [],
    exposure: {},
    activeSession: null,
    audioSupported: ttsSupported(),
    writings: [],
  };
}

export class Store {
  private state: AppState = initialState();
  private listeners = new Set<Listener>();
  private backend: Backend | null = null;
  private pendingExposure = new Map<string, ExposureRecord>();
  private exposureTimer: ReturnType<typeof setTimeout> | null = null;
  private writeChain: Promise<void> = Promise.resolve();

  getState = (): AppState => this.state;

  subscribe = (l: Listener): (() => void) => {
    this.listeners.add(l);
    return () => this.listeners.delete(l);
  };

  private set(patch: Partial<AppState>) {
    this.state = { ...this.state, ...patch };
    this.listeners.forEach((l) => l());
  }

  /** Sérialise les écritures pour éviter les courses entre transactions. */
  private write(fn: (b: Backend) => Promise<void>) {
    const b = this.backend;
    if (!b) return;
    this.writeChain = this.writeChain.then(() => fn(b)).catch((e) => console.error('Erreur de sauvegarde', e));
  }

  /** Attend la fin des écritures en cours (tests, export). */
  flush(): Promise<void> {
    this.flushExposure();
    return this.writeChain;
  }

  private initPromise: Promise<void> | null = null;

  /** Initialise une seule fois (appelé par l'application tant que l'état est « loading »). */
  ensureInit(): Promise<void> {
    if (!this.initPromise) this.initPromise = this.init();
    return this.initPromise;
  }

  async init(backend?: Backend): Promise<void> {
    try {
      this.backend = backend ?? (await openBackend());
      const now = Date.now();
      const data = await loadAll(this.backend, now, (s) => passedLevelsFromHistory(s, GATE_TITLES));
      this.set({
        status: 'ready',
        storage: this.backend.kind,
        settings: data.settings,
        profile: data.profile,
        skills: data.skills,
        items: data.items,
        sessions: data.sessions,
        daily: data.daily,
        mistakes: data.mistakes,
        exposure: data.exposure,
        activeSession: isSession(data.activeSession) ? data.activeSession : null,
        audioSupported: ttsSupported(),
        writings: data.writings,
      });
      // première ouverture (ou migration) : on enregistre profil et réglages
      this.write((b) => b.put('profile', this.state.profile));
      this.write((b) => b.put('settings', this.state.settings));
    } catch (e) {
      console.error(e);
      this.set({ status: 'error', error: e instanceof Error ? e.message : String(e) });
    }
  }

  // -------------------------------------------------------------------------
  // Contexte de génération

  /** Étapes du parcours ouvertes (évaluations réussies, test de niveau). */
  unlocked(now = Date.now()): Set<StageId> {
    return unlockedStages(this.state.profile, this.state.skills, now);
  }

  audioEnabled(): boolean {
    return this.state.audioSupported && this.state.settings.audio.enabled;
  }

  contentLevel(skillId: string): 'A2' | 'B1' {
    const def = SKILL_BY_ID[skillId];
    if (def && def.level !== 'A2') return 'B1';
    const lv = estimateLevel(this.state.skills, Date.now());
    return lv.a2 >= 0.6 ? 'B1' : 'A2';
  }

  selectContext(seed: string, skillId: string, lastType?: ExerciseType): SelectContext {
    const now = Date.now();
    const exp = this.state.exposure;
    const items = this.state.items;
    return {
      seed,
      level: this.contentLevel(skillId),
      audio: this.audioEnabled(),
      lastType,
      recent: (sig) => {
        const e = exp[`sig:${sig}`];
        return !!e && now - e.last < 14 * 86400000;
      },
      lexWeight: (lex) => {
        const e = exp[`lex:${lex}`];
        if (!e) return 1.4;
        const decayed = e.count * Math.exp(-(now - e.last) / (7 * 86400000));
        return 1 / (1 + decayed * 0.5);
      },
      itemWeight: (id) => {
        const it = items[id];
        if (!it) return 2;
        if (it.card.due <= now) return 6;
        return 0.3 + (1 - cardRetrievability(it.card, now)) * 2;
      },
    };
  }

  // -------------------------------------------------------------------------
  // Séances

  startSession(mode: SessionMode, o: StartOptions = {}): Session {
    // une séance déjà commencée est clôturée (et apparaît dans l'historique) plutôt que perdue ;
    // un examen ou un test de niveau interrompu n'est pas noté
    const prev = this.state.activeSession;
    if (prev && !prev.finished && prev.answers.length > 0 && prev.mode !== 'exam' && prev.mode !== 'placement') this.finalize({ ...prev, finished: true });
    const now = Date.now();
    const s = this.state;
    const seed = mode === 'daily' ? `daily-${dayKey(now)}` : randomSeed();
    const rng = createRng(seed);
    const exam = mode === 'exam' ? EXAMS.find((e) => e.id === o.examId) ?? EXAMS[0] : null;
    const size = o.size ?? (exam ? exam.size : mode === 'daily' ? 12 : mode === 'placement' ? 18 : mode === 'sprint' ? 40 : SESSION_SIZES[s.settings.sessionLength]);
    const plan = planSession(mode, {
      skills: s.skills,
      items: s.items,
      mistakes: s.mistakes,
      now,
      size,
      rng,
      level: 'B1',
      audio: this.audioEnabled(),
      focusSkills: o.focusSkills,
      focusTypes: o.focusTypes,
      vocabThemes: o.vocabThemes,
      examId: exam?.id,
      unlocked: this.unlocked(now),
    });
    const items: SessionItem[] = [];
    const used = new Set<string>();
    let lastType: ExerciseType | undefined;
    plan.forEach((slot, i) => {
      const ex = this.buildForSlot(slot, `${seed}-${i}`, lastType, used);
      if (ex) {
        items.push({ exercise: ex, slot });
        used.add(ex.signature);
        lastType = ex.type;
      }
    });
    let title = MODE_TITLES[mode];
    let subtitle: string | undefined;
    if (mode === 'guided' && plan[0]) subtitle = skillDef(plan[0].skillId).title;
    if (mode === 'practice' && o.focusSkills?.length === 1) subtitle = skillDef(o.focusSkills[0]).title;
    if (exam) {
      title = exam.title;
      subtitle = exam.subtitle;
    }
    const session = createSession(items, {
      id: `${mode}-${now.toString(36)}-${seed.slice(0, 5)}`,
      mode,
      title,
      subtitle,
      now,
      feedback: mode !== 'exam' && mode !== 'placement',
      timeLimitMs: mode === 'sprint' ? 90_000 : undefined,
      examId: exam?.id,
      focusSkills: o.focusSkills,
      origin: o.origin,
    });
    this.saveActive(session);
    return session;
  }

  private buildForSlot(slot: PlanSlot, seed: string, lastType: ExerciseType | undefined, used: Set<string>): Exercise | null {
    if (slot.mistake) return slot.mistake.exercise;
    const ctx = this.selectContext(seed, slot.skillId, lastType);
    const recent = ctx.recent;
    ctx.recent = (sig) => used.has(sig) || (recent ? recent(sig) : false);
    return makeExercise(slot.skillId, ctx, { tier: slot.tier, type: slot.type, types: slot.types });
  }

  private makeRetry = (item: SessionItem): SessionItem | null => {
    const tier = Math.max(1, item.slot.tier - 1) as 1 | 2 | 3;
    const ctx = this.selectContext(`${randomSeed()}-retry`, item.exercise.skillId, item.exercise.type);
    const ex = makeExercise(item.exercise.skillId, ctx, { tier, types: item.slot.types });
    return ex ? { exercise: ex, slot: { ...item.slot, tier, mistake: undefined } } : null;
  };

  /** Enregistre la réponse à l'exercice courant et met à jour toute la progression. */
  answer(session: Session, result: EvalResult, ms: number): Session {
    const item = currentItem(session);
    if (!item) return session;
    if (isAnswered(session)) return session;
    const ex = item.exercise;
    const now = Date.now();
    const s = this.state;
    const skills = { ...s.skills };
    const prevSkill = skills[ex.skillId];
    if (session.mode !== 'placement') {
      skills[ex.skillId] = updateSkill(prevSkill, ex.skillId, {
        correct: result.correct,
        score: result.score,
        difficulty: item.slot.tier,
        ms,
        errorTag: result.errorTag,
        now,
      });
    } else if (!skills[ex.skillId]) skills[ex.skillId] = { ...newSkillState(ex.skillId), lastSeen: now };
    // éléments mémorisables (vocabulaire, verbes irréguliers)
    const items = { ...s.items };
    const changedItems: ItemState[] = [];
    const grade: Grade = gradeFromResult({ correct: result.correct, score: result.score, typo: result.typo, ms, expectedMs: EXPECTED_MS[ex.type] ?? 15000, streak: prevSkill?.streak ?? 0 });
    for (const id of ex.itemIds) {
      const prev = items[id];
      // association : chaque mot est noté selon sa propre paire (confondu → à revoir vite)
      const own = result.itemOutcomes?.[id];
      const itemOk = own ?? result.correct;
      const itemGrade: Grade = own === undefined ? grade : own ? 3 : 1;
      const card = review(prev?.card ?? newCard(now), itemGrade, now);
      const next: ItemState = { id, card, seen: (prev?.seen ?? 0) + 1, correct: (prev?.correct ?? 0) + (itemOk ? 1 : 0), lastSeen: now };
      items[id] = next;
      changedItems.push(next);
    }
    // exposition (variété)
    const exposure = { ...s.exposure };
    const bump = (key: string) => {
      const e = exposure[key];
      const rec = { key, count: (e?.count ?? 0) + 1, last: now };
      exposure[key] = rec;
      this.pendingExposure.set(key, rec);
    };
    bump(`sig:${ex.signature}`);
    bump(`st:${ex.structure}`);
    ex.lexemes.forEach((l) => bump(`lex:${l}`));
    // statistiques du jour et série
    const today = dayKey(now);
    const daily = { ...s.daily };
    const xpGain = session.mode === 'placement' ? 0 : xpFor(result, item.slot.tier, result.correct ? session.combo + 1 : 0, session.mode);
    const d = daily[today] ?? { date: today, exercises: 0, correct: 0, xp: 0, ms: 0, sessions: 0 };
    daily[today] = { ...d, exercises: d.exercises + 1, correct: d.correct + (result.correct ? 1 : 0), xp: d.xp + xpGain, ms: d.ms + Math.min(ms, 5 * 60000) };
    const profile = { ...s.profile, totalXp: s.profile.totalXp + xpGain };
    if (profile.lastActiveDate !== today) {
      profile.streak = profile.lastActiveDate === addDays(today, -1) ? profile.streak + 1 : 1;
      profile.bestStreak = Math.max(profile.bestStreak, profile.streak);
      profile.lastActiveDate = today;
    }
    // erreurs à revoir
    let mistakes = s.mistakes;
    const mistakeChanges: { put?: MistakeRecord; del?: string } = {};
    if (!result.correct && REPLAYABLE.has(ex.type) && session.mode !== 'placement') {
      const rec: MistakeRecord = { id: ex.id, ts: now, skillId: ex.skillId, exercise: ex, userAnswer: result.userAnswer, expected: result.expected, errorTag: result.errorTag, fixed: 0 };
      mistakes = [rec, ...mistakes.filter((m) => m.id !== ex.id)].slice(0, 200);
      mistakeChanges.put = rec;
    } else if (result.correct && item.slot.mistake) {
      const m = mistakes.find((x) => x.id === item.slot.mistake!.id);
      if (m) {
        const fixed = m.fixed + 1;
        if (fixed >= 2) {
          mistakes = mistakes.filter((x) => x.id !== m.id);
          mistakeChanges.del = m.id;
        } else {
          const upd = { ...m, fixed };
          mistakes = mistakes.map((x) => (x.id === m.id ? upd : x));
          mistakeChanges.put = upd;
        }
      }
    }
    const attempt: AttemptRecord = {
      ts: now,
      sessionId: session.id,
      mode: session.mode,
      exerciseId: ex.id,
      type: ex.type,
      skillId: ex.skillId,
      correct: result.correct,
      score: result.score,
      ms,
      errorTag: result.errorTag,
      signature: ex.signature,
      structure: ex.structure,
    };
    let nextSession = answerCurrent(session, result, ms, session.mode === 'mistakes' || session.mode === 'guided' || session.mode === 'practice' || session.mode === 'adaptive' || session.mode === 'review' || session.mode === 'vocab' || session.mode === 'daily' ? this.makeRetry : undefined);
    if (session.mode === 'placement') nextSession = stopPlacementIfNeeded(nextSession);
    // production écrite conservée
    let writings = s.writings;
    let writing: WritingRecord | null = null;
    if (result.production && ex.type === 'writing') {
      writing = { id: `${ex.id}-${now.toString(36)}`, ts: now, skillId: ex.skillId, title: ex.title, text: result.production, words: result.production.trim().split(/s+/).filter(Boolean).length, autoScore: result.score, selfScore: result.selfScore };
      writings = [writing, ...writings].slice(0, 100);
    }
    this.set({ skills, items, exposure, daily, profile, mistakes, activeSession: nextSession, writings });
    const skillRec = skills[ex.skillId];
    this.write(async (b) => {
      await b.put('skills', skillRec);
      if (changedItems.length) await b.putMany('items', changedItems);
      await b.put('daily', daily[today]);
      await b.put('profile', profile);
      await b.put('attempts', attempt);
      if (mistakeChanges.put) await b.put('mistakes', mistakeChanges.put);
      if (mistakeChanges.del) await b.delete('mistakes', mistakeChanges.del);
      if (writing) await b.put('writings', writing);
      await b.put('meta', { id: 'active', session: nextSession });
    });
    this.scheduleExposureFlush();
    return nextSession;
  }

  /** Passe à l'exercice suivant ; clôt la séance si elle est terminée. */
  next(session: Session): Session {
    const s2 = advanceSession(session, Date.now());
    if (s2.finished) {
      this.finalize(s2);
      return s2;
    }
    this.saveActive(s2);
    return s2;
  }

  /** Termine immédiatement une séance (temps écoulé, abandon avec bilan). */
  end(session: Session): Session {
    const s2 = { ...session, finished: true };
    this.finalize(s2);
    return s2;
  }

  private finalize(session: Session) {
    const now = Date.now();
    const sum = summarize(session, now);
    const skills = { ...this.state.skills };
    const changed: SkillState[] = [];
    const profile = { ...this.state.profile };
    let result: string | undefined;
    if (session.mode === 'placement') {
      const { level, priors } = placementResult(sum.bySkill);
      for (const [id, prior] of Object.entries(priors)) {
        const prev = skills[id] ?? newSkillState(id);
        const next = { ...prev, mastery: Math.max(prev.mastery, prior), placed: true };
        skills[id] = next;
        changed.push(next);
      }
      profile.placementDone = true;
      profile.placementLevel = level;
      result = level;
    } else if (session.answers.length) {
      // révision espacée au niveau des compétences : une note par compétence et par séance
      for (const [id, b] of Object.entries(sum.bySkill)) {
        const prev = skills[id];
        if (!prev) continue;
        const acc = b.total ? b.correct / b.total : 0;
        const g: Grade = acc >= 0.9 && b.total >= 3 ? 4 : acc >= 0.7 ? 3 : acc >= 0.45 ? 2 : 1;
        const next = { ...prev, card: review(prev.card ?? newCard(now), g, now) };
        skills[id] = next;
        changed.push(next);
      }
    }
    if (session.mode === 'exam') {
      result = `${Math.round(sum.accuracy * 100)} %`;
      const exam = EXAMS.find((e) => e.id === session.examId);
      if (exam?.gate && session.answers.length >= Math.min(exam.size, session.items.length)) {
        const g = gateOutcome(sum.bySkill);
        if (g.passed) {
          profile.levelsPassed = [...new Set([...(profile.levelsPassed ?? []), exam.gate])];
          result = `${result} · niveau ${exam.gate} validé`;
        } else result = `${result} · niveau ${exam.gate} non validé`;
      }
    }
    if (session.mode === 'daily') profile.dailyDone = dayKey(now);
    const today = dayKey(now);
    const daily = { ...this.state.daily };
    if (session.answers.length) {
      const d = daily[today] ?? { date: today, exercises: 0, correct: 0, xp: 0, ms: 0, sessions: 0 };
      daily[today] = { ...d, sessions: d.sessions + 1 };
    }
    const record: SessionRecord = {
      id: session.id,
      mode: session.mode,
      startedAt: session.startedAt,
      endedAt: now,
      total: sum.total,
      correct: sum.correct,
      xp: sum.xp,
      durationMs: sum.durationMs,
      skills: Object.keys(sum.bySkill),
      bySkill: sum.bySkill,
      title: session.subtitle ? `${session.title} — ${session.subtitle}` : session.title,
      result,
    };
    const sessions = session.answers.length ? [record, ...this.state.sessions].slice(0, 300) : this.state.sessions;
    this.set({ skills, profile, daily, sessions, activeSession: null });
    this.write(async (b) => {
      if (changed.length) await b.putMany('skills', changed);
      await b.put('profile', profile);
      if (daily[today]) await b.put('daily', daily[today]);
      if (session.answers.length) await b.put('sessions', record);
      await b.delete('meta', 'active');
    });
    this.flushExposure();
  }

  saveActive(session: Session | null) {
    this.set({ activeSession: session && !session.finished ? session : null });
    this.write(async (b) => {
      if (session && !session.finished) await b.put('meta', { id: 'active', session });
      else await b.delete('meta', 'active');
    });
  }

  discardActive() {
    this.saveActive(null);
  }

  private scheduleExposureFlush() {
    if (this.exposureTimer) return;
    this.exposureTimer = setTimeout(() => this.flushExposure(), 1500);
  }

  private flushExposure() {
    if (this.exposureTimer) {
      clearTimeout(this.exposureTimer);
      this.exposureTimer = null;
    }
    if (!this.pendingExposure.size) return;
    const recs = [...this.pendingExposure.values()];
    this.pendingExposure.clear();
    this.write((b) => b.putMany('exposure', recs));
  }

  // -------------------------------------------------------------------------
  // Réglages et données

  updateSettings(patch: Partial<Settings>) {
    const settings: Settings = { ...this.state.settings, ...patch, audio: { ...this.state.settings.audio, ...(patch.audio ?? {}) } };
    this.set({ settings });
    this.write((b) => b.put('settings', settings));
  }

  markLessonSeen(skillId: string) {
    const prev = this.state.skills[skillId] ?? newSkillState(skillId);
    if (prev.lessonSeen) return;
    const next = { ...prev, lessonSeen: true };
    this.set({ skills: { ...this.state.skills, [skillId]: next } });
    this.write((b) => b.put('skills', next));
  }

  async loadAttempts(n = 3000): Promise<AttemptRecord[]> {
    await this.flush();
    return this.backend ? recentAttempts(this.backend, n) : [];
  }

  async exportData(): Promise<string> {
    await this.flush();
    if (!this.backend) throw new Error('Stockage indisponible');
    return JSON.stringify(await exportAll(this.backend), null, 1);
  }

  async importData(text: string): Promise<void> {
    let parsed: unknown;
    try {
      parsed = JSON.parse(text);
    } catch {
      throw new Error('Le fichier n\'est pas un JSON valide.');
    }
    const file = validateExport(parsed);
    await this.flush();
    if (!this.backend) throw new Error('Stockage indisponible');
    await importAll(this.backend, file);
    await this.init(this.backend);
  }

  async reset(): Promise<void> {
    await this.flush();
    if (this.backend) await resetAll(this.backend);
    this.state = { ...initialState(), status: 'loading' };
    await this.init(this.backend ?? undefined);
  }

  // -------------------------------------------------------------------------
  // Indicateurs dérivés

  dueCounts(now = Date.now()) {
    let skillsDue = 0;
    let itemsDue = 0;
    let tomorrow = 0;
    const tomorrowEnd = now + 86400000;
    for (const sk of Object.values(this.state.skills)) {
      if (sk.card && sk.card.reps > 0) {
        if (sk.card.due <= now) skillsDue++;
        else if (sk.card.due <= tomorrowEnd) tomorrow++;
      }
    }
    for (const it of Object.values(this.state.items)) {
      if (it.card.due <= now) itemsDue++;
      else if (it.card.due <= tomorrowEnd) tomorrow++;
    }
    return { skillsDue, itemsDue, tomorrow };
  }

  masteryOf(id: string, now = Date.now()): number {
    return effectiveMastery(this.state.skills[id], now);
  }
}


/**
 * Test de niveau adaptatif : à la fin de chaque bande, si le score est
 * nettement insuffisant, le test s'arrête (inutile de proposer les niveaux
 * supérieurs).
 */
function stopPlacementIfNeeded(s: Session): Session {
  const i = s.index;
  const band = s.items[i]?.slot.band;
  if (!band) return s;
  const next = s.items[i + 1];
  if (next && next.slot.band === band) return s;
  if (!next) return s;
  let total = 0;
  let correct = 0;
  s.answers.forEach((a, k) => {
    if (s.items[k]?.slot.band !== band) return;
    total += 1;
    if (a.correct) correct += 1;
  });
  if (total && correct / total < PLACEMENT_CONTINUE) return { ...s, items: s.items.slice(0, i + 1) };
  return s;
}

function isSession(v: unknown): v is Session {
  return !!v && typeof v === 'object' && Array.isArray((v as Session).items) && typeof (v as Session).index === 'number' && !(v as Session).finished;
}

export const store = new Store();


/**
 * Abonnement React à une partie de l'état. La valeur est mise en cache par
 * version d'état : un sélecteur qui construit un objet ne provoque pas de
 * rendus en boucle.
 */
export function useAppState<T>(selector: (s: AppState) => T): T {
  const cache = useRef<{ state: AppState; value: T } | null>(null);
  const get = () => {
    const st = store.getState();
    if (cache.current && cache.current.state === st) return cache.current.value;
    const value = selector(st);
    cache.current = { state: st, value };
    return value;
  };
  return useSyncExternalStore(store.subscribe, get, get);
}
