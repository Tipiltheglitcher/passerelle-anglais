/**
 * Progression A2 → C2 : déblocage des étapes, estimation du niveau par
 * domaine et critères de passage.
 *
 * Principes :
 *  - une étape avancée ne s'ouvre pas avec de l'XP, mais avec un résultat
 *    représentatif : évaluation de fin de niveau réussie (au moins 70 % au
 *    total et 60 % dans chaque domaine suffisamment représenté), ou test de
 *    niveau qui situe l'apprenant au-delà ;
 *  - une estimation de niveau exige des preuves : une proportion suffisante
 *    des compétences du niveau doit avoir été travaillée plusieurs fois ;
 *  - les productions libres (rédaction), évaluées partiellement, n'entrent
 *    pas dans les critères de passage ;
 *  - les résultats restent des estimations pédagogiques, pas une certification.
 */
import { ALL_SKILLS, SKILL_BY_ID, type SkillDef } from '@/content/curriculum';
import { CEFR_LEVELS, DOMAINS, LEVEL_RANK, STAGES, type CefrLevel, type Domain, type StageId } from '@/content/levels';
import { effectiveMastery } from './mastery';
import type { Profile, SessionRecord, SkillState } from './types';

/** Échelle ordonnée des libellés d'estimation. */
export const LEVEL_LABELS = ['A2−', 'A2', 'A2+', 'B1−', 'B1', 'B1+', 'B2−', 'B2', 'B2+', 'C1−', 'C1', 'C1+', 'C2−', 'C2'] as const;
export type LevelLabel = (typeof LEVEL_LABELS)[number];

export function labelRank(label: string | undefined): number {
  if (!label) return -1;
  const i = (LEVEL_LABELS as readonly string[]).indexOf(label);
  return i;
}

/** Niveau « plein » (sans −) atteint par un libellé : B2+ → B2, B2− → B1. */
export function solidLevel(label: string | undefined): CefrLevel | null {
  const r = labelRank(label);
  if (r < 0) return null;
  const l = LEVEL_LABELS[r];
  const base = l.slice(0, 2) as CefrLevel;
  if (l.endsWith('−')) {
    const prev = CEFR_LEVELS[LEVEL_RANK[base] - 1];
    return prev ?? null;
  }
  return base;
}

/** Compétences évaluées de façon fiable (hors productions libres auto-évaluées). */
export function objectiveSkills(level: CefrLevel, domain?: Domain): SkillDef[] {
  return ALL_SKILLS.filter((s) => s.level === level && !s.selfAssessed && (!domain || s.domain === domain));
}

const DOMAIN_WEIGHTS: Record<Domain, number> = { grammar: 0.35, lexis: 0.25, written: 0.25, oral: 0.15 };

const MIN_ATTEMPTS = 4;

export interface LevelEvidence {
  level: CefrLevel;
  /** Maîtrise moyenne pondérée par domaine (0–1). */
  mastery: number;
  /** Proportion des compétences travaillées au moins MIN_ATTEMPTS fois. */
  coverage: number;
  byDomain: Partial<Record<Domain, { mastery: number; coverage: number; skills: number }>>;
}

export function levelEvidence(level: CefrLevel, skills: Record<string, SkillState>, now: number): LevelEvidence {
  const byDomain: LevelEvidence['byDomain'] = {};
  let wSum = 0;
  let mSum = 0;
  let covered = 0;
  let total = 0;
  for (const d of DOMAINS) {
    const list = objectiveSkills(level, d);
    if (!list.length) continue;
    const m = list.reduce((a, s) => a + effectiveMastery(skills[s.id], now), 0) / list.length;
    const c = list.filter((s) => (skills[s.id]?.attempts ?? 0) >= MIN_ATTEMPTS).length;
    byDomain[d] = { mastery: m, coverage: c / list.length, skills: list.length };
    wSum += DOMAIN_WEIGHTS[d];
    mSum += DOMAIN_WEIGHTS[d] * m;
    covered += c;
    total += list.length;
  }
  return { level, mastery: wSum ? mSum / wSum : 0, coverage: total ? covered / total : 0, byDomain };
}

