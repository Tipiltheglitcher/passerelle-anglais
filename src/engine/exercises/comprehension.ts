/**
 * Compréhension écrite et orale générées à partir de « faits » tirés au
 * hasard : le texte et les questions sont construits à partir des mêmes
 * données, ce qui garantit des réponses justes et des distracteurs plausibles.
 */
import { shortHash } from '@/engine/core/rng';
import { FEMALE_NAMES, MALE_NAMES } from '@/content/lexicon/subjects';
import { JOBS } from '@/engine/generator/skills/nouns';
import * as EN from '@/engine/lang/en/morphology';
import type { ListeningExercise, Option, ReadingExercise, ReadingQuestion } from './types';
import type { SpecialContext } from './vocab';

const CITIES = ['London', 'Manchester', 'Bristol', 'Edinburgh', 'Dublin', 'Brighton', 'Oxford', 'Liverpool', 'York', 'Cambridge'];
const COUNTRIES = ['Spain', 'Italy', 'Portugal', 'Greece', 'Japan', 'Canada', 'Mexico', 'Iceland', 'Croatia', 'Morocco'];
const TRANSPORT = [
  { en: 'by bus', fr: 'en bus' },
  { en: 'by bike', fr: 'à vélo' },
  { en: 'by car', fr: 'en voiture' },
  { en: 'on foot', fr: 'à pied' },
  { en: 'by train', fr: 'en train' },
  { en: 'by underground', fr: 'en métro' },
];
const HOBBIES = [
  { ing: 'playing tennis', base: 'play tennis' },
  { ing: 'reading novels', base: 'read novels' },
  { ing: 'cooking', base: 'cook for my friends' },
  { ing: 'swimming', base: 'go swimming' },
  { ing: 'taking photos', base: 'take photos' },
  { ing: 'playing the guitar', base: 'play the guitar' },
  { ing: 'watching old films', base: 'watch old films' },
  { ing: 'painting', base: 'paint' },
  { ing: 'running', base: 'go running in the park' },
];
const WORKPLACES = ['a hospital', 'a bank', 'a school', 'a small company', 'a hotel', 'a big shop', 'a restaurant', 'a museum'];
const COMPANIONS = ['her sister', 'his best friend', 'her parents', 'his girlfriend', 'her colleagues', 'his cousin'];
const PLACES_SAT = ['the museum', 'the old castle', 'the market', 'the cathedral', 'the art gallery', 'the zoo'];
const AFTERNOON = ['went shopping', 'walked by the river', 'had a picnic in the park', 'visited a famous garden', 'took a boat trip'];
const WEATHER = [
  { en: 'rainy', act: 'stayed in their hotel and played cards' },
  { en: 'sunny', act: 'went to the beach' },
  { en: 'cold', act: 'visited a cosy café' },
  { en: 'windy', act: 'went to the cinema' },
];
const FOOD_ADJ = ['delicious', 'excellent', 'a bit disappointing', 'very spicy'];
const TIMES = ['6:30', '7:00', '7:15', '7:45', '8:00', '6:45'];

function opts(correct: string, pool: readonly string[], ctx: SpecialContext, n = 3): Option[] {
  const wrong = ctx.rng.sample(pool.filter((p) => p !== correct), n);
  return ctx.rng.shuffle([{ text: correct, correct: true }, ...wrong.map((w) => ({ text: w, correct: false, tag: 'meaning' }))]);
}

function tf(statement: boolean): Option[] {
  return [
    { text: 'True', correct: statement },
    { text: 'False', correct: !statement, tag: statement ? 'meaning' : undefined },
  ];
}

function baseReading(ctx: SpecialContext, sig: string, explanation: string) {
  return {
    id: `reading-${shortHash(`${ctx.seed}|${sig}`)}`,
    type: 'reading' as const,
    skillId: 'reading',
    level: ctx.level,
    difficulty: ctx.difficulty,
    instruction: 'Lisez le texte, puis répondez aux questions.',
    explanation,
    signature: shortHash(`reading|${sig}`),
    structure: `reading.${sig.split('|')[0]}`,
    lexemes: [],
    itemIds: [],
    seed: ctx.seed,
  };
}

