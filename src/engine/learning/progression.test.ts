/**
 * Progression A2 → C2 : déblocage des étapes, estimation par domaine,
 * évaluations de fin de niveau, migration, planification avancée.
 */
import { describe, expect, it } from 'vitest';
import { createRng } from '@/engine/core/rng';
import { ALL_SKILLS, GRAMMAR_SKILLS, SKILL_BY_ID } from '@/content/curriculum';
import { estimateFloor, estimateProfile, gateOutcome, levelEvidence, passedLevelsFromHistory, readinessFor, stageStates, unlockedStages } from './progression';
import { EXAMS, GATE_TITLES, maxPerSession, nextGuidedSkill, planSession, type PlannerInput } from './planner';
import { migrateProfile } from '@/storage/repository';
import { newSkillState, type Profile, type SessionRecord, type SkillState } from './types';
import type { CefrLevel } from '@/content/levels';

const T0 = new Date(2026, 3, 10, 12).getTime();
const profile = (over: Partial<Profile> = {}): Profile => ({ id: 'me', createdAt: T0, placementDone: false, streak: 0, bestStreak: 0, totalXp: 0, levelsPassed: [], dataVersion: 2, ...over });

function masteredLevel(level: CefrLevel, mastery = 0.9, attempts = 10): Record<string, SkillState> {
  const out: Record<string, SkillState> = {};
  for (const s of ALL_SKILLS.filter((x) => x.level === level)) out[s.id] = { ...newSkillState(s.id), mastery, attempts };
  return out;
}

function input(over: Partial<PlannerInput> = {}): PlannerInput {
  return { skills: {}, items: {}, mistakes: [], now: T0, size: 14, rng: createRng('plan'), level: 'B1', audio: true, ...over };
}

describe('étapes', () => {
  it('seule l’étape A2 → B1 est ouverte au départ ; le XP seul ne suffit pas', () => {
    const st = stageStates(profile({ totalXp: 100000 }), {}, T0);
    expect(st.find((s) => s.id === 'a2b1')?.unlocked).toBe(true);
    expect(st.find((s) => s.id === 'b1b2')?.unlocked).toBe(false);
  });

  it('une évaluation de fin de niveau réussie ou le test de niveau ouvrent l’étape suivante', () => {
    expect(unlockedStages(profile({ levelsPassed: ['B1'] }), {}, T0).has('b1b2')).toBe(true);
    expect(unlockedStages(profile({ placementLevel: 'B1' }), {}, T0).has('b1b2')).toBe(true);
    // B2− = entrée dans le B2 : ouvre B1 → B2, pas B2 → C1
    const u = unlockedStages(profile({ placementLevel: 'B2−' }), {}, T0);
    expect(u.has('b1b2')).toBe(true);
    expect(u.has('b2c1')).toBe(false);
    expect(unlockedStages(profile({ placementLevel: 'B1−' }), {}, T0).has('b1b2')).toBe(false);
  });

  it("critères de préparation : couverture, maîtrise et domaine le plus faible", () => {
    expect(readinessFor('B1', {}, T0).ready).toBe(false);
    const all = { ...masteredLevel('B1'), ...masteredLevel('A2') };
    const r = readinessFor('B1', all, T0);
    expect(r.ready).toBe(true);
    expect(r.coverage).toBe(1);
  });

  it('les compétences d’une étape fermée sont verrouillées et absentes du parcours guidé', () => {
    const done: Record<string, SkillState> = {};
    for (const s of ALL_SKILLS.filter((x) => x.stage === 'a2b1')) done[s.id] = { ...newSkillState(s.id), mastery: 0.95, attempts: 20 };
    const next = nextGuidedSkill(done, T0, new Set(['a2b1']));
    expect(SKILL_BY_ID[next].stage).toBe('a2b1');
    const opened = nextGuidedSkill(done, T0, new Set(['a2b1', 'b1b2']));
    expect(SKILL_BY_ID[opened].stage).toBe('b1b2');
  });

  it('après un test de niveau, le parcours saute les notions validées', () => {
    const placed: Record<string, SkillState> = {};
    for (const s of ALL_SKILLS.filter((x) => x.stage === 'a2b1')) placed[s.id] = { ...newSkillState(s.id), mastery: 0.6, placed: true };
    const next = nextGuidedSkill(placed, T0, new Set(['a2b1', 'b1b2']));
    expect(SKILL_BY_ID[next].stage).toBe('b1b2');
  });
});