// ---------------------------------------------------------------------------
// Évaluations de fin de niveau

export interface GateOutcome {
  passed: boolean;
  overall: number;
  byDomain: Partial<Record<Domain, { total: number; correct: number; rate: number }>>;
  /** Domaines insuffisants (au moins 3 questions et moins de 60 %). */
  weakDomains: Domain[];
}

/** Règle de réussite d'une évaluation de fin de niveau. */
export function gateOutcome(bySkill: Record<string, { total: number; correct: number }>): GateOutcome {
  const byDomain: GateOutcome['byDomain'] = {};
  let t = 0;
  let c = 0;
  for (const [id, sc] of Object.entries(bySkill)) {
    const d = SKILL_BY_ID[id]?.domain;
    if (!d) continue;
    const b = (byDomain[d] ??= { total: 0, correct: 0, rate: 0 });
    b.total += sc.total;
    b.correct += sc.correct;
    t += sc.total;
    c += sc.correct;
  }
  const weakDomains: Domain[] = [];
  for (const [d, b] of Object.entries(byDomain) as [Domain, { total: number; correct: number; rate: number }][]) {
    b.rate = b.total ? b.correct / b.total : 0;
    if (b.total >= 3 && b.rate < 0.6) weakDomains.push(d);
  }
  const overall = t ? c / t : 0;
  return { passed: t > 0 && overall >= 0.7 && weakDomains.length === 0, overall, byDomain, weakDomains };
}

/** Niveaux validés par une évaluation de fin de niveau, retrouvés dans l'historique (migration). */
export function passedLevelsFromHistory(sessions: SessionRecord[], gateTitles: Record<string, CefrLevel>): CefrLevel[] {
  const out = new Set<CefrLevel>();
  for (const s of sessions) {
    if (s.mode !== 'exam' || !s.bySkill) continue;
    const lv = Object.entries(gateTitles).find(([title]) => s.title?.startsWith(title))?.[1];
    if (lv && gateOutcome(s.bySkill).passed) out.add(lv);
  }
  return [...out];
}

// ---------------------------------------------------------------------------
// Étapes

export interface StageState {
  id: StageId;
  unlocked: boolean;
  /** Pourquoi l'étape est ouverte. */
  via: 'base' | 'placement' | 'gate' | null;
  /** L'évaluation de fin de l'étape précédente est-elle conseillée (critères remplis) ? */
  readiness: Readiness | null;
}

export interface Readiness {
  level: CefrLevel;
  coverage: number;
  mastery: number;
  weakestDomain: { domain: Domain; mastery: number } | null;
  ready: boolean;
}

/** Critères indiquant que l'apprenant est prêt à passer l'évaluation de fin de niveau. */
export function readinessFor(level: CefrLevel, skills: Record<string, SkillState>, now: number): Readiness {
  const ev = levelEvidence(level, skills, now);
  let weakest: Readiness['weakestDomain'] = null;
  for (const [d, v] of Object.entries(ev.byDomain) as [Domain, { mastery: number }][]) {
    if (!weakest || v.mastery < weakest.mastery) weakest = { domain: d, mastery: v.mastery };
  }
  const ready = ev.coverage >= 0.7 && ev.mastery >= 0.6 && (!weakest || weakest.mastery >= 0.5);
  return { level, coverage: ev.coverage, mastery: ev.mastery, weakestDomain: weakest, ready };
}

export function stageStates(profile: Profile, skills: Record<string, SkillState>, now: number): StageState[] {
  const passed = new Set(profile.levelsPassed ?? []);
  const placed = solidLevel(profile.placementLevel);
  return STAGES.map((st) => {
    if (st.id === 'a2b1') return { id: st.id, unlocked: true, via: 'base' as const, readiness: null };
    const viaGate = passed.has(st.from) || [...passed].some((l) => LEVEL_RANK[l] > LEVEL_RANK[st.from]);
    const viaPlacement = !!placed && LEVEL_RANK[placed] >= LEVEL_RANK[st.from];
    const unlocked = viaGate || viaPlacement;
    return {
      id: st.id,
      unlocked,
      via: viaGate ? ('gate' as const) : viaPlacement ? ('placement' as const) : null,
      readiness: unlocked ? null : readinessFor(st.from, skills, now),
    };
  });
}

