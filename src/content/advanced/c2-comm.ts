/**
 * Contenus C1 → C2 : lecture critique, satire, argumentations fallacieuses,
 * ironie et understatement, connotation, précision stylistique, registres
 * fins, synthèse écrite. Tous les textes sont originaux.
 */
import type { InsightItem, OrderItem, PassageItem, WritingPrompt } from '@/engine/exercises/advanced';

export const READING_C2: PassageItem[] = [
  {
    id: 'rc2_algorithm',
    lv: 'C2',
    title: 'The myth of the neutral algorithm',
    genre: 'Essai critique',
    text: [
      'There is a peculiar comfort in being judged by a machine. A human interviewer may be tired, prejudiced or simply in a bad mood; an algorithm, we are told, has no such failings. It weighs the evidence, applies the rules and reaches its verdict without fear or favour. This, at least, is the story that has accompanied the spread of automated decision-making into hiring, lending and policing.',
      'The story is not entirely false, which is precisely what makes it so persuasive. Algorithms are, in a narrow sense, consistent: given the same inputs, they will produce the same outputs. But consistency is not the same as fairness. A system trained on decades of hiring decisions will faithfully reproduce whatever preferences those decisions contained, and it will do so with a confidence that no human recruiter would dare to display. Bias, once laundered through a model, re-emerges as objectivity.',
      'Defenders of such systems often reply that the alternative, human judgement, is demonstrably worse. They have a point. Studies of human decision-makers make for uncomfortable reading, and it would be naive to romanticise the discretion of the individual official. Yet the comparison is less straightforward than it appears. A biased manager can be challenged, questioned, even dismissed; a biased model is frequently opaque to the very people it affects, and sometimes to those who deploy it.',
      'Nor is opacity merely a technical problem awaiting a technical fix. Decisions about which data to collect, which outcomes to optimise and which errors to tolerate are not mathematical but political. To present them as the neutral output of a calculation is to remove them from the domain of public argument, where, arguably, they belong.',
      'None of this implies that algorithms have no place in public life. It implies, rather, that their use should be justified case by case, subject to scrutiny and open to appeal, and that the burden of proof should rest with those who claim that a machine can be trusted, not with those who doubt it.',
    ].join('\n\n'),
    qs: [
      { q: "What does the writer mean by 'Bias, once laundered through a model, re-emerges as objectivity'?", f: 'inference', a: 'Prejudice hidden in data can appear neutral once processed by an algorithm.', w: ['Algorithms remove all bias from data.', 'Models are regularly cleaned to eliminate errors.', 'Objective decisions are always biased.'], why: 'Métaphore du blanchiment : le biais devient invisible et passe pour objectif.' },
      { q: "Why does the writer say the story is 'not entirely false'?", f: 'structure', a: 'To concede a genuine strength before showing its limits', w: ['To show complete agreement with defenders of algorithms', 'To admit that the essay contains errors', 'To prove that consistency guarantees fairness'], why: 'Concession (« not entirely false ») suivie de la réfutation (« But consistency is not the same as fairness »).' },
      { q: 'According to paragraph 3, what is the key difference between a biased manager and a biased model?', f: 'detail', a: 'The manager can be held to account more easily.', w: ['The model makes fewer errors.', 'The manager is always more biased.', 'The model is cheaper to replace.'], why: '« can be challenged, questioned, even dismissed ; a biased model is frequently opaque ».' },
      { q: "In paragraph 4, the writer argues that decisions about data and outcomes are…", f: 'claim', a: 'political choices that should be open to public debate', w: ['technical details best left to engineers', 'impossible to make without algorithms', 'irrelevant to questions of fairness'], why: '« not mathematical but political… the domain of public argument, where… they belong ».' },
      { q: "Where, according to the conclusion, should 'the burden of proof' lie?", f: 'attitude', a: 'With those who claim that an algorithm is trustworthy', w: ['With those who criticise algorithms', 'With the people affected by decisions', 'With independent scientists only'], why: 'Renversement de la charge de la preuve : à ceux qui affirment la fiabilité de la machine.' },
      { q: "Which word best describes the writer's stance?", f: 'tone', a: 'Sceptical but not dismissive', w: ['Enthusiastic', 'Openly hostile to all technology', 'Indifferent'], why: '« None of this implies that algorithms have no place… » : critique nuancée.' },
    ],
    why: 'Essai critique C2 : métaphores argumentatives, concession-réfutation, déplacement du débat (technique → politique), renversement de la charge de la preuve.',
  },
  {
    id: 'rc2_dinner',
    lv: 'C2',
    title: 'How to host the perfect dinner party',
    genre: 'Chronique satirique',
    text: [
      'First, invite twelve people to a flat designed for four. Intimacy is the soul of hospitality, and nothing says intimacy like a guest perched on the arm of the sofa, balancing a plate of risotto on one knee.',
      'Next, choose a menu that will allow you to spend the entire evening in the kitchen. Your guests did not come to see you; they came to see your oven, and they will be delighted to glimpse you, flushed and apologetic, every forty minutes or so.',
      'Seat your guests strategically. Place the vegetarian next to the man who has just returned from a hunting trip, and your oldest friend beside the colleague she once accused, in writing, of stealing her parking space. Tension, as any novelist will tell you, is the engine of a good story.',
      'Conversation should be lively but never controversial. Politics, religion, money, work, family, health and the weather are best avoided, which leaves, broadly speaking, the risotto. Do not worry: it will be discussed at length, particularly by the guest who is allergic to it.',
      'At around eleven, announce that you have made dessert. This will be received with the polite enthusiasm usually reserved for a colleague\'s holiday photographs. Serve it anyway. You have, after all, been up since six.',
      'Finally, when the last guest has left, stand among the wreckage and tell your partner that it went rather well. It is important to believe this. You will, in a month or so, be doing it all again.',
    ].join('\n\n'),
    qs: [
      { q: 'What is the real purpose of the text?', f: 'gist', a: 'To mock the stress and absurdity of formal dinner parties', w: ['To give sincere advice on hosting a dinner', 'To criticise people with food allergies', 'To recommend risotto as the ideal dish'], why: 'Chaque « conseil » est absurde : le registre est satirique.' },
      { q: "'Intimacy is the soul of hospitality' is…", f: 'tone', a: 'ironic, since the flat is clearly overcrowded', w: ['a sincere philosophical statement', 'a quotation from a famous chef', 'a criticism of small flats'], why: 'L’éloge de l’intimité justifie ironiquement un appartement bondé.' },
      { q: "Why does the writer say that the forbidden topics leave 'broadly speaking, the risotto'?", f: 'inference', a: 'To show that the rules make real conversation impossible', w: ['Because risotto is the most interesting topic', 'Because the guests only want to talk about food', 'Because the host is a professional cook'], why: 'Exagération : tous les sujets sont interdits, sauf le plat.' },
      { q: "The 'polite enthusiasm usually reserved for a colleague's holiday photographs' suggests that the guests…", f: 'inference', a: 'are not really excited about dessert', w: ['are delighted by the dessert', 'want to see the host’s photographs', 'are about to leave immediately'], why: 'Comparaison ironique : l’enthousiasme n’est que de façade.' },
      { q: "What does 'It is important to believe this' imply?", f: 'tone', a: 'The evening probably did not go well.', w: ['The evening was a great success.', 'The partner disagrees about the food.', 'The host will never organise another dinner.'], why: 'Il faut s’en persuader, précisément parce que ce n’est pas vrai ; et la dernière phrase annonce une récidive.' },
    ],
    why: "Satire : l'écart entre la forme (conseils sérieux) et le contenu (situations absurdes) produit l'ironie. Le sens réel est l'inverse du sens littéral.",
  },
  {
    id: 'rc2_nostalgia',
    lv: 'C2',
    title: 'The politics of nostalgia',
    genre: 'Essai',
    text: [
      'Nostalgia was once classified as a disease. Seventeenth-century physicians described it as an affliction of soldiers far from home, whose longing for their native valleys was thought capable of killing them. Today we treat it more indulgently, as a harmless, even pleasurable, sentiment: the warm glow of an old song or the smell of a childhood kitchen.',
      'Yet nostalgia has never been entirely private. Political movements of every stripe have discovered that few appeals are as potent as the promise to restore a lost golden age. The past offers a curious advantage over the future: it can be described in vivid detail without ever having to be delivered. Its inconveniences have conveniently faded, its injustices were suffered by other people, and its certainties seem all the more solid for being unrecoverable.',
      'Historians are, almost by profession, the natural enemies of such longing. Their task is to restore to the past the complexity that memory removes, to remind us that the era we mourn was experienced by its contemporaries as anxious, uncertain and frequently miserable. Few people in any period have believed that they were living in a golden age.',
      'To dismiss nostalgia altogether, however, would be to misunderstand it. The yearning for a vanished world is often a disguised judgement on the present: a sense that something of value, whether community, stability or a shared sense of purpose, has been lost. The appropriate response is not to mock the feeling but to ask what it is really about, and whether what it mourns could be built anew rather than merely remembered.',
    ].join('\n\n'),
    qs: [
      { q: "According to paragraph 2, why is the past politically 'advantageous'?", f: 'inference', a: 'It can be idealised without anyone being able to test the promise.', w: ['It is easier to describe than the present.', 'Historians always agree about it.', 'Voters know more about the past than the future.'], why: '« described in vivid detail without ever having to be delivered ».' },
      { q: "'its injustices were suffered by other people' implies that…", f: 'inference', a: 'those who idealise the past often were not its victims', w: ['injustice did not exist in the past', 'historians exaggerate past injustices', 'everyone suffered equally in the past'], why: 'La nostalgie oublie ceux pour qui « l’âge d’or » ne l’était pas.' },
      { q: 'What role does the writer assign to historians?', f: 'detail', a: 'Restoring the complexity that memory erases', w: ['Encouraging national pride', 'Predicting future political trends', 'Collecting nostalgic objects'], why: '« restore to the past the complexity that memory removes ».' },
      { q: 'What is the function of the final paragraph?', f: 'structure', a: 'To nuance the critique by interpreting nostalgia as a judgement on the present', w: ['To reject nostalgia completely', 'To return to the medical history of nostalgia', 'To praise political movements'], why: '« To dismiss nostalgia altogether, however, would be to misunderstand it. »' },
      { q: "'Political movements of every stripe' means…", f: 'vocab', a: 'movements of all political tendencies', w: ['extremist movements only', 'movements with many members', 'movements that wear uniforms'], why: 'of every stripe = de toutes tendances.' },
    ],
    why: "Essai C2 : relativiser un sentiment commun, mobiliser l'histoire, puis nuancer la critique pour proposer une lecture plus fine.",
  },
];

