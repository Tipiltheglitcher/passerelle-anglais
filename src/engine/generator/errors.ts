/**
 * Catalogue des erreurs typiques (en particulier celles des francophones).
 * Chaque distracteur généré porte une étiquette ; quand l'apprenant choisit ou
 * écrit une forme erronée connue, l'explication ciblée correspondante s'affiche
 * et l'erreur est comptabilisée dans ses « difficultés principales ».
 */
export interface ErrorTagInfo {
  label: string;
  explanation: string;
}

export const ERROR_TAGS: Record<string, ErrorTagInfo> = {
  s3_missing: {
    label: 'Oubli du -s à la 3ᵉ personne',
    explanation: "Au présent simple, avec he, she, it (ou un nom singulier), le verbe prend un -s : she works, Tom plays.",
  },
  s3_spelling: {
    label: 'Orthographe du -s (3ᵉ personne)',
    explanation: "-es après s, ss, sh, ch, x, o (watches, goes) ; consonne + y → -ies (studies) ; mais voyelle + y → -s (plays).",
  },
  s3_extra: {
    label: '-s ajouté au mauvais endroit',
    explanation: "Le -s n'apparaît qu'à la 3ᵉ personne du singulier. Avec I, you, we, they : pas de -s.",
  },
  be_plus_base: {
    label: '« be » + verbe au présent simple',
    explanation: "On ne met pas « be » devant un verbe au présent simple : ✗ I am work → ✓ I work. « be » sert au présent continu (I am working).",
  },
  do_support: {
    label: 'Auxiliaire do/does/did oublié',
    explanation: "Au présent simple et au prétérit, la négation et la question se construisent avec do/does/did : She doesn't like…, Did you see…?",
  },
  do_wrong_person: {
    label: 'do / does mal choisi',
    explanation: "does avec he, she, it (3ᵉ pers. du singulier) ; do avec I, you, we, they.",
  },
  aux_plus_inflected: {
    label: 'Verbe conjugué après do/does/did',
    explanation: "Après do, does, did (et après un modal), le verbe reste à la base verbale : she doesn't like (✗ likes), did you go (✗ went).",
  },
  be_wrong_form: {
    label: 'Forme de « be » incorrecte',
    explanation: "Présent : I am, he/she/it is, you/we/they are. Passé : I/he/she/it was, you/we/they were.",
  },
  continuous_missing_be: {
    label: 'Auxiliaire be manquant (forme continue)',
    explanation: "La forme continue se construit avec be + verbe-ing : she is working, they were sleeping.",
  },
  continuous_missing_ing: {
    label: 'Forme -ing manquante',
    explanation: "Après be (forme continue), le verbe prend -ing : I am reading (✗ I am read).",
  },
  ing_spelling: {
    label: 'Orthographe de -ing',
    explanation: "Verbe en -e : on retire le e (make → making) ; consonne finale doublée après voyelle accentuée (run → running, swim → swimming) ; -ie → -ying (lie → lying).",
  },
  stative_continuous: {
    label: "Verbe d'état à la forme continue",
    explanation: "Les verbes d'état (like, love, want, know, understand, need, prefer, believe…) s'emploient au présent simple : I know (✗ I am knowing).",
  },
  tense_simple_vs_cont: {
    label: 'Présent simple / présent continu',
    explanation: "Présent simple : habitudes, vérités, emploi du temps (every day, usually). Présent continu : action en cours ou temporaire (now, at the moment, today).",
  },
  ed_spelling: {
    label: 'Orthographe de -ed',
    explanation: "Verbe en -e : + d (like → liked) ; consonne + y → -ied (study → studied) ; consonne finale doublée après voyelle courte accentuée (stop → stopped, plan → planned).",
  },
  irregular_past: {
    label: 'Verbe irrégulier au prétérit',
    explanation: "Ce verbe est irrégulier : il faut connaître sa forme de prétérit (go → went, buy → bought…). Révisez la liste des verbes irréguliers.",
  },
  tense_past: {
    label: 'Prétérit attendu',
    explanation: "Pour une action terminée à un moment passé (yesterday, last week, … ago, in 2019), on emploie le prétérit : base + -ed ou forme irrégulière.",
  },
  have_wrong_person: {
    label: 'have / has mal choisi',
    explanation: "has avec he, she, it (3ᵉ pers. du singulier) ; have avec I, you, we, they.",
  },
  irregular_pp: {
    label: 'Participe passé irrégulier',
    explanation: "Present perfect = have/has + participe passé (3ᵉ colonne) : go → gone, see → seen, write → written.",
  },
  past_vs_pp: {
    label: 'Prétérit / participe passé confondus',
    explanation: "Prétérit (2ᵉ colonne) pour le past simple : I saw. Participe passé (3ᵉ colonne) après have/has : I have seen.",
  },
  pp_finished_time: {
    label: 'Present perfect avec un moment passé précis',
    explanation: "Avec un moment terminé et daté (yesterday, last week, in 2019, … ago), on emploie le prétérit, jamais le present perfect.",
  },
  pp_needed: {
    label: 'Present perfect attendu',
    explanation: "Pour une expérience (ever, never), un résultat présent (just, already, yet) ou une durée qui continue (for, since), on emploie le present perfect.",
  },
  present_with_since: {
    label: 'Présent avec for/since (calque du français)',
    explanation: "« J'habite ici depuis 2010 » se dit avec le present perfect : I have lived here since 2010 (✗ I live here since 2010).",
  },
  for_since: {
    label: 'for / since confondus',
    explanation: "for + durée (for three years, for a week) ; since + point de départ (since 2015, since Monday).",
  },
  been_gone: {
    label: 'been / gone',
    explanation: "been to : on y est allé et revenu (expérience). gone to : on y est parti et on y est encore.",
  },
  just_already_yet: {
    label: 'just / already / yet',
    explanation: "just (à l'instant) et already (déjà) se placent entre have et le participe ; yet (encore, déjà) se met en fin de phrase négative ou interrogative.",
  },
  past_cont_vs_simple: {
    label: 'Past continuous / past simple',
    explanation: "Past continuous pour l'action en cours (le décor) ; past simple pour l'action courte qui l'interrompt : I was cooking when the phone rang.",
  },
  used_to_form: {
    label: 'Forme de used to',
    explanation: "Affirmatif : used to + base. Négatif et question avec did : didn't use to, did you use to…?",
  },
  will_to: {
    label: '« to » après will',
    explanation: "Après will (et tous les modaux), le verbe est à la base sans to : it will rain (✗ will to rain).",
  },
  will_inflected: {
    label: 'Verbe conjugué après will',
    explanation: "Après will, la base verbale ne change jamais : she will go (✗ will goes, ✗ will went).",
  },
  going_to_form: {
    label: 'Forme de be going to',
    explanation: "be (am/is/are) + going to + base verbale : I'm going to visit, she isn't going to buy.",
  },
  future_choice: {
    label: 'Choix de la forme du futur',
    explanation: "will : décision sur le moment, prédiction, promesse. be going to : projet déjà décidé, prédiction fondée sur un indice visible. Présent continu : rendez-vous organisé.",
  },
  future_in_time_clause: {
    label: 'will après when / if / as soon as',
    explanation: "Après when, as soon as, before, after, until et if, on emploie le présent pour parler du futur (✗ when I will arrive → ✓ when I arrive).",
  },
  question_order: {
    label: 'Ordre des mots dans la question',
    explanation: "Mot interrogatif + auxiliaire + sujet + verbe : Where does she live? (✗ Where she lives?)",
  },
  subject_question_do: {
    label: 'do inutile dans une question sur le sujet',
    explanation: "Quand who/what est le sujet, pas d'auxiliaire do : Who called you? (✗ Who did call you?)",
  },
  short_answer: {
    label: 'Réponse courte',
    explanation: "Réponse courte = Yes/No + pronom + auxiliaire de la question : Do you…? Yes, I do. / Is she…? No, she isn't. Pas de contraction dans une réponse courte affirmative (✗ Yes, I'm).",
  },
  question_tag: {
    label: 'Question tag',
    explanation: "Phrase affirmative → tag négatif, phrase négative → tag affirmatif, avec l'auxiliaire de la phrase et un pronom : She's nice, isn't she? You don't smoke, do you?",
  },
  article_a_an: {
    label: 'a / an',
    explanation: "an devant un SON voyelle (an apple, an hour), a devant un SON consonne (a car, a university, a European city).",
  },
  article_generic: {
    label: "Article devant un nom pris au sens général",
    explanation: "Pour parler d'une chose en général, pas d'article en anglais : I like coffee, Dogs are friendly (✗ I like the coffee).",
  },
  article_job: {
    label: 'Article devant un métier',
    explanation: "Devant un métier, l'anglais met a/an : She is a doctor (✗ She is doctor).",
  },
  article_the: {
    label: 'Emploi de the',
    explanation: "the désigne quelque chose de précis, déjà mentionné ou unique : the sun, the book I bought, play the piano.",
  },
  article_zero: {
    label: "Pas d'article",
    explanation: "Pas d'article devant les sports, les repas, les langues, la plupart des pays et dans go to school / go to bed / at home / by bus.",
  },
  uncountable_plural: {
    label: 'Indénombrable au pluriel',
    explanation: "information, advice, furniture, news, bread, money… sont indénombrables : pas de pluriel, pas de a/an (some advice, a piece of advice).",
  },
  much_many: {
    label: 'much / many',
    explanation: "many + nom dénombrable pluriel (many books) ; much + indénombrable (much money). En phrase affirmative, on préfère a lot of.",
  },
  some_any: {
    label: 'some / any',
    explanation: "some dans les phrases affirmatives (et les offres) ; any dans les phrases négatives et la plupart des questions.",
  },
  few_little: {
    label: 'a few / a little',
    explanation: "a few + dénombrable pluriel (a few friends) ; a little + indénombrable (a little time).",
  },
  there_is_are: {
    label: 'there is / there are',
    explanation: "there is + singulier ou indénombrable ; there are + pluriel. Au passé : there was / there were.",
  },
  pronoun_case: {
    label: 'Pronom sujet / complément',
    explanation: "Sujet : I, he, she, we, they. Complément (après un verbe ou une préposition) : me, him, her, us, them.",
  },
  possessive_gender: {
    label: 'his / her (accord avec le possesseur)',
    explanation: "his = à lui, her = à elle : le possessif s'accorde avec le POSSESSEUR, pas avec l'objet (Emma and her brother ; Tom and his sister).",
  },
  possessive_pronoun: {
    label: 'Adjectif / pronom possessif',
    explanation: "Adjectif + nom : my bag, your car. Pronom seul : mine, yours, his, hers, ours, theirs (✗ the mine).",
  },
  its_its: {
    label: "its / it's",
    explanation: "its = son/sa (possessif). it's = it is / it has.",
  },
  comparative_double: {
    label: 'Double comparatif',
    explanation: "On n'emploie jamais more avec un adjectif en -er : bigger (✗ more bigger).",
  },
  comparative_form: {
    label: 'Formation du comparatif',
    explanation: "Adjectif court : -er (cheaper, bigger, happier). Adjectif long : more + adjectif (more expensive). Irréguliers : good → better, bad → worse.",
  },
  superlative_form: {
    label: 'Formation du superlatif',
    explanation: "the + adjectif-est (the biggest) ou the most + adjectif long (the most expensive). Irréguliers : the best, the worst.",
  },
  than_that: {
    label: 'than après un comparatif',
    explanation: "Après un comparatif, « que » se dit than : taller than me (✗ that me, ✗ as me).",
  },
  as_as: {
    label: 'as … as',
    explanation: "Comparatif d'égalité : as + adjectif + as (as tall as). Négatif : not as … as.",
  },
  too_enough: {
    label: 'too / enough',
    explanation: "too + adjectif (trop) : too hot. adjectif + enough (assez) : old enough — enough se place APRÈS l'adjectif.",
  },
  adverb_adjective: {
    label: 'Adjectif au lieu de l’adverbe',
    explanation: "Pour décrire une action (un verbe), on utilise un adverbe : she drives carefully (✗ careful). good → well.",
  },
  ed_ing: {
    label: 'Adjectif en -ed / -ing',
    explanation: "-ed : ce que l'on ressent (I'm bored). -ing : ce qui provoque le sentiment (the film is boring).",
  },
  prep_time: {
    label: 'Préposition de temps',
    explanation: "at + heure, moment précis (at 7, at night, at the weekend) ; on + jour, date (on Monday, on 5 May) ; in + mois, année, saison, partie de la journée (in July, in 2020, in the morning).",
  },
  prep_place: {
    label: 'Préposition de lieu',
    explanation: "in = dans (in the box, in London) ; on = sur (on the table) ; at = à un point précis (at the station, at home) ; under, next to, behind, in front of, between, opposite.",
  },
  modal_to: {
    label: '« to » après un modal',
    explanation: "Après can, could, must, should, might, will, would : base verbale sans to (✗ you should to go).",
  },
  modal_s: {
    label: '-s sur un modal',
    explanation: "Les modaux sont invariables : she can (✗ she cans), he must (✗ he musts), et le verbe qui suit reste à la base.",
  },
  mustnt_dont_have_to: {
    label: "mustn't / don't have to",
    explanation: "mustn't = interdiction (il ne faut pas). don't have to = absence d'obligation (ce n'est pas nécessaire).",
  },
  can_could: {
    label: 'can / could',
    explanation: "can : capacité ou permission au présent ; could : capacité au passé (I could swim at five) ou demande polie (Could you help me?).",
  },
  should_advice: {
    label: 'should (conseil)',
    explanation: "should + base verbale pour donner un conseil : You should rest. Négatif : shouldn't.",
  },
  might_possibility: {
    label: 'might / may (possibilité)',
    explanation: "might / may + base : possibilité incertaine (It might rain = il pourrait pleuvoir).",
  },
  gerund_needed: {
    label: '-ing attendu',
    explanation: "Après enjoy, like, love, hate, finish, stop, avoid, mind, keep, practise, suggest… et après une préposition, le verbe prend -ing.",
  },
  infinitive_needed: {
    label: 'to + infinitif attendu',
    explanation: "Après want, would like, hope, decide, plan, need, learn, promise, agree, refuse, forget, try, manage… on emploie to + base verbale.",
  },
  conditional_will_in_if: {
    label: 'will dans la proposition en if',
    explanation: "Pas de will (ni would) après if : If it rains, we will stay (✗ If it will rain).",
  },
  first_conditional: {
    label: 'Conditionnel de type 1',
    explanation: "If + présent simple, will + base verbale : If you study, you will pass.",
  },
  second_conditional: {
    label: 'Conditionnel de type 2',
    explanation: "If + prétérit, would + base verbale : If I had more time, I would travel. (were possible avec I/he/she : If I were you…).",
  },
  zero_conditional: {
    label: 'Conditionnel de type 0',
    explanation: "Vérité générale ou habitude : If + présent, présent : If you heat water, it boils.",
  },
  connector: {
    label: 'Connecteur logique',
    explanation: "because (cause), so (conséquence), but (opposition), although / even though (concession, + proposition), however (en début de phrase, suivi d'une virgule).",
  },
  relative_pronoun: {
    label: 'Pronom relatif',
    explanation: "who pour les personnes, which pour les choses, that pour les deux, where pour les lieux, whose pour la possession.",
  },
  passive_form: {
    label: 'Forme passive',
    explanation: "Passif = be (au temps voulu) + participe passé : it is made, they were built. Le complément d'agent est introduit par by.",
  },
  reported_speech: {
    label: 'Discours indirect',
    explanation: "Au discours indirect introduit par said/told, on recule les temps : am → was, will → would, can → could, présent → prétérit, et on adapte les pronoms.",
  },
  say_tell: {
    label: 'say / tell',
    explanation: "tell + personne (She told me…) ; say sans complément de personne (She said that…).",
  },
  word_order: {
    label: 'Ordre des mots',
    explanation: "Ordre de base : sujet + verbe + complément + lieu + temps. L'adverbe de fréquence se place avant le verbe principal mais après be.",
  },
  freq_position: {
    label: "Place de l'adverbe de fréquence",
    explanation: "Avant le verbe principal (She often drinks), mais après be et après l'auxiliaire (She is often late, She has never been).",
  },
  false_friend: {
    label: 'Faux ami',
    explanation: "Ce mot ressemble au français mais n'a pas le même sens. Mémorisez la bonne traduction.",
  },
  collocation: {
    label: 'Collocation',
    explanation: "Certains mots vont ensemble : make a mistake, do homework, take a photo, have a shower…",
  },
  vocabulary: {
    label: 'Vocabulaire',
    explanation: 'Révisez ce mot : il reviendra dans vos prochaines séances de répétition espacée.',
  },
  spelling: {
    label: 'Orthographe',
    explanation: "Attention à l'orthographe du mot.",
  },
  register: {
    label: 'Registre / situation',
    explanation: "Cette formulation n'est pas adaptée à la situation (trop familière, impolie ou hors sujet).",
  },
  meaning: {
    label: 'Sens',
    explanation: 'Cette réponse ne correspond pas au sens de la phrase ou du texte.',
  },
};

export function errorInfo(tag: string | undefined): ErrorTagInfo | undefined {
  return tag ? ERROR_TAGS[tag] : undefined;
}
