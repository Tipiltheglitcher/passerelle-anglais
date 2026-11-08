/**
 * Noms et déterminants : articles (a/an/the/∅), quantifieurs, there is/are,
 * pronoms et possessifs.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { capitalizeFirst, joinFrench } from '@/engine/core/text';
import { ADJECTIVES } from '@/content/lexicon/adjectives';
import { NOUN_BY_ID, NOUNS } from '@/content/lexicon/nouns';
import { predicate } from '@/content/lexicon/predicates';
import { FEMALE_NAMES, MALE_NAMES, NAMES, PEOPLE, PRONOUNS, frPersonOf } from '@/content/lexicon/subjects';
import { frVerb } from '@/content/lexicon/verbs';
import type { Noun } from '@/content/lexicon/types';
import { realizeEn, type Clause, type ObjPronoun } from '../clause';
import { buildItem, clauseItem, indicesByRole } from '../item';
import { lexemesOf, pickTime } from '../pick';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { cap, chooseParts, mutate } from './common';

function words(text: string, role = 'w'): Slot[] {
  return text.split(' ').filter(Boolean).map((w) => s(w, { role, proper: w === 'I' || /^[A-Z]/.test(w) }));
}

// ---------------------------------------------------------------------------
// Métiers

interface Job {
  en: string;
  m: string;
  f: string;
}

export const JOBS: Job[] = [
  { en: 'doctor', m: 'médecin', f: 'médecin' },
  { en: 'nurse', m: 'infirmier', f: 'infirmière' },
  { en: 'teacher', m: 'professeur', f: 'professeure' },
  { en: 'engineer', m: 'ingénieur', f: 'ingénieure' },
  { en: 'architect', m: 'architecte', f: 'architecte' },
  { en: 'lawyer', m: 'avocat', f: 'avocate' },
  { en: 'journalist', m: 'journaliste', f: 'journaliste' },
  { en: 'accountant', m: 'comptable', f: 'comptable' },
  { en: 'electrician', m: 'électricien', f: 'électricienne' },
  { en: 'dentist', m: 'dentiste', f: 'dentiste' },
  { en: 'pilot', m: 'pilote', f: 'pilote' },
  { en: 'police officer', m: 'policier', f: 'policière' },
  { en: 'firefighter', m: 'pompier', f: 'pompière' },
  { en: 'mechanic', m: 'mécanicien', f: 'mécanicienne' },
  { en: 'farmer', m: 'agriculteur', f: 'agricultrice' },
  { en: 'student', m: 'étudiant', f: 'étudiante' },
  { en: 'vet', m: 'vétérinaire', f: 'vétérinaire' },
  { en: 'hairdresser', m: 'coiffeur', f: 'coiffeuse' },
  { en: 'receptionist', m: 'réceptionniste', f: 'réceptionniste' },
  { en: 'scientist', m: 'scientifique', f: 'scientifique' },
  { en: 'photographer', m: 'photographe', f: 'photographe' },
  { en: 'shop assistant', m: 'vendeur', f: 'vendeuse' },
  { en: 'cook', m: 'cuisinier', f: 'cuisinière' },
  { en: 'musician', m: 'musicien', f: 'musicienne' },
  { en: 'actor', m: 'acteur', f: 'actrice' },
  { en: 'artist', m: 'artiste', f: 'artiste' },
  { en: 'translator', m: 'traducteur', f: 'traductrice' },
  { en: 'office worker', m: 'employé de bureau', f: 'employée de bureau' },
  { en: 'engineering student', m: "étudiant en ingénierie", f: "étudiante en ingénierie" },
  { en: 'IT consultant', m: 'consultant en informatique', f: 'consultante en informatique' },
];

const ZERO_DISTRACTORS = (correct: string): Distractor[] =>
  (['a', 'an', 'the', ''] as const)
    .filter((d) => d !== correct)
    .map((d) => ({ text: d === '' ? '∅' : d, tag: d === '' ? 'article_job' : correct === '' ? 'article_zero' : d === 'the' ? 'article_the' : 'article_a_an' }));

function jobItem(ctx: GenContext) {
  const plural = ctx.rng.chance(0.25);
  const subjPool = plural ? PEOPLE.filter((p) => p.num === 'pl' && !p.child) : [...NAMES, ...PEOPLE.filter((p) => p.num === 'sg'), ...PRONOUNS.filter((p) => p.num === 'sg')];
  const subj = ctx.rng.pick(subjPool);
  const job = ctx.rng.pick(JOBS);
  const frame = ctx.rng.pick([
    { en: 'is', enPl: 'are', fr: 'est', frPl: 'sont', id: 'be' },
    { en: 'wants to be', enPl: 'want to be', fr: 'veut être', frPl: 'veulent être', id: 'want' },
    { en: 'works as', enPl: 'work as', fr: 'travaille comme', frPl: 'travaillent comme', id: 'as' },
  ]);
  const p = subj.person;
  let verbEn = plural ? frame.enPl : frame.en;
  let verbFr = plural ? frame.frPl : frame.fr;
  if (!plural && p !== 3) {
    const pr = PRONOUNS.find((x) => x.id === subj.id)!;
    verbEn = frame.id === 'be' ? EN.beForm('present', pr.person, pr.num) : frame.enPl;
    const fp = pr.person === 1 ? 0 : 1;
    verbFr = frame.id === 'be' ? FR.present(FR.ETRE, fp) : frame.id === 'want' ? `${['veux', 'veux'][fp]} être` : `${['travaille', 'travailles'][fp]} comme`;
  }
  const art = plural ? '' : EN.indefiniteArticle(job.en);
  const jobEn = plural ? EN.pluralize(job.en.split(' ').pop()!) : job.en;
  const jobWords = plural ? [...job.en.split(' ').slice(0, -1), jobEn].join(' ') : job.en;
  const fem = subj.g === 'f';
  let jobFr = fem ? job.f : job.m;
  if (plural) jobFr = jobFr.split(' ').map((w, i) => (i === 0 ? FR.frPluralWord(w) : w)).join(' ');
  const slots: Slot[] = [
    s(subj.en, { role: 'subj', proper: !!subj.proper }),
    ...words(verbEn, 'verb'),
    s(art, { role: 'det' }),
    ...words(jobWords, 'obj'),
  ];
  const fr = joinFrench([FR.frJoin([subj.fr, ...verbFr.split(' '), ...jobFr.split(' ')])], '.');
  return buildItem({
    skillId: 'articles',
    templateId: `art.job.${plural ? 'pl' : art}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['det'])],
    distractors: ZERO_DISTRACTORS(art),
    explanation: plural
      ? `Au pluriel, pas d'article devant un métier : they are ${jobEn}.`
      : `Devant un métier au singulier, l'anglais met obligatoirement a/an (le français n'en met pas) : ${art} ${job.en}. « ${art} » car ${job.en} commence par un son ${art === 'an' ? 'voyelle' : 'consonne'}.`,
    lexemes: [`subj:${subj.id}`, `job:${job.en}`],
    mcqOnly: plural,
  });
}

interface FixedArticle {
  before: string;
  answer: '' | 'a' | 'an' | 'the';
  after: string;
  fr: string;
  why: string;
}

const FIXED_ARTICLES: FixedArticle[] = [
  { before: 'It takes', answer: 'an', after: 'hour to get there.', fr: 'Il faut une heure pour y aller.', why: 'hour se prononce avec un h muet : son voyelle → an.' },
  { before: 'She studies at', answer: 'a', after: 'university in Madrid.', fr: 'Elle étudie dans une université à Madrid.', why: 'university commence par le son « you » (consonne) → a.' },
  { before: 'Rome is', answer: 'a', after: 'European city.', fr: 'Rome est une ville européenne.', why: 'European commence par le son « you » → a.' },
  { before: 'He is', answer: 'an', after: 'honest man.', fr: "C'est un homme honnête.", why: 'honest : h muet → son voyelle → an.' },
  { before: 'We have to wear', answer: 'a', after: 'uniform at school.', fr: "Nous devons porter un uniforme à l'école.", why: 'uniform commence par le son « you » → a.' },
  { before: "I'd like", answer: 'a', after: 'one-way ticket to Bristol, please.', fr: 'Je voudrais un aller simple pour Bristol, s\'il vous plaît.', why: 'one se prononce « wan » (son consonne) → a.' },
  { before: "It's", answer: 'a', after: 'useful app.', fr: "C'est une application utile.", why: 'useful commence par le son « you » → a.' },
  { before: 'She has', answer: 'an', after: 'unusual name.', fr: 'Elle a un prénom inhabituel.', why: 'unusual commence par un son voyelle → an.' },
  { before: 'He is', answer: 'an', after: 'only child.', fr: "C'est un enfant unique.", why: 'only commence par un son voyelle → an.' },
  { before: '', answer: 'the', after: 'sun is shining.', fr: 'Le soleil brille.', why: 'Chose unique (the sun, the moon, the sky) → the.' },
  { before: 'Look at', answer: 'the', after: 'moon!', fr: 'Regarde la lune !', why: 'Chose unique → the moon.' },
  { before: 'I found the information on', answer: 'the', after: 'internet.', fr: "J'ai trouvé l'information sur internet.", why: 'On dit the internet (le français ne met pas d\'article).' },
  { before: 'Can you close', answer: 'the', after: 'door, please?', fr: 'Peux-tu fermer la porte, s\'il te plaît ?', why: 'La porte dont on parle est précise (celle de la pièce) → the.' },
  { before: 'I go to work by', answer: '', after: 'bus.', fr: 'Je vais au travail en bus.', why: 'by + moyen de transport, sans article : by bus, by car, by train.' },
  { before: 'We had', answer: '', after: 'lunch at one o\'clock.', fr: 'Nous avons déjeuné à une heure.', why: 'Pas d\'article devant les repas : have breakfast / lunch / dinner.' },
  { before: 'He goes to', answer: '', after: 'bed at ten.', fr: 'Il se couche à dix heures.', why: 'Expressions figées sans article : go to bed, go to school, go to work.' },
  { before: 'The children are at', answer: '', after: 'school.', fr: "Les enfants sont à l'école.", why: 'at school / at home / at work : pas d\'article.' },
  { before: 'I love', answer: '', after: 'music.', fr: "J'adore la musique.", why: 'Sens général → pas d\'article en anglais (le français dit « la musique »).' },
  { before: '', answer: '', after: 'Dogs are very loyal animals.', fr: 'Les chiens sont des animaux très fidèles.', why: 'Généralité au pluriel → pas d\'article : Dogs are…' },
  { before: 'She speaks', answer: '', after: 'Italian and Spanish.', fr: 'Elle parle italien et espagnol.', why: 'Pas d\'article devant les langues.' },
  { before: 'I bought a book and a magazine.', answer: 'the', after: 'book was great.', fr: "J'ai acheté un livre et un magazine. Le livre était génial.", why: 'Deuxième mention : on sait de quel livre il s\'agit → the.' },
  { before: 'They live in', answer: 'the', after: 'United States.', fr: 'Ils vivent aux États-Unis.', why: 'Pays au nom pluriel ou composé : the United States, the UK, the Netherlands.' },
  { before: 'They live in', answer: '', after: 'France.', fr: 'Ils vivent en France.', why: 'La plupart des pays s\'emploient sans article : France, Spain, Japan.' },
  { before: '', answer: '', after: 'Life is beautiful.', fr: 'La vie est belle.', why: 'Nom abstrait pris au sens général → pas d\'article.' },
  { before: 'My brother plays', answer: 'the', after: 'guitar.', fr: 'Mon frère joue de la guitare.', why: 'play + instrument de musique → the : play the guitar.' },
  { before: 'My brother plays', answer: '', after: 'football.', fr: 'Mon frère joue au football.', why: 'play + sport → pas d\'article : play football, play tennis.' },
  { before: 'What is', answer: 'the', after: 'capital of Italy?', fr: "Quelle est la capitale de l'Italie ?", why: 'Élément unique et précis → the.' },
];

function fixedArticleItem(ctx: GenContext) {
  const f = ctx.rng.pick(FIXED_ARTICLES);
  const afterWords = f.after.replace(/[.!?]$/, '');
  const end = (f.after.match(/[.!?]$/)?.[0] ?? '.') as '.' | '?' | '!';
  const beforeParts = f.before.split(/(?<=[.!?])\s+/);
  const slots: Slot[] = [
    ...beforeParts.flatMap((b, i) => (i < beforeParts.length - 1 ? [s(b, { role: 'ctx', proper: true })] : words(b, 'pre'))),
    s(f.answer, { role: 'det' }),
    ...words(afterWords, 'post').map((sl, i) => (i === 0 && !f.before && f.answer === '' ? { ...sl, proper: true } : sl)),
  ];
  return buildItem({
    skillId: 'articles',
    templateId: `art.fixed.${f.answer || 'zero'}`,
    level: 'A2',
    slots,
    end,
    fr: f.fr,
    blankGroups: [indicesByRole(slots, ['det'])],
    distractors: ZERO_DISTRACTORS(f.answer),
    explanation: f.why,
    lexemes: [`art:${f.after}`],
    mcqOnly: f.answer === '',
  });
}

function aAnAdjItem(ctx: GenContext) {
  const cats = ['vehicle', 'device', 'home', 'clothes'];
  const nounPool = NOUNS.filter((n) => n.c.some((c) => cats.includes(c)) && !n.u && !n.po && n.c.includes('buyable'));
  const noun = ctx.rng.pick(nounPool);
  const nounCat = cats.find((c) => noun.c.includes(c)) ?? 'device';
  const adjPool = ADJECTIVES.filter((a) => a.on.includes(nounCat) && a.id !== 'cheap' && (ctx.level === 'B1' || a.lv === 'A2'));
  if (!adjPool.length) return null;
  const adj = ctx.rng.pick(adjPool);
  const art = EN.indefiniteArticle(adj.en);
  const subj = ctx.rng.pick([...PRONOUNS, ...NAMES]);
  const time = pickTime(ctx, ['past']);
  const c: Clause = { subj, pred: predicate('buy_thing'), obj: { noun, det: 'a', plural: false }, tense: 'pastSimple', time };
  const r = realizeEn(c);
  // remplace l'objet « a car » par « [a] [old] [car] »
  const slots: Slot[] = [];
  for (const sl of r.slots) {
    if (sl.role === 'obj') {
      slots.push(s(art, { role: 'det' }), s(adj.en, { role: 'adj' }), s([noun.en, ...noun.syn], { role: 'obj' }));
    } else slots.push(sl);
  }
  const frNoun = FR.frNP({ fr: noun.fr, g: noun.g, pl: noun.fpl }, 'indef', adj.fpre ? { preAdj: adj.fr } : { postAdj: adj.fr });
  const vp = FR.frVerbPhrase(frVerb('acheter'), { tense: 'pc', person: frPersonOf(subj), gender: subj.g, plural: subj.num === 'pl' });
  const fr = joinFrench([FR.frJoin([subj.fr, ...vp, ...frNoun, time.fr])], '.');
  return buildItem({
    skillId: 'articles',
    templateId: `art.adj.${art}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['det'])],
    distractors: [
      { text: art === 'a' ? 'an' : 'a', tag: 'article_a_an' },
      { text: '∅', tag: 'article_job' },
    ],
    explanation: `L'article dépend du mot qui suit immédiatement (ici l'adjectif « ${adj.en} ») : son ${art === 'an' ? 'voyelle → an' : 'consonne → a'}.`,
    lexemes: [...lexemesOf({ subj, pred: c.pred, obj: c.obj, time }), `adj:${adj.id}`],
  });
}

export const articles: ItemGenerator = (ctx) => {
  const r = ctx.rng.next();
  if (r < 0.35) return jobItem(ctx);
  if (r < 0.75) return fixedArticleItem(ctx);
  return aAnAdjItem(ctx);
};

// ---------------------------------------------------------------------------
// Quantifieurs

interface QNoun {
  en: string;
  fr: string;
  g: 'm' | 'f';
  count: boolean;
  /** Pluriel français (nom toujours pluriel en français : informations…). */
  frPl?: boolean;
}

