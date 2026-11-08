/**
 * Synthèse vocale (Web Speech API) avec choix d'une voix anglaise, vitesse
 * réglable et gestion des navigateurs non compatibles.
 */

export interface SpeakOptions {
  rate?: number;
  voiceURI?: string | null;
  accent?: 'en-GB' | 'en-US' | 'any';
}

type Listener = () => void;
const listeners = new Set<Listener>();
let cachedVoices: SpeechSynthesisVoice[] = [];

export function ttsSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window && typeof window.SpeechSynthesisUtterance === 'function';
}

function refreshVoices() {
  if (!ttsSupported()) return;
  cachedVoices = window.speechSynthesis.getVoices().filter((v) => /^en([-_]|$)/i.test(v.lang));
  listeners.forEach((l) => l());
}

if (ttsSupported()) {
  refreshVoices();
  window.speechSynthesis.addEventListener?.('voiceschanged', refreshVoices);
}

export function englishVoices(): SpeechSynthesisVoice[] {
  if (!cachedVoices.length) refreshVoices();
  return cachedVoices;
}

export function onVoicesChanged(l: Listener): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

function quality(v: SpeechSynthesisVoice): number {
  let q = 0;
  if (/natural|neural|online|premium|enhanced/i.test(v.name)) q += 4;
  if (/google/i.test(v.name)) q += 2;
  if (v.localService) q += 1;
  return q;
}

export function pickVoice(opts: SpeakOptions): SpeechSynthesisVoice | null {
  const voices = englishVoices();
  if (!voices.length) return null;
  if (opts.voiceURI) {
    const v = voices.find((x) => x.voiceURI === opts.voiceURI);
    if (v) return v;
  }
  const accent = opts.accent ?? 'en-GB';
  const pref = accent === 'any' ? voices : voices.filter((v) => v.lang.replace('_', '-').toLowerCase().startsWith(accent.toLowerCase()));
  const pool = pref.length ? pref : voices;
  return [...pool].sort((a, b) => quality(b) - quality(a))[0];
}

let current: SpeechSynthesisUtterance | null = null;

/** Lit un texte en anglais. La promesse se résout à la fin de la lecture (ou immédiatement si non supporté). */
export function speak(text: string, opts: SpeakOptions = {}): Promise<void> {
  if (!ttsSupported() || !text.trim()) return Promise.resolve();
  const synth = window.speechSynthesis;
  synth.cancel();
  return new Promise((resolve) => {
    const u = new SpeechSynthesisUtterance(text);
    const voice = pickVoice(opts);
    if (voice) {
      u.voice = voice;
      u.lang = voice.lang;
    } else u.lang = opts.accent === 'en-US' ? 'en-US' : 'en-GB';
    u.rate = opts.rate ?? 1;
    u.pitch = 1;
    let done = false;
    const end = () => {
      if (done) return;
      done = true;
      current = null;
      resolve();
    };
    u.onend = end;
    u.onerror = end;
    current = u;
    // Certains navigateurs (Chrome) ignorent une lecture lancée juste après cancel().
    setTimeout(() => synth.speak(u), 30);
    // Sécurité : ne jamais bloquer l'interface
    setTimeout(end, Math.min(30000, 2000 + text.length * 120));
  });
}

export function stopSpeaking(): void {
  if (ttsSupported()) window.speechSynthesis.cancel();
  current = null;
}

export function isSpeaking(): boolean {
  return !!current;
}
