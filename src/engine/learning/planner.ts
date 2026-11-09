/**
 * Planification des séances : chaque mode compose une liste de « créneaux »
 * (compétence + niveau de difficulté + format éventuel) à partir de l'état
 * de l'apprenant. Tous les modes partagent ce moteur commun.
 *
 * Étapes : seules les compétences des étapes ouvertes sont proposées par le
 * parcours guidé et les modes automatiques ; les autres restent accessibles
 * en entraînement libre.
 */
import type { Rng } from '@/engine/core/rng';
import { ALL_SKILLS, COMM_SKILLS, GRAMMAR_SKILLS, GRAMMAR_UNITS, GUIDED_ORDER, SKILL_BY_ID, VOCAB_SKILLS, type SkillDef } from '@/content/curriculum';
import { LEVEL_RANK, type CefrLevel, type StageId } from '@/content/levels';
import { VOCAB_BY_ID } from '@/content/vocabulary';
import type { ExerciseType } from '@/engine/exercises/types';
import { effectiveMastery, priority, skillStatus } from './mastery';
import { tierFor, type Tier } from './select';
import { SPECIAL_ENGINES } from './advancedSkills';
import type { ItemState, MistakeRecord, SessionMode, SkillState } from './types';

export interface PlanSlot {
  skillId: string;
  tier: Tier;
  type?: ExerciseType;
  types?: ExerciseType[];
  reason: 'new' | 'target' | 'review' | 'weak' | 'vocab' | 'mistake' | 'mix' | 'exam' | 'placement' | 'comm';
  mistake?: MistakeRecord;
  /** Bande du test de niveau (arrêt adaptatif). */
  band?: string;
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
  /** Étapes ouvertes (par défaut : A2 → B1 seulement). */
  unlocked?: ReadonlySet<StageId>;
}

/** Partie d'un examen avancé : un tirage dans un ensemble de compétences. */
export interface ExamPart {
  skills: string[];
  count: number;
  types?: ExerciseType[];
  tier?: Tier;
  audioOnly?: boolean;
}

export interface ExamDef {
  id: string;
  title: string;
  subtitle: string;
  /** Unités de grammaire (examens A2 → B1). */
  units: string[];
  size: number;
  level: CefrLevel;
  /** Évaluation de fin de niveau : sa réussite valide ce niveau. */
  gate?: CefrLevel;
  /** Composition (examens avancés). */
  parts?: ExamPart[];
  /** Ce que l'examen évalue (affichage). */
  covers?: string;
}

const LANGUAGE_TYPES: ExerciseType[] = ['cloze', 'mcq', 'errorCorrection', 'transformation', 'keyword', 'contextChoice', 'translateEnFr', 'nuance'];
const VOCAB_EXAM_TYPES: ExerciseType[] = ['mcq', 'contextChoice', 'cloze', 'translateFrEn'];

const ids = (level: CefrLevel, pred: (s: SkillDef) => boolean) => ALL_SKILLS.filter((s) => s.level === level && pred(s)).map((s) => s.id);
const grammarOf = (level: CefrLevel) => ids(level, (s) => s.kind === 'grammar' && s.domain === 'grammar');
const lexisOf = (level: CefrLevel) => ids(level, (s) => s.domain === 'lexis');
const engineSkills = (level: CefrLevel, type: ExerciseType) => ids(level, (s) => !!SPECIAL_ENGINES[s.id]?.formats.includes(type));

