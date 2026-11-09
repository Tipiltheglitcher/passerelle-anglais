/**
 * Morphologie française minimale mais rigoureuse, utilisée pour produire les
 * traductions des phrases générées : conjugaison (présent, passé composé,
 * imparfait, futur, conditionnel, périphrases), articles, possessifs,
 * élision, contractions, accords.
 */

/** Indice de personne : 0 je, 1 tu, 2 il/elle, 3 nous, 4 vous, 5 ils/elles. */
export type FrPerson = 0 | 1 | 2 | 3 | 4 | 5;
export type FrGender = 'm' | 'f';

export interface FrVerb {
  inf: string;
  /** Présent explicite « vais|vas|va|allons|allez|vont » (sinon conjugaison régulière). */
  pres?: string;
  pp?: string;
  aux?: 'être' | 'avoir';
  /** Radical du futur / conditionnel. */
  fut?: string;
  /** Radical de l'imparfait (si non dérivable de « nous »). */
  imp?: string;
  /** Verbe du 2ᵉ groupe (finir). */
  ir2?: boolean;
  /** Verbe impersonnel (pleuvoir). */
  impers?: boolean;
}

export type FrTense =
  | 'present'
  | 'pc' // passé composé
  | 'imparfait'
  | 'futur'
  | 'futurProche'
  | 'conditionnel'
  | 'venirDe'
  | 'enTrainDe'
  | 'enTrainDeImp'
  | 'pqp' // plus-que-parfait
  | 'condPasse' // conditionnel passé
  | 'futAnt' // futur antérieur
  | 'infinitive';

const H_ASPIRE = new Set([
  'haricot', 'haricots', 'hamburger', 'hamburgers', 'héros', 'hall', 'hockey', 'huit', 'haut', 'hauts', 'haute',
  'honte', 'hasard', 'hibou', 'hamac', 'handicap', 'hangar', 'harpe', 'hâte', 'housse', 'hollande', 'hongrie',
  'hors', 'hausse', 'hache', 'hareng', 'hérisson', 'homard', 'huitième', 'hublot', 'hurler', 'hall',
]);

/** Le mot commence-t-il par une voyelle (ou un h muet) au sens de l'élision ? */
export function startsWithVowelSound(word: string): boolean {
  const w = word.toLowerCase();
  if (!w) return false;
  if (w === 'y') return true;
  if (/^[aeiouàâäéèêëîïôöùûüœæ]/.test(w)) return true;
  if (w.startsWith('h')) {
    const bare = w.replace(/[^a-zàâäéèêëîïôöùûüç]/g, '');
    return !H_ASPIRE.has(bare);
  }
  return false;
}

const ELIDABLE = new Set(['je', 'me', 'te', 'se', 'le', 'la', 'de', 'ne', 'que', 'jusque', 'lorsque', 'puisque']);

/**
 * Applique l'élision et assemble les mots : « je aime » → « j'aime »,
 * « ne est » → « n'est », « si il » → « s'il ».
 */
export function frJoin(tokens: readonly string[]): string {
  const words = tokens.filter((t) => t !== '');
  const out: string[] = [];
  for (let i = 0; i < words.length; i++) {
    const w = words[i];
    const next = words[i + 1];
    const lw = w.toLowerCase();
    if (next !== undefined && ELIDABLE.has(lw) && startsWithVowelSound(next)) {
      const elided = `${w.slice(0, -1)}'`;
      words[i + 1] = `${elided}${next}`;
      continue;
    }
    if (next !== undefined && lw === 'si' && /^ils?$/i.test(next)) {
      words[i + 1] = `${w.slice(0, -1)}'${next}`;
      continue;
    }
    out.push(w);
  }
  return out.join(' ');
}

// ---------- Conjugaison ----------

