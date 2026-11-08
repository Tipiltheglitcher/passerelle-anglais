/** Calculs des statistiques : périodes, regroupements, erreurs fréquentes. */
import { describe, expect, it } from 'vitest';
import { attemptsSince, bucketize, byFormat, granularityFor, periodDays, previousDays, topErrors, totalsOf } from './stats';
import { addDays, dayKey, formatDuration, liveStreak } from './dates';
import type { AttemptRecord, DailyStat } from '@/engine/learning/types';

const NOW = new Date(2026, 4, 20, 15).getTime();
const today = dayKey(NOW);

function day(date: string, exercises: number, correct: number): DailyStat {
  return { date, exercises, correct, xp: correct * 10, ms: exercises * 20000, sessions: 1 };
}

describe('périodes', () => {
  it('7, 30 et 90 jours se terminent aujourd’hui', () => {
    for (const p of ['7', '30', '90'] as const) {
      const days = periodDays(p, {}, NOW);
      expect(days).toHaveLength(Number(p));
      expect(days[days.length - 1]).toBe(today);
    }
  });

  it('« tout » part du premier jour actif', () => {
    const daily = { [addDays(today, -40)]: day(addDays(today, -40), 5, 4) };
    const days = periodDays('all', daily, NOW);
    expect(days[0]).toBe(addDays(today, -40));
    expect(days).toHaveLength(41);
  });

  it('période précédente de même longueur', () => {
    const days = periodDays('7', {}, NOW);
    const prev = previousDays(days);
    expect(prev).toHaveLength(7);
    expect(prev[6]).toBe(addDays(days[0], -1));
  });
});

describe('regroupements', () => {
  const daily: Record<string, DailyStat> = {};
  for (let k = 0; k < 120; k += 3) {
    const d = addDays(today, -k);
    daily[d] = day(d, 10, 7);
  }

  it('jours, semaines ou mois selon la durée', () => {
    expect(granularityFor(30)).toBe('day');
    expect(granularityFor(90)).toBe('week');
    expect(granularityFor(400)).toBe('month');
  });

  it('les totaux sont conservés quel que soit le regroupement', () => {
    const days = periodDays('90', daily, NOW);
    const total = totalsOf(days, daily);
    const { granularity, buckets } = bucketize(days, daily);
    expect(granularity).toBe('week');
    expect(buckets.reduce((n, b) => n + b.totals.exercises, 0)).toBe(total.exercises);
    expect(buckets[buckets.length - 1].to).toBe(today);
    expect(total.correct / total.exercises).toBeCloseTo(0.7);
    expect(total.activeDays).toBe(30);
  });
});

describe('réponses enregistrées', () => {
  const at = (over: Partial<AttemptRecord>): AttemptRecord => ({
    ts: NOW,
    sessionId: 's',
    mode: 'guided',
    exerciseId: 'e',
    type: 'cloze',
    skillId: 'present_simple',
    correct: true,
    score: 1,
    ms: 1000,
    signature: 'x',
    structure: 'y',
    ...over,
  });
  const attempts = [
    at({ correct: false, errorTag: 'third_person_s' }),
    at({ correct: false, errorTag: 'third_person_s', skillId: 'frequency_adverbs' }),
    at({ correct: false, errorTag: 'third_person_s' }),
    at({ correct: false, errorTag: 'article_a_an', skillId: 'articles', type: 'mcq' }),
    at({ correct: false, type: 'translateFrEn' }),
    at({ correct: true, type: 'mcq' }),
    at({ correct: true, ts: NOW - 100 * 86400000 }),
  ];

  it('erreurs les plus fréquentes, avec la notion concernée', () => {
    const { errors, untagged, totalErrors } = topErrors(attempts);
    expect(errors[0]).toEqual({ tag: 'third_person_s', count: 3, topSkill: 'present_simple' });
    expect(errors[1].tag).toBe('article_a_an');
    expect(untagged).toBe(1);
    expect(totalErrors).toBe(5);
  });

  it('réussite par format et filtrage par période', () => {
    const recent = attemptsSince(attempts, addDays(today, -29));
    expect(recent).toHaveLength(6);
    const f = byFormat(recent);
    expect(f.find((x) => x.type === 'mcq')).toEqual({ type: 'mcq', total: 2, correct: 1 });
  });
});

describe('dates', () => {
  it('série en cours rompue après un jour sans activité', () => {
    expect(liveStreak(5, today, NOW)).toBe(5);
    expect(liveStreak(5, addDays(today, -1), NOW)).toBe(5);
    expect(liveStreak(5, addDays(today, -2), NOW)).toBe(0);
    expect(liveStreak(5, undefined, NOW)).toBe(0);
  });

  it('durées lisibles, sans afficher de temps fictif', () => {
    expect(formatDuration(0)).toBe('0 min');
    expect(formatDuration(45000)).toBe('45 s');
    expect(formatDuration(5 * 60000)).toBe('5 min');
    expect(formatDuration(95 * 60000)).toBe('1 h 35');
  });
});
