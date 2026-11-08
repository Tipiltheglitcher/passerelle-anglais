/**
 * Expressions de temps et adverbes de fréquence.
 * La « classe » détermine les temps verbaux compatibles : c'est elle qui rend
 * les exercices non ambigus (yesterday → prétérit, since → present perfect…).
 */
import type { Level } from './types';

export type TimeClass = 'habit' | 'now' | 'past' | 'future' | 'pastPoint' | 'since' | 'for' | 'period';

export interface TimeExpr {
  id: string;
  en: string;
  /** Formulations anglaises également acceptées. */
  alts?: string[];
  fr: string;
  cls: TimeClass;
  /** Peut se placer en tête de phrase. */
  front?: boolean;
  lv: Level;
}

// id | anglais (/variantes) | français | classe | front | niveau
const TABLE = `
every_day|every day|tous les jours|habit|1|A2
every_morning|every morning|tous les matins|habit|1|A2
every_evening|every evening|tous les soirs|habit|1|A2
every_week|every week|toutes les semaines|habit|1|A2
every_weekend|every weekend|tous les week-ends|habit|1|A2
every_summer|every summer|tous les étés|habit|1|A2
on_mondays|on Mondays|le lundi|habit|1|A2
on_saturdays|on Saturdays|le samedi|habit|1|A2
on_sundays|on Sundays|le dimanche|habit|1|A2
at_weekend|at the weekend/on weekends/at weekends/on the weekend|le week-end|habit|1|A2
twice_week|twice a week|deux fois par semaine|habit|0|A2
once_month|once a month|une fois par mois|habit|0|A2
three_times_week|three times a week|trois fois par semaine|habit|0|A2
after_work|after work|après le travail|habit|1|A2
now|now|maintenant|now|0|A2
right_now|right now|en ce moment même|now|1|A2
at_moment|at the moment|en ce moment|now|1|A2
this_week_now|this week|cette semaine|now|1|A2
these_days|these days|ces temps-ci|now|1|B1
yesterday|yesterday|hier|past|1|A2
last_night|last night|hier soir|past|1|A2
last_week|last week|la semaine dernière|past|1|A2
last_month|last month|le mois dernier|past|1|A2
last_year|last year|l'année dernière|past|1|A2
last_summer|last summer|l'été dernier|past|1|A2
last_weekend|last weekend|le week-end dernier|past|1|A2
two_days_ago|two days ago|il y a deux jours|past|1|A2
week_ago|a week ago|il y a une semaine|past|1|A2
three_years_ago|three years ago|il y a trois ans|past|1|A2
ten_minutes_ago|ten minutes ago|il y a dix minutes|past|0|A2
in_2019|in 2019|en 2019|past|1|A2
yesterday_morning|yesterday morning|hier matin|past|1|A2
day_before_yesterday|the day before yesterday|avant-hier|past|1|B1
tomorrow|tomorrow|demain|future|1|A2
next_week|next week|la semaine prochaine|future|1|A2
next_month|next month|le mois prochain|future|1|A2
next_year|next year|l'année prochaine|future|1|A2
next_summer|next summer|l'été prochain|future|1|A2
next_weekend|next weekend|le week-end prochain|future|1|A2
in_two_weeks|in two weeks/in two weeks' time|dans deux semaines|future|1|A2
tonight|tonight/this evening|ce soir|future|1|A2
tomorrow_morning|tomorrow morning|demain matin|future|1|A2
day_after_tomorrow|the day after tomorrow|après-demain|future|1|B1
at_eight_last_night|at eight o'clock last night/at 8 o'clock last night/at eight last night/at 8 last night/at 8 pm last night|hier soir à huit heures|pastPoint|1|A2
this_time_yesterday|at this time yesterday/this time yesterday|hier à la même heure|pastPoint|1|B1
at_midnight|at midnight yesterday|hier à minuit|pastPoint|1|B1
all_day_yesterday|all day yesterday|toute la journée hier|pastPoint|0|A2
since_2015|since 2015|depuis 2015|since|0|A2
since_monday|since Monday|depuis lundi|since|0|A2
since_january|since January|depuis janvier|since|0|A2
since_last_summer|since last summer|depuis l'été dernier|since|0|B1
since_childhood|since I was a child|depuis mon enfance|since|0|B1
for_three_years|for three years|depuis trois ans|for|0|A2
for_long_time|for a long time|depuis longtemps|for|0|A2
for_two_weeks|for two weeks|depuis deux semaines|for|0|A2
for_ten_years|for ten years|depuis dix ans|for|0|A2
for_six_months|for six months|depuis six mois|for|0|A2
for_ages|for ages|depuis une éternité|for|0|B1
for_an_hour|for an hour|depuis une heure|for|0|A2
`;

