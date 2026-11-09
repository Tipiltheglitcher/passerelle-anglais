/**
 * Contenus de communication B1 → B2 : textes longs, argumentations,
 * dialogues naturels, registre, organisation de textes, rédaction.
 * Tous les textes sont originaux.
 */
import type { InsightItem, OrderItem, PassageItem, WritingPrompt } from '@/engine/exercises/advanced';

export const READING_B2: PassageItem[] = [
  {
    id: 'rb2_fourday',
    lv: 'B2',
    title: 'Is the four-day week the future of work?',
    genre: 'Article de magazine',
    text: [
      'When a software company in Bristol announced last year that its staff would work four days a week for the same salary, many of its competitors predicted chaos. Twelve months later, the firm reports that productivity has not fallen; if anything, it has risen slightly. Sick days have dropped by almost a third, and the company has had no difficulty recruiting, even for highly technical posts.',
      'Supporters of the four-day week argue that such results are not surprising. People who are well rested, they say, make fewer mistakes and are less likely to burn out. A shorter week also forces managers to cut unnecessary meetings, which many employees regard as the biggest waste of their time.',
      'Critics, however, point out that what works for a software firm may not work for a hospital, a school or a restaurant, where someone has to be present at all times. In these sectors, a four-day week would mean hiring more staff, and the extra cost would almost certainly be passed on to customers or taxpayers.',
      'There is also the question of how the extra day is used. Some employees in the Bristol trial admitted that they often spent part of their day off answering emails, which suggests that the boundary between work and private life is not as clear as the figures imply.',
      'For now, the evidence is encouraging but limited. Most trials have involved small, office-based companies that volunteered to take part, and such firms are probably the ones most likely to succeed. Until the model has been tested more widely, it would be unwise to treat it as a universal solution.',
    ].join('\n\n'),
    qs: [
      { q: 'What is the main purpose of the article?', f: 'gist', a: 'To present the results of a trial and weigh up their significance', w: ['To persuade companies to adopt a four-day week immediately', 'To explain why software companies are more productive than hospitals', 'To criticise employees who answer emails on their day off'], why: "L'article présente des résultats (§1), des arguments pour (§2) et contre (§3-4), puis conclut avec prudence (§5)." },
      { q: 'According to the article, what happened at the Bristol company?', f: 'detail', a: 'Productivity stayed the same or improved slightly.', w: ['Productivity fell during the first months.', 'The company found it harder to recruit technical staff.', 'Sick days rose by about a third.'], why: '« productivity has not fallen; if anything, it has risen slightly » (if anything = au contraire, plutôt).' },
      { q: "In paragraph 2, 'burn out' is closest in meaning to…", f: 'vocab', a: 'become exhausted from overwork', w: ['lose their job', 'start a fire at work', 'arrive late every day'], why: "to burn out = s'épuiser (burn-out) : le contexte parle de repos et de fatigue." },
      { q: 'What does paragraph 4 suggest?', f: 'inference', a: 'The day off is not always completely free from work.', w: ['Employees refused to answer emails.', 'The figures prove that work and private life are now separate.', 'Most employees secretly worked five full days.'], why: "« spent part of their day off answering emails » : la frontière vie privée / travail reste floue." },
      { q: "Why does the writer mention that the companies 'volunteered to take part'?", f: 'inference', a: 'To suggest that the trials may not be representative', w: ['To show that the trials were well organised', 'To prove that all companies want a four-day week', 'To criticise the government for not taking part'], why: "Des entreprises volontaires sont « probablement celles qui ont le plus de chances de réussir » : l'échantillon est biaisé." },
      { q: "What is the writer's overall attitude to the four-day week?", f: 'attitude', a: 'Cautiously optimistic', w: ['Openly hostile', 'Completely enthusiastic', 'Indifferent'], why: '« encouraging but limited… it would be unwise to treat it as a universal solution ».' },
    ],
    why: "Texte argumentatif de type article : repérez la structure (résultats, arguments pour, objections, conclusion) et la modalisation (if anything, almost certainly, probably, it would be unwise).",
  },
  {
    id: 'rb2_shopping',
    lv: 'B2',
    title: "Why we buy things we don't need",
    genre: 'Vulgarisation (psychologie)',
    text: [
      'Most of us have done it: a jacket bought in a sale and never worn, a kitchen gadget used once and then forgotten at the back of a cupboard. Economists used to assume that consumers made rational choices, weighing up costs and benefits before every purchase. Behavioural research has shown that the reality is rather different.',
      "One of the most powerful influences on our decisions is what psychologists call 'anchoring'. When a jacket is labelled 'was £120, now £60', the original price acts as a reference point, and £60 suddenly looks like a bargain, even if the jacket was never really worth £120 in the first place.",
      "Another factor is the fear of missing out. Messages such as 'only two left in stock' or 'offer ends tonight' create a sense of urgency that discourages careful thought. Shoppers who would normally compare prices end up buying on impulse, worried that the opportunity will disappear.",
      'Online shopping has made these techniques easier to apply. Algorithms track what we look at and show us similar products again and again, so that an item we had almost forgotten seems to follow us around the internet. One-click payment removes the brief moment of hesitation that might once have made us change our minds.',
      'None of this means that consumers are helpless. Simple strategies, such as waiting twenty-four hours before any non-essential purchase or unsubscribing from promotional emails, can significantly reduce impulse buying. Being aware of the tricks, it seems, is the first step towards resisting them.',
    ].join('\n\n'),
    qs: [
      { q: 'Which title best summarises the text?', f: 'gist', a: 'How shops influence our decisions, and how to resist', w: ['Why sales are always a good opportunity', 'A short history of online shopping', 'Economists prove that consumers are rational'], why: 'Le texte décrit des techniques (§2-4) puis des stratégies de résistance (§5).' },
      { q: "What does 'anchoring' refer to?", f: 'detail', a: 'Judging a price by comparing it with an earlier reference price', w: ['Buying several items at once to save money', 'Refusing to buy anything that is not reduced', 'Returning items that we never use'], why: '« the original price acts as a reference point ».' },
      { q: "Why might a shop write 'only two left in stock'?", f: 'inference', a: 'To make customers decide quickly without thinking too much', w: ['To warn customers that the product is of poor quality', 'To encourage customers to compare prices', 'To apologise for a delivery problem'], why: '« create a sense of urgency that discourages careful thought ».' },
      { q: "'on impulse' (paragraph 3) means…", f: 'vocab', a: 'suddenly, without planning', w: ['after a long discussion', 'with a large discount', 'online rather than in a shop'], why: "buy on impulse = acheter sur un coup de tête, en opposition à « compare prices »." },
      { q: 'According to the text, what effect does one-click payment have?', f: 'detail', a: 'It removes a moment when we might reconsider.', w: ['It makes products cheaper.', 'It protects customers from fraud.', 'It encourages us to compare prices.'], why: '« removes the brief moment of hesitation that might once have made us change our minds ».' },
      { q: 'How does the writer view consumers?', f: 'attitude', a: 'Vulnerable to manipulation but able to protect themselves', w: ['Completely rational', 'Totally unable to resist marketing', 'Responsible for the economic crisis'], why: '« None of this means that consumers are helpless. »' },
    ],
    why: 'Repérez les concepts définis (anchoring, fear of missing out) et la conclusion qui nuance le propos (None of this means…).',
  },
  {
    id: 'rb2_nighttrain',
    lv: 'B2',
    title: 'The return of the night train',
    genre: 'Reportage',
    text: [
      'Twenty years ago, the night train seemed to belong to the past. Low-cost airlines could take passengers from Paris to Rome in two hours for less than the price of a restaurant meal, and one by one, sleeper services across Europe were withdrawn.',
      'Today, the trend is being reversed. New routes have opened between Vienna and Amsterdam, Brussels and Prague, Paris and Berlin, and many of them are fully booked weeks in advance. Rail companies say demand has been driven largely by travellers who want to reduce their carbon footprint: a night train emits a fraction of the greenhouse gases produced by a short-haul flight.',
      'Environmental concerns are not the only explanation, though. Many passengers point out that a night train saves both time and money, since they travel while they sleep and avoid paying for a hotel. Others simply enjoy the experience: watching the countryside disappear at dusk and waking up in a different country.',
      'The revival has not been without problems. Tickets are often more expensive than flights, partly because rail operators pay track charges in every country they cross, while airlines pay no tax on kerosene for international flights. Old carriages break down, and delays of several hours are not unusual.',
      'Whether night trains can become more than a niche product will depend largely on political decisions. If governments are serious about cutting emissions from transport, campaigners argue, they will have to make rail travel cheaper and air travel less artificially cheap.',
    ].join('\n\n'),
    qs: [
      { q: 'What is the text mainly about?', f: 'gist', a: 'The revival of night trains and the obstacles it faces', w: ['The reasons why night trains disappeared for ever', 'The advantages of low-cost airlines', 'A comparison of hotels in European capitals'], why: '« the trend is being reversed » (§2) puis « The revival has not been without problems » (§4).' },
      { q: 'Why did many night train services close?', f: 'detail', a: 'Cheap flights attracted their passengers.', w: ['Trains caused too much pollution.', 'Governments banned them.', 'Passengers complained about the noise.'], why: '§1 : les compagnies low-cost proposaient des vols rapides et bon marché.' },
      { q: 'Which reason for the popularity of night trains is NOT mentioned?', f: 'detail', a: 'They offer free meals.', w: ['They pollute less than planes.', 'Passengers save the cost of a hotel.', 'Some people enjoy the journey itself.'], why: 'Les repas gratuits ne sont jamais mentionnés ; les trois autres raisons figurent aux §2-3.' },
      { q: 'Why are night train tickets often expensive?', f: 'inference', a: 'Rail operators face costs that airlines partly avoid.', w: ['Night trains are always fully booked.', 'Passengers must pay for a hotel as well.', 'Governments add a special tax for tourists.'], why: '« track charges in every country » contre « no tax on kerosene ».' },
      { q: "'a niche product' (paragraph 5) is…", f: 'vocab', a: 'something that appeals only to a small group of people', w: ['something very expensive', 'something dangerous', 'something produced in large quantities'], why: 'niche = marché restreint, par opposition à un produit grand public.' },
      { q: 'What do campaigners believe?', f: 'attitude', a: 'Political measures are needed to make rail competitive.', w: ['Night trains will succeed without any help.', 'Air travel should be banned completely.', 'Rail companies should stop running night trains.'], why: '« they will have to make rail travel cheaper and air travel less artificially cheap ».' },
    ],
    why: "Reportage : distinguez les faits (routes, prix), les explications et l'avis des militants (campaigners argue).",
  },
];