const Q_NOUNS: QNoun[] = [
  { en: 'milk', fr: 'lait', g: 'm', count: false },
  { en: 'water', fr: 'eau', g: 'f', count: false },
  { en: 'cheese', fr: 'fromage', g: 'm', count: false },
  { en: 'bread', fr: 'pain', g: 'm', count: false },
  { en: 'rice', fr: 'riz', g: 'm', count: false },
  { en: 'coffee', fr: 'café', g: 'm', count: false },
  { en: 'sugar', fr: 'sucre', g: 'm', count: false },
  { en: 'butter', fr: 'beurre', g: 'm', count: false },
  { en: 'orange juice', fr: "jus d'orange", g: 'm', count: false },
  { en: 'eggs', fr: 'œufs', g: 'm', count: true },
  { en: 'apples', fr: 'pommes', g: 'f', count: true },
  { en: 'tomatoes', fr: 'tomates', g: 'f', count: true },
  { en: 'potatoes', fr: 'pommes de terre', g: 'f', count: true },
  { en: 'oranges', fr: 'oranges', g: 'f', count: true },
  { en: 'carrots', fr: 'carottes', g: 'f', count: true },
  { en: 'biscuits', fr: 'biscuits', g: 'm', count: true },
  { en: 'sandwiches', fr: 'sandwichs', g: 'm', count: true },
];

