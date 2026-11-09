/**
 * Contenus B2 → C1 : textes exigeants, argumentations, style, registre,
 * implicite, précision lexicale, rédaction. Tous les textes sont originaux.
 */
import type { InsightItem, OrderItem, PassageItem, WritingPrompt } from '@/engine/exercises/advanced';

export const READING_C1: PassageItem[] = [
  {
    id: 'rc1_choice',
    lv: 'C1',
    title: 'The trouble with too much choice',
    genre: 'Essai de vulgarisation',
    text: [
      'For most of the twentieth century, it was taken for granted that more choice meant more freedom, and more freedom meant greater well-being. A supermarket offering forty kinds of jam was assumed to serve its customers better than one offering six. Yet a growing body of research suggests that the relationship between choice and satisfaction is far less straightforward than this.',
      "In one frequently cited experiment, shoppers who were offered a small selection of jams were considerably more likely to buy one than those confronted with a large display. The larger display attracted more attention, but it appeared to paralyse rather than empower. Faced with too many options, people tended to postpone the decision altogether, or to make it and then regret it, haunted by the suspicion that one of the alternatives they had rejected might have been better.",
      'Psychologists distinguish between two broad strategies for making decisions. "Maximisers" try to identify the best possible option and are reluctant to settle for anything less; "satisficers" set themselves a threshold of acceptability and stop searching as soon as something meets it. Somewhat counter-intuitively, maximisers often end up with objectively better outcomes, yet report being less satisfied with them. The time and effort invested in the search seem to raise their expectations, and every rejected option becomes a potential source of regret.',
      'It would be a mistake, however, to conclude that choice is simply harmful. Later attempts to replicate the jam experiment produced mixed results, and the effect appears to depend heavily on context: on how familiar people are with the products, on whether the options are clearly organised, and on how much the decision actually matters to them. Choice overload, in other words, is real but conditional.',
      "What emerges is not an argument against choice, but against the assumption that it can only ever be beneficial. Well-designed choices, limited in number, clearly presented and, where appropriate, accompanied by a sensible default option, may serve people better than an apparently limitless menu. The challenge for policymakers and businesses alike is to offer freedom without imposing the burden of endless deliberation.",
    ].join('\n\n'),
    qs: [
      { q: "What is the writer's main point?", f: 'gist', a: 'Choice is valuable, but more choice is not automatically better.', w: ['People should be given as few choices as possible.', 'Supermarkets deliberately confuse their customers.', 'Satisficers make better decisions than maximisers.'], why: '§5 : « not an argument against choice, but against the assumption that it can only ever be beneficial ».' },
      { q: "According to the experiment described in paragraph 2, the large display…", f: 'detail', a: 'drew more interest but led to fewer purchases.', w: ['led customers to buy several jars.', 'was ignored by most shoppers.', 'made customers more satisfied with their choice.'], why: '« attracted more attention, but it appeared to paralyse rather than empower ».' },
      { q: 'Why are maximisers often less satisfied, according to the text?', f: 'inference', a: 'Their long search raises expectations and multiplies regrets.', w: ['They usually choose worse options than satisficers.', 'They give up before making any decision.', 'They are less familiar with the products.'], why: '« The time and effort invested… raise their expectations, and every rejected option becomes a potential source of regret. »' },
      { q: "'counter-intuitively' (paragraph 3) suggests that the finding…", f: 'vocab', a: 'contradicts what one might expect', w: ['was obtained by chance', 'has never been confirmed', 'is impossible to explain'], why: 'Il est inattendu que de meilleurs résultats objectifs procurent moins de satisfaction.' },
      { q: 'What is the function of paragraph 4?', f: 'structure', a: 'To qualify the argument by showing that the effect depends on context', w: ['To introduce a completely different topic', 'To prove that choice overload does not exist', 'To summarise the jam experiment in more detail'], why: '« It would be a mistake, however… real but conditional » : le paragraphe nuance.' },
      { q: "Which word best describes the writer's tone?", f: 'attitude', a: 'Measured', w: ['Alarmist', 'Sarcastic', 'Indifferent'], why: 'Le texte expose les résultats, puis leurs limites, avant une conclusion nuancée.' },
    ],
    why: "Essai de vulgarisation C1 : suivez la progression (idée reçue, expérience, distinction conceptuelle, nuance, conclusion) et les marqueurs de modalisation (appeared, tended to, somewhat, in other words).",
  },
  {
    id: 'rc1_rewilding',
    lv: 'C1',
    title: 'Letting nature back into the city',
    genre: 'Article (environnement)',
    text: [
      "When the council of a mid-sized English town announced that it would stop mowing a third of its parks, the reaction was swift and largely hostile. Residents complained that the grass looked neglected, that it attracted litter and that it was, quite simply, untidy. Two summers later, the same meadows are buzzing with insects, and the complaints have largely given way to guided walks and school projects.",
      "The policy is part of a broader movement often described as urban rewilding. Its premise is that cities need not be ecological deserts: by allowing some land to return to a wilder state, planting native species and creating corridors that connect green spaces, local authorities can support biodiversity at relatively little cost. Indeed, mowing less frequently can actually save money, although advocates are careful not to present this as the main justification.",
      "The benefits are not only ecological. Trees and vegetation reduce the temperature of surrounding streets during heatwaves, absorb rainwater that would otherwise overwhelm drainage systems, and appear to have measurable effects on residents' mental health. Some studies have found that people living near green spaces report lower levels of stress, although researchers acknowledge that wealthier neighbourhoods tend to be greener, which makes the precise effect difficult to isolate.",
      "Nevertheless, rewilding is not without its critics. Some argue that it can serve as a convenient excuse for cutting maintenance budgets, leaving poorer areas with overgrown verges while wealthier districts keep their manicured lawns. Others point out that \"wild\" spaces may feel unsafe after dark, particularly for women and older residents, unless lighting and paths are carefully designed.",
      "The lesson from the towns that have succeeded seems to be that rewilding works best when it is explained rather than imposed. Signs describing what is being done and why, a few neatly mown paths through the long grass, and the involvement of local schools have done more to change attitudes than any official statement. Nature, it turns out, is easier to accept when people can see that someone is still taking care of it.",
    ].join('\n\n'),
    qs: [
      { q: 'What happened after the council stopped mowing part of its parks?', f: 'detail', a: 'Initial hostility gradually gave way to public interest.', w: ['Residents forced the council to change its policy.', 'The parks were closed to the public.', 'The council doubled its maintenance budget.'], why: '« the complaints have largely given way to guided walks and school projects ».' },
      { q: 'Why are advocates "careful not to present" cost savings as the main justification?', f: 'inference', a: 'Because it could make rewilding look like a mere budget cut', w: ['Because rewilding is actually very expensive', 'Because the savings have never been calculated', 'Because residents are not interested in money'], why: 'Le §4 confirme ce risque : « a convenient excuse for cutting maintenance budgets ».' },
      { q: 'Why is the effect of green spaces on stress "difficult to isolate"?', f: 'inference', a: 'Greener areas also tend to be wealthier, which may itself reduce stress.', w: ['Stress cannot be measured scientifically.', 'Green spaces increase stress during heatwaves.', 'Researchers refused to publish their results.'], why: 'Facteur de confusion : richesse et verdure vont souvent ensemble.' },
      { q: "'manicured lawns' (paragraph 4) are…", f: 'vocab', a: 'carefully maintained, neatly cut lawns', w: ['lawns covered in wild flowers', 'lawns that are closed to the public', 'lawns damaged by drought'], why: 'manicured = soigné, impeccable (par opposition aux talus envahis).' },
      { q: 'Which concern about rewilding is mentioned in the text?', f: 'detail', a: 'Some wild spaces may feel unsafe at night.', w: ['Native species could harm local farms.', 'Insects might spread disease in schools.', 'Rewilding increases the risk of flooding.'], why: '« "wild" spaces may feel unsafe after dark ».' },
      { q: 'According to the final paragraph, what makes rewilding acceptable to residents?', f: 'gist', a: 'Visible signs that the spaces are still being looked after', w: ['Official statements from the government', 'Removing all paths from the meadows', 'Reducing the number of trees'], why: '« Nature… is easier to accept when people can see that someone is still taking care of it. »' },
    ],
    why: 'Article argumenté : distinguez faits, bénéfices, limites méthodologiques (difficult to isolate) et critiques, puis la leçon finale.',
  },
  {
    id: 'rc1_translation',
    lv: 'C1',
    title: 'Will machines make translators obsolete?',
    genre: 'Tribune',
    text: [
      'Few professions have been declared dead as often as translation. Each new generation of software has been greeted with predictions that human translators would soon be redundant, and each time the predictions have proved premature. The latest systems, however, are undeniably impressive: they produce fluent, idiomatic text in seconds, and for many everyday purposes, from reading a foreign news article to understanding a hotel review, they are more than adequate.',
      'Fluency, though, is precisely what makes them dangerous. Older systems produced clumsy sentences whose errors were obvious; their modern successors produce elegant prose whose errors are not. A mistranslated dosage in a medical leaflet, a misplaced negative in a contract or a joke that becomes an insult can all hide behind perfectly natural-sounding English. The reader has no way of knowing that something has gone wrong.',
      'This is why the role of the professional translator is shifting rather than disappearing. Increasingly, translators are employed to "post-edit" machine output: to check, correct and adapt it. Some welcome the change, which allows them to handle larger volumes of routine work; others resent being paid less to take responsibility for errors they did not make.',
      'There remain, moreover, areas where machines struggle. Literature depends on rhythm, ambiguity and cultural allusion; advertising on wordplay; diplomacy on carefully calibrated vagueness. In each case, what matters is not merely what a sentence says but how it will be received by a particular audience, and that requires a kind of judgement that is difficult to automate.',
      'The question, then, is not whether machines will replace translators, but which tasks we are prepared to entrust to them, and who will be held accountable when they get it wrong.',
    ].join('\n\n'),
    qs: [
      { q: 'Why does the writer describe the fluency of modern systems as "dangerous"?', f: 'inference', a: 'Because natural-sounding text can hide serious errors', w: ['Because fluent texts are too long to read', 'Because readers prefer clumsy translations', 'Because fluency makes translation more expensive'], why: '« their modern successors produce elegant prose whose errors are not [obvious] ».' },
      { q: 'What does "post-edit" involve, according to the text?', f: 'detail', a: 'Checking and correcting texts produced by machines', w: ['Translating texts without any software', 'Writing original advertising slogans', 'Teaching machines new languages'], why: '« to check, correct and adapt it ».' },
      { q: 'Why do some translators "resent" post-editing?', f: 'detail', a: 'They earn less while bearing responsibility for machine errors.', w: ['They are not allowed to use computers.', 'They have to work longer hours for the same pay.', 'They are forced to translate literature.'], why: '« paid less to take responsibility for errors they did not make ».' },
      { q: "In paragraph 4, 'carefully calibrated vagueness' refers to…", f: 'vocab', a: 'deliberately imprecise wording chosen with great care', w: ['careless mistakes in official documents', 'a technical measuring device', 'the use of very simple vocabulary'], why: 'En diplomatie, le flou est parfois voulu et soigneusement dosé.' },
      { q: 'What is the purpose of the final paragraph?', f: 'structure', a: 'To reframe the debate around trust and accountability', w: ['To predict the end of the translation profession', 'To recommend a specific piece of software', 'To summarise the history of machine translation'], why: '« The question, then, is not whether… but which tasks… and who will be held accountable ».' },
      { q: "What is the writer's position?", f: 'attitude', a: 'Machines are useful, but human judgement remains essential for certain tasks.', w: ['Machine translation should be banned.', 'Human translators are no longer necessary.', 'Machine translation has made no real progress.'], why: 'Reconnaissance des progrès (§1), mais limites (§2, §4).' },
    ],
    why: 'Tribune C1 : la thèse se construit par concession (undeniably impressive… though) puis reformulation finale du problème.',
  },
];

