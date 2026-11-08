/** Leçons : le présent, le passé, les questions. */
import { ex, pit, table, type Lesson } from './types';

export const PRESENT_PAST_LESSONS: Record<string, Lesson> = {
  present_simple: {
    intro:
      "Le présent simple sert à parler de ce qui est **habituel, régulier ou toujours vrai** : vos habitudes, vos goûts, les faits généraux. C'est le temps le plus fréquent en anglais. Sa seule vraie difficulté : le **-s de la 3ᵉ personne du singulier**.",
    blocks: [
      {
        title: 'Formation',
        text: "On utilise la base verbale (l'infinitif sans to) à toutes les personnes, **sauf avec he, she, it** — et tout sujet singulier (my sister, the train…) — où l'on ajoute **-s**.",
        table: table(['Sujet', 'Verbe', 'Exemple'], ['I / you / we / they', 'base', 'I work in Lyon.'], ['he / she / it', 'base + -s', 'She works in Lyon.']),
      },
      {
        title: "L'orthographe du -s",
        points: [
          'Après -s, -sh, -ch, -x, -o : **-es** (watches, goes, does, fixes).',
          'Consonne + y → **-ies** (study → studies) ; voyelle + y → -s (play → plays).',
          'Irrégulier : have → **has**.',
        ],
      },
      {
        title: "Quand l'utiliser ?",
        examples: [
          ex('I get up at seven every day.', 'Je me lève à sept heures tous les jours.', 'habitude'),
          ex('Water boils at 100 degrees.', "L'eau bout à 100 degrés.", 'vérité générale'),
          ex('My brother lives in London.', 'Mon frère habite à Londres.', 'situation stable'),
          ex('She likes jazz.', 'Elle aime le jazz.', 'goût'),
        ],
      },
    ],
    pitfalls: [
      pit('He work in a bank.', 'He works in a bank.', "Le -s de la 3ᵉ personne est obligatoire, même s'il s'entend à peine."),
      pit('I am work every day.', 'I work every day.', 'Pas de be au présent simple : « je travaille » = I work.'),
      pit('My parents lives in Nice.', 'My parents live in Nice.', 'Sujet pluriel → pas de -s.'),
    ],
    remember: ['Base verbale partout, sauf he / she / it : base + -s.', 'Indices fréquents : every day, usually, on Mondays, often.'],
  },

  present_simple_neg_q: {
    intro:
      "Pour nier ou poser une question au présent simple, l'anglais utilise l'auxiliaire **do** — ou **does** à la 3ᵉ personne. Le verbe principal revient alors à la **base verbale** : le -s passe sur l'auxiliaire.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Forme', 'I / you / we / they', 'he / she / it'],
          ['Négative', "I don't work.", "She doesn't work."],
          ['Question', 'Do you work?', 'Does she work?'],
          ['Réponse courte', "Yes, I do. / No, I don't.", "Yes, she does. / No, she doesn't."],
        ),
        text: "don't = do not ; doesn't = does not. À l'oral comme dans les messages, on emploie presque toujours les formes contractées.",
      },
      {
        title: 'Le verbe be fait exception',
        text: 'Avec **be**, pas de do : on inverse le sujet et le verbe, et on ajoute not.',
        examples: [ex("She isn't French.", "Elle n'est pas française."), ex('Are you tired?', 'Tu es fatigué ?')],
      },
      {
        title: 'Exemples',
        examples: [
          ex("We don't eat meat.", 'Nous ne mangeons pas de viande.'),
          ex('Does your sister speak Spanish?', 'Est-ce que ta sœur parle espagnol ?'),
          ex("He doesn't like coffee.", "Il n'aime pas le café."),
        ],
      },
    ],
    pitfalls: [
      pit("She doesn't works.", "She doesn't work.", 'Le -s est déjà sur does : le verbe reste à la base.'),
      pit('Do she like tea?', 'Does she like tea?', "À la 3ᵉ personne du singulier, l'auxiliaire est does."),
      pit('You like tea?', 'Do you like tea?', "À l'écrit, la question se construit avec l'auxiliaire, pas seulement avec l'intonation."),
      pit("I don't am ready.", "I'm not ready.", "Avec be, on n'utilise jamais do."),
    ],
    remember: ["Négation : don't / doesn't + base verbale.", 'Question : Do / Does + sujet + base verbale ?', 'Un seul -s par phrase : sur does, jamais sur le verbe.'],
  },

  frequency_adverbs: {
    intro:
      "Les adverbes de fréquence indiquent **à quelle fréquence** on fait quelque chose. Ils accompagnent surtout le présent simple. Pour un francophone, la difficulté est leur **place** dans la phrase.",
    blocks: [
      {
        title: 'Du plus fréquent au plus rare',
        table: table(
          ['Adverbe', 'Sens', 'Fréquence'],
          ['always', 'toujours', '100 %'],
          ['usually', "d'habitude, généralement", '≈ 90 %'],
          ['often', 'souvent', '≈ 70 %'],
          ['sometimes', 'parfois', '≈ 50 %'],
          ['rarely', 'rarement', '≈ 10 %'],
          ['hardly ever', 'presque jamais', '≈ 5 %'],
          ['never', 'jamais', '0 %'],
        ),
      },
      {
        title: 'Leur place',
        points: [
          '**Avant le verbe principal** : She often reads in the evening.',
          '**Après le verbe be** : He is always late.',
          "**Entre l'auxiliaire et le verbe** : I don't usually drive. I have never seen it.",
          'sometimes peut aussi ouvrir la phrase : Sometimes I walk to work.',
          'Les expressions every day, once a week (une fois par semaine), twice a month (deux fois par mois) se placent en fin de phrase.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('I usually have breakfast at eight.', "D'habitude, je prends le petit-déjeuner à huit heures."),
          ex('They are never at home on Sundays.', 'Ils ne sont jamais chez eux le dimanche.'),
          ex("We don't often go to the cinema.", "Nous n'allons pas souvent au cinéma."),
        ],
      },
    ],
    pitfalls: [
      pit('I go always to work by bus.', 'I always go to work by bus.', "L'adverbe se place avant le verbe principal, pas après comme en français."),
      pit('She always is happy.', 'She is always happy.', "Avec be, l'adverbe vient après le verbe."),
      pit("I don't never eat meat.", 'I never eat meat.', 'never est déjà négatif : pas de double négation en anglais.'),
    ],
    remember: ['Avant le verbe principal, après be.', 'never = ne… jamais : jamais avec not.'],
  },

  present_continuous: {
    intro:
      "Le présent continu décrit une action **en cours au moment où l'on parle**, ou une **situation temporaire**. Il se forme avec be au présent + verbe en **-ing**.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Sujet', 'be', 'verbe + -ing'], ['I', "am (I'm)", 'working'], ['he / she / it', "is (he's, she's…)", 'working'], ['you / we / they', "are (you're…)", 'working']),
        text: "Négation : I'm not working, she isn't working. Question : Are you working? Is he working?",
      },
      {
        title: "L'orthographe de -ing",
        points: [
          'Le e muet final disparaît : make → making, write → writing.',
          'Voyelle courte + consonne finale : on double la consonne : sit → sitting, run → running, swim → swimming.',
          '-ie devient -ying : lie → lying.',
        ],
      },
      {
        title: 'Emplois',
        text: "Le français dit simplement « je travaille » : c'est le contexte (maintenant, en ce moment) qui impose le présent continu en anglais. « Être en train de » est un bon indice.",
        examples: [
          ex('Be quiet, the baby is sleeping.', 'Silence, le bébé dort.', 'en ce moment'),
          ex("I'm reading a great book this week.", 'Je lis un super livre cette semaine.', 'période temporaire'),
          ex("Look! It's snowing.", 'Regarde ! Il neige.'),
          ex("She's staying with friends this month.", 'Elle loge chez des amis ce mois-ci.'),
        ],
      },
    ],
    pitfalls: [
      pit('I working now.', "I'm working now.", "L'auxiliaire be est indispensable."),
      pit('She is write an email.', 'She is writing an email.', 'Après be, le verbe prend -ing.'),
      pit('Listen! She sings.', "Listen! She's singing.", 'Action en train de se dérouler → présent continu.'),
    ],
    remember: ['be (am / is / are) + verbe-ing.', 'Indices : now, at the moment, today, this week, Look!, Listen!'],
  },

  simple_vs_continuous: {
    intro:
      "Le français n'a qu'un présent, l'anglais en a deux. Il faut choisir entre **l'habitude** (présent simple) et **l'action en cours ou temporaire** (présent continu). Certains verbes, dits **d'état**, ne se mettent normalement pas au continu.",
    blocks: [
      {
        title: 'Comparer',
        table: table(
          ['Présent simple', 'Présent continu'],
          ['Habitude : I work from home on Fridays.', "En ce moment : I'm working from home today."],
          ['Vérité générale : The sun rises in the east.', 'Situation temporaire : She is living with her parents this year.'],
          ['Indices : usually, every day, often, never', 'Indices : now, at the moment, today, this week'],
        ),
      },
      {
        title: "Les verbes d'état",
        text: "Ils décrivent un état et non une action : on les emploie au **présent simple**, même pour parler de maintenant.",
        points: [
          'Goûts : like, love, hate, want, prefer.',
          'Pensée : know, think (= croire), believe, understand, remember, mean.',
          'Possession : have (= posséder), own, belong.',
          'Perception : see, hear, seem.',
        ],
        examples: [ex('I know the answer.', 'Je connais la réponse.'), ex('Do you understand?', 'Vous comprenez ?'), ex('She wants a new phone.', 'Elle veut un nouveau téléphone.')],
      },
      {
        title: 'Un même verbe, deux sens',
        examples: [
          ex("I think it's a good idea.", "Je pense que c'est une bonne idée.", 'opinion → simple'),
          ex("I'm thinking about my holiday.", 'Je pense à mes vacances.', 'réflexion en cours → continu'),
          ex('She has two cats.', 'Elle a deux chats.', 'possession → simple'),
          ex("She's having lunch.", 'Elle est en train de déjeuner.', 'action → continu'),
        ],
      },
    ],
    pitfalls: [
      pit("I'm knowing the answer.", 'I know the answer.', "know est un verbe d'état : pas de forme en -ing."),
      pit('Usually I am going to work by car.', 'I usually go to work by car.', 'Une habitude se dit au présent simple.'),
      pit('Look! The bus comes.', "Look! The bus is coming.", 'Ça se passe sous vos yeux → présent continu.'),
    ],
    remember: ['Habitude → simple ; maintenant ou temporaire → continu.', "Verbes d'état (know, like, want, understand…) → présent simple."],
  },

  past_simple_regular: {
    intro:
      "Le prétérit (past simple) raconte une action **terminée, située dans le passé** : yesterday, last week, in 2015, two days ago. Il traduit à la fois le passé composé et le passé simple français. Pour les verbes réguliers, on ajoute **-ed**, à toutes les personnes.",
    blocks: [
      {
        title: 'Formation et orthographe',
        table: table(
          ['Base', 'Prétérit', 'Règle'],
          ['work', 'worked', 'cas général : + ed'],
          ['live', 'lived', 'e final : + d'],
          ['study', 'studied', 'consonne + y → ied'],
          ['play', 'played', 'voyelle + y : + ed'],
          ['stop', 'stopped', 'voyelle courte + consonne : on double'],
          ['prefer', 'preferred', 'accent sur la dernière syllabe : on double'],
          ['visit', 'visited', 'accent sur la 1ʳᵉ syllabe : pas de doublement'],
        ),
      },
      {
        title: 'La prononciation de -ed',
        points: ['/t/ après un son sourd : worked, stopped, watched.', '/d/ après un son sonore : played, lived, called.', '/ɪd/ seulement après t ou d : wanted, needed, visited.'],
      },
      {
        title: 'Exemples',
        text: '« Il y a » + durée se dit **ago**, placé après la durée : two days ago.',
        examples: [
          ex('I watched a film last night.', "J'ai regardé un film hier soir."),
          ex('We visited Rome in 2019.', 'Nous avons visité Rome en 2019.'),
          ex('She called me two hours ago.', "Elle m'a appelé il y a deux heures."),
        ],
      },
    ],
    pitfalls: [
      pit('I have visited Rome last year.', 'I visited Rome last year.', 'Moment passé précis (last year) → prétérit, pas le present perfect.'),
      pit('He stoped the car.', 'He stopped the car.', 'stop : voyelle courte + consonne → on double la consonne.'),
      pit('ago two days', 'two days ago', 'ago se place après la durée.'),
    ],
    remember: ['Base + -ed, à toutes les personnes.', '« il y a deux jours » = two days ago.'],
  },

  past_simple_irregular: {
    intro:
      "Les verbes les plus courants sont souvent **irréguliers** : leur prétérit ne se forme pas avec -ed et doit être appris. Bonne nouvelle : comme pour les réguliers, la forme est **la même à toutes les personnes**.",
    blocks: [
      {
        title: 'Les plus fréquents',
        table: table(
          ['Base', 'Prétérit', 'Sens'],
          ['go', 'went', 'aller'],
          ['have', 'had', 'avoir'],
          ['do', 'did', 'faire'],
          ['make', 'made', 'faire, fabriquer'],
          ['get', 'got', 'obtenir, devenir'],
          ['see', 'saw', 'voir'],
          ['come', 'came', 'venir'],
          ['take', 'took', 'prendre'],
          ['buy', 'bought', 'acheter'],
          ['eat', 'ate', 'manger'],
          ['write', 'wrote', 'écrire'],
          ['leave', 'left', 'partir, quitter'],
          ['meet', 'met', 'rencontrer, retrouver'],
          ['think', 'thought', 'penser'],
          ['say', 'said', 'dire'],
          ['find', 'found', 'trouver'],
        ),
      },
      {
        title: 'Des familles pour mémoriser',
        points: [
          'Prétérit = participe passé : buy – bought – bought, sleep – slept – slept.',
          'Trois formes différentes : go – went – gone, see – saw – seen.',
          'Trois formes identiques : put – put – put, cut, let, cost.',
          'La table complète est dans Vocabulaire → Verbes irréguliers.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('We went to the beach on Sunday.', 'Nous sommes allés à la plage dimanche.'),
          ex('I bought a new jacket yesterday.', "J'ai acheté une nouvelle veste hier."),
          ex('She wrote three emails before lunch.', 'Elle a écrit trois e-mails avant le déjeuner.'),
        ],
      },
    ],
    pitfalls: [
      pit('I goed to the cinema.', 'I went to the cinema.', 'go est irrégulier : went.'),
      pit('She buyed a car.', 'She bought a car.', 'buy → bought.'),
      pit('We have went home.', 'We went home.', "went est un prétérit : il s'emploie seul, sans have."),
    ],
    remember: ['Une seule forme pour toutes les personnes.', 'Apprenez les verbes par familles de formes.'],
  },

  past_simple_neg_q: {
    intro:
      "Au prétérit, la négation et la question se forment avec l'auxiliaire **did** (passé de do), pour tous les sujets. Le verbe revient à la **base verbale** : c'est did qui porte le passé.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Forme', 'Structure', 'Exemple'],
          ['Affirmative', 'sujet + prétérit', 'She went out.'],
          ['Négative', "sujet + didn't + base", "She didn't go out."],
          ['Question', 'Did + sujet + base ?', 'Did she go out?'],
          ['Réponse courte', 'Yes / No + pronom + did', "Yes, she did. / No, she didn't."],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex("I didn't see your message.", "Je n'ai pas vu ton message."),
          ex('Did you enjoy the concert?', 'Le concert vous a plu ?'),
          ex("They didn't have time.", "Ils n'ont pas eu le temps."),
          ex('Where did you buy it?', "Où l'as-tu acheté ?"),
        ],
      },
    ],
    pitfalls: [
      pit("I didn't went.", "I didn't go.", "Après did / didn't : toujours la base verbale."),
      pit('Did you saw him?', 'Did you see him?', 'Le passé est déjà marqué par did.'),
      pit('You went where?', 'Where did you go?', 'Question ouverte : mot interrogatif + did + sujet + base.'),
    ],
    remember: ["didn't + base ; Did + sujet + base ?", 'Avec was / were, pas de did : Was it good?'],
  },

  was_were: {
    intro:
      "Le verbe be a deux formes au prétérit : **was** et **were**. Il traduit « j'étais, j'ai été », et sert à dire où l'on était, comment on allait, ou « il y avait » (there was / there were).",
    blocks: [
      {
        title: 'Formation',
        table: table(['Sujet', 'Prétérit de be'], ['I / he / she / it', 'was'], ['you / we / they', 'were']),
        text: "Négation : wasn't, weren't. Question : Was he…? Were they…? — jamais de did.",
      },
      {
        title: 'Exemples',
        examples: [
          ex('I was tired yesterday.', "J'étais fatigué hier."),
          ex('Were you at home last night?', 'Tu étais chez toi hier soir ?'),
          ex("The shops weren't open.", "Les magasins n'étaient pas ouverts."),
          ex('It was a great evening.', "C'était une super soirée."),
        ],
      },
      {
        title: 'Expressions utiles',
        points: [
          'be born : I was born in 1995. (= je suis né en 1995)',
          'there was / there were : There were a lot of people. (= il y avait beaucoup de monde)',
          "How was your weekend? (= Comment s'est passé ton week-end ?)",
        ],
      },
    ],
    pitfalls: [
      pit('We was late.', 'We were late.', 'we → were.'),
      pit('Did you were happy?', 'Were you happy?', "be n'utilise jamais did : on inverse simplement."),
      pit('I am born in 1990.', 'I was born in 1990.', '« Je suis né » se dit au prétérit en anglais.'),
    ],
    remember: ['was : I, he, she, it ; were : you, we, they.', 'Question : Was / Were + sujet ?'],
  },

  past_continuous: {
    intro:
      "Le past continuous décrit une action **en cours à un moment du passé**, souvent interrompue par un événement plus bref (au prétérit). Il correspond à l'imparfait « j'étais en train de… ».",
    blocks: [
      {
        title: 'Formation',
        table: table(['Sujet', 'Forme'], ['I / he / she / it', 'was working'], ['you / we / they', 'were working']),
        text: "Négation : wasn't / weren't working. Question : Was she working? What were you doing?",
      },
      {
        title: 'when et while',
        points: [
          "**when** + prétérit pour l'action brève qui interrompt : I was cooking when the phone rang.",
          "**while** + past continuous pour l'action longue : While I was cooking, the phone rang.",
          'Deux actions longues simultanées : While she was reading, he was watching TV.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex("At eight o'clock I was having dinner.", 'À huit heures, je dînais.'),
          ex('It was raining when we arrived.', 'Il pleuvait quand nous sommes arrivés.'),
          ex('What were you doing at 10 pm?', 'Que faisais-tu à 22 heures ?'),
        ],
      },
    ],
    pitfalls: [
      pit('I was cook when he called.', 'I was cooking when he called.', 'was / were + verbe en -ing.'),
      pit('When I was a child, I was playing football every Saturday.', 'When I was a child, I played football every Saturday.', "Une habitude passée (imparfait français) se dit au prétérit simple ou avec used to, pas au past continuous."),
      pit('I was knowing the answer.', 'I knew the answer.', "Les verbes d'état (know, like, want…) restent au prétérit simple."),
    ],
    remember: ['was / were + -ing : action en cours dans le passé.', 'Action longue (while) interrompue par une action brève (when + prétérit).', "Imparfait d'habitude → prétérit simple, pas past continuous."],
  },

  wh_questions: {
    intro:
      "Les questions ouvertes commencent par un mot interrogatif (what, where, when…). Ensuite, l'ordre est celui d'une question fermée : **mot interrogatif + auxiliaire + sujet + verbe**.",
    blocks: [
      {
        title: 'Les mots interrogatifs',
        table: table(
          ['Mot', 'Sens', 'Exemple'],
          ['what', 'que, quoi, quel', 'What do you want?'],
          ['where', 'où', 'Where do you live?'],
          ['when', 'quand', 'When does the film start?'],
          ['who', 'qui', 'Who did you meet?'],
          ['why', 'pourquoi', 'Why are you late?'],
          ['how', 'comment', 'How do you go to work?'],
          ['which', 'lequel, quel (choix limité)', 'Which bag is yours?'],
          ['whose', 'à qui', 'Whose phone is this?'],
        ),
      },
      {
        title: 'Les questions avec how',
        points: [
          'How often…? : à quelle fréquence',
          'How long…? : combien de temps',
          'How much…? + indénombrable : How much money…?',
          'How many…? + pluriel : How many brothers…?',
          'How old…? : quel âge',
          'How far…? : à quelle distance',
        ],
      },
      {
        title: "L'ordre des mots",
        table: table(['Mot interrogatif', 'Auxiliaire', 'Sujet', 'Verbe…'], ['Where', 'do', 'you', 'work?'], ['What time', 'does', 'the train', 'leave?'], ['Why', 'did', 'she', 'call you?'], ['What', 'are', 'they', 'doing?']),
      },
    ],
    pitfalls: [
      pit('Where you live?', 'Where do you live?', "Il faut l'auxiliaire (do / does / did) après le mot interrogatif."),
      pit('What time the train leaves?', 'What time does the train leave?', 'Inversion avec does, et le verbe revient à la base.'),
      pit('How many money do you need?', 'How much money do you need?', 'money est indénombrable → how much.'),
    ],
    remember: ['Mot interrogatif + auxiliaire + sujet + verbe.', 'how much + indénombrable ; how many + pluriel.'],
  },

  short_answers: {
    intro:
      "En anglais, on répond rarement par un simple « Yes » ou « No » : on ajoute une **réponse courte** qui reprend l'auxiliaire de la question. C'est plus naturel et plus poli.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Question', 'Oui', 'Non'],
          ['Do you like tea?', 'Yes, I do.', "No, I don't."],
          ['Does he work here?', 'Yes, he does.', "No, he doesn't."],
          ['Are you tired?', 'Yes, I am.', "No, I'm not."],
          ['Is she French?', 'Yes, she is.', "No, she isn't."],
          ['Did they call?', 'Yes, they did.', "No, they didn't."],
          ['Can you swim?', 'Yes, I can.', "No, I can't."],
          ['Have you finished?', 'Yes, I have.', "No, I haven't."],
          ['Will it rain?', 'Yes, it will.', "No, it won't."],
        ),
      },
      {
        title: 'Les règles',
        points: [
          "On reprend l'auxiliaire de la question, au même temps.",
          'Le sujet est toujours un pronom : Is your brother here? — Yes, he is.',
          "Pas de contraction dans une réponse courte affirmative : Yes, I am (jamais Yes, I'm).",
          'On ne répète pas le verbe principal : Yes, I do (et non Yes, I like).',
        ],
      },
    ],
    pitfalls: [
      pit("Yes, I'm.", 'Yes, I am.', 'La réponse courte affirmative ne se contracte jamais.'),
      pit('Yes, I like.', 'Yes, I do.', "On reprend l'auxiliaire, pas le verbe."),
      pit('Is Tom here? — Yes, Tom is.', 'Is Tom here? — Yes, he is.', 'Dans une réponse courte, le sujet est un pronom.'),
    ],
    remember: ["Yes / No + pronom + auxiliaire (± n't).", 'Même auxiliaire et même temps que la question.'],
  },
};