export const ARGUMENT_C2: PassageItem[] = [
  {
    id: 'ac2_phones',
    lv: 'C2',
    title: 'Ban phones in schools, and then what?',
    genre: 'Tribune',
    text: [
      'The proposal to ban mobile phones in schools is presented as a modest, common-sense measure. It is nothing of the kind. Once we accept that the state may confiscate a device simply because it is distracting, there is no obvious place to stop. Books can be distracting. So can friends. Before long, we will be regulating every aspect of children\'s lives in the name of concentration.',
      'Moreover, the ban\'s most vocal supporters are, for the most part, people who grew up without smartphones and cannot imagine learning with one. Their judgement is hardly impartial.',
      'Finally, consider the evidence. One survey found that pupils at schools with bans scored slightly higher in exams. But schools that impose bans may differ in many other ways, from funding to discipline, and the survey made no attempt to account for them.',
    ].join('\n\n'),
    qs: [
      { q: 'Which flaw does the first paragraph contain?', f: 'flaw', a: 'A slippery-slope argument: one measure is assumed to lead inevitably to extreme ones.', w: ['A confusion between correlation and causation', 'An appeal to tradition', 'A contradiction with the conclusion'], why: 'Pente glissante : d’une interdiction ciblée à la régulation de « tous les aspects » de la vie.' },
      { q: 'What is wrong with the second paragraph?', f: 'flaw', a: 'It attacks the supporters rather than their arguments.', w: ['It relies on outdated statistics.', 'It generalises from a single school.', 'It contradicts the first paragraph.'], why: 'Argument ad hominem : l’âge des partisans ne dit rien de la validité de leur position.' },
      { q: 'How does the writer treat the survey in paragraph 3?', f: 'evidence', a: 'He points out a genuine methodological weakness.', w: ['He accepts it as conclusive proof.', 'He invents data to contradict it.', 'He ignores its results entirely.'], why: 'Facteurs de confusion non contrôlés : critique légitime.' },
      { q: 'Overall, how strong is the argument against the ban?', f: 'attitude', a: 'Uneven: one valid point is weakened by two fallacies.', w: ['Very strong: every point is well supported.', 'Completely worthless: every point is a fallacy.', 'Neutral: the writer has no position.'], why: 'Un argument valide (§3) et deux sophismes (§1, §2).' },
      { q: "'It is nothing of the kind' is used to…", f: 'tone', a: 'reject forcefully the way the proposal is presented', w: ['agree with the proposal', 'introduce a statistic', 'apologise to the reader'], why: 'Rejet catégorique de la présentation « modeste » de la mesure.' },
    ],
    why: 'Évaluer une argumentation, c’est trier : un sophisme (pente glissante, ad hominem) n’annule pas un argument valide (facteur de confusion).',
  },
  {
    id: 'ac2_tradition',
    lv: 'C2',
    title: 'Why the five-day week should stay',
    genre: 'Éditorial',
    text: [
      'The five-day working week has served us well for nearly a century. Our grandparents worked it, our parents worked it, and the economy has grown enormously in that time. Why tamper with a system that has stood the test of time?',
      'Leading business figures, including the chief executive of one of the country\'s largest retailers, have dismissed the four-day week as a fad. When people who have built successful companies speak, we should listen.',
      'Either we keep the five-day week or we accept a collapse in productivity. There is no sensible middle ground.',
    ].join('\n\n'),
    qs: [
      { q: 'What type of reasoning does the first paragraph rely on?', f: 'flaw', a: 'An appeal to tradition: something is good because it has always been done', w: ['A statistical comparison between countries', 'An argument based on scientific evidence', 'An analogy with another industry'], why: 'La durée d’une pratique ne prouve pas qu’elle soit la meilleure.' },
      { q: "Why is the economic growth mentioned in paragraph 1 weak evidence?", f: 'assumption', a: 'Growth may have had many causes unrelated to the five-day week.', w: ['The economy has not grown.', 'Grandparents did not work five days.', 'Growth is always caused by working hours.'], why: 'Présupposé non justifié : lien causal entre semaine de cinq jours et croissance.' },
      { q: 'What is problematic about paragraph 2?', f: 'flaw', a: 'It relies on the status of the speakers rather than evidence.', w: ['It quotes too many experts.', 'It contradicts paragraph 1.', 'It uses technical vocabulary.'], why: 'Argument d’autorité : un dirigeant d’entreprise n’est pas une preuve.' },
      { q: 'Which fallacy appears in the final paragraph?', f: 'flaw', a: 'A false dilemma', w: ['A slippery slope', 'Circular reasoning', 'A personal attack'], why: 'Deux options seulement sont présentées, alors que d’autres existent.' },
      { q: "'Why tamper with a system that has stood the test of time?' is…", f: 'tone', a: 'a rhetorical question that assumes its own answer', w: ['a genuine request for information', 'an expression of doubt about tradition', 'a joke'], why: 'Question rhétorique : elle n’attend pas de réponse et suggère qu’il ne faut rien changer.' },
    ],
    why: 'Appel à la tradition, argument d’autorité, faux dilemme, question rhétorique : un texte court peut accumuler les sophismes.',
  },
];

