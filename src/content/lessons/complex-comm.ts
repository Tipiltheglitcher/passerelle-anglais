/** Leçons : conditions, phrases complexes, compétences de communication. */
import { ex, pit, table, type Lesson } from './types';

export const COMPLEX_COMM_LESSONS: Record<string, Lesson> = {
  zero_conditional: {
    intro:
      'Le conditionnel de type 0 exprime une **vérité générale** ou une conséquence automatique : chaque fois que la condition est remplie, le résultat se produit. Les deux parties sont au **présent simple**.',
    blocks: [
      {
        title: 'Formation',
        table: table(['Condition', 'Résultat'], ['If + présent simple,', 'présent simple'], ['If you heat ice,', 'it melts.'], ['If I drink coffee at night,', "I can't sleep."]),
      },
      {
        title: 'Exemples',
        examples: [
          ex('If you mix blue and yellow, you get green.', 'Si on mélange du bleu et du jaune, on obtient du vert.'),
          ex('If it rains, the match is cancelled.', 'Quand il pleut, le match est annulé.'),
          ex("Plants die if they don't get water.", "Les plantes meurent si elles ne reçoivent pas d'eau."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'if peut souvent être remplacé par when (= chaque fois que).',
          "L'ordre des deux parties peut s'inverser ; on met une virgule seulement quand if est en tête.",
          'Pour une consigne : If you feel sick, call a doctor. (impératif)',
        ],
      },
    ],
    pitfalls: [
      pit('If you will heat ice, it melts.', 'If you heat ice, it melts.', 'Jamais de will après if.'),
      pit("If I drink coffee, I don't can sleep.", "If I drink coffee, I can't sleep.", "Négation d'un modal : can't, sans do."),
    ],
    remember: ['If + présent, présent : vérité générale.', 'if ≈ when dans ce cas.'],
  },

  first_conditional: {
    intro:
      "Le conditionnel de type 1 parle d'une **situation future possible** et de sa conséquence probable : **If + présent simple, will + base verbale**. Comme en français, pas de futur après « si ».",
    blocks: [
      {
        title: 'Formation',
        table: table(['Condition (if)', 'Conséquence'], ['If + présent simple,', "will / won't + base"], ['If it rains tomorrow,', "we'll stay at home."], ["If you don't hurry,", "you'll miss the bus."]),
      },
      {
        title: 'Exemples',
        examples: [
          ex("If I have time, I'll call you.", "Si j'ai le temps, je t'appellerai."),
          ex("She'll be angry if you tell her.", 'Elle sera fâchée si tu le lui dis.'),
          ex("What will you do if you don't get the job?", "Que feras-tu si tu n'obtiens pas le poste ?"),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "unless = if … not (à moins que) : I'll go unless it rains.",
          'Dans la conséquence, on peut aussi employer can, may, might, should ou un impératif : If you see Tom, tell him to call me.',
          'Virgule quand la phrase commence par if.',
        ],
      },
    ],
    pitfalls: [
      pit('If it will rain, we will stay home.', "If it rains, we'll stay home.", 'Après if : présent simple, jamais will.'),
      pit('If you will come, I am happy.', "If you come, I'll be happy.", 'Condition au présent, conséquence au futur avec will.'),
      pit("Unless you don't hurry, you'll be late.", "Unless you hurry, you'll be late.", 'unless contient déjà la négation.'),
    ],
    remember: ['If + présent, will + base.', 'unless = if not.'],
  },

  time_clauses: {
    intro:
      "Après **when, as soon as, before, after, until** et **while**, l'anglais utilise le **présent** pour parler du futur, contrairement au français qui emploie le futur (« Quand j'arriverai… »).",
    blocks: [
      {
        title: 'Français et anglais',
        table: table(
          ['Français', 'Anglais'],
          ["Quand j'arriverai, je t'appellerai.", "When I arrive, I'll call you."],
          ["Dès qu'il aura fini, il partira.", "As soon as he finishes, he'll leave."],
          ["Je resterai jusqu'à ce que tu reviennes.", "I'll stay until you come back."],
        ),
      },
      {
        title: 'Exemples',
        examples: [
          ex("I'll send you the photos when I get home.", 'Je t’enverrai les photos quand je serai rentré.'),
          ex('Call me as soon as you know.', 'Appelle-moi dès que tu sais.'),
          ex('Before you leave, close the windows.', 'Avant de partir, ferme les fenêtres.'),
          ex("We'll wait until the rain stops.", "Nous attendrons que la pluie s'arrête."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "Pour insister sur l'achèvement : present perfect : I'll call you when I've finished.",
          'will reste possible dans une question directe : When will you arrive?',
        ],
      },
    ],
    pitfalls: [
      pit("When I will arrive, I'll call you.", "When I arrive, I'll call you.", 'Après when : présent, même pour le futur.'),
      pit('As soon as she will know, she will tell us.', "As soon as she knows, she'll tell us.", 'Après as soon as : présent simple.'),
      pit("I'll wait until he will come.", "I'll wait until he comes.", 'Après until : présent simple.'),
    ],
    remember: ['when / as soon as / until / before / after + présent = futur.', 'will reste dans la proposition principale.'],
  },

  second_conditional: {
    intro:
      "Le conditionnel de type 2 décrit une **situation imaginaire ou peu probable**, dans le présent ou le futur : **If + prétérit, would + base verbale**. C'est l'équivalent de « si + imparfait, conditionnel ».",
    blocks: [
      {
        title: 'Formation',
        table: table(['Condition (if)', 'Conséquence'], ['If + prétérit,', "would ('d) + base"], ['If I had more money,', 'I would travel around the world.'], ['If she lived closer,', 'we would see her more often.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex("If I won the lottery, I'd buy a house by the sea.", "Si je gagnais au loto, j'achèterais une maison au bord de la mer."),
          ex('What would you do if you lost your job?', 'Que ferais-tu si tu perdais ton travail ?'),
          ex("If I were you, I wouldn't accept.", "Si j'étais toi, je n'accepterais pas.", 'conseil'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'If I were / he were : were est possible à toutes les personnes (plus soutenu) ; If I were you est une formule figée.',
          'could et might remplacent would pour la capacité ou la possibilité : If I had a car, I could drive you.',
          'Type 1 ou type 2 ? If I win… (c’est possible) / If I won… (c’est improbable, imaginaire).',
        ],
      },
    ],
    pitfalls: [
      pit('If I would have money, I would buy it.', 'If I had money, I would buy it.', 'Après if : prétérit, jamais would.'),
      pit('If I was you, I would go.', 'If I were you, I would go.', 'Pour conseiller, la formule est If I were you.'),
      pit('If she had time, she will come.', 'If she had time, she would come.', 'Prétérit dans la condition → would dans la conséquence.'),
    ],
    remember: ['If + prétérit, would + base : situation imaginaire.', "If I were you, I'd… pour conseiller."],
  },

  connectors: {
    intro:
      'Les connecteurs logiques relient les idées : addition, opposition, cause, conséquence, but. Bien les employer rend vos phrases plus claires et plus naturelles, à l’oral comme à l’écrit.',
    blocks: [
      {
        title: 'Les principaux connecteurs',
        table: table(
          ['Fonction', 'Connecteurs', 'Exemple'],
          ['Addition', 'and, also, too, as well, moreover (soutenu)', 'She speaks French and Spanish too.'],
          ['Opposition', 'but, although, even though, however', 'Although it was cold, we went out.'],
          ['Cause', 'because, because of + nom, as, since', 'I stayed at home because I was ill.'],
          ['Conséquence', "so, that's why, therefore (soutenu)", 'It was late, so we took a taxi.'],
          ['But', 'to + base, in order to, so that', 'I went to the shop to buy milk.'],
          ['Chronologie', 'first, then, after that, finally', 'First, open the box. Then read the instructions.'],
        ),
      },
      {
        title: 'Ponctuation et construction',
        points: [
          "however ouvre en général la phrase et est suivi d'une virgule : It's expensive. However, it's very good.",
          "although introduit une proposition : Although he's rich, he isn't happy. (= bien que, sans subjonctif)",
          'because + phrase ; because of + nom : because of the rain.',
          '« pour » exprimant le but = to + base, jamais for + verbe : I came to see you.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex("I like my job, but it's very tiring.", "J'aime mon travail, mais il est très fatigant."),
          ex('The flight was cancelled because of the storm.', 'Le vol a été annulé à cause de la tempête.'),
          ex('Although she was tired, she finished the report.', 'Même si elle était fatiguée, elle a terminé le rapport.'),
        ],
      },
    ],
    pitfalls: [
      pit('I went there for buy bread.', 'I went there to buy bread.', '« pour » + verbe = to + base verbale.'),
      pit('Because the rain, we stayed home.', 'Because of the rain, we stayed home.', 'Devant un nom : because of.'),
      pit('Although it was late but we continued.', 'Although it was late, we continued.', "although et but ne s'emploient pas ensemble."),
    ],
    remember: ['because + phrase ; because of + nom.', 'although = bien que (sans but).', 'But : to + base verbale.'],
  },

  relative_clauses: {
    intro:
      "Les propositions relatives précisent un nom. Le pronom dépend de ce qu'il remplace : une **personne** (who), une **chose** (which), un **lieu** (where), un **possesseur** (whose). **that** peut remplacer who ou which.",
    blocks: [
      {
        title: 'Les pronoms relatifs',
        table: table(
          ['Pronom', 'Remplace', 'Exemple'],
          ['who / that', 'une personne', 'The woman who lives next door is a nurse.'],
          ['which / that', 'une chose, un animal', 'The book which I bought is great.'],
          ['where', 'un lieu', 'This is the hotel where we stayed.'],
          ['whose', 'un possesseur (dont le, dont la)', 'I have a friend whose father is a pilot.'],
        ),
      },
      {
        title: 'Peut-on supprimer le pronom ?',
        text: "Quand le pronom est **complément** (il est suivi d'un sujet), on peut l'omettre ; c'est très courant à l'oral. Quand il est **sujet**, il est obligatoire.",
        examples: [ex('The film (that) we saw was amazing.', 'Le film que nous avons vu était génial.', 'complément : pronom facultatif'), ex('The man who called you is my boss.', "L'homme qui t'a appelé est mon chef.", 'sujet : pronom obligatoire')],
      },
      {
        title: 'À savoir',
        points: [
          'Pas de pronom personnel en plus : The man who I met him → The man who I met.',
          "La préposition peut se placer à la fin : the town I come from (la ville d'où je viens).",
          'whose remplace un possessif : the girl whose bag was stolen (la fille dont le sac a été volé).',
        ],
      },
    ],
    pitfalls: [
      pit('The man which works here is nice.', 'The man who works here is nice.', 'Personne → who (ou that).'),
      pit('The film that I saw it was good.', 'The film that I saw was good.', 'Le pronom relatif remplace déjà le complément : on ne répète pas it.'),
      pit('The girl who her bag was stolen…', 'The girl whose bag was stolen…', '« dont le, dont la » = whose.'),
    ],
    remember: ['who : personne ; which : chose ; where : lieu ; whose : possesseur.', 'Pronom complément → peut être omis.'],
  },

  subject_questions: {
    intro:
      "Quand le mot interrogatif (who, what, which…) est le **sujet** de la phrase, on n'utilise **pas d'auxiliaire do / does / did** : l'ordre reste celui de la phrase affirmative.",
    blocks: [
      {
        title: 'Sujet ou complément ?',
        table: table(
          ['Question sur le sujet', 'Question sur le complément'],
          ["Who called you? (Qui t'a appelé ?)", 'Who did you call? (Qui as-tu appelé ?)'],
          ["What happened? (Que s'est-il passé ?)", "What did you do? (Qu'as-tu fait ?)"],
          ['Who lives here?', 'Who do you live with?'],
          ['Which bus goes to the station?', 'Which bus do you take?'],
        ),
      },
      {
        title: 'Le repère',
        text: 'Si la réponse remplace le **sujet** (Tom called me → Who called you?), pas d’auxiliaire ; le verbe prend la forme du sujet : -s au présent, prétérit au passé.',
        examples: [ex('Who wants a coffee?', 'Qui veut un café ?'), ex('What made you laugh?', "Qu'est-ce qui t'a fait rire ?"), ex('How many people came to the party?', 'Combien de personnes sont venues à la fête ?')],
      },
    ],
    pitfalls: [
      pit('Who did call you?', 'Who called you?', "who est sujet → pas d'auxiliaire did."),
      pit('What did happen?', 'What happened?', 'what est le sujet de happen.'),
      pit('Who live here?', 'Who lives here?', 'who sujet est suivi d’un verbe au singulier : -s au présent.'),
    ],
    remember: ['Mot interrogatif sujet → pas de do / does / did.', 'Who called? (sujet) ≠ Who did you call? (complément).'],
  },

  question_tags: {
    intro:
      "Les question tags sont de courtes questions ajoutées en fin de phrase pour demander confirmation, comme « n'est-ce pas ? ». Ils reprennent **l'auxiliaire** de la phrase avec la **polarité inverse**.",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Phrase', 'Tag', 'Règle'],
          ["It's cold,", "isn't it?", 'affirmative → tag négatif'],
          ["You aren't tired,", 'are you?', 'négative → tag affirmatif'],
          ['She works here,', "doesn't she?", 'présent simple → do / does'],
          ['They left early,', "didn't they?", 'prétérit → did'],
          ['You can swim,', "can't you?", 'modal → même modal'],
          ['He has finished,', "hasn't he?", 'present perfect → have / has'],
          ["I'm right,", "aren't I?", "exception : I am → aren't I"],
        ),
      },
      {
        title: 'À savoir',
        points: [
          "Le sujet du tag est toujours un pronom : Your sister lives in Rome, doesn't she?",
          "Let's…, shall we? — Open the door, will you?",
          'Intonation descendante : on attend une confirmation ; montante : vraie question.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex("It's a beautiful day, isn't it?", "Il fait beau, n'est-ce pas ?"),
          ex("You didn't forget the tickets, did you?", "Tu n'as pas oublié les billets, hein ?"),
          ex("He'll come tomorrow, won't he?", 'Il viendra demain, non ?'),
        ],
      },
    ],
    pitfalls: [
      pit("She likes tea, isn't it?", "She likes tea, doesn't she?", "On reprend l'auxiliaire (does) et le pronom sujet (she) : pas de « isn't it » passe-partout."),
      pit("You're French, are you?", "You're French, aren't you?", 'Phrase affirmative → tag négatif.'),
      pit("Tom is here, isn't Tom?", "Tom is here, isn't he?", 'Le tag utilise un pronom.'),
    ],
    remember: ['Même auxiliaire, polarité inverse, pronom sujet.', "I'm…, aren't I?"],
  },

  passive: {
    intro:
      "La voix passive met en avant **ce qui subit l'action** plutôt que celui qui la fait. Elle se forme avec **be + participe passé**, be étant conjugué au temps voulu. Elle est bien plus fréquente en anglais qu'en français, où l'on dit souvent « on ».",
    blocks: [
      {
        title: 'Formation',
        table: table(
          ['Temps', 'Actif', 'Passif'],
          ['Présent simple', 'They make cars here.', 'Cars are made here.'],
          ['Prétérit', 'Someone stole my bike.', 'My bike was stolen.'],
          ['Present perfect', 'They have repaired the road.', 'The road has been repaired.'],
          ['Futur', 'They will announce the results.', 'The results will be announced.'],
          ['Modal', 'You must sign the form.', 'The form must be signed.'],
        ),
      },
      {
        title: 'by + agent',
        text: "On ne précise l'auteur avec **by** que s'il apporte une information utile.",
        examples: [
          ex('This house was built in 1850.', 'Cette maison a été construite en 1850.'),
          ex('The Mona Lisa was painted by Leonardo da Vinci.', 'La Joconde a été peinte par Léonard de Vinci.'),
          ex('English is spoken all over the world.', 'On parle anglais dans le monde entier.', '« on » → passif'),
        ],
      },
      {
        title: 'À savoir',
        points: ['Question : Where was it made? When were you born?', "Négation : The letter wasn't sent.", 'be born (naître) est toujours au passif : I was born in Lille.'],
      },
    ],
    pitfalls: [
      pit('The bridge was build in 1900.', 'The bridge was built in 1900.', 'Passif = be + participe passé (built).'),
      pit('My car stole yesterday.', 'My car was stolen yesterday.', "La voiture subit l'action → passif avec be."),
      pit('On speaks English here.', 'English is spoken here.', '« on » se rend souvent par le passif (ou par people, they).'),
    ],
    remember: ['be (au temps voulu) + participe passé.', 'by + agent seulement si c’est utile.'],
  },

  reported_speech: {
    intro:
      "Le discours indirect rapporte les paroles de quelqu'un : « Elle a dit qu'elle était fatiguée ». Quand le verbe introducteur est au passé (said, told), les temps **reculent d'un cran**, comme en français.",
    blocks: [
      {
        title: 'La concordance des temps',
        table: table(
          ['Discours direct', 'Discours indirect'],
          ['“I am tired.”', 'She said (that) she was tired.'],
          ['“I work in a bank.”', 'He said he worked in a bank.'],
          ["“I'm leaving.”", 'She said she was leaving.'],
          ['“I will call you.”', 'He said he would call me.'],
          ['“I can help.”', 'She said she could help.'],
          ['“I have finished.”', 'He said he had finished.'],
        ),
      },
      {
        title: 'say ou tell ?',
        points: [
          'say + (that) + phrase : She said that she was busy.',
          'tell + personne + (that) : She told me that she was busy.',
          'Jamais say me : He said me → He told me.',
          'Les repères changent aussi : now → then, today → that day, tomorrow → the next day, here → there.',
        ],
      },
      {
        title: 'Exemples',
        examples: [
          ex('Tom said he was hungry.', "Tom a dit qu'il avait faim."),
          ex('She told me she would be late.', "Elle m'a dit qu'elle serait en retard."),
          ex('They said they had seen the film.', "Ils ont dit qu'ils avaient vu le film."),
        ],
      },
    ],
    pitfalls: [
      pit('He said me that he was tired.', 'He told me that he was tired.', 'say ne se construit pas directement avec une personne : tell me.'),
      pit('She said she will come.', 'She said she would come.', 'Après said, will devient would.'),
      pit('He told that he was ill.', 'He said that he was ill.', "tell est toujours suivi de la personne à qui l'on parle (He told me…)."),
    ],
    remember: ['Verbe introducteur au passé → les temps reculent (am → was, will → would).', 'say (that) ; tell + personne (that).'],
  },

  reading: {
    intro:
      'La compréhension écrite s’entraîne sur des textes courts et variés : profils, récits, e-mails, petites annonces. Chaque texte mobilise les structures grammaticales du parcours.',
    blocks: [
      {
        title: 'Méthode',
        points: [
          'Lisez d’abord les questions : vous saurez quoi chercher.',
          'Repérez les mots-clés du texte : noms propres, chiffres, dates, heures.',
          'Ne bloquez pas sur un mot inconnu : le contexte suffit souvent.',
          "Méfiez-vous des options qui reprennent un mot du texte sans en respecter le sens : c'est le piège le plus courant.",
        ],
      },
      {
        title: 'Les temps sont des indices',
        text: "Les temps verbaux donnent beaucoup d'informations : « I've just started » (action récente), « I used to » (habitude terminée), « I'm going to » (projet), « If you come, we'll… » (condition).",
      },
    ],
    pitfalls: [],
    remember: ["Les questions d'abord, le texte ensuite.", 'Le temps du verbe est un indice précieux.'],
  },

  listening: {
    intro:
      'La compréhension orale s’entraîne sur des annonces, des messages vocaux, des bulletins météo et des échanges en magasin, lus par la synthèse vocale de votre navigateur.',
    blocks: [
      {
        title: 'Méthode',
        points: [
          "Lisez la question avant d'écouter.",
          'Première écoute : le sens général ; deuxième écoute : les détails (heure, prix, lieu).',
          'Utilisez le bouton « Lent » pour les passages difficiles.',
          'Les nombres sont un piège classique : fifteen (15) / fifty (50), thirteen (13) / thirty (30).',
        ],
      },
      {
        title: "L'accent de phrase",
        text: "À l'oral, les petits mots (to, for, and, of, a) sont réduits ; les mots porteurs de sens (noms, verbes, chiffres) sont accentués. Concentrez-vous sur ces mots accentués : ils suffisent souvent à comprendre.",
      },
    ],
    pitfalls: [],
    remember: ['La question d’abord, puis deux écoutes.', 'Attention aux nombres en -teen et en -ty.'],
  },

  dialogues: {
    intro:
      'Les dialogues reproduisent des situations du quotidien : café, hôtel, magasin, médecin, téléphone, travail. Le but : choisir la réplique la plus naturelle et la plus polie.',
    blocks: [
      {
        title: 'Formules indispensables',
        table: table(
          ['Situation', 'Formule'],
          ['Commander', "I'd like…, please. / Could I have…?"],
          ['Demander un prix', 'How much is it? / How much are they?'],
          ['Faire répéter', 'Sorry, could you repeat that, please?'],
          ['Accepter', "Yes, please. / That sounds great. / I'd love to."],
          ['Refuser poliment', "No, thank you. / I'm afraid I can't."],
          ['Remercier, répondre', "Thank you so much. — You're welcome. / No problem."],
          ['Au téléphone', 'Hello, this is… / Can I speak to…? / Hold on, please.'],
        ),
      },
      {
        title: 'La politesse anglaise',
        points: [
          'Les anglophones adoucissent beaucoup les demandes : Could you…? plutôt que Give me…',
          'please et thank you sont attendus à chaque échange.',
          'Sorry sert à s’excuser, mais aussi à faire répéter ou à interpeller quelqu’un.',
        ],
      },
    ],
    pitfalls: [pit('Give me a coffee.', "Could I have a coffee, please?", "L'impératif sonne brusque : on formule une demande polie.")],
    remember: ["I'd like… pour commander.", 'Could you…? pour demander poliment.'],
  },
};