export const ARGUMENT_B2: PassageItem[] = [
  {
    id: 'ab2_homework',
    lv: 'B2',
    title: 'Is homework worth the tears?',
    genre: "Tribune d'opinion",
    text: [
      'Every evening, millions of children sit at kitchen tables completing worksheets that their teachers will barely have time to mark. It is time we asked whether homework is worth the tears.',
      'Supporters claim that homework teaches discipline and reinforces what pupils have learnt in class. Yet research on primary school children has found little or no link between the amount of homework they do and how well they perform. For younger pupils, at least, the benefits appear to be minimal.',
      'The costs, on the other hand, are real. Homework eats into time that could be spent playing, reading for pleasure or simply resting, and it widens the gap between children whose parents can help them and those whose parents cannot.',
      'Of course, older students preparing for exams need to study independently, and nobody is suggesting that they should stop. But for children under eleven, the case for homework is weak. Schools should replace it with something far simpler: encouraging children to read every day.',
    ].join('\n\n'),
    qs: [
      { q: "What is the writer's main claim?", f: 'claim', a: 'Homework should be abandoned for young children.', w: ['Homework should be abolished for all students.', 'Teachers should mark homework more carefully.', 'Parents should help their children with homework.'], why: '« for children under eleven, the case for homework is weak » ; les élèves plus âgés sont explicitement exclus.' },
      { q: 'Which evidence does the writer use to support this claim?', f: 'evidence', a: 'Research showing little link between homework and results in primary school', w: ['The number of worksheets teachers mark each evening', 'Interviews with parents who help their children', 'The exam results of older students'], why: '« research on primary school children has found little or no link… ».' },
      { q: "What is the function of the sentence beginning 'Of course, older students…'?", f: 'structure', a: 'It concedes a point and limits the scope of the argument.', w: ['It introduces the main claim for the first time.', 'It gives a statistic supporting the argument.', "It contradicts the writer's conclusion."], why: 'Of course… But… : concession, puis restriction de la thèse aux moins de onze ans.' },
      { q: 'Which idea does the writer take for granted in paragraph 3?', f: 'assumption', a: 'Time spent playing or resting is valuable for children.', w: ['All parents are able to help with homework.', 'Homework is always marked carefully.', 'Reading is less important than homework.'], why: "Dire que les devoirs « grignotent » ce temps suppose que ce temps a de la valeur." },
      { q: "'It is time we asked whether homework is worth the tears.' This sentence is…", f: 'tone', a: 'deliberately provocative, to engage the reader', w: ['neutral and purely factual', 'an apology to teachers', 'a quotation from a researcher'], why: '« worth the tears » dramatise volontairement : accroche typique d’une tribune.' },
    ],
    why: "Une argumentation se lit en repérant la thèse, ses justifications, les concessions (Of course… But…) et les présupposés.",
  },
  {
    id: 'ab2_cars',
    lv: 'B2',
    title: 'Our city centre needs to be car-free',
    genre: 'Lettre ouverte',
    text: [
      "Our city centre is choking. On weekdays, the average speed of traffic is now slower than a bicycle, and air pollution regularly exceeds the legal limit. The council's proposal to ban private cars from the historic centre is therefore not radical; it is overdue.",
      'Opponents warn that shops will lose customers. However, when the neighbouring city of Ghent closed its centre to through traffic, the number of visitors to the centre actually rose, and very few businesses closed. There is no reason to believe that our experience would be any different.',
      'It is also said that the ban would be unfair to elderly and disabled residents. This is a serious concern, but it is an argument for exemptions and better public transport, not for doing nothing.',
      'Ultimately, the question is not whether we can afford to ban cars, but whether we can afford not to.',
    ].join('\n\n'),
    qs: [
      { q: "What is the writer's main claim?", f: 'claim', a: 'The planned ban on cars in the centre is necessary and should go ahead.', w: ['The council should lower the speed limit.', 'Shops in the centre should be closed.', 'Elderly residents should move out of the centre.'], why: '« not radical; it is overdue » : la mesure aurait dû être prise depuis longtemps.' },
      { q: 'What evidence is given to answer the objection about shops?', f: 'evidence', a: 'The example of another city where visitor numbers increased', w: ['A survey of local shop owners', 'Statistics on air pollution', 'The average speed of traffic'], why: "L'exemple de Gand : « the number of visitors… actually rose »." },
      { q: "What weakness is there in the sentence 'There is no reason to believe that our experience would be any different'?", f: 'flaw', a: "It assumes that one city's experience will automatically apply to another.", w: ["It contradicts the writer's main claim.", 'It relies on a personal attack against opponents.', 'It gives too many statistics.'], why: 'Généralisation à partir d’un seul exemple : les deux villes peuvent différer (taille, transports…).' },
      { q: 'How does the writer deal with the concern about elderly and disabled residents?', f: 'structure', a: 'By accepting it but arguing that it calls for adjustments, not rejection', w: ['By dismissing it as unimportant', 'By saying that it is untrue', 'By changing the subject to pollution'], why: '« This is a serious concern, but it is an argument for exemptions… not for doing nothing. »' },
      { q: 'The final sentence…', f: 'tone', a: 'reverses the opponents’ question to make the conclusion memorable', w: ['expresses uncertainty about the proposal', 'gives a statistic to prove the point', 'introduces a new example'], why: "Renversement (can we afford to… / can we afford not to) : procédé rhétorique de conclusion." },
    ],
    why: 'Repérez la réfutation des objections (However…, This is a serious concern, but…) et évaluez la solidité des preuves.',
  },
  {
    id: 'ab2_social',
    lv: 'B2',
    title: 'Is social media to blame?',
    genre: 'Essai',
    text: [
      'It has become common to blame social media for a rise in anxiety among teenagers. The timing certainly looks suspicious: in several countries, reported levels of anxiety began to rise around the time that smartphones became widespread.',
      'However, the fact that two trends happened at the same time does not prove that one caused the other. Teenagers today also face greater academic pressure, more uncertainty about jobs and housing, and constant news about global crises. Any of these factors could contribute to their anxiety.',
      'Moreover, studies that ask young people about their own experience produce mixed results. Many say that online platforms help them stay in touch with friends and find communities they could not find locally, particularly if they feel isolated at school.',
      'This does not mean that social media is harmless. There is good evidence that heavy use late at night disrupts sleep, and that certain types of content can damage self-esteem. The sensible conclusion is not that social media is the cause of the problem, but that it is one factor among several, and that how young people use it matters more than how long they spend on it.',
    ].join('\n\n'),
    qs: [
      { q: "What is the writer's conclusion?", f: 'claim', a: 'Social media is one factor among several, and the way it is used matters most.', w: ['Social media is the main cause of teenage anxiety.', 'Social media has no effect on young people.', 'Teenagers should be banned from using smartphones.'], why: 'Dernière phrase : « one factor among several… how young people use it matters more ».' },
      { q: 'According to the writer, what is wrong with blaming social media because anxiety rose at the same time?', f: 'flaw', a: 'A correlation between two trends does not prove that one caused the other.', w: ['The dates given are incorrect.', 'Anxiety has not actually increased.', 'Smartphones became popular after anxiety rose.'], why: 'Confusion entre corrélation et causalité.' },
      { q: 'Which point supports the idea that social media can be positive?', f: 'evidence', a: 'Some young people find communities online that they cannot find locally.', w: ['Heavy use at night disrupts sleep.', 'Academic pressure has increased.', 'Certain content damages self-esteem.'], why: '§3 : « find communities they could not find locally ».' },
      { q: "What is the role of the paragraph beginning 'This does not mean…'?", f: 'structure', a: 'It prevents the reader from concluding that social media is harmless.', w: ['It introduces a completely new topic.', 'It repeats the argument of the first paragraph.', "It describes the writer's personal experience."], why: "Le paragraphe nuance l'argumentation avant la conclusion." },
      { q: "'disrupts sleep' means…", f: 'vocab', a: 'prevents people from sleeping normally', w: ['helps people fall asleep', 'replaces sleep completely', 'makes people dream more'], why: 'disrupt = perturber.' },
    ],
    why: 'Essai équilibré : repérez la thèse rejetée, les contre-arguments (However, Moreover) et la conclusion nuancée.',
  },
];