const Q_ABSTRACT: QNoun[] = [
  { en: 'money', fr: 'argent', g: 'm', count: false },
  { en: 'time', fr: 'temps', g: 'm', count: false },
  { en: 'work', fr: 'travail', g: 'm', count: false },
  { en: 'homework', fr: 'devoirs', g: 'm', count: false, frPl: true },
  { en: 'information', fr: 'informations', g: 'f', count: false, frPl: true },
  { en: 'advice', fr: 'conseils', g: 'm', count: false, frPl: true },
  { en: 'luggage', fr: 'bagages', g: 'm', count: false, frPl: true },
  { en: 'friends', fr: 'amis', g: 'm', count: true },
  { en: 'questions', fr: 'questions', g: 'f', count: true },
  { en: 'problems', fr: 'problèmes', g: 'm', count: true },
  { en: 'ideas', fr: 'idées', g: 'f', count: true },
  { en: 'people', fr: 'gens', g: 'm', count: true },
  { en: 'tourists', fr: 'touristes', g: 'm', count: true },
];

function partitiveFr(n: QNoun): string {
  if (n.count || n.frPl) return FR.frJoin(['des', n.fr]);
  return FR.frJoin(FR.frNP({ fr: n.fr, g: n.g }, 'part'));
}

export const quantifiers: ItemGenerator = (ctx) => {
  const tpl = ctx.rng.pick(['howmany', 'some', 'any_neg', 'any_q', 'much_neg', 'few', 'trap'] as const);
  const food = ctx.rng.pick(Q_NOUNS);
  const abs = ctx.rng.pick(Q_ABSTRACT);
  const mk = (before: string, answer: string[], after: string, fr: string, distractors: Distractor[], why: string, id: string, end: '.' | '?' = '.', n?: QNoun) => {
    const slots: Slot[] = [...words(before, 'pre'), s(answer, { role: 'q' }), ...words(after, 'post')];
    return buildItem({
      skillId: 'countable_quantifiers',
      templateId: `q.${id}.${(n ?? food).count ? 'c' : 'u'}`,
      level: 'A2',
      slots,
      end,
      fr,
      blankGroups: [indicesByRole(slots, ['q'])],
      distractors,
      explanation: why,
      lexemes: [`qnoun:${(n ?? food).en}`],
    });
  };
  switch (tpl) {
    case 'howmany': {
      const n = ctx.rng.chance(0.5) ? food : abs;
      const q = n.count ? 'many' : 'much';
      return mk('How', [q], `${n.en} do you need`, joinFrench([FR.frJoin(['de', 'combien', 'de', n.fr, 'as-tu', 'besoin'])], '?'), [
        { text: q === 'many' ? 'much' : 'many', tag: 'much_many' },
        { text: 'lot of', tag: 'much_many' },
      ], `${n.en} est ${n.count ? 'dénombrable (pluriel) → How many' : 'indénombrable → How much'}.`, 'how', '?', n);
    }
    case 'some': {
      const be = food.count ? 'are' : 'is';
      return mk(`There ${be}`, ['some'], `${food.en} in the fridge`, joinFrench([`Il y a ${partitiveFr(food)} dans le frigo`], '.'), [
        { text: 'any', tag: 'some_any' },
        { text: food.count ? 'much' : 'many', tag: 'much_many' },
        { text: 'a', tag: food.count ? 'article_a_an' : 'uncountable_plural' },
      ], `Phrase affirmative → some (« du / des »).`, 'some');
    }
    case 'any_neg': {
      const be = food.count ? "aren't" : "isn't";
      return mk(`There ${be}`, ['any'], `${food.en} in the fridge`, joinFrench([FR.frJoin(['il', "n'y", 'a', 'pas', 'de', ...food.fr.split(' '), 'dans', 'le', 'frigo'])], '.'), [
        { text: 'some', tag: 'some_any' },
        { text: 'no', tag: 'some_any' },
        { text: 'a', tag: food.count ? 'article_a_an' : 'uncountable_plural' },
      ], `Phrase négative → any (« pas de »). « There isn't no… » serait une double négation.`, 'anyneg');
    }
    case 'any_q': {
      const be = food.count ? 'Are' : 'Is';
      return mk(`${be} there`, ['any'], `${food.en} in the fridge`, joinFrench([`Est-ce qu'il y a ${partitiveFr(food)} dans le frigo`], '?'), [
        { text: 'a', tag: food.count ? 'article_a_an' : 'uncountable_plural' },
        { text: food.count ? 'much' : 'many', tag: 'much_many' },
      ], `Question → any (some est réservé aux offres et demandes polies).`, 'anyq', '?');
    }
    case 'much_neg': {
      const n = ctx.rng.chance(0.5) ? abs : food;
      const q = n.count ? 'many' : 'much';
      const subj = ctx.rng.pick(PRONOUNS.filter((p) => !(p.person === 3 && p.num === 'sg')));
      const doNeg = "don't";
      const fp = subj.person === 1 ? (subj.num === 'sg' ? 0 : 3) : subj.person === 2 ? (subj.num === 'sg' ? 1 : 4) : 5;
      const av = FR.present(FR.AVOIR, fp as FR.FrPerson);
      return mk(`${cap(subj.en)} ${doNeg} have`, [q], n.en, joinFrench([FR.frJoin([subj.fr, 'ne', av, 'pas', 'beaucoup', 'de', ...n.fr.split(' ')])], '.'), [
        { text: q === 'many' ? 'much' : 'many', tag: 'much_many' },
        { text: n.count ? 'a little' : 'a few', tag: 'few_little' },
      ], `${n.en} : ${n.count ? 'dénombrable → many' : 'indénombrable → much'} (« beaucoup de » dans une phrase négative).`, 'muchneg', '.', n);
    }
    case 'few': {
      const n = ctx.rng.chance(0.5) ? abs : food;
      if (n.en === 'people' || n.en === 'information' || n.en === 'advice' || n.en === 'luggage' || n.en === 'homework') return null;
      const q = n.count ? 'a few' : 'a little';
      return mk('We have', [q], `${n.en} left`, joinFrench([FR.frJoin(['il', 'nous', 'reste', ...(n.count ? ['quelques', n.fr] : ['un', 'peu', 'de', ...n.fr.split(' ')])])], '.'), [
        { text: n.count ? 'a little' : 'a few', tag: 'few_little' },
        { text: n.count ? 'a bit' : 'some few', tag: 'few_little' },
      ], `${n.count ? 'Dénombrable pluriel → a few (quelques)' : 'Indénombrable → a little (un peu de)'}.`, 'few', '.', n);
    }
    default: {
      // pièges : information, advice, luggage, homework (indénombrables)
      const traps = [
        { before: 'Can you give me', ans: ['some'], after: 'information about the hotel', fr: "Pouvez-vous me donner des informations sur l'hôtel ?", end: '?' as const, d: [{ text: 'an', tag: 'uncountable_plural' }, { text: 'many', tag: 'much_many' }] },
        { before: 'She gave me', ans: ['some'], after: 'good advice', fr: 'Elle m\'a donné de bons conseils.', end: '.' as const, d: [{ text: 'a', tag: 'uncountable_plural' }, { text: 'many', tag: 'much_many' }] },
        { before: 'How', ans: ['much'], after: 'luggage do you have', fr: 'Combien de bagages avez-vous ?', end: '?' as const, d: [{ text: 'many', tag: 'uncountable_plural' }] },
        { before: 'We have', ans: ['a lot of', 'lots of'], after: 'homework tonight', fr: 'Nous avons beaucoup de devoirs ce soir.', end: '.' as const, d: [{ text: 'many', tag: 'uncountable_plural' }, { text: 'a few', tag: 'few_little' }] },
        { before: 'There is', ans: ['a lot of', 'lots of'], after: 'traffic in the city centre', fr: 'Il y a beaucoup de circulation dans le centre-ville.', end: '.' as const, d: [{ text: 'many', tag: 'much_many' }, { text: 'a few', tag: 'few_little' }] },
        { before: 'I have', ans: ['some'], after: 'good news for you', fr: "J'ai de bonnes nouvelles pour toi.", end: '.' as const, d: [{ text: 'a', tag: 'uncountable_plural' }, { text: 'many', tag: 'much_many' }] },
      ];
      const t = ctx.rng.pick(traps);
      const n: QNoun = { en: t.after, fr: '', g: 'm', count: false };
      return mk(t.before, t.ans, t.after, t.fr, t.d, 'information, advice, luggage, homework, news, traffic, furniture… sont indénombrables en anglais : pas de pluriel, pas de a/an, pas de many.', 'trap', t.end, n);
    }
  }
};

