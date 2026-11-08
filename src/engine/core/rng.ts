/**
 * Générateur pseudo-aléatoire déterministe (mulberry32) initialisé à partir d'une graine texte.
 * Toute la génération d'exercices passe par cette interface : une même graine produit
 * toujours le même exercice, ce qui rend les tests reproductibles et permet de
 * rejouer exactement un exercice (révision des erreurs, défi quotidien).
 */
export interface Rng {
  readonly seed: string;
  /** Nombre dans [0, 1). */
  next(): number;
  /** Entier dans [min, max] (bornes incluses). */
  int(min: number, max: number): number;
  pick<T>(items: readonly T[]): T;
  /** Tirage pondéré ; les poids négatifs ou nuls sont ignorés. */
  pickWeighted<T>(items: readonly T[], weight: (item: T) => number): T;
  shuffle<T>(items: readonly T[]): T[];
  /** n éléments distincts (ou moins si la liste est plus courte). */
  sample<T>(items: readonly T[], n: number): T[];
  chance(probability: number): boolean;
  /** Dérive un générateur indépendant et déterministe pour un sous-problème. */
  fork(label: string): Rng;
}

/** Hachage 32 bits (variante de cyrb53 tronquée) d'une chaîne. */
export function hashString(input: string): number {
  let h1 = 0xdeadbeef ^ input.length;
  let h2 = 0x41c6ce57 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    const ch = input.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  return (h1 ^ h2) >>> 0;
}

/** Identifiant court et stable dérivé d'une chaîne (base 36). */
export function shortHash(input: string): string {
  return hashString(input).toString(36);
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function createRng(seed: string | number): Rng {
  const seedText = String(seed);
  const random = mulberry32(hashString(seedText));
  let forks = 0;

  const rng: Rng = {
    seed: seedText,
    next: random,
    int(min, max) {
      if (max < min) [min, max] = [max, min];
      return min + Math.floor(random() * (max - min + 1));
    },
    pick(items) {
      if (items.length === 0) throw new Error('Rng.pick sur une liste vide');
      return items[Math.floor(random() * items.length)];
    },
    pickWeighted(items, weight) {
      if (items.length === 0) throw new Error('Rng.pickWeighted sur une liste vide');
      let total = 0;
      const weights = items.map((it) => {
        const w = Math.max(0, weight(it));
        total += w;
        return w;
      });
      if (total <= 0) return items[Math.floor(random() * items.length)];
      let r = random() * total;
      for (let i = 0; i < items.length; i++) {
        r -= weights[i];
        if (r < 0) return items[i];
      }
      return items[items.length - 1];
    },
    shuffle(items) {
      const out = items.slice();
      for (let i = out.length - 1; i > 0; i--) {
        const j = Math.floor(random() * (i + 1));
        [out[i], out[j]] = [out[j], out[i]];
      }
      return out;
    },
    sample(items, n) {
      return rng.shuffle(items).slice(0, Math.max(0, n));
    },
    chance(probability) {
      return random() < probability;
    },
    fork(label) {
      forks += 1;
      return createRng(`${seedText}/${label}#${forks}`);
    },
  };
  return rng;
}

/** Graine aléatoire non déterministe pour l'usage courant de l'application. */
export function randomSeed(): string {
  const cryptoObj = typeof globalThis !== 'undefined' ? globalThis.crypto : undefined;
  if (cryptoObj && 'getRandomValues' in cryptoObj) {
    const buf = new Uint32Array(2);
    cryptoObj.getRandomValues(buf);
    return `${buf[0].toString(36)}${buf[1].toString(36)}`;
  }
  return `${Date.now().toString(36)}${Math.floor(Math.random() * 1e9).toString(36)}`;
}
