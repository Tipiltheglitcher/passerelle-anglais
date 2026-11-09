/**
 * Primitives cryptographiques (Web Crypto, disponibles nativement dans
 * Cloudflare Workers).
 *
 * Mot de passe : le navigateur dérive d'abord une clé avec PBKDF2-SHA256
 * (600 000 itérations, sel lié au pseudo), puis le serveur hache cette clé
 * avec PBKDF2-SHA256 et un sel aléatoire propre au compte. Le mot de passe
 * ne quitte jamais l'appareil et le serveur ne stocke qu'un hachage salé ;
 * l'essentiel du coût est payé côté client, ce qui reste compatible avec la
 * limite de temps CPU du forfait gratuit de Workers.
 */
const enc = new TextEncoder();

export const SERVER_ITERATIONS = 10_000;

export function b64url(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

export function fromB64url(s: string): Uint8Array<ArrayBuffer> {
  const b = atob(s.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((s.length + 3) % 4));
  const out = new Uint8Array(b.length);
  for (let i = 0; i < b.length; i++) out[i] = b.charCodeAt(i);
  return out;
}

export function hex(buf: ArrayBuffer | Uint8Array): string {
  const bytes = buf instanceof Uint8Array ? buf : new Uint8Array(buf);
  let s = '';
  for (const b of bytes) s += b.toString(16).padStart(2, '0');
  return s;
}

export function randomBytes(n: number): Uint8Array<ArrayBuffer> {
  const out = new Uint8Array(n);
  crypto.getRandomValues(out);
  return out;
}

export async function sha256Hex(text: string): Promise<string> {
  return hex(await crypto.subtle.digest('SHA-256', enc.encode(text)));
}

/** Hachage d'une clé de connexion (déjà dérivée côté client). */
export async function hashKey(key: string, salt: Uint8Array<ArrayBuffer>, iterations: number): Promise<string> {
  const material = await crypto.subtle.importKey('raw', enc.encode(key), 'PBKDF2', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt, iterations }, material, 256);
  return hex(bits);
}

/** Comparaison en temps constant de deux chaînes de même nature. */
export function timingSafeEqual(a: string, b: string): boolean {
  let diff = a.length ^ b.length;
  const n = Math.max(a.length, b.length);
  for (let i = 0; i < n; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0);
  return diff === 0;
}