export const TIME_EXPRESSIONS: TimeExpr[] = TABLE.trim()
  .split('\n')
  .map((line) => {
    const [id, enField, fr, cls, front, lv] = line.split('|');
    const [en, ...alts] = enField.split('/');
    return { id, en, alts, fr, cls: cls as TimeClass, front: front === '1', lv: lv as Level };
  });

export const TIME_BY_ID: Record<string, TimeExpr> = Object.fromEntries(TIME_EXPRESSIONS.map((t) => [t.id, t]));

export function timesOf(...classes: TimeClass[]): TimeExpr[] {
  return TIME_EXPRESSIONS.filter((t) => classes.includes(t.cls));
}

export interface FreqAdverb {
  id: string;
  en: string;
  alts?: string[];
  fr: string;
  /** Adverbe à sens négatif (never → ne … jamais). */
  neg?: boolean;
  /** Fréquence approximative en % (pour les exercices de sens). */
  pct: number;
}

export const FREQ_ADVERBS: FreqAdverb[] = [
  { id: 'always', en: 'always', fr: 'toujours', pct: 100 },
  { id: 'usually', en: 'usually', alts: ['normally', 'generally'], fr: 'généralement', pct: 80 },
  { id: 'often', en: 'often', alts: ['frequently'], fr: 'souvent', pct: 60 },
  { id: 'sometimes', en: 'sometimes', alts: ['occasionally'], fr: 'parfois', pct: 40 },
  { id: 'rarely', en: 'rarely', alts: ['seldom'], fr: 'rarement', pct: 10 },
  { id: 'never', en: 'never', fr: 'jamais', neg: true, pct: 0 },
];

const HOUR_WORDS = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];

export interface ClockTime {
  /** Heure 1–12. */
  h: number;
  m: 0 | 15 | 30 | 45;
  en: string;
  alts: string[];
  fr: string;
}

/** Heure précédée de « at » (« at half past seven » / « à 7 heures et demie »). */
export function clockTime(h: number, m: 0 | 15 | 30 | 45): ClockTime {
  const next = h === 12 ? 1 : h + 1;
  const w = HOUR_WORDS[h];
  const wn = HOUR_WORDS[next];
  const mm = m === 0 ? '00' : String(m);
  const minuteWords = { 0: '', 15: 'fifteen', 30: 'thirty', 45: 'forty-five' }[m];
  let en: string;
  const alts: string[] = [`at ${h}:${mm}`, `at ${w} ${minuteWords}`.trim()];
  let fr: string;
  switch (m) {
    case 0:
      en = `at ${w} o'clock`;
      alts.push(`at ${w}`, `at ${h}`, `at ${h} o'clock`);
      fr = `à ${h} heure${h > 1 ? 's' : ''}`;
      break;
    case 15:
      en = `at quarter past ${w}`;
      alts.push(`at a quarter past ${w}`);
      fr = `à ${h} heure${h > 1 ? 's' : ''} et quart`;
      break;
    case 30:
      en = `at half past ${w}`;
      alts.push(`at half ${w}`);
      fr = `à ${h} heure${h > 1 ? 's' : ''} et demie`;
      break;
    default:
      en = `at quarter to ${wn}`;
      alts.push(`at a quarter to ${wn}`);
      fr = `à ${next} heure${next > 1 ? 's' : ''} moins le quart`;
  }
  return { h, m, en, alts: [...new Set(alts)].filter((a) => a !== en), fr };
}