// ---------------------------------------------------------------------------
// There is / there are

interface ThingPlace {
  en: string;
  fr: string;
  /** Version « ta/ton » pour les questions. */
  enQ: string;
  frQ: string;
  nouns: string[];
}

const PLACES: ThingPlace[] = [
  { en: 'in my street', fr: 'dans ma rue', enQ: 'in your street', frQ: 'dans ta rue', nouns: ['bakery', 'pharmacy', 'cafe', 'restaurant', 'bank', 'bookshop', 'supermarket'] },
  { en: 'near my house', fr: 'près de chez moi', enQ: 'near your house', frQ: 'près de chez toi', nouns: ['park', 'swimming_pool', 'cinema', 'library', 'station', 'supermarket', 'museum'] },
  { en: 'in my bag', fr: 'dans mon sac', enQ: 'in your bag', frQ: 'dans ton sac', nouns: ['key', 'wallet', 'phone', 'umbrella', 'pen', 'book', 'notebook', 'passport', 'ticket'] },
  { en: 'on the table', fr: 'sur la table', enQ: 'on the table', frQ: 'sur la table', nouns: ['book', 'newspaper', 'key', 'phone', 'laptop', 'flower', 'apple'] },
  { en: 'in the kitchen', fr: 'dans la cuisine', enQ: 'in the kitchen', frQ: 'dans la cuisine', nouns: ['table', 'chair', 'fridge', 'oven', 'plant', 'dishwasher', 'washing_machine'] },
  { en: 'in this town', fr: 'dans cette ville', enQ: 'in this town', frQ: 'dans cette ville', nouns: ['museum', 'cinema', 'hotel', 'park', 'restaurant', 'church', 'stadium', 'zoo'] },
];