export const ARGUMENT_C1: PassageItem[] = [
  {
    id: 'ac1_ratings',
    lv: 'C1',
    title: 'In defence of online reviews',
    genre: 'Éditorial',
    text: [
      'Critics of online reviews like to point out that they are easily manipulated: businesses post glowing comments about themselves, competitors post damning ones, and a single disgruntled customer can sink a small restaurant. All of this is true. It does not follow, however, that we would be better off without them.',
      'Before online reviews, consumers relied on advertising, which is written by the seller, and on professional critics, who covered a tiny fraction of the market and whose tastes rarely matched those of ordinary customers. Reviews, for all their flaws, aggregate the experience of thousands of people with no financial stake in the outcome.',
      'The problem, then, is not reviews themselves but the way we read them. A rating of 4.6 based on two thousand reviews tells us far more than a perfect 5.0 based on six. Reading the most critical comments, rather than the most enthusiastic, often reveals whether a complaint concerns something that matters to us.',
      'To abandon reviews because some are fake would be to throw the baby out with the bathwater. What is needed is not less information, but more discerning readers.',
    ].join('\n\n'),
    qs: [
      { q: 'How does the writer respond to the criticism in paragraph 1?', f: 'structure', a: 'By accepting the facts but rejecting the conclusion drawn from them', w: ['By denying that reviews are ever manipulated', 'By changing the subject to advertising', 'By agreeing that reviews should be banned'], why: '« All of this is true. It does not follow, however… » : concession, puis rejet de la conclusion.' },
      { q: 'What comparison supports the value of reviews?', f: 'evidence', a: 'Earlier sources of information were biased or limited.', w: ['Fake reviews are rarer than people think.', 'Professional critics are always wrong.', 'Businesses no longer advertise.'], why: '§2 : publicité rédigée par le vendeur, critiques peu nombreux et éloignés des goûts du public.' },
      { q: 'What does the example of "4.6 based on two thousand reviews" illustrate?', f: 'evidence', a: 'The number of reviews matters as much as the average score.', w: ['High scores are always fake.', 'Customers prefer restaurants with low ratings.', 'Reviews are more reliable when they are short.'], why: 'Un grand nombre d’avis rend la note plus fiable qu’un 5/5 sur six avis.' },
      { q: 'Which assumption underlies the conclusion?', f: 'assumption', a: 'Readers can learn to interpret reviews more critically.', w: ['Fake reviews will soon disappear.', 'Professional critics will return.', 'All consumers already read reviews carefully.'], why: '« What is needed is… more discerning readers » suppose que cette compétence peut s’acquérir.' },
      { q: "'to throw the baby out with the bathwater' means…", f: 'vocab', a: 'to reject something valuable because of its flaws', w: ['to be careless with children', 'to waste water', 'to change one’s mind too quickly'], why: 'Jeter le bébé avec l’eau du bain.' },
    ],
    why: "Argumentation par concession-réfutation : All of this is true. It does not follow, however… Repérez la thèse, les preuves et le présupposé de la conclusion.",
  },
  {
    id: 'ac1_tax',
    lv: 'C1',
    title: 'A tax on sugar is a tax on the poor',
    genre: 'Lettre au rédacteur',
    text: [
      'Your recent editorial called for a heavy tax on sugary drinks, arguing that it would reduce obesity. I disagree, and not only because I enjoy the occasional fizzy drink.',
      'Such taxes are regressive: they take a far larger share of income from poorer households than from wealthy ones. Moreover, the countries that have introduced them have seen consumption fall, but there is little evidence that obesity rates have followed. People simply switch to other sources of sugar.',
      'Supporters of the tax are, of course, well-intentioned. But we should be wary of a policy whose main effect is to make life more expensive for those who can least afford it, while doing little to address the underlying causes of poor diet: long working hours, the cost of fresh food and the lack of time to cook.',
      'Either we tax sugar, or we accept rising obesity; that, at least, is how the debate is usually framed. Surely we can do better than that.',
    ].join('\n\n'),
    qs: [
      { q: "What is the writer's main claim?", f: 'claim', a: 'A sugar tax would hurt poorer people without solving the problem.', w: ['Obesity is not a serious problem.', 'Fizzy drinks are good for health.', 'Fresh food should be taxed instead.'], why: 'Taxe régressive (§2) et inefficace sur l’obésité (§2-3).' },
      { q: 'Which evidence is given against the tax?', f: 'evidence', a: 'Consumption fell elsewhere, but obesity rates did not clearly follow.', w: ['Doctors have proved that sugar is harmless.', 'Poor households drink fewer fizzy drinks.', 'The editorial contained factual errors.'], why: '« consumption fall[s], but there is little evidence that obesity rates have followed ».' },
      { q: "In the final paragraph, what does the writer criticise?", f: 'flaw', a: 'Presenting the issue as a choice between only two options', w: ['Using statistics from other countries', 'Attacking the editor personally', 'Generalising from a single example'], why: 'Le débat présenté comme « soit la taxe, soit l’obésité » est une fausse alternative.' },
      { q: "Why does the writer mention enjoying 'the occasional fizzy drink'?", f: 'tone', a: 'To acknowledge a personal bias with a touch of humour', w: ['To prove that sugar is healthy', 'To show that he is an expert', 'To criticise people who drink water'], why: 'Petite touche d’autodérision qui reconnaît un intérêt personnel.' },
      { q: 'What does "regressive" mean in this context?', f: 'vocab', a: 'weighing more heavily on people with lower incomes', w: ['returning to an earlier situation', 'reducing government revenue', 'becoming weaker over time'], why: 'Un impôt régressif pèse proportionnellement plus sur les bas revenus.' },
    ],
    why: "Lettre argumentée : thèse, preuves, concession (Supporters… are, of course, well-intentioned. But…) et dénonciation d'une fausse alternative.",
  },
];

