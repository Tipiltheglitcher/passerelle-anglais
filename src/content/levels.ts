/**
 * Niveaux CECRL, étapes du parcours (A2 → B1 → B2 → C1 → C2) et domaines de
 * compétence suivis séparément.
 *
 * Les descripteurs sont des reformulations des échelles globales du CECRL
 * (Conseil de l'Europe, 2001 ; volume complémentaire, 2020). Ils décrivent ce
 * que vise chaque étape ; les résultats de l'application restent des
 * estimations pédagogiques, pas une certification.
 */
import type { CefrLevel } from './lexicon/types';

export type { CefrLevel } from './lexicon/types';

export const CEFR_LEVELS: CefrLevel[] = ['A2', 'B1', 'B2', 'C1', 'C2'];

export const LEVEL_RANK: Record<CefrLevel, number> = { A2: 0, B1: 1, B2: 2, C1: 3, C2: 4 };

export function levelAtLeast(l: CefrLevel, min: CefrLevel): boolean {
  return LEVEL_RANK[l] >= LEVEL_RANK[min];
}

export type StageId = 'a2b1' | 'b1b2' | 'b2c1' | 'c1c2';

export interface StageDef {
  id: StageId;
  /** Niveau de départ et niveau visé. */
  from: CefrLevel;
  to: CefrLevel;
  title: string;
  subtitle: string;
  /** Ce que l'apprenant doit pouvoir faire en fin d'étape (d'après le CECRL). */
  descriptors: string[];
  /** Points travaillés en priorité. */
  focus: string[];
}

export const STAGES: StageDef[] = [
  {
    id: 'a2b1',
    from: 'A2',
    to: 'B1',
    title: 'De A2 à B1',
    subtitle: 'Se débrouiller au quotidien',
    descriptors: [
      'Comprendre l’essentiel d’un message clair sur des sujets familiers (travail, études, loisirs).',
      'Se débrouiller dans la plupart des situations de voyage.',
      'Raconter un événement, une expérience, exposer brièvement un projet ou une opinion.',
    ],
    focus: ['Temps du présent, du passé et du futur', 'Modaux', 'Present perfect', 'Conditionnels 0, 1, 2', 'Phrases complexes simples'],
  },
  {
    id: 'b1b2',
    from: 'B1',
    to: 'B2',
    title: 'De B1 à B2',
    subtitle: 'Argumenter et comprendre en profondeur',
    descriptors: [
      'Comprendre les idées principales d’un texte complexe, concret ou abstrait, y compris une discussion technique dans son domaine.',
      'Échanger avec assez d’aisance et de spontanéité pour qu’une conversation avec un locuteur natif ne demande d’effort à aucun des deux.',
      'S’exprimer de façon claire et détaillée, défendre un point de vue en exposant avantages et inconvénients.',
    ],
    focus: ['Récit précis (past perfect, futur antérieur)', 'Hypothèses, regrets, déductions au passé', 'Passif et discours rapporté avancés', 'Collocations et phrasal verbs', 'Arguments, registre, textes longs'],
  },
  {
    id: 'b2c1',
    from: 'B2',
    to: 'C1',
    title: 'De B2 à C1',
    subtitle: 'Nuancer, structurer, préciser',
    descriptors: [
      'Comprendre une grande variété de textes longs et exigeants et en saisir les sens implicites.',
      'S’exprimer spontanément et couramment, sans trop chercher ses mots.',
      'Utiliser la langue de façon efficace et souple dans la vie sociale, professionnelle ou universitaire.',
      'Produire des textes clairs, bien structurés et détaillés sur des sujets complexes, en maîtrisant les outils d’organisation et de cohésion.',
    ],
    focus: ['Inversion, phrases clivées, propositions participiales', 'Subjonctif et tournures formelles', 'Modalisation et atténuation', 'Lexique académique et professionnel', 'Style, registre, implicite'],
  },
  {
    id: 'c1c2',
    from: 'C1',
    to: 'C2',
    title: 'De C1 à C2',
    subtitle: 'Maîtriser les finesses de la langue',
    descriptors: [
      'Comprendre sans effort pratiquement tout ce qui est lu ou entendu.',
      'Résumer et restituer des informations de sources diverses en une présentation cohérente.',
      'S’exprimer spontanément, très couramment et de façon précise, en rendant distinctes de fines nuances de sens, même dans des situations complexes.',
    ],
    focus: ['Inversion conditionnelle, ellipse, nominalisation', 'Valeurs fines de l’aspect et des modaux', 'Idiomaticité, connotation, faux amis subtils', 'Ironie, euphémisme, sous-entendus', 'Analyse critique et précision stylistique'],
  },
];

export const STAGE_BY_ID: Record<StageId, StageDef> = Object.fromEntries(STAGES.map((s) => [s.id, s])) as Record<StageId, StageDef>;

/** Étape à laquelle appartient un contenu d'un niveau donné. */
export function stageOfLevel(l: CefrLevel): StageId {
  if (l === 'A2' || l === 'B1') return 'a2b1';
  if (l === 'B2') return 'b1b2';
  if (l === 'C1') return 'b2c1';
  return 'c1c2';
}

/**
 * Domaines suivis séparément. L'expression orale n'est pas évaluée :
 * l'application ne fait pas de reconnaissance vocale.
 */
export type Domain = 'grammar' | 'lexis' | 'written' | 'oral';

export const DOMAINS: Domain[] = ['grammar', 'lexis', 'written', 'oral'];

export const DOMAIN_LABELS: Record<Domain, string> = {
  grammar: 'Grammaire',
  lexis: 'Lexique',
  written: 'Écrit',
  oral: 'Oral',
};

export const DOMAIN_DETAILS: Record<Domain, string> = {
  grammar: 'Structures, temps, syntaxe',
  lexis: 'Vocabulaire, collocations, expressions',
  written: 'Compréhension de textes, organisation, style, rédaction',
  oral: 'Compréhension orale, dialogues, implicite',
};

/** Libellé court d'un niveau, avec son étape. */
export function levelLabel(l: CefrLevel): string {
  return l;
}

/** Classe de couleur associée à un niveau (badges). */
export function levelTone(l: CefrLevel): 'primary' | 'accent' | 'success' | 'warning' | 'danger' {
  switch (l) {
    case 'A2':
      return 'primary';
    case 'B1':
      return 'accent';
    case 'B2':
      return 'success';
    case 'C1':
      return 'warning';
    default:
      return 'danger';
  }
}