/** Profil personnel (présent simple, going to) — A2. */
function profileText(ctx: SpecialContext): ReadingExercise {
  const female = ctx.rng.chance(0.5);
  const name = ctx.rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
  const age = ctx.rng.int(19, 45);
  const city = ctx.rng.pick(CITIES);
  const job = ctx.rng.pick(JOBS.filter((j) => !['student', 'engineering student'].includes(j.en)));
  const work = ctx.rng.pick(WORKPLACES);
  const time = ctx.rng.pick(TIMES);
  const transport = ctx.rng.pick(TRANSPORT);
  const [h1, h2] = ctx.rng.sample(HOBBIES, 2);
  const country = ctx.rng.pick(COUNTRIES);
  const art = EN.indefiniteArticle(job.en);
  const text = [
    `Hi! My name is ${name}. I'm ${age} years old and I live in ${city}.`,
    `I work as ${art} ${job.en} in ${work}.`,
    `Every morning, I get up at ${time} and I go to work ${transport.en}.`,
    `In my free time, I love ${h1.ing}, and at the weekend I often ${h2.base}.`,
    `Next summer, I'm going to visit ${country} with some friends. I can't wait!`,
  ].join(' ');
  const questions: ReadingQuestion[] = [
    { q: `Where does ${name} live?`, options: opts(city, CITIES, ctx), explanation: `« I live in ${city}. »` },
    { q: `What is ${name}'s job?`, options: opts(`${art} ${job.en}`, JOBS.map((j) => `${EN.indefiniteArticle(j.en)} ${j.en}`), ctx), explanation: `« I work as ${art} ${job.en}. »` },
    { q: `How does ${name} go to work?`, options: opts(capitalize(transport.en), TRANSPORT.map((t) => capitalize(t.en)), ctx), explanation: `« I go to work ${transport.en}. »` },
    { q: `What is ${name} going to do next summer?`, options: opts(`Visit ${country}`, COUNTRIES.map((c) => `Visit ${c}`), ctx), explanation: `« Next summer, I'm going to visit ${country}. »` },
  ];
  const trueStatement = ctx.rng.chance(0.5);
  const otherTime = ctx.rng.pick(TIMES.filter((t) => t !== time));
  questions.push({
    q: `True or false? ${name} gets up at ${trueStatement ? time : otherTime} every morning.`,
    options: tf(trueStatement),
    explanation: `« Every morning, I get up at ${time}. »`,
  });
  return {
    ...baseReading(ctx, `profile|${name}|${city}|${job.en}|${country}`, `Texte au présent simple (habitudes) avec un projet au futur (be going to).`),
    title: `About me: ${name}`,
    text,
    questions: ctx.rng.shuffle(questions).slice(0, 4),
  };
}

/** Récit de week-end (prétérit) — A2/B1. */
function weekendText(ctx: SpecialContext): ReadingExercise {
  const female = ctx.rng.chance(0.5);
  const name = ctx.rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
  const pron = female ? 'She' : 'He';
  const companion = ctx.rng.pick(COMPANIONS.filter((c) => c.startsWith(female ? 'her' : 'his')));
  const city = ctx.rng.pick(CITIES);
  const place = ctx.rng.pick(PLACES_SAT);
  const afternoon = ctx.rng.pick(AFTERNOON);
  const food = ctx.rng.pick(FOOD_ADJ);
  const w = ctx.rng.pick(WEATHER);
  const text = [
    `Last weekend, ${name} went to ${city} with ${companion}.`,
    `On Saturday morning, they visited ${place}, and in the afternoon they ${afternoon}.`,
    `In the evening, they had dinner in a small Italian restaurant. The food was ${food}.`,
    `On Sunday, the weather was ${w.en}, so they ${w.act}.`,
    `They came back home on Sunday evening. ${pron} was tired but very happy.`,
  ].join(' ');
  const questions: ReadingQuestion[] = [
    { q: `Where did ${name} go last weekend?`, options: opts(city, CITIES, ctx), explanation: `« Last weekend, ${name} went to ${city}. »` },
    { q: `Who did ${name} go with?`, options: opts(capitalize(companion.replace(/^(her|his) /, `${female ? 'Her' : 'His'} `)), COMPANIONS.filter((c) => c.startsWith(female ? 'her' : 'his')).map((c) => capitalize(c)), ctx, 2), explanation: `« …with ${companion}. »` },
    { q: 'What did they do on Saturday morning?', options: opts(`They visited ${place}.`, PLACES_SAT.map((p) => `They visited ${p}.`), ctx), explanation: `« On Saturday morning, they visited ${place}. »` },
    { q: 'What was the weather like on Sunday?', options: opts(capitalize(w.en), WEATHER.map((x) => capitalize(x.en)), ctx), explanation: `« On Sunday, the weather was ${w.en}. »` },
    { q: `How did ${name} feel at the end of the weekend?`, options: opts('Tired but happy', ['Bored and sad', 'Angry', 'Ill', 'Disappointed'], ctx), explanation: `« ${pron} was tired but very happy. »` },
  ];
  return {
    ...baseReading(ctx, `weekend|${name}|${city}|${place}|${w.en}`, 'Récit au prétérit : repérez les verbes irréguliers (went, had, came…) et les marqueurs de temps.'),
    title: `${name}'s weekend in ${city}`,
    text,
    questions: ctx.rng.shuffle(questions).slice(0, 4),
  };
}