const PRES_ENDINGS_ER = ['e', 'es', 'e', 'ons', 'ez', 'ent'];
const IMP_ENDINGS = ['ais', 'ais', 'ait', 'ions', 'iez', 'aient'];
const FUT_ENDINGS = ['ai', 'as', 'a', 'ons', 'ez', 'ont'];

export function presentForms(v: FrVerb): string[] {
  if (v.pres) return v.pres.split('|');
  if (v.ir2) {
    const st = v.inf.slice(0, -2);
    return [`${st}is`, `${st}is`, `${st}it`, `${st}issons`, `${st}issez`, `${st}issent`];
  }
  if (v.inf.endsWith('er')) {
    const st = v.inf.slice(0, -2);
    return PRES_ENDINGS_ER.map((e, i) => {
      if (i === 3) {
        if (st.endsWith('g')) return `${st}eons`;
        if (st.endsWith('c')) return `${st.slice(0, -1)}çons`;
      }
      return `${st}${e}`;
    });
  }
  throw new Error(`Présent non défini pour ${v.inf}`);
}

export function present(v: FrVerb, p: FrPerson): string {
  return presentForms(v)[p];
}

export function participle(v: FrVerb, g: FrGender = 'm', plural = false): string {
  let pp = v.pp;
  if (!pp) {
    if (v.ir2) pp = `${v.inf.slice(0, -2)}i`;
    else if (v.inf.endsWith('er')) pp = `${v.inf.slice(0, -2)}é`;
    else throw new Error(`Participe passé non défini pour ${v.inf}`);
  }
  if (g === 'f') pp += 'e';
  if (plural && !pp.endsWith('s')) pp += 's';
  return pp;
}

function imparfaitStem(v: FrVerb): string {
  if (v.imp) return v.imp;
  const nous = present(v, 3);
  if (!nous.endsWith('ons')) throw new Error(`Imparfait non dérivable pour ${v.inf}`);
  return nous.slice(0, -3);
}

export function imparfait(v: FrVerb, p: FrPerson): string {
  let st = imparfaitStem(v);
  const end = IMP_ENDINGS[p];
  if (end.startsWith('i')) {
    if (st.endsWith('ge')) st = st.slice(0, -1);
    else if (st.endsWith('ç')) st = `${st.slice(0, -1)}c`;
  }
  return `${st}${end}`;
}

export function futureStem(v: FrVerb): string {
  if (v.fut) return v.fut;
  if (v.inf.endsWith('re')) return v.inf.slice(0, -1);
  return v.inf;
}

export function futur(v: FrVerb, p: FrPerson): string {
  return `${futureStem(v)}${FUT_ENDINGS[p]}`;
}

export function conditionnel(v: FrVerb, p: FrPerson): string {
  return `${futureStem(v)}${IMP_ENDINGS[p]}`;
}

// ---------- Verbes auxiliaires (intégrés pour l'autonomie du module) ----------

export const ETRE: FrVerb = { inf: 'être', pres: 'suis|es|est|sommes|êtes|sont', pp: 'été', fut: 'ser', imp: 'ét' };
export const AVOIR: FrVerb = { inf: 'avoir', pres: 'ai|as|a|avons|avez|ont', pp: 'eu', fut: 'aur' };
export const ALLER: FrVerb = { inf: 'aller', pres: 'vais|vas|va|allons|allez|vont', pp: 'allé', aux: 'être', fut: 'ir' };
export const VENIR: FrVerb = { inf: 'venir', pres: 'viens|viens|vient|venons|venez|viennent', pp: 'venu', aux: 'être', fut: 'viendr' };

const REFLEXIVE = ['me', 'te', 'se', 'nous', 'vous', 'se'];

export function reflexive(p: FrPerson): string {
  return REFLEXIVE[p];
}