export const TEXT_ORDER_B2: OrderItem[] = [
  {
    id: 'tob2_homeworking',
    lv: 'B2',
    title: 'Working from home: a mixed blessing',
    segs: [
      ['Working from home has become normal for millions of employees.', 'Introduction du sujet'],
      ['Its advantages are obvious: no commuting, more flexibility and fewer interruptions.', 'Premier volet : les avantages'],
      ['However, it also has drawbacks that are easy to underestimate.', 'Transition (However) : annonce des inconvénients'],
      ['Many people feel isolated, and the line between work and private life becomes blurred.', 'Développement des inconvénients'],
      ['On balance, a mix of office and home working seems to offer the best of both worlds.', 'Conclusion nuancée (On balance)'],
    ],
    why: 'Plan classique : présentation, avantages, transition (However), inconvénients, conclusion (On balance).',
  },
  {
    id: 'tob2_museums',
    lv: 'B2',
    title: 'Should museums be free?',
    segs: [
      ['Many national museums charge an entrance fee, but some people argue that they should be free.', 'Introduction : la question posée'],
      ['The main argument in favour is that culture should be accessible to everyone, whatever their income.', 'Argument principal pour'],
      ['Free entry would also encourage people to visit more often, even for a short time.', 'Argument supplémentaire (also)'],
      ['On the other hand, museums need money to maintain their collections and pay their staff.', 'Argument contre (On the other hand)'],
      ['Perhaps the best solution would be free entry to permanent collections and a fee for special exhibitions.', 'Conclusion : compromis'],
    ],
    why: "also signale un argument du même côté ; On the other hand introduit le point de vue opposé ; Perhaps the best solution conclut.",
  },
  {
    id: 'tob2_complaint',
    lv: 'B2',
    title: 'A letter of complaint',
    segs: [
      ['Dear Sir or Madam,', "Formule d'appel"],
      ['I am writing to complain about a laptop that I ordered from your website on 3 March.', 'Objet de la lettre'],
      ['Although delivery was promised within five days, it arrived two weeks late.', 'Premier problème'],
      ['Furthermore, when I opened the box, I discovered that the screen was cracked.', 'Second problème (Furthermore)'],
      ['I would therefore be grateful if you could replace the laptop or refund the full amount.', 'Demande (therefore)'],
      ['I look forward to hearing from you.', 'Formule finale'],
    ],
    why: "Lettre formelle : appel, objet (I am writing to…), faits, demande (therefore), formule de clôture.",
  },
  {
    id: 'tob2_story',
    lv: 'B2',
    title: 'The last train',
    segs: [
      ['When Anna reached the station, the platform was almost empty.', 'Mise en place'],
      ['She checked the departures board and realised that her train had already left.', 'Complication (past perfect)'],
      ['At first she panicked, as it was the last train of the day.', 'Réaction (At first)'],
      ['Then she noticed a woman waving at her from the café opposite.', 'Rebondissement (Then)'],
      ['It was an old school friend, who offered to drive her home.', 'Dénouement'],
    ],
    why: 'Récit : situation, problème, réaction (At first), rebondissement (Then), dénouement.',
  },
];