/** E-mail à un ami (present perfect + futur) — B1. */
function emailText(ctx: SpecialContext): ReadingExercise {
  const female = ctx.rng.chance(0.5);
  const name = ctx.rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
  const friend = ctx.rng.pick([...FEMALE_NAMES, ...MALE_NAMES].filter((n) => n !== name));
  const city = ctx.rng.pick(CITIES);
  const job = ctx.rng.pick(['a job in a bookshop', 'a job in a hotel', 'a job in a small company', 'a job at the university']);
  const months = ctx.rng.pick(['two', 'three', 'six']);
  const course = ctx.rng.pick(['a cooking course', 'a photography course', 'a Spanish course', 'a dance class']);
  const plan = ctx.rng.pick([
    { en: 'visit the castle', q: 'Visit the castle' },
    { en: 'go to a concert', q: 'Go to a concert' },
    { en: 'go hiking in the hills', q: 'Go hiking in the hills' },
    { en: 'try the new Thai restaurant', q: 'Try the new Thai restaurant' },
  ]);
  const text = [
    `Hi ${friend},`,
    `How are you? I'm sorry I haven't written for a long time! I moved to ${city} ${months} months ago and I've been very busy.`,
    `I've already found ${job}, and my colleagues are really friendly. I haven't made many friends outside work yet, so I've just started ${course}.`,
    `Why don't you come and visit me next month? If you come, we'll ${plan.en}. I'm sure you'll love it!`,
    `Write soon,`,
    name,
  ].join('\n');
  const questions: ReadingQuestion[] = [
    { q: `When did ${name} move to ${city}?`, options: opts(`${capitalize(months)} months ago`, ['Two months ago', 'Three months ago', 'Six months ago', 'Last week', 'Two years ago'], ctx), explanation: `« I moved to ${city} ${months} months ago. »` },
    { q: `Has ${name} found a job?`, options: opts(`Yes, ${job.replace(/^a job/, 'a job')}.`, ['No, not yet.', 'Yes, in a hospital.', `No, ${female ? 'she' : 'he'} is a student.`], ctx, 2), explanation: `« I've already found ${job}. » (already = déjà)` },
    { q: `Why has ${name} started ${course}?`, options: opts('To make new friends', ['Because it is free', 'To find a new job', 'Because a colleague asked'], ctx), explanation: `« I haven't made many friends outside work yet, so I've just started ${course}. »` },
    { q: `What will they do if ${friend} comes?`, options: opts(plan.q, ['Visit the castle', 'Go to a concert', 'Go hiking in the hills', 'Try the new Thai restaurant'], ctx), explanation: `« If you come, we'll ${plan.en}. »` },
  ];
  return {
    ...baseReading(ctx, `email|${name}|${city}|${course}`, 'E-mail au present perfect (already, yet, just) et conditionnel de type 1 (If you come, we\'ll…).'),
    title: `An email from ${name}`,
    text,
    questions,
  };
}

