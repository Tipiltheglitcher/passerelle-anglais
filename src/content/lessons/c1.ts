/** Leçons de l'étape B2 → C1. */
import { ex, pit, table, type Lesson } from './types';

export const C1_LESSONS: Record<string, Lesson> = {
  inversion_negative: {
    intro:
      "Quand une phrase commence par un **adverbe ou une expression négative ou restrictive** (Never, Rarely, Not only, Hardly, No sooner, Only then, Under no circumstances, Little…), l'anglais soutenu **inverse le sujet et l'auxiliaire**, comme dans une question. L'effet est dramatique ou très formel.",
    blocks: [
      {
        title: 'Mécanisme',
        table: table(['Ordre normal', 'Avec inversion'], ['I have never seen such chaos.', 'Never have I seen such chaos.'], ['She not only sings, she also dances.', 'Not only does she sing, she also dances.'], ['We had hardly arrived when it rained.', 'Hardly had we arrived when it rained.'], ['You should not open it under any circumstances.', 'Under no circumstances should you open it.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('No sooner had he sat down than the phone rang.', 'Il venait à peine de s’asseoir que le téléphone a sonné.'),
          ex('Only then did I realise my mistake.', 'Ce n’est qu’alors que j’ai compris mon erreur.'),
          ex('Little did they know what was coming.', 'Ils étaient loin de se douter de ce qui les attendait.'),
          ex('So difficult was the exam that half the class failed.', "L'examen était si difficile que la moitié de la classe a échoué."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          "Avec un verbe lexical au présent ou au prétérit simple, on ajoute do / does / did : Rarely does she complain.",
          'Hardly / Scarcely… when ; No sooner… than : le premier verbe est en général au past perfect.',
          "Not until / Only when / Only after : l'inversion porte sur la proposition principale (Only when I got home did I notice…).",
          "L'inversion est réservée aux registres soutenus (écrit, discours) ; à l'oral courant, on garde l'ordre normal.",
        ],
      },
    ],
    pitfalls: [
      pit('Never I have seen such chaos.', 'Never have I seen such chaos.', 'Après Never en tête : auxiliaire + sujet.'),
      pit('Not only she won, but she also broke the record.', 'Not only did she win, but she also broke the record.', 'Verbe lexical au prétérit : did + sujet + base.'),
      pit('No sooner had we left when it started to rain.', 'No sooner had we left than it started to rain.', 'No sooner… than ; Hardly… when.'),
    ],
    remember: ['Adverbe négatif en tête → auxiliaire + sujet.', 'Hardly… when / No sooner… than + past perfect.'],
  },

  cleft_sentences: {
    intro:
      "Les **phrases clivées** mettent en relief un élément de la phrase, comme « C'est… qui / que » en français. On distingue les clivées en **It** (It was Tom who called) et les **pseudo-clivées** en **What** (What I need is a holiday).",
    blocks: [
      {
        title: 'Deux structures',
        table: table(['Structure', 'Exemple', 'Élément mis en relief'], ['It is / was + X + who / that…', 'It was in 2015 that we met.', 'le complément (in 2015)'], ['What + proposition + is / was + X', 'What I need is a holiday.', 'le complément (a holiday)'], ['All (that) + proposition + is…', 'All I want is some peace.', '« tout ce que »'], ['The thing / reason / place… + is…', 'The reason I called is that…', 'la raison, le lieu…']),
      },
      {
        title: 'Exemples',
        examples: [
          ex("It's not the money that worries me; it's the time.", "Ce n'est pas l'argent qui m'inquiète, c'est le temps."),
          ex('What surprised me was how calm she remained.', "Ce qui m'a surpris, c'est son calme."),
          ex('What he did was call the police.', 'Ce qu’il a fait, c’est appeler la police.', 'mise en relief d’une action'),
          ex('It was only when I got home that I noticed the mistake.', "Ce n'est qu'en rentrant que j'ai remarqué l'erreur."),
        ],
      },
      {
        title: 'À savoir',
        points: ['who pour une personne, that dans tous les cas.', 'Jamais all what : all (that) I want.', 'Pour mettre en relief une action : What + sujet + do / did + is / was + (to) base.'],
      },
    ],
    pitfalls: [
      pit('All what I want is peace.', 'All I want is peace.', 'all (that), jamais all what.'),
      pit('It was in 2015 which we met.', 'It was in 2015 that we met.', 'Clivée en It : that (ou who pour une personne).'),
      pit('That I need is a holiday.', 'What I need is a holiday.', '« Ce dont / ce que » en tête = What.'),
    ],
    remember: ['It was X that… = c’est X qui / que…', 'What… is… = ce qui / ce que…, c’est…'],
  },

  participle_clauses: {
    intro:
      "Les **propositions participiales** remplacent une subordonnée (de temps, de cause, relative…) par un participe : elles rendent le style plus dense et plus soutenu. Leur sujet sous-entendu doit être **le même que celui de la principale**.",
    blocks: [
      {
        title: 'Trois formes',
        table: table(['Forme', 'Sens', 'Exemple'], ['-ing', 'action simultanée ou cause', 'Walking home, I met an old friend.'], ['having + participe passé', 'action antérieure', 'Having finished the report, she left.'], ['participe passé', 'sens passif', 'Built in 1850, the bridge is still in use.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('Not knowing what to say, he remained silent.', 'Ne sachant que dire, il est resté silencieux.'),
          ex('The man sitting next to me was a chef.', "L'homme assis à côté de moi était chef cuisinier.", 'relative réduite'),
          ex('Given the circumstances, we had no choice.', "Vu les circonstances, nous n'avions pas le choix."),
          ex('Having been warned about the traffic, they left early.', 'Prévenus des embouteillages, ils sont partis tôt.'),
        ],
      },
      {
        title: 'Le piège du participe « orphelin »',
        text: "✗ Walking into the room, the lights went out. La phrase dit que les lumières marchaient ! Le sujet de la principale doit faire l’action du participe : ✓ As I walked into the room, the lights went out.",
      },
    ],
    pitfalls: [
      pit('Finished the report, she went home.', 'Having finished the report, she went home.', 'Antériorité active : having + participe passé.'),
      pit('Building in 1850, the bridge is still in use.', 'Built in 1850, the bridge is still in use.', 'Sens passif : participe passé.'),
      pit("Don't knowing what to say, he left.", 'Not knowing what to say, he left.', 'Négation : not + -ing.'),
    ],
    remember: ['-ing : simultané ; having done : antérieur ; done : passif.', 'Même sujet pour la participiale et la principale.'],
  },

  subjunctive_formal: {
    intro:
      "Après les verbes et expressions de **demande, recommandation ou nécessité** (insist, recommend, suggest, demand, it is essential / vital that…), l'anglais soutenu emploie le **subjonctif** : la base verbale, à toutes les personnes (that he **be**, that she **attend**). L'anglais britannique utilise souvent should + base. D'autres tournures formelles relèvent du même registre : **Should you need…**, **were it not for…**.",
    blocks: [
      {
        title: 'Formes',
        table: table(['Contexte', 'Subjonctif', 'Variante britannique'], ['insist / recommend / suggest that', 'that he rest', 'that he should rest'], ['it is essential / vital that', 'that everyone be present', 'that everyone should be present'], ['négation', 'that she not be disturbed', 'that she should not be disturbed'], ['passif', 'that the report be published', 'that the report should be published']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('The doctor insisted that he rest for a week.', "Le médecin a insisté pour qu'il se repose une semaine."),
          ex('It is vital that the data be kept confidential.', 'Il est vital que les données restent confidentielles.'),
          ex('Should you need any further information, please contact us.', "Si vous avez besoin d'informations complémentaires, n'hésitez pas à nous contacter."),
        ],
      },
      {
        title: 'À savoir',
        points: [
          'Pas de -s à la 3ᵉ personne, pas de do pour la négation : that he not be.',
          "Dans un registre courant, les Britanniques emploient parfois l'indicatif (that he rests) ; les exercices de cette notion visent le registre soutenu.",
          'Should you… = If you… ; c’est une formule très fréquente dans les courriers formels.',
        ],
      },
    ],
    pitfalls: [
      pit('It is essential that he is present.', 'It is essential that he be present.', 'Registre soutenu : subjonctif (ou should be).'),
      pit("We recommend that she doesn't travel.", 'We recommend that she not travel.', 'Négation au subjonctif : not + base, sans do.'),
      pit('Should you needed help, call us.', 'Should you need help, call us.', 'Après should : base verbale.'),
    ],
    remember: ['insist / recommend that + base verbale (ou should + base).', 'Should you need… = If you need…'],
  },

  hedging: {
    intro:
      "Au niveau C1, savoir **atténuer** une affirmation est aussi important que savoir l'affirmer. L'écrit académique et professionnel évite les généralisations abusives : on écrit « les données semblent indiquer » plutôt que « les données prouvent ». Ces procédés s'appellent le **hedging**.",
    blocks: [
      {
        title: 'Procédés d’atténuation',
        table: table(['Procédé', 'Exemples'], ['Verbes', 'seem, appear, suggest, indicate, tend to'], ['Modaux', 'may, might, could, may well'], ['Adverbes', 'arguably, possibly, probably, largely, relatively'], ['Expressions', 'to some extent, in some cases, it would appear that'], ['Passif impersonnel', 'It is widely believed that…']),
      },
      {
        title: 'Du catégorique au nuancé',
        examples: [
          ex('This proves that meditation cures anxiety.', 'Cela prouve que la méditation guérit l’anxiété.', 'trop catégorique'),
          ex('These findings suggest that meditation may help to reduce anxiety.', 'Ces résultats suggèrent que la méditation peut aider à réduire l’anxiété.', 'nuancé'),
          ex('There appears to be a problem with your account.', 'Il semble y avoir un problème avec votre compte.', 'poli'),
        ],
      },
      {
        title: 'À savoir',
        points: ["L'atténuation n'est pas de l'hésitation : elle proportionne l'affirmation aux preuves.", 'À l’oral professionnel, elle sert aussi la politesse (There seems to be a slight issue…).', 'Attention à l’excès : maybe… perhaps… possibly dans la même phrase rend le propos flou.'],
      },
    ],
    pitfalls: [
      pit('It is appearing that the data is wrong.', 'It appears that the data is wrong.', 'appear (sembler) est un verbe d’état : pas de forme progressive.'),
      pit('In some extent, I agree.', 'To some extent, I agree.', 'to some extent.'),
      pit('The study proves that everyone benefits.', 'The study suggests that most participants benefited.', 'Généralisation abusive.'),
    ],
    remember: ['suggest, appear, tend to, may well, to some extent.', 'Une affirmation proportionnée aux preuves.'],
  },

  modals_nuance: {
    intro:
      "Au-delà des modaux de base, l'anglais dispose d'expressions qui précisent la **probabilité**, l'**obligation prévue** ou le **conseil** : be bound to, be likely to, may well, might as well, be supposed to, be to, be set to, would do well to.",
    blocks: [
      {
        title: 'Expressions et sens',
        table: table(['Expression', 'Sens', 'Exemple'], ['be bound to', "c'est quasi certain", "They're bound to be late."], ['be (un)likely to', 'probable / improbable', "It's unlikely to rain."], ['may / might well', 'il est fort possible que', 'She may well be right.'], ['might / may as well', 'autant (faute de mieux)', 'We might as well walk.'], ['be supposed to', 'être censé', 'You were supposed to call!'], ['be to', 'programme officiel', 'The President is to visit Japan.'], ['be set to', 'devrait (imminent)', 'Prices are set to rise.'], ['would do well to', 'ferait bien de', 'You would do well to check.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex("With this traffic, we're bound to miss the start.", 'Avec cette circulation, on va forcément rater le début.'),
          ex('The last bus has gone, so we might as well walk.', 'Le dernier bus est parti, alors autant marcher.'),
          ex('You were supposed to be here an hour ago.', 'Tu étais censé être là il y a une heure.'),
        ],
      },
      {
        title: 'Distinctions délicates',
        points: ['might well (probable) ≠ might as well (autant).', 'be supposed to (attendu, souvent non fait) ≠ suppose (supposer).', 'be to est surtout journalistique ou administratif.'],
      },
    ],
    pitfalls: [
      pit('You were suppose to call me.', 'You were supposed to call me.', 'supposed (participe passé).'),
      pit("It's unlikely raining tomorrow.", "It's unlikely to rain tomorrow.", 'be unlikely to + base.'),
      pit('We might well walk, the bus has gone.', 'We might as well walk; the bus has gone.', '« autant » = might as well.'),
    ],
    remember: ['bound to = certain ; likely to = probable.', 'might as well = autant ; might well = fort possible.'],
  },

  emphasis: {
    intro:
      "Pour **insister**, l'anglais dispose de procédés grammaticaux et lexicaux : auxiliaire do d'insistance (I **did** warn you), intensifs (by far, the very, whatsoever, on earth), inversion et phrases clivées.",
    blocks: [
      {
        title: 'Procédés',
        table: table(['Procédé', 'Exemple', 'Français'], ['do / does / did + base', 'I did warn you!', 'Je t’avais bel et bien prévenu !'], ['no… whatsoever', 'No evidence whatsoever.', 'Absolument aucune preuve.'], ['by far + superlatif', 'by far the best', 'de loin le meilleur'], ['the very + nom', 'the very thing I feared', 'précisément ce que je craignais'], ['on earth / ever', 'What on earth…?', 'Mais qu’est-ce que…?'], ['not a single', 'Not a single person came.', 'Pas une seule personne.']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('I do hope you can come.', 'J’espère vraiment que tu pourras venir.'),
          ex('She did look tired, I must admit.', 'Elle avait vraiment l’air fatiguée, je dois l’avouer.'),
          ex("That's the very reason I left.", "C'est précisément pour cette raison que je suis parti."),
        ],
      },
      {
        title: 'À savoir',
        points: ['À l’oral, l’auxiliaire d’insistance est accentué : I DID tell you.', 'Après do / does / did : base verbale, jamais de -s ni de -ed.'],
      },
    ],
    pitfalls: [
      pit('I did warned you!', 'I did warn you!', 'Après did : base verbale.'),
      pit('There was no evidence whatever.', 'There was no evidence whatsoever.', 'Après une négation : whatsoever.'),
      pit('This is very far the best option.', 'This is by far the best option.', 'by far + superlatif.'),
    ],
    remember: ['did + base pour insister sur la réalité d’un fait.', 'no… whatsoever, by far, the very, on earth.'],
  },

  word_formation_c1: {
    intro:
      "La **formation des mots** (préfixes, suffixes, changements de nature) est au cœur du lexique C1 : elle permet de varier son expression et de comprendre des mots nouveaux. Les exercices partent d'un mot racine (RELY) qu'il faut transformer (reliability).",
    blocks: [
      {
        title: 'Suffixes fréquents',
        table: table(['Nature', 'Suffixes', 'Exemples'], ['Noms', '-tion, -ment, -ance / -ence, -ity, -al, -ness', 'refusal, disappointment, disappearance, reliability'], ['Adjectifs', '-able / -ible, -ful, -less, -ive, -ous, -al', 'reliable, careless, conclusive, economic'], ['Adverbes', '-ly, -ally (après -ic)', 'considerably, economically'], ['Verbes', '-ise / -ize, -en, -ify', 'minimise, strengthen, simplify']),
      },
      {
        title: 'Préfixes négatifs',
        table: table(['Préfixe', 'Exemples'], ['un-', 'unacceptable, unconvincing, unlikely'], ['in- / im- / il- / ir-', 'inconclusive, impossible, illegal, irrelevant'], ['dis-', 'disappear, disagree, dishonest'], ['mis-', 'misunderstand, misleading']),
      },
      {
        title: 'Méthode',
        points: ['Identifiez la nature du mot attendu (après un article → nom ; devant un nom → adjectif ; devant un adjectif → adverbe).', 'Vérifiez le sens : faut-il un préfixe négatif ?', 'Attention aux faux amis : significant (pas significative), disappointment (pas deception).'],
      },
    ],
    pitfalls: [
      pit('The results were unconclusive.', 'The results were inconclusive.', 'Le préfixe dépend du mot : inconclusive.'),
      pit('His behaviour was inacceptable.', 'His behaviour was unacceptable.', 'En anglais : unacceptable (≠ français « inacceptable »).'),
      pit('Prices vary considerable.', 'Prices vary considerably.', 'Un verbe est modifié par un adverbe.'),
    ],
    remember: ['Nature du mot d’abord, sens ensuite.', 'Les préfixes anglais ne correspondent pas toujours aux préfixes français.'],
  },

  precision_c1: {
    intro:
      "Au niveau C1, la difficulté n'est plus de trouver **un** mot, mais **le** mot juste : celui qui a le sens exact, la bonne construction et la bonne collocation. Beaucoup de quasi-synonymes se distinguent par leur préposition, leur transitivité ou leur connotation.",
    blocks: [
      {
        title: 'Paires à distinguer',
        table: table(['Mot', 'Construction et sens'], ['rise / raise', 'prices rise (intransitif) / they raise prices (transitif)'], ['remind / remember', 'remind somebody of something / remember something'], ['blame / accuse', 'blame X on Y, blame Y for X / accuse somebody of'], ['impose / enforce', 'impose a tax (instaurer) / enforce a law (faire appliquer)'], ['testimony / testament', 'témoignage / testament, preuve de']),
      },
      {
        title: 'Méthode',
        points: ['Regardez ce qui suit le blanc : préposition, complément, nom.', 'Vérifiez la collocation : on dit impose a ban, raise concerns, draw a conclusion.', 'Méfiez-vous des faux amis : deceive (tromper), sensible (raisonnable), actually (en fait).'],
      },
    ],
    pitfalls: [],
    remember: ['Un mot se choisit avec sa construction.', 'Les collocations ne se traduisent pas mot à mot.'],
  },

  reading_c1: {
    intro:
      "Les textes C1 (essais, tribunes, articles de fond) avancent par **nuances** : concessions, restrictions, reformulations. Il faut suivre le raisonnement, distinguer ce que l'auteur rapporte de ce qu'il pense, et repérer les inférences qu'il laisse au lecteur.",
    blocks: [
      {
        title: 'Signaux à repérer',
        table: table(['Signal', 'Fonction'], ['It would be a mistake to…', 'nuance / réfutation'], ['in other words, that is to say', 'reformulation'], ['Yet, however, nevertheless', 'opposition'], ['somewhat, largely, arguably', 'modalisation'], ['The question, then, is…', 'recentrage du débat']),
      },
      {
        title: 'Stratégies',
        points: [
          'Résumez chaque paragraphe en une phrase avant de répondre.',
          "Pour la position de l'auteur, cherchez sa conclusion et les adjectifs évaluatifs.",
          "Une inférence doit être justifiée par le texte : si vous ne trouvez pas l'indice, l'option est probablement fausse.",
        ],
      },
    ],
    pitfalls: [],
    remember: ['Distinguez les idées rapportées de la position de l’auteur.', 'Suivez les nuances : however, it would be a mistake, in other words.'],
  },

  argument_c1: {
    intro:
      "Les argumentations C1 combinent **concession et réfutation** (« Tout cela est vrai. Il ne s'ensuit pas pour autant que… »), recourent à des **présupposés** implicites et peuvent cacher des **sophismes**. L'objectif est d'évaluer la solidité du raisonnement, pas seulement d'en comprendre le contenu.",
    blocks: [
      {
        title: 'Schéma concession-réfutation',
        examples: [
          ex('All of this is true. It does not follow, however, that we would be better off without them.', 'Tout cela est vrai. Il ne s’ensuit pas pour autant que nous serions mieux sans eux.'),
          ex('Supporters of the tax are, of course, well-intentioned. But the policy would hit the poorest hardest.', 'Les partisans de la taxe sont bien sûr bien intentionnés. Mais cette mesure frapperait surtout les plus pauvres.'),
        ],
      },
      {
        title: 'Sophismes courants',
        table: table(['Sophisme', 'Exemple'], ['Fausse alternative', 'Either we tax sugar, or we accept rising obesity.'], ['Généralisation hâtive', 'It worked in one town, so it will work everywhere.'], ['Corrélation ≠ causalité', 'Anxiety rose when smartphones spread, so smartphones cause anxiety.'], ['Attaque personnelle', 'He is not a serious researcher.']),
      },
      {
        title: 'Organiser un texte',
        text: 'Les reprises anaphoriques (This trend, Such experiments, This objection) renvoient à la phrase précédente : elles indiquent l’ordre des idées.',
      },
    ],
    pitfalls: [],
    remember: ['Concession ≠ adhésion : elle prépare la réfutation.', 'Un présupposé est ce que la conclusion tient pour acquis.'],
  },

  style_c1: {
    intro:
      "À ce niveau, une phrase correcte peut encore être **améliorée** : plus concise, plus cohérente, mieux adaptée au registre. Les exercices de correction stylistique vous demandent de choisir la meilleure version, et chaque option est commentée.",
    blocks: [
      {
        title: 'Principes',
        table: table(['Défaut', 'Correction'], ['Périphrase (due to the fact that)', 'because'], ['Répétition', 'synonyme, pronom, relative'], ['Registre mélangé (loads of, kids)', 'numerous, children'], ['Affirmation excessive (proves, always)', 'suggests, tends to'], ['Participe orphelin', 'sujet explicite'], ['Parallélisme rompu', 'formes identiques coordonnées']),
      },
      {
        title: 'Exemples',
        examples: [
          ex('Because the budget was cut, we could not hire new staff.', 'Le budget ayant été réduit, nous n’avons pas pu recruter.', 'concis'),
          ex('The samples were collected, analysed and compared with the control group.', 'Les échantillons ont été prélevés, analysés et comparés au groupe témoin.', 'passif, parallélisme'),
        ],
      },
    ],
    pitfalls: [],
    remember: ['Concision, cohésion, registre homogène.', 'Une conclusion proportionnée aux preuves.'],
  },

  implicature_c1: {
    intro:
      "L'**implicite** désigne ce que l'on comprend sans que ce soit dit. Les anglophones, et particulièrement les Britanniques, recourent volontiers à l'**understatement** (litote), aux réponses indirectes et à l'esquive polie. Comprendre l'intention réelle est indispensable au niveau C1.",
    blocks: [
      {
        title: 'Procédés et sens probable',
        table: table(['Énoncé', 'Sens probable'], ["Thursday's agenda is rather full.", 'Je préfère ne pas en parler jeudi.'], ["It's certainly… ambitious.", "J'ai de sérieux doutes."], ["I've got an early start tomorrow.", 'Je ne viendrai pas (ou pas longtemps).'], ['As per my previous email…', 'Je vous l’avais déjà dit.'], ['With respect…', 'Je ne suis pas d’accord.']),
      },
      {
        title: 'Méthode',
        points: ['Comparez la question posée et la réponse donnée : si la réponse porte sur autre chose, il y a un sous-entendu.', 'Repérez les atténuateurs (rather, a bit, slightly) et les silences : ce qui n’est pas loué est souvent critiqué.', 'Tenez compte de la relation entre les locuteurs et de la situation.'],
      },
    ],
    pitfalls: [],
    remember: ['Ce qui n’est pas dit compte autant que ce qui est dit.', 'Litote et réponse indirecte = refus ou critique polie.'],
  },

  writing_c1: {
    intro:
      "Les productions C1 (essai argumentatif, proposition, lettre au rédacteur) exigent une **pensée nuancée**, une **structure claire** et un **registre maîtrisé**, avec des structures variées. L'outil vérifie automatiquement la longueur, certains éléments imposés et des erreurs certaines ; la qualité d'ensemble se juge avec la grille et le modèle.",
    blocks: [
      {
        title: "Plan d'un essai argumentatif",
        points: ['Introduction : contexte et problématique.', 'Développement : examen équitable des deux positions.', 'Prise de position nuancée (to some extent, arguably).', 'Conclusion : réponse claire, éventuellement ouverture.'],
      },
      {
        title: 'Varier les structures',
        examples: [
          ex('Not only does technology distract us, but it also shapes the way we think.', 'Non seulement la technologie nous distrait, mais en plus elle façonne notre manière de penser.', 'inversion'),
          ex('What is less often acknowledged is that these fears are not new.', 'Ce que l’on souligne moins souvent, c’est que ces craintes ne sont pas nouvelles.', 'pseudo-clivée'),
          ex('Having considered both sides, I would argue that regulation is necessary.', 'Après avoir examiné les deux points de vue, je dirais qu’une réglementation est nécessaire.', 'participiale'),
        ],
      },
    ],
    pitfalls: [],
    remember: ['Nuancer sans être flou.', 'Varier les structures au service de la clarté.'],
  },
};