export const TEXT_ORDER_C1: OrderItem[] = [
  {
    id: 'toc1_essay',
    lv: 'C1',
    title: 'Should university education be free?',
    segs: [
      ['Whether university education should be free is one of the most contested questions in public policy.', "Introduction : enjeu du débat"],
      ['Proponents argue that tuition fees deter talented students from poorer backgrounds and that society as a whole benefits from a more educated population.', 'Arguments en faveur'],
      ['Critics counter that free tuition largely subsidises the middle classes, who are already overrepresented at university.', 'Contre-argument (counter)'],
      ['This objection, however, could be addressed by targeted grants rather than by abandoning the principle altogether.', 'Réfutation (This objection, however)'],
      ['On balance, a system of free tuition combined with means-tested support appears to offer the fairest compromise.', 'Conclusion (On balance)'],
    ],
    why: "Reprise anaphorique (This objection) et connecteurs (counter, however, On balance) fixent l'ordre logique.",
  },
  {
    id: 'toc1_report',
    lv: 'C1',
    title: 'Report: staff survey on remote working',
    segs: [
      ['The purpose of this report is to summarise the results of the recent staff survey on remote working.', 'Objet du rapport'],
      ['A total of 240 employees responded, representing 68% of the workforce.', 'Méthode et échantillon'],
      ['The vast majority of respondents expressed a preference for a hybrid arrangement.', 'Résultat principal'],
      ['However, a significant minority reported difficulties in communicating with their managers.', 'Résultat nuancé (However)'],
      ['It is therefore recommended that managers hold regular one-to-one meetings with remote staff.', 'Recommandation (therefore)'],
    ],
    why: 'Rapport : objet, méthode, résultats, nuance, recommandation.',
  },
  {
    id: 'toc1_paragraph',
    lv: 'C1',
    title: 'The rise of the four-day week',
    segs: [
      ['Interest in the four-day week has grown considerably in recent years.', 'Phrase d’introduction (topic sentence)'],
      ['This trend can be attributed partly to the pandemic, which forced many organisations to rethink their working practices.', 'Explication (This trend)'],
      ['Such experiments have shown that productivity does not necessarily depend on the number of hours worked.', 'Résultat (Such experiments)'],
      ['Nonetheless, the model remains difficult to apply in sectors that require continuous staffing.', 'Limite (Nonetheless)'],
    ],
    why: 'Les reprises (This trend, Such experiments) renvoient à la phrase précédente : elles imposent l’enchaînement.',
  },
];

