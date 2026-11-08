/**
 * Calculs des statistiques : découpage d'une période en intervalles (jours,
 * semaines ou mois), indicateurs agrégés, réussite par format, erreurs
 * fréquentes. Fonctions pures, testées séparément de l'interface.
 */
import type { AttemptRecord, DailyStat, SessionRecord } from '@/engine/learning/types';
import type { ExerciseType } from '@/engine/exercises/types';
import { addDays, dayKey } from './dates';

export type Period = '7' | '30' | '90' | 'all';

const MONTHS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];

export function parseDay(key: string): Date {
  const [y, m, d] = key.split('-').map(Number);
  return new Date(y, m - 1, d, 0, 0, 0, 0);
}

export function dayMonthLabel(key: string): string {
  const d = parseDay(key);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Jours couverts par la période (du plus ancien au plus récent). */
export function periodDays(period: Period, daily: Record<string, DailyStat>, now: number): string[] {
  const today = dayKey(now);
  if (period !== 'all') {
    const n = Number(period);
    return Array.from({ length: n }, (_, i) => addDays(today, i - n + 1));
  }
  const active = Object.values(daily)
    .filter((d) => d.exercises > 0)
    .map((d) => d.date)
    .sort();
  const first = active[0] && active[0] < today ? active[0] : today;
  const out: string[] = [];
  let k = first;
  // au plus trois ans d'historique affiché
  while (k <= today && out.length < 1100) {
    out.push(k);
    k = addDays(k, 1);
  }
  return out.length >= 7 ? out : Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));
}

/** Jours de la période précédente de même durée (comparaison). */
export function previousDays(days: string[]): string[] {
  const n = days.length;
  const first = days[0];
  return Array.from({ length: n }, (_, i) => addDays(first, i - n));
}

export interface Totals {
  exercises: number;
  correct: number;
  ms: number;
  xp: number;
  sessions: number;
  activeDays: number;
}

export function totalsOf(days: string[], daily: Record<string, DailyStat>): Totals {
  const t: Totals = { exercises: 0, correct: 0, ms: 0, xp: 0, sessions: 0, activeDays: 0 };
  for (const k of days) {
    const d = daily[k];
    if (!d) continue;
    t.exercises += d.exercises;
    t.correct += d.correct;
    t.ms += d.ms;
    t.xp += d.xp;
    t.sessions += d.sessions;
    if (d.exercises > 0) t.activeDays++;
  }
  return t;
}

export interface Bucket {
  key: string;
  /** Premier et dernier jour couverts. */
  from: string;
  to: string;
  /** Libellé court pour l'axe. */
  axis: string;
  /** Libellé complet pour l'info-bulle. */
  label: string;
  totals: Totals;
}

export type Granularity = 'day' | 'week' | 'month';

export function granularityFor(nDays: number): Granularity {
  if (nDays <= 31) return 'day';
  if (nDays <= 210) return 'week';
  return 'month';
}

/** Regroupe les jours en intervalles ; les semaines sont alignées sur le jour le plus récent. */
export function bucketize(days: string[], daily: Record<string, DailyStat>): { granularity: Granularity; buckets: Bucket[] } {
  const granularity = granularityFor(days.length);
  const buckets: Bucket[] = [];
  if (granularity === 'day') {
    for (const k of days) {
      const d = parseDay(k);
      buckets.push({ key: k, from: k, to: k, axis: String(d.getDate()), label: d.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' }), totals: totalsOf([k], daily) });
    }
  } else if (granularity === 'week') {
    for (let end = days.length; end > 0; end -= 7) {
      const chunk = days.slice(Math.max(0, end - 7), end);
      const from = chunk[0];
      const to = chunk[chunk.length - 1];
      buckets.unshift({ key: from, from, to, axis: dayMonthLabel(from), label: `Semaine du ${dayMonthLabel(from)} au ${dayMonthLabel(to)}`, totals: totalsOf(chunk, daily) });
    }
  } else {
    const byMonth = new Map<string, string[]>();
    for (const k of days) {
      const m = k.slice(0, 7);
      const list = byMonth.get(m) ?? [];
      list.push(k);
      byMonth.set(m, list);
    }
    for (const [m, list] of byMonth) {
      const d = parseDay(`${m}-01`);
      buckets.push({
        key: m,
        from: list[0],
        to: list[list.length - 1],
        axis: MONTHS[d.getMonth()],
        label: d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
        totals: totalsOf(list, daily),
      });
    }
  }
  return { granularity, buckets };
}

export interface FormatStat {
  type: ExerciseType;
  total: number;
  correct: number;
}

export function attemptsSince(attempts: AttemptRecord[], fromDay: string): AttemptRecord[] {
  const t0 = parseDay(fromDay).getTime();
  return attempts.filter((a) => a.ts >= t0);
}

export function byFormat(attempts: AttemptRecord[]): FormatStat[] {
  const m = new Map<ExerciseType, FormatStat>();
  for (const a of attempts) {
    const s = m.get(a.type) ?? { type: a.type, total: 0, correct: 0 };
    s.total++;
    if (a.correct) s.correct++;
    m.set(a.type, s);
  }
  return [...m.values()];
}

export interface ErrorStat {
  tag: string;
  count: number;
  /** Compétence où l'erreur apparaît le plus. */
  topSkill: string;
}

/** Erreurs les plus fréquentes (étiquetées), de la plus à la moins fréquente. */
export function topErrors(attempts: AttemptRecord[], limit = 6): { errors: ErrorStat[]; untagged: number; totalErrors: number } {
  const m = new Map<string, { count: number; skills: Map<string, number> }>();
  let untagged = 0;
  let totalErrors = 0;
  for (const a of attempts) {
    if (a.correct) continue;
    totalErrors++;
    if (!a.errorTag) {
      untagged++;
      continue;
    }
    const e = m.get(a.errorTag) ?? { count: 0, skills: new Map<string, number>() };
    e.count++;
    e.skills.set(a.skillId, (e.skills.get(a.skillId) ?? 0) + 1);
    m.set(a.errorTag, e);
  }
  const errors = [...m.entries()]
    .map(([tag, e]) => ({ tag, count: e.count, topSkill: [...e.skills.entries()].sort((x, y) => y[1] - x[1])[0][0] }))
    .sort((a, b) => b.count - a.count || a.tag.localeCompare(b.tag))
    .slice(0, limit);
  return { errors, untagged, totalErrors };
}

export function sessionsSince(sessions: SessionRecord[], fromDay: string): SessionRecord[] {
  const t0 = parseDay(fromDay).getTime();
  return sessions.filter((s) => s.startedAt >= t0);
}