function advancedExams(level: 'B2' | 'C1' | 'C2'): ExamDef[] {
  const lower = level.toLowerCase();
  const name = level;
  return [
    {
      id: `${lower}_language`,
      title: `Examen blanc ${name} · Langue`,
      subtitle: 'Grammaire, lexique et reformulation',
      units: [],
      size: 24,
      level,
      covers: 'Structures, collocations, reformulation avec mot imposé, nuances.',
      parts: [
        { skills: grammarOf(level), count: 16, types: LANGUAGE_TYPES, tier: 3 },
        { skills: lexisOf(level), count: 8, types: [...VOCAB_EXAM_TYPES, 'nuance', 'cloze', 'mcq'], tier: 2 },
      ],
    },
    {
      id: `${lower}_skills`,
      title: `Examen blanc ${name} · Compréhension`,
      subtitle: 'Textes, arguments, dialogues, registre',
      units: [],
      size: 10,
      level,
      covers: 'Textes longs, argumentation, dialogues, registre et implicite.',
      parts: [
        { skills: engineSkills(level, 'longReading'), count: 2, types: ['longReading'] },
        { skills: engineSkills(level, 'argument'), count: 2, types: ['argument', 'textOrder'] },
        { skills: engineSkills(level, 'dialogueAnalysis'), count: 2, types: ['dialogueAnalysis'] },
        { skills: [...engineSkills(level, 'register'), ...engineSkills(level, 'implicature'), ...engineSkills(level, 'styleEdit')], count: 3, types: ['register', 'implicature', 'styleEdit', 'nuance'] },
        { skills: ['listening'], count: 1, audioOnly: true },
      ],
    },
    {
      id: `${lower}_final`,
      title: `Évaluation de fin de niveau ${name}`,
      subtitle: `Valide le niveau ${name} et ouvre l'étape suivante`,
      units: [],
      size: 26,
      level,
      gate: level,
      covers: 'Tous les domaines évalués de façon fiable : au moins 70 % au total et 60 % par domaine.',
      parts: [
        { skills: grammarOf(level), count: 11, types: LANGUAGE_TYPES, tier: 3 },
        { skills: lexisOf(level), count: 6, types: [...VOCAB_EXAM_TYPES, 'nuance'], tier: 2 },
        { skills: [...engineSkills(level, 'longReading'), ...engineSkills(level, 'argument')], count: 3, types: ['longReading', 'argument', 'textOrder'] },
        { skills: [...engineSkills(level, 'register'), ...engineSkills(level, 'implicature'), ...engineSkills(level, 'styleEdit')], count: 3, types: ['register', 'implicature', 'styleEdit', 'nuance'] },
        { skills: engineSkills(level, 'dialogueAnalysis'), count: 3, types: ['dialogueAnalysis', 'implicature'] },
      ],
    },
  ];
}

export const EXAMS: ExamDef[] = [
  { id: 'exam1', title: 'Examen blanc 1', subtitle: 'Les bases du niveau A2', units: ['u_present', 'u_past', 'u_questions', 'u_nouns'], size: 24, level: 'A2' },
  { id: 'exam2', title: 'Examen blanc 2', subtitle: 'Niveau A2 complet', units: ['u_present', 'u_past', 'u_questions', 'u_nouns', 'u_compare', 'u_prepositions', 'u_future', 'u_modals'], size: 30, level: 'A2' },
  { id: 'exam3', title: 'Examen blanc 3', subtitle: 'Vers le B1', units: ['u_future', 'u_modals', 'u_perfect', 'u_verbs'], size: 30, level: 'B1' },
  { id: 'exam4', title: 'Examen blanc 4', subtitle: 'Niveau B1 complet · évaluation de fin de niveau B1', units: GRAMMAR_UNITS.map((u) => u.id), size: 36, level: 'B1', gate: 'B1' },
  ...(['B2', 'C1', 'C2'] as const).flatMap(advancedExams).filter((e) => e.parts!.some((p) => p.skills.length > 0 && !p.audioOnly)),
];

/** Titres des évaluations de fin de niveau (retrouver les réussites dans l'historique). */
export const GATE_TITLES: Record<string, CefrLevel> = Object.fromEntries(EXAMS.filter((e) => e.gate).map((e) => [e.title, e.gate!]));

/** Nombre maximal d'exercices d'une compétence longue dans une séance. */
export function maxPerSession(skillId: string): number {
  const def = SKILL_BY_ID[skillId];
  if (def?.selfAssessed) return 1;
  const formats = SPECIAL_ENGINES[skillId]?.formats ?? [];
  if (formats.some((f) => f === 'longReading' || f === 'argument' || f === 'dialogueAnalysis')) return 4;
  return Infinity;
}

const BASE_STAGES: ReadonlySet<StageId> = new Set(['a2b1']);

function isOpen(id: string, unlocked: ReadonlySet<StageId>): boolean {
  const def = SKILL_BY_ID[id];
  return !def || unlocked.has(def.stage);
}

/** Compétence considérée comme acquise par le test de niveau (pas encore travaillée). */
function validatedByPlacement(s: SkillState | undefined, now: number): boolean {
  return !!s?.placed && s.attempts === 0 && effectiveMastery(s, now) >= 0.5;
}

/** Prochaine compétence du parcours guidé. */
export function nextGuidedSkill(skills: Record<string, SkillState>, now: number, unlocked: ReadonlySet<StageId> = BASE_STAGES): string {
  const order = GUIDED_ORDER.filter((id) => isOpen(id, unlocked));
  for (const id of order) {
    if (validatedByPlacement(skills[id], now)) continue;
    const st = skillStatus(id, skills, now, unlocked);
    if (st === 'available' || st === 'learning') return id;
  }
  // tout est maîtrisé ou à réviser : la compétence la plus prioritaire
  const sorted = [...order].sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
  return sorted[0];
}