export function unlockedStages(profile: Profile, skills: Record<string, SkillState>, now: number): Set<StageId> {
  return new Set(stageStates(profile, skills, now).filter((s) => s.unlocked).map((s) => s.id));
}

/** Étape en cours : la plus avancée des étapes ouvertes. */
export function currentStage(unlocked: ReadonlySet<StageId>): StageId {
  for (const id of ['c1c2', 'b2c1', 'b1b2'] as StageId[]) if (unlocked.has(id)) return id;
  return 'a2b1';
}

// ---------------------------------------------------------------------------
// Estimation du niveau (profil global et par domaine)

export interface ProfileEstimate {
  /** Libellé global (A2− … C2). */
  label: LevelLabel;
  /** Étape en cours et niveau visé. */
  stage: StageId;
  target: CefrLevel;
  /** Progression dans l'étape en cours (0–1). */
  progress: number;
  description: string;
  /** Niveau estimé par domaine (null : pas assez de résultats). */
  domains: Record<Domain, { label: LevelLabel | null; mastery: number; coverage: number }>;
  /** Preuves réunies pour le niveau visé. */
  evidence: LevelEvidence;
  /** D'où vient le plancher éventuel (test de niveau, évaluation réussie). */
  floor: LevelLabel | null;
  /** Aucun résultat ni test de niveau : le niveau n'est pas encore estimable. */
  undetermined: boolean;
}

const UNDETERMINED_DESCRIPTION = 'Niveau à déterminer : passez le test de niveau ou commencez le parcours, l’estimation se construira à partir de vos réponses.';

const DESCRIPTIONS: Record<string, string> = {
  'A2−': 'Vous consolidez les bases du niveau A2.',
  A2: 'Vous maîtrisez une partie des structures A2 : continuez à les consolider.',
  'A2+': 'Le niveau A2 est solide : vous pouvez aborder les notions B1.',
  'B1−': 'Vous entrez dans le niveau B1.',
  B1: 'Vous utilisez la plupart des structures B1.',
  'B1+': 'Les structures B1 sont bien maîtrisées : visez le B2.',
  'B2−': 'Vous entrez dans le niveau B2 : argumentation, textes longs, hypothèses sur le passé.',
  B2: 'Vous comprenez des textes complexes et nuancez vos propos.',
  'B2+': 'Le B2 est solide : la syntaxe et le lexique du C1 sont à votre portée.',
  'C1−': 'Vous entrez dans le niveau C1 : nuance, style, implicite.',
  C1: 'Vous maîtrisez une langue souple, structurée et précise.',
  'C1+': 'Votre C1 est solide : place aux finesses du C2.',
  'C2−': 'Vous abordez la maîtrise : idiomaticité, ironie, précision stylistique.',
  C2: 'Maîtrise estimée : vous percevez et produisez de fines nuances de sens.',
};

export function legacyLabel(skills: Record<string, SkillState>, now: number): { label: LevelLabel; a2: number; b1: number } {
  const avg = (ids: string[]) => (ids.length ? ids.reduce((acc, id) => acc + effectiveMastery(skills[id], now), 0) / ids.length : 0);
  const a2 = avg(ALL_SKILLS.filter((s) => s.kind === 'grammar' && s.level === 'A2').map((s) => s.id));
  const b1 = avg(ALL_SKILLS.filter((s) => s.kind === 'grammar' && s.level === 'B1').map((s) => s.id));
  let label: LevelLabel = 'A2−';
  if (a2 >= 0.35) label = 'A2';
  if (a2 >= 0.65) label = 'A2+';
  if (a2 >= 0.65 && b1 >= 0.3) label = 'B1−';
  if (a2 >= 0.65 && b1 >= 0.55) label = 'B1';
  if (a2 >= 0.65 && b1 >= 0.8) label = 'B1+';
  return { label, a2, b1 };
}

