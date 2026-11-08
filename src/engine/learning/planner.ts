/**
 * Planification des séances : chaque mode compose une liste de « créneaux »
 * (compétence + niveau de difficulté + format éventuel) à partir de l'état
 * de l'apprenant. Tous les modes partagent ce moteur commun.
 */
import type { Rng } from '@/engine/core/rng';
import { ALL_SKILLS, COMM_SKILLS, GRAMMAR_SKILLS, GRAMMAR_UNITS, GUIDED_ORDER, SKILL_BY_ID, VOCAB_SKILLS } from '@/content/curriculum';
import { VOCAB_BY_ID } from '@/content/vocabulary';
import type { ExerciseType } from '@/engine/exercises/types';
import { effectiveMastery, priority, skillStatus } from './mastery';
import { tierFor, type Tier } from './select';
import type { ItemState, MistakeRecord, SessionMode, SkillState } from './types';

export interface PlanSlot {
  skillId: string;
  tier: Tier;
  type?: ExerciseType;
  types?: ExerciseType[];
  reason: 'new' | 'target' | 'review' | 'weak' | 'vocab' | 'mistake' | 'mix' | 'exam' | 'placement' | 'comm';
  mistake?: MistakeRecord;
}

export interface PlannerInput {
  skills: Record<string, SkillState>;
  items: Record<string, ItemState>;
  mistakes: MistakeRecord[];
  now: number;
  size: number;
  rng: Rng;
  level: 'A2' | 'B1';
  audio: boolean;
  focusSkills?: string[];
  focusTypes?: ExerciseType[];
  vocabThemes?: string[];
  examId?: string;
}

export interface ExamDef {
  id: string;
  title: string;
  subtitle: string;
  units: string[];
  size: number;
  level: 'A2' | 'B1';
}

export const EXAMS: ExamDef[] = [
  { id: 'exam1', title: 'Examen blanc 1', subtitle: 'Les bases du niveau A2', units: ['u_present', 'u_past', 'u_questions', 'u_nouns'], size: 24, level: 'A2' },
  { id: 'exam2', title: 'Examen blanc 2', subtitle: 'Niveau A2 complet', units: ['u_present', 'u_past', 'u_questions', 'u_nouns', 'u_compare', 'u_prepositions', 'u_future', 'u_modals'], size: 30, level: 'A2' },
  { id: 'exam3', title: 'Examen blanc 3', subtitle: 'Vers le B1', units: ['u_future', 'u_modals', 'u_perfect', 'u_verbs'], size: 30, level: 'B1' },
  { id: 'exam4', title: 'Examen blanc 4', subtitle: 'Niveau B1 complet', units: GRAMMAR_UNITS.map((u) => u.id), size: 36, level: 'B1' },
];

/** Prochaine compétence du parcours guidé. */
export function nextGuidedSkill(skills: Record<string, SkillState>, now: number): string {
  for (const id of GUIDED_ORDER) {
    const st = skillStatus(id, skills, now);
    if (st === 'available' || st === 'learning') return id;
  }
  // tout est maîtrisé ou à réviser : la compétence la plus prioritaire
  const sorted = [...GUIDED_ORDER].sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
  return sorted[0];
}

function dueSkills(skills: Record<string, SkillState>, now: number): string[] {
  return Object.values(skills)
    .filter((s) => s.card && s.card.reps > 0 && s.card.due <= now)
    .sort((a, b) => (a.card!.due - b.card!.due))
    .map((s) => s.id);
}

function practiced(skills: Record<string, SkillState>): string[] {
  return Object.values(skills)
    .filter((s) => s.attempts > 0)
    .map((s) => s.id);
}