export const STYLE_C1: InsightItem[] = [
  {
    id: 'stc1_wordy',
    lv: 'C1',
    sit: 'Rapport professionnel. Phrase d’origine :',
    passage: 'Due to the fact that the budget was reduced, we were not in a position to be able to hire new staff at this point in time.',
    q: 'Quelle version est la plus concise, sans perte de sens ?',
    o: [
      ['Because the budget was cut, we could not hire new staff.', 'Concise et précise : due to the fact that → because, not in a position to be able to → could not.'],
      ['Due to the reduced budget fact, we could not be able to hire staff now.', 'Agrammatical (could not be able) et maladroit.'],
      ['Because of the fact of the budget, hiring was not possible to do.', 'Lourd et imprécis.'],
      ['The budget was reduced, so at this point in time we were not in a position to hire.', 'Encore verbeux (at this point in time, not in a position).'],
    ],
    why: 'Concision : supprimer les périphrases (due to the fact that, at this point in time, be in a position to).',
  },
  {
    id: 'stc1_register',
    lv: 'C1',
    sit: 'Essai universitaire. Phrase d’origine :',
    passage: "Loads of studies show that kids who read a lot do way better at school.",
    q: 'Quelle version convient au registre académique ?',
    o: [
      ['Numerous studies have shown that children who read extensively tend to achieve better academic results.', 'Lexique soutenu (numerous, extensively), modalisation (tend to).'],
      ['Lots of research says kids reading loads get better grades.', 'Toujours familier (lots of, kids, loads).'],
      ['It is a fact that all children who read are better at school.', 'Généralisation abusive (all, it is a fact) : imprudent à l’écrit académique.'],
      ['Studies show kids do way better if they read.', 'Familier (kids, way better).'],
    ],
    why: "L'écrit académique exige un lexique neutre et une affirmation nuancée (tend to, suggest).",
  },
  {
    id: 'stc1_repetition',
    lv: 'C1',
    sit: 'Deux phrases consécutives :',
    passage: 'The council approved the new plan last week. The new plan will cost two million pounds, and the new plan will take three years.',
    q: 'Quelle réécriture améliore la cohésion ?',
    o: [
      ['The council approved the new plan last week. The scheme, which will take three years, is expected to cost two million pounds.', 'Reprise par un synonyme (the scheme) et relative : plus de répétition.'],
      ['The council approved it last week. It will cost two million pounds and it will take three years.', 'it au début : on ne sait pas de quoi on parle.'],
      ['The council approved the new plan last week, the new plan will cost two million pounds and take three years.', 'Répétition et virgule fautive (comma splice).'],
      ['The new plan was approved, the new plan costs two million, three years.', 'Agrammatical et répétitif.'],
    ],
    why: 'Cohésion : synonymes, pronoms au bon endroit, subordination.',
  },
  {
    id: 'stc1_passive',
    lv: 'C1',
    sit: 'Compte rendu scientifique. Phrase d’origine :',
    passage: 'We took the samples and then we analysed them and then we compared them with the control group.',
    q: 'Quelle version convient le mieux à un compte rendu scientifique ?',
    o: [
      ['The samples were collected, analysed and compared with the control group.', 'Passif (l’action plutôt que les chercheurs) et énumération sans répétition de then.'],
      ['Samples were took, then analysed and then compared.', 'Participe fautif (took) et répétition de then.'],
      ['We were taking samples and analysing them and comparing them.', 'Progressif inadapté et répétitif.'],
      ['The samples, we analysed them after taking them, compared with the control.', 'Construction disloquée, agrammaticale.'],
    ],
    why: "Le passif et la coordination de participes allègent un compte rendu méthodologique.",
  },
  {
    id: 'stc1_hedge',
    lv: 'C1',
    sit: 'Conclusion d’une étude portant sur 40 participants. Phrase d’origine :',
    passage: 'This study proves that meditation cures anxiety.',
    q: 'Quelle formulation est la plus juste au vu des données ?',
    o: [
      ['These findings suggest that meditation may help to reduce anxiety.', 'Atténuation adaptée (suggest, may help) à un petit échantillon.'],
      ['This study definitely shows that meditation always cures anxiety.', 'Encore plus catégorique : injustifiable avec 40 participants.'],
      ['Meditation is useless for anxiety, according to this study.', 'Contredit l’étude.'],
      ['Maybe meditation is kind of good for anxiety, perhaps.', 'Atténuation redondante et familière (maybe… perhaps, kind of).'],
    ],
    why: 'Une conclusion doit être proportionnée aux preuves : suggest, indicate, may.',
  },
  {
    id: 'stc1_dangling',
    lv: 'C1',
    sit: 'Phrase d’origine :',
    passage: 'Walking into the room, the lights went out.',
    q: 'Quelle correction rend la phrase logique ?',
    o: [
      ['As I walked into the room, the lights went out.', 'Le participe « walking » n’avait pas de sujet logique : les lumières ne marchent pas.'],
      ['Walking into the room, the lights were going out.', 'Même problème de sujet.'],
      ['The lights, walking into the room, went out.', 'Absurde : les lumières ne marchent pas.'],
      ['Walked into the room, the lights went out.', 'Forme fautive et même problème de sujet.'],
    ],
    why: 'Participe « orphelin » (dangling participle) : le sujet sous-entendu doit être celui de la principale.',
  },
  {
    id: 'stc1_parallel',
    lv: 'C1',
    sit: 'Offre d’emploi. Phrase d’origine :',
    passage: 'The successful candidate will be responsible for managing the team, to prepare budgets and the organisation of events.',
    q: 'Quelle version respecte le parallélisme ?',
    o: [
      ['The successful candidate will be responsible for managing the team, preparing budgets and organising events.', 'Trois formes en -ing parallèles après responsible for.'],
      ['The successful candidate will be responsible to manage the team, prepare budgets and organisation of events.', 'responsible to : construction fautive, et parallélisme rompu.'],
      ['The successful candidate will be responsible for managing the team, to prepare budgets and to organise events.', 'Mélange -ing / to : parallélisme rompu.'],
      ['The successful candidate is responsible of management, budgets preparing and events.', 'Préposition fautive (of) et ordre des mots incorrect.'],
    ],
    why: 'Parallélisme : des éléments coordonnés doivent avoir la même forme grammaticale.',
  },
];

export const REGISTER_C1: InsightItem[] = [
  {
    id: 'rgc1_decline',
    lv: 'C1',
    sit: 'Vous refusez, par écrit, une proposition de partenariat d’une entreprise.',
    q: 'Quelle formulation est la plus diplomatique ?',
    o: [
      ['While we appreciate your interest, we have decided not to pursue this opportunity at present.', 'Remerciement, refus net mais courtois, porte entrouverte (at present).'],
      ["We're not interested, sorry.", 'Trop abrupt et familier.'],
      ['Your proposal is unacceptable to us.', 'Inutilement blessant.'],
      ['We would be absolutely thrilled to maybe consider it some day.', 'Ambigu et peu sincère : on ne sait pas s’il s’agit d’un refus.'],
    ],
    why: 'Refus formel : reconnaître, décliner clairement, ménager la relation.',
  },
  {
    id: 'rgc1_complaint',
    lv: 'C1',
    sit: 'Vous signalez à un collègue d’un autre service, que vous connaissez peu, qu’il a oublié de vous transmettre un document.',
    q: 'Quel message envoyez-vous ?',
    o: [
      ["Just a quick reminder: I don't think I've received the budget file yet. Could you send it over when you get a chance?", 'Rappel courtois et atténué (just, I don’t think, when you get a chance).'],
      ['You forgot to send me the budget file. Again.', 'Accusateur et sarcastique.'],
      ['I demand that you send the budget file immediately.', 'Beaucoup trop autoritaire.'],
      ['Where is the file???', 'Abrupt, ponctuation agressive.'],
    ],
    why: 'Entre collègues : atténuer une demande (just, I don’t think, could you…?).',
  },
  {
    id: 'rgc1_academic',
    lv: 'C1',
    sit: 'Dans un article scientifique, vous mentionnez une étude antérieure qui contredit la vôtre.',
    q: 'Quelle formulation convient ?',
    o: [
      ['These results differ from those reported by Smith (2019), possibly owing to differences in sample size.', 'Neutre, factuel, avec une hypothèse explicative prudente.'],
      ['Smith (2019) got it completely wrong.', 'Familier et polémique.'],
      ['Smith (2019) is obviously not a serious researcher.', 'Attaque personnelle, inacceptable.'],
      ['Our results are better than Smith’s, as everyone can see.', 'Arrogant et non argumenté.'],
    ],
    why: "À l'écrit scientifique, on compare les résultats, pas les personnes, et on reste prudent (possibly).",
  },
  {
    id: 'rgc1_toast',
    lv: 'C1',
    sit: 'Vous portez un toast lors du départ à la retraite d’une collègue appréciée.',
    q: 'Quelle formule convient ?',
    o: [
      ["Please raise your glasses to Margaret: we'll miss her wisdom, her kindness and, of course, her legendary biscuits.", 'Chaleureux, avec une touche d’humour adaptée à l’occasion.'],
      ['Margaret is leaving the company with effect from Friday.', 'Ton de note administrative, froid.'],
      ['Bye Margaret, finally!', 'Peut sembler blessant.'],
      ['It is hereby acknowledged that Margaret has completed her service.', 'Juridique et impersonnel.'],
    ],
    why: 'Discours de circonstance : chaleur, anecdote, registre soutenu mais vivant.',
  },
];