describe('estimation du niveau', () => {
  it('au départ : A2−, étape A2 → B1', () => {
    const e = estimateProfile({}, profile(), T0);
    expect(e.label).toBe('A2−');
    expect(e.stage).toBe('a2b1');
    expect(e.domains.grammar.label).toBeNull();
  });

  it('B2 n’est estimé qu’avec des résultats représentatifs au niveau B2', () => {
    const base = { ...masteredLevel('A2'), ...masteredLevel('B1') };
    // B1 solide mais rien en B2 : B1+
    expect(estimateProfile(base, profile({ levelsPassed: ['B1'] }), T0).label).toBe('B1+');
    // maîtrise élevée sur une seule compétence B2 : couverture insuffisante
    const one = { ...base, past_perfect: { ...newSkillState('past_perfect'), mastery: 0.9, attempts: 12 } };
    expect(['B1+', 'B2−']).toContain(estimateProfile(one, profile({ levelsPassed: ['B1'] }), T0).label);
    // B2 travaillé partout : B2 (et B2+ seulement si l’évaluation B2 est réussie)
    const b2 = { ...base, ...masteredLevel('B2') };
    expect(estimateProfile(b2, profile({ levelsPassed: ['B1'] }), T0).label).toBe('B2');
    expect(estimateProfile(b2, profile({ levelsPassed: ['B1', 'B2'] }), T0).label).toBe('B2+');
  });

  it('le test de niveau et les évaluations réussies servent de plancher', () => {
    expect(estimateFloor(profile({ placementLevel: 'B2' }))).toBe('B2');
    expect(estimateProfile({}, profile({ placementLevel: 'B2' }), T0).label).toBe('B2');
  });

  it('profil par domaine : chaque domaine est estimé séparément', () => {
    const skills: Record<string, SkillState> = {};
    for (const s of GRAMMAR_SKILLS) skills[s.id] = { ...newSkillState(s.id), mastery: 0.9, attempts: 10 };
    const e = estimateProfile(skills, profile(), T0);
    expect(e.domains.grammar.label).toBe('B1');
    expect(e.domains.lexis.label).toBeNull();
    expect(levelEvidence('B2', skills, T0).coverage).toBe(0);
  });

  it('les rédactions (auto-évaluées) ne comptent pas dans les preuves de niveau', () => {
    const ev = levelEvidence('B2', { writing_b2: { ...newSkillState('writing_b2'), mastery: 1, attempts: 30 } }, T0);
    expect(ev.mastery).toBe(0);
  });
});