function dueSkills(skills: Record<string, SkillState>, now: number): string[] {
  return Object.values(skills)
    .filter((s) => s.card && s.card.reps > 0 && s.card.due <= now && !SKILL_BY_ID[s.id]?.selfAssessed)
    .sort((a, b) => a.card!.due - b.card!.due)
    .map((s) => s.id);
}

function practiced(skills: Record<string, SkillState>): string[] {
  return Object.values(skills)
    .filter((s) => s.attempts > 0 && !SKILL_BY_ID[s.id]?.selfAssessed)
    .map((s) => s.id);
}

/** Thème de vocabulaire de la séance (thèmes avancés quand l'étape correspondante est ouverte). */
function vocabThemeForSession(input: PlannerInput, stage?: StageId): string {
  const { items, now, rng } = input;
  const unlocked = input.unlocked ?? BASE_STAGES;
  const dueByTheme = new Map<string, number>();
  for (const it of Object.values(items)) {
    if (!it.id.startsWith('voc:') || it.card.due > now) continue;
    const theme = VOCAB_BY_ID[it.id]?.theme;
    if (theme && isOpen(`vocab_${theme}`, unlocked)) dueByTheme.set(theme, (dueByTheme.get(theme) ?? 0) + 1);
  }
  if (dueByTheme.size) return `vocab_${[...dueByTheme.entries()].sort((a, b) => b[1] - a[1])[0][0]}`;
  let themes: string[];
  if (input.vocabThemes?.length) themes = input.vocabThemes.map((t) => `vocab_${t}`);
  else if (stage && stage !== 'a2b1') themes = ALL_SKILLS.filter((s) => s.kind === 'vocab' && s.stage === stage).map((s) => s.id);
  else themes = VOCAB_SKILLS.filter((s) => input.level === 'B1' || s.level === 'A2').map((s) => s.id);
  if (!themes.length) themes = VOCAB_SKILLS.map((s) => s.id);
  // thème le moins travaillé
  return rng.pickWeighted(themes, (id) => 1 / (1 + (input.skills[id]?.attempts ?? 0)));
}

