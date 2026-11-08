/**
 * Dialogues interactifs : situations courantes (café, hôtel, magasin,
 * médecin, téléphone…) avec des points de choix. Les variables (boissons,
 * noms, lieux, prix) changent à chaque tirage.
 */
import { shortHash } from '@/engine/core/rng';
import { FEMALE_NAMES, MALE_NAMES } from '@/content/lexicon/subjects';
import type { DialogueExercise, DialogueTurn, Option } from './types';
import type { SpecialContext } from './vocab';

type Vars = Record<string, string>;

interface Choice {
  ok: string;
  wrong: { text: string; tag: string }[];
  why: string;
}

interface Script {
  id: string;
  title: string;
  setting: string;
  level: 'A2' | 'B1';
  other: string;
  vars: (ctx: SpecialContext) => Vars;
  steps: (v: Vars) => ({ say: string; fr: string } | Choice)[];
}

const SURNAMES = ['Smith', 'Taylor', 'Brown', 'Wilson', 'Evans', 'Walker', 'Clarke'];
const pick = <T,>(ctx: SpecialContext, a: readonly T[]) => ctx.rng.pick(a);

const SCRIPTS: Script[] = [
  {
    id: 'cafe',
    title: 'Au café',
    setting: 'Vous commandez une boisson dans un café à Londres.',
    level: 'A2',
    other: 'Barista',
    vars: (ctx) => ({ drink: pick(ctx, ['coffee', 'tea', 'latte', 'hot chocolate', 'cappuccino']), price: pick(ctx, ['3.20', '2.80', '3.50', '4.10']) }),
    steps: (v) => [
      { say: 'Hi there! What can I get you?', fr: 'Bonjour ! Qu\'est-ce que je vous sers ?' },
      { ok: `Can I have a ${v.drink}, please?`, wrong: [{ text: `I want a ${v.drink}.`, tag: 'register' }, { text: `I would like that you give me a ${v.drink}.`, tag: 'register' }, { text: `Can I to have a ${v.drink}, please?`, tag: 'modal_to' }], why: 'Demande polie : Can I have… / Could I have…, please? « I want » est trop direct.' },
      { say: 'Sure. Small or large?', fr: 'Bien sûr. Petit ou grand ?' },
      { ok: 'Large, please.', wrong: [{ text: "I'm large.", tag: 'meaning' }, { text: 'Yes, please.', tag: 'meaning' }, { text: 'A large one, I would.', tag: 'register' }], why: 'On répond simplement par la taille : « Large, please. »' },
      { say: `Anything else?`, fr: 'Autre chose ?' },
      { ok: "No, that's all, thanks. How much is it?", wrong: [{ text: 'No, it is all. How many is it?', tag: 'much_many' }, { text: 'Nothing else. How much it costs?', tag: 'question_order' }], why: "« C'est tout » = That's all. Le prix : How much is it? (much pour l'argent, ordre auxiliaire + sujet)." },
      { say: `That's £${v.price}, please.`, fr: `Ça fait ${v.price.replace('.', ',')} livres, s'il vous plaît.` },
      { ok: 'Here you are.', wrong: [{ text: 'Take.', tag: 'register' }, { text: 'Here it is you.', tag: 'word_order' }], why: 'En tendant quelque chose : « Here you are. » (ou « Here you go. »).' },
    ],
  },
  {
    id: 'hotel',
    title: "À l'hôtel",
    setting: "Vous arrivez à la réception de votre hôtel.",
    level: 'A2',
    other: 'Receptionist',
    vars: (ctx) => ({ name: pick(ctx, SURNAMES), nights: pick(ctx, ['two', 'three', 'four', 'five']) }),
    steps: (v) => [
      { say: 'Good evening. How can I help you?', fr: 'Bonsoir. Que puis-je faire pour vous ?' },
      { ok: `Good evening. I have a reservation in the name of ${v.name}.`, wrong: [{ text: `Good evening. I have a reservation at the name of ${v.name}.`, tag: 'prep_place' }, { text: `Good evening. I reserved on the name ${v.name}.`, tag: 'prep_place' }], why: '« Au nom de » = in the name of.' },
      { say: 'Ah yes. For how many nights?', fr: 'Ah oui. Pour combien de nuits ?' },
      { ok: `For ${v.nights} nights.`, wrong: [{ text: `During ${v.nights} nights.`, tag: 'for_since' }, { text: `Since ${v.nights} nights.`, tag: 'for_since' }], why: 'Une durée : for + durée (for three nights).' },
      { say: 'Perfect. Here is your key. Breakfast is served from seven to ten.', fr: 'Parfait. Voici votre clé. Le petit-déjeuner est servi de 7 h à 10 h.' },
      { ok: 'Thank you. Where is the lift?', wrong: [{ text: 'Thank you. Where the lift is?', tag: 'question_order' }, { text: 'Thank you. Where is it the lift?', tag: 'question_order' }], why: 'Question : Where + is + sujet ? (pas de « it » en plus).' },
    ],
  },
  {
    id: 'directions',
    title: 'Demander son chemin',
    setting: 'Vous êtes perdu(e) dans une ville anglaise.',
    level: 'A2',
    other: 'Passer-by',
    vars: (ctx) => ({ place: pick(ctx, ['station', 'museum', 'post office', 'library', 'town hall']) }),
    steps: (v) => [
      { ok: `Excuse me, how do I get to the ${v.place}?`, wrong: [{ text: `Excuse me, where is it the ${v.place}?`, tag: 'question_order' }, { text: `Excuse me, how I go to the ${v.place}?`, tag: 'question_order' }], why: 'Demander son chemin : How do I get to… ? ou Where is the… ?' },
      { say: `Go straight on and take the second street on the left. The ${v.place} is next to the bank.`, fr: `Allez tout droit et prenez la deuxième rue à gauche. Le bâtiment est à côté de la banque.` },
      { ok: 'Is it far from here?', wrong: [{ text: 'It is far from here?', tag: 'question_order' }, { text: 'Is far from here?', tag: 'question_order' }], why: 'Question avec be : Is + it + … ? Le sujet « it » est obligatoire.' },
      { say: "No, it's about five minutes on foot.", fr: "Non, c'est à environ cinq minutes à pied." },
      { ok: 'Great, thank you very much!', wrong: [{ text: "You're welcome!", tag: 'meaning' }, { text: 'Thanks you!', tag: 'spelling' }], why: "On remercie : Thank you (very much) / Thanks. « You're welcome » répond à un merci." },
    ],
  },
  {
    id: 'shop',
    title: 'Dans un magasin de vêtements',
    setting: 'Vous cherchez un vêtement.',
    level: 'A2',
    other: 'Shop assistant',
    vars: (ctx) => ({ item: pick(ctx, ['jacket', 'jumper', 'T-shirt', 'coat', 'dress']) }),
    steps: (v) => [
      { say: 'Hello! Can I help you?', fr: 'Bonjour ! Je peux vous aider ?' },
      { ok: `Yes, I'm looking for a ${v.item}.`, wrong: [{ text: `Yes, I search a ${v.item}.`, tag: 'false_friend' }, { text: `Yes, I'm looking a ${v.item}.`, tag: 'collocation' }], why: '« Chercher » = look for (avec for) ; « search » s\'emploie pour fouiller un lieu.' },
      { say: 'What size are you?', fr: 'Quelle taille faites-vous ?' },
      { ok: "I'm a medium.", wrong: [{ text: 'I have medium.', tag: 'be_plus_base' }, { text: 'I make medium.', tag: 'collocation' }], why: 'La taille : I\'m a small / a medium / a large.' },
      { say: 'Here you are. Would you like to try it on?', fr: 'Voilà. Voulez-vous l\'essayer ?' },
      { ok: 'Yes, please. Where are the changing rooms?', wrong: [{ text: 'Yes, please. Where are the cabins?', tag: 'false_friend' }, { text: 'Yes, I would like to try on it.', tag: 'word_order' }], why: '« Cabine d\'essayage » = changing room (UK) / fitting room (US). Avec un pronom : try it on.' },
      { say: 'It really suits you!', fr: 'Ça vous va vraiment bien !' },
      { ok: "Thanks! I'll take it.", wrong: [{ text: 'Thanks! I will to take it.', tag: 'will_to' }, { text: 'Thanks! I take it now buy.', tag: 'word_order' }], why: 'Décision prise sur le moment → will : I\'ll take it.' },
    ],
  },
  {
    id: 'doctor',
    title: 'Chez le médecin',
    setting: 'Vous consultez un médecin.',
    level: 'B1',
    other: 'Doctor',
    vars: (ctx) => ({ days: pick(ctx, ['two', 'three', 'four']) }),
    steps: (v) => [
      { say: "Good morning. What's the matter?", fr: "Bonjour. Qu'est-ce qui ne va pas ?" },
      { ok: `I've had a headache for ${v.days} days.`, wrong: [{ text: `I have a headache since ${v.days} days.`, tag: 'present_with_since' }, { text: `I've had a headache since ${v.days} days.`, tag: 'for_since' }], why: '« Depuis + durée » = present perfect + for : I\'ve had… for three days.' },
      { say: 'Have you taken any medicine?', fr: 'Avez-vous pris des médicaments ?' },
      { ok: 'Yes, I took some paracetamol yesterday.', wrong: [{ text: 'Yes, I have taken some paracetamol yesterday.', tag: 'pp_finished_time' }, { text: 'Yes, I take some paracetamol yesterday.', tag: 'tense_past' }], why: 'Avec « yesterday » (moment passé précis) → prétérit.' },
      { say: 'OK. You should rest and drink a lot of water.', fr: 'D\'accord. Vous devriez vous reposer et boire beaucoup d\'eau.' },
      { ok: 'All right. Should I come back next week?', wrong: [{ text: 'All right. Should I to come back next week?', tag: 'modal_to' }, { text: 'All right. Do I should come back next week?', tag: 'question_order' }], why: 'Question avec un modal : Should + sujet + base verbale ?' },
    ],
  },
  {
    id: 'phone',
    title: 'Au téléphone',
    setting: 'Vous appelez une entreprise pour parler à quelqu\'un.',
    level: 'B1',
    other: 'Receptionist',
    vars: (ctx) => ({ name: pick(ctx, SURNAMES) }),
    steps: (v) => [
      { say: 'Good morning, Bright Solutions. How can I help you?', fr: 'Bonjour, Bright Solutions. Que puis-je faire pour vous ?' },
      { ok: `Hello, could I speak to Mr ${v.name}, please?`, wrong: [{ text: `Hello, I want speak to Mr ${v.name}.`, tag: 'infinitive_needed' }, { text: `Hello, could I to speak to Mr ${v.name}?`, tag: 'modal_to' }], why: 'Au téléphone : Could I speak to…, please?' },
      { say: "I'm afraid he's in a meeting. Would you like to leave a message?", fr: 'Je suis désolé, il est en réunion. Voulez-vous laisser un message ?' },
      { ok: 'Yes, please. Could you ask him to call me back?', wrong: [{ text: 'Yes, please. Could you ask him calling me back?', tag: 'infinitive_needed' }, { text: 'Yes, please. Could you ask him to recall me?', tag: 'false_friend' }], why: '« Rappeler quelqu\'un » = call somebody back ; ask somebody TO do something.' },
      { say: 'Of course. When are you available?', fr: 'Bien sûr. Quand êtes-vous disponible ?' },
      { ok: "I'll be at home all afternoon.", wrong: [{ text: 'I will be at home all the afternoon long since.', tag: 'word_order' }, { text: 'I am being at home all afternoon.', tag: 'stative_continuous' }], why: 'Futur simple pour une information : I\'ll be at home…' },
    ],
  },
  {
    id: 'colleague',
    title: 'Un nouveau collègue',
    setting: 'C\'est votre premier jour dans une nouvelle entreprise.',
    level: 'B1',
    other: 'Colleague',
    vars: (ctx) => ({ name: pick(ctx, [...FEMALE_NAMES, ...MALE_NAMES]), years: pick(ctx, ['three', 'five', 'six']) }),
    steps: (v) => [
      { say: `Hi, I'm ${v.name}. You must be the new designer!`, fr: `Salut, je suis ${v.name}. Tu dois être le nouveau designer !` },
      { ok: "Yes, that's right. Nice to meet you!", wrong: [{ text: 'Yes, I am. Enchanted!', tag: 'false_friend' }, { text: 'Yes, it is me. Nice to meet you too!', tag: 'meaning' }], why: 'Pour se présenter : Nice to meet you! (« enchanted » n\'est pas utilisé ainsi).' },
      { say: 'Where did you work before?', fr: 'Où travaillais-tu avant ?' },
      { ok: `I worked for a small company in Bristol for ${v.years} years.`, wrong: [{ text: `I have worked for a small company in Bristol before ${v.years} years.`, tag: 'for_since' }, { text: `I was working for a small company since ${v.years} years.`, tag: 'for_since' }], why: 'Expérience terminée (je n\'y travaille plus) → prétérit + for + durée.' },
      { say: 'So, how do you like it here so far?', fr: 'Alors, ça te plaît ici pour l\'instant ?' },
      { ok: 'I really like it. Everyone is very friendly.', wrong: [{ text: "I'm liking it a lot. Everyone are very friendly.", tag: 'stative_continuous' }, { text: 'I really like. Everyone is very friendly.', tag: 'word_order' }], why: 'like est un verbe d\'état (pas de -ing) et il a besoin d\'un complément : I like it. Everyone + verbe au singulier.' },
    ],
  },
  {
    id: 'plans',
    title: 'Faire des projets',
    setting: 'Un ami vous propose une sortie.',
    level: 'A2',
    other: 'Friend',
    vars: (ctx) => ({ day: pick(ctx, ['Saturday', 'Sunday', 'Friday']), time: pick(ctx, ['half past seven', 'eight', 'seven']) }),
    steps: (v) => [
      { say: 'What are you doing this weekend?', fr: 'Qu\'est-ce que tu fais ce week-end ?' },
      { ok: "I'm not sure yet. Why?", wrong: [{ text: 'Nothing, I am boring.', tag: 'ed_ing' }, { text: "I don't know what I do.", tag: 'future_choice' }], why: '« I\'m boring » = je suis ennuyeux ! Pour « je m\'ennuie » : I\'m bored.' },
      { say: `Do you fancy going to the cinema on ${v.day}?`, fr: `Ça te dit d'aller au cinéma ${v.day === 'Saturday' ? 'samedi' : v.day === 'Sunday' ? 'dimanche' : 'vendredi'} ?` },
      { ok: "I'd love to! What time?", wrong: [{ text: "I'd love! What time?", tag: 'infinitive_needed' }, { text: 'Yes, I fancy to go!', tag: 'gerund_needed' }], why: 'Accepter : I\'d love to! (to reprend le verbe). fancy est suivi de -ing.' },
      { say: `The film starts at ${v.time}. Shall we meet in front of the cinema?`, fr: 'Le film commence à cette heure-là. On se retrouve devant le cinéma ?' },
      { ok: 'Perfect, see you there!', wrong: [{ text: 'Perfect, see you at there!', tag: 'prep_place' }, { text: 'Perfect, we see us there!', tag: 'pronoun_case' }], why: 'Formule courante : See you there! / See you then!' },
    ],
  },
  {
    id: 'train',
    title: 'À la gare',
    setting: 'Vous achetez un billet de train au guichet.',
    level: 'A2',
    other: 'Ticket clerk',
    vars: (ctx) => ({ city: pick(ctx, ['Oxford', 'Brighton', 'York', 'Bath', 'Cambridge']), price: pick(ctx, ['24', '31', '18', '42']), platform: pick(ctx, ['3', '5', '7', '9']) }),
    steps: (v) => [
      { say: 'Next, please!', fr: 'Au suivant, s\'il vous plaît !' },
      { ok: `A return ticket to ${v.city}, please.`, wrong: [{ text: `A go and return to ${v.city}, please.`, tag: 'false_friend' }, { text: `A return ticket for go to ${v.city}.`, tag: 'infinitive_needed' }], why: '« Aller-retour » = a return ticket (UK) / a round-trip ticket (US).' },
      { say: 'When are you coming back?', fr: 'Quand revenez-vous ?' },
      { ok: 'On Sunday evening.', wrong: [{ text: 'In Sunday evening.', tag: 'prep_time' }, { text: 'At Sunday evening.', tag: 'prep_time' }], why: 'on + jour (on Sunday evening).' },
      { say: `That's ${v.price} pounds. The train leaves from platform ${v.platform}.`, fr: `Ça fait ${v.price} livres. Le train part du quai ${v.platform}.` },
      { ok: 'Thank you. Is it a direct train?', wrong: [{ text: 'Thank you. It is a direct train?', tag: 'question_order' }, { text: 'Thank you. Is a direct train?', tag: 'question_order' }], why: 'Question avec be : Is it…? (inversion, sujet obligatoire).' },
    ],
  },
  {
    id: 'restaurant',
    title: 'Réserver une table',
    setting: 'Vous appelez un restaurant pour réserver.',
    level: 'B1',
    other: 'Restaurant',
    vars: (ctx) => ({ n: pick(ctx, ['two', 'four', 'six']), name: pick(ctx, SURNAMES) }),
    steps: (v) => [
      { say: 'Hello, La Piazza. How can I help you?', fr: 'Allô, La Piazza. Que puis-je faire pour vous ?' },
      { ok: `Hi, I'd like to book a table for ${v.n} people for tonight.`, wrong: [{ text: `Hi, I'd like booking a table for ${v.n} people for tonight.`, tag: 'infinitive_needed' }, { text: `Hi, I want to book one table of ${v.n} people.`, tag: 'register' }], why: "I'd like + to + base verbale ; une table pour 4 personnes = a table for four (people)." },
      { say: 'What time would you like?', fr: 'À quelle heure souhaitez-vous venir ?' },
      { ok: "At eight o'clock, if possible.", wrong: [{ text: "To eight o'clock, if possible.", tag: 'prep_time' }, { text: "On eight o'clock, if possible.", tag: 'prep_time' }], why: 'at + heure.' },
      { say: 'Could I have your name, please?', fr: 'Puis-je avoir votre nom, s\'il vous plaît ?' },
      { ok: `Of course. It's ${v.name}.`, wrong: [{ text: `Of course. I call me ${v.name}.`, tag: 'false_friend' }, { text: `Of course. My name are ${v.name}.`, tag: 'be_wrong_form' }], why: 'Donner son nom : It\'s… / My name is… (« je m\'appelle » ne se traduit pas mot à mot).' },
    ],
  },
];