function vocabThemeForSession(input: PlannerInput): string {
  const { items, now, rng } = input;
  const dueByTheme = new Map<string, number>();
  for (const it of Object.values(items)) {
    if (!it.id.startsWith('voc:') || it.card.due > now) continue;
    const theme = VOCAB_BY_ID[it.id]?.theme;
    if (theme) dueByTheme.set(theme, (dueByTheme.get(theme) ?? 0) + 1);
  }
  if (dueByTheme.size) return `vocab_${[...dueByTheme.entries()].sort((a, b) => b[1] - a[1])[0][0]}`;
  const themes = input.vocabThemes?.length ? input.vocabThemes.map((t) => `vocab_${t}`) : VOCAB_SKILLS.filter((s) => input.level === 'B1' || s.level === 'A2').map((s) => s.id);
  // thème le moins travaillé
  return rng.pickWeighted(themes, (id) => 1 / (1 + (input.skills[id]?.attempts ?? 0)));
}

function tierOf(input: PlannerInput, id: string): Tier {
  return tierFor(effectiveMastery(input.skills[id], input.now));
}

/** Entrelace plusieurs listes (A B A C A B…) pour varier les séances. */
function interleave(main: PlanSlot[], others: PlanSlot[]): PlanSlot[] {
  const out: PlanSlot[] = [];
  let i = 0;
  let j = 0;
  while (i < main.length || j < others.length) {
    if (i < main.length) out.push(main[i++]);
    if (i < main.length && out.length % 3 === 1) out.push(main[i++]);
    if (j < others.length) out.push(others[j++]);
  }
  return out;
}