export interface FrVerbPhraseOptions {
  tense: FrTense;
  person: FrPerson;
  gender: FrGender;
  plural: boolean;
  /** Verbe pronominal (se lever). */
  pronominal?: boolean;
  /** Négation : « pas », « jamais », « pas encore », « plus », « rien »… */
  neg?: string | null;
  /** Adverbe placé après le verbe conjugué (souvent, déjà, toujours…). */
  adv?: string | null;
  /** Pronom complément placé avant le verbe (le, la, lui…). */
  objPronoun?: string | null;
  /** Accord du participe avec un complément direct placé avant (je l'ai vue). */
  objAgree?: { g: FrGender; plural: boolean } | null;
}

/**
 * Produit les mots du groupe verbal (sans le sujet) dans l'ordre français.
 * Exemple : { tense: 'pc', person: 2, gender: 'f', neg: 'pas', pronominal: true }
 *           + se lever → ["ne", "s'est"...] (élision appliquée par frJoin).
 */
export function frVerbPhrase(v: FrVerb, o: FrVerbPhraseOptions): string[] {
  const p = o.person;
  const refl = o.pronominal ? reflexive(p) : null;
  // « ne » + pronoms (réfléchi, complément) précèdent le verbe conjugué aux temps
  // simples et composés ; dans les périphrases, les pronoms précèdent l'infinitif.
  const pre: string[] = o.neg ? ['ne'] : [];
  const negWords = o.neg ? o.neg.split(' ') : [];
  const adv = o.adv ? [o.adv] : [];
  const clitics = [...(refl ? [refl] : []), ...(o.objPronoun ? [o.objPronoun] : [])];

  const agreeWithSubject = o.pronominal || v.aux === 'être';

  switch (o.tense) {
    case 'infinitive':
      return [...(o.neg ? ['ne', ...negWords] : []), ...clitics, v.inf, ...adv];
    case 'present':
      return [...pre, ...clitics, present(v, p), ...negWords, ...adv];
    case 'imparfait':
      return [...pre, ...clitics, imparfait(v, p), ...negWords, ...adv];
    case 'futur':
      return [...pre, ...clitics, futur(v, p), ...negWords, ...adv];
    case 'conditionnel':
      return [...pre, ...clitics, conditionnel(v, p), ...negWords, ...adv];
    case 'pc': {
      const aux = agreeWithSubject ? ETRE : AVOIR;
      const pp = agreeWithSubject
        ? participle(v, o.gender, o.plural)
        : o.objAgree
          ? participle(v, o.objAgree.g, o.objAgree.plural)
          : participle(v);
      return [...pre, ...clitics, present(aux, p), ...negWords, ...adv, pp];
    }
    case 'pqp':
    case 'condPasse':
    case 'futAnt': {
      const aux = agreeWithSubject ? ETRE : AVOIR;
      const pp = agreeWithSubject
        ? participle(v, o.gender, o.plural)
        : o.objAgree
          ? participle(v, o.objAgree.g, o.objAgree.plural)
          : participle(v);
      const conj = o.tense === 'pqp' ? imparfait(aux, p) : o.tense === 'condPasse' ? conditionnel(aux, p) : futur(aux, p);
      return [...pre, ...clitics, conj, ...negWords, ...adv, pp];
    }
    case 'futurProche':
      return [...pre, present(ALLER, p), ...negWords, ...adv, ...clitics, v.inf];
    case 'venirDe':
      return [...pre, present(VENIR, p), ...negWords, 'de', ...clitics, v.inf];
    case 'enTrainDe':
      return [...pre, present(ETRE, p), ...negWords, 'en', 'train', 'de', ...clitics, v.inf];
    case 'enTrainDeImp':
      return [...pre, imparfait(ETRE, p), ...negWords, 'en', 'train', 'de', ...clitics, v.inf];
    default:
      return [v.inf];
  }
}