function levelLadder(level: CefrLevel, ev: LevelEvidence, passed: boolean): LevelLabel | null {
  const m = ev.mastery;
  if (m < 0.3) return null;
  if (level === 'C2') return m >= 0.7 && ev.coverage >= 0.6 && passed ? 'C2' : 'C2−';
  if (m < 0.55 || ev.coverage < 0.5) return `${level}−` as LevelLabel;
  if (m < 0.8 || ev.coverage < 0.7 || !passed) return level as LevelLabel;
  return `${level}+` as LevelLabel;
}

/** Plancher d'estimation : test de niveau et évaluations de fin de niveau réussies. */
export function estimateFloor(profile: Profile): LevelLabel | null {
  let best = labelRank(profile.placementLevel);
  for (const l of profile.levelsPassed ?? []) best = Math.max(best, labelRank(l));
  return best >= 0 ? LEVEL_LABELS[best] : null;
}

export function estimateProfile(skills: Record<string, SkillState>, profile: Profile, now: number): ProfileEstimate {
  const passed = new Set(profile.levelsPassed ?? []);
  const legacy = legacyLabel(skills, now);
  let rank = labelRank(legacy.label);
  const floor = estimateFloor(profile);
  rank = Math.max(rank, labelRank(floor ?? undefined));
  // niveaux avancés : on ne progresse qu'à partir d'un niveau précédent atteint
  for (const level of ['B2', 'C1', 'C2'] as CefrLevel[]) {
    const prev = CEFR_LEVELS[LEVEL_RANK[level] - 1];
    if (rank < labelRank(prev)) break;
    const lab = levelLadder(level, levelEvidence(level, skills, now), passed.has(level));
    if (!lab) break;
    rank = Math.max(rank, labelRank(lab));
    if (!lab.endsWith('+')) break;
  }
  const label = LEVEL_LABELS[rank];
  const unlocked = unlockedStages(profile, skills, now);
  const stage = currentStage(unlocked);
  const target = STAGES.find((s) => s.id === stage)!.to;
  const evidence = levelEvidence(target, skills, now);
  let progress: number;
  if (stage === 'a2b1') {
    const avg = (ids: string[]) => (ids.length ? ids.reduce((acc, id) => acc + effectiveMastery(skills[id], now), 0) / ids.length : 0);
    const vocab = avg(ALL_SKILLS.filter((s) => s.kind === 'vocab' && s.stage === 'a2b1').map((s) => s.id));
    const comm = avg(ALL_SKILLS.filter((s) => s.kind === 'function' && s.stage === 'a2b1').map((s) => s.id));
    progress = Math.min(1, 0.45 * legacy.a2 + 0.35 * legacy.b1 + 0.12 * vocab + 0.08 * comm);
  } else {
    // progression = maîtrise des compétences de l'étape, modérée par la couverture
    progress = Math.min(1, evidence.mastery * (0.6 + 0.4 * evidence.coverage));
  }
  const domains = {} as ProfileEstimate['domains'];
  for (const d of DOMAINS) {
    let best: LevelLabel | null = null;
    let lastM = 0;
    let lastC = 0;
    for (const level of CEFR_LEVELS) {
      const ev = levelEvidence(level, skills, now).byDomain[d];
      if (!ev) continue;
      lastM = ev.mastery;
      lastC = ev.coverage;
      if (ev.mastery >= 0.6 && ev.coverage >= 0.5) best = level as LevelLabel;
      else {
        if (ev.mastery >= 0.3) best = `${level}−` as LevelLabel;
        break;
      }
    }
    domains[d] = { label: best, mastery: lastM, coverage: lastC };
  }
  const undetermined = !floor && !Object.values(skills).some((sk) => sk && sk.attempts > 0);
  const description = undetermined ? UNDETERMINED_DESCRIPTION : (DESCRIPTIONS[label] ?? '');
  return { label, stage, target, progress, description, domains, evidence, floor, undetermined };
}
