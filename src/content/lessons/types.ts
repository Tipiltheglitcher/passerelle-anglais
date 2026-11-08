/**
 * Format des leçons. Dans les textes, **gras** met un mot en valeur.
 */
export interface LessonExample {
  en: string;
  fr: string;
  /** Petite étiquette d'emploi (habitude, prédiction…). */
  note?: string;
}

export interface LessonTable {
  head: string[];
  rows: string[][];
}

export interface LessonBlock {
  title: string;
  text?: string;
  points?: string[];
  table?: LessonTable;
  examples?: LessonExample[];
}

export interface Pitfall {
  wrong: string;
  right: string;
  why: string;
}

export interface Lesson {
  intro: string;
  blocks: LessonBlock[];
  /** Erreurs typiques des francophones. */
  pitfalls: Pitfall[];
  /** À retenir (2 ou 3 points). */
  remember: string[];
}

export const ex = (en: string, fr: string, note?: string): LessonExample => (note ? { en, fr, note } : { en, fr });
export const pit = (wrong: string, right: string, why: string): Pitfall => ({ wrong, right, why });
export const table = (head: string[], ...rows: string[][]): LessonTable => ({ head, rows });