export function planSession(mode: SessionMode, input: PlannerInput): PlanSlot[] {
  const { skills, now, size, rng } = input;
  switch (mode) {
    case 'guided': {
      const target = input.focusSkills?.[0] ?? nextGuidedSkill(skills, now);
      const m = effectiveMastery(skills[target], now);
      const others: PlanSlot[] = [];
      const due = dueSkills(skills, now).filter((id) => id !== target);
      for (const id of due.slice(0, Math.round(size * 0.2))) others.push({ skillId: id, tier: tierOf(input, id), reason: 'review' });
      const weak = practiced(skills)
        .filter((id) => id !== target && !due.includes(id) && SKILL_BY_ID[id]?.kind === 'grammar')
        .sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
      for (const id of weak.slice(0, Math.max(1, Math.round(size * 0.1)))) others.push({ skillId: id, tier: tierOf(input, id), reason: 'weak' });
      const vocab = vocabThemeForSession(input);
      others.push({ skillId: vocab, tier: tierOf(input, vocab), reason: 'vocab' });
      if (size >= 12) others.push({ skillId: rng.pick(COMM_SKILLS.filter((s) => input.audio || s.id !== 'listening')).id, tier: 2, reason: 'comm' });
      // la notion travaillée occupe au moins 60 % de la séance, et complète la séance s'il y a peu de révisions
      const nTarget = Math.max(4, Math.round(size * 0.6), size - others.length);
      const main: PlanSlot[] = [];
      for (let k = 0; k < nTarget; k++) {
        // progression dans la séance : on commence guidé, on finit exigeant
        const base = tierFor(m);
        const tier = (k < 2 ? Math.max(1, base - 1) : k > nTarget * 0.6 ? Math.min(3, base + 1) : base) as Tier;
        main.push({ skillId: target, tier, reason: skills[target]?.attempts ? 'target' : 'new' });
      }
      return interleave(main, others).slice(0, size);
    }
    case 'practice': {
      const focus = input.focusSkills?.length ? input.focusSkills : [nextGuidedSkill(skills, now)];
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        const id = focus[k % focus.length];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'mix', types: input.focusTypes });
      }
      return focus.length > 1 ? rng.shuffle(out) : out;
    }
    case 'adaptive': {
      const pool = practiced(skills).filter((id) => SKILL_BY_ID[id]);
      const available = GUIDED_ORDER.filter((id) => skillStatus(id, skills, now) === 'available');
      if (pool.length < 3) pool.push(...available.slice(0, 3 - pool.length));
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        if (k % 6 === 5) {
          const v = vocabThemeForSession(input);
          out.push({ skillId: v, tier: tierOf(input, v), reason: 'vocab' });
          continue;
        }
        const id = rng.pickWeighted(pool, (sid) => 0.15 + priority(skills[sid], now) ** 2);
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'weak' });
      }
      return out;
    }
    case 'review': {
      const due = dueSkills(skills, now).filter((id) => SKILL_BY_ID[id]?.kind !== 'vocab');
      const weak = practiced(skills)
        .filter((id) => !due.includes(id) && SKILL_BY_ID[id]?.kind === 'grammar')
        .sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
      const ids = [...due, ...weak];
      if (!ids.length) ids.push(nextGuidedSkill(skills, now));
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        const id = ids[k % Math.min(ids.length, Math.max(3, Math.ceil(size / 3)))];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'review' });
      }
      return rng.shuffle(out);
    }
    case 'vocab': {
      const themes = input.vocabThemes?.length ? input.vocabThemes.map((t) => `vocab_${t}`) : null;
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        const id = themes ? themes[k % themes.length] : vocabThemeForSession({ ...input, rng });
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'vocab' });
      }
      return out;
    }
    case 'mistakes': {
      const ms = [...input.mistakes].sort((a, b) => b.ts - a.ts);
      const out: PlanSlot[] = [];
      for (const m of ms.slice(0, Math.ceil(size * 0.6))) out.push({ skillId: m.skillId, tier: 2, reason: 'mistake', mistake: m });
      // exercices neufs sur les mêmes compétences fragiles
      const skillsWithErrors = Object.values(skills)
        .filter((s) => Object.keys(s.errors).length > 0 || s.mastery < 0.5)
        .filter((s) => s.attempts > 0)
        .sort((a, b) => priority(b, now) - priority(a, now))
        .map((s) => s.id);
      const fresh = skillsWithErrors.length ? skillsWithErrors : ms.map((m) => m.skillId);
      while (out.length < size && fresh.length) {
        const id = fresh[out.length % fresh.length];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'weak' });
      }
      return rng.shuffle(out);
    }
    case 'daily': {
      const pool = practiced(skills).filter((id) => SKILL_BY_ID[id]?.kind === 'grammar');
      const base = pool.length >= 4 ? pool : GUIDED_ORDER.slice(0, 6);
      const out: PlanSlot[] = [];
      for (let k = 0; k < 10; k++) {
        const id = rng.pick(base);
        out.push({ skillId: id, tier: (k < 3 ? 1 : k < 7 ? 2 : 3) as Tier, reason: 'mix' });
      }
      out.push({ skillId: vocabThemeForSession(input), tier: 2, reason: 'vocab' });
      out.push({ skillId: rng.pick(COMM_SKILLS.filter((s) => input.audio || s.id !== 'listening')).id, tier: 2, reason: 'comm' });
      return out;
    }
    case 'exam': {
      const exam = EXAMS.find((e) => e.id === input.examId) ?? EXAMS[0];
      const ids = GRAMMAR_SKILLS.filter((s) => exam.units.includes(s.unit)).map((s) => s.id);
      const out: PlanSlot[] = [];
      const grammarCount = exam.size - 4 - (input.audio ? 1 : 0);
      const shuffled = rng.shuffle(ids);
      for (let k = 0; k < grammarCount; k++) {
        out.push({ skillId: shuffled[k % shuffled.length], tier: (k % 3 === 0 ? 3 : 2) as Tier, reason: 'exam', types: ['cloze', 'mcq', 'errorCorrection', 'transformation', 'translateFrEn', 'conjugation', 'contextChoice', 'wordOrder', 'translateEnFr'] });
      }
      const vocabSkills = VOCAB_SKILLS.filter((s) => exam.level === 'B1' || s.level === 'A2');
      for (let k = 0; k < 2; k++) out.push({ skillId: rng.pick(vocabSkills).id, tier: 2, reason: 'exam', types: ['mcq', 'contextChoice', 'cloze', 'translateFrEn'] });
      out.push({ skillId: 'reading', tier: 2, reason: 'exam' });
      out.push({ skillId: 'dialogues', tier: 2, reason: 'exam' });
      if (input.audio) out.push({ skillId: 'listening', tier: 2, reason: 'exam' });
      return rng.shuffle(out);
    }
    case 'placement': {
      return PLACEMENT_BANDS.flatMap((band) => band.skills.map((id) => ({ skillId: id, tier: 2 as Tier, reason: 'placement' as const, types: ['mcq', 'cloze', 'contextChoice'] as ExerciseType[] })));
    }
    case 'sprint': {
      const pool = practiced(skills).filter((id) => SKILL_BY_ID[id]?.kind === 'grammar');
      const base = pool.length >= 3 ? pool : GUIDED_ORDER.slice(0, 5);
      const out: PlanSlot[] = [];
      for (let k = 0; k < 40; k++) {
        const id = rng.pick(base);
        out.push({ skillId: id, tier: 1, reason: 'mix', types: ['mcq', 'contextChoice', 'translateEnFr'] });
      }
      return out;
    }
    default:
      return [];
  }
}