export const DIALOGUE_B2: PassageItem[] = [
  {
    id: 'db2_deadline',
    lv: 'B2',
    title: 'A new deadline',
    genre: 'Au bureau',
    lines: [
      ['Manager', "Have you got a minute, Sarah? I wanted to talk to you about the Henderson project."],
      ['Sarah', 'Sure. Is everything OK?'],
      ['Manager', "Oh, yes, absolutely. It's just that the client has asked whether we could bring the deadline forward by a week."],
      ['Sarah', "A week? That's… ambitious. We're already working flat out."],
      ['Manager', "I know, I know. I wouldn't ask if it weren't important. Do you think it might be doable if we brought in some extra help?"],
      ['Sarah', "Possibly. But I'd need at least two more people, and I'd want them to start on Monday."],
      ['Manager', "Leave that with me. I'll see what I can do."],
    ],
    qs: [
      { q: "Why does the manager say 'Oh, yes, absolutely'?", f: 'function', a: 'To reassure Sarah before introducing a problem', w: ['To show that the project is finished', "To agree with the client's criticism", 'To end the conversation politely'], why: "Rassurer d'abord, puis annoncer la demande (It's just that…)." },
      { q: "What does Sarah mean by 'That's… ambitious'?", f: 'inference', a: 'She thinks the new deadline is unrealistic.', w: ["She admires the client's ambition.", 'She is delighted with the new deadline.', 'She did not understand the request.'], why: 'Litote : « ambitious » + hésitation = poliment, « ce n’est pas réaliste ».' },
      { q: "'We're already working flat out' means that the team…", f: 'vocab', a: 'is already working as hard as possible', w: ['has finished most of the work', 'has nothing to do at the moment', 'works in an open-plan office'], why: 'flat out = à plein régime.' },
      { q: 'What is Sarah doing in her last reply?', f: 'function', a: 'Setting conditions for accepting the request', w: ['Refusing the request completely', 'Complaining about a colleague', 'Asking for a pay rise'], why: '« Possibly. But I’d need… » : acceptation sous conditions.' },
      { q: "What does 'Leave that with me' mean?", f: 'vocab', a: "I'll deal with it.", w: ['Forget about it.', 'Give me your work.', 'You can go now.'], why: 'Leave that with me = je m’en occupe.' },
    ],
    why: "Les échanges professionnels sont souvent indirects : litote (ambitious), conditions (I'd need…), engagements prudents (I'll see what I can do).",
  },
  {
    id: 'db2_restaurant',
    lv: 'B2',
    title: 'Choosing a restaurant',
    genre: 'Entre amis',
    lines: [
      ['Tom', 'So, what did you think of the place?'],
      ['Lucy', "It was… interesting. I've never had soup quite that cold before."],
      ['Tom', 'Yeah, sorry about that. The reviews were amazing.'],
      ['Lucy', "Don't worry, the company was lovely. Although next time, maybe I'll choose?"],
      ['Tom', "Fair enough. I'm clearly not to be trusted with restaurants."],
      ['Lucy', "I didn't say that! Well… not exactly."],
    ],
    qs: [
      { q: 'What does Lucy really think of the restaurant?', f: 'inference', a: 'She did not like it.', w: ['She found it fascinating.', 'She loved the soup.', 'She has no opinion.'], why: '« interesting » + hésitation et la remarque sur la soupe froide : critique polie.' },
      { q: "'I've never had soup quite that cold before' is…", f: 'tone', a: 'an ironic way of criticising the food', w: ['a compliment about a refreshing dish', 'a formal complaint to the chef', 'a question about the menu'], why: 'Ironie : la forme neutre masque une critique.' },
      { q: "Why does Lucy say 'the company was lovely'?", f: 'function', a: 'To soften her criticism and stay friendly', w: ["To praise the restaurant's owners", 'To suggest working for a company', 'To change her mind about the food'], why: 'company = la compagnie (Tom) : elle compense la critique par un compliment.' },
      { q: "What does 'Fair enough' show?", f: 'vocab', a: "Tom accepts Lucy's suggestion.", w: ['Tom thinks the bill was fair.', 'Tom is angry with Lucy.', 'Tom wants to go back to the restaurant.'], why: 'Fair enough = c’est juste, d’accord.' },
      { q: "What does Lucy's last line suggest?", f: 'tone', a: 'She is teasing Tom and half-admitting he is right.', w: ['She is seriously offended.', 'She completely disagrees with Tom.', 'She wants to end the friendship.'], why: '« Well… not exactly » : demi-aveu taquin.' },
    ],
    why: "Entre amis, la critique passe souvent par l'ironie et l'atténuation : l'écart entre les mots et l'intention est à interpréter.",
  },
  {
    id: 'db2_refund',
    lv: 'B2',
    title: 'A delayed refund',
    genre: 'Au téléphone',
    lines: [
      ['Agent', "Thank you for holding. I can see your refund request, but unfortunately it hasn't been processed yet."],
      ['Customer', "That's what I was told three weeks ago. I was promised it would take five working days."],
      ['Agent', "I do apologise. There's been a backlog in our finance department."],
      ['Customer', "I appreciate that it's not your fault, but I'd like to know exactly when I'll get my money back."],
      ['Agent', "I'm afraid I can't give you an exact date, but I can escalate your case to a supervisor."],
      ['Customer', "Please do. And I'd be grateful if you could confirm that in writing."],
    ],
    qs: [
      { q: "Why does the customer mention 'three weeks ago'?", f: 'function', a: 'To show that the problem has lasted too long', w: ['To explain when she bought the product', 'To ask for a different product', 'To thank the agent for being quick'], why: 'Rappel du délai pour souligner le non-respect de la promesse.' },
      { q: "'a backlog' means…", f: 'vocab', a: 'an accumulation of work waiting to be done', w: ['a computer error', 'a holiday period', 'a financial loss'], why: 'backlog = retard accumulé, travail en souffrance.' },
      { q: "'I appreciate that it's not your fault, but…' shows that the customer…", f: 'tone', a: 'is firm but remains polite', w: ['is blaming the agent personally', 'has accepted the delay', 'is about to end the call angrily'], why: 'Concession polie suivie d’une exigence claire.' },
      { q: "What does 'escalate your case' mean here?", f: 'vocab', a: 'pass the case to someone with more authority', w: ['close the case', 'increase the refund', 'send the product back'], why: 'escalate = transmettre à un niveau supérieur.' },
      { q: 'Why does the customer ask for written confirmation?', f: 'inference', a: 'To have proof of what has been promised', w: ['Because she cannot hear the agent', "To criticise the agent's spelling", 'Because she wants a catalogue'], why: 'Après une promesse non tenue, elle veut une trace écrite.' },
    ],
    why: "Réclamation au téléphone : fermeté polie (I appreciate that…, but…), demandes formelles (I'd be grateful if…).",
  },
];

