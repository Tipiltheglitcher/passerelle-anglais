/**
 * Modèle des exercices présentés à l'apprenant et des réponses.
 */
import type { AnswerSpec, DiffOp } from '@/engine/core/lattice';
import type { Level } from '@/content/lexicon/types';
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
  | 'dictation';

export const EXERCISE_TYPES: ExerciseType[] = [
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
};

/** Exercices nécessitant la synthèse vocale. */
export const AUDIO_TYPES: ReadonlySet<ExerciseType> = new Set(['listening', 'dictation']);

export interface ExerciseBase {
  id: string;
  type: ExerciseType;
  skillId: string;
  level: Level;
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
}

export interface ReadingExercise extends ExerciseBase {
  type: 'reading';
  title: string;
  text: string;
  questions: ReadingQuestion[];
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
  | DictationExercise;

export type ExerciseResponse =
  | { kind: 'order'; tiles: string[] }
  | { kind: 'blanks'; values: string[] }
  | { kind: 'choice'; index: number }
  | { kind: 'text'; value: string }
  | { kind: 'error'; index: number; correction: string }
  | { kind: 'multi'; correct: number; total: number; mistakes: number; tags?: string[]; missedIds?: string[] };

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
}