const NUMBERS = [
  { en: 'two', fr: 'deux' },
  { en: 'three', fr: 'trois' },
  { en: 'four', fr: 'quatre' },
  { en: 'a lot of', fr: 'beaucoup de' },
];

export const thereIsAre: ItemGenerator = (ctx) => {
  const place = ctx.rng.pick(PLACES);
  const noun: Noun | undefined = NOUN_BY_ID[ctx.rng.pick(place.nouns)];
  if (!noun) return null;
  const plural = ctx.rng.chance(0.45);
  const tense = ctx.rng.pick(['present', 'present', 'past', 'future'] as const);
  const form = ctx.rng.pick(['aff', 'aff', 'neg', 'q'] as const);
  const num = ctx.rng.pick(NUMBERS);
  const enNoun = plural ? EN.pluralize(noun.en) : noun.en;
  const frNoun = plural ? FR.frPlural({ fr: noun.fr, g: noun.g, pl: noun.fpl }) : noun.fr;
  const be = tense === 'future' ? 'will be' : tense === 'past' ? (plural ? 'were' : 'was') : plural ? 'are' : 'is';
  const placeEn = form === 'q' ? place.enQ : place.en;
  const placeFr = form === 'q' ? place.frQ : place.fr;
  let det = '';
  let frDet: string[] = [];
  if (form === 'aff') {
    if (plural) {
      det = num.en;
      frDet = num.fr === 'beaucoup de' ? ['beaucoup', 'de'] : [num.fr];
    } else {
      det = EN.indefiniteArticle(noun.en);
      frDet = [noun.g === 'f' ? 'une' : 'un'];
    }
  } else if (form === 'neg') {
    det = plural ? 'any' : EN.indefiniteArticle(noun.en);
    frDet = ['de'];
  } else {
    det = plural ? 'any' : EN.indefiniteArticle(noun.en);
    frDet = plural ? ['des'] : [noun.g === 'f' ? 'une' : 'un'];
  }
  const frIlYa = tense === 'future' ? 'aura' : tense === 'past' ? 'avait' : 'a';
  let enVerbSlots: Slot[];
  let frWords: string[];
  if (form === 'aff') {
    enVerbSlots = [s('There', { role: 'there', proper: true }), s(be, { role: 'be' })];
    frWords = ['il', 'y', frIlYa, ...frDet, ...frNoun.split(' '), ...placeFr.split(' ')];
  } else if (form === 'neg') {
    const negBe = tense === 'future' ? ["won't be", 'will not be'] : [`${be}n't`, `${be} not`];
    enVerbSlots = [s('There', { role: 'there', proper: true }), s(negBe, { role: 'be' })];
    frWords = ['il', 'n\'y', frIlYa, 'pas', ...frDet, ...frNoun.split(' '), ...placeFr.split(' ')];
  } else {
    if (tense === 'future') {
      enVerbSlots = [s('Will', { role: 'be', proper: true }), s('there', { role: 'there' }), s('be', { role: 'be2' })];
    } else enVerbSlots = [s(cap(be), { role: 'be', proper: true }), s('there', { role: 'there' })];
    frWords = ['est-ce', 'que', 'il', 'y', frIlYa, ...frDet, ...frNoun.split(' '), ...placeFr.split(' ')];
  }
  const slots: Slot[] = [...enVerbSlots, s(det, { role: 'det' }), s(enNoun, { role: 'obj' }), ...words(placeEn, 'place')];
  const fr = joinFrench([FR.frJoin(frWords)], form === 'q' ? '?' : '.');
  const wrongBe = plural ? (tense === 'past' ? 'was' : 'is') : tense === 'past' ? 'were' : 'are';
  const show = (b: string) => (form === 'neg' ? `${b}n't` : form === 'q' ? cap(b) : b);
  const distractors: Distractor[] =
    tense === 'future'
      ? [
          { text: form === 'neg' ? "won't have" : form === 'q' ? 'Will' : 'will have', tag: 'there_is_are' },
        ]
      : [
          { text: show(wrongBe), tag: 'there_is_are' },
          { text: form === 'neg' ? "hasn't" : form === 'q' ? 'Has' : 'has', tag: 'there_is_are' },
          { text: show(tense === 'past' ? (plural ? 'are' : 'is') : plural ? 'were' : 'was'), tag: 'tense_past' },
        ];
  return buildItem({
    skillId: 'there_is_are',
    templateId: `there.${tense}.${form}.${plural ? 'pl' : 'sg'}`,
    level: 'A2',
    slots,
    end: form === 'q' ? '?' : '.',
    fr,
    blankGroups: [indicesByRole(slots, ['be'])],
    hints: [tense === 'past' ? '(passé)' : tense === 'future' ? '(futur)' : undefined],
    distractors: tense === 'future' && form === 'q' ? [] : distractors,
    explanation: `« Il y a » = there is (+ singulier) / there are (+ pluriel). Passé : there was / there were. Futur : there will be. ${form === 'neg' ? 'Négatif : there isn\'t / aren\'t + any.' : ''}${form === 'q' ? 'Question : Is there…? / Are there…?' : ''}`,
    lexemes: [`noun:${noun.id}`],
  });
};

