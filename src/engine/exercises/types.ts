/**
 * Modèle des exercices présentés à l'apprenant et des réponses.
 */
import type { AnswerSpec, DiffOp } from '@/engine/core/lattice';
import type { CefrLevel } from '@/content/lexicon/types';
import type { Distractor } from '@/engine/generator/types';

export type ExerciseType =
  | 'wordOrder'
  | 'cloze'
  | 'mcq'
  | 'translateFrEn'
  | 'translateEnFr'
  | 'errorCorrection'
  | 'conjugation'
  | 'matching'
  | 'dialogue'
  | 'reading'
  | 'listening'
  | 'contextChoice'
  | 'transformation'
  | 'dictation'
  // formats avancés (B2 → C2)
  | 'keyword'
  | 'nuance'
  | 'register'
  | 'implicature'
  | 'styleEdit'
  | 'longReading'
  | 'argument'
  | 'dialogueAnalysis'
  | 'textOrder'
  | 'writing';

/** Les 14 formats du parcours A2 → B1. */
export const BASE_EXERCISE_TYPES: ExerciseType[] = [
  'wordOrder',
  'cloze',
  'mcq',
  'translateFrEn',
  'translateEnFr',
  'errorCorrection',
  'conjugation',
  'matching',
  'dialogue',
  'reading',
  'listening',
  'contextChoice',
  'transformation',
  'dictation',
];

/** Formats ajoutés pour les niveaux B2, C1 et C2. */
export const ADVANCED_EXERCISE_TYPES: ExerciseType[] = ['keyword', 'nuance', 'register', 'implicature', 'styleEdit', 'longReading', 'argument', 'dialogueAnalysis', 'textOrder', 'writing'];

export const EXERCISE_TYPES: ExerciseType[] = [...BASE_EXERCISE_TYPES, ...ADVANCED_EXERCISE_TYPES];

export const EXERCISE_LABELS: Record<ExerciseType, string> = {
  wordOrder: 'Remettre dans l\'ordre',
  cloze: 'Phrase à trous',
  mcq: 'QCM',
  translateFrEn: 'Traduction FR → EN',
  translateEnFr: 'Traduction EN → FR',
  errorCorrection: "Correction d'erreur",
  conjugation: 'Conjugaison',
  matching: 'Association',
  dialogue: 'Dialogue',
  reading: 'Compréhension écrite',
  listening: 'Compréhension orale',
  contextChoice: 'Choix en contexte',
  transformation: 'Transformation',
  dictation: 'Dictée',
  keyword: 'Reformulation avec mot imposé',
  nuance: 'Nuances de sens',
  register: 'Choix du registre',
  implicature: 'Implicite et intention',
  styleEdit: 'Correction stylistique',
  longReading: 'Texte long',
  argument: "Analyse d'arguments",
  dialogueAnalysis: 'Analyse de dialogue',
  textOrder: 'Organisation du texte',
  writing: 'Rédaction guidée',
};

/** Exercices nécessitant la synthèse vocale. */
export const AUDIO_TYPES: ReadonlySet<ExerciseType> = new Set(['listening', 'dictation']);

/** Exercices à choix commentés (chaque option reçoit une explication). */
export const INSIGHT_TYPES: ReadonlySet<ExerciseType> = new Set(['nuance', 'register', 'implicature', 'styleEdit']);

/** Exercices « texte + questions ». */
export const PASSAGE_TYPES: ReadonlySet<ExerciseType> = new Set(['reading', 'longReading', 'argument', 'dialogueAnalysis']);

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  skillId: string;
  level: CefrLevel;
  difficulty: 1 | 2 | 3;
  instruction: string;
  explanation: string;
  /** Identifiant de contenu (dé-duplication des exercices identiques). */
  signature: string;
  /** Identifiant de structure (variété des modèles). */
  structure: string;
  lexemes: string[];
  /** Éléments suivis en répétition espacée (vocabulaire, verbes irréguliers). */
  itemIds: string[];
  seed: string;
  /** Texte anglais lisible à voix haute (bouton « écouter »). */
  audioText?: string;
}

export type ClozePart = { kind: 'text'; text: string } | { kind: 'blank'; index: number };

export interface BlankSpec {
  answer: AnswerSpec;
  display: string;
  hint?: string;
}

export interface Option {
  text: string;
  correct: boolean;
  tag?: string;
}

export interface Tile {
  id: string;
  text: string;
}

export interface WordOrderExercise extends ExerciseBase {
  type: 'wordOrder';
  tiles: Tile[];
  /** Ordres acceptés (textes des tuiles). */
  accepted: string[][];
  translation: string;
  answerText: string;
}