/** Compétence de communication courte pour compléter une séance de l'étape. */
function commSkillForStage(input: PlannerInput, stage: StageId): string {
  if (stage === 'a2b1') return input.rng.pick(COMM_SKILLS.filter((s) => input.audio || s.id !== 'listening')).id;
  const pool = ALL_SKILLS.filter((s) => s.stage === stage && s.kind === 'function' && !s.selfAssessed).map((s) => s.id);
  return pool.length ? input.rng.pickWeighted(pool, (id) => 1 / (1 + (input.skills[id]?.attempts ?? 0))) : COMM_SKILLS[0].id;
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

/** Plafond réduit pour les modes de révision (deux textes longs au plus). */
function shortCap(id: string): number {
  const m = maxPerSession(id);
  return m === Infinity ? m : Math.min(2, m);
}

/** Limite le nombre de créneaux des compétences longues (rédaction, textes longs). */
function capLong(plan: PlanSlot[], perSession = (id: string) => maxPerSession(id)): PlanSlot[] {
  const count = new Map<string, number>();
  return plan.filter((p) => {
    if (p.mistake) return true;
    const n = (count.get(p.skillId) ?? 0) + 1;
    count.set(p.skillId, n);
    return n <= perSession(p.skillId);
  });
}

export function planSession(mode: SessionMode, input: PlannerInput): PlanSlot[] {
  const { skills, now, size, rng } = input;
  const unlocked = input.unlocked ?? BASE_STAGES;
  switch (mode) {
    case 'guided': {
      const target = input.focusSkills?.[0] ?? nextGuidedSkill(skills, now, unlocked);
      const stage = SKILL_BY_ID[target]?.stage ?? 'a2b1';
      const m = effectiveMastery(skills[target], now);
      const others: PlanSlot[] = [];
      const due = dueSkills(skills, now).filter((id) => id !== target && isOpen(id, unlocked));
      for (const id of due.slice(0, Math.round(size * 0.2))) others.push({ skillId: id, tier: tierOf(input, id), reason: 'review' });
      const weak = practiced(skills)
        .filter((id) => id !== target && !due.includes(id) && SKILL_BY_ID[id]?.kind === 'grammar' && isOpen(id, unlocked))
        .sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
      for (const id of weak.slice(0, Math.max(1, Math.round(size * 0.1)))) others.push({ skillId: id, tier: tierOf(input, id), reason: 'weak' });
      const vocab = target.startsWith('vocab_') ? null : vocabThemeForSession(input, stage);
      if (vocab) others.push({ skillId: vocab, tier: tierOf(input, vocab), reason: 'vocab' });
      if (size >= 12 && SKILL_BY_ID[target]?.kind !== 'function') others.push({ skillId: commSkillForStage(input, stage), tier: 2, reason: 'comm' });
      // compétence longue (texte, rédaction) : peu d'exercices, complétés par des révisions de l'étape
      const cap = maxPerSession(target);
      if (cap !== Infinity) {
        const main: PlanSlot[] = Array.from({ length: Math.min(cap, cap === 1 ? 1 : 3) }, () => ({ skillId: target, tier: tierFor(m), reason: skills[target]?.attempts ? ('target' as const) : ('new' as const) }));
        const fill = ALL_SKILLS.filter((s) => s.stage === stage && s.kind === 'grammar' && isOpen(s.id, unlocked) && (skills[s.id]?.attempts ?? 0) > 0).map((s) => s.id);
        const extra: PlanSlot[] = [];
        for (let k = 0; extra.length + others.length + main.length < Math.min(size, 8) && k < 8; k++) {
          const id = fill.length ? rng.pick(fill) : vocab ?? vocabThemeForSession(input, stage);
          extra.push({ skillId: id, tier: tierOf(input, id), reason: 'review' });
        }
        return capLong(interleave(main, [...others, ...extra])).slice(0, size);
      }
      // la notion travaillée occupe au moins 60 % de la séance, et complète la séance s'il y a peu de révisions
      const nTarget = Math.max(4, Math.round(size * 0.6), size - others.length);
      const main: PlanSlot[] = [];
      for (let k = 0; k < nTarget; k++) {
        // progression dans la séance : on commence guidé, on finit exigeant
        const base = tierFor(m);
        const tier = (k < 2 ? Math.max(1, base - 1) : k > nTarget * 0.6 ? Math.min(3, base + 1) : base) as Tier;
        main.push({ skillId: target, tier, reason: skills[target]?.attempts ? 'target' : 'new' });
      }
      return capLong(interleave(main, others)).slice(0, size);
    }
    case 'practice': {
      const focus = input.focusSkills?.length ? input.focusSkills : [nextGuidedSkill(skills, now, unlocked)];
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        const id = focus[k % focus.length];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'mix', types: input.focusTypes });
      }
      return capLong(focus.length > 1 ? rng.shuffle(out) : out);
    }
    case 'adaptive': {
      const pool = practiced(skills).filter((id) => SKILL_BY_ID[id] && isOpen(id, unlocked));
      const available = GUIDED_ORDER.filter((id) => isOpen(id, unlocked) && skillStatus(id, skills, now, unlocked) === 'available');
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
      return capLong(out, shortCap);
    }
    case 'review': {
      const due = dueSkills(skills, now).filter((id) => SKILL_BY_ID[id]?.kind !== 'vocab');
      const weak = practiced(skills)
        .filter((id) => !due.includes(id) && SKILL_BY_ID[id]?.kind === 'grammar')
        .sort((a, b) => priority(skills[b], now) - priority(skills[a], now));
      const pool = [...due, ...weak];
      if (!pool.length) pool.push(nextGuidedSkill(skills, now, unlocked));
      const out: PlanSlot[] = [];
      for (let k = 0; k < size; k++) {
        const id = pool[k % Math.min(pool.length, Math.max(3, Math.ceil(size / 3)))];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'review' });
      }
      return capLong(rng.shuffle(out), shortCap);
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
        .filter((s) => s.attempts > 0 && !SKILL_BY_ID[s.id]?.selfAssessed)
        .sort((a, b) => priority(b, now) - priority(a, now))
        .map((s) => s.id);
      const fresh = skillsWithErrors.length ? skillsWithErrors : ms.map((m) => m.skillId);
      while (out.length < size && fresh.length) {
        const id = fresh[out.length % fresh.length];
        out.push({ skillId: id, tier: tierOf(input, id), reason: 'weak' });
      }
      return capLong(rng.shuffle(out), shortCap);
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
      if (exam.parts) return planAdvancedExam(exam, input);
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
      // les bandes restent dans l'ordre : le test s'arrête dès qu'une bande est nettement échouée
      return PLACEMENT_BANDS.flatMap((band) =>
        band.skills.map((id) => ({ skillId: id, tier: 2 as Tier, reason: 'placement' as const, types: band.types ?? (['mcq', 'cloze', 'contextChoice'] as ExerciseType[]), band: band.id })),
      );
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