/** Petite annonce (B1). */
function adText(ctx: SpecialContext): ReadingExercise {
  const rooms = ctx.rng.pick([1, 2, 3]);
  const price = ctx.rng.pick([650, 780, 850, 920, 1100]);
  const area = ctx.rng.pick(['in the city centre', 'near the station', 'next to a big park', 'close to the university']);
  const pets = ctx.rng.chance(0.5);
  const callTime = ctx.rng.pick(['after 6 pm', 'before 10 am', 'at the weekend']);
  const roomsWord = ['', 'one', 'two', 'three'][rooms];
  const text = [
    `FLAT TO RENT`,
    `Bright ${roomsWord}-bedroom flat ${area}. Modern kitchen, small balcony and fast Wi-Fi.`,
    `£${price} a month, bills not included. ${pets ? 'Pets are welcome.' : 'Sorry, no pets.'}`,
    `Available from 1 September. Please call Mrs Taylor ${callTime}.`,
  ].join('\n');
  const questions: ReadingQuestion[] = [
    { q: 'How many bedrooms does the flat have?', options: opts(capitalize(roomsWord), ['One', 'Two', 'Three', 'Four'], ctx), explanation: `« ${roomsWord}-bedroom flat »` },
    { q: 'How much is the rent?', options: opts(`£${price} a month`, ['£650 a month', '£780 a month', '£850 a month', '£920 a month', '£1,100 a month'].filter((p) => p !== `£${price} a month`), ctx), explanation: `« £${price} a month »` },
    { q: 'Can you have a dog in the flat?', options: tf(pets).map((o) => ({ ...o, text: o.text === 'True' ? 'Yes' : 'No' })), explanation: pets ? '« Pets are welcome. »' : '« Sorry, no pets. »' },
    { q: 'When should you call Mrs Taylor?', options: opts(capitalize(callTime), ['After 6 pm', 'Before 10 am', 'At the weekend', 'At lunchtime'], ctx), explanation: `« Please call Mrs Taylor ${callTime}. »` },
  ];
  return {
    ...baseReading(ctx, `ad|${rooms}|${price}|${area}`, 'Petite annonce : repérez les informations précises (chiffres, horaires, conditions).'),
    title: 'Flat to rent',
    text,
    questions,
  };
}