// ---------------------------------------------------------------------------
// Pronoms et possessifs

const POSS_PREDS = ['tidy_room', 'do_homework', 'call_person', 'lose_item', 'charge_phone', 'check_emails', 'meet_friends', 'help_person', 'visit_family', 'sell_thing', 'take_umbrella', 'find_item', 'look_for_item', 'wait_for_person'];

const REFERENTS: { id: string; en: string; pron: ObjPronoun }[] = [
  { id: 'mother', en: 'my mother', pron: { en: 'her', fr: 'la', direct: true, g: 'f', plural: false } },
  { id: 'father', en: 'my father', pron: { en: 'him', fr: 'le', direct: true, g: 'm', plural: false } },
  { id: 'parents', en: 'my parents', pron: { en: 'them', fr: 'les', direct: true, g: 'm', plural: true } },
  { id: 'sister', en: 'my sister', pron: { en: 'her', fr: 'la', direct: true, g: 'f', plural: false } },
  { id: 'brother', en: 'my brother', pron: { en: 'him', fr: 'le', direct: true, g: 'm', plural: false } },
  { id: 'grandparents', en: 'my grandparents', pron: { en: 'them', fr: 'les', direct: true, g: 'm', plural: true } },
  { id: 'aunt', en: 'my aunt', pron: { en: 'her', fr: 'la', direct: true, g: 'f', plural: false } },
  { id: 'uncle', en: 'my uncle', pron: { en: 'him', fr: 'le', direct: true, g: 'm', plural: false } },
];