function planAdvancedExam(exam: ExamDef, input: PlannerInput): PlanSlot[] {
  const { rng } = input;
  const out: PlanSlot[] = [];
  for (const part of exam.parts ?? []) {
    if (part.audioOnly && !input.audio) continue;
    if (!part.skills.length) continue;
    const pool = rng.shuffle(part.skills);
    for (let k = 0; k < part.count; k++) {
      out.push({ skillId: pool[k % pool.length], tier: part.tier ?? 2, reason: 'exam', types: part.types });
    }
  }
  return rng.shuffle(out);
}

/** Bandes du test de niveau, du plus simple au plus avancé. */
export interface PlacementBand {
  id: string;
  label: string;
  level: CefrLevel;
  skills: string[];
  types?: ExerciseType[];
}

export const PLACEMENT_BANDS: PlacementBand[] = [
  { id: 'a2core', label: 'A2 (bases)', level: 'A2', skills: ['present_simple', 'present_continuous', 'past_simple_irregular', 'articles', 'comparatives', 'can_could'] },
  { id: 'a2plus', label: 'A2 (consolidé)', level: 'A2', skills: ['past_continuous', 'going_to', 'countable_quantifiers', 'prepositions_time', 'should', 'wh_questions'] },
  { id: 'b1', label: 'B1', level: 'B1', skills: ['pp_for_since', 'first_conditional', 'second_conditional', 'gerund_infinitive', 'relative_clauses', 'passive'] },
  { id: 'b2', label: 'B2', level: 'B2', skills: ['third_conditional', 'modals_past', 'passive_advanced', 'wish_if_only', 'vocab_colloc_b2', 'register_b2'], types: ['mcq', 'cloze', 'contextChoice', 'nuance', 'register'] },
];

/** Score minimal d'une bande pour poursuivre le test. */
export const PLACEMENT_CONTINUE = 0.5;

/**
 * Résultat du test de niveau : niveau estimé et maîtrises initiales
 * (les compétences réussies sont considérées comme partiellement acquises).
 */
export function placementResult(scores: Record<string, { correct: number; total: number }>): { level: string; priors: Record<string, number> } {
  const rate = (band: string) => {
    const b = PLACEMENT_BANDS.find((x) => x.id === band);
    if (!b) return 0;
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
  // au-delà du B1 : chaque bande avancée réussie fait progresser l'estimation
  const advanced: { band: string; level: CefrLevel }[] = [
    { band: 'b2', level: 'B2' },
    { band: 'c1', level: 'C1' },
    { band: 'c2', level: 'C2' },
  ];
  const rates: Partial<Record<CefrLevel, number>> = {};
  if (level === 'B1') {
    for (const a of advanced) {
      if (!PLACEMENT_BANDS.some((b) => b.id === a.band)) break;
      const r = rate(a.band);
      rates[a.level] = r;
      if (r >= 0.75) level = a.level;
      else {
        if (r >= 0.5) level = `${a.level}−`;
        break;
      }
    }
  }
  const priors: Record<string, number> = {};
  const unitsA2Core = ['u_present', 'u_past', 'u_questions', 'u_nouns'];
  const unitsA2Plus = ['u_compare', 'u_prepositions', 'u_future', 'u_modals'];
  for (const s of GRAMMAR_SKILLS) {
    if (a2 >= 0.6 && unitsA2Core.includes(s.unit) && s.level === 'A2') priors[s.id] = 0.45 + 0.2 * a2;
    if (a2p >= 0.6 && unitsA2Plus.includes(s.unit) && s.level === 'A2') priors[s.id] = 0.4 + 0.2 * a2p;
    if (b1 >= 0.6 && s.level === 'B1') priors[s.id] = 0.25 + 0.2 * b1;
  }
  for (const [lv, r] of Object.entries(rates) as [CefrLevel, number][]) {
    if (r < 0.6) continue;
    for (const s of ALL_SKILLS) if (s.level === lv && !s.selfAssessed && LEVEL_RANK[s.level] >= 2) priors[s.id] = 0.25 + 0.3 * r;
  }
  // les compétences testées reçoivent leur score réel
  for (const [id, sc] of Object.entries(scores)) {
    if (sc.total) priors[id] = Math.max(priors[id] ?? 0, Math.min(0.7, (sc.correct / sc.total) * 0.7));
  }
  return { level, priors };
}

export { ALL_SKILLS };