export const TEXT_ORDER_C2: OrderItem[] = [
  {
    id: 'toc2_review',
    lv: 'C2',
    title: 'Review: a new biography',
    segs: [
      ['Biographies of famous scientists tend to fall into one of two traps: hagiography or debunking.', 'Généralisation d’ouverture'],
      ['This new life of Marie Curie admirably avoids both.', 'Thèse du critique (This… avoids both)'],
      ['Its author neither inflates Curie into a saint nor diminishes her achievements in the name of balance.', 'Développement (neither… nor reprend les deux pièges)'],
      ['If the book has a flaw, it lies in its final chapters, where the narrative loses momentum.', 'Réserve (If the book has a flaw)'],
      ['This is, however, a minor complaint about an otherwise exemplary work.', 'Conclusion (minor complaint… otherwise)'],
    ],
    why: 'Chaque phrase reprend la précédente : both → neither… nor ; flaw → minor complaint.',
  },
  {
    id: 'toc2_abstract',
    lv: 'C2',
    title: 'Research abstract',
    segs: [
      ['Previous research has largely overlooked the role of informal networks in the integration of migrants.', 'Lacune de la recherche'],
      ['This study addresses that gap by examining the experiences of 120 recent arrivals in three cities.', 'Objectif et méthode (addresses that gap)'],
      ['Semi-structured interviews were conducted over a period of eighteen months.', 'Méthode détaillée'],
      ['The findings suggest that informal support was more decisive than official programmes in securing employment.', 'Résultats (findings suggest)'],
      ['These results have significant implications for the design of integration policy.', 'Portée (implications)'],
    ],
    why: 'Résumé scientifique : lacune, objectif, méthode, résultats, implications.',
  },
];

