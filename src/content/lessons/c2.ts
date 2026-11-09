/** Leçons de l'étape C1 → C2. */
import { ex, pit, table, type Lesson } from './types';

export const C2_LESSONS: Record<string, Lesson> = {
  conditional_inversion: {
    intro:
      "En registre soutenu, **if** peut disparaître : l'auxiliaire passe alors **devant le sujet**. Trois formes coexistent, chacune avec sa nuance : **Had I known** (passé), **Should you need** (éventualité), **Were she to resign** (hypothèse improbable). S'y ajoutent **Were it not for / Had it not been for** et **But for** (« sans »).",
    blocks: [
      {
        title: 'Équivalences',
        table: table(['Avec if', 'Sans if (inversion)', 'Valeur'], ['If I had known', 'Had I known', 'condition passée non réalisée'], ['If you need / should need', 'Should you need', 'éventualité, courriers formels'], ['If she were to resign', 'Were she to resign', 'hypothèse improbable'], ['If it were not for…', 'Were it not for… / But for…', '« sans… » (présent)'], ['If it had not been for…', 'Had it not been for… / But for…', '« sans… » (passé)']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('Had we left earlier, we would not have missed the opening.', 'Si nous étions partis plus tôt, nous n’aurions pas manqué l’ouverture.'),
          ex('Should you require any assistance, please contact reception.', 'Si vous avez besoin d’aide, n’hésitez pas à contacter la réception.'),
          ex('Were the company to collapse, thousands would lose their jobs.', 'Si l’entreprise venait à s’effondrer, des milliers de personnes perdraient leur emploi.'),
          ex("Had it not been for her help, I would never have finished.", "Sans son aide, je n'aurais jamais terminé."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'Avec inversion, on emploie toujours were (jamais was) : Were I in your position…',
          'La négation ne se contracte pas en tête : Had it not been for… (✗ Hadn’t it been for…).',
          'Ces tournures appartiennent à l’écrit soutenu et aux discours formels ; à l’oral courant, if reste plus naturel.',
        ],
      },
    ],
    pitfalls: [
      pit('Was I in your position, I would accept.', 'Were I in your position, I would accept.', 'Inversion : were à toutes les personnes.'),
      pit("Hadn't it been for you, we would have failed.", 'Had it not been for you, we would have failed.', 'Pas de contraction dans l’inversion négative.'),
      pit('Should you needed help, call us.', 'Should you need help, call us.', 'Après should : base verbale.'),
    ],
    remember: ['Had I known = If I had known ; Should you need = If you need ; Were she to = If she were to.', 'But for / Were it not for = sans.'],
  },

  ellipsis_substitution: {
    intro:
      "Pour éviter les répétitions, l'anglais **supprime** (ellipse) ou **remplace** (substitution) des éléments déjà connus : un auxiliaire seul (and she **did**), **so / not** pour une proposition (I hope **not**), **do so** pour une action, **one / ones** pour un nom, **to** pour un infinitif (I'd love **to**). Maîtriser ces mécanismes rend l'anglais naturel et concis.",
    blocks: [
      {
        title: 'Procédés',
        table: table(['Procédé', 'Exemple', 'Ce qui est repris'], ['auxiliaire seul', 'I hoped she would come, and she did.', 'came'], ['so / neither + aux. + sujet', 'He can’t swim, and neither can I.', 'can’t swim'], ['so / not', 'I think so. / I hope not.', 'toute la proposition'], ['do so', 'I asked him to leave, and he did so.', 'leave'], ['one / ones', 'Have you got any bigger ones?', 'shoes'], ['to', "I'd love to.", "to join you"]),
      },
      {
        title: 'Deux phrases, deux sens',
        examples: [
          ex('So I have!', 'C’est vrai ! (je constate)', 'So + sujet + auxiliaire'),
          ex('So have I.', 'Moi aussi.', 'So + auxiliaire + sujet'),
          ex('He earns more than he used to.', "Il gagne plus qu'avant.", 'used to sans verbe'),
        ],
      },
      {
        title: 'À savoir',
        points: ['« Je crois que oui » = I think so (jamais I think yes) ; « j’espère que non » = I hope not.', 'one remplace un nom dénombrable ; avec un indénombrable, on répète le nom ou on emploie some.', 'L’auxiliaire repris doit correspondre au temps de la phrase de départ.'],
      },
    ],
    pitfalls: [
      pit('I think yes.', 'I think so.', 'so remplace la proposition.'),
      pit("He can't swim, and neither I can.", "He can't swim, and neither can I.", 'neither + auxiliaire + sujet (inversion).'),
      pit('Have you got a bigger one shoes?', 'Have you got any bigger ones?', 'ones remplace le nom pluriel.'),
    ],
    remember: ['Auxiliaire seul, so / not, do so, one(s), to : autant de moyens d’éviter la répétition.', 'So I have (c’est vrai) ≠ So have I (moi aussi).'],
  },

  nominalisation: {
    intro:
      "La **nominalisation** transforme un verbe ou un adjectif en nom : the talks **failed** → **the failure** of the talks. Elle caractérise l'écrit soutenu (rapports, presse, écrits académiques) en condensant l'information. Bien dosée, elle donne de la densité ; en excès, elle rend le texte opaque.",
    blocks: [
      {
        title: 'Formation',
        table: table(['Base', 'Nom', 'Préposition fréquente'], ['fail', 'failure', 'the failure of'], ['decide', 'decision', 'the decision to'], ['reluctant', 'reluctance', 'reluctance to'], ['reduce', 'reduction', 'a reduction in'], ['insist', 'insistence', 'insistence on'], ['scarce', 'scarcity', 'the scarcity of']),
      },
      {
        title: 'Transformer une phrase',
        examples: [
          ex('The talks failed, which led to a strike.', 'Les négociations ont échoué, ce qui a entraîné une grève.', 'verbal'),
          ex('The failure of the talks led to a strike.', "L'échec des négociations a entraîné une grève.", 'nominal'),
          ex('In the absence of evidence, the case was dropped.', 'Faute de preuves, l’affaire a été classée.', 'nominal'),
        ],
      },
      {
        title: 'Le bon dosage',
        text: "✗ The implementation of the optimisation of the allocation of resources is under consideration. ✓ We are considering how to allocate resources more efficiently. Une chaîne de noms abstraits est la marque d'un style administratif à éviter.",
      },
    ],
    pitfalls: [
      pit('The insistance on accuracy…', 'The insistence on accuracy…', 'Orthographe : -ence.'),
      pit('The reducement of costs…', 'The reduction in costs…', 'reduce → reduction ; a reduction in.'),
      pit('The complicity of the task…', 'The complexity of the task…', 'complexity = complexité ; complicity = complicité.'),
    ],
    remember: ['Nom + préposition : the failure of, a reduction in, insistence on.', 'Nominaliser avec mesure.'],
  },

  aspect_nuance: {
    intro:
      "Au niveau C2, l'aspect et les modaux expriment des **nuances fines** : comportement passager (You're **being** unreasonable), agacement (She's **always borrowing** my things), habitude passée évoquée (He **would** tell us stories), projet passé (We **were to** meet), supposition (That **will** be the postman), demande atténuée (I'm **hoping** you could…).",
    blocks: [
      {
        title: 'Valeurs',
        table: table(['Forme', 'Valeur', 'Exemple'], ['be being + adjectif', 'comportement passager', "You're being very stubborn."], ['always / forever + -ing', 'agacement', "He's always interrupting."], ['would + base', 'habitude passée (actions)', 'She would walk for hours.'], ['was / were to + base', 'projet passé', 'We were to meet at noon.'], ['will + base', 'supposition sur le présent', "That'll be the postman."], ['I’m hoping / I was wondering', 'demande atténuée', "I was wondering if you could help."]),
      },
      {
        title: 'Exemples',
        examples: [
          ex("I've been reading your report, but I haven't finished it.", "J'ai commencé à lire ton rapport, mais je ne l'ai pas fini.", 'activité inachevée'),
          ex('I was about to leave when the phone rang.', "J'étais sur le point de partir quand le téléphone a sonné."),
          ex("She's staying with friends until she finds a flat.", 'Elle loge chez des amis en attendant de trouver un appartement.', 'situation temporaire'),
        ],
      },
      {
        title: 'À savoir',
        points: ['would ne s’emploie pas pour un état passé : ✗ I would have a dog → ✓ I used to have a dog.', 'have read (résultat : lu en entier) ≠ have been reading (activité, pas forcément terminée).'],
      },
    ],
    pitfalls: [
      pit("You're been unreasonable today.", "You're being unreasonable today.", 'be being + adjectif.'),
      pit('When I was a child, I would have a cat.', 'When I was a child, I used to have a cat.', 'would : actions répétées, pas états.'),
      pit("I've read your report but I haven't finished it.", "I've been reading your report but I haven't finished it.", 'Activité inachevée : forme progressive.'),
    ],
    remember: ['L’aspect exprime un point de vue : temporaire, agaçant, inachevé, supposé.', 'would (actions) ≠ used to (actions et états).'],
  },

  connotation_c2: {
    intro:
      "Deux mots peuvent désigner la même réalité tout en exprimant des **jugements opposés** : thrifty (économe) et stingy (radin), slender (élancé) et skinny (maigre). Au niveau C2, choisir un mot, c'est choisir un point de vue ; savoir le repérer permet aussi de lire entre les lignes (annonces, presse, discours).",
    blocks: [
      {
        title: 'Séries à connaître',
        table: table(['Positif', 'Neutre', 'Négatif'], ['thrifty', 'careful with money', 'stingy, tight-fisted'], ['slender, slim', 'thin', 'skinny, scrawny'], ['determined', 'firm', 'stubborn, pig-headed'], ['inquisitive', 'curious', 'nosy'], ['historic', 'old', 'old-fashioned, dilapidated'], ['eloquent', 'talkative', 'verbose, long-winded']),
      },
      {
        title: 'Euphémismes à décoder',
        points: ['Immobilier : compact (petit), vibrant (bruyant), characterful (vieillot).', 'Entreprise : rightsizing, letting go (licencier).', 'Critique : brave, interesting (douteux).'],
      },
    ],
    pitfalls: [],
    remember: ['Le choix d’un mot révèle un jugement.', 'Repérez les euphémismes pour comprendre le message réel.'],
  },

  reading_c2: {
    intro:
      "La lecture C2 est une lecture **critique** : il s'agit de comprendre non seulement ce que dit le texte, mais **comment** il le dit et **pourquoi** — métaphores argumentatives, concessions stratégiques, ironie, satire. Un texte satirique dit souvent l'inverse de ce qu'il semble affirmer.",
    blocks: [
      {
        title: 'Questions à se poser',
        points: ['Quelle est la thèse, et où est-elle formulée ?', 'Quelles métaphores structurent l’argumentation (bias laundered, golden age) ?', 'Quelles objections l’auteur concède-t-il, et comment les retourne-t-il ?', 'Le ton est-il sérieux, ironique, satirique ? Quels indices le montrent ?'],
      },
      {
        title: 'Repérer la satire',
        text: "La satire imite un genre sérieux (guide, conseil, rapport) pour en montrer l'absurdité. Indices : exagération, logique poussée à l'absurde, éloges décalés (« Intimacy is the soul of hospitality » pour un appartement bondé).",
      },
    ],
    pitfalls: [],
    remember: ['Lire la forme autant que le fond.', 'En satire, le sens réel s’oppose au sens littéral.'],
  },

  argument_c2: {
    intro:
      "Évaluer une argumentation, c'est **trier** : un texte peut contenir un argument valide et plusieurs **sophismes**. Le niveau C2 exige de nommer précisément la faille (pente glissante, attaque personnelle, appel à l'autorité ou à la tradition, faux dilemme) sans rejeter en bloc l'ensemble du raisonnement.",
    blocks: [
      {
        title: 'Sophismes',
        table: table(['Sophisme', 'Mécanisme', 'Exemple'], ['Pente glissante', 'une mesure mènerait inévitablement à des extrêmes', 'Ban phones today, ban books tomorrow.'], ['Ad hominem', 'attaquer la personne', 'Its supporters grew up without smartphones.'], ['Appel à l’autorité', 'le statut tient lieu de preuve', 'A CEO said so.'], ['Appel à la tradition', 'ancien = bon', 'It has always been done this way.'], ['Faux dilemme', 'deux options seulement', 'Either X or disaster.'], ['Corrélation / causalité', 'simultané = causal', 'Bans coincide with better results.']),
      },
      {
        title: 'Questions rhétoriques',
        text: "« Why tamper with a system that has stood the test of time? » n'attend pas de réponse : elle présente une conclusion comme une évidence. Repérez-la, puis demandez-vous si la prémisse est justifiée.",
      },
    ],
    pitfalls: [],
    remember: ['Nommer la faille précisément.', 'Un sophisme n’invalide pas les autres arguments du texte.'],
  },

  irony_c2: {
    intro:
      "L'anglais, en particulier britannique, cultive l'**ironie**, l'**understatement** (minimisation) et les formules polies à double sens. « Not bad at all » peut être un grand compliment ; « I hear what you say », un refus ; « With the greatest respect », le prélude d'une critique cinglante. Le contexte et la personne décident du sens.",
    blocks: [
      {
        title: 'Formules à double sens',
        table: table(['On dit', 'On veut souvent dire'], ['Not bad at all.', 'Très bien.'], ['Quite good.', 'Correct, sans plus.'], ['I hear what you say.', 'Je ne suis pas d’accord.'], ['With the greatest respect…', 'Vous avez tort.'], ['That’s brave / interesting.', 'C’est discutable.'], ['It was a bit breezy.', 'Il y a eu une tempête.']),
      },
      {
        title: 'Méthode',
        points: ['Comparez ce qui est dit et la situation : un écart signale l’ironie.', 'Tenez compte du locuteur : un compliment modéré chez une personne exigeante est un vrai éloge.', 'Écoutez les hésitations et la répétition : « quite good… quite good » trahit la réserve.'],
      },
    ],
    pitfalls: [],
    remember: ['Le sens dépend du contexte et du locuteur.', 'Minimiser (understatement) et ironiser sont des marques culturelles fortes.'],
  },

  register_c2: {
    intro:
      "Au niveau C2, on distingue des **registres spécialisés** : juridique (shall, premises), journalistique (presse populaire ou de qualité), diplomatique (frank and wide-ranging = désaccord), communication de crise (vraies et fausses excuses). Reconnaître et produire ces registres est un marqueur de maîtrise.",
    blocks: [
      {
        title: 'Repères',
        table: table(['Registre', 'Marqueurs'], ['Juridique', 'shall, hereby, the aforementioned, prior written consent'], ['Tabloïd', 'mots courts : blunder, row, slam, shock ; accumulation de noms'], ['Presse de qualité', 'verbes précis, phrases complètes, attribution des sources'], ['Diplomatique', 'frank, constructive, wide-ranging, a full and candid exchange'], ['Excuses officielles', 'we deeply regret, we take full responsibility']),
      },
      {
        title: 'Fausses excuses',
        text: "« We are sorry if anyone felt affected » ou « Mistakes were made » évitent d'assumer : la condition (if) et le passif sans agent déplacent la responsabilité.",
      },
    ],
    pitfalls: [],
    remember: ['Chaque domaine a ses codes.', 'Le passif sans agent peut servir à éviter la responsabilité.'],
  },

  style_c2: {
    intro:
      "La précision stylistique C2 consiste à éliminer ce qui affaiblit le texte : **clichés**, **redondances** (final outcome), **ambiguïtés** (relative mal placée), **only** mal placé, excès de **nominalisation**, variation artificielle des verbes. Chaque option des exercices est commentée pour affiner votre jugement.",
    blocks: [
      {
        title: 'Défauts fréquents',
        table: table(['Défaut', 'Exemple', 'Correction'], ['Cliché', 'at the end of the day', 'ultimately (ou supprimer)'], ['Tautologie', 'unexpected surprise', 'surprise'], ['Ambiguïté', 'the proposal with the residents that…', 'relative après son antécédent'], ['Place de only', 'Only I spoke about the budget.', 'I spoke only about the budget.'], ['Chaîne de noms', 'the implementation of the optimisation of…', 'verbes']),
      },
      {
        title: 'Varier avec justesse',
        text: "Remplacer said par stated, declared, announced n'apporte rien ; insist, argue, concede, promise précisent l'intention.",
      },
    ],
    pitfalls: [],
    remember: ['Précision avant élégance.', 'Chaque mot doit apporter du sens.'],
  },

  writing_c2: {
    intro:
      "Les tâches C2 demandent de **résumer et d'évaluer** des sources, ou de produire une **critique** approfondie. On attend une reformulation fidèle, une évaluation des arguments (pas seulement des conclusions), un style précis et une pensée nuancée. L'outil vérifie automatiquement les éléments formels ; le reste se juge avec la grille et le modèle.",
    blocks: [
      {
        title: 'Résumer et évaluer',
        points: ['Reformulez chaque source avec vos mots (the first writer contends that…).', 'Évaluez la solidité : preuves, présupposés, angles morts (it overlooks…).', 'Distinguez nettement résumé et opinion.', 'Concluez de façon nuancée, éventuellement en dépassant l’opposition.'],
      },
      {
        title: 'Formules utiles',
        examples: [
          ex('The first writer contends that remote work has improved productivity.', 'Le premier auteur soutient que le télétravail a amélioré la productivité.'),
          ex('This argument is persuasive insofar as it reflects experience.', 'Cet argument est convaincant dans la mesure où il reflète l’expérience.'),
          ex('What it overlooks, however, is the cost to junior staff.', 'Ce qu’il néglige cependant, c’est le coût pour les jeunes salariés.'),
        ],
      },
    ],
    pitfalls: [],
    remember: ['Résumer fidèlement, évaluer finement, conclure avec nuance.', 'Le style se met au service de la précision.'],
  },
};