export const IMPLICATURE_C1: InsightItem[] = [
  {
    id: 'imc1_meeting',
    lv: 'C1',
    lines: [
      ['Anna', 'Could we perhaps discuss the budget at Thursday’s meeting?'],
      ['Mark', "Thursday's agenda is looking rather full, to be honest."],
    ],
    q: 'Que veut dire Mark ?',
    o: [
      ['He would prefer not to discuss the budget on Thursday.', 'Refus indirect : il ne dit pas non, mais invoque l’ordre du jour chargé.'],
      ['He wants to add the budget to the agenda immediately.', 'Contraire de ce qu’il suggère.'],
      ['He has not seen the agenda yet.', 'Il en parle précisément.'],
      ['He thinks the meeting has been cancelled.', 'Rien ne l’indique.'],
    ],
    why: 'Refus poli par l’évocation d’un obstacle (rather full, to be honest).',
  },
  {
    id: 'imc1_dinner',
    lv: 'C1',
    lines: [
      ['Host', 'So, how did you find the fish?'],
      ['Guest', 'The sauce was absolutely delicious.'],
    ],
    q: 'Que laisse entendre l’invité ?',
    o: [
      ['He did not particularly like the fish itself.', 'Il répond sur la sauce, pas sur le poisson : éloge déplacé qui évite une critique.'],
      ['He thought the whole meal was perfect.', 'Il aurait alors parlé du poisson.'],
      ['He did not understand the question.', 'Il a compris, mais choisit d’esquiver.'],
      ['He wants the recipe for the fish.', 'Rien ne l’indique.'],
    ],
    why: "Esquive polie : complimenter un autre aspect pour ne pas critiquer ce qui est demandé.",
  },
  {
    id: 'imc1_report',
    lv: 'C1',
    lines: [
      ['Manager', "I've read your report. It's certainly… ambitious."],
      ['Analyst', 'Ambitious in a good way?'],
      ['Manager', "Let's say it raises a few questions we'll need to look at together."],
    ],
    q: 'Quel est l’avis réel de la responsable ?',
    o: [
      ['She has serious reservations about the report.', 'certainly… ambitious, raises a few questions : critique atténuée.'],
      ['She thinks the report is excellent.', 'Elle ne confirme pas « in a good way ».'],
      ['She has not finished reading it.', 'Elle dit l’avoir lu.'],
      ['She wants the analyst to write a longer report.', 'Rien ne l’indique.'],
    ],
    why: 'Litote professionnelle : ambitious, raises a few questions = réserves sérieuses.',
  },
  {
    id: 'imc1_party',
    lv: 'C1',
    lines: [
      ['Tom', 'Are you coming to Jake’s party on Saturday?'],
      ['Sara', "I've got a really early start on Sunday."],
    ],
    q: 'Que répond Sara ?',
    o: [
      ['She probably won’t go, or won’t stay late.', 'Elle invoque une contrainte au lieu de répondre oui : refus implicite.'],
      ['She will definitely go to the party.', 'Elle aurait simplement dit oui.'],
      ['She is working at the party.', 'Rien ne l’indique.'],
      ['She does not know Jake.', 'Rien ne l’indique.'],
    ],
    why: 'Réponse indirecte : une contrainte évoquée vaut souvent refus (implicature conversationnelle).',
  },
  {
    id: 'imc1_email',
    lv: 'C1',
    passage: "As per my previous email, the deadline was Friday.",
    sit: 'Phrase reçue dans un e-mail professionnel.',
    q: 'Quel ton perçoit-on ?',
    o: [
      ['A hint of irritation: the reader should have known already.', 'As per my previous email rappelle sèchement une information déjà donnée.'],
      ['Gratitude for a quick reply.', 'Aucun remerciement.'],
      ['Enthusiasm about the project.', 'Rien d’enthousiaste.'],
      ['An apology for a mistake.', 'C’est plutôt un reproche voilé.'],
    ],
    why: 'Formule polie en surface, mais souvent perçue comme un reproche.',
  },
  {
    id: 'imc1_feedback',
    lv: 'C1',
    lines: [
      ['Student', 'Did you have a chance to look at my essay?'],
      ['Tutor', "I did. You clearly put a lot of work into the introduction."],
    ],
    q: 'Que suggère la tutrice ?',
    o: [
      ['The rest of the essay is weaker than the introduction.', "Elle ne loue que l'introduction : le reste pose problème."],
      ['The essay is too short.', 'Rien ne l’indique.'],
      ['The student should remove the introduction.', 'Contraire de son compliment.'],
      ['She has not read the essay.', 'Elle dit l’avoir lu.'],
    ],
    why: 'Éloge ciblé : ce qui n’est pas mentionné est implicitement critiqué.',
  },
];

