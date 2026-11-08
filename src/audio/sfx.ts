/** Petits sons de retour (succès / erreur) générés avec Web Audio. */

let ctx: AudioContext | null = null;

function audio(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  return ctx;
}

function tone(freq: number, start: number, duration: number, gain = 0.06, type: OscillatorType = 'sine') {
  const a = audio();
  if (!a) return;
  const osc = a.createOscillator();
  const g = a.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0, a.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, a.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, a.currentTime + start + duration);
  osc.connect(g).connect(a.destination);
  osc.start(a.currentTime + start);
  osc.stop(a.currentTime + start + duration + 0.05);
}

export function playSuccess(): void {
  try {
    tone(660, 0, 0.12);
    tone(880, 0.09, 0.18);
  } catch {
    /* audio indisponible */
  }
}

export function playError(): void {
  try {
    tone(220, 0, 0.18, 0.05, 'triangle');
    tone(180, 0.12, 0.22, 0.05, 'triangle');
  } catch {
    /* audio indisponible */
  }
}

export function playFanfare(): void {
  try {
    [523, 659, 784, 1047].forEach((f, i) => tone(f, i * 0.1, 0.25, 0.05));
  } catch {
    /* audio indisponible */
  }
}