export interface ClozeExercise extends ExerciseBase {
  type: 'cloze' | 'conjugation';
  variant: 'sentence';
  parts: ClozePart[];
  blanks: BlankSpec[];
  translation?: string;
  showTranslation: boolean;
  context?: string;
  answerText: string;
  /** Formes erronées connues (pour une explication ciblée). */
  known: Distractor[];
  noFinalContraction?: boolean;
}

export interface GridExercise extends ExerciseBase {
  type: 'conjugation';
  variant: 'grid';
  prompt: string;
  meaning: string;
  fields: { label: string; answer: AnswerSpec; display: string }[];
}

export interface McqExercise extends ExerciseBase {
  type: 'mcq' | 'contextChoice';
  context?: string;
  /** Phrase avec un trou (QCM sur un trou) ou question simple. */
  stem?: ClozePart[];
  question?: string;
  options: Option[];
  translation?: string;
  showTranslation: boolean;
}

export interface TranslateFrEnExercise extends ExerciseBase {
  type: 'translateFrEn';
  source: string;
  answer: AnswerSpec;
  answerText: string;
  known: { text: string; tag: string }[];
  /** Mots de vocabulaire (traduction d'un mot) : tolérance aux articles. */
  wordMode?: boolean;
  noFinalContraction?: boolean;
}

export interface TranslateEnFrExercise extends ExerciseBase {
  type: 'translateEnFr';
  source: string;
  options: Option[];
}

export interface ErrorExercise extends ExerciseBase {
  type: 'errorCorrection';
  tokens: string[];
  /** Indices (inclus) des mots erronés. */
  wrong: [number, number];
  correction: AnswerSpec;
  correctionText: string;
  correctSentence: string;
  tag: string;
  translation: string;
}

export interface MatchingExercise extends ExerciseBase {
  type: 'matching';
  pairs: { id: string; left: string; right: string }[];
  leftLabel: string;
  rightLabel: string;
}

export interface DialogueTurn {
  speaker: string;
  side: 'left' | 'right';
  text?: string;
  fr?: string;
  choice?: { options: Option[]; explanation: string };
}

export interface DialogueExercise extends ExerciseBase {
  type: 'dialogue';
  title: string;
  setting: string;
  turns: DialogueTurn[];
}

export interface ReadingQuestion {
  q: string;
  options: Option[];
  explanation: string;
  /** Nature de la question (idée principale, inférence, vocabulaire…). */
  focus?: QuestionFocus;
}

export type QuestionFocus = 'gist' | 'detail' | 'inference' | 'vocab' | 'attitude' | 'structure' | 'claim' | 'evidence' | 'assumption' | 'flaw' | 'function' | 'tone';

export const FOCUS_LABELS: Record<QuestionFocus, string> = {
  gist: 'Idée principale',
  detail: 'Détail',
  inference: 'Inférence',
  vocab: 'Vocabulaire en contexte',
  attitude: "Position de l'auteur",
  structure: 'Organisation du texte',
  claim: 'Thèse',
  evidence: 'Justification',
  assumption: 'Présupposé',
  flaw: 'Faille du raisonnement',
  function: 'Fonction de la réplique',
  tone: 'Ton et attitude',
};

export interface ReadingExercise extends ExerciseBase {
  type: 'reading' | 'longReading' | 'argument' | 'dialogueAnalysis';
  title: string;
  /** Texte ; les paragraphes sont séparés par une ligne vide pour les textes longs. */
  text: string;
  questions: ReadingQuestion[];
  /** Source ou nature du texte (éditorial, article de vulgarisation…). */
  genre?: string;
  /** Dialogue transcrit (analyse de dialogue). */
  lines?: { speaker: string; text: string }[];
  /** Seuil de réussite (proportion de bonnes réponses, 0,75 par défaut). */
  passRate?: number;
}

/** Choix commenté : nuance, registre, implicite, style. */
export interface InsightOption extends Option {
  /** Pourquoi cette option convient ou non. */
  why: string;
  /** Étiquette (registre, effet…) révélée après la correction. */
  label?: string;
}

export interface InsightExercise extends ExerciseBase {
  type: 'nuance' | 'register' | 'implicature' | 'styleEdit';
  /** Situation (en français). */
  situation?: string;
  /** Extrait anglais (phrase, échange, paragraphe). */
  passage?: string;
  /** Répliques d'un échange (implicite). */
  lines?: { speaker: string; text: string }[];
  question: string;
  options: InsightOption[];
}

