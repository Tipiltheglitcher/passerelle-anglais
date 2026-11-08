/** Sujets de phrase : pronoms, prénoms et groupes nominaux de personnes. */
import type { Subject } from './types';

export const PRONOUNS: Subject[] = [
  { id: 'i', en: 'I', fr: 'je', person: 1, num: 'sg', g: 'm', pron: true, proper: true },
  { id: 'i_f', en: 'I', fr: 'je', person: 1, num: 'sg', g: 'f', pron: true, proper: true },
  { id: 'you', en: 'you', fr: 'tu', person: 2, num: 'sg', g: 'm', pron: true },
  { id: 'you_f', en: 'you', fr: 'tu', person: 2, num: 'sg', g: 'f', pron: true },
  { id: 'he', en: 'he', fr: 'il', person: 3, num: 'sg', g: 'm', pron: true },
  { id: 'she', en: 'she', fr: 'elle', person: 3, num: 'sg', g: 'f', pron: true },
  { id: 'we', en: 'we', fr: 'nous', person: 1, num: 'pl', g: 'm', pron: true },
  { id: 'you_pl', en: 'you', fr: 'vous', person: 2, num: 'pl', g: 'm', pron: true },
  { id: 'they', en: 'they', fr: 'ils', person: 3, num: 'pl', g: 'm', pron: true },
  { id: 'they_f', en: 'they', fr: 'elles', person: 3, num: 'pl', g: 'f', pron: true },
];

const FEMALE = ['Emma', 'Lucy', 'Sarah', 'Anna', 'Mia', 'Chloe', 'Sophie', 'Lily', 'Grace', 'Ella', 'Olivia', 'Hannah', 'Kate', 'Laura', 'Amy', 'Jessica', 'Rachel', 'Alice', 'Zoe', 'Megan'];
const MALE = ['Tom', 'Jack', 'David', 'Ben', 'Leo', 'Oliver', 'James', 'Daniel', 'Noah', 'Harry', 'Mark', 'Peter', 'Paul', 'Luke', 'Ryan', 'Adam', 'Max', 'Ethan', 'Josh', 'Sam'];

export const NAMES: Subject[] = [
  ...FEMALE.map((n): Subject => ({ id: `n_${n.toLowerCase()}`, en: n, fr: n, person: 3, num: 'sg', g: 'f', proper: true })),
  ...MALE.map((n): Subject => ({ id: `n_${n.toLowerCase()}`, en: n, fr: n, person: 3, num: 'sg', g: 'm', proper: true })),
];

export const FEMALE_NAMES = FEMALE;
export const MALE_NAMES = MALE;

export const PEOPLE: Subject[] = [
  { id: 'my_brother', en: 'my brother', fr: 'mon frère', person: 3, num: 'sg', g: 'm' },
  { id: 'my_sister', en: 'my sister', fr: 'ma sœur', person: 3, num: 'sg', g: 'f' },
  { id: 'my_parents', en: 'my parents', fr: 'mes parents', person: 3, num: 'pl', g: 'm' },
  { id: 'my_friends', en: 'my friends', fr: 'mes amis', person: 3, num: 'pl', g: 'm' },
  { id: 'my_best_friend', en: 'my best friend', fr: 'mon meilleur ami', person: 3, num: 'sg', g: 'm' },
  { id: 'my_cousin', en: 'my cousin', fr: 'ma cousine', person: 3, num: 'sg', g: 'f' },
  { id: 'our_neighbours', en: 'our neighbours', fr: 'nos voisins', person: 3, num: 'pl', g: 'm' },
  { id: 'my_colleagues', en: 'my colleagues', fr: 'mes collègues', person: 3, num: 'pl', g: 'm' },
  { id: 'the_children', en: 'the children', fr: 'les enfants', person: 3, num: 'pl', g: 'm', child: true },
  { id: 'my_grandmother', en: 'my grandmother', fr: 'ma grand-mère', person: 3, num: 'sg', g: 'f' },
  { id: 'my_uncle', en: 'my uncle', fr: 'mon oncle', person: 3, num: 'sg', g: 'm' },
  { id: 'my_aunt', en: 'my aunt', fr: 'ma tante', person: 3, num: 'sg', g: 'f' },
  { id: 'my_dad', en: 'my dad', fr: 'mon père', person: 3, num: 'sg', g: 'm' },
  { id: 'my_mum', en: 'my mum', fr: 'ma mère', person: 3, num: 'sg', g: 'f' },
  { id: 'our_teacher', en: 'our teacher', fr: 'notre professeur', person: 3, num: 'sg', g: 'm' },
  { id: 'my_boss', en: 'my boss', fr: 'mon patron', person: 3, num: 'sg', g: 'm' },
];

/** Équivalences acceptées dans les réponses (mum/mom, neighbours/neighbors…). */
export const SUBJECT_ALTS: Record<string, string[]> = {
  my_mum: ['my mum', 'my mom', 'my mother'],
  my_dad: ['my dad', 'my father'],
  our_neighbours: ['our neighbours', 'our neighbors'],
  my_grandmother: ['my grandmother', 'my grandma', 'my granny'],
};

export const ALL_SUBJECTS: Subject[] = [...PRONOUNS, ...NAMES, ...PEOPLE];

/** Pronom personnel anglais correspondant à un sujet (pour les reprises et question tags). */
export function subjectPronounEn(s: Subject): string {
  if (s.pron) return s.en === 'I' ? 'I' : s.en;
  if (s.num === 'pl') return 'they';
  return s.g === 'f' ? 'she' : 'he';
}

/** Pronom sujet français correspondant. */
export function subjectPronounFr(s: Subject): string {
  if (s.pron) return s.fr;
  if (s.num === 'pl') return s.g === 'f' ? 'elles' : 'ils';
  return s.g === 'f' ? 'elle' : 'il';
}

/** Indice de personne française (0–5). */
export function frPersonOf(s: Subject): 0 | 1 | 2 | 3 | 4 | 5 {
  if (s.person === 1) return s.num === 'sg' ? 0 : 3;
  if (s.person === 2) return s.num === 'sg' ? 1 : 4;
  return s.num === 'sg' ? 2 : 5;
}
