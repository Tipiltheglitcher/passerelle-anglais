/**
 * Gestion du thème clair / sombre : préférence enregistrée, suivi du thème
 * système, et préférence de réduction des animations.
 */
import type { Settings, ThemePref } from '@/engine/learning/types';

const KEY = 'passerelle.theme';

export function systemPrefersDark(): boolean {
  return typeof window !== 'undefined' && !!window.matchMedia?.('(prefers-color-scheme: dark)').matches;
}

export function resolveTheme(pref: ThemePref): 'light' | 'dark' {
  if (pref === 'system') return systemPrefersDark() ? 'dark' : 'light';
  return pref;
}

export function applyTheme(pref: ThemePref) {
  const theme = resolveTheme(pref);
  document.documentElement.dataset.theme = theme;
  document.querySelectorAll('meta[name="theme-color"]').forEach((m) => m.setAttribute('content', theme === 'dark' ? '#0d1020' : '#f6f6fb'));
  try {
    localStorage.setItem(KEY, pref);
  } catch {
    /* stockage indisponible : sans conséquence */
  }
}

export function applyMotion(motion: Settings['motion']) {
  document.documentElement.dataset.motion = motion;
}

/** Réagit aux changements du thème système quand la préférence est « système ». */
export function watchSystemTheme(getPref: () => ThemePref): () => void {
  const mq = window.matchMedia?.('(prefers-color-scheme: dark)');
  if (!mq) return () => {};
  const on = () => {
    if (getPref() === 'system') applyTheme('system');
  };
  mq.addEventListener?.('change', on);
  return () => mq.removeEventListener?.('change', on);
}

export function prefersReducedMotion(motion: Settings['motion']): boolean {
  if (motion === 'reduce') return true;
  if (motion === 'full') return false;
  return !!window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
}
