/** Leçons : modaux, present perfect, verbes, adverbes et adjectifs. */
import { ex, pit, table, type Lesson } from './types';

export const MODALS_PERFECT_LESSONS: Record<string, Lesson> = {
  can_could: {
    intro:
      "**can** exprime la capacité (savoir, pouvoir), la possibilité et la permission. **could** est son passé et sert aussi à demander poliment. Comme tous les modaux, ils sont **invariables** et suivis de la **base verbale**.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Présent', 'Passé'], ['Affirmative', 'She can swim.', 'She could swim when she was five.'], ['Négative', "I can't (cannot) come.", "I couldn't sleep."], ['Question', 'Can you drive?', 'Could you see the stage?']),
      },
      {
        title: 'Emplois',
        examples: [
          ex('He can speak three languages.', 'Il parle trois langues.', 'capacité'),
          ex('Can I open the window?', 'Je peux ouvrir la fenêtre ?', 'permission'),
          ex('Could you help me, please?', "Pourriez-vous m'aider, s'il vous plaît ?", 'demande polie'),
          ex("I couldn't find my keys this morning.", "Je n'ai pas réussi à trouver mes clés ce matin.", 'incapacité passée'),
        ],
      },
      {
        title: 'Les autres temps : be able to',
        text: "can n'a ni futur ni present perfect : on utilise **be able to**. I'll be able to help you tomorrow. I've never been able to ski.",
      },
    ],
    pitfalls: [
      pit('I can to swim.', 'I can swim.', 'Après un modal : base verbale, sans to.'),
      pit('She cans drive.', 'She can drive.', 'Les modaux ne prennent jamais de -s.'),
      pit('I will can come.', 'I will be able to come.', 'Deux modaux ne se suivent pas : au futur, will be able to.'),
      pit('Do you can help me?', 'Can you help me?', 'Pas de do avec un modal : on inverse directement.'),
    ],
    remember: ['can / could + base verbale, sans -s ni to.', 'Futur et present perfect : be able to.'],
  },

  must_have_to: {
    intro:
      "**must** et **have to** expriment l'obligation. Mais leurs négations ont des sens très différents : **mustn't** = interdiction, **don't have to** = absence d'obligation.",
    blocks: [
      {
        title: 'Quatre formes, quatre sens',
        table: table(
          ['Forme', 'Sens', 'Exemple'],
          ['must', 'obligation ressentie, règle écrite', 'I must call my mother. Passengers must wear a seatbelt.'],
          ['have to', 'obligation extérieure (règlement, situation)', 'I have to wear a uniform at work.'],
          ["mustn't", 'interdiction (il ne faut pas)', "You mustn't smoke here."],
          ["don't have to", "pas d'obligation (pas besoin de)", "You don't have to come if you're busy."],
        ),
      },
      {
        title: 'have to se conjugue',
        points: [
          'Il prend -s à la 3ᵉ personne : She has to work.',
          "Négation et question avec do : Do you have to leave? She doesn't have to pay.",
          "Passé : had to (must n'a pas de passé) : I had to wait for an hour.",
          "Futur : will have to : You'll have to book in advance.",
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('You must be at the airport two hours before the flight.', "Vous devez être à l'aéroport deux heures avant le vol."),
          ex("You mustn't touch that, it's hot!", "Il ne faut pas toucher ça, c'est chaud !"),
          ex("It's Sunday: I don't have to get up early.", "C'est dimanche : je n'ai pas besoin de me lever tôt."),
        ],
      },
    ],
    pitfalls: [
      pit("You mustn't come, it's optional.", "You don't have to come, it's optional.", "Absence d'obligation → don't have to (mustn't = c'est interdit)."),
      pit('She have to work.', 'She has to work.', 'have to se conjugue : has à la 3ᵉ personne.'),
      pit('I must to go.', 'I must go.', 'must est un modal : jamais suivi de to.'),
      pit('Yesterday I must work late.', 'Yesterday I had to work late.', 'Au passé, on utilise had to.'),
    ],
    remember: ["mustn't = interdiction ; don't have to = pas obligatoire.", 'Passé : had to.'],
  },

  should: {
    intro: '**should** sert à donner un **conseil** ou une recommandation : il correspond à « tu devrais, vous devriez ». Négation : **shouldn\'t**.',
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Exemple'], ['Affirmative', 'You should see a doctor.'], ['Négative', "You shouldn't eat so much sugar."], ['Question', 'Should I call him?'], ['Demander un avis', 'What should I do?']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('You look tired. You should go to bed.', "Tu as l'air fatigué. Tu devrais aller te coucher."),
          ex("We shouldn't spend so much money.", "Nous ne devrions pas dépenser autant d'argent."),
          ex('Should I bring something?', 'Je dois apporter quelque chose ?'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'ought to est un synonyme plus rare : You ought to rest.',
          'Pour un conseil plus personnel : If I were you, I would… (voir le conditionnel de type 2).',
          'Pour une obligation forte, on préfère must ou have to.',
        ],
      },
    ],
    pitfalls: [
      pit('You should to rest.', 'You should rest.', 'should est un modal : base verbale sans to.'),
      pit('He shoulds stop smoking.', 'He should stop smoking.', 'Pas de -s à la 3ᵉ personne.'),
      pit("You don't should worry.", "You shouldn't worry.", "Négation : should not = shouldn't, sans do."),
    ],
    remember: ['should + base = conseil (tu devrais).', "shouldn't = tu ne devrais pas."],
  },

  requests_offers: {
    intro:
      'Pour demander, proposer ou inviter poliment, l’anglais utilise des **formules fixes** avec des modaux. Elles sont indispensables au quotidien : café, hôtel, travail.',
    blocks: [
      {
        title: 'Demander quelque chose',
        table: table(
          ['Formule', 'Politesse', 'Exemple'],
          ['Can you…?', 'courant, entre proches', 'Can you pass the salt?'],
          ['Could you…?', 'poli', 'Could you repeat that, please?'],
          ['Would you mind + -ing?', 'très poli', 'Would you mind closing the door?'],
          ['Can / Could I…?', 'demander la permission', 'Could I use your phone?'],
          ["I'd like…", 'commander, demander', "I'd like a coffee, please."],
        ),
      },
      {
        title: 'Proposer, inviter',
        table: table(
          ['Formule', 'Sens', 'Exemple'],
          ['Would you like + nom / to + base?', 'offrir, inviter', 'Would you like a drink? Would you like to come?'],
          ['Shall I…?', 'proposer son aide', 'Shall I open the window?'],
          ["Shall we…? / Let's…", 'suggérer de faire ensemble', "Shall we go? Let's take a taxi."],
          ['Do you want…?', 'familier', 'Do you want some cake?'],
        ),
      },
      {
        title: 'Répondre',
        points: [
          "Accepter : Yes, please. / I'd love to. / That would be great.",
          "Refuser poliment : No, thank you. / I'm afraid I can't. / That's kind of you, but…",
          'Would you mind…? — No, not at all. (= Pas du tout, je veux bien)',
        ],
      },
    ],
    pitfalls: [
      pit('Would you like come?', 'Would you like to come?', 'would like + to + base verbale.'),
      pit('I want a coffee.', "I'd like a coffee, please.", "« Je voudrais » se dit I'd like ; I want est trop direct pour commander."),
      pit('Would you mind to open the door?', 'Would you mind opening the door?', 'Après mind : verbe en -ing.'),
      pit('Would you mind waiting? — Yes, of course!', 'Would you mind waiting? — No, not at all.', 'mind = déranger : pour accepter, on répond « non, ça ne me dérange pas ».'),
    ],
    remember: ['Could you…? / Would you mind + -ing? pour les demandes polies.', 'Would you like to…? pour inviter ; Shall I…? pour proposer son aide.'],
  },

  might_may: {
    intro:
      "**might** et **may** expriment une **possibilité** : quelque chose qui arrivera peut-être. might est un peu plus incertain et plus courant à l'oral. Ils sont suivis de la base verbale.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Forme', 'Exemple', 'Sens'],
          ['might', 'It might rain this afternoon.', "Il se peut qu'il pleuve cet après-midi."],
          ['may', 'She may be late.', 'Elle sera peut-être en retard.'],
          ['might not / may not', 'I might not have time.', "Je n'aurai peut-être pas le temps."],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex('Take an umbrella, it might rain.', 'Prends un parapluie, il pourrait pleuvoir.'),
          ex("I'm not sure. I might go to the party.", "Je ne suis pas sûr. J'irai peut-être à la fête."),
          ex('He may know the answer.', 'Il connaît peut-être la réponse.'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'may sert aussi à demander la permission, de façon soutenue : May I come in?',
          "maybe (adverbe, en un seul mot) = peut-être : Maybe he's right. = He might be right.",
          "Possibilité plus forte : will probably : It'll probably rain.",
        ],
      },
    ],
    pitfalls: [
      pit('It might to rain.', 'It might rain.', 'Base verbale sans to après un modal.'),
      pit('She mights come.', 'She might come.', 'Pas de -s.'),
      pit('May be I will come.', "Maybe I'll come. / I might come.", "L'adverbe maybe s'écrit en un seul mot."),
    ],
    remember: ['might / may + base = peut-être.', 'maybe (un mot) = peut-être, souvent en début de phrase.'],
  },

  pp_experience: {
    intro:
      "Le present perfect (**have / has + participe passé**) relie le passé au présent. Premier emploi : parler de son **expérience**, de ce qu'on a fait (ou jamais fait) dans sa vie, **sans dire quand**.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Forme', 'Exemple'],
          ['Affirmative', "I have (I've) been to Japan. She has (She's) met him."],
          ['Négative', "I haven't seen this film. He hasn't tried sushi."],
          ['Question', 'Have you ever been to Canada?'],
          ['Réponse courte', "Yes, I have. / No, I haven't."],
        ),
        text: 'Participe passé : verbe régulier = forme en -ed ; verbe irrégulier = 3ᵉ colonne (go – went – **gone**, see – saw – **seen**).',
      },
      {
        title: 'ever, never, been',
        points: [
          'ever (déjà, un jour) dans les questions : Have you ever eaten snails?',
          "never (jamais) : I've never seen snow.",
          "been ≠ gone : She has been to Rome (elle y est allée et en est revenue) / She has gone to Rome (elle est partie là-bas).",
          "Nombre de fois : I've seen this film three times.",
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('Have you ever been to Scotland? — Yes, I went there in 2018.', "Es-tu déjà allé en Écosse ? — Oui, j'y suis allé en 2018.", 'question au present perfect, détail daté au prétérit'),
          ex("I've never eaten Indian food.", "Je n'ai jamais mangé de cuisine indienne."),
          ex('She has visited ten countries.', 'Elle a visité dix pays.'),
        ],
      },
    ],
    pitfalls: [
      pit('I have saw this film.', 'I have seen this film.', 'Après have : participe passé (seen), pas prétérit (saw).'),
      pit('He have been to Italy.', 'He has been to Italy.', '3ᵉ personne → has.'),
      pit('Have you ever went to London?', 'Have you ever been to London?', '« Être déjà allé quelque part » = have been to.'),
      pit('I have been to Japan last year.', 'I went to Japan last year.', "Dès qu'on date l'expérience → prétérit."),
    ],
    remember: ['have / has + participe passé.', 'Expérience sans date → present perfect ; avec date → prétérit.', 'been to = y être allé (et revenu).'],
  },

  pp_just_already_yet: {
    intro:
      'Le present perfect exprime aussi le **résultat présent** d’une action passée récente. Trois adverbes l’accompagnent souvent : **just** (venir de), **already** (déjà), **yet** (déjà ? / pas encore).',
    blocks: [
      {
        title: 'Sens et place',
        table: table(
          ['Adverbe', 'Sens', 'Place', 'Exemple'],
          ['just', 'venir de', 'entre have et le participe', "I've just finished."],
          ['already', 'déjà', 'entre have et le participe', 'She has already left.'],
          ['yet (question)', 'déjà ?', 'en fin de phrase', 'Have you finished yet?'],
          ['yet (négation)', 'pas encore', 'en fin de phrase', "I haven't finished yet."],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex("I've just had lunch, I'm not hungry.", "Je viens de déjeuner, je n'ai pas faim."),
          ex("We've already booked the hotel.", "Nous avons déjà réservé l'hôtel."),
          ex('Has the film started yet?', 'Le film a déjà commencé ?'),
          ex("The taxi hasn't arrived yet.", "Le taxi n'est pas encore arrivé."),
        ],
      },
      {
        title: '« Je viens de… »',
        text: '« Je viens de faire » ne se traduit jamais mot à mot (I come from = je viens de [un lieu]) : on utilise **have just + participe passé**.',
      },
    ],
    pitfalls: [
      pit('I come from finishing my work.', "I've just finished my work.", '« venir de faire » = have just + participe passé.'),
      pit('Is the taxi arrived?', 'Has the taxi arrived?', "Le present perfect se forme avec have pour tous les verbes, même ceux qui prennent « être » en français."),
      pit('I have just finished it ten minutes ago.', 'I finished it ten minutes ago.', 'Avec un moment précis (ago), on revient au prétérit.'),
    ],
    remember: ['just / already : entre have et le participe ; yet : en fin de phrase.', 'Tous les verbes prennent have : He has arrived (il est arrivé).'],
  },

  pp_for_since: {
    intro:
      "Pour une action ou un état **qui a commencé dans le passé et qui dure encore**, l'anglais utilise le present perfect là où le français emploie le présent : « J'habite ici depuis 2015 » = I've lived here since 2015.",
    blocks: [
      {
        title: 'for ou since ?',
        table: table(
          ['', 'for', 'since'],
          ['Introduit', 'une durée', 'un point de départ'],
          ['Exemples', 'for ten years, for two hours, for a long time', 'since 2015, since Monday, since I was a child'],
          ['Phrase', "I've known her for ten years.", "I've known her since 2014."],
        ),
      },
      {
        title: 'Questions et forme continue',
        points: [
          'Question : How long have you lived here? (Depuis combien de temps… ?)',
          "Avec un verbe d'action, on emploie souvent la forme continue : I've been waiting for an hour. (J'attends depuis une heure.)",
          "Avec les verbes d'état (know, be, have…), forme simple : I've had this car for years.",
          "since + phrase au prétérit : I've lived here since I moved to France.",
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('She has worked here for three years.', 'Elle travaille ici depuis trois ans.'),
          ex("We've been friends since primary school.", "Nous sommes amis depuis l'école primaire."),
          ex('How long have you been learning English?', "Depuis combien de temps apprends-tu l'anglais ?"),
        ],
      },
    ],
    pitfalls: [
      pit('I live here since 2015.', "I've lived here since 2015.", '« depuis » + situation qui dure → present perfect, pas présent.'),
      pit("I've worked here since three years.", "I've worked here for three years.", 'Durée → for ; point de départ → since.'),
      pit('How long do you know her?', 'How long have you known her?', '« Depuis combien de temps » → How long + present perfect.'),
    ],
    remember: ['« depuis » = present perfect + for (durée) ou since (point de départ).', 'How long have you…?'],
  },

  pp_vs_past: {
    intro:
      "C'est la grande difficulté des francophones : « j'ai mangé » peut se traduire par **I ate** ou **I have eaten**. Tout dépend du **lien avec le présent** et de la présence d'un **moment passé précis**.",
    blocks: [
      {
        title: 'Comparer',
        table: table(
          ['Prétérit', 'Present perfect'],
          ['Action terminée, à un moment passé précis ou évident', 'Lien avec le présent : expérience, résultat, durée qui continue'],
          ['yesterday, last week, in 2010, two days ago, when I was young', 'ever, never, just, already, yet, for, since, so far'],
          ['I lost my keys yesterday.', "I've lost my keys. (= je ne les ai toujours pas)"],
          ['I saw that film last week.', "I've seen that film. (= je le connais)"],
        ),
      },
      {
        title: 'Les questions en When…?',
        text: 'Une question qui demande **quand** porte sur un moment passé : elle est toujours au prétérit.',
        examples: [
          ex('When did you arrive?', 'Quand es-tu arrivé ?'),
          ex('Have you been to the new museum? — Yes, I went last Saturday.', "Tu es allé au nouveau musée ? — Oui, j'y suis allé samedi dernier.", 'question générale au present perfect, réponse datée au prétérit'),
        ],
      },
      {
        title: 'Période terminée ou non',
        points: [
          "À 10 h, la matinée n'est pas finie : I've drunk three coffees this morning.",
          'À 16 h, la matinée est finie : I drank three coffees this morning.',
          'Personne disparue, époque révolue : prétérit (Shakespeare wrote many plays).',
        ],
      },
    ],
    pitfalls: [
      pit('I have seen him yesterday.', 'I saw him yesterday.', 'yesterday = moment passé précis → prétérit.'),
      pit('When have you arrived?', 'When did you arrive?', 'When → toujours prétérit.'),
      pit('I lived in Paris since 2010.', "I've lived in Paris since 2010.", 'since : la situation continue → present perfect.'),
    ],
    remember: ['Moment passé précis → prétérit.', 'Pas de date, lien avec maintenant → present perfect.', 'When…? → prétérit.'],
  },

  gerund_infinitive: {
    intro:
      "Quand un verbe en suit un autre, le second prend soit la forme **-ing**, soit **to + base**. Cela dépend du premier verbe : il faut apprendre les plus courants.",
    blocks: [
      {
        title: 'Les deux listes à connaître',
        table: table(
          ['Verbe + -ing', 'Verbe + to + base'],
          ['enjoy, finish, mind, avoid, suggest, keep, practise, imagine', 'want, decide, hope, plan, need, learn, promise, would like, agree, refuse, expect, manage'],
          ['I enjoy cooking.', 'I want to cook.'],
          ['She finished working at six.', 'She decided to work at home.'],
        ),
      },
      {
        title: 'Les deux sont possibles',
        points: [
          'like, love, hate, prefer, start, begin + -ing ou to, avec un sens proche : I like swimming. / I like to swim.',
          "Mais would like est toujours suivi de to : I'd like to swim.",
          "stop + -ing = arrêter de faire : I stopped smoking. ; stop + to = s'arrêter pour : I stopped to buy some bread.",
          "remember / forget + to = penser à / oublier de faire ; + -ing = se souvenir d'avoir fait.",
        ],
      },
      {
        title: 'Après une préposition : toujours -ing',
        text: 'La forme en -ing peut aussi être sujet : Swimming is good for you. (= Nager…)',
        examples: [
          ex("I'm interested in learning Japanese.", "Apprendre le japonais m'intéresse."),
          ex('Thank you for helping me.', "Merci de m'avoir aidé."),
          ex('She left without saying goodbye.', 'Elle est partie sans dire au revoir.'),
          ex("I'm looking forward to seeing you.", "J'ai hâte de te voir.", 'to est ici une préposition'),
        ],
      },
    ],
    pitfalls: [
      pit('I enjoy to read.', 'I enjoy reading.', 'enjoy est toujours suivi de -ing.'),
      pit('She decided going.', 'She decided to go.', 'decide + to + base.'),
      pit('Thank you for help me.', 'Thank you for helping me.', 'Après une préposition, le verbe prend -ing.'),
    ],
    remember: ['enjoy, finish, avoid, mind + -ing.', 'want, decide, hope, need, would like + to.', 'Préposition + -ing.'],
  },

  used_to: {
    intro:
      "**used to + base verbale** décrit une **habitude ou un état passé qui n'existe plus**. Il traduit souvent l'imparfait d'habitude : « Avant, je jouais au tennis ».",
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Exemple'], ['Affirmative', 'I used to play tennis.'], ['Négative', "She didn't use to like coffee."], ['Question', 'Did you use to live here?']),
        text: "Après did / didn't, on écrit **use to** (sans d), comme pour tout verbe après did.",
      },
      {
        title: 'Exemples',
        examples: [
          ex('We used to live in a small flat.', 'Avant, nous habitions dans un petit appartement.'),
          ex('He used to smoke, but he stopped five years ago.', 'Il fumait, mais il a arrêté il y a cinq ans.'),
          ex("I didn't use to like vegetables.", "Avant, je n'aimais pas les légumes."),
        ],
      },
      {
        title: 'À ne pas confondre',
        points: [
          "Pas d'équivalent au présent : pour une habitude actuelle, présent simple + usually : I usually walk to work.",
          "be used to + -ing = être habitué à : I'm used to getting up early.",
          "Une action unique se dit au prétérit : I went to Rome in 2015 (pas used to).",
        ],
      },
    ],
    pitfalls: [
      pit('I use to play football when I was young.', 'I used to play football when I was young.', 'Au passé affirmatif : used to, avec d.'),
      pit("I didn't used to like it.", "I didn't use to like it.", "Après didn't : use to, sans d."),
      pit('I used to go to Rome in 2015.', 'I went to Rome in 2015.', "Un événement unique et daté n'est pas une habitude → prétérit."),
    ],
    remember: ['used to + base = habitude passée révolue.', "didn't use to / Did you use to…?"],
  },

  adverbs_manner: {
    intro:
      'Les adverbes de manière disent **comment** on fait quelque chose. La plupart se forment avec **-ly** (l’équivalent de « -ment »). Ils se placent en général **après le verbe et son complément**.',
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Adjectif', 'Adverbe', 'Règle'],
          ['quick', 'quickly', '+ ly'],
          ['careful', 'carefully', '+ ly'],
          ['easy', 'easily', 'y → ily'],
          ['gentle', 'gently', '-le → -ly'],
          ['good', 'well', 'irrégulier'],
          ['fast, hard, late, early', 'fast, hard, late, early', 'même forme'],
        ),
      },
      {
        title: "La place de l'adverbe",
        points: [
          'Après le verbe : She speaks slowly.',
          "Après le complément d'objet, jamais entre le verbe et l'objet : She speaks English fluently.",
          'hardly = à peine (≠ hard = dur) ; lately = récemment (≠ late = tard).',
        ],
      },
      {
        title: 'Exemples',
        text: "Avec les verbes d'état (be, look, seem, feel, taste, smell), on emploie l'**adjectif** : You look happy. This soup tastes good.",
        examples: [ex('He drives carefully.', 'Il conduit prudemment.'), ex('She plays the piano very well.', 'Elle joue très bien du piano.'), ex('They work hard.', 'Ils travaillent dur.')],
      },
    ],
    pitfalls: [
      pit('He speaks very good.', 'He speaks very well.', "L'adverbe de good est well."),
      pit('She speaks fluently English.', 'She speaks English fluently.', 'On ne sépare pas le verbe de son complément.'),
      pit('You look tiredly.', 'You look tired.', 'Après look, seem, feel… : adjectif.'),
      pit('He works hardly.', 'He works hard.', 'hard est adjectif et adverbe ; hardly signifie « à peine ».'),
    ],
    remember: ['adjectif + ly ; good → well.', 'Verbe + complément + adverbe.', 'be / look / feel + adjectif.'],
  },

  ed_ing_adjectives: {
    intro: 'Beaucoup d’adjectifs existent sous deux formes : **-ed** décrit ce que **ressent** une personne, **-ing** décrit ce qui **provoque** ce sentiment.',
    blocks: [
      {
        title: 'Les paires les plus courantes',
        table: table(
          ['-ed : ce que l’on ressent', '-ing : ce qui produit l’effet'],
          ["bored (qui s'ennuie)", 'boring (ennuyeux)'],
          ['interested (intéressé)', 'interesting (intéressant)'],
          ['tired (fatigué)', 'tiring (fatigant)'],
          ['excited (enthousiaste, impatient)', 'exciting (passionnant)'],
          ['surprised (surpris)', 'surprising (surprenant)'],
          ['confused (perdu, confus)', 'confusing (déroutant)'],
          ['disappointed (déçu)', 'disappointing (décevant)'],
          ['worried (inquiet)', 'worrying (inquiétant)'],
        ),
      },
      {
        title: 'Exemples',
        text: "Une **personne** peut être -ed ou -ing, mais le sens change : He is boring (il est ennuyeux) ≠ He is bored (il s'ennuie).",
        examples: [
          ex('The film was boring, so I was bored.', "Le film était ennuyeux, alors je me suis ennuyé."),
          ex("I'm very interested in history.", "Je m'intéresse beaucoup à l'histoire."),
          ex('What an exciting match!', 'Quel match passionnant !'),
        ],
      },
    ],
    pitfalls: [
      pit("I'm boring in this meeting.", "I'm bored in this meeting.", "Ce que vous ressentez → -ed. (I'm boring = je suis ennuyeux !)"),
      pit('The trip was very tired.', 'The trip was very tiring.', 'Le voyage provoque la fatigue → -ing.'),
      pit("I'm interesting in music.", "I'm interested in music.", 'Personne qui ressent → interested in.'),
    ],
    remember: ['-ed : je ressens ; -ing : ça provoque.', 'interested in, bored with, excited about.'],
  },

  as_as_too_enough: {
    intro: 'Trois structures pour nuancer un adjectif : **as … as** (aussi… que), **too** (trop) et **enough** (assez). La place de enough est le piège classique.',
    blocks: [
      {
        title: 'Les structures',
        table: table(
          ['Structure', 'Sens', 'Exemple'],
          ['as + adjectif + as', 'aussi… que', 'Tom is as tall as his father.'],
          ['not as + adjectif + as', 'moins… que', "The book isn't as good as the film."],
          ['too + adjectif (+ to + base)', 'trop', "It's too cold to swim."],
          ['adjectif + enough', 'assez', "He isn't old enough to drive."],
          ['enough + nom', 'assez de', "We don't have enough time."],
          ['too much / too many + nom', 'trop de', 'There are too many cars.'],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex('My phone is as old as yours.', 'Mon téléphone est aussi vieux que le tien.'),
          ex('This coffee is too hot to drink.', 'Ce café est trop chaud pour être bu.'),
          ex('Is the room big enough for four people?', 'La chambre est-elle assez grande pour quatre personnes ?'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "too a un sens négatif (excès) : It's too expensive (je ne peux pas l'acheter) ≠ It's very expensive.",
          "enough se place **après** l'adjectif ou l'adverbe, mais **avant** le nom : warm enough / enough money.",
          'the same as = le même que : My bag is the same as yours.',
        ],
      },
    ],
    pitfalls: [
      pit("He isn't enough old.", "He isn't old enough.", "enough se place après l'adjectif."),
      pit('She is as tall than me.', 'She is as tall as me.', 'Égalité : as … as.'),
      pit('There are too much people.', 'There are too many people.', 'people est un pluriel → too many.'),
    ],
    remember: ['as … as = aussi … que.', 'adjectif + enough ; enough + nom.', 'too = trop (souvent avec un sens négatif).'],
  },
};