export const STYLE_C2: InsightItem[] = [
  {
    id: 'stc2_cliche',
    lv: 'C2',
    sit: 'Critique littéraire. Phrase d’origine :',
    passage: 'At the end of the day, this novel is a real page-turner that ticks all the boxes.',
    q: 'Quelle version évite les clichés tout en restant précise ?',
    o: [
      ['The novel sustains its tension to the last page, and its ambitions are fully realised.', 'Précise et sans formules toutes faites.'],
      ['At the end of the day, this is a novel that really ticks every box.', 'Accumule toujours les clichés.'],
      ['This novel is very good and I liked it a lot.', 'Plat et vague.'],
      ['When all is said and done, this book is unputdownable.', 'Remplace un cliché par un autre.'],
    ],
    why: 'À l’écrit soutenu, les formules toutes faites (at the end of the day, tick all the boxes) affaiblissent le propos.',
  },
  {
    id: 'stc2_nominal',
    lv: 'C2',
    sit: 'Note administrative. Phrase d’origine :',
    passage: 'The implementation of the optimisation of the allocation of resources is under consideration.',
    q: 'Quelle version est la plus lisible ?',
    o: [
      ['We are considering how to allocate resources more efficiently.', 'Verbes à la place d’une chaîne de noms : plus clair et plus direct.'],
      ['The optimisation of resource allocation implementation is being considered.', 'Toujours une chaîne de noms, encore plus opaque.'],
      ['Resources are being considered for optimising allocation implementation.', 'Sens modifié et confus.'],
      ['Consideration is being given to the implementation of optimisation.', 'Abstrait : on ne sait plus de quoi il s’agit.'],
    ],
    why: 'La nominalisation densifie l’écrit, mais son excès le rend illisible : savoir revenir aux verbes est une marque de maîtrise.',
  },
  {
    id: 'stc2_ambiguity',
    lv: 'C2',
    sit: 'Phrase d’origine :',
    passage: 'The committee discussed the proposal with the residents that was submitted last week.',
    q: 'Quelle version lève l’ambiguïté ?',
    o: [
      ['The committee discussed with the residents the proposal that had been submitted the previous week.', 'La relative suit directement son antécédent (the proposal).'],
      ['The committee discussed the proposal with the residents, that was submitted last week.', 'Virgule fautive ; ambiguïté inchangée.'],
      ['The residents that were submitted last week discussed the proposal.', 'Contresens.'],
      ['The committee discussed it with the residents last week.', 'Sens modifié : la date porte sur la discussion.'],
    ],
    why: 'Une relative doit suivre son antécédent ; sinon, la phrase devient ambiguë ou absurde.',
  },
  {
    id: 'stc2_tautology',
    lv: 'C2',
    sit: 'Rapport. Phrase d’origine :',
    passage: 'In my personal opinion, the final outcome was an unexpected surprise for the general public.',
    q: 'Quelle version supprime les redondances ?',
    o: [
      ['In my view, the outcome surprised the public.', 'Supprime personal (opinion), final (outcome), unexpected (surprise), general.'],
      ['In my personal view, the outcome was a surprise for the public in general.', 'Garde des redondances.'],
      ['Personally, in my opinion, the result was surprising.', 'Double redondance (personally / in my opinion).'],
      ['The final result was an unexpected surprise.', 'Redondances maintenues.'],
    ],
    why: 'Tautologies courantes : personal opinion, final outcome, unexpected surprise, past history, future plans.',
  },
  {
    id: 'stc2_variation',
    lv: 'C2',
    sit: 'Article. Deux phrases :',
    passage: 'The minister said the plan would work. She also said that critics had misunderstood it, and said that further details would follow.',
    q: 'Quelle version varie le plus justement les verbes introducteurs ?',
    o: [
      ['The minister insisted that the plan would work, argued that critics had misunderstood it, and promised further details.', 'Verbes précis qui traduisent l’intention (insist, argue, promise).'],
      ['The minister said, said again and said that the plan would work.', 'Répétition aggravée.'],
      ['The minister whispered that the plan would work and shouted that critics misunderstood it.', 'Verbes inadaptés au contexte.'],
      ['The minister stated, declared and announced that the plan would work.', 'Variation artificielle, sans gain de sens.'],
    ],
    why: 'Varier, oui, mais avec des verbes qui précisent le sens (insist, argue, concede, promise).',
  },
  {
    id: 'stc2_modifier',
    lv: 'C2',
    sit: 'Phrase d’origine :',
    passage: 'Only I spoke to the director about the budget.',
    q: 'Le rédacteur voulait dire qu’il n’avait parlé que du budget. Quelle version est juste ?',
    o: [
      ['I spoke to the director only about the budget.', 'only placé devant ce qu’il restreint (about the budget).'],
      ['I only spoke to the director about the budget only.', 'Double only, redondant.'],
      ['I spoke only to the director about the budget.', 'Sens : au directeur et à personne d’autre.'],
      ['Only I spoke to the director about the budget.', 'Sens : moi et personne d’autre.'],
    ],
    why: 'La place de only change le sens : il porte sur l’élément qui le suit.',
  },
];

export const REGISTER_C2: InsightItem[] = [
  {
    id: 'rgc2_apology',
    lv: 'C2',
    sit: 'Une grande entreprise publie des excuses officielles après une fuite de données.',
    q: 'Quelle formulation est la plus appropriée (et la plus crédible) ?',
    o: [
      ['We deeply regret this breach and the concern it has caused. We take full responsibility and have taken the following steps.', 'Regret, responsabilité assumée, mesures concrètes : excuses crédibles.'],
      ['We are sorry if anyone felt affected by any issues that may have occurred.', 'Fausses excuses : conditionnelles et vagues (if anyone felt).'],
      ['Mistakes were made.', 'Passif qui évite d’assumer la responsabilité.'],
      ['Oops! Our bad, guys. We’re on it!', 'Registre totalement inadapté.'],
    ],
    why: 'Les « non-excuses » (sorry if…, mistakes were made) sont repérées et critiquées : le registre officiel exige d’assumer.',
  },
  {
    id: 'rgc2_headline',
    lv: 'C2',
    sit: 'Quel titre correspond au style d’un tabloïd britannique ?',
    q: 'Choisissez le titre le plus typique de la presse populaire.',
    o: [
      ['MINISTER IN BUDGET BLUNDER SHOCK', 'Mots courts, accumulation de noms, sensationnalisme : style tabloïd.'],
      ['Minister acknowledges error in budget calculations', 'Style de quotidien de qualité.'],
      ['An analysis of recent budgetary miscalculations', 'Style académique.'],
      ['The minister made a mistake in the budget, sources say', 'Style neutre, oral.'],
    ],
    why: 'Les tabloïds compriment le sens (blunder, shock, row, slam) ; la presse de qualité privilégie des verbes précis et une syntaxe complète.',
  },
  {
    id: 'rgc2_legal',
    lv: 'C2',
    sit: 'Clause d’un contrat de location.',
    q: 'Quelle formulation relève du registre juridique ?',
    o: [
      ['The tenant shall not sublet the premises without the prior written consent of the landlord.', 'shall (obligation juridique), premises, prior written consent : style contractuel.'],
      ['You can’t rent the flat to someone else unless we say so.', 'Registre courant.'],
      ['Subletting is kind of not allowed, basically.', 'Familier et flou.'],
      ['The tenant must not maybe sublet without asking first.', 'Incohérent (must not maybe).'],
    ],
    why: 'Le registre juridique emploie shall, des termes techniques (premises, consent) et évite toute ambiguïté.',
  },
  {
    id: 'rgc2_understatement',
    lv: 'C2',
    sit: 'Un Britannique décrit un orage violent qui a arraché le toit de sa grange.',
    q: 'Quelle phrase est un understatement typiquement britannique ?',
    o: [
      ['It was a bit breezy last night.', 'Minimisation extrême et volontaire : effet humoristique.'],
      ['It was the most terrifying storm of my life.', 'Description directe, sans understatement.'],
      ['The storm destroyed the roof.', 'Constat neutre.'],
      ['Storms are common in winter.', 'Généralité hors sujet.'],
    ],
    why: "L'understatement britannique minimise volontairement une situation grave, souvent avec humour.",
  },
  {
    id: 'rgc2_diplomatic',
    lv: 'C2',
    sit: 'Communiqué diplomatique après une rencontre tendue entre deux ministres.',
    q: 'Quelle formule signale, en langage diplomatique, un désaccord profond ?',
    o: [
      ['The talks were frank and wide-ranging.', 'Code diplomatique : « franc » signifie que les positions se sont affrontées.'],
      ['The talks were warm and productive.', 'Signale une rencontre réussie.'],
      ['The ministers had a lovely chat.', 'Registre familier, inadapté.'],
      ['The talks were held on Tuesday.', 'Information neutre.'],
    ],
    why: 'En diplomatie, frank et wide-ranging sont des euphémismes conventionnels pour un désaccord.',
  },
];

