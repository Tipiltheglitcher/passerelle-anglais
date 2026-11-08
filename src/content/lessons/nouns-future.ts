/** Leçons : noms et déterminants, comparaison, prépositions, futur. */
import { ex, pit, table, type Lesson } from './types';

export const NOUNS_FUTURE_LESSONS: Record<string, Lesson> = {
  articles: {
    intro:
      "L'anglais a trois possibilités : l'article indéfini **a / an**, l'article défini **the**, ou **aucun article** (∅). Les règles diffèrent souvent du français, surtout pour parler de choses en général.",
    blocks: [
      {
        title: 'a ou an ?',
        text: 'Le choix dépend du **son** qui suit, pas de la lettre.',
        points: ['a devant un son consonne : a book, a university (/juː/), a European city.', 'an devant un son voyelle : an apple, an hour (h muet), an MBA (/em/).'],
      },
      {
        title: 'the',
        points: [
          'Chose déjà mentionnée ou identifiée : I bought a car. The car is red.',
          'Chose unique : the sun, the moon, the internet.',
          'Instruments de musique : play the piano.',
          'Pas de the devant les repas, les sports, les langues : have lunch, play tennis, speak English.',
        ],
      },
      {
        title: 'Aucun article pour les généralités',
        text: "Pour parler d'une chose **en général**, l'anglais n'emploie pas d'article avec un pluriel ou un indénombrable, là où le français dit « le, la, les ».",
        examples: [
          ex('I love cats.', "J'adore les chats."),
          ex('Life is beautiful.', 'La vie est belle.'),
          ex('Children need sleep.', 'Les enfants ont besoin de sommeil.'),
          ex('She is a nurse.', 'Elle est infirmière.', 'métier : a / an obligatoire'),
        ],
      },
    ],
    pitfalls: [
      pit('I love the cats.', 'I love cats.', "Généralité → pas d'article (the cats = des chats précis)."),
      pit('She is teacher.', 'She is a teacher.', "Devant un métier, l'article a / an est obligatoire."),
      pit('a hour', 'an hour', 'Le h de hour ne se prononce pas : son voyelle → an.'),
    ],
    remember: ['a / an selon le son qui suit.', 'Généralité = pas d’article + pluriel ou indénombrable.', "Métier : She's a doctor."],
  },

  countable_quantifiers: {
    intro:
      'Les noms anglais sont **dénombrables** (a chair, two chairs) ou **indénombrables** (water, money, information). Le choix du quantifieur en dépend.',
    blocks: [
      {
        title: 'Les quantifieurs',
        table: table(
          ['', 'Dénombrable (pluriel)', 'Indénombrable'],
          ['Affirmation', 'some apples', 'some bread'],
          ['Négation, question', 'any apples', 'any bread'],
          ['Beaucoup', 'many / a lot of friends', 'much / a lot of time'],
          ['Un peu, quelques', 'a few friends', 'a little time'],
          ['Combien ?', 'How many…?', 'How much…?'],
        ),
      },
      {
        title: 'Les indénombrables pièges',
        text: 'Certains noms sont indénombrables en anglais mais dénombrables en français : ils ne prennent **ni a, ni -s**.',
        points: [
          'information : des informations → some information',
          'advice : des conseils → some advice, a piece of advice',
          'news : les nouvelles → The news is good.',
          'furniture (des meubles), luggage (des bagages), homework (des devoirs)',
          'bread, money, work, hair (les cheveux)',
        ],
      },
      {
        title: 'Nuances',
        points: [
          "much s'emploie surtout en négation et en question ; à l'affirmative, on préfère a lot of : I have a lot of work.",
          'some dans une offre ou une demande : Would you like some tea? Can I have some water?',
          "no = not any : There's no milk. = There isn't any milk.",
        ],
      },
    ],
    pitfalls: [
      pit('I need an information.', 'I need some information.', 'information est indénombrable : ni a, ni -s.'),
      pit('I have much work.', 'I have a lot of work.', "À l'affirmative, a lot of est plus naturel que much."),
      pit('There are not some eggs.', "There aren't any eggs.", 'Dans une négation, some devient any.'),
    ],
    remember: ["some à l'affirmative ; any en négation et en question.", 'many / a few + pluriel ; much / a little + indénombrable.'],
  },

  there_is_are: {
    intro:
      '« Il y a » se dit **there is** devant un singulier ou un indénombrable, et **there are** devant un pluriel. On le conjugue à tous les temps.',
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['', 'Singulier / indénombrable', 'Pluriel'],
          ['Présent', "There is (There's) a bank.", 'There are two banks.'],
          ['Négation', "There isn't any milk.", "There aren't any shops."],
          ['Question', 'Is there a lift?', 'Are there any buses?'],
          ['Passé', 'There was a problem.', 'There were many people.'],
          ['Futur', 'There will be a meeting.', 'There will be lots of guests.'],
        ),
      },
      {
        title: 'Exemples',
        text: '« Il y a » + durée (il y a deux ans) se dit **ago**, pas there is : two years ago.',
        examples: [
          ex('Is there a pharmacy near here?', "Y a-t-il une pharmacie près d'ici ?"),
          ex('There were a lot of people at the concert.', 'Il y avait beaucoup de monde au concert.'),
          ex("There's no bread left.", "Il n'y a plus de pain."),
        ],
      },
    ],
    pitfalls: [
      pit('There is two cafés in my street.', 'There are two cafés in my street.', 'Pluriel → there are.'),
      pit('It has a problem.', 'There is a problem.', '« Il y a » ne se traduit jamais par it has.'),
      pit('There is three years, I lived in Spain.', 'Three years ago, I lived in Spain.', '« Il y a » + durée passée = ago.'),
    ],
    remember: ['there is + singulier ; there are + pluriel.', 'Passé : there was / there were.'],
  },

  pronouns_possessives: {
    intro:
      "En anglais, le possessif s'accorde avec le **possesseur**, pas avec l'objet possédé : « sa voiture » se dit **his car** (à lui) ou **her car** (à elle). Il faut aussi distinguer pronoms sujets, compléments et possessifs.",
    blocks: [
      {
        title: 'Le tableau complet',
        table: table(
          ['Sujet', 'Complément', 'Déterminant', 'Pronom possessif'],
          ['I', 'me', 'my', 'mine'],
          ['you', 'you', 'your', 'yours'],
          ['he', 'him', 'his', 'his'],
          ['she', 'her', 'her', 'hers'],
          ['it', 'it', 'its', '—'],
          ['we', 'us', 'our', 'ours'],
          ['they', 'them', 'their', 'theirs'],
        ),
      },
      {
        title: "Le génitif 's",
        points: [
          "Possesseur + 's + objet : Tom's bike (le vélo de Tom), my sister's room.",
          "Pluriel en -s : apostrophe seule : my parents' house.",
          "Pluriel irrégulier : the children's toys.",
          'Pronom possessif : This bike is mine. (= le mien) Is this yours?',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('Sarah is visiting her brother.', 'Sarah rend visite à son frère.'),
          ex('Paul lost his keys.', 'Paul a perdu ses clés.'),
          ex('Can you help me?', "Tu peux m'aider ?"),
          ex("That isn't my coat. Mine is black.", "Ce n'est pas mon manteau. Le mien est noir."),
        ],
      },
    ],
    pitfalls: [
      pit('Emma loves his dog.', 'Emma loves her dog.', 'Le possesseur est Emma → her.'),
      pit('the car of my father', "my father's car", "Pour une personne, on utilise le génitif 's."),
      pit('This book is my.', 'This book is mine.', 'Sans nom après, on utilise le pronom possessif (mine, yours…).'),
      pit("The dog wagged it's tail.", 'The dog wagged its tail.', "its (possessif) ne prend pas d'apostrophe ; it's = it is."),
    ],
    remember: ['his = à lui ; her = à elle : on regarde le possesseur.', "Tom's car ; my parents' house.", 'mine, yours, his, hers, ours, theirs remplacent un nom.'],
  },

  comparatives: {
    intro:
      "Le comparatif de supériorité se forme de deux façons selon la longueur de l'adjectif : **-er than** pour les adjectifs courts, **more … than** pour les longs.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Adjectif', 'Règle', 'Exemple'],
          ['1 syllabe', '+ er', 'cheap → cheaper'],
          ['finissant par -e', '+ r', 'nice → nicer'],
          ['voyelle courte + consonne', 'consonne doublée', 'big → bigger, hot → hotter'],
          ['2 syllabes en -y', 'y → ier', 'easy → easier, happy → happier'],
          ['2 syllabes ou plus', 'more + adjectif', 'expensive → more expensive'],
          ['irréguliers', '—', 'good → better, bad → worse, far → further'],
        ),
      },
      {
        title: 'Autres comparaisons',
        points: [
          "Infériorité : less + adjectif + than : The film is less interesting than the book.",
          'Égalité : as + adjectif + as (voir la leçon dédiée).',
          'Renforcer : much / a lot / far + comparatif : much cheaper, a lot easier.',
          '« que moi » : than me (courant) ou than I am.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('The train is faster than the bus.', 'Le train est plus rapide que le bus.'),
          ex('London is more expensive than Madrid.', 'Londres est plus chère que Madrid.'),
          ex('Her new job is better than the old one.', "Son nouveau travail est meilleur que l'ancien."),
        ],
      },
    ],
    pitfalls: [
      pit('more big', 'bigger', 'Adjectif court → -er, pas more.'),
      pit('more good', 'better', 'good est irrégulier : better.'),
      pit('She is taller that me.', 'She is taller than me.', '« que » dans une comparaison = than.'),
      pit('more easier', 'easier', 'Jamais more et -er ensemble.'),
    ],
    remember: ['Court : -er than ; long : more … than.', 'good → better ; bad → worse.'],
  },

  superlatives: {
    intro:
      'Le superlatif exprime le plus haut degré : « le plus… ». Même logique que le comparatif : **the -est** pour les adjectifs courts, **the most** pour les longs.',
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Adjectif', 'Comparatif', 'Superlatif'],
          ['cheap', 'cheaper', 'the cheapest'],
          ['big', 'bigger', 'the biggest'],
          ['easy', 'easier', 'the easiest'],
          ['beautiful', 'more beautiful', 'the most beautiful'],
          ['good', 'better', 'the best'],
          ['bad', 'worse', 'the worst'],
          ['far', 'further', 'the furthest'],
        ),
      },
      {
        title: 'Compléments',
        points: [
          '« de » + lieu ou groupe après un superlatif = **in** : the tallest building in the world, the best student in the class.',
          'the least + adjectif = le moins… : the least expensive hotel.',
          "Avec le present perfect : It's the best film I've ever seen.",
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('This is the cheapest restaurant in town.', "C'est le restaurant le moins cher de la ville."),
          ex('It was the worst day of my life.', "C'était le pire jour de ma vie."),
          ex('Who is the most famous singer in your country?', 'Qui est le chanteur le plus célèbre de ton pays ?'),
        ],
      },
    ],
    pitfalls: [
      pit('the most cheap', 'the cheapest', 'Adjectif court → the -est.'),
      pit('the tallest building of the world', 'the tallest building in the world', 'Après un superlatif, « de » + lieu = in.'),
      pit('She is best student.', 'She is the best student.', 'the est obligatoire devant le superlatif.'),
    ],
    remember: ['the -est / the most + adjectif.', '« de » + lieu → in : the biggest city in Europe.'],
  },

  prepositions_time: {
    intro:
      'Trois prépositions couvrent la plupart des cas : **at** pour un moment précis, **on** pour un jour, **in** pour une période plus longue.',
    blocks: [
      {
        title: 'at, on, in',
        table: table(
          ['Préposition', 'Emploi', 'Exemples'],
          ['at', 'heure, moment précis', "at 7 o'clock, at noon, at night, at the weekend (GB)"],
          ['on', 'jour, date', 'on Monday, on 3 May, on my birthday, on Friday evening'],
          ['in', 'mois, saison, année, partie de la journée', 'in July, in summer, in 2024, in the morning'],
        ),
      },
      {
        title: 'Sans préposition',
        text: 'Devant **this, next, last, every**, ainsi que tomorrow et yesterday, on ne met pas de préposition.',
        examples: [ex("I'll see you next Monday.", 'Je te verrai lundi prochain.'), ex('We met last summer.', "Nous nous sommes rencontrés l'été dernier.")],
      },
      {
        title: 'Autres prépositions utiles',
        points: ['for + durée : for two hours (pendant deux heures).', 'during + nom : during the film (pendant le film).', 'from … to / until : from 9 to 5.', "by + limite : by Friday (d'ici vendredi, au plus tard vendredi)."],
      },
    ],
    pitfalls: [
      pit('in Monday', 'on Monday', 'Jour de la semaine → on.'),
      pit('at the morning', 'in the morning', 'Partie de la journée → in (mais at night).'),
      pit('on next week', 'next week', 'Pas de préposition devant next, last, this, every.'),
    ],
    remember: ['at + heure ; on + jour ou date ; in + mois, saison, année.', 'Rien devant next, last, this, every.'],
  },

  prepositions_place: {
    intro: "Les prépositions de lieu situent une personne ou un objet. Les trois de base : **in** (dans), **on** (sur) et **at** (à, chez, à un point précis).",
    blocks: [
      {
        title: 'Les principales',
        table: table(
          ['Préposition', 'Sens', 'Exemple'],
          ['in', "dans, à l'intérieur", 'in the box, in Paris, in the kitchen'],
          ['on', 'sur (en contact)', 'on the table, on the wall, on the second floor'],
          ['at', 'à un endroit précis', 'at the station, at home, at work, at the door'],
          ['under', 'sous', 'under the bed'],
          ['next to', 'à côté de', 'next to the bank'],
          ['between', 'entre (deux)', 'between the bakery and the café'],
          ['opposite', 'en face de', 'opposite the post office'],
          ['behind / in front of', 'derrière / devant', 'behind the house, in front of the school'],
          ['near', 'près de', 'near the station'],
        ),
      },
      {
        title: 'Cas fréquents',
        points: [
          'Ville, pays : in : in London, in Spain.',
          'Adresse avec numéro : at 12 Baker Street ; rue sans numéro : in (GB) ou on (US) Baker Street.',
          'Transports : on the bus, on the train, on a plane, mais in a car, in a taxi.',
          'Sans article : at home, at work, at school, at university.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('Your keys are on the table, next to the lamp.', 'Tes clés sont sur la table, à côté de la lampe.'),
          ex('She works in a hospital in Leeds.', 'Elle travaille dans un hôpital à Leeds.'),
          ex("I'm waiting for you at the station.", "Je t'attends à la gare."),
        ],
      },
    ],
    pitfalls: [
      pit('I live at London.', 'I live in London.', 'Ville ou pays → in.'),
      pit('in the bus', 'on the bus', 'Transports en commun → on.'),
      pit('at the home', 'at home', "at home s'emploie sans article."),
    ],
    remember: ["in = à l'intérieur ; on = sur une surface ; at = point précis.", 'in + ville ou pays ; on the bus, on the train.'],
  },

  future_will: {
    intro:
      "**will + base verbale** sert à faire une prédiction, à prendre une décision sur le moment, à promettre ou à proposer. Il est identique à toutes les personnes.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Exemple'], ['Affirmative', "I will (I'll) help you."], ['Négative', "It won't (will not) rain."], ['Question', 'Will you be at home?'], ['Réponse courte', "Yes, I will. / No, I won't."]),
      },
      {
        title: 'Emplois',
        examples: [
          ex("I think it'll be sunny tomorrow.", "Je pense qu'il fera beau demain.", 'prédiction, opinion'),
          ex("I'm hungry. — I'll make you a sandwich.", "J'ai faim. — Je vais te faire un sandwich.", 'décision immédiate'),
          ex("I'll call you tonight, I promise.", "Je t'appelle ce soir, promis.", 'promesse'),
          ex('Will you open the window, please?', 'Tu veux bien ouvrir la fenêtre ?', 'demande'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "Expressions fréquentes : I think…, I'm sure…, probably, maybe + will.",
          "probably se place après will mais avant won't : She'll probably come. She probably won't come.",
          'Pas de will après when, if, as soon as (voir les leçons sur les conditions).',
        ],
      },
    ],
    pitfalls: [
      pit('I will to go.', 'I will go.', 'Après will : base verbale sans to.'),
      pit('She wills come.', 'She will come.', 'will est invariable.'),
      pit("I don't will come.", "I won't come.", "Négation : will not = won't, sans do."),
    ],
    remember: ['will + base, à toutes les personnes.', 'Décision prise sur le moment → will.'],
  },

  going_to: {
    intro: '**be going to + base verbale** exprime une **intention déjà décidée** (un projet) ou une **prédiction fondée sur un indice visible** maintenant.',
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Exemple'], ['Affirmative', "I'm going to visit my aunt."], ['Négative', "She isn't going to buy it."], ['Question', 'Are you going to take the train?']),
      },
      {
        title: 'Emplois',
        examples: [
          ex("We're going to move to Bordeaux next year.", "Nous allons déménager à Bordeaux l'année prochaine.", 'projet décidé'),
          ex("Look at those clouds! It's going to rain.", 'Regarde ces nuages ! Il va pleuvoir.', 'indice visible'),
          ex("Be careful, you're going to fall!", 'Attention, tu vas tomber !'),
        ],
      },
      {
        title: 'will ou going to ?',
        table: table(
          ['will', 'going to'],
          ["Décision sur le moment : The phone's ringing. — I'll answer it.", "Décision déjà prise : I'm going to paint my room this weekend."],
          ['Prédiction, opinion : I think he will like it.', "Prédiction avec indice : She's pale. She's going to faint."],
        ),
      },
    ],
    pitfalls: [
      pit('I going to travel.', "I'm going to travel.", 'be (am / is / are) est obligatoire.'),
      pit('She is going to buys a car.', 'She is going to buy a car.', 'Après going to : base verbale.'),
      pit('Look at the sky! It will rain.', "Look at the sky! It's going to rain.", 'Prédiction fondée sur un indice présent → going to.'),
    ],
    remember: ['am / is / are + going to + base.', 'Projet décidé ou indice visible → going to.'],
  },

  future_forms: {
    intro:
      "L'anglais dispose de plusieurs façons de parler du futur. Le choix dépend de **la façon dont on voit l'action** : décision, projet, rendez-vous fixé ou horaire officiel.",
    blocks: [
      {
        title: 'Les quatre formes',
        table: table(
          ['Forme', 'Emploi', 'Exemple'],
          ['will', 'décision immédiate, prédiction, promesse', "I'll have the soup, please."],
          ['be going to', 'intention, projet ; prédiction avec indice', "I'm going to learn the guitar."],
          ['présent continu', 'rendez-vous, arrangement (date, heure, personnes)', "I'm meeting Sam at six tomorrow."],
          ['présent simple', 'horaires, programmes officiels', 'The train leaves at 7.45.'],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex("What are you doing on Saturday? — I'm having lunch with my parents.", 'Tu fais quoi samedi ? — Je déjeune avec mes parents.'),
          ex('The film starts at 8.30.', 'Le film commence à 20 h 30.'),
          ex("It's cold. — I'll close the window.", 'Il fait froid. — Je vais fermer la fenêtre.'),
        ],
      },
      {
        title: 'Le piège du présent français',
        text: "Le français utilise souvent le présent pour le futur (« Demain, je vais au cinéma avec Léa »). En anglais, un projet personnel organisé se dit au **présent continu** ou avec **going to**, jamais au présent simple, réservé aux horaires.",
      },
    ],
    pitfalls: [
      pit('Tomorrow I go to the cinema with Léa.', "Tomorrow I'm going to the cinema with Léa.", 'Projet personnel → présent continu (ou going to), pas présent simple.'),
      pit('What time does the concert starts?', 'What time does the concert start?', 'Horaire → présent simple ; après does, base verbale.'),
    ],
    remember: ['Rendez-vous fixé → présent continu.', 'Horaire officiel → présent simple.', 'Projet → going to ; décision sur le moment → will.'],
  },
};