const POSS_PRON_FR: Record<string, { m: string; f: string; mpl: string; fpl: string }> = {
  mine: { m: 'le mien', f: 'la mienne', mpl: 'les miens', fpl: 'les miennes' },
  yours: { m: 'le tien', f: 'la tienne', mpl: 'les tiens', fpl: 'les tiennes' },
  his: { m: 'le sien', f: 'la sienne', mpl: 'les siens', fpl: 'les siennes' },
  hers: { m: 'le sien', f: 'la sienne', mpl: 'les siens', fpl: 'les siennes' },
  ours: { m: 'le nôtre', f: 'la nôtre', mpl: 'les nôtres', fpl: 'les nôtres' },
  yours_pl: { m: 'le vôtre', f: 'la vôtre', mpl: 'les vôtres', fpl: 'les vôtres' },
  theirs: { m: 'le leur', f: 'la leur', mpl: 'les leurs', fpl: 'les leurs' },
};

export const pronounsPossessives: ItemGenerator = (ctx) => {
  const tpl = ctx.rng.pick(['hisher', 'hisher', 'object', 'posspron', 'genitive'] as const);
  if (tpl === 'hisher') {
    const parts = chooseParts(ctx, (p) => POSS_PREDS.includes(p.id) && (p.obj?.dets.includes('poss') || !!p.tail?.includes('{poss}')), { pronouns: 0.1 });
    if (!parts) return null;
    const obj = parts.obj ? { ...parts.obj, det: 'poss' as const } : undefined;
    const c: Clause = { ...parts, obj, tense: ctx.rng.pick(['presSimple', 'pastSimple', 'presCont'] as const), time: undefined };
    if (c.tense === 'presCont' && parts.pred.k === 'evt') c.tense = 'pastSimple';
    const possEn = EN.pronounsFor(c.subj.person, c.subj.num, c.subj.g).possAdj;
    const others = ['his', 'her', 'their', 'its', 'my'].filter((x) => x !== possEn);
    return clauseItem({
      skillId: 'pronouns_possessives',
      templateId: `pp.poss.${possEn}`,
      level: 'A2',
      clause: c,
      blankRoles: [['poss']],
      distractors: others.map((o) => ({ text: o, tag: (o === 'his' || o === 'her') && (possEn === 'his' || possEn === 'her') ? 'possessive_gender' : 'possessive_pronoun' })),
      neighbours: mutate(ctx, c, ['subj']),
      explanation: `Le possessif anglais s'accorde avec le POSSESSEUR : « ${c.subj.en} » → ${possEn}. (En français, « son / sa / ses » s'accorde avec l'objet possédé.)`,
    });
  }
  if (tpl === 'object') {
    const ref = ctx.rng.pick(REFERENTS);
    const predId = ctx.rng.pick(['call_person', 'help_person', 'wait_for_person', 'visit_family']);
    const pred = predicate(predId);
    const subj = ctx.rng.pick(PRONOUNS);
    const pron: ObjPronoun = predId === 'visit_family' ? { ...ref.pron, fr: ref.pron.plural ? 'leur' : 'lui', direct: false } : ref.pron;
    const c: Clause = { subj, pred, tense: 'presSimple', time: pickTime(ctx, ['habit']), objPronoun: pron };
    const others = ['he', 'she', 'they', 'him', 'her', 'them', 'his', 'it'].filter((x) => x !== pron.en);
    return clauseItem({
      skillId: 'pronouns_possessives',
      templateId: `pp.obj.${pron.en}`,
      level: 'A2',
      clause: c,
      blankRoles: [['obj']],
      hints: [ref.en],
      distractors: others.slice(0, 5).map((o) => ({ text: o, tag: ['he', 'she', 'they'].includes(o) ? 'pronoun_case' : 'pronoun_case' })),
      neighbours: mutate(ctx, c, ['subj']),
      instruction: 'Remplace le groupe entre parenthèses par un pronom complément.',
      explanation: `Après un verbe (ou une préposition), on emploie le pronom complément : ${ref.en} → ${pron.en}. (Sujet : he / she / they ; complément : him / her / them.)`,
    });
  }
  if (tpl === 'posspron') {
    const owner = ctx.rng.pick([
      { q: 'your', a: 'mine', frQ: 'ton', person: 1 },
      { q: 'his', a: 'his', frQ: 'son', person: 2 },
      { q: 'her', a: 'hers', frQ: 'son', person: 2 },
      { q: 'their', a: 'theirs', frQ: 'leur', person: 5 },
      { q: 'our', a: 'ours', frQ: 'notre', person: 3 },
    ]);
    const nounPool = NOUNS.filter((n) => n.c.includes('item') && !n.u && !n.po && n.c.includes('buyable'));
    const noun = ctx.rng.pick(nounPool);
    const ans = owner.a === 'ours' ? 'yours' : owner.a === 'mine' ? 'mine' : owner.a;
    // Question : « Is this your bag? » → « Yes, it's mine. »
    const qText = `Is this ${owner.q} ${noun.en}?`;
    const slots: Slot[] = [s(['Yes, it is', "Yes, it's"], { role: 'pre', proper: true }), s(ans, { role: 'pp' })];
    const frPoss = owner.frQ === 'ton' ? (noun.g === 'f' && !FR.startsWithVowelSound(noun.fr) ? 'ta' : 'ton') : owner.frQ === 'son' ? (noun.g === 'f' && !FR.startsWithVowelSound(noun.fr) ? 'sa' : 'son') : owner.frQ;
    const frAnsKey = owner.a === 'ours' ? 'yours_pl' : ans;
    const frAns = POSS_PRON_FR[frAnsKey][noun.g === 'f' ? 'f' : 'm'];
    const fr = joinFrench([`— Est-ce que c'est ${frPoss} ${noun.fr} ? — Oui, c'est ${frAns}`], '.');
    return buildItem({
      skillId: 'pronouns_possessives',
      templateId: `pp.pron.${ans}`,
      level: 'A2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['pp'])],
      distractors: [
        { text: ans === 'mine' ? 'my' : ans === 'hers' ? 'her' : ans === 'theirs' ? 'their' : ans === 'yours' ? 'your' : 'him', tag: 'possessive_pronoun' },
        { text: ans === 'mine' ? 'me' : ans === 'hers' ? "her's" : ans === 'theirs' ? 'them' : ans === 'yours' ? "your's" : "his's", tag: 'possessive_pronoun' },
        { text: `the ${ans}`, tag: 'possessive_pronoun' },
      ],
      context: qText,
      instruction: 'Complétez la réponse avec un pronom possessif.',
      explanation: `Pronom possessif (remplace « possessif + nom ») : mine, yours, his, hers, ours, theirs — jamais d'article (✗ the mine) ni d'apostrophe (✗ her's).`,
      lexemes: [`noun:${noun.id}`],
    });
  }
  // génitif 's
  const owner = ctx.rng.pick([...FEMALE_NAMES, ...MALE_NAMES].filter((x) => !/s$/.test(x)));
  const nounPool = NOUNS.filter((n) => (n.c.includes('buyable') || n.c.includes('home')) && !n.u && !n.po && !['dress', 'skirt', 'stamp', 'flower', 'souvenir', 'present'].includes(n.id) && !n.c.includes('food'));
  const noun = ctx.rng.pick(nounPool);
  const frDef = FR.frJoin(FR.frNP({ fr: noun.fr, g: noun.g, pl: noun.fpl }, 'def'));
  const slots: Slot[] = [s('This is', { role: 'pre', proper: true }), s(`${owner}'s`, { role: 'gen', proper: true }), s([noun.en, ...noun.syn], { role: 'obj' })];
  return buildItem({
    skillId: 'pronouns_possessives',
    templateId: 'pp.genitive',
    level: 'A2',
    slots,
    end: '.',
    fr: joinFrench([FR.frJoin(['c\'est', ...frDef.split(' '), 'de', owner])], '.'),
    blankGroups: [indicesByRole(slots, ['gen'])],
    hints: [owner],
    distractors: [
      { text: owner, tag: 'possessive_pronoun' },
      { text: `${owner}s`, tag: 'possessive_pronoun' },
      { text: `of ${owner}`, tag: 'possessive_pronoun' },
    ],
    explanation: `« Le/la … de Tom » se dit avec le génitif : ${owner}'s ${noun.en} (possesseur + 's + objet, sans article).`,
    lexemes: [`noun:${noun.id}`],
  });
};

export { capitalizeFirst };
