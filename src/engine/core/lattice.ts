/**
 * Représentation des réponses acceptées sous forme de « treillis » :
 * une suite de cases (slots) contenant chacune des alternatives (synonymes,
 * mots facultatifs…). Plusieurs treillis peuvent coexister pour représenter
 * des ordres de mots différents mais corrects.
 *
 * La comparaison avec la saisie de l'apprenant :
 *  - ignore la casse, la ponctuation, les variantes UK/US ;
 *  - développe les contractions (don't = do not, she's = she is / she has…) ;
 *  - tolère une faute de frappe sur un mot hors du point de grammaire évalué
 *    (les cases « focus » exigent une correspondance exacte).
 */
import { joinEnglish, joinFrench, levenshtein, stripAccents, tokenize } from './text';

export interface Slot {
  /** Alternatives affichables ; la première est la forme de référence. '' = case facultative. */
  alts: string[];
  /** Le point de grammaire évalué : pas de tolérance aux fautes de frappe. */
  focus?: boolean;
  /** Mot à majuscule permanente (nom propre, « I », jours…). */
  proper?: boolean;
  /** Fonction grammaticale (sujet, auxiliaire, verbe…) — métadonnée pour les exercices. */
  role?: string;
  /** Indice du trou auquel appartient la case (phrases à trous). */
  blank?: number;
}

export interface Lattice {
  slots: Slot[];
  end?: '.' | '?' | '!' | '';
  lang?: 'en' | 'fr';
}

/** Ensemble de réponses acceptées (au moins un treillis). */
export interface AnswerSpec {
  lattices: Lattice[];
}

// ---------- Constructeurs pratiques ----------

export function s(text: string | string[], extra: Partial<Slot> = {}): Slot {
  return { alts: Array.isArray(text) ? text : [text], ...extra };
}

export function opt(text: string | string[]): Slot {
  const alts = Array.isArray(text) ? text : [text];
  return { alts: [...alts, ''] };
}

export function focusSlot(text: string | string[]): Slot {
  return s(text, { focus: true });
}

export function lattice(slots: Slot[], end: Lattice['end'] = '.', lang: Lattice['lang'] = 'en'): Lattice {
  return { slots: slots.filter((sl) => sl.alts.length > 0), end, lang };
}

export function spec(...lattices: Lattice[]): AnswerSpec {
  return { lattices };
}

/** Réponse simple à partir de chaînes alternatives (chaque chaîne = une réponse complète). */
export function specFromStrings(answers: readonly string[], lang: 'en' | 'fr' = 'en'): AnswerSpec {
  return { lattices: answers.map((a) => ({ slots: [{ alts: [a] }], end: '', lang })) };
}

// ---------- Affichage ----------

export function latticeText(l: Lattice): string {
  const parts = l.slots.map((sl) => sl.alts[0]);
  return l.lang === 'fr' ? joinFrench(parts, l.end ?? '') : joinEnglish(parts, l.end ?? '');
}

export function specText(sp: AnswerSpec): string {
  return sp.lattices.length ? latticeText(sp.lattices[0]) : '';
}

/** Texte brut (sans majuscule ni ponctuation ajoutées) — utile pour les trous. */
export function latticeRaw(l: Lattice): string {
  return l.slots
    .map((sl) => sl.alts[0])
    .filter(Boolean)
    .join(' ')
    .replace(/\s+([,.!?;:])/g, '$1');
}

// ---------- Développement des contractions ----------

const NEG_CONTRACTIONS: Record<string, string> = {
  "isn't": 'is', "aren't": 'are', "wasn't": 'was', "weren't": 'were',
  "don't": 'do', "doesn't": 'does', "didn't": 'did',
  "haven't": 'have', "hasn't": 'has', "hadn't": 'had',
  "won't": 'will', "wouldn't": 'would', "can't": 'can', "couldn't": 'could',
  "shouldn't": 'should', "mustn't": 'must', "mightn't": 'might', "needn't": 'need',
  "shan't": 'shall', "oughtn't": 'ought',
};

const S_PRONOUNS = new Set([
  'he', 'she', 'it', 'that', 'what', 'where', 'who', 'there', 'here', 'how', 'when', 'why',
  'everyone', 'everybody', 'nobody', 'somebody', 'someone', 'nothing', 'everything', 'something', 'this',
]);

/** Une position de saisie : l'ensemble des mots qu'elle peut représenter. */
export type TokenSet = ReadonlySet<string>;