export function readingExercise(ctx: SpecialContext): ReadingExercise {
  const gens = ctx.level === 'A2' ? [profileText, weekendText] : [profileText, weekendText, emailText, adText];
  return ctx.rng.pick(gens)(ctx);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// ---------------------------------------------------------------------------
// Compréhension orale (annonces, messages, météo)

function baseListening(ctx: SpecialContext, sig: string, explanation: string) {
  return {
    id: `listening-${shortHash(`${ctx.seed}|${sig}`)}`,
    type: 'listening' as const,
    skillId: 'listening',
    level: ctx.level,
    difficulty: ctx.difficulty,
    instruction: 'Écoutez le message (autant de fois que nécessaire), puis répondez.',
    explanation,
    signature: shortHash(`listening|${sig}`),
    structure: `listening.${sig.split('|')[0]}`,
    lexemes: [],
    itemIds: [],
    seed: ctx.seed,
  };
}

export function listeningComprehension(ctx: SpecialContext): ListeningExercise {
  const kind = ctx.rng.pick(['train', 'voicemail', 'weather', 'shop'] as const);
  if (kind === 'train') {
    const city = ctx.rng.pick(CITIES);
    const platform = ctx.rng.int(2, 9);
    const time = ctx.rng.pick(['9:15', '10:40', '11:25', '2:50', '4:05', '6:35']);
    const delay = ctx.rng.pick([10, 15, 20, 25]);
    const text = `Attention please. The ${time} train to ${city} will now leave from platform ${platform}. This train is running about ${delay} minutes late. We apologise for the delay.`;
    const q = ctx.rng.pick([
      { q: 'Which platform will the train leave from?', a: `Platform ${platform}`, pool: [2, 3, 4, 5, 6, 7, 8, 9].map((n) => `Platform ${n}`) },
      { q: 'Where is the train going?', a: city, pool: CITIES },
      { q: 'How late is the train?', a: `About ${delay} minutes`, pool: [10, 15, 20, 25, 30].map((n) => `About ${n} minutes`) },
    ]);
    return {
      ...baseListening(ctx, `train|${city}|${platform}|${delay}|${q.q}`, `Transcription : « ${text} »`),
      mode: 'comprehension',
      audioText: text,
      question: q.q,
      options: opts(q.a, q.pool, ctx),
      transcript: text,
    };
  }
  if (kind === 'voicemail') {
    const female = ctx.rng.chance(0.5);
    const caller = ctx.rng.pick(female ? FEMALE_NAMES : MALE_NAMES);
    const listener = ctx.rng.pick([...FEMALE_NAMES, ...MALE_NAMES].filter((n) => n !== caller));
    const day = ctx.rng.pick(['Friday', 'Saturday', 'Sunday', 'Tuesday']);
    const time = ctx.rng.pick(['seven', 'half past six', 'eight', 'quarter past seven']);
    const place = ctx.rng.pick(['the cinema', 'the station', 'the Italian restaurant', 'the museum']);
    const text = `Hi ${listener}, it's ${caller}. Are you free on ${day} evening? There's a new film I'd really like to see. Shall we meet at ${time} in front of ${place}? Call me back when you get this message. Bye!`;
    const q = ctx.rng.pick([
      { q: `Which day does ${caller} want to meet?`, a: `On ${day}`, pool: ['Friday', 'Saturday', 'Sunday', 'Tuesday', 'Monday'].map((d) => `On ${d}`) },
      { q: 'Where do they meet?', a: `In front of ${place}`, pool: ['the cinema', 'the station', 'the Italian restaurant', 'the museum'].map((p) => `In front of ${p}`) },
      { q: 'What time do they meet?', a: `At ${time}`, pool: ['seven', 'half past six', 'eight', 'quarter past seven', 'nine'].map((t) => `At ${t}`) },
      { q: `What does ${caller} want to do?`, a: 'See a film', pool: ['See a film', 'Have dinner', 'Go shopping', 'Visit a museum'] },
    ]);
    return {
      ...baseListening(ctx, `voicemail|${caller}|${day}|${place}|${q.q}`, `Transcription : « ${text} »`),
      mode: 'comprehension',
      audioText: text,
      question: q.q,
      options: opts(q.a, q.pool, ctx),
      transcript: text,
    };
  }
  if (kind === 'weather') {
    const morning = ctx.rng.pick(['sunny', 'cloudy', 'foggy']);
    const afternoon = ctx.rng.pick(['rain', 'snow', 'be windy']);
    const temp = ctx.rng.pick([4, 8, 12, 17, 22]);
    const text = `And now the weather for tomorrow. It will be ${morning} in the morning, but it's going to ${afternoon} in the afternoon. Temperatures will be around ${temp} degrees. Don't forget your umbrella!`;
    const q = ctx.rng.pick([
      { q: 'What will the weather be like in the morning?', a: capitalize(morning), pool: ['Sunny', 'Cloudy', 'Foggy', 'Rainy'] },
      { q: 'What will happen in the afternoon?', a: afternoon === 'be windy' ? 'It will be windy.' : `It will ${afternoon}.`, pool: ['It will rain.', 'It will snow.', 'It will be windy.', 'It will be sunny.'] },
      { q: 'What will the temperature be?', a: `About ${temp} degrees`, pool: [4, 8, 12, 17, 22, 25].map((n) => `About ${n} degrees`) },
    ]);
    return {
      ...baseListening(ctx, `weather|${morning}|${afternoon}|${temp}|${q.q}`, `Transcription : « ${text} »`),
      mode: 'comprehension',
      audioText: text,
      question: q.q,
      options: opts(q.a, q.pool, ctx),
      transcript: text,
    };
  }
  const dept = ctx.rng.pick(['shoes', 'sports', 'children\'s clothes', 'electronics']);
  const pct = ctx.rng.pick([10, 20, 30, 50]);
  const floor = ctx.rng.pick(['first', 'second', 'third']);
  const close = ctx.rng.pick(['eight', 'nine', 'ten']);
  const text = `Good morning, shoppers! Today only, everything in the ${dept} department is ${pct} percent off. You can find it on the ${floor} floor. Remember that the store closes at ${close} o'clock tonight. Thank you for shopping with us!`;
  const q = ctx.rng.pick([
    { q: 'Which department has a special offer?', a: capitalize(dept), pool: ['Shoes', 'Sports', "Children's clothes", 'Electronics', 'Food'] },
    { q: 'How much is the discount?', a: `${pct} percent`, pool: [10, 20, 30, 50, 40].map((n) => `${n} percent`) },
    { q: 'What time does the store close tonight?', a: `At ${close} o'clock`, pool: ['eight', 'nine', 'ten', 'seven'].map((n) => `At ${n} o'clock`) },
    { q: 'Where is the department?', a: `On the ${floor} floor`, pool: ['first', 'second', 'third', 'ground'].map((f) => `On the ${f} floor`) },
  ]);
  return {
    ...baseListening(ctx, `shop|${dept}|${pct}|${floor}|${q.q}`, `Transcription : « ${text} »`),
    mode: 'comprehension',
    audioText: text,
    question: q.q,
    options: opts(q.a, q.pool, ctx),
    transcript: text,
  };
}
