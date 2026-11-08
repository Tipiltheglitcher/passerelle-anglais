/**
 * Morphologie anglaise : conjugaison, pluriels, articles, comparatifs.
 * Les règles régulières sont implémentées ici ; les formes irrégulières
 * proviennent du lexique (src/content/lexicon).
 */

export type Person = 1 | 2 | 3;
export type GNumber = 'sg' | 'pl';

export interface EnVerb {
  base: string;
  /** Prétérit irrégulier (plusieurs variantes possibles : la première est la référence). */
  past?: string | string[];
  /** Participe passé irrégulier. */
  pp?: string | string[];
  /** 3ᵉ personne du singulier si irrégulière. */
  s3?: string;
  /** Forme en -ing si irrégulière. */
  ing?: string;
  /** Redoublement de la consonne finale (stop → stopped, stopping). */
  dbl?: boolean;
  /** Redoublement du « l » en anglais britannique uniquement (travel → travelled / traveled). */
  lUK?: boolean;
}

const VOWELS = 'aeiou';

function isConsonant(ch: string | undefined): boolean {
  return !!ch && /[a-z]/.test(ch) && !VOWELS.includes(ch);
}

export function asList(v: string | string[] | undefined): string[] {
  if (v === undefined) return [];
  return Array.isArray(v) ? v : [v];
}

/** 3ᵉ personne du singulier du présent simple. */
export function thirdPerson(v: EnVerb): string {
  if (v.s3) return v.s3;
  const b = v.base;
  if (b === 'be') return 'is';
  if (b === 'have') return 'has';
  if (/(s|x|z|ch|sh|o)$/.test(b)) return `${b}es`;
  if (/y$/.test(b) && isConsonant(b[b.length - 2])) return `${b.slice(0, -1)}ies`;
  return `${b}s`;
}

/** Forme en -ing (britannique en premier). */
export function ingForms(v: EnVerb): string[] {
  if (v.ing) return [v.ing];
  const b = v.base;
  if (b === 'be') return ['being'];
  if (/ie$/.test(b)) return [`${b.slice(0, -2)}ying`];
  if (/(ee|ye|oe)$/.test(b)) return [`${b}ing`];
  if (/ue$/.test(b)) return [`${b.slice(0, -1)}ing`]; // argue → arguing
  if (/e$/.test(b) && b.length > 2 && isConsonant(b[b.length - 2])) return [`${b.slice(0, -1)}ing`];
  if (v.dbl) return [`${b}${b[b.length - 1]}ing`];
  if (v.lUK) return [`${b}ling`, `${b}ing`];
  return [`${b}ing`];
}

export function ing(v: EnVerb): string {
  return ingForms(v)[0];
}

/** Formes régulières en -ed (britannique en premier). */
export function regularEd(v: EnVerb): string[] {
  const b = v.base;
  if (/e$/.test(b)) return [`${b}d`];
  if (/y$/.test(b) && isConsonant(b[b.length - 2])) return [`${b.slice(0, -1)}ied`];
  if (v.dbl) return [`${b}${b[b.length - 1]}ed`];
  if (v.lUK) return [`${b}led`, `${b}ed`];
  return [`${b}ed`];
}

export function isIrregular(v: EnVerb): boolean {
  return v.past !== undefined || v.pp !== undefined;
}

/** Toutes les formes acceptées du prétérit (la première est la référence). */
export function pastForms(v: EnVerb): string[] {
  if (v.base === 'be') return ['was', 'were'];
  const irr = asList(v.past);
  return irr.length ? irr : regularEd(v);
}

export function pastSimple(v: EnVerb, person: Person = 3, num: GNumber = 'sg'): string {
  if (v.base === 'be') return beForm('past', person, num);
  return pastForms(v)[0];
}

export function ppForms(v: EnVerb): string[] {
  if (v.base === 'be') return ['been'];
  const irr = asList(v.pp);
  if (irr.length) return irr;
  const p = asList(v.past);
  return p.length ? p : regularEd(v);
}

export function pastParticiple(v: EnVerb): string {
  return ppForms(v)[0];
}

/** Forme de « be » au présent ou au passé. */
export function beForm(tense: 'present' | 'past', person: Person, num: GNumber): string {
  if (tense === 'present') {
    if (num === 'pl' || person === 2) return 'are';
    return person === 1 ? 'am' : 'is';
  }
  if (num === 'pl' || person === 2) return 'were';
  return 'was';
}

export function haveForm(person: Person, num: GNumber): string {
  return person === 3 && num === 'sg' ? 'has' : 'have';
}

export function doForm(person: Person, num: GNumber): string {
  return person === 3 && num === 'sg' ? 'does' : 'do';
}

/** Présent simple affirmatif (« be » inclus). */
export function presentSimple(v: EnVerb, person: Person, num: GNumber): string {
  if (v.base === 'be') return beForm('present', person, num);
  if (person === 3 && num === 'sg') return thirdPerson(v);
  return v.base;
}

// ---------- Noms ----------

export interface EnNounForms {
  en: string;
  /** Pluriel irrégulier ; « - » = invariable au singulier uniquement. */
  pl?: string;
}

const PLURAL_EXCEPTIONS: Record<string, string> = {
  man: 'men', woman: 'women', child: 'children', person: 'people', tooth: 'teeth',
  foot: 'feet', mouse: 'mice', goose: 'geese', sheep: 'sheep', fish: 'fish',
  knife: 'knives', wife: 'wives', life: 'lives', leaf: 'leaves', shelf: 'shelves',
  half: 'halves', wolf: 'wolves', loaf: 'loaves', thief: 'thieves', scarf: 'scarves',
  potato: 'potatoes', tomato: 'tomatoes', hero: 'heroes', echo: 'echoes',
  photo: 'photos', piano: 'pianos', radio: 'radios', video: 'videos', zoo: 'zoos',
  kilo: 'kilos', euro: 'euros', studio: 'studios', kangaroo: 'kangaroos', series: 'series',
  'phone number': 'phone numbers', 'swimming pool': 'swimming pools',
};