export const IRONY_C2: InsightItem[] = [
  {
    id: 'irc2_notbad',
    lv: 'C2',
    lines: [['Colleague', 'So how was the new restaurant?'], ['Oliver', 'Not bad at all. I might even go back.']],
    sit: 'Oliver est connu pour ses goûts difficiles.',
    q: "Que veut dire Oliver ?",
    o: [
      ['He liked it a lot.', 'Litote britannique : « not bad at all » + « might even » = très bon.'],
      ['He found it mediocre.', 'Ce serait plutôt « It was fine », dit sans enthousiasme.'],
      ['He will never go back.', 'Il dit le contraire.'],
      ['He did not go there.', 'Il en parle comme d’une expérience vécue.'],
    ],
    why: 'Chez un locuteur exigeant, la litote vaut un compliment appuyé.',
  },
  {
    id: 'irc2_hear',
    lv: 'C2',
    lines: [['Consultant', 'I think we should cut the marketing budget by half.'], ['Director', 'I hear what you say.']],
    q: 'Que signifie probablement la réponse de la directrice ?',
    o: [
      ['She disagrees and does not intend to follow the advice.', "« I hear what you say » marque souvent un désaccord poli (je vous ai entendu, mais…)."],
      ['She fully agrees.', 'Elle aurait dit « I agree » ou « Good idea ».'],
      ['She did not hear the consultant.', 'Interprétation littérale erronée.'],
      ['She wants him to repeat.', 'Rien ne l’indique.'],
    ],
    why: 'Formule britannique classique : polie en surface, elle signale un refus.',
  },
  {
    id: 'irc2_rain',
    lv: 'C2',
    passage: '"Lovely weather for a picnic," said Emma, as the rain hammered on the windscreen.',
    q: "Quel est l'effet de la remarque d'Emma ?",
    o: [
      ['Irony: she means the opposite of what she says.', 'L’écart entre les mots et la situation produit l’ironie.'],
      ['Sincere optimism about the weather.', 'Contredit par la pluie battante.'],
      ['A suggestion to have a picnic in the car.', 'Lecture littérale.'],
      ['A complaint addressed to the driver.', 'Rien ne vise le conducteur.'],
    ],
    why: "Ironie verbale : dire l'inverse de ce que l'on pense, rendu évident par le contexte.",
  },
  {
    id: 'irc2_quite',
    lv: 'C2',
    lines: [['Author', 'Did you read my draft?'], ['Editor', 'I did. It’s quite good, actually. Quite good.']],
    q: 'Comment interpréter « quite good », répété par l’éditrice ?',
    o: [
      ['As a reserved, rather lukewarm judgement', 'En anglais britannique, quite good (sans accent d’enthousiasme) signifie souvent « correct, sans plus ».'],
      ['As enthusiastic praise', 'Le ton et la répétition hésitante suggèrent plutôt la réserve.'],
      ['As a refusal to publish', 'Trop fort : ce n’est pas un refus.'],
      ['As a criticism of the author’s spelling', 'Rien ne l’indique.'],
    ],
    why: 'quite good = assez bien (réservé) ; quite brilliant = vraiment brillant. Le sens de quite dépend de l’adjectif et de l’intonation.',
  },
  {
    id: 'irc2_rhetorical',
    lv: 'C2',
    lines: [['Manager', 'The report was due on Monday.'], ['Employee', 'I know, I know.'], ['Manager', 'And today is…?']],
    q: 'Que fait la responsable avec sa dernière réplique ?',
    o: [
      ['She makes a pointed reproach without stating it.', 'Question rhétorique : elle souligne le retard sans le dire.'],
      ['She has forgotten what day it is.', 'Lecture littérale.'],
      ['She is changing the subject.', 'Elle insiste au contraire sur le même sujet.'],
      ['She is giving the employee more time.', 'Rien ne l’indique.'],
    ],
    why: 'La question rhétorique oblige l’interlocuteur à formuler lui-même le reproche.',
  },
  {
    id: 'irc2_with_respect',
    lv: 'C2',
    lines: [['MP', 'With the greatest respect to the honourable member, his figures are pure fantasy.']],
    q: 'Quel est l’effet de « With the greatest respect » ?',
    o: [
      ['It introduces a strong attack under a polite formula.', 'Formule rituelle qui précède souvent une critique sévère.'],
      ['It shows sincere admiration.', 'Contredit par « pure fantasy ».'],
      ['It is an apology.', 'Aucune excuse.'],
      ['It indicates agreement.', 'Il est en désaccord total.'],
    ],
    why: 'Plus la formule de respect est appuyée, plus la critique qui suit est souvent virulente.',
  },
  {
    id: 'irc2_euphemism',
    lv: 'C2',
    passage: 'The company announced that it was "rightsizing" its workforce to better align with strategic priorities.',
    q: 'Que signifie concrètement ce communiqué ?',
    o: [
      ['The company is cutting jobs.', '« Rightsizing » est un euphémisme pour des licenciements.'],
      ['The company is hiring more staff.', 'Contresens.'],
      ['The company is training its employees.', 'Rien ne l’indique.'],
      ['The company is moving to a new office.', 'Hors sujet.'],
    ],
    why: 'Le jargon d’entreprise (rightsizing, restructuring, letting go) masque des réalités désagréables.',
  },
  {
    id: 'irc2_interesting',
    lv: 'C2',
    lines: [['Architect', 'What do you think of the new design?'], ['Client', "Well, it's certainly… brave."]],
    q: 'Que pense le client ?',
    o: [
      ['He has serious doubts about it.', '« Brave » (audacieux), précédé d’une hésitation, signale souvent une réserve polie.'],
      ['He admires the architect’s courage.', 'Lecture littérale.'],
      ['He finds it boring.', 'Brave suggère l’excès, pas l’ennui.'],
      ['He has not seen the design.', 'Il le commente.'],
    ],
    why: 'Adjectifs « dangereux » en anglais britannique : brave, interesting, unusual… souvent des critiques voilées.',
  },
];