export function dialogueExercise(ctx: SpecialContext): DialogueExercise {
  const pool = SCRIPTS.filter((s) => ctx.level === 'B1' || s.level === 'A2');
  const script = ctx.rng.pick(pool);
  const vars = script.vars(ctx);
  const turns: DialogueTurn[] = script.steps(vars).map((st) => {
    if ('say' in st) return { speaker: script.other, side: 'left', text: st.say, fr: st.fr };
    const options: Option[] = ctx.rng.shuffle([{ text: st.ok, correct: true }, ...st.wrong.map((w) => ({ text: w.text, correct: false, tag: w.tag }))]);
    return { speaker: 'Vous', side: 'right', choice: { options, explanation: st.why } };
  });
  return {
    id: `dialogue-${shortHash(`${ctx.seed}|${script.id}|${JSON.stringify(vars)}`)}`,
    type: 'dialogue',
    skillId: 'dialogues',
    level: script.level,
    difficulty: ctx.difficulty,
    instruction: 'Choisissez la réplique la plus naturelle à chaque étape du dialogue.',
    explanation: script.setting,
    signature: shortHash(`dialogue|${script.id}|${JSON.stringify(vars)}`),
    structure: `dialogue.${script.id}`,
    lexemes: [`dialogue:${script.id}`],
    itemIds: [],
    seed: ctx.seed,
    title: script.title,
    setting: script.setting,
    turns,
  };
}

export const DIALOGUE_COUNT = SCRIPTS.length;