export const REGISTER_B2: InsightItem[] = [
  {
    id: 'rgb2_delay',
    lv: 'B2',
    sit: 'Vous écrivez à un client que vous ne connaissez pas pour vous excuser d’un retard de livraison.',
    q: 'Quelle phrase convient le mieux ?',
    o: [
      ['We apologise for the delay in delivering your order.', 'Formule professionnelle, neutre et courtoise.', 'neutre / professionnel'],
      ["Sorry the stuff's late!", 'Trop familier pour un client (stuff, exclamation).', 'familier'],
      ['We are sorry, your order is late, it is our fault, really.', 'Correct mais maladroit et répétitif ; really est oral.', 'maladroit'],
      ['Your order is late. Deal with it.', 'Impoli et agressif.', 'inapproprié'],
    ],
    why: "À l'écrit professionnel : apologise for + nom, ton neutre, sans familiarités.",
  },
  {
    id: 'rgb2_drink',
    lv: 'B2',
    sit: 'Un collègue avec qui vous êtes ami vous propose de boire un verre après le travail. Vous acceptez.',
    q: 'Quelle réponse est la plus naturelle ?',
    o: [
      ['Sounds great, count me in!', 'Naturel et chaleureux entre collègues proches.', 'familier (adapté)'],
      ['I would be delighted to accept your kind invitation.', 'Correct mais beaucoup trop solennel entre amis.', 'très soutenu'],
      ['I accept your proposal.', 'Sec : on dirait une négociation.', 'formel'],
      ['Affirmative.', 'Jargon militaire, inadapté (sauf pour plaisanter).', 'inapproprié'],
    ],
    why: 'Le bon registre dépend de la relation : entre proches, une formule soutenue paraît froide ou ironique.',
  },
  {
    id: 'rgb2_info',
    lv: 'B2',
    sit: 'Dans un e-mail formel, vous demandez des informations sur une formation.',
    q: 'Quelle phrase choisir ?',
    o: [
      ['I would be grateful if you could send me further information about the course.', 'Demande polie et formelle (I would be grateful if…).', 'soutenu'],
      ['Send me more info about the course.', 'Impératif + info : trop direct et familier.', 'familier'],
      ['Can you tell me about the course or what?', 'or what est très familier, voire agressif.', 'familier'],
      ['I want informations about the course.', 'Trop direct, et informations est fautif (indénombrable).', 'incorrect'],
    ],
    why: "Formules de demande formelle : I would be grateful if you could…, I would appreciate it if…, Could you possibly…?",
  },
  {
    id: 'rgb2_decline',
    lv: 'B2',
    sit: 'Vous devez refuser poliment l’invitation à dîner de votre directrice.',
    q: 'Quelle réponse convient ?',
    o: [
      ["Thank you so much for inviting me. I'm afraid I already have plans that evening.", 'Remerciement + refus atténué (I’m afraid) : poli et clair.', 'neutre poli'],
      ["No, I can't.", 'Trop abrupt envers une supérieure.', 'abrupt'],
      ["Nah, I'm busy.", 'Nah est très familier.', 'familier'],
      ['I refuse your invitation.', 'refuse est brutal dans ce contexte.', 'inapproprié'],
    ],
    why: "Refus poli : remercier, atténuer (I'm afraid, unfortunately), donner une raison brève.",
  },
  {
    id: 'rgb2_report',
    lv: 'B2',
    sit: 'Dans un rapport professionnel, vous présentez un résultat négatif.',
    q: 'Quelle formulation choisir ?',
    o: [
      ['Sales fell by 12% in the second quarter.', 'Factuel, précis, neutre : le style d’un rapport.', 'neutre'],
      ['Sales went down loads in the second quarter.', 'loads est familier.', 'familier'],
      ['Sales were a total disaster in the second quarter!', 'Exclamatif et émotionnel.', 'émotionnel'],
      ['Sales, well, they kind of dropped in the second quarter.', 'Hésitations de l’oral (well, kind of).', 'oral'],
    ],
    why: 'Un rapport privilégie les faits chiffrés et les verbes précis (fell by, rose to, remained stable).',
  },
  {
    id: 'rgb2_interrupt',
    lv: 'B2',
    sit: 'Vous voulez intervenir pendant une réunion où quelqu’un parle.',
    q: 'Que dites-vous ?',
    o: [
      ['Sorry to interrupt, but could I just add something here?', 'Excuse + demande atténuée (just) : intervention polie.', 'neutre poli'],
      ['Stop talking, I have something to say.', 'Impératif agressif.', 'impoli'],
      ['Wait wait wait!', 'Oral familier, peu professionnel.', 'familier'],
      ['I demand to speak.', 'demand est très autoritaire.', 'inapproprié'],
    ],
    why: "Pour interrompre : Sorry to interrupt, but… / If I could just come in here… / Can I just add…?",
  },
  {
    id: 'rgb2_signoff',
    lv: 'B2',
    sit: 'Vous terminez un e-mail formel qui commence par « Dear Mr Patel ».',
    q: 'Quelle formule finale convient (usage britannique) ?',
    o: [
      ['Yours sincerely,', 'Formule standard quand on connaît le nom du destinataire.', 'formel'],
      ['Cheers,', 'Familier, entre collègues proches.', 'familier'],
      ['Love,', 'Réservé aux proches.', 'intime'],
      ['Yours faithfully,', 'Réservé à « Dear Sir or Madam » (destinataire inconnu).', 'formel (mauvais contexte)'],
    ],
    why: 'Dear Mr Patel → Yours sincerely ; Dear Sir or Madam → Yours faithfully. (Kind regards convient aussi dans un e-mail moins formel.)',
  },
  {
    id: 'rgb2_reassure',
    lv: 'B2',
    sit: 'Vous rassurez un ami inquiet avant un entretien d’embauche.',
    q: 'Que lui dites-vous ?',
    o: [
      ["You'll be fine. You know your stuff.", 'Encourageant et naturel entre amis.', 'familier (adapté)'],
      ['It is highly probable that the outcome will be satisfactory.', 'Ton de rapport, froid et distant.', 'très soutenu'],
      ['Whatever happens, happens.', 'Peut sembler indifférent.', 'maladroit'],
      ["Don't be stupid.", 'Blessant.', 'inapproprié'],
    ],
    why: 'Le registre familier est approprié entre amis ; une formule administrative crée de la distance.',
  },
  {
    id: 'rgb2_essay',
    lv: 'B2',
    sit: 'Dans un essai, vous introduisez un argument opposé au vôtre.',
    q: 'Quelle phrase convient à un écrit argumentatif ?',
    o: [
      ['It could be argued, however, that this approach is too costly.', 'Tournure impersonnelle et nuancée, typique de l’essai.', 'soutenu'],
      ['But some people say it costs too much, you know.', 'you know et But en tête : oral.', 'oral'],
      ['Obviously this is way too expensive.', 'way too est familier ; obviously est trop catégorique.', 'familier'],
      ["I think it's expensive lol.", 'Langage de messagerie.', 'familier'],
    ],
    why: "À l'écrit : It could be argued that…, Some would claim that…, Critics point out that…",
  },
  {
    id: 'rgb2_directions',
    lv: 'B2',
    sit: 'Vous demandez votre chemin à un inconnu dans la rue.',
    q: 'Quelle formule choisir ?',
    o: [
      ['Excuse me, could you tell me the way to the station?', 'Formule polie et standard.', 'neutre poli'],
      ["Where's the station?", 'Compréhensible, mais abrupt sans formule de politesse.', 'direct'],
      ['Oi, station?', 'Très familier et impoli.', 'impoli'],
      ['I would like you to indicate the station to me.', 'Calque du français, artificiel.', 'maladroit'],
    ],
    why: "Avec un inconnu : Excuse me + question indirecte polie (could you tell me…?).",
  },
];