export const DIALOGUE_C1: PassageItem[] = [
  {
    id: 'dc1_negotiation',
    lv: 'C1',
    title: 'Renegotiating a contract',
    genre: 'Négociation',
    lines: [
      ['Supplier', "We've had to revise our prices slightly, I'm afraid. Costs have gone up across the board."],
      ['Buyer', "I understand. Although 'slightly' is an interesting way to describe twelve per cent."],
      ['Supplier', "Fair point. But you'll appreciate that we've absorbed increases for two years without passing them on."],
      ['Buyer', "We do appreciate that. Equally, you'll appreciate that we have other suppliers knocking at the door."],
      ['Supplier', "Perhaps we could look at a longer contract in exchange for a smaller increase?"],
      ['Buyer', "Now that's a conversation I'd be happy to have."],
    ],
    qs: [
      { q: "What does the buyer imply with 'an interesting way to describe twelve per cent'?", f: 'tone', a: 'That the increase is far from slight', w: ['That twelve per cent is a reasonable figure', 'That she finds the supplier’s vocabulary impressive', 'That she misheard the figure'], why: 'Ironie : « interesting » souligne l’euphémisme du fournisseur.' },
      { q: 'What is the buyer doing when she mentions "other suppliers knocking at the door"?', f: 'function', a: 'Reminding the supplier that she could go elsewhere', w: ['Inviting the supplier to meet other suppliers', 'Apologising for being late', 'Announcing that she has already signed elsewhere'], why: 'Pression implicite : elle a des alternatives.' },
      { q: "How does the buyer use the supplier's phrase 'you'll appreciate'?", f: 'tone', a: 'She repeats it to turn his argument back on him.', w: ['She corrects his grammar.', 'She agrees with everything he says.', 'She changes the subject.'], why: 'Reprise en miroir (Equally, you’ll appreciate…).' },
      { q: 'What does the supplier propose at the end?', f: 'detail', a: 'A smaller increase in return for a longer commitment', w: ['Cancelling the contract', 'Keeping prices unchanged for ever', 'Doubling the order'], why: '« a longer contract in exchange for a smaller increase ».' },
      { q: "'Now that's a conversation I'd be happy to have' signals…", f: 'function', a: 'willingness to negotiate on these terms', w: ['the end of the negotiation', 'a refusal to continue', 'a change of topic'], why: 'Signal d’ouverture : la proposition l’intéresse.' },
    ],
    why: 'Négociation C1 : euphémisme, ironie, reprise en miroir, contreparties.',
  },
  {
    id: 'dc1_interview',
    lv: 'C1',
    title: 'A difficult interview',
    genre: 'Interview radio',
    lines: [
      ['Presenter', 'Minister, can you guarantee that no hospitals will close?'],
      ['Minister', "What I can guarantee is that patient safety will remain our absolute priority."],
      ['Presenter', "That isn't quite what I asked."],
      ['Minister', "With respect, the question assumes that closures are on the table, and that's simply not the framing we're working with."],
      ['Presenter', "So is that a yes or a no?"],
      ['Minister', "It's a recognition that the situation is more complex than a yes or a no."],
    ],
    qs: [
      { q: "What is the minister doing in his first answer?", f: 'function', a: 'Avoiding the question by answering a different one', w: ['Giving a clear guarantee', 'Announcing hospital closures', 'Apologising for past mistakes'], why: 'Il remplace la question (fermetures) par une autre (sécurité des patients).' },
      { q: "'That isn't quite what I asked' is…", f: 'tone', a: 'a polite but firm way of pointing out the evasion', w: ['an apology', 'a compliment', 'a change of subject'], why: 'Litote : « pas tout à fait » = vous n’avez pas répondu.' },
      { q: "What does 'that's not the framing we're working with' suggest?", f: 'inference', a: 'The minister refuses the terms of the question without denying closures.', w: ['The minister confirms that no hospital will close.', 'The minister admits that closures are planned.', 'The minister did not hear the question.'], why: 'Il conteste la formulation, sans démentir.' },
      { q: "Why might listeners find the last answer unsatisfactory?", f: 'inference', a: 'It still does not say whether hospitals will close.', w: ['It is too long and detailed.', 'It contains a factual error.', 'It is impolite to the presenter.'], why: 'La réponse reste évasive.' },
      { q: "Which word best describes the presenter's attitude?", f: 'tone', a: 'Persistent', w: ['Hostile', 'Uninterested', 'Apologetic'], why: 'Il revient deux fois sur sa question, sans agressivité.' },
    ],
    why: 'Discours politique : repérer l’esquive, le recadrage de la question et la reformulation.',
  },
];

/** Précision lexicale : synonymes proches, collocations. */
export const PRECISION_C1: InsightItem[] = [
  { id: 'pr1', lv: 'C1', passage: 'The government has ___ a new tax on sugary drinks.', q: 'Quel verbe convient ?', o: [['imposed', 'impose a tax : instaurer, imposer une taxe.'], ['imported', 'import : importer des marchandises.'], ['enforced', 'enforce : faire appliquer une règle existante, pas créer une taxe.'], ['obliged', 'oblige somebody to do something : ne s’emploie pas avec une taxe.']], why: 'Collocation : impose a tax / a ban / restrictions.' },
  { id: 'pr2', lv: 'C1', passage: 'The report ___ the importance of early diagnosis.', q: 'Quel verbe convient ?', o: [['highlights', 'highlight : mettre en évidence, souligner.'], ['enlightens', 'enlighten somebody : éclairer quelqu’un (sur un sujet).'], ['lights up', 'light up : illuminer, au sens propre.'], ['outstands', 'N’existe pas comme verbe (outstanding est un adjectif).']], why: 'highlight / stress / emphasise the importance of.' },
  { id: 'pr3', lv: 'C1', passage: 'Prices have ___ by 20% since January.', q: 'Quel verbe convient ?', o: [['risen', 'rise (intransitif) : augmenter.'], ['raised', 'raise est transitif : the company raised its prices.'], ['arisen', 'arise : surgir (un problème, une question).'], ['aroused', 'arouse : susciter (un sentiment, un soupçon).']], why: 'rise / rose / risen (sans complément) ; raise / raised / raised (avec complément).' },
  { id: 'pr4', lv: 'C1', passage: 'She was ___ by the news of his sudden death.', q: 'Quel adjectif convient ?', o: [['devastated', 'devastated : anéanti(e), profondément bouleversé(e).'], ['devastating', '-ing : qui bouleverse (c’est la nouvelle qui est devastating).'], ['deceived', 'deceive : tromper (faux ami de « décevoir »).'], ['ruined', 'ruined s’emploie pour des choses (ruined plans, a ruined building).']], why: '-ed : ce que l’on ressent ; -ing : ce qui provoque le sentiment.' },
  { id: 'pr5', lv: 'C1', passage: 'Could you ___ me of the meeting tomorrow morning?', q: 'Quel verbe convient ?', o: [['remind', 'remind somebody of / about something : rappeler à quelqu’un.'], ['remember', 'remember : se souvenir soi-même.'], ['recall', 'recall : se remémorer, pas rappeler à quelqu’un.'], ['memorise', 'memorise : apprendre par cœur.']], why: 'remind (faire penser à quelqu’un) ≠ remember (se souvenir).' },
  { id: 'pr6', lv: 'C1', passage: "The witness's ___ was crucial to the case.", q: 'Quel nom convient ?', o: [['testimony', 'testimony : témoignage (notamment en justice).'], ['testament', 'testament : dernières volontés, ou preuve de (a testament to).'], ['witnessing', 'witnessing : le fait d’assister à quelque chose.'], ['attestment', 'N’existe pas en anglais.']], why: 'give testimony / testimony in court.' },
  { id: 'pr7', lv: 'C1', passage: 'We must ___ the risk of a cyberattack.', q: 'Quel verbe convient ?', o: [['minimise', 'minimise the risk : réduire au minimum.'], ['minimalise', 'N’existe pas en anglais standard.'], ['shorten', 'shorten : raccourcir (une durée, une longueur).'], ['lessen down', 'lessen ne se construit pas avec down.']], why: 'minimise / reduce / mitigate a risk.' },
  { id: 'pr8', lv: 'C1', passage: 'The film is ___ on a true story.', q: 'Quel mot convient ?', o: [['based', 'be based on : être tiré de, s’inspirer de.'], ['founded', 'found : fonder (une institution) ; founded on s’emploie pour des principes.'], ['inspired', 'inspired se construit avec by, pas on.'], ['drawn', 'drawn se construit avec from (drawn from real events).']], why: 'Choisir le mot en fonction de la préposition imposée (on).' },
  { id: 'pr9', lv: 'C1', passage: 'The company ___ its losses on the economic crisis.', q: 'Quel verbe convient ?', o: [['blamed', 'blame something on something : imputer à.'], ['accused', 'accuse somebody of something.'], ['reproached', 'reproach somebody for something.'], ['charged', 'charge somebody with a crime.']], why: 'Chaque verbe a sa construction : blame X on Y / blame Y for X.' },
  { id: 'pr10', lv: 'C1', passage: 'He made a ___ remark that offended several guests.', q: 'Quel adjectif convient ?', o: [['tactless', 'tactless : qui manque de tact.'], ['tactful', 'tactful : plein de tact (sens inverse).'], ['tactical', 'tactical : tactique, stratégique.'], ['tasteful', 'tasteful : de bon goût (sens inverse).']], why: 'Suffixes -less (sans) / -ful (avec) : attention au sens.' },
];