/** Bandes du test de niveau (de A2 vers B1). */
export const PLACEMENT_BANDS: { id: string; label: string; skills: string[] }[] = [
  { id: 'a2core', label: 'A2 (bases)', skills: ['present_simple', 'present_continuous', 'past_simple_irregular', 'articles', 'comparatives', 'can_could'] },
  { id: 'a2plus', label: 'A2 (consolidé)', skills: ['past_continuous', 'going_to', 'countable_quantifiers', 'prepositions_time', 'should', 'wh_questions'] },
  { id: 'b1', label: 'B1', skills: ['pp_for_since', 'first_conditional', 'second_conditional', 'gerund_infinitive', 'relative_clauses', 'passive'] },
];

/**
 * Résultat du test de niveau : niveau estimé et maîtrises initiales
 * (les compétences réussies sont considérées comme partiellement acquises).
 */
export function placementResult(scores: Record<string, { correct: number; total: number }>): { level: string; priors: Record<string, number> } {
  const rate = (band: string) => {
    const b = PLACEMENT_BANDS.find((x) => x.id === band)!;
    let c = 0;
    let t = 0;
    for (const id of b.skills) {
      c += scores[id]?.correct ?? 0;
      t += scores[id]?.total ?? 0;
    }
    return t ? c / t : 0;
  };
  const a2 = rate('a2core');
  const a2p = rate('a2plus');
  const b1 = rate('b1');
  let level = 'A2−';
  if (a2 >= 0.6) level = 'A2';
  if (a2 >= 0.6 && a2p >= 0.6) level = 'A2+';
  if (a2 >= 0.6 && a2p >= 0.6 && b1 >= 0.5) level = 'B1−';
  if (a2 >= 0.8 && a2p >= 0.8 && b1 >= 0.8) level = 'B1';
  const priors: Record<string, number> = {};
  const unitsA2Core = ['u_present', 'u_past', 'u_questions', 'u_nouns'];
  const unitsA2Plus = ['u_compare', 'u_prepositions', 'u_future', 'u_modals'];
  for (const s of GRAMMAR_SKILLS) {
    if (a2 >= 0.6 && unitsA2Core.includes(s.unit) && s.level === 'A2') priors[s.id] = 0.45 + 0.2 * a2;
    if (a2p >= 0.6 && unitsA2Plus.includes(s.unit) && s.level === 'A2') priors[s.id] = 0.4 + 0.2 * a2p;
    if (b1 >= 0.6 && s.level === 'B1') priors[s.id] = 0.25 + 0.2 * b1;
  }
  // les compétences testées reçoivent leur score réel
  for (const [id, sc] of Object.entries(scores)) {
    if (sc.total) priors[id] = Math.max(priors[id] ?? 0, Math.min(0.7, (sc.correct / sc.total) * 0.7));
  }
  return { level, priors };
}

export { ALL_SKILLS };
