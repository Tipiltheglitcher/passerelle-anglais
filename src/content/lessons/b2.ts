/** Leçons de l'étape B1 → B2. */
import { ex, pit, table, type Lesson } from './types';

export const B2_LESSONS: Record<string, Lesson> = {
  past_perfect: {
    intro:
      "Le **past perfect** (had + participe passé) situe une action **avant** un autre moment du passé. C'est l'équivalent du plus-que-parfait français : « il **était** déjà **parti** quand je suis arrivé ». On l'emploie dès qu'un récit au passé doit remonter plus loin dans le temps.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Forme', 'Exemple'], ['had + participe passé', 'She had left.'], ["hadn't + participe passé", "She hadn't left."], ['Had + sujet + participe ?', 'Had she left?']),
      },
      {
        title: 'Deux moments du passé',
        examples: [
          ex('When I got to the station, the train had already left.', "Quand je suis arrivé à la gare, le train était déjà parti.", 'avant mon arrivée'),
          ex('When I got to the station, the train left.', 'Quand je suis arrivé à la gare, le train est parti.', 'juste après mon arrivée'),
          ex('By the time the police arrived, the thieves had disappeared.', "Le temps que la police arrive, les voleurs avaient disparu."),
          ex("She told me she had never been to Rome.", "Elle m'a dit qu'elle n'était jamais allée à Rome.", 'discours rapporté'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'Mots fréquents : already, just, never, by the time, before, after, when.',
          "Après after et before, le prétérit simple suffit souvent car l'ordre est déjà clair : After she (had) finished, she left.",
          "On ne met jamais le present perfect (have/has + participe) dans un récit au passé.",
          "Dans un récit, on n'emploie le past perfect que pour le retour en arrière : inutile de l'utiliser à chaque verbe.",
        ],
      },
    ],
    pitfalls: [
      pit('When I arrived, she has already left.', 'When I arrived, she had already left.', 'Récit au passé : had, pas has.'),
      pit('I had went to bed when you called.', 'I had gone to bed when you called.', 'Participe passé de go : gone.'),
      pit('He said he has finished.', 'He said he had finished.', 'Discours rapporté au passé : le present perfect devient past perfect.'),
    ],
    remember: ['had + participe passé = action antérieure à un autre moment du passé.', 'Comparez : the train left (après) / the train had left (avant).'],
  },

  past_perfect_cont: {
    intro:
      "Le **past perfect continu** (had been + -ing) insiste sur la **durée** ou le **déroulement** d'une activité qui s'est poursuivie jusqu'à un moment du passé, souvent pour expliquer une situation : « elle avait les yeux rouges : elle **avait pleuré** ».",
    blocks: [
      {
        title: 'Formation et emplois',
        table: table(['Emploi', 'Exemple'], ['Durée jusqu’à un moment passé', 'They had been waiting for two hours when the bus came.'], ['Cause visible d’un état passé', 'The ground was wet: it had been raining.'], ['Question sur la durée', 'How long had you been living there?']),
      },
      {
        title: 'Comparer',
        examples: [
          ex('I had been reading for an hour when the phone rang.', "Je lisais depuis une heure quand le téléphone a sonné.", 'durée, activité'),
          ex('I had read three chapters when the phone rang.', "J'avais lu trois chapitres quand le téléphone a sonné.", 'résultat, quantité'),
          ex('She was exhausted because she had been working all night.', "Elle était épuisée parce qu'elle avait travaillé toute la nuit."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'En français, on traduit souvent par l’imparfait + depuis : I had been living there for ten years → J’habitais là depuis dix ans.',
          'Les verbes d’état (know, believe, own) ne se mettent pas à la forme continue : I had known him for years.',
          'Pour un résultat chiffré (how many, three chapters), on préfère le past perfect simple.',
        ],
      },
    ],
    pitfalls: [
      pit('She has been working all night, so she was tired.', 'She had been working all night, so she was tired.', 'Récit au passé : had been, pas has been.'),
      pit('I had been knowing him for years.', 'I had known him for years.', 'know est un verbe d’état : pas de forme continue.'),
      pit('We were waiting for two hours when the bus came.', 'We had been waiting for two hours when the bus came.', 'Durée jusqu’à un moment passé : had been + -ing.'),
    ],
    remember: ['had been + -ing : durée jusqu’à un moment du passé.', 'Traduction fréquente : imparfait + depuis.'],
  },

  future_perf_cont: {
    intro:
      "Pour se projeter avec précision, l'anglais distingue le **futur antérieur** (will have + participe passé : action **terminée** avant un moment futur) et le **futur continu** (will be + -ing : action **en cours** à un moment futur). Le futur antérieur continu (will have been + -ing) mesure une durée jusqu'à ce moment.",
    blocks: [
      {
        title: 'Trois formes',
        table: table(['Forme', 'Sens', 'Exemple'], ['will be + -ing', 'en cours à un moment futur', 'This time tomorrow, I will be flying to Rome.'], ['will have + participe passé', 'terminé avant un moment futur', 'By Friday, I will have finished the report.'], ['will have been + -ing', 'durée jusqu’à un moment futur', 'In June, she will have been working here for ten years.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex("Don't call at eight: we'll be having dinner.", "N'appelle pas à huit heures : nous serons en train de dîner."),
          ex("By the time you arrive, I'll have cooked everything.", "Quand tu arriveras, j'aurai tout préparé."),
          ex('Will you be using the car tonight?', 'Tu utiliseras la voiture ce soir ?', 'question polie sur les projets'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'by = au plus tard (by Monday, by then, by the end of the year) : signal fréquent du futur antérieur.',
          'Will you be + -ing ? demande poliment des nouvelles d’un projet, sans faire pression (≠ Will you…? qui peut sonner comme une requête).',
          'Après when, as soon as, by the time : présent (ou present perfect), jamais will : By the time you get here, I will have left.',
        ],
      },
    ],
    pitfalls: [
      pit('By Friday, I have finished the report.', 'By Friday, I will have finished the report.', 'Moment futur : will have + participe passé.'),
      pit('By the time you will arrive, I will have left.', 'By the time you arrive, I will have left.', 'Pas de will après by the time.'),
      pit('This time tomorrow I will lie on a beach.', 'This time tomorrow I will be lying on a beach.', 'Action en cours à un moment futur : will be + -ing.'),
    ],
    remember: ['will be + -ing : en cours ; will have + participe : terminé.', 'by + moment futur appelle souvent le futur antérieur.'],
  },

  third_conditional: {
    intro:
      "Le **conditionnel de type 3** imagine un passé différent : la condition ne s'est **pas réalisée**, sa conséquence non plus. Structure : **If + past perfect, would have + participe passé**, comme « si + plus-que-parfait, conditionnel passé » en français. Il sert à exprimer un regret, un reproche ou un soulagement.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Condition (if)', 'Conséquence'], ['If + had + participe passé,', 'would have + participe passé'], ['If I had known,', 'I would have come.'], ["If she hadn't missed the bus,", "she wouldn't have been late."]),
      },
      {
        title: 'Exemples',
        examples: [
          ex("If we had left earlier, we would have caught the train.", 'Si nous étions partis plus tôt, nous aurions eu le train.', 'regret'),
          ex("If you hadn't helped me, I would never have finished.", "Si tu ne m'avais pas aidé, je n'aurais jamais fini.", 'reconnaissance'),
          ex('What would you have done if you had lost your passport?', 'Qu’aurais-tu fait si tu avais perdu ton passeport ?'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "would have peut être remplacé par could have (aurait pu) ou might have (aurait peut-être) : If I'd known, I could have helped.",
          "À l'oral, 'd peut valoir had (dans la condition) ou would (dans la conséquence) : If I'd known, I'd have come.",
          "On peut inverser les deux parties : I would have come if I had known (pas de virgule).",
        ],
      },
    ],
    pitfalls: [
      pit('If I would have known, I would have come.', 'If I had known, I would have come.', 'Jamais would dans la proposition en if.'),
      pit('If I knew, I would have come.', 'If I had known, I would have come.', 'Condition passée : past perfect.'),
      pit('If I had known, I would come.', 'If I had known, I would have come.', 'Conséquence passée : would have + participe passé (sauf conditionnel mixte).'),
    ],
    remember: ['If + had done, would have done : passé imaginaire.', "Jamais would après if."],
  },

  mixed_conditionals: {
    intro:
      "Les **conditionnels mixtes** croisent les époques. Une condition **passée** peut avoir une conséquence **présente** (If I had studied medicine, I **would be** a doctor now), et une situation **présente** peut expliquer une conséquence **passée** (If I **were** braver, I **would have** said something).",
    blocks: [
      {
        title: 'Deux combinaisons',
        table: table(['Condition', 'Conséquence', 'Exemple'], ['passée (had + participe)', 'présente (would + base)', 'If I had taken the job, I would be living in Rome now.'], ['présente / permanente (prétérit)', 'passée (would have + participe)', "If I weren't so shy, I would have spoken to her."]),
      },
      {
        title: 'Exemples',
        examples: [
          ex('If we had left earlier, we would be there by now.', 'Si nous étions partis plus tôt, nous y serions déjà.'),
          ex("If she spoke Spanish, she would have understood the guide.", "Si elle parlait espagnol, elle aurait compris le guide."),
          ex("If you hadn't helped me, I would still be stuck in that job.", "Si tu ne m'avais pas aidé, je serais encore coincé dans ce travail."),
        ],
      },
      {
        title: 'Repères',
        points: ['now, today, still, by now signalent une conséquence présente.', 'Un trait de caractère ou une compétence (be shy, speak Spanish) est une condition présente même si la conséquence est passée.'],
      },
    ],
    pitfalls: [
      pit('If I had studied medicine, I would have been a doctor now.', 'If I had studied medicine, I would be a doctor now.', 'now : conséquence présente → would be.'),
      pit('If I would be braver, I would have spoken.', 'If I were braver, I would have spoken.', 'Pas de would dans la condition.'),
    ],
    remember: ['Passé → présent : If + had done, would do.', 'Présent → passé : If + did, would have done.'],
  },

  wish_if_only: {
    intro:
      "Pour exprimer un **souhait irréel** ou un **regret**, l'anglais emploie **wish** ou **if only** en « reculant » le temps : prétérit pour le présent, past perfect pour le passé. Les mêmes règles valent pour **It's (high) time…** et **I'd rather + sujet**.",
    blocks: [
      {
        title: 'Le temps recule',
        table: table(['Regret / souhait', 'Structure', 'Exemple'], ['sur le présent', 'wish + prétérit', 'I wish I had more time.'], ['sur le passé', 'wish + past perfect', "I wish I hadn't said that."], ['agacement (comportement d’autrui)', 'wish + would', 'I wish you would stop.'], ['capacité', 'wish + could', 'I wish I could swim.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('If only we had listened to the forecast!', 'Si seulement nous avions écouté la météo !'),
          ex("It's high time you found a job.", 'Il est grand temps que tu trouves un travail.'),
          ex("I'd rather you didn't smoke here.", 'Je préférerais que tu ne fumes pas ici.'),
          ex('I wish I were taller.', "J'aimerais être plus grand.", 'were : forme soutenue, was courant'),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'On ne dit pas I wish I would… : avec le même sujet, on emploie le prétérit ou could.',
          'wish + to = souhaiter (formel) : I wish to make a complaint.',
          'hope + présent ou futur exprime un espoir réaliste : I hope you pass (≠ I wish you passed).',
        ],
      },
    ],
    pitfalls: [
      pit('I wish I have more money.', 'I wish I had more money.', 'Regret présent : prétérit.'),
      pit("I wish I didn't go to that party.", "I wish I hadn't gone to that party.", 'Regret passé : past perfect.'),
      pit("It's time we go.", "It's time we went.", "It's time + sujet + prétérit."),
    ],
    remember: ['wish / if only : présent → prétérit, passé → past perfect.', 'wish + would : on voudrait que quelqu’un change de comportement.'],
  },

  modals_past: {
    intro:
      "Suivis de **have + participe passé**, les modaux expriment une **déduction**, une **possibilité**, un **reproche** ou une **inutilité** concernant le passé. Le choix du modal traduit votre degré de certitude ou votre jugement.",
    blocks: [
      {
        title: 'Le sens de chaque modal',
        table: table(['Forme', 'Sens', 'Français'], ['must have done', 'quasi-certitude', 'a dû faire'], ["can't / couldn't have done", 'impossibilité', "n'a pas pu faire"], ['might / may / could have done', 'possibilité', 'a peut-être fait'], ['should have done', 'reproche, regret', 'aurait dû faire'], ['could have done', 'possibilité non réalisée', 'aurait pu faire'], ["needn't have done", 'fait mais inutile', "n'était pas la peine"]),
      },
      {
        title: 'Exemples',
        examples: [
          ex("The lights are off. They must have gone out.", 'Les lumières sont éteintes. Ils ont dû sortir.'),
          ex("He can't have seen me: he didn't say hello.", "Il n'a pas pu me voir : il ne m'a pas dit bonjour."),
          ex('You should have told me!', 'Tu aurais dû me le dire !'),
          ex("We needn't have hurried: the train was late.", "Ce n'était pas la peine de nous dépêcher : le train était en retard."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "Le contraire de must have (déduction) est can't have, pas mustn't have.",
          "needn't have done (on l'a fait, inutilement) ≠ didn't need to do (pas de nécessité ; on ne sait pas si on l'a fait).",
          'could have done peut aussi exprimer un reproche : You could have warned me!',
        ],
      },
    ],
    pitfalls: [
      pit('She must left early.', 'She must have left early.', 'Passé : modal + have + participe passé.'),
      pit("He mustn't have seen me.", "He can't have seen me.", "Impossibilité logique : can't / couldn't have."),
      pit('You should have tell me.', 'You should have told me.', 'Participe passé après have.'),
    ],
    remember: ['must have = sûrement ; can’t have = impossible ; might have = peut-être.', 'should have = reproche ; needn’t have = inutile.'],
  },

  passive_advanced: {
    intro:
      "Au niveau B2, le passif sert à **rapporter des opinions ou des rumeurs** sans en nommer la source (It is said that…, He is believed to…), à combiner passif et modaux (must be done) et à employer les formes progressives et infinitives (is being built, hates being told).",
    blocks: [
      {
        title: "Passif des verbes d'opinion",
        table: table(['Structure', 'Exemple', 'Français'], ['It is said / thought / believed that…', 'It is said that the castle is haunted.', 'On dit que le château est hanté.'], ['Sujet + is said to + base', 'The castle is said to be haunted.', 'idem'], ['Sujet + is believed to have + participe', 'He is believed to have left.', "On pense qu'il est parti."]),
      },
      {
        title: 'Autres formes',
        examples: [
          ex('All documents must be signed before Friday.', 'Tous les documents doivent être signés avant vendredi.', 'modal + be + participe'),
          ex('The bridge is being repaired.', 'Le pont est en cours de réparation.', 'passif progressif'),
          ex('She hates being interrupted.', "Elle déteste qu'on l'interrompe.", 'being + participe'),
          ex('The results will be announced tomorrow.', 'Les résultats seront annoncés demain.'),
        ],
      },
      {
        title: 'À savoir',
        points: ["L'infinitif passé (to have done) indique que le fait est antérieur à l'opinion.", 'Le passif est très fréquent dans la presse et les écrits formels : il met en avant le résultat plutôt que l’auteur.'],
      },
    ],
    pitfalls: [
      pit('The suspect is believed to leave the country last week.', 'The suspect is believed to have left the country last week.', 'Fait passé : infinitif passé.'),
      pit('The documents must signed.', 'The documents must be signed.', 'Passif : be + participe.'),
      pit('It says that the castle is haunted.', 'It is said that the castle is haunted.', '« On dit que » = It is said that.'),
    ],
    remember: ['It is said that… = He is said to…', 'Fait antérieur : to have + participe passé.'],
  },

  causative: {
    intro:
      "Le **causatif** permet de dire qu'on **fait faire** quelque chose par quelqu'un d'autre : **have / get + objet + participe passé** (I had my car repaired). La même structure décrit une mésaventure subie (She had her bag stolen). Pour obtenir de quelqu'un qu'il agisse : **get somebody to do** ou **have somebody do**.",
    blocks: [
      {
        title: 'Structures',
        table: table(['Structure', 'Exemple', 'Français'], ['have + objet + participe', 'I had my hair cut.', 'Je me suis fait couper les cheveux.'], ['get + objet + participe', "We're getting the kitchen painted.", 'Nous faisons repeindre la cuisine.'], ['get + personne + to + base', 'I got him to help me.', "J'ai obtenu qu'il m'aide."], ['have + personne + base', 'She had the students rewrite it.', 'Elle l’a fait réécrire aux élèves.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('You should get your eyes tested.', 'Tu devrais faire contrôler ta vue.'),
          ex('He had his wallet stolen on the train.', "Il s'est fait voler son portefeuille dans le train.", 'mésaventure'),
          ex("I'll get my brother to drive us.", 'Je vais demander à mon frère de nous conduire.'),
        ],
      },
      {
        title: 'Attention à l’ordre des mots',
        points: ['I had my car repaired = je l’ai fait réparer.', 'I had repaired my car = je l’avais réparée moi-même (past perfect).', 'get est un peu plus familier que have.'],
      },
    ],
    pitfalls: [
      pit('I cut my hair at the hairdresser’s.', 'I had my hair cut at the hairdresser’s.', 'Si c’est le coiffeur qui coupe : causatif.'),
      pit('She had stolen her bag.', 'She had her bag stolen.', "L'objet se place entre have et le participe."),
      pit('I got him help me.', 'I got him to help me.', 'get somebody TO do.'),
    ],
    remember: ['have / get + objet + participe passé = faire faire.', 'get somebody to do / have somebody do.'],
  },

  reporting_verbs: {
    intro:
      "Plutôt que de répéter say et tell, l'anglais emploie des **verbes introducteurs** qui résument l'intention du locuteur : suggest, advise, deny, admit, refuse, remind, accuse… Chacun a sa **construction**, qu'il faut apprendre avec le verbe.",
    blocks: [
      {
        title: 'Constructions',
        table: table(['Construction', 'Verbes', 'Exemple'], ['verbe + -ing', 'suggest, deny, admit, recommend', 'He denied taking the money.'], ['verbe + to + base', 'refuse, agree, offer, promise, threaten', 'She refused to answer.'], ['verbe + personne + to + base', 'advise, remind, warn, encourage, persuade', 'He reminded me to lock the door.'], ['verbe + (personne) + préposition + -ing', 'accuse of, apologise for, insist on, blame for', 'She apologised for being late.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex("'Let's take a taxi.' → She suggested taking a taxi.", 'Elle a proposé de prendre un taxi.'),
          ex("'You should rest.' → The doctor advised me to rest.", "Le médecin m'a conseillé de me reposer."),
          ex("'I didn't do it.' → He denied doing it.", "Il a nié l'avoir fait."),
        ],
      },
      {
        title: 'À savoir',
        points: ['suggest ne se construit jamais avec to + base : suggest doing / suggest that we (should) do.', 'having + participe passé souligne l’antériorité : He admitted having lied.'],
      },
    ],
    pitfalls: [
      pit('She suggested to go to the beach.', 'She suggested going to the beach.', 'suggest + -ing.'),
      pit('He accused me to lie.', 'He accused me of lying.', 'accuse somebody of + -ing.'),
      pit('The doctor advised me resting.', 'The doctor advised me to rest.', 'advise somebody to do.'),
    ],
    remember: ['Apprenez chaque verbe avec sa construction.', 'suggest / deny / admit + -ing ; refuse / agree + to ; advise / remind + personne + to.'],
  },

  linking_contrast: {
    intro:
      "Pour opposer ou concéder, il faut distinguer les **prépositions** (despite, in spite of + nom ou -ing), les **conjonctions** (although, even though, whereas, while + proposition) et les **adverbes de liaison** (however, nevertheless, even so, qui relient deux phrases).",
    blocks: [
      {
        title: 'Trois familles',
        table: table(['Famille', 'Mots', 'Construction'], ['Prépositions', 'despite, in spite of', '+ nom / -ing : Despite the rain…'], ['Conjonctions', 'although, even though, whereas, while', '+ sujet + verbe : Although it rained…'], ['Adverbes de liaison', 'however, nevertheless, even so, all the same', 'en tête de phrase + virgule : However, …']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('Despite the rain, the match went ahead.', 'Malgré la pluie, le match a eu lieu.'),
          ex('Although she was tired, she kept working.', 'Bien qu’elle soit fatiguée, elle a continué à travailler.'),
          ex('Tom loves cities, whereas his sister prefers the countryside.', 'Tom adore les villes, alors que sa sœur préfère la campagne.'),
          ex('The job was well paid. Even so, I turned it down.', "Le poste était bien payé. Malgré tout, je l'ai refusé."),
        ],
      },
      {
        title: 'À savoir',
        points: ['despite the fact that + proposition est possible : despite the fact that it rained.', 'even though est plus fort que although.', 'whereas oppose deux faits parallèles ; although concède.'],
      },
    ],
    pitfalls: [
      pit('Despite of the rain, we went out.', 'Despite the rain, we went out.', 'despite sans of.'),
      pit('Although the rain, we went out.', 'Despite the rain, we went out.', 'although + proposition, pas + nom.'),
      pit('However it was late, we stayed.', 'Although it was late, we stayed.', 'however ne peut pas introduire une subordonnée de concession.'),
    ],
    remember: ['despite / in spite of + nom ou -ing.', 'although / even though + proposition ; however en tête de phrase.'],
  },

  reading_b2: {
    intro:
      "Au niveau B2, les textes sont plus longs et plus denses : articles de presse, reportages, vulgarisation. L'objectif n'est plus seulement de repérer des informations, mais de comprendre **l'organisation** du texte, les **inférences** et la **position de l'auteur**.",
    blocks: [
      {
        title: 'Méthode en quatre temps',
        points: [
          "Lisez le titre et la première phrase de chaque paragraphe pour saisir l'idée générale.",
          'Lisez les questions avant la lecture détaillée.',
          "Pour chaque question, retrouvez le passage précis : la bonne réponse le reformule, les mauvaises le déforment, l'exagèrent ou en inversent le sens.",
          "Pour la position de l'auteur, relevez la modalisation : clearly, arguably, almost certainly, it would be unwise…",
        ],
      },
      {
        title: 'Types de questions',
        table: table(['Question', 'Ce qu’on cherche'], ['Idée principale', 'le message de l’ensemble du texte'], ['Détail', 'une information précise reformulée'], ['Inférence', 'ce que le texte implique sans le dire'], ['Vocabulaire en contexte', 'le sens d’un mot dans cette phrase'], ["Position de l'auteur", 'son jugement, souvent nuancé']),
      },
    ],
    pitfalls: [],
    remember: ['La bonne réponse reformule ; elle reprend rarement les mêmes mots.', 'Méfiez-vous des réponses absolues (always, never, completely).'],
  },

  argument_b2: {
    intro:
      "Comprendre une argumentation, c'est distinguer la **thèse** (ce que l'auteur veut faire admettre), les **justifications** (faits, exemples, chiffres), les **concessions** et les **réfutations**. C'est aussi savoir repérer les **présupposés** et les **failles** du raisonnement.",
    blocks: [
      {
        title: 'Les marqueurs à repérer',
        table: table(['Fonction', 'Marqueurs'], ['Thèse', 'I believe, it is time…, should, must'], ['Ajout', 'also, moreover, furthermore, what is more'], ['Concession', 'of course, admittedly, it is true that… but'], ['Réfutation', 'however, yet, this is not to say that'], ['Conclusion', 'therefore, ultimately, on balance, in short']),
      },
      {
        title: 'Failles fréquentes',
        points: [
          'Généraliser à partir d’un seul exemple (« ça a marché à Gand, donc ça marchera ici »).',
          'Confondre corrélation et causalité (deux faits simultanés ne sont pas forcément liés).',
          'Fausse alternative (« soit on interdit tout, soit on ne fait rien »).',
          'Attaquer la personne plutôt que l’argument.',
        ],
      },
      {
        title: 'Organiser un texte',
        text: "Dans les exercices d'ordre, appuyez-vous sur les connecteurs (However, Furthermore, therefore), les reprises (this, these, such) et la progression logique : introduction, arguments, objection, conclusion.",
      },
    ],
    pitfalls: [],
    remember: ['Thèse + justifications + concessions + conclusion.', 'Un exemple unique ne prouve pas une règle générale.'],
  },

  dialogue_b2: {
    intro:
      "Dans les conversations naturelles, les locuteurs disent rarement les choses frontalement. Ils **atténuent**, emploient la **litote** ou l'**ironie**, posent des **conditions**. Comprendre un dialogue B2, c'est saisir l'intention derrière les mots.",
    blocks: [
      {
        title: 'Procédés fréquents',
        table: table(['Procédé', 'Exemple', 'Sens réel'], ['Litote', "That's… ambitious.", "C'est irréaliste."], ['Atténuation', "I'm not sure that's the best idea.", "Je ne suis pas d'accord."], ['Ironie', "Great, another meeting.", 'Encore une réunion inutile.'], ['Concession polie', "I appreciate that, but…", 'Je comprends, mais je maintiens ma demande.']),
      },
      {
        title: 'Expressions à connaître',
        points: ["Leave it with me : je m'en occupe.", 'Fair enough : d’accord, c’est juste.', "I'll see what I can do : je ne promets rien.", 'flat out : à plein régime.'],
      },
    ],
    pitfalls: [],
    remember: ['Cherchez l’écart entre ce qui est dit et ce qui est voulu.', 'Hésitations et adjectifs neutres signalent souvent une critique polie.'],
  },

  register_b2: {
    intro:
      "Une phrase peut être correcte et pourtant **inappropriée**. Le **registre** (familier, neutre, formel) doit correspondre à la relation entre les personnes, à la situation et au support (e-mail, rapport, conversation). Trop familier, on paraît impoli ; trop formel, on paraît distant ou ironique.",
    blocks: [
      {
        title: 'Repères',
        table: table(['Familier', 'Neutre', 'Formel'], ['Thanks!', 'Thank you.', 'I am grateful for…'], ['Can you…?', 'Could you…?', 'I would be grateful if you could…'], ['Sorry!', "I'm sorry.", 'Please accept our apologies.'], ['get', 'receive', 'obtain'], ['find out', 'discover', 'ascertain']),
      },
      {
        title: 'À l’écrit formel',
        points: ['Évitez les contractions (I am, do not).', 'Préférez les verbes simples aux phrasal verbs familiers (postpone plutôt que put off dans un courrier officiel).', 'Dear Mr Patel → Yours sincerely ; Dear Sir or Madam → Yours faithfully.'],
      },
    ],
    pitfalls: [],
    remember: ['Correct ne veut pas dire approprié.', 'Adaptez le registre à la relation et au support.'],
  },

  writing_b2: {
    intro:
      "Les productions écrites B2 (essai d'opinion, lettre formelle, critique) demandent un texte **clair, organisé et argumenté**. L'application vérifie automatiquement ce qui peut l'être avec certitude (longueur, éléments imposés, erreurs fréquentes indiscutables) ; pour le reste, une **grille d'auto-évaluation** et un **modèle** vous aident à juger votre texte.",
    blocks: [
      {
        title: "Structure d'un essai d'opinion",
        points: ['Introduction : reformuler la question et annoncer sa position.', 'Deux ou trois paragraphes : un argument chacun, développé et illustré.', 'Une concession : prendre en compte l’avis opposé (It could be argued that…).', 'Conclusion : synthèse et réponse claire (On balance, …).'],
      },
      {
        title: "Ce que l'application vérifie, et ce qu'elle ne vérifie pas",
        table: table(['Vérifié automatiquement', 'À auto-évaluer'], ['Nombre de mots', 'Pertinence des idées'], ['Connecteurs et formules imposés', 'Cohérence de l’argumentation'], ['Erreurs certaines (I am agree, informations…)', 'Richesse du vocabulaire, correction globale']),
      },
    ],
    pitfalls: [],
    remember: ['Un argument par paragraphe, toujours illustré.', 'Comparez votre texte au modèle, point par point.'],
  },
};