/** Choix commentés de nuance associés aux notions de grammaire B2. */
export const NUANCE_B2: Record<string, InsightItem[]> = {
  past_perfect: [
    {
      id: 'nb2_pp1',
      lv: 'B2',
      q: "Dans quelle phrase Emma était-elle déjà partie quand Tom est arrivé ?",
      o: [
        ['When Tom arrived, Emma had left.', 'Past perfect : le départ d’Emma précède l’arrivée de Tom.'],
        ['When Tom arrived, Emma left.', 'Prétérit : Emma part après l’arrivée de Tom.'],
        ['When Tom arrived, Emma was leaving.', 'Emma était en train de partir : ils se croisent.'],
        ['When Tom had arrived, Emma left.', "L'arrivée de Tom précède le départ d'Emma."],
      ],
      why: 'Le past perfect marque l’antériorité ; le prétérit seul suggère une succession, le past continuous une simultanéité.',
    },
  ],
  modals_past: [
    {
      id: 'nb2_mp1',
      lv: 'B2',
      q: 'Quelle phrase exprime un reproche ?',
      o: [
        ['You should have called me.', 'should have + participe passé : « tu aurais dû ».'],
        ['You must have called me.', 'Déduction : « tu as dû m’appeler ».'],
        ["You can't have called me.", "Impossibilité : « tu n'as pas pu m'appeler »."],
        ["You needn't have called me.", "Tu as appelé, mais c'était inutile."],
      ],
      why: 'should have = reproche / regret ; must have = déduction ; can’t have = impossibilité ; needn’t have = inutilité.',
    },
    {
      id: 'nb2_mp2',
      lv: 'B2',
      q: "Laquelle signifie « Il est possible qu'elle se soit perdue » ?",
      o: [
        ['She may have got lost.', 'may have + participe passé : possibilité sur le passé.'],
        ['She must have got lost.', 'Quasi-certitude.'],
        ["She can't have got lost.", 'Impossibilité.'],
        ['She should have got lost.', 'Non-sens : should have exprime ce qui aurait été souhaitable.'],
      ],
      why: 'Échelle de certitude : must have > may / might / could have > can’t have.',
    },
  ],
  future_perf_cont: [
    {
      id: 'nb2_fp1',
      lv: 'B2',
      q: 'Quelle phrase indique que le rapport sera terminé avant 18 heures ?',
      o: [
        ["I'll have finished the report by 6 pm.", 'will have + participe passé + by : accompli avant 18 h.'],
        ["I'll be finishing the report at 6 pm.", 'Le travail sera en cours à 18 h.'],
        ["I'll finish the report after 6 pm.", 'Après 18 h.'],
        ["I'd finish the report at 6 pm.", 'Conditionnel : il manque une condition.'],
      ],
      why: 'by + futur antérieur = au plus tard à ce moment ; futur continu = en cours à ce moment.',
    },
  ],
  wish_if_only: [
    {
      id: 'nb2_w1',
      lv: 'B2',
      q: 'Quelle phrase exprime un regret sur le passé ?',
      o: [
        ['I wish I had studied medicine.', 'wish + past perfect : regret sur le passé.'],
        ['I wish I studied medicine.', 'Regret présent : je regrette de ne pas être étudiant en médecine.'],
        ['I wish to study medicine.', '« Je souhaite étudier la médecine » : un projet, pas un regret.'],
        ['I hope I studied medicine.', 'Non-sens : hope exprime un espoir sur un fait incertain.'],
      ],
      why: 'wish + prétérit = regret présent ; wish + past perfect = regret passé ; wish to = souhait formel.',
    },
  ],
  mixed_conditionals: [
    {
      id: 'nb2_mc1',
      lv: 'B2',
      q: "Laquelle signifie « Je ne suis pas riche aujourd'hui parce que je n'ai pas investi autrefois » ?",
      o: [
        ['If I had invested back then, I would be rich now.', 'Condition passée → conséquence présente.'],
        ['If I invested now, I would be rich.', 'Hypothèse sur le présent ou l’avenir.'],
        ['If I had invested back then, I would have been rich then.', 'Conséquence située dans le passé.'],
        ['If I invest now, I will be rich.', 'Condition réelle sur l’avenir.'],
      ],
      why: 'Le conditionnel mixte relie une condition passée (had invested) à un résultat présent (would be… now).',
    },
  ],
  passive_advanced: [
    {
      id: 'nb2_pa1',
      lv: 'B2',
      q: "Laquelle signifie « On pense qu'il a menti » ?",
      o: [
        ['He is thought to have lied.', "Infinitif passé : mensonge antérieur à l'opinion."],
        ['He is thought to lie.', '« On pense qu’il ment » (habitude ou présent).'],
        ['He thought he had lied.', 'Il pensait lui-même avoir menti.'],
        ['He is thinking of lying.', 'Il envisage de mentir.'],
      ],
      why: 'be thought / said / believed to have + participe passé = opinion actuelle sur un fait passé.',
    },
  ],
  causative: [
    {
      id: 'nb2_ca1',
      lv: 'B2',
      q: "Dans quelle phrase Paul n'a pas réparé la voiture lui-même ?",
      o: [
        ['Paul had his car repaired.', 'have + objet + participe passé : il l’a fait réparer.'],
        ['Paul had repaired his car.', 'Past perfect : il l’avait réparée lui-même.'],
        ['Paul repaired his car himself.', 'Il l’a réparée lui-même.'],
        ['Paul was repairing his car.', 'Il était en train de la réparer.'],
      ],
      why: "L'ordre des mots change tout : had + objet + participe (causatif) ≠ had + participe + objet (past perfect).",
    },
  ],
  reporting_verbs: [
    {
      id: 'nb2_rv1',
      lv: 'B2',
      q: 'Quelle phrase signifie qu’il a reconnu sa faute ?',
      o: [
        ['He admitted breaking the vase.', 'admit + -ing : reconnaître.'],
        ['He denied breaking the vase.', 'deny : nier.'],
        ['He refused to break the vase.', 'refuse to : refuser de le casser.'],
        ['He promised not to break the vase.', 'promise not to : promettre de ne pas le casser.'],
      ],
      why: 'Les verbes introducteurs résument l’intention du locuteur : admit, deny, refuse, promise…',
    },
  ],
  linking_contrast: [
    {
      id: 'nb2_lc1',
      lv: 'B2',
      q: 'Quelle phrase exprime une concession (« bien que ») ?',
      o: [
        ['Although it was late, we kept talking.', 'although : concession.'],
        ['Because it was late, we kept talking.', 'Cause : illogique ici.'],
        ['As soon as it was late, we kept talking.', 'Temps : illogique.'],
        ['Unless it was late, we kept talking.', 'Condition négative : incohérent.'],
      ],
      why: 'Un connecteur exprime une relation logique : concession (although), cause (because), temps (as soon as), condition (unless).',
    },
  ],
};