/** Reformulation avec mot imposé (type Cambridge « key word transformation »). */
export interface KeywordExercise extends ExerciseBase {
  type: 'keyword';
  source: string;
  key: string;
  before: string;
  after: string;
  answer: AnswerSpec;
  answerText: string;
  minWords: number;
  maxWords: number;
}

export interface TextSegment {
  id: string;
  text: string;
  /** Rôle du segment dans le texte (révélé après correction). */
  role: string;
}

export interface TextOrderExercise extends ExerciseBase {
  type: 'textOrder';
  title: string;
  /** Phrase ou titre qui ouvre le texte (fixe). */
  lead?: string;
  segments: TextSegment[];
  /** Ordres acceptés (identifiants). */
  orders: string[][];
}

export interface WritingCheck {
  id: string;
  label: string;
  /** Expressions régulières (source, insensibles à la casse) : au moins une doit apparaître. */
  patterns: string[];
  /** Nombre minimal d'occurrences distinctes (défaut 1). */
  min?: number;
}

export interface WritingExercise extends ExerciseBase {
  type: 'writing';
  title: string;
  /** Consigne en français. */
  prompt: string;
  /** Sujet en anglais (comme dans un examen). */
  task: string;
  minWords: number;
  maxWords: number;
  /** Éléments imposés, vérifiés automatiquement. */
  checks: WritingCheck[];
  /** Grille d'auto-évaluation (critères qualitatifs). */
  rubric: string[];
  /** Expressions utiles proposées avant de rédiger. */
  phrases: string[];
  /** Exemple de production réussie. */
  model: string;
}

/** Erreur certaine détectée dans une production libre. */
export interface WritingIssue {
  tag: string;
  found: string;
  fix: string;
  why: string;
}

export interface WritingReport {
  words: number;
  lengthOk: boolean;
  checks: { id: string; label: string; ok: boolean; found: string[] }[];
  issues: WritingIssue[];
  /** Mots très répétés (hors mots grammaticaux). */
  repeated: { word: string; count: number }[];
  /** Score des vérifications automatiques (0–1). */
  autoScore: number;
}

export interface ListeningExercise extends ExerciseBase {
  type: 'listening';
  mode: 'which' | 'comprehension';
  audioText: string;
  question: string;
  options: Option[];
  transcript: string;
  translation?: string;
}

export interface TransformationExercise extends ExerciseBase {
  type: 'transformation';
  source: string;
  task: string;
  answer: AnswerSpec;
  answerText: string;
}

export interface DictationExercise extends ExerciseBase {
  type: 'dictation';
  audioText: string;
  answer: AnswerSpec;
  answerText: string;
  translation: string;
}

export type Exercise =
  | WordOrderExercise
  | ClozeExercise
  | GridExercise
  | McqExercise
  | TranslateFrEnExercise
  | TranslateEnFrExercise
  | ErrorExercise
  | MatchingExercise
  | DialogueExercise
  | ReadingExercise
  | ListeningExercise
  | TransformationExercise
  | DictationExercise
  | KeywordExercise
  | InsightExercise
  | TextOrderExercise
  | WritingExercise;

export type ExerciseResponse =
  | { kind: 'order'; tiles: string[] }
  | { kind: 'blanks'; values: string[] }
  | { kind: 'choice'; index: number }
  | { kind: 'text'; value: string }
  | { kind: 'error'; index: number; correction: string }
  | { kind: 'multi'; correct: number; total: number; mistakes: number; tags?: string[]; missedIds?: string[] }
  | { kind: 'sequence'; ids: string[] }
  | { kind: 'writing'; text: string; report: WritingReport; self: number[] };

export interface EvalResult {
  correct: boolean;
  /** Score 0–1 (exercices en plusieurs étapes : proportion de réussite). */
  score: number;
  typo?: boolean;
  accentOnly?: boolean;
  expected: string;
  userAnswer: string;
  errorTag?: string;
  /** Message court (« Correct ! », « Presque… »). */
  headline: string;
  /** Remarque complémentaire (faute de frappe tolérée, variante acceptée…). */
  note?: string;
  diff?: DiffOp[];
  /** Résultat élément par élément (association) : utilisé par la révision espacée de chaque mot. */
  itemOutcomes?: Record<string, boolean>;
  /**
   * Évaluation partielle (production libre) : seuls les critères vérifiables
   * automatiquement sont notés ; le reste relève de l'auto-évaluation.
   */
  approximate?: boolean;
  /** Auto-évaluation déclarée (0–1), conservée à titre indicatif. */
  selfScore?: number;
  /** Texte produit (rédaction), conservé dans l'historique des productions. */
  production?: string;
}