/** Nuances associées aux notions de grammaire C1. */
export const NUANCE_C1: Record<string, InsightItem[]> = {
  inversion_negative: [
    { id: 'nc1_inv1', lv: 'C1', q: 'Quelle phrase est correcte ?', o: [['Not only did she win the race, she also broke the record.', 'Inversion avec did après Not only en tête.'], ['Not only she won the race, she also broke the record.', 'Il manque l’inversion.'], ['Not only won she the race, she also broke the record.', 'Inversion sans auxiliaire : impossible avec un verbe lexical.'], ['Not only she did win the race, she also broke the record.', 'L’auxiliaire doit précéder le sujet.']], why: "Après un adverbe négatif en tête, l'auxiliaire précède le sujet ; avec un verbe lexical au prétérit, on emploie did." },
  ],
  cleft_sentences: [
    { id: 'nc1_cl1', lv: 'C1', q: "Quelle phrase met l'accent sur « Paul » (et non sur une autre personne) ?", o: [['It was Paul who called you.', 'Phrase clivée : c’est Paul (et personne d’autre).'], ['Paul called you.', 'Phrase neutre, sans mise en relief.'], ['What Paul did was call you.', "Met en relief l’action (appeler), pas la personne."], ['Paul did call you.', 'Insiste sur la réalité de l’action, pas sur la personne.']], why: 'It + be + élément + who/that met en relief l’élément ; What… is met en relief une action ou une chose.' },
  ],
  participle_clauses: [
    { id: 'nc1_pc1', lv: 'C1', q: 'Quelle phrase indique que la lettre a été lue AVANT la réponse ?', o: [['Having read the letter, she replied immediately.', 'Having + participe : antériorité.'], ['Reading the letter, she smiled.', 'Simultanéité : en lisant.'], ['Read by thousands, the letter went viral.', 'Participe passé : sens passif.'], ['She replied, reading the letter.', 'Simultanéité : elle répond en lisant.']], why: 'Having done = action antérieure ; -ing = simultanée ; participe passé = passif.' },
  ],
  hedging: [
    { id: 'nc1_hd1', lv: 'C1', q: 'Quelle phrase est la plus prudente ?', o: [['The data would seem to suggest a link.', 'Double atténuation (would seem, suggest) : prudence maximale.'], ['The data proves a link.', 'Catégorique.'], ['The data clearly shows a link.', 'Affirmation forte.'], ['There is obviously a link.', 'Très catégorique.']], why: 'Degré d’affirmation : prove > clearly show > suggest > would seem to suggest.' },
  ],
  modals_nuance: [
    { id: 'nc1_mn1', lv: 'C1', q: 'Quelle phrase signifie « autant prendre un taxi (faute de mieux) » ?', o: [['We might as well take a taxi.', 'might as well : solution par défaut.'], ['We might well take a taxi.', 'might well : il est fort possible que nous prenions un taxi.'], ['We are bound to take a taxi.', 'be bound to : c’est certain.'], ['We are supposed to take a taxi.', 'be supposed to : c’est prévu, attendu.']], why: 'Un seul mot change tout : as well (autant) / well (bien possible).' },
  ],
};

