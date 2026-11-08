/**
 * Outils de texte partagés : normalisation pour la comparaison de réponses,
 * mise en forme de phrases, distance d'édition.
 */

const APOSTROPHES = /[‘’ʼ`´′]/g;
const QUOTES = /[“”«»"]/g;
const DASHES = /[‐-―−]/g;

/** Uniformise apostrophes, guillemets, tirets et espaces insécables. */
export function cleanTypography(input: string): string {
  return input
    .normalize('NFC')
    .replace(APOSTROPHES, "'")
    .replace(QUOTES, '"')
    .replace(DASHES, '-')
    .replace(/[\u00a0\u202f\u2009]/g, ' ');
}

export function stripAccents(input: string): string {
  return input.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/** Variantes orthographiques britanniques ↔ américaines, ramenées à une forme unique. */
const SPELLING_EQUIV: Record<string, string> = {
  colour: 'color', colours: 'colors', colourful: 'colorful',
  favourite: 'favorite', favourites: 'favorites',
  centre: 'center', centres: 'centers',
  theatre: 'theater', theatres: 'theaters',
  metre: 'meter', metres: 'meters', kilometre: 'kilometer', kilometres: 'kilometers',
  travelling: 'traveling', travelled: 'traveled', traveller: 'traveler', travellers: 'travelers',
  cancelled: 'canceled', cancelling: 'canceling',
  labelled: 'labeled', modelling: 'modeling',
  realise: 'realize', realised: 'realized', realising: 'realizing',
  organise: 'organize', organised: 'organized', organising: 'organizing',
  recognise: 'recognize', recognised: 'recognized',
  apologise: 'apologize', apologised: 'apologized',
  practise: 'practice', practised: 'practiced', practising: 'practicing',
  neighbour: 'neighbor', neighbours: 'neighbors',
  behaviour: 'behavior', humour: 'humor', honour: 'honor', flavour: 'flavor',
  programme: 'program', programmes: 'programs',
  cheque: 'check', grey: 'gray', jewellery: 'jewelry', pyjamas: 'pajamas',
  enrol: 'enroll', fulfil: 'fulfill', mum: 'mom', mums: 'moms',
  ok: 'okay', 'o.k.': 'okay',
};

const NUMBER_WORDS: Record<string, string> = {
  '0': 'zero', '1': 'one', '2': 'two', '3': 'three', '4': 'four', '5': 'five',
  '6': 'six', '7': 'seven', '8': 'eight', '9': 'nine', '10': 'ten', '11': 'eleven',
  '12': 'twelve', '13': 'thirteen', '14': 'fourteen', '15': 'fifteen', '16': 'sixteen',
  '17': 'seventeen', '18': 'eighteen', '19': 'nineteen', '20': 'twenty', '30': 'thirty',
  '40': 'forty', '50': 'fifty', '60': 'sixty', '100': 'hundred',
};

/**
 * Découpe une saisie en mots normalisés (minuscules, sans ponctuation finale,
 * variantes orthographiques unifiées). Les apostrophes internes sont conservées.
 */
export function tokenize(input: string, opts: { accents?: boolean } = {}): string[] {
  let s = cleanTypography(input).toLowerCase();
  if (opts.accents === false) s = stripAccents(s);
  s = s
    .replace(/(\d)[.,:h](\d)/g, '$1§$2') // protège 7.30 / 7:30 / 1,5
    .replace(/[.,!?;:()[\]{}"…/\\]/g, ' ')
    .replace(/§/g, ':')
    .replace(/-/g, ' ');
  return s
    .split(/\s+/)
    .map(stripWordQuotes)
    .filter(Boolean)
    .map((t) => SPELLING_EQUIV[t] ?? NUMBER_WORDS[t] ?? t);
}

/** Retire les apostrophes utilisées comme guillemets, sauf contraction isolée ('s, 're…). */
function stripWordQuotes(token: string): string {
  if (/^'(s|re|m|ll|ve|d|t)$/.test(token)) return token;
  return token.replace(/^'+/, '').replace(/'+$/, '');
}

/** Forme canonique d'une chaîne pour une comparaison simple. */
export function normalizeText(input: string, opts: { accents?: boolean } = {}): string {
  return tokenize(input, opts).join(' ');
}

export function capitalizeFirst(s: string): string {
  const i = s.search(/\p{L}/u);
  if (i < 0) return s;
  return s.slice(0, i) + s.charAt(i).toUpperCase() + s.slice(i + 1);
}

export function lowerFirst(s: string): string {
  return s.length ? s.charAt(0).toLowerCase() + s.slice(1) : s;
}

/**
 * Assemble des morceaux de phrase en anglais : espaces simples, pas d'espace
 * avant la ponctuation, majuscule initiale et ponctuation finale.
 */
export function joinEnglish(parts: readonly string[], end: '.' | '?' | '!' | '' = '.'): string {
  let s = parts.filter((p) => p !== '').join(' ');
  s = s.replace(/\s+([,.!?;:])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  s = capitalizeFirst(s);
  if (end && !/[.!?]$/.test(s)) s += end;
  return s;
}

/**
 * Assemble une phrase française (typographie française : espace insécable
 * fine avant ? ! ; :).
 */
export function joinFrench(parts: readonly string[], end: '.' | '?' | '!' | '' = '.'): string {
  let s = parts.filter((p) => p !== '').join(' ');
  s = s.replace(/\s+([,.])/g, '$1').replace(/\s{2,}/g, ' ').trim();
  s = s.replace(/\s*([?!;:])/g, '\u00a0$1');
  s = capitalizeFirst(s);
  if (end) {
    if (end === '?' || end === '!') {
      if (!/[?!]$/.test(s)) s += `\u00a0${end}`;
    } else if (!/[.!?]$/.test(s)) s += end;
  }
  return s;
}

/** Distance de Levenshtein bornée (renvoie max+1 si dépassée). */
export function levenshtein(a: string, b: string, max = 8): number {
  if (a === b) return 0;
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const prev = new Array<number>(b.length + 1);
  const cur = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j++) prev[j] = j;
  for (let i = 1; i <= a.length; i++) {
    cur[0] = i;
    let rowMin = cur[0];
    for (let j = 1; j <= b.length; j++) {
      const cost = a.charCodeAt(i - 1) === b.charCodeAt(j - 1) ? 0 : 1;
      cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + cost);
      // transposition simple (Damerau restreint)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        cur[j] = Math.min(cur[j], prev[j - 1]); // approximation : coût 1 pour l'échange
      }
      if (cur[j] < rowMin) rowMin = cur[j];
    }
    if (rowMin > max) return max + 1;
    for (let j = 0; j <= b.length; j++) prev[j] = cur[j];
  }
  return prev[b.length];
}

/** Liste française « a, b et c ». */
export function frenchList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  return `${items.slice(0, -1).join(', ')} et ${items[items.length - 1]}`;
}

export function englishList(items: readonly string[]): string {
  if (items.length <= 1) return items.join('');
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`;
}