export const DIALOGUE_C2: PassageItem[] = [
  {
    id: 'dc2_dinner',
    lv: 'C2',
    title: 'Meeting the parents',
    genre: 'Conversation',
    lines: [
      ['Father', "So, Daniel, Lucy tells us you're a musician."],
      ['Daniel', "That's right. I play the cello, mostly in orchestras."],
      ['Father', 'How… interesting. And is that a full-time occupation?'],
      ['Daniel', "It is, though I teach a few students as well. It keeps the wolf from the door."],
      ['Mother', "Well, I think it's wonderful. Lucy always did have a weakness for artistic types."],
      ['Lucy', 'Mum.'],
      ['Mother', 'What? It was a compliment!'],
    ],
    qs: [
      { q: "What does the father's 'How… interesting' suggest?", f: 'tone', a: 'Polite scepticism about Daniel’s career', w: ['Genuine fascination with music', 'Confusion about the word "cello"', 'Admiration for orchestras'], why: 'Hésitation + « interesting » : réserve polie.' },
      { q: "'It keeps the wolf from the door' means that teaching…", f: 'vocab', a: 'provides enough money to live on', w: ['protects him from dangerous animals', 'keeps students away from his home', 'is his favourite activity'], why: 'keep the wolf from the door = avoir de quoi vivre.' },
      { q: "Why does Lucy say 'Mum.'?", f: 'function', a: 'To signal embarrassment and ask her mother to stop', w: ['To introduce her mother to Daniel', 'To agree with her mother', 'To ask her mother a question'], why: 'Réplique minimale de reproche gêné.' },
      { q: "How sincere is the mother's 'It was a compliment!'?", f: 'tone', a: 'It is ambiguous: her remark could be read as a veiled criticism.', w: ['Completely sincere and clearly flattering', 'Openly hostile', 'A joke that everyone laughs at'], why: '« a weakness for artistic types » peut sous-entendre une faiblesse regrettable : la remarque est à double sens.' },
      { q: 'What does the scene mainly reveal?', f: 'inference', a: 'Tension hidden beneath polite conversation', w: ['A family that openly rejects Daniel', 'A discussion about classical music', 'A disagreement between Daniel and Lucy'], why: 'Tout passe par l’implicite : réserves voilées sous la politesse.' },
    ],
    why: 'Conversation C2 : sous-entendus, double sens, réplique minimale ; le sens se construit entre les lignes.',
  },
  {
    id: 'dc2_meeting',
    lv: 'C2',
    title: 'A post-mortem meeting',
    genre: 'Réunion',
    lines: [
      ['Chair', "Right, let's look at what went wrong with the launch. I'm not here to blame anyone."],
      ['Priya', "Of course. Although some of us did flag the timeline in March."],
      ['Chair', "Noted. With hindsight, perhaps we were a little optimistic."],
      ['Tom', "A little? We had three weeks to do six months' work."],
      ['Chair', "Let's keep it constructive, Tom."],
      ['Tom', 'I am being constructive. I’m constructing a timeline.'],
    ],
    qs: [
      { q: "What is Priya implying with 'some of us did flag the timeline in March'?", f: 'inference', a: 'She warned about the problem and was ignored.', w: ['She was responsible for the delay.', 'She agrees that nobody is to blame.', 'She wants to change the subject.'], why: 'did (insistance) + « some of us » : elle rappelle avoir alerté.' },
      { q: "'perhaps we were a little optimistic' is an example of…", f: 'tone', a: 'understatement that minimises a serious misjudgement', w: ['a frank admission of total failure', 'an accusation against Priya', 'a joke about the team'], why: 'Minimisation de l’erreur de planification.' },
      { q: "What does Tom's 'A little?' do?", f: 'function', a: 'It challenges the chair’s understatement.', w: ['It agrees with the chair.', 'It asks for clarification about the budget.', 'It changes the topic.'], why: 'Reprise ironique pour contester la minimisation.' },
      { q: "Tom's final line relies on…", f: 'tone', a: 'wordplay on "constructive" to defend his criticism', w: ['a genuine apology', 'a misunderstanding of the chair', 'a technical explanation'], why: 'Jeu de mots constructive / constructing : ironie mordante.' },
      { q: "The chair's 'I'm not here to blame anyone' most likely aims to…", f: 'function', a: 'defuse tension before discussing failures', w: ['accuse the team indirectly', 'end the meeting early', 'announce redundancies'], why: 'Formule de désamorçage, classique en bilan de projet.' },
    ],
    why: 'Réunion C2 : understatement, insistance, reprise ironique, jeu de mots : repérez qui minimise et qui conteste.',
  },
];

