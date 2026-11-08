/** Utilitaires de dates locales (format AAAA-MM-JJ). */

export function dayKey(ts: number): string {
  const d = new Date(ts);
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${m}-${day}`;
}

export function addDays(key: string, delta: number): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d + delta, 12);
  return dayKey(date.getTime());
}

export function lastDays(n: number, now: number): string[] {
  const today = dayKey(now);
  return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
}

const FR_DAYS = ['dim.', 'lun.', 'mar.', 'mer.', 'jeu.', 'ven.', 'sam.'];

export function shortDayLabel(key: string): string {
  const [y, m, d] = key.split('-').map(Number);
  const date = new Date(y, m - 1, d, 12);
  return `${FR_DAYS[date.getDay()]} ${d}`;
}

export function formatDuration(ms: number): string {
  if (ms <= 0) return '0 min';
  if (ms < 60000) return `${Math.max(1, Math.round(ms / 1000))} s`;
  const min = Math.round(ms / 60000);
  if (min < 60) return `${min} min`;
  const h = Math.floor(min / 60);
  return `${h} h ${String(min % 60).padStart(2, '0')}`;
}

export function relativeDue(due: number, now: number): string {
  const diff = due - now;
  if (diff <= 0) return 'maintenant';
  const days = Math.round(diff / 86400000);
  if (days < 1) return "aujourd'hui";
  if (days === 1) return 'demain';
  if (days < 7) return `dans ${days} jours`;
  if (days < 30) return `dans ${Math.round(days / 7)} sem.`;
  return `dans ${Math.round(days / 30)} mois`;
}

/** Série en cours : elle est rompue si le dernier jour actif est antérieur à hier. */
export function liveStreak(streak: number, lastActive: string | undefined, now: number): number {
  if (!lastActive) return 0;
  const today = dayKey(now);
  return lastActive === today || lastActive === addDays(today, -1) ? streak : 0;
}
