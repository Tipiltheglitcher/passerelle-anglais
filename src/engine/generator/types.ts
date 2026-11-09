/**
 * Types communs aux générateurs.
 * Un générateur de compétence produit des « items » de phrase (SentenceItem)
 * à partir desquels la fabrique d'exercices dérive de nombreux formats :
 * texte à trous, QCM, ordre des mots, traduction, correction d'erreur,
 * dictée, transformation…
 */
import type { AnswerSpec, Lattice, Slot } from '@/engine/core/lattice';
import type { Rng } from '@/engine/core/rng';
import type { CefrLevel, Level } from '@/content/lexicon/types';
import type { ExerciseType } from '@/engine/exercises/types';

export interface GenContext {
  rng: Rng;
  /** Niveau du contenu (A2 = lexique de base, B1 = lexique élargi). */
  level: Level;
  /** Difficulté de l'exercice : 1 facile, 2 moyen, 3 difficile. */
  difficulty: 1 | 2 | 3;
  /** Poids d'exposition d'un lexème (faible si déjà vu souvent). */
  lexWeight?: (lexId: string) => number;
  /** Lexèmes à privilégier (vocabulaire à réviser). */
  prefer?: ReadonlySet<string>;
}

export interface Distractor {
  text: string;
  /** Étiquette d'erreur (voir errors.ts). */
  tag: string;
}

export interface Blank {
  answer: AnswerSpec;
  /** Réponse de référence affichée. */
  display: string;
  /** Indice affiché entre parenthèses (base verbale…). */
  hint?: string;
}

export interface TransformSpec {
  instruction: string;
  source: string;
  target: AnswerSpec;
  targetText: string;
}

export interface SentenceItem {
  skillId: string;
  /** Identifiant de structure (pour les statistiques d'exposition). */
  templateId: string;
  level: CefrLevel;
  /** Phrase complète, cases annotées (slot.blank = indice du trou). */
  slots: Slot[];
  end: '.' | '?' | '!';
  /** Autres ordres de mots corrects (phrase complète). */
  altOrders?: Slot[][];
  /** Autres formulations correctes acceptées en traduction (sans être affichées). */
  extraAnswers?: Lattice[];
  /** Traduction française. */
  fr: string;
  blanks: Blank[];
  /** Distracteurs pour le trou n° 0. */
  distractors: Distractor[];
  /** Traductions françaises incorrectes mais plausibles (QCM EN → FR). */
  frDistractors?: string[];
  /** Phrases anglaises proches mais différentes (compréhension orale). */
  enVariants?: string[];
  transform?: TransformSpec;
  /** Consigne spécifique (ex. « Présent simple ou continu ? »). */
  instruction?: string;
  /** Ligne de contexte affichée avec la phrase (question, réplique précédente…). */
  context?: string;
  /** La traduction est nécessaire pour lever l'ambiguïté : toujours l'afficher. */
  showTranslation?: boolean;
  explanation: string;
  lexemes: string[];
  /** Éléments mémorisables (vocabulaire, verbes irréguliers) suivis en répétition espacée. */
  itemIds?: string[];
  /** Interdit une contraction finale (réponses courtes : ✗ Yes, I'm). */
  noFinalContraction?: boolean;
  /** Trou sans réponse écrite possible (article zéro) : uniquement en QCM. */
  mcqOnly?: boolean;
  /**
   * Formats autorisés (items rédigés à la main) : on n'autorise une traduction
   * libre ou un ordre des mots que si toutes les réponses correctes sont prévues.
   */
  allowedTypes?: ExerciseType[];
}

/** Libellé affiché pour l'absence d'article. */
export const ZERO_LABEL = '∅ (aucun article)';

export type ItemGenerator = (ctx: GenContext) => SentenceItem | null;