export const CONNOTATION_C2: InsightItem[] = [
  { id: 'cn1', lv: 'C2', q: 'Quel mot présente le fait de dépenser peu de manière positive ?', o: [['thrifty', 'positif : économe, avisé.'], ['stingy', 'négatif : pingre.'], ['mean', 'négatif (anglais britannique) : avare.'], ['tight-fisted', 'négatif et familier : radin.']], why: 'Même réalité, jugements opposés : la connotation révèle le point de vue.' },
  { id: 'cn2', lv: 'C2', q: 'Quel mot décrit une personne mince de façon flatteuse ?', o: [['slender', 'mince, élancé.'], ['skinny', 'maigre (souvent péjoratif).'], ['scrawny', 'maigrichon, chétif.'], ['bony', 'osseux.']], why: 'slender et slim sont mélioratifs ; skinny, scrawny, bony péjoratifs.' },
  { id: 'cn3', lv: 'C2', q: "Quel adjectif présente l'obstination comme une qualité ?", o: [['determined', 'déterminé : positif.'], ['stubborn', 'têtu : plutôt négatif.'], ['pig-headed', 'bêtement têtu : très négatif.'], ['obstinate', 'obstiné : négatif.']], why: 'determined / resolute (positif) ; stubborn / obstinate / pig-headed (négatif).' },
  { id: 'cn4', lv: 'C2', q: 'Quel mot est le plus neutre pour une personne qui parle peu ?', o: [['reserved', 'réservé : neutre, voire positif.'], ['unfriendly', 'peu aimable : négatif.'], ['antisocial', 'asocial : négatif.'], ['standoffish', 'distant, froid : négatif et familier.']], why: 'reserved décrit un tempérament ; les autres portent un jugement.' },
  { id: 'cn5', lv: 'C2', passage: 'Charming compact flat in a vibrant area.', q: 'Dans une annonce immobilière, que signifie probablement « compact » ?', o: [['small', 'Euphémisme d’agent immobilier : petit.'], ['well organised', 'C’est l’impression recherchée, mais compact signifie d’abord petit.'], ['modern', 'Rien à voir.'], ['cheap', 'Pas nécessairement.']], why: 'Jargon immobilier : compact = petit, vibrant = bruyant, characterful = vieillot.' },
  { id: 'cn6', lv: 'C2', q: 'Quel mot qualifie la curiosité de façon péjorative ?', o: [['nosy', 'fouineur, indiscret : péjoratif.'], ['curious', 'neutre ou positif.'], ['inquisitive', 'plutôt positif (curiosité intellectuelle).'], ['interested', 'neutre.']], why: 'nosy implique une curiosité déplacée.' },
  { id: 'cn7', lv: 'C2', q: 'Quel adjectif suggère un prix bas lié à une mauvaise qualité ?', o: [['cheap', 'peut suggérer la camelote (cheap and nasty).'], ['affordable', 'abordable : positif.'], ['reasonable', 'raisonnable : positif.'], ['economical', 'économique (à l’usage) : positif.']], why: 'cheap est ambigu ; affordable est mélioratif.' },
  { id: 'cn8', lv: 'C2', q: 'Quel verbe désigne un rire méprisant ?', o: [['sneer', 'ricaner avec mépris.'], ['chuckle', 'rire doucement, avec plaisir.'], ['giggle', 'glousser, rire nerveux.'], ['beam', 'sourire largement.']], why: 'Les verbes du rire et du sourire véhiculent l’attitude du personnage.' },
  { id: 'cn9', lv: 'C2', q: 'Quel mot critique un discours trop long et creux ?', o: [['verbose', 'verbeux : péjoratif.'], ['eloquent', 'éloquent : positif.'], ['articulate', 'qui s’exprime avec clarté : positif.'], ['concise', 'concis : positif.']], why: 'verbose / long-winded (négatif) ≠ eloquent / articulate (positif).' },
  { id: 'cn10', lv: 'C2', q: 'Quel mot présente un vieux bâtiment de façon valorisante ?', o: [['historic', 'historique : valeur patrimoniale.'], ['old-fashioned', 'démodé : péjoratif.'], ['dilapidated', 'délabré : péjoratif.'], ['outdated', 'dépassé : péjoratif.']], why: 'historic (important dans l’histoire) ≠ historical (qui concerne l’histoire) ; les autres sont péjoratifs.' },
];

export const NUANCE_C2: Record<string, InsightItem[]> = {
  conditional_inversion: [
    { id: 'nc2_ci1', lv: 'C2', q: 'Quelle phrase exprime une hypothèse peu probable sur l’avenir ?', o: [['Were the company to collapse, thousands would lose their jobs.', 'Were + sujet + to : hypothèse improbable (registre soutenu).'], ['Had the company collapsed, thousands would have lost their jobs.', 'Hypothèse sur le passé.'], ['Should the company collapse, thousands will lose their jobs.', 'Éventualité possible, présentée comme moins improbable.'], ['If the company collapses, thousands will lose their jobs.', 'Condition réelle (conditionnel 1).']], why: 'Were… to (improbable), Should (éventuel), Had (passé) : trois inversions, trois valeurs.' },
  ],
  ellipsis_substitution: [
    { id: 'nc2_el1', lv: 'C2', lines: [['A', "You've left the lights on."], ['B', 'So I have!']], q: 'Que signifie « So I have! » ?', o: [['« C’est vrai ! » (B constate son oubli)', 'So + sujet + auxiliaire : confirmation avec surprise.'], ['« Moi aussi ! »', 'Ce serait So have I (inversion).'], ['« Je ne l’ai pas fait. »', 'Contresens.'], ['« Je vais le faire. »', 'Rien n’indique une intention.']], why: 'So I have (c’est vrai) ≠ So have I (moi aussi) : l’ordre des mots change le sens.' },
  ],
  aspect_nuance: [
    { id: 'nc2_as1', lv: 'C2', q: 'Quelle phrase critique un comportement passager plutôt qu’un trait de caractère ?', o: [["You're being rude.", 'be being + adjectif : comportement du moment.'], ["You're rude.", 'Trait de caractère permanent.'], ['You were rude once.', 'Fait passé isolé.'], ['You always were rude.', 'Trait passé durable.']], why: 'Le progressif avec be signale un comportement temporaire, souvent jugé.' },
  ],
  nominalisation: [
    { id: 'nc2_no1', lv: 'C2', q: 'Quelle phrase est la plus adaptée à un rapport soutenu, sans lourdeur ?', o: [['The rise in unemployment has alarmed economists.', 'Une nominalisation bien dosée (the rise in).'], ['Unemployment rose and this fact was something that alarmed economists.', 'Lourd et dilué.'], ['The rising of the unemployment alarmingly economists.', 'Agrammatical.'], ['The occurrence of the rise of the increase of unemployment alarmed economists.', 'Nominalisation excessive.']], why: 'Nominaliser condense le propos, à condition de ne pas empiler les noms.' },
  ],
};

