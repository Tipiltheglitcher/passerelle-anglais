/**
 * Apprentissage adaptatif : révision espacée (FSRS), maîtrise, séances,
 * planification de chaque mode.
 */
import { describe, expect, it } from 'vitest';
import { createRng } from '@/engine/core/rng';
import { DAY, cardRetrievability, gradeFromResult, intervalDays, newCard, review } from './fsrs';
import { effectiveMastery, estimateLevel, priority, skillStatus, updateSkill } from './mastery';
import { EXAMS, PLACEMENT_BANDS, nextGuidedSkill, placementResult, planSession, type PlannerInput } from './planner';
import { advance, answerCurrent, createSession, currentItem, isAnswered, progressOf, summarize, xpFor, type SessionItem } from './session';
import { newSkillState, type MistakeRecord, type SessionMode, type SkillState } from './types';
import { GRAMMAR_SKILLS, GUIDED_ORDER, SKILL_BY_ID } from '@/content/curriculum';
import type { EvalResult, Exercise } from '@/engine/exercises/types';

const T0 = new Date(2026, 0, 10, 12).getTime();

describe('révision espacée (FSRS)', () => {
  it("une bonne réponse espace la révision, d'autant plus qu'elle est facile", () => {
    const hard = review(newCard(T0), 2, T0);
    const good = review(newCard(T0), 3, T0);
    const easy = review(newCard(T0), 4, T0);
    expect(good.due).toBeGreaterThan(T0);
    expect(easy.due).toBeGreaterThanOrEqual(good.due);
    expect(good.due).toBeGreaterThanOrEqual(hard.due);
    expect(good.state).toBe('review');
  });

  it('un oubli ramène la carte dans les minutes qui suivent', () => {
    const again = review(newCard(T0), 1, T0);
    expect(again.state).toBe('learning');
    expect(again.due - T0).toBeLessThanOrEqual(15 * 60 * 1000);
  });

  it('les intervalles grandissent avec les réussites successives', () => {
    let card = review(newCard(T0), 3, T0);
    let now = T0;
    const intervals: number[] = [];
    for (let k = 0; k < 4; k++) {
      now = card.due;
      const next = review(card, 3, now);
      intervals.push(next.due - now);
      card = next;
    }
    for (let k = 1; k < intervals.length; k++) expect(intervals[k]).toBeGreaterThan(intervals[k - 1]);
  });

  it('un oubli après une longue période réduit la stabilité et compte une rechute', () => {
    const learned = review(review(newCard(T0), 3, T0), 3, T0 + 3 * DAY);
    const lapse = review(learned, 1, learned.due + 10 * DAY);
    expect(lapse.stability).toBeLessThan(learned.stability);
    expect(lapse.lapses).toBe(1);
    expect(lapse.state).toBe('relearning');
  });

  it('la probabilité de rappel décroît avec le temps', () => {
    const card = review(newCard(T0), 3, T0);
    const r1 = cardRetrievability(card, T0 + DAY);
    const r2 = cardRetrievability(card, T0 + 20 * DAY);
    expect(r1).toBeGreaterThan(r2);
    expect(r1).toBeLessThanOrEqual(1);
    expect(intervalDays(card.stability)).toBeGreaterThanOrEqual(1);
  });

  it('note déduite du résultat (justesse, faute de frappe, rapidité)', () => {
    expect(gradeFromResult({ correct: false, score: 0, ms: 5000, expectedMs: 10000, streak: 0 })).toBe(1);
    expect(gradeFromResult({ correct: true, score: 1, typo: true, ms: 5000, expectedMs: 10000, streak: 0 })).toBe(2);
    expect(gradeFromResult({ correct: true, score: 1, ms: 9000, expectedMs: 10000, streak: 0 })).toBe(3);
    expect(gradeFromResult({ correct: true, score: 1, ms: 3000, expectedMs: 10000, streak: 3 })).toBe(4);
  });
});