/**
 * Développe un mot en une suite de positions.
 * mode 'user' : ambiguïtés conservées (she's → she + {is, has}).
 * mode 'ref'  : forme unique (les références évitent les contractions ambiguës).
 */
export function expandWord(word: string, mode: 'user' | 'ref'): string[][] {
  if (word === 'cannot') return [['can'], ['not']];
  if (word === "let's") return [['let'], ['us']];
  if (word === "o'clock") return [[word]];
  const neg = NEG_CONTRACTIONS[word];
  if (neg) return [[neg], ['not']];
  if (word === "ain't") return [[word]];
  const m = /^([a-z]+)'(m|re|ve|ll|d|s)$/.exec(word);
  if (!m) return [[word]];
  const [, base, suf] = m;
  switch (suf) {
    case 'm':
      return [[base], ['am']];
    case 're':
      return [[base], ['are']];
    case 've':
      return [[base], ['have']];
    case 'll':
      return [[base], ['will']];
    case 'd':
      return mode === 'user' ? [[base], ['would', 'had']] : [[base], ['would']];
    case 's':
      if (S_PRONOUNS.has(base)) return mode === 'user' ? [[base], ['is', 'has']] : [[base], ['is']];
      // nom + 's : possessif (référence) ; possessif ou is/has (saisie)
      return mode === 'user' ? [[base], ["'s", 'is', 'has']] : [[base], ["'s"]];
    default:
      return [[word]];
  }
}

/** Mots isolés « 's », « 're »… tapés avec un espace : rattachés au mot précédent. */
function attachDetached(tokens: string[]): string[] {
  const out: string[] = [];
  for (const t of tokens) {
    if (/^'(s|re|m|ll|ve|d)$/.test(t) && out.length) out[out.length - 1] += t;
    else if (t === "n't" && out.length) out[out.length - 1] += t;
    else out.push(t);
  }
  return out;
}

export function userTokenSets(input: string, accents = true): TokenSet[] {
  const words = attachDetached(tokenize(input, { accents }));
  const out: TokenSet[] = [];
  for (const w of words) for (const set of expandWord(w, 'user')) out.push(new Set(set));
  return out;
}

const refCache = new Map<string, string[]>();

export function refTokens(text: string, accents = true): string[] {
  const key = `${accents ? 1 : 0}|${text}`;
  const cached = refCache.get(key);
  if (cached) return cached;
  const words = attachDetached(tokenize(text, { accents }));
  const out: string[] = [];
  for (const w of words) for (const set of expandWord(w, 'ref')) out.push(set[0]);
  if (refCache.size > 5000) refCache.clear();
  refCache.set(key, out);
  return out;
}

// ---------- Comparaison ----------

export interface MatchResult {
  ok: boolean;
  /** Nombre de fautes de frappe tolérées. */
  typos: number;
  /** Mots concernés par une faute de frappe tolérée. */
  typoWords: { expected: string; got: string }[];
  /** Correct uniquement si l'on ignore les accents. */
  accentOnly?: boolean;
  /** Index du treillis reconnu. */
  latticeIndex: number;
}

export interface MatchOptions {
  /** Nombre maximal de fautes de frappe tolérées (défaut : selon la longueur). */
  maxTypos?: number;
  /** Autorise une réponse correcte sans les accents (français). */
  accentTolerant?: boolean;
}

function similar(expected: string, got: string): boolean {
  if (expected.length < 4 || got.length < 3) return false;
  if (expected.replace(/'/g, '') === got.replace(/'/g, '')) return true;
  return levenshtein(expected, got, 1) <= 1;
}

interface DpOutcome {
  typos: number;
  typoWords: { expected: string; got: string }[];
}

function matchLattice(
  l: Lattice,
  user: TokenSet[],
  maxTypos: number,
  accents: boolean,
): DpOutcome | null {
  const slots = l.slots.map((sl) => ({
    focus: !!sl.focus,
    alts: sl.alts.map((a) => (a === '' ? [] : refTokens(a, accents))),
  }));
  const memo = new Map<string, DpOutcome | null>();

  const go = (si: number, ui: number, typos: number): DpOutcome | null => {
    if (si === slots.length) return ui === user.length ? { typos: 0, typoWords: [] } : null;
    const key = `${si}:${ui}:${typos}`;
    if (memo.has(key)) return memo.get(key)!;
    let best: DpOutcome | null = null;
    const slot = slots[si];
    for (const alt of slot.alts) {
      if (ui + alt.length > user.length) continue;
      let localTypos = 0;
      const localWords: { expected: string; got: string }[] = [];
      let fail = false;
      for (let k = 0; k < alt.length; k++) {
        const set = user[ui + k];
        const ref = alt[k];
        if (set.has(ref)) continue;
        if (!slot.focus && set.size === 1 && typos + localTypos < maxTypos) {
          const got = [...set][0];
          if (similar(ref, got)) {
            localTypos++;
            localWords.push({ expected: ref, got });
            continue;
          }
        }
        fail = true;
        break;
      }
      if (fail) continue;
      const rest = go(si + 1, ui + alt.length, typos + localTypos);
      if (rest) {
        const total = rest.typos + localTypos;
        if (!best || total < best.typos) {
          best = { typos: total, typoWords: [...localWords, ...rest.typoWords] };
          if (total === 0) break;
        }
      }
    }
    memo.set(key, best);
    return best;
  };
  return go(0, 0, 0);
}

/** Vérifie une saisie libre contre l'ensemble des réponses acceptées. */
export function matchAnswer(input: string, answer: AnswerSpec, opts: MatchOptions = {}): MatchResult {
  const user = userTokenSets(input);
  const wordCount = user.length;
  const maxTypos = opts.maxTypos ?? (wordCount >= 9 ? 2 : wordCount >= 3 ? 1 : 1);
  let best: MatchResult = { ok: false, typos: 0, typoWords: [], latticeIndex: -1 };
  answer.lattices.forEach((l, idx) => {
    if (best.ok && best.typos === 0) return;
    const r = matchLattice(l, user, maxTypos, true);
    if (r && (!best.ok || r.typos < best.typos)) {
      best = { ok: true, typos: r.typos, typoWords: r.typoWords, latticeIndex: idx };
    }
  });
  if (!best.ok && opts.accentTolerant) {
    const userNoAcc = userTokenSets(stripAccents(input), false);
    answer.lattices.forEach((l, idx) => {
      if (best.ok) return;
      const r = matchLattice(l, userNoAcc, maxTypos, false);
      if (r) best = { ok: true, typos: r.typos, typoWords: r.typoWords, latticeIndex: idx, accentOnly: true };
    });
  }
  return best;
}

/** Comparaison exacte (sans tolérance) — utilisée pour l'ordre des mots. */
export function sameTokens(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) return false;
  return true;
}