export const WRITING_C2: WritingPrompt[] = [
  {
    id: 'wc2_synthesis',
    lv: 'C2',
    title: 'Summary and evaluation of two viewpoints',
    prompt: 'Lisez les deux points de vue ci-dessous, puis rédigez un texte (240 à 320 mots) qui résume chacun d’eux avec vos propres mots, les évalue de façon critique et présente votre position.',
    task:
      'Text A: "Working from home has liberated millions from pointless commutes and rigid schedules. Productivity has not suffered; in many cases it has improved." Text B: "Remote work erodes the informal exchanges through which young employees learn and ideas spread. Its long-term costs are not yet visible." Summarise and evaluate both views, and give your own opinion.',
    min: 240,
    max: 320,
    checks: [
      { id: 'summary', label: 'Signaler la reformulation des sources', patterns: ['the first (text|writer|author)', 'the second (text|writer|author)', 'text a', 'text b', 'according to', 'the author (argues|claims|maintains|contends)', 'argues that', 'contends that', 'maintains that'], min: 2 },
      { id: 'evaluation', label: 'Évaluer de façon critique', patterns: ['convincing', 'persuasive', 'overlooks', 'fails to', 'underestimates', 'overstates', 'valid', 'compelling', 'questionable', 'tenuous'] },
      { id: 'nuance', label: 'Nuancer (au moins deux marqueurs)', patterns: ['arguably', 'to some extent', 'to a large extent', 'admittedly', 'it would seem', 'may well', 'tends to', 'in part', 'largely', 'not entirely'], min: 2 },
      { id: 'position', label: 'Prendre position', patterns: ['in my view', 'I would argue', 'my own view', 'I am inclined to', 'on balance', 'I believe', 'it seems to me'] },
    ],
    rubric: ['Les deux points de vue sont résumés fidèlement, avec mes propres mots.', 'Mon évaluation porte sur les arguments, pas seulement sur les conclusions.', 'Je distingue clairement le résumé de mon opinion.', 'Le registre est soutenu et la syntaxe variée.', 'La conclusion découle logiquement de l’évaluation.', "J'ai relu la langue avec un niveau d'exigence élevé."],
    phrases: ['The first writer contends that…', 'This argument is persuasive insofar as…', 'What it overlooks, however, is…', 'The second text raises a valid concern, although…', 'On balance, I would argue that…'],
    model:
      "The two texts take sharply opposing views of remote work. The first writer contends that working from home has freed employees from unproductive commuting and inflexible hours, and claims that productivity has been maintained or even improved. The second author argues that remote work undermines the informal contact through which junior staff acquire skills and ideas circulate, and warns that its costs may only become apparent in the long term.\n\nThe first argument is persuasive insofar as it reflects the experience of many experienced professionals, for whom concentration and autonomy matter more than daily interaction. Its claim about productivity, however, is stated rather than demonstrated, and it overlooks the possibility that short-term output may conceal longer-term losses, such as weaker training or less innovation.\n\nThe second text raises a valid concern, and its emphasis on young employees is particularly compelling: those with the least experience arguably have the most to lose from isolation. Admittedly, its central claim is difficult to test, precisely because the costs it describes are not yet visible. Yet this is not a reason to dismiss it; it is a reason to monitor the situation carefully rather than assume that the absence of evidence is evidence of absence.\n\nOn balance, I would argue that both writers are partly right because they are describing different employees. Remote work tends to suit those who already know how to do their jobs, while it may well disadvantage those who are still learning. The most sensible response, it seems to me, is not to choose between office and home, but to design arrangements that give newer staff structured opportunities to learn alongside their colleagues.",
    why: 'Synthèse C2 : reformuler fidèlement des sources, les évaluer de façon critique, distinguer résumé et opinion, conclure de façon nuancée.',
  },
  {
    id: 'wc2_review',
    lv: 'C2',
    title: 'Critical review',
    prompt: 'Rédigez une critique approfondie (240 à 320 mots) d’une œuvre (livre, film, exposition, série) que vous connaissez bien, destinée à une revue culturelle exigeante : contexte, analyse, jugement argumenté.',
    task: 'Write a critical review of a book, film, exhibition or series for a cultural magazine.',
    min: 240,
    max: 320,
    checks: [
      { id: 'analysis', label: 'Analyser des procédés (au moins deux termes)', patterns: ['narrative', 'structure', 'pacing', 'tone', 'characteri[sz]ation', 'imagery', 'cinematography', 'the plot', 'the protagonist', 'theme', 'irony', 'register', 'dialogue'], min: 2 },
      { id: 'judgement', label: 'Jugement argumenté', patterns: ['succeeds', 'fails', 'falls short', 'compelling', 'unconvincing', 'masterly', 'uneven', 'flawed', 'accomplished', 'ambitious'] },
      { id: 'concession', label: 'Concession', patterns: ['admittedly', 'although', 'while', 'for all its', 'despite', 'that said', 'nevertheless', 'yet'] },
    ],
    rubric: ['Le contexte est présenté sans résumé excessif ni révélation de la fin.', 'L’analyse porte sur des procédés précis, illustrés.', 'Le jugement est nuancé et justifié.', 'Le style est vivant, précis et sans clichés.', 'La conclusion situe l’œuvre et oriente le lecteur.', "J'ai relu la langue avec un niveau d'exigence élevé."],
    phrases: ['For all its ambition, the film…', 'What lingers is…', 'The narrative structure, which…, ultimately…', 'If the novel falls short, it is in…'],
    model:
      "There is a particular kind of novel that announces its seriousness on every page, and for its first hundred pages The Glass Archive seems determined to be one of them. Its narrator, a retired archivist cataloguing the papers of a forgotten poet, speaks in long, carefully balanced sentences that occasionally feel more admired than felt. Patience, however, is rewarded.\n\nWhat begins as a quiet study of loneliness gradually becomes something stranger and more ambitious. The narrative structure, which alternates between the archivist's notes and fragments of the poet's letters, allows the author to explore how we construct the people we study, and how often we find in them only what we brought. The irony is handled with real delicacy: the more confidently the narrator interprets the poet, the more clearly the reader sees him projecting his own regrets.\n\nThe characterisation of the poet herself is the book's great achievement. She emerges not as a tragic muse but as a funny, impatient and frequently unkind woman, all the more compelling for refusing the role the archivist assigns her. The imagery of dust and light, which could easily have become heavy-handed, is used sparingly enough to retain its force.\n\nFor all its intelligence, the novel is not without flaws. The middle section is overlong, and a late revelation about the archivist's past feels engineered rather than earned. Some readers may also find the tone too restrained for its own good.\n\nThat said, these are the faults of an ambitious book rather than a careless one. The Glass Archive succeeds in turning a modest premise into a subtle reflection on memory and interpretation, and what lingers is not its plot but its unsettling question: how much of anyone can we truly know?",
    why: 'Critique C2 : analyse de procédés, jugement nuancé et argumenté, style personnel maîtrisé.',
  },
];