export function pluralize(word: string): string {
  if (PLURAL_EXCEPTIONS[word]) return PLURAL_EXCEPTIONS[word];
  // mots composés : on accorde le dernier mot
  const sp = word.lastIndexOf(' ');
  if (sp > 0) return `${word.slice(0, sp + 1)}${pluralize(word.slice(sp + 1))}`;
  if (/(s|x|z|ch|sh)$/.test(word)) return `${word}es`;
  if (/y$/.test(word) && isConsonant(word[word.length - 2])) return `${word.slice(0, -1)}ies`;
  return `${word}s`;
}

// ---------- Articles ----------

/** Mots qui commencent par un son consonne malgré une voyelle écrite. */
const CONSONANT_SOUND = /^(univ|unif|unio|unit|uniq|unic|use|usu|uti|ute|eu|ewe|one\b|once|ufo|uk\b|us\b|u\b|ubiq|uran|uro)/i;
/** Mots qui commencent par un « h » muet. */
const SILENT_H = /^(hour|honest|honour|honor|heir|herb\b)/i;

/** « a » ou « an » selon le son initial du mot suivant. */
export function indefiniteArticle(nextWord: string): 'a' | 'an' {
  const w = nextWord.trim().toLowerCase();
  if (!w) return 'a';
  if (SILENT_H.test(w)) return 'an';
  if (CONSONANT_SOUND.test(w)) return 'a';
  // sigles prononcés lettre par lettre : an MP3, an X-ray
  if (/^[fhlmnrsx]-/.test(w) || /^(mp3|sms|mba|fbi|x-ray)/.test(w)) return 'an';
  return /^[aeiou]/.test(w) ? 'an' : 'a';
}

export function withIndefinite(phrase: string): string {
  return `${indefiniteArticle(phrase)} ${phrase}`;
}

// ---------- Adjectifs ----------

export interface EnAdjective {
  en: string;
  /** Type de comparatif : -er, more, ou irrégulier (comparatif|superlatif). */
  cmp: 'er' | 'more' | 'both' | string;
  /** Redoublement : big → bigger. */
  dbl?: boolean;
  /** Adverbe de manière irrégulier ou non dérivable (good → well, fast → fast). */
  adv?: string | null;
}

export function comparativeForms(a: EnAdjective): string[] {
  const er = erForm(a, 'er');
  if (a.cmp === 'er') return [er];
  if (a.cmp === 'more') return [`more ${a.en}`];
  if (a.cmp === 'both') return [er, `more ${a.en}`];
  return [a.cmp.split('|')[0]];
}

export function superlativeForms(a: EnAdjective): string[] {
  const est = erForm(a, 'est');
  if (a.cmp === 'er') return [est];
  if (a.cmp === 'more') return [`most ${a.en}`];
  if (a.cmp === 'both') return [est, `most ${a.en}`];
  return [a.cmp.split('|')[1]];
}

function erForm(a: EnAdjective, suffix: 'er' | 'est'): string {
  const w = a.en;
  if (/e$/.test(w)) return `${w}${suffix.slice(1)}`;
  if (/y$/.test(w) && isConsonant(w[w.length - 2])) return `${w.slice(0, -1)}i${suffix}`;
  if (a.dbl) return `${w}${w[w.length - 1]}${suffix}`;
  return `${w}${suffix}`;
}

/** Adverbe de manière dérivé d'un adjectif (quick → quickly, easy → easily). */
export function adverbOf(a: EnAdjective): string | null {
  if (a.adv !== undefined) return a.adv;
  const w = a.en;
  if (/le$/.test(w) && isConsonant(w[w.length - 3])) return `${w.slice(0, -1)}y`; // gentle → gently
  if (/y$/.test(w) && isConsonant(w[w.length - 2])) return `${w.slice(0, -1)}ily`;
  if (/ic$/.test(w)) return `${w}ally`;
  if (/ll$/.test(w)) return `${w}y`;
  return `${w}ly`;
}

// ---------- Pronoms ----------

export interface PronounSet {
  subj: string;
  obj: string;
  possAdj: string;
  possPron: string;
  refl: string;
}

export function pronounsFor(person: Person, num: GNumber, gender: 'm' | 'f' | 'n'): PronounSet {
  if (num === 'sg') {
    if (person === 1) return { subj: 'I', obj: 'me', possAdj: 'my', possPron: 'mine', refl: 'myself' };
    if (person === 2) return { subj: 'you', obj: 'you', possAdj: 'your', possPron: 'yours', refl: 'yourself' };
    if (gender === 'm') return { subj: 'he', obj: 'him', possAdj: 'his', possPron: 'his', refl: 'himself' };
    if (gender === 'f') return { subj: 'she', obj: 'her', possAdj: 'her', possPron: 'hers', refl: 'herself' };
    return { subj: 'it', obj: 'it', possAdj: 'its', possPron: 'its', refl: 'itself' };
  }
  if (person === 1) return { subj: 'we', obj: 'us', possAdj: 'our', possPron: 'ours', refl: 'ourselves' };
  if (person === 2) return { subj: 'you', obj: 'you', possAdj: 'your', possPron: 'yours', refl: 'yourselves' };
  return { subj: 'they', obj: 'them', possAdj: 'their', possPron: 'theirs', refl: 'themselves' };
}