/** Toutes les phrases de référence d'un treillis (bornées), pour tests et tuiles. */
export function enumerateLattice(l: Lattice, limit = 64): string[][] {
  let acc: string[][] = [[]];
  for (const sl of l.slots) {
    const next: string[][] = [];
    for (const prefix of acc) {
      for (const alt of sl.alts) {
        next.push(alt === '' ? prefix : [...prefix, alt]);
        if (next.length >= limit) break;
      }
      if (next.length >= limit) break;
    }
    acc = next;
  }
  return acc;
}

// ---------- Différences mot à mot (pour le retour visuel) ----------

export type DiffOp =
  | { kind: 'same'; text: string }
  | { kind: 'missing'; text: string }
  | { kind: 'extra'; text: string }
  | { kind: 'wrong'; text: string; expected: string };

/** Différence mot à mot entre la réponse attendue et la saisie (LCS). */
export function diffWords(expected: string, actual: string): DiffOp[] {
  const e = expected.split(/\s+/).filter(Boolean);
  const a = actual.split(/\s+/).filter(Boolean);
  const norm = (w: string) => tokenize(w).join(' ');
  const en = e.map(norm);
  const an = a.map(norm);
  const n = e.length;
  const m = a.length;
  const dp: number[][] = Array.from({ length: n + 1 }, () => new Array<number>(m + 1).fill(0));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = en[i] === an[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }
  const ops: DiffOp[] = [];
  let i = 0;
  let j = 0;
  while (i < n && j < m) {
    if (en[i] === an[j]) {
      ops.push({ kind: 'same', text: a[j] });
      i++;
      j++;
    } else if (dp[i + 1][j] === dp[i][j + 1] && dp[i + 1][j + 1] === dp[i][j]) {
      ops.push({ kind: 'wrong', text: a[j], expected: e[i] });
      i++;
      j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      ops.push({ kind: 'missing', text: e[i] });
      i++;
    } else {
      ops.push({ kind: 'extra', text: a[j] });
      j++;
    }
  }
  while (i < n) ops.push({ kind: 'missing', text: e[i++] });
  while (j < m) ops.push({ kind: 'extra', text: a[j++] });
  return ops;
}