describe('maîtrise et niveau', () => {
  const ok = { correct: true, score: 1, difficulty: 2 as const, ms: 4000, now: T0 };
  const ko = { correct: false, score: 0, difficulty: 2 as const, ms: 4000, now: T0, errorTag: 'third_person_s' };

  it('monte avec les réussites, baisse avec les erreurs, garde les erreurs fréquentes', () => {
    let s: SkillState | undefined;
    for (let k = 0; k < 6; k++) s = updateSkill(s, 'present_simple', ok);
    const high = s!.mastery;
    expect(high).toBeGreaterThan(0.5);
    s = updateSkill(s, 'present_simple', ko);
    expect(s.mastery).toBeLessThan(high);
    expect(s.errors.third_person_s).toBe(1);
    expect(s.streak).toBe(0);
    expect(s.attempts).toBe(7);
  });

  it('une réussite difficile compte plus qu’une réussite facile', () => {
    const easy = updateSkill(undefined, 'x', { ...ok, difficulty: 1 });
    const hard = updateSkill(undefined, 'x', { ...ok, difficulty: 3 });
    expect(hard.mastery).toBeGreaterThan(easy.mastery);
  });

  it("s'érode sans révision", () => {
    const s: SkillState = { ...newSkillState('present_simple'), mastery: 0.9, attempts: 10, card: review(newCard(T0), 3, T0) };
    expect(effectiveMastery(s, T0 + 60 * DAY)).toBeLessThan(effectiveMastery(s, T0 + DAY));
  });

  it('prérequis : verrouillé puis disponible', () => {
    const skills: Record<string, SkillState> = {};
    expect(skillStatus('present_simple', skills, T0)).toBe('available');
    expect(skillStatus('present_simple_neg_q', skills, T0)).toBe('locked');
    skills.present_simple = { ...newSkillState('present_simple'), mastery: 0.6, attempts: 5 };
    expect(skillStatus('present_simple_neg_q', skills, T0)).toBe('available');
    expect(skillStatus('present_simple', skills, T0)).toBe('learning');
  });

  it('niveau estimé : A2− au départ, B1+ quand tout est maîtrisé', () => {
    expect(estimateLevel({}, T0).label).toBe('A2−');
    const all: Record<string, SkillState> = {};
    for (const sk of GRAMMAR_SKILLS) all[sk.id] = { ...newSkillState(sk.id), mastery: 0.95, attempts: 20 };
    expect(estimateLevel(all, T0).label).toBe('B1+');
  });

  it('priorité plus forte pour une notion fragile', () => {
    const weak = { ...newSkillState('a'), mastery: 0.2, attempts: 6, lastSeen: T0 };
    const strong = { ...newSkillState('b'), mastery: 0.9, attempts: 6, lastSeen: T0 };
    expect(priority(weak, T0)).toBeGreaterThan(priority(strong, T0));
  });
});

function fakeExercise(id: string, skillId = 'present_simple'): Exercise {
  return {
    id,
    type: 'mcq',
    skillId,
    level: 'A2',
    difficulty: 2,
    instruction: '',
    explanation: '',
    signature: id,
    structure: 'test',
    lexemes: [],
    itemIds: [],
    question: 'q',
    options: [
      { text: 'a', correct: true },
      { text: 'b', correct: false },
    ],
  } as unknown as Exercise;
}

const items = (n: number): SessionItem[] => Array.from({ length: n }, (_, i) => ({ exercise: fakeExercise(`e${i}`), slot: { skillId: 'present_simple', tier: 2, reason: 'mix' } }));
const right: EvalResult = { correct: true, score: 1, expected: '', userAnswer: '', headline: '' };
const wrong: EvalResult = { correct: false, score: 0, expected: 'a', userAnswer: 'b', headline: '', errorTag: 'meaning' };

describe('séance', () => {
  it('enchaîne les exercices, compte la série et les XP', () => {
    let s = createSession(items(3), { id: 's', mode: 'guided', title: 't', now: T0 });
    s = answerCurrent(s, right, 4000);
    expect(s.combo).toBe(1);
    expect(s.xp).toBe(xpFor(right, 2, 1, 'guided'));
    expect(isAnswered(s)).toBe(true);
    s = advance(s, T0 + 5000);
    expect(currentItem(s)?.exercise.id).toBe('e1');
    expect(progressOf(s, T0)).toBeCloseTo(1 / 3);
  });

  it("une même réponse n'est jamais comptée deux fois", () => {
    let s = createSession(items(2), { id: 's', mode: 'guided', title: 't', now: T0 });
    s = answerCurrent(s, right, 1000);
    const again = answerCurrent(s, right, 1000);
    expect(again.answers).toHaveLength(1);
    expect(again).toBe(s);
  });

  it('une erreur ajoute une nouvelle tentative plus loin (limitée)', () => {
    let s = createSession(items(4), { id: 's', mode: 'guided', title: 't', now: T0 });
    const retry = (it: SessionItem): SessionItem => ({ ...it, exercise: fakeExercise(`${it.exercise.id}-r`) });
    s = answerCurrent(s, wrong, 1000, retry);
    expect(s.items).toHaveLength(5);
    expect(s.items.some((x) => x.retry && x.exercise.id === 'e0-r')).toBe(true);
    expect(s.combo).toBe(0);
  });

  it('pas de nouvelle tentative en examen', () => {
    let s = createSession(items(2), { id: 's', mode: 'exam', title: 't', now: T0, feedback: false });
    s = answerCurrent(s, wrong, 1000, (it) => it);
    expect(s.items).toHaveLength(2);
  });

  it('bilan : réussite, notions, erreurs et temps réellement passé', () => {
    let s = createSession(items(2), { id: 's', mode: 'guided', title: 't', now: T0 });
    s = advance(answerCurrent(s, right, 3000), T0);
    s = advance(answerCurrent(s, wrong, 7000), T0);
    expect(s.finished).toBe(true);
    // une reprise plusieurs heures après ne gonfle pas la durée
    const sum = summarize(s, T0 + 5 * 3600 * 1000);
    expect(sum.total).toBe(2);
    expect(sum.accuracy).toBe(0.5);
    expect(sum.durationMs).toBe(10000);
    expect(sum.bySkill.present_simple).toEqual({ total: 2, correct: 1 });
    expect(sum.errors.meaning).toBe(1);
  });
});