export const WRITING_C1: WritingPrompt[] = [
  {
    id: 'wc1_essay',
    lv: 'C1',
    title: 'Discursive essay: technology and attention',
    prompt: "Rédigez un essai argumentatif (220 à 280 mots). Présentez les deux côtés de la question, prenez position, nuancez votre propos et concluez. Variez les structures (inversion, phrase clivée, proposition participiale…).",
    task: 'Some argue that digital technology is damaging our ability to concentrate. Discuss.',
    min: 220,
    max: 280,
    checks: [
      { id: 'hedge', label: 'Nuancer (au moins deux marqueurs)', patterns: ['arguably', 'to some extent', 'to a certain extent', 'it could be argued', 'it would seem', 'it would appear', 'tend to', 'tends to', 'may well', 'might well', 'appears to', 'seems to'], min: 2 },
      { id: 'contrast', label: 'Concession / opposition', patterns: ['however', 'nevertheless', 'nonetheless', 'although', 'even though', 'whereas', 'while', 'admittedly', 'that said', 'despite', 'in spite of'] },
      { id: 'advanced', label: 'Au moins une structure avancée (inversion, clivée, participiale)', patterns: ['not only (do|does|did|is|are|was|were|has|have|can|will)', 'never (have|has|had|did|do|does) ', 'rarely (do|does|did|is|are|have|has)', 'little do', 'what [a-z]+ (is|was) ', 'it is [a-z ]+ that', 'having [a-z]+ed', 'having been'] },
      { id: 'conclusion', label: 'Conclure', patterns: ['in conclusion', 'to conclude', 'on balance', 'all things considered', 'ultimately', 'in short', 'all in all'] },
    ],
    rubric: ['La problématique est clairement posée dès l’introduction.', 'Les deux points de vue sont présentés équitablement avant que je prenne position.', 'Chaque paragraphe a une idée directrice, illustrée de façon précise.', 'Le registre est soutenu et homogène (pas de familiarités).', 'J’ai varié les structures sans nuire à la clarté.', 'J’ai relu la ponctuation, les accords et les temps.'],
    phrases: ['It is often claimed that…', 'There is some truth in this view; however, …', 'What is less often acknowledged is that…', 'Not only does…, but it also…', 'On balance, it would seem that…'],
    model:
      "It is often claimed that smartphones and social media are eroding our capacity to concentrate. There is undeniably some truth in this view. Notifications interrupt us constantly, and many people admit that they find it harder to read a book for an hour than they once did. Not only do frequent interruptions fragment our attention, but they also train us to expect novelty every few minutes, which makes sustained effort feel increasingly uncomfortable.\n\nHowever, it would be simplistic to blame technology alone. What has changed is not merely the tools we use but the way we use them. The same device that distracts one person allows another to follow a lecture, consult an archive or learn a language. Having grown up with these tools, many young people have developed strategies to manage them, from switching off notifications to using apps that block distracting websites. Moreover, complaints about declining attention are hardly new: similar fears were expressed about television, and even about the spread of cheap novels in the nineteenth century.\n\nAdmittedly, the scale and design of today's platforms make the problem more acute, since many are deliberately built to capture as much of our time as possible. To some extent, then, the concern is justified. Yet the solution arguably lies less in rejecting technology than in learning to use it deliberately, both at school and at work.\n\nOn balance, digital technology tends to make concentration more difficult, but it does not make it impossible. The challenge is to ensure that we remain in control of our tools rather than the reverse.",
    why: "Essai C1 : problématique, examen équitable des deux positions, prise de position nuancée, structures variées, conclusion. Seuls les éléments formels sont vérifiés automatiquement.",
  },
  {
    id: 'wc1_proposal',
    lv: 'C1',
    title: 'Proposal: improving staff well-being',
    prompt: 'Rédigez une proposition formelle (220 à 280 mots) adressée à votre direction pour améliorer le bien-être au travail : situation actuelle, propositions concrètes, bénéfices attendus, conclusion.',
    task: 'Write a proposal for your company’s management suggesting ways to improve staff well-being.',
    min: 220,
    max: 280,
    checks: [
      { id: 'purpose', label: "Annoncer l'objet de la proposition", patterns: ['the (aim|purpose) of this proposal', 'this proposal (aims|sets out|outlines)', 'the aim of this', 'the purpose of this'] },
      { id: 'recommend', label: 'Formuler des recommandations', patterns: ['I would (therefore )?recommend', 'it is recommended', 'I would suggest', 'it is suggested', 'I propose', 'we should consider'] },
      { id: 'formal', label: 'Formulation soutenue (au moins deux)', patterns: ['in addition', 'furthermore', 'moreover', 'consequently', 'therefore', 'with regard to', 'in terms of', 'as a result'], min: 2 },
      { id: 'benefit', label: 'Présenter les bénéfices attendus', patterns: ['benefit', 'would (help|enable|allow|improve|reduce)', 'likely to (improve|reduce|increase)', 'lead to'] },
    ],
    rubric: ['Les intertitres ou paragraphes structurent clairement la proposition.', 'Les propositions sont concrètes et réalistes.', 'Les bénéfices sont justifiés.', 'Le ton est formel, positif et persuasif.', "J'ai évité les contractions et le vocabulaire familier.", "J'ai relu l'orthographe et la ponctuation."],
    phrases: ['The aim of this proposal is to…', 'At present, …', 'I would therefore recommend that…', 'This would enable staff to…', 'In conclusion, implementing these measures would…'],
    model:
      "Introduction\nThe aim of this proposal is to outline practical measures that would improve staff well-being and, consequently, productivity and retention.\n\nCurrent situation\nThe recent staff survey revealed that over half of employees feel under considerable pressure, and sick leave has risen by fifteen per cent over the past year. Many respondents mentioned excessive email traffic outside working hours and a lack of quiet spaces in the office.\n\nRecommendations\nFirstly, I would recommend introducing a clear policy discouraging emails after 7 p.m. and at weekends, except in genuine emergencies. Secondly, one of the meeting rooms on the second floor could be converted into a quiet room where staff can concentrate or take a short break. In addition, I would suggest offering flexible start times, which would allow employees to avoid the busiest commuting hours. Finally, managers should receive brief training in recognising the early signs of stress, so that problems can be addressed before they escalate.\n\nExpected benefits\nThese measures would require only modest investment. With regard to costs, the conversion of the meeting room could be carried out within the existing maintenance budget. In terms of benefits, they are likely to reduce absenteeism, improve concentration and make the company more attractive to new recruits. Furthermore, they would demonstrate that management takes staff concerns seriously.\n\nConclusion\nIn conclusion, implementing these relatively simple changes would benefit both employees and the organisation. I would be happy to discuss these proposals in more detail.",
    why: 'Proposition formelle : structure en sections, recommandations concrètes, justification des bénéfices, registre soutenu.',
  },
  {
    id: 'wc1_letter',
    lv: 'C1',
    title: 'Letter to the editor',
    prompt: "Un journal local a publié un article favorable à la fermeture de la bibliothèque municipale pour faire des économies. Rédigez une lettre au rédacteur (220 à 280 mots) pour défendre une position argumentée.",
    task: 'Write a letter to the editor responding to an article that supported closing the local library to save money.',
    min: 220,
    max: 280,
    checks: [
      { id: 'greeting', label: "Formule d'appel adaptée", patterns: ['Dear (Sir|Madam|Editor)', 'Dear Sir or Madam'] },
      { id: 'reference', label: "Faire référence à l'article", patterns: ['your (recent )?article', 'your editorial', 'the article', 'your (recent )?piece'] },
      { id: 'concession', label: 'Concéder un point avant de réfuter', patterns: ['admittedly', 'it is true that', 'while it is true', 'of course', 'granted', 'I accept that', 'I recognise that', 'I recognize that'] },
      { id: 'closing', label: 'Formule finale formelle', patterns: ['Yours (faithfully|sincerely)'] },
    ],
    rubric: ['Ma position est claire dès le premier paragraphe.', 'Je réfute les arguments de l’article plutôt que de les ignorer.', 'Mes arguments sont étayés par des exemples précis.', 'Le ton est ferme mais courtois.', 'La conclusion propose une alternative ou un appel à l’action.', "J'ai relu la langue et la ponctuation."],
    phrases: ['I am writing in response to your recent article on…', 'While it is true that…, it does not follow that…', 'Far from being…, the library…', 'Surely a more sensible approach would be to…'],
    model:
      "Dear Sir or Madam,\n\nI am writing in response to your recent article arguing that the town library should be closed in order to save money. While I understand the financial pressures facing the council, I believe that closing the library would be a false economy.\n\nYour article suggests that libraries have become irrelevant because most information is now available online. Admittedly, fewer people borrow reference books than they did twenty years ago. It does not follow, however, that the library has lost its purpose. On any weekday afternoon, it is full of students revising, job seekers using the computers and elderly residents attending reading groups. For many of them, it is the only warm, quiet and free public space in the town.\n\nFurthermore, the savings mentioned in the article appear to be overstated. The building would still need to be maintained, and some services, such as help with online forms, would simply be transferred to other council departments at additional cost.\n\nFar from being a luxury, the library supports literacy, digital inclusion and social contact, all of which reduce pressure on other public services in the long term. Surely a more sensible approach would be to explore alternatives, such as sharing the building with other community services or reducing opening hours slightly, rather than closing it altogether.\n\nI would urge the council, and your readers, to consider what the town would lose before making a decision that would be very difficult to reverse.\n\nYours faithfully,\nDaniel Hughes",
    why: 'Lettre au rédacteur : référence à l’article, concession puis réfutation, arguments étayés, alternative proposée.',
  },
];