/** Groupe verbal avec un modal conjugué (pouvoir, devoir, vouloir, savoir) + infinitif. */
export function frModalPhrase(
  modal: FrVerb,
  modalTense: 'present' | 'conditionnel' | 'imparfait' | 'futur' | 'pc' | 'condPasse',
  v: FrVerb,
  o: Omit<FrVerbPhraseOptions, 'tense'>,
): string[] {
  const conj = frVerbPhrase(modal, { ...o, pronominal: false, tense: modalTense, objPronoun: null, objAgree: null, adv: null });
  const refl = o.pronominal ? [reflexive(o.person)] : [];
  return [...conj, ...(o.adv ? [o.adv] : []), ...refl, ...(o.objPronoun ? [o.objPronoun] : []), v.inf];
}

// ---------- Noms, articles, possessifs ----------

export interface FrNoun {
  fr: string;
  g: FrGender;
  /** Pluriel irrégulier. */
  pl?: string;
}

export function frPlural(n: FrNoun): string {
  if (n.pl) return n.pl;
  const w = n.fr;
  const sp = w.indexOf(' ');
  if (sp > 0) {
    // « carte postale » → « cartes postales » ; « salle de bain » → « salles de bain »
    const head = w.slice(0, sp);
    const rest = w.slice(sp + 1);
    if (/^(de|d'|à|en)\b/.test(rest)) return `${frPluralWord(head)} ${rest}`;
    return `${frPluralWord(head)} ${rest.split(' ').map(frPluralWord).join(' ')}`;
  }
  return frPluralWord(w);
}

const OUX = new Set(['bijou', 'caillou', 'chou', 'genou', 'hibou', 'joujou', 'pou']);

export function frPluralWord(w: string): string {
  if (/[sxz]$/.test(w)) return w;
  if (/(eau|au)$/.test(w)) return `${w}x`;
  if (/eu$/.test(w) && w !== 'pneu' && w !== 'bleu') return `${w}x`;
  if (/ou$/.test(w) && OUX.has(w)) return `${w}x`;
  if (/al$/.test(w) && !['festival', 'carnaval', 'bal', 'récital', 'chacal'].includes(w)) return `${w.slice(0, -2)}aux`;
  return `${w}s`;
}

export type FrDet = 'def' | 'indef' | 'part' | 'poss' | 'dem' | 'none';

export interface FrAdjForms {
  m: string;
  f: string;
  mpl?: string;
  fpl?: string;
  /** Forme masculine devant voyelle : nouvel, bel, vieil. */
  mv?: string;
}

export interface FrNPOptions {
  plural?: boolean;
  /** Préposition qui se contracte avec l'article (à + le = au, de + le = du). */
  prep?: 'à' | 'de' | null;
  /** Contexte négatif : un/une/des/du → de. */
  negated?: boolean;
  /** Possesseur pour les déterminants possessifs. */
  possessor?: { person: FrPerson };
  /** Adjectif placé avant le nom (« nouvelle voiture »). */
  preAdj?: FrAdjForms | null;
  /** Adjectif placé après le nom. */
  postAdj?: FrAdjForms | null;
}

const POSS: Record<FrPerson, { m: string; f: string; pl: string }> = {
  0: { m: 'mon', f: 'ma', pl: 'mes' },
  1: { m: 'ton', f: 'ta', pl: 'tes' },
  2: { m: 'son', f: 'sa', pl: 'ses' },
  3: { m: 'notre', f: 'notre', pl: 'nos' },
  4: { m: 'votre', f: 'votre', pl: 'vos' },
  5: { m: 'leur', f: 'leur', pl: 'leurs' },
};

export function adjForm(a: FrAdjForms, g: FrGender, plural: boolean, beforeVowel = false): string {
  if (!plural) {
    if (g === 'f') return a.f;
    return beforeVowel && a.mv ? a.mv : a.m;
  }
  if (g === 'f') return a.fpl ?? frPluralWord(a.f);
  if (a.mpl) return a.mpl;
  if (/[sx]$/.test(a.m)) return a.m;
  if (/eau$/.test(a.m)) return `${a.m}x`;
  if (/al$/.test(a.m)) return `${a.m.slice(0, -2)}aux`;
  return `${a.m}s`;
}

/**
 * Groupe nominal français avec article, contractions et élision.
 * Renvoie une liste de mots à assembler avec frJoin.
 */
export function frNP(n: FrNoun, det: FrDet, o: FrNPOptions = {}): string[] {
  const plural = !!o.plural;
  const nounWord = plural ? frPlural(n) : n.fr;
  const pre = o.preAdj ? adjForm(o.preAdj, n.g, plural, startsWithVowelSound(nounWord)) : null;
  const post = o.postAdj ? adjForm(o.postAdj, n.g, plural) : null;
  const head = [...(pre ? [pre] : []), nounWord, ...(post ? [post] : [])];
  const first = head[0];
  const vowel = startsWithVowelSound(first);
  const prep = o.prep ?? null;

  const withPrep = (article: string[]): string[] => (prep ? [prep, ...article] : article);
  const elidedDef = (): string[] => [`l'${first}`, ...head.slice(1)];

  switch (det) {
    case 'none':
      return withPrep(head);
    case 'def': {
      if (plural) {
        if (prep === 'à') return ['aux', ...head];
        if (prep === 'de') return ['des', ...head];
        return ['les', ...head];
      }
      if (vowel) return withPrep(elidedDef());
      if (n.g === 'm') {
        if (prep === 'à') return ['au', ...head];
        if (prep === 'de') return ['du', ...head];
        return ['le', ...head];
      }
      return withPrep(['la', ...head]);
    }
    case 'indef': {
      if (o.negated) return [...(prep === 'à' ? ['à'] : []), 'de', ...head];
      if (plural) {
        if (prep === 'de') return ['de', ...head]; // « besoin de livres »
        if (pre) return withPrep(['de', ...head]); // « de nouvelles voitures »
        return withPrep(['des', ...head]);
      }
      return withPrep([n.g === 'f' ? 'une' : 'un', ...head]);
    }
    case 'part': {
      if (o.negated || prep === 'de') return [...(prep === 'à' ? ['à'] : []), 'de', ...head];
      if (plural) return withPrep(['des', ...head]);
      if (vowel) return withPrep(['de', ...elidedDef()]);
      return withPrep(n.g === 'm' ? ['du', ...head] : ['de', 'la', ...head]);
    }
    case 'poss': {
      const person = o.possessor?.person ?? 2;
      const set = POSS[person];
      const d = plural ? set.pl : n.g === 'f' && !vowel ? set.f : set.m;
      return withPrep([d, ...head]);
    }
    case 'dem': {
      const d = plural ? 'ces' : n.g === 'f' ? 'cette' : vowel ? 'cet' : 'ce';
      return withPrep([d, ...head]);
    }
    default:
      return head;
  }
}

/** Pronoms sujets. */
export const FR_SUBJECT_PRONOUNS: Record<FrPerson, { m: string; f: string }> = {
  0: { m: 'je', f: 'je' },
  1: { m: 'tu', f: 'tu' },
  2: { m: 'il', f: 'elle' },
  3: { m: 'nous', f: 'nous' },
  4: { m: 'vous', f: 'vous' },
  5: { m: 'ils', f: 'elles' },
};

/** Pronoms toniques (après « que » dans les comparaisons, après préposition). */
export const FR_TONIC: Record<FrPerson, { m: string; f: string }> = {
  0: { m: 'moi', f: 'moi' },
  1: { m: 'toi', f: 'toi' },
  2: { m: 'lui', f: 'elle' },
  3: { m: 'nous', f: 'nous' },
  4: { m: 'vous', f: 'vous' },
  5: { m: 'eux', f: 'elles' },
};

/** « est-ce que » → « est-ce qu' » devant voyelle : géré par frJoin via « que ». */
export const EST_CE_QUE = ['est-ce', 'que'];