function input(over: Partial<PlannerInput> = {}): PlannerInput {
  return { skills: {}, items: {}, mistakes: [], now: T0, size: 14, rng: createRng('plan'), level: 'B1', audio: true, ...over };
}

describe('planification des séances', () => {
  it('parcours guidé : commence par la première notion et remplit la séance', () => {
    expect(nextGuidedSkill({}, T0)).toBe(GUIDED_ORDER[0]);
    const plan = planSession('guided', input());
    expect(plan).toHaveLength(14);
    expect(plan.filter((p) => p.skillId === GUIDED_ORDER[0]).length).toBeGreaterThanOrEqual(9);
    expect(plan.some((p) => p.skillId.startsWith('vocab_'))).toBe(true);
  });

  it('parcours guidé : intercale les révisions arrivées à échéance', () => {
    const due: SkillState = { ...newSkillState('articles'), mastery: 0.6, attempts: 8, card: { ...review(newCard(T0 - 20 * DAY), 3, T0 - 20 * DAY), due: T0 - DAY } };
    const plan = planSession('guided', input({ skills: { articles: due } }));
    expect(plan.some((p) => p.skillId === 'articles' && p.reason === 'review')).toBe(true);
  });

  it('entraînement libre : respecte les notions et formats choisis', () => {
    const plan = planSession('practice', input({ focusSkills: ['comparatives', 'superlatives'], focusTypes: ['cloze'], size: 8 }));
    expect(plan).toHaveLength(8);
    expect(plan.every((p) => ['comparatives', 'superlatives'].includes(p.skillId) && p.types?.[0] === 'cloze')).toBe(true);
  });

  it('révision des erreurs : rejoue les erreurs enregistrées', () => {
    const m: MistakeRecord = { id: 'm1', ts: T0, skillId: 'articles', exercise: fakeExercise('m1', 'articles'), userAnswer: 'b', expected: 'a', fixed: 0 };
    const plan = planSession('mistakes', input({ mistakes: [m], skills: { articles: { ...newSkillState('articles'), attempts: 3, mastery: 0.3, errors: { article_a_an: 1 } } } }));
    expect(plan.some((p) => p.mistake?.id === 'm1')).toBe(true);
  });

  it('vocabulaire : uniquement les thèmes demandés', () => {
    const plan = planSession('vocab', input({ vocabThemes: ['travel'], size: 6 }));
    expect(plan.every((p) => p.skillId === 'vocab_travel')).toBe(true);
  });

  it('examen blanc : uniquement les unités de l’examen, plus lecture, dialogue et écoute', () => {
    for (const exam of EXAMS.filter((e) => !e.parts)) {
      const plan = planSession('exam', input({ examId: exam.id }));
      expect(plan).toHaveLength(exam.size);
      for (const p of plan) {
        const def = SKILL_BY_ID[p.skillId];
        if (def.kind === 'grammar') expect(exam.units).toContain(def.unit);
      }
      expect(plan.some((p) => p.skillId === 'reading')).toBe(true);
      expect(plan.some((p) => p.skillId === 'listening')).toBe(true);
    }
  });

  it('examen sans audio : pas de compréhension orale, même nombre de questions', () => {
    const plan = planSession('exam', input({ examId: 'exam1', audio: false }));
    expect(plan.some((p) => p.skillId === 'listening')).toBe(false);
    expect(plan).toHaveLength(EXAMS[0].size);
  });

  it('test de niveau : couvre toutes les bandes, puis estime un niveau', () => {
    const plan = planSession('placement', input());
    expect(plan).toHaveLength(PLACEMENT_BANDS.reduce((n, b) => n + b.skills.length, 0));
    const perfect = Object.fromEntries(plan.map((p) => [p.skillId, { correct: 1, total: 1 }]));
    // toutes les bandes réussies : niveau de la bande la plus avancée
    expect(placementResult(perfect).level).toBe(PLACEMENT_BANDS[PLACEMENT_BANDS.length - 1].level);
    const none = Object.fromEntries(plan.map((p) => [p.skillId, { correct: 0, total: 1 }]));
    const low = placementResult(none);
    expect(low.level).toBe('A2−');
    expect(Object.values(low.priors).every((v) => v === 0)).toBe(true);
  });

  it('tous les modes produisent un plan non vide pour un débutant', () => {
    const modes: SessionMode[] = ['guided', 'practice', 'adaptive', 'review', 'vocab', 'daily', 'exam', 'placement', 'sprint'];
    for (const m of modes) expect(planSession(m, input()).length, m).toBeGreaterThan(0);
  });

  it('défi du jour reproductible pour une même graine', () => {
    const a = planSession('daily', input({ rng: createRng('daily-2026-01-10') }));
    const b = planSession('daily', input({ rng: createRng('daily-2026-01-10') }));
    expect(a.map((p) => p.skillId)).toEqual(b.map((p) => p.skillId));
  });
});