export const WRITING_B2: WritingPrompt[] = [
  {
    id: 'wb2_homeworking',
    lv: 'B2',
    title: 'Opinion essay: working from home',
    prompt: "Rédigez un court essai d'opinion (120 à 180 mots) : donnez votre avis, développez deux arguments, prenez en compte un argument opposé et concluez.",
    task: '"Working from home is better than working in an office." Do you agree?',
    min: 120,
    max: 180,
    checks: [
      { id: 'opinion', label: 'Exprimer clairement son opinion', patterns: ['in my opinion', 'in my view', 'I believe', 'I think', 'personally', 'it seems to me', 'I am convinced', "I'm convinced"] },
      { id: 'contrast', label: "Au moins un connecteur d'opposition ou de concession", patterns: ['however', 'although', 'even though', 'on the other hand', 'whereas', 'nevertheless', 'despite', 'in spite of', 'while'] },
      { id: 'support', label: 'Illustrer ou ajouter un argument', patterns: ['for example', 'for instance', 'such as', 'moreover', 'furthermore', 'in addition', 'what is more', 'also'] },
      { id: 'conclusion', label: 'Annoncer la conclusion', patterns: ['to sum up', 'in conclusion', 'all in all', 'on balance', 'overall', 'to conclude', 'all things considered'] },
    ],
    rubric: ['Mon opinion est claire dès l’introduction.', 'Chaque argument est développé et illustré par un exemple.', "J'ai pris en compte au moins un argument opposé.", 'Mes phrases sont variées (longueur, structures, connecteurs).', "J'ai relu les temps, les accords et l'orthographe."],
    phrases: ['In my view, …', 'One major advantage is that …', 'What is more, …', 'On the other hand, it could be argued that …', 'On balance, …'],
    model:
      "In my view, working from home is better for most office workers, although it is not perfect. One major advantage is the time saved. Instead of spending an hour a day in traffic, people can start work earlier, exercise or spend time with their families. What is more, many employees find it easier to concentrate at home, where there are fewer interruptions than in an open-plan office. For instance, writing a report or analysing data often takes less time without colleagues stopping by. On the other hand, it could be argued that working from home makes people feel isolated and that new employees learn less without experienced colleagues around them. This is a real concern, but it can be solved by meeting in the office once or twice a week. On balance, I believe that a flexible arrangement, mainly from home, offers the best of both worlds.",
    why: "Essai d'opinion B2 : introduction avec prise de position, arguments illustrés, concession, conclusion. L'outil vérifie la longueur, les connecteurs et certaines erreurs certaines ; la qualité de l'argumentation relève de votre auto-évaluation.",
  },
  {
    id: 'wb2_complaint',
    lv: 'B2',
    title: 'Formal email: a complaint',
    prompt: "Vous avez séjourné dans un hôtel qui ne correspondait pas à la description du site (chambre bruyante, petit-déjeuner absent). Écrivez au directeur un e-mail formel de réclamation (120 à 180 mots) : présentez les faits et formulez une demande précise.",
    task: 'Write an email to the hotel manager to complain about your stay and ask for compensation.',
    min: 120,
    max: 180,
    checks: [
      { id: 'greeting', label: "Formule d'appel formelle", patterns: ['Dear (Sir|Madam|Mr|Mrs|Ms|Manager)'] },
      { id: 'purpose', label: "Annoncer l'objet du message", patterns: ['I am writing to', "I'm writing to", 'I am writing in', 'I am writing about'] },
      { id: 'request', label: 'Formuler une demande polie', patterns: ['be grateful if', 'I would appreciate', 'could you', 'I would like you to', 'I would like to request', 'I expect'] },
      { id: 'closing', label: 'Formule finale formelle', patterns: ['Yours (sincerely|faithfully)', 'Kind regards', 'Best regards'] },
    ],
    rubric: ['Les faits sont présentés de façon claire et chronologique.', 'Le ton reste ferme mais poli (pas d’insultes, pas d’exagération).', 'Ma demande est précise (remboursement partiel, geste commercial…).', "J'ai évité les contractions et les formules familières.", "J'ai relu l'orthographe et la ponctuation."],
    phrases: ['I am writing to complain about …', 'According to your website, …', 'To make matters worse, …', 'I would be grateful if you could …', 'I look forward to your reply.'],
    model:
      "Dear Sir or Madam,\n\nI am writing to complain about my stay at your hotel from 12 to 15 June. According to your website, the hotel offers quiet rooms and a buffet breakfast. Unfortunately, neither was true in my case. My room was directly above the bar, and the music continued until two o'clock every night, so I was unable to sleep properly. When I mentioned this at reception, I was told that no other rooms were available. To make matters worse, breakfast was not served on two of the three mornings because the kitchen was being renovated, although nobody had informed guests in advance. As a result, I had to pay for breakfast in a nearby café. I would therefore be grateful if you could refund the cost of the breakfasts and offer partial compensation for the disturbance.\n\nI look forward to your reply.\n\nYours faithfully,\nClaire Martin",
    why: "E-mail formel de réclamation : objet clair, faits précis, ton ferme et poli, demande explicite.",
  },
  {
    id: 'wb2_review',
    lv: 'B2',
    title: 'A review',
    prompt: 'Rédigez une critique (120 à 180 mots) d’un film, d’une série ou d’un livre récent : présentez-le brièvement, donnez vos impressions avec des adjectifs précis et dites si vous le recommandez.',
    task: 'Write a review of a film, series or book for an English-language website.',
    min: 120,
    max: 180,
    checks: [
      { id: 'recommend', label: 'Recommander (ou non) explicitement', patterns: ['I would (highly |strongly )?recommend', 'I would not recommend', "I wouldn't recommend", 'worth (seeing|watching|reading)', 'a must-see', 'a must-read', 'give it a miss'] },
      { id: 'adjectives', label: 'Au moins deux adjectifs d’appréciation précis', patterns: ['gripping', 'disappointing', 'outstanding', 'predictable', 'moving', 'impressive', 'dull', 'brilliant', 'stunning', 'convincing', 'thought-provoking', 'hilarious', 'tedious', 'compelling', 'breathtaking', 'well-written'], min: 2 },
      { id: 'contrast', label: 'Nuancer avec un connecteur', patterns: ['however', 'although', 'even though', 'despite', 'in spite of', 'while', 'whereas', 'but'] },
    ],
    rubric: ["Le lecteur comprend de quoi parle l'œuvre sans que je révèle la fin.", 'Mes impressions sont justifiées (jeu des acteurs, intrigue, style…).', 'Je mentionne au moins un point faible ou une réserve.', 'Ma recommandation est claire et adressée à un public précis.', "J'ai relu les temps et l'orthographe."],
    phrases: ['Set in …, the film tells the story of …', 'What makes it special is …', 'The only weakness is that …', 'I would highly recommend it to anyone who …'],
    model:
      "Set in a small fishing village in Scotland, The Quiet Tide tells the story of a teenage girl who discovers that her father has been hiding a secret for twenty years. What makes the film special is the acting: the young lead gives an outstanding performance, and the relationship between father and daughter is deeply moving. The photography is also stunning, with long shots of the stormy coastline that perfectly reflect the characters' emotions. However, the film is not without its faults. The middle section is rather slow, and some viewers may find the ending a little predictable. Despite these weaknesses, it is a gripping and thoughtful drama that stays with you long after the credits roll. I would highly recommend it to anyone who enjoys character-driven stories, but if you are looking for action, you might want to give it a miss.",
    why: 'Critique B2 : présentation, appréciations précises et justifiées, réserve, recommandation ciblée.',
  },
];
