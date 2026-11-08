import type { FrDet, FrGender } from '@/engine/lang/fr/morphology';

export type Level = 'A2' | 'B1';

/** Déterminant anglais demandé pour un complément d'objet. */
export type EnDet = 'a' | 'the' | 'poss' | 'none' | 'gen' | 'this';

export interface Noun {
  id: string;
  en: string;
  /** Pluriel anglais irrégulier. */
  pl?: string;
  /** Indénombrable en anglais. */
  u?: boolean;
  /** Toujours au pluriel en anglais (glasses, keys…). */
  po?: boolean;
  /** Variantes anglaises acceptées (movie pour film…). */
  syn: string[];
  /** Nom propre (majuscule). */
  proper?: boolean;
  /** Article « the » obligatoire (the United States). */
  the?: boolean;
  fr: string;
  g: FrGender;
  fpl?: string;
  /** Toujours au pluriel en français (pâtes, devoirs…). */
  fpo?: boolean;
  /** Préposition de lieu en français pour pays/villes (en, au, aux, à). */
  fprep?: string;
  /** Catégories sémantiques. */
  c: string[];
  lv: Level;
}

export interface ObjSpec {
  cats?: string[];
  nouns?: string[];
  dets: EnDet[];
  /** Forcer le pluriel (true) ou le singulier (false). */
  pl?: boolean;
}

export type PredKind = 'act' | 'evt' | 'state';

/**
 * Groupe verbal générique : verbe + complément, avec sa traduction.
 * Les drapeaux d'aspect indiquent les emplois naturels (habitude, action en
 * cours, durée avec for/since…), afin de ne générer que des phrases plausibles.
 */
export interface Predicate {
  id: string;
  v: string;
  prt?: string;
  obj?: ObjSpec;
  /** Complément fixe anglais après l'objet ({poss} = adjectif possessif du sujet). */
  tail?: string;
  fv: string;
  fpron?: boolean;
  fprep?: 'à' | 'de';
  /** Complément fixe français ({poss:m|f|pl}, {agr:m|f}). */
  ftail?: string;
  /** Le complément fixe français précède l'objet. */
  ftailFirst?: boolean;
  fdet?: Partial<Record<EnDet, FrDet>>;
  k: PredKind;
  hab?: boolean;
  prog?: boolean;
  dur?: boolean;
  perf?: boolean;
  /** « been to » au present perfect d'expérience. */
  ppBeen?: boolean;
  /** « can » = savoir (compétence). */
  skill?: boolean;
  /** Prédicat avec « be » + attribut. */
  be?: boolean;
  lv: Level;
  /** Sujets possibles : personnes (défaut) ou adultes uniquement. */
  adult?: boolean;
  /** Le complément de lieu prend en français la préposition du nom (à Londres, en Espagne, au Japon). */
  floc?: boolean;
  /** Se combine avec une heure précise (routine : get up at 7). */
  routine?: boolean;
}

export interface Subject {
  id: string;
  en: string;
  fr: string;
  person: 1 | 2 | 3;
  num: 'sg' | 'pl';
  g: 'm' | 'f';
  /** Pronom personnel. */
  pron?: boolean;
  proper?: boolean;
  /** Enfant (exclu des prédicats « adultes »). */
  child?: boolean;
}

export interface AdjEntry {
  id: string;
  en: string;
  cmp: 'er' | 'more' | 'both' | string;
  dbl?: boolean;
  adv?: string | null;
  fr: { m: string; f: string; mpl?: string; fpl?: string; mv?: string };
  /** Adjectif placé avant le nom en français. */
  fpre?: boolean;
  /** Comparatif français irrégulier « meilleur|meilleure » ou « moins cher|moins chère ». */
  fcmp?: string;
  /** Catégories de noms qualifiables. */
  on: string[];
  lv: Level;
}