describe('évaluations de fin de niveau', () => {
  it('réussite : 70 % au total et 60 % dans chaque domaine représenté', () => {
    const ok = gateOutcome({ past_perfect: { total: 10, correct: 8 }, vocab_colloc_b2: { total: 5, correct: 4 }, reading_b2: { total: 6, correct: 5 } });
    expect(ok.passed).toBe(true);
    const weak = gateOutcome({ past_perfect: { total: 10, correct: 10 }, vocab_colloc_b2: { total: 5, correct: 2 }, reading_b2: { total: 6, correct: 6 } });
    expect(weak.overall).toBeGreaterThan(0.7);
    expect(weak.passed).toBe(false);
    expect(weak.weakDomains).toEqual(['lexis']);
  });

  it('chaque niveau avancé a une évaluation de fin de niveau et deux examens blancs', () => {
    for (const lv of ['B2'] as const) {
      const exams = EXAMS.filter((e) => e.level === lv);
      expect(exams.some((e) => e.gate === lv)).toBe(true);
      expect(exams.length).toBeGreaterThanOrEqual(3);
      for (const exam of exams) {
        const plan = planSession('exam', input({ examId: exam.id }));
        expect(plan.length, exam.id).toBeGreaterThanOrEqual(exam.size - 1);
        expect(plan.every((p) => SKILL_BY_ID[p.skillId].level === lv || p.skillId === 'listening'), exam.id).toBe(true);
        const domains = new Set(plan.map((p) => SKILL_BY_ID[p.skillId].domain));
        if (exam.gate) expect(domains.size, exam.id).toBeGreaterThanOrEqual(3);
      }
    }
    expect(EXAMS.find((e) => e.id === 'exam4')?.gate).toBe('B1');
  });

  it('migration : une réussite passée à l’examen blanc 4 valide le niveau B1', () => {
    const bySkill: Record<string, { total: number; correct: number }> = {};
    for (const s of GRAMMAR_SKILLS.slice(0, 30)) bySkill[s.id] = { total: 1, correct: 1 };
    bySkill.reading = { total: 1, correct: 1 };
    bySkill.vocab_travel = { total: 2, correct: 2 };
    const rec: SessionRecord = { id: 'x', mode: 'exam', startedAt: T0, endedAt: T0, total: 33, correct: 33, xp: 0, durationMs: 0, skills: [], bySkill, title: 'Examen blanc 4 — Niveau B1 complet' };
    expect(passedLevelsFromHistory([rec], GATE_TITLES)).toEqual(['B1']);
    const old = { id: 'me', createdAt: T0, placementDone: false, streak: 3, bestStreak: 5, totalXp: 800 } as Profile;
    const m = migrateProfile(old, [rec], (s) => passedLevelsFromHistory(s, GATE_TITLES));
    expect(m.migrated).toBe(true);
    expect(m.profile.levelsPassed).toEqual(['B1']);
    expect(m.profile.totalXp).toBe(800);
    expect(m.profile.dataVersion).toBe(2);
    expect(migrateProfile(m.profile, [], () => []).migrated).toBe(false);
  });
});

describe('planification des étapes avancées', () => {
  it('une rédaction par séance au plus, quelques textes longs seulement', () => {
    expect(maxPerSession('writing_b2')).toBe(1);
    expect(maxPerSession('reading_b2')).toBeLessThanOrEqual(4);
    expect(planSession('practice', input({ focusSkills: ['writing_b2'], size: 14 })).length).toBe(1);
    expect(planSession('practice', input({ focusSkills: ['reading_b2'], size: 14 })).length).toBeLessThanOrEqual(4);
    const guided = planSession('guided', input({ focusSkills: ['reading_b2'], unlocked: new Set(['a2b1', 'b1b2']) }));
    expect(guided.filter((p) => p.skillId === 'reading_b2').length).toBeLessThanOrEqual(3);
    expect(guided.length).toBeGreaterThan(3);
  });

  it('séance guidée B2 : vocabulaire et communication de la même étape', () => {
    const plan = planSession('guided', input({ focusSkills: ['third_conditional'], unlocked: new Set(['a2b1', 'b1b2']) }));
    const vocab = plan.filter((p) => p.reason === 'vocab').map((p) => SKILL_BY_ID[p.skillId]);
    expect(vocab.every((d) => d.stage === 'b1b2')).toBe(true);
    const comm = plan.filter((p) => p.reason === 'comm').map((p) => SKILL_BY_ID[p.skillId]);
    expect(comm.every((d) => d.stage === 'b1b2' && !d.selfAssessed)).toBe(true);
  });

  it('test de niveau : bandes ordonnées et repérées', () => {
    const plan = planSession('placement', input());
    const bands = plan.map((p) => p.band);
    expect(bands[0]).toBe('a2core');
    expect(bands.includes('b2')).toBe(true);
    // les bandes ne s'entremêlent pas
    const order = bands.filter((b, i) => i === 0 || b !== bands[i - 1]);
    expect(new Set(order).size).toBe(order.length);
  });
});
