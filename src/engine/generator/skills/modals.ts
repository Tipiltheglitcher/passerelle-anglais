/**
 * Modaux : can / could, must / have to (mustn't vs don't have to), should,
 * might / may, demandes et propositions polies.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench } from '@/engine/core/text';
import { predicate } from '@/content/lexicon/predicates';
import { NAMES, PEOPLE, PRONOUNS, frPersonOf, subjectPronounEn, subjectPronounFr } from '@/content/lexicon/subjects';
import type { Subject } from '@/content/lexicon/types';
import { ACCIDENTS, BARE_SKILLS, allowsHabit } from '@/content/lexicon/predicates';
import { realizeEn, realizeFr, type Clause } from '../clause';
import { buildItem, clauseItem, indicesByRole } from '../item';
import { lexemesOf, pickTime, pickTimeFor } from '../pick';
import { objFor } from './future';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { cap, chooseParts, mutate, verbOf } from './common';

function words(text: string, role = 'w'): Slot[] {
  return text.split(' ').filter(Boolean).map((w) => s(w, { role, proper: w === 'I' || /^[A-Z]/.test(w) }));
}

function modalDistractors(modal: string, base: string, neg = false): Distractor[] {
  const m = neg ? (modal === 'can' ? "can't" : modal === 'will' ? "won't" : `${modal}n't`) : modal;
  const s3 = EN.thirdPerson({ base });
  return [
    { text: `${m} to ${base}`, tag: 'modal_to' },
    { text: `${m} ${s3}`, tag: 'modal_s' },
    ...(!neg ? [{ text: `${modal}s ${base}`, tag: 'modal_s' }] : []),
    { text: `${m} ${EN.ing({ base })}`, tag: 'modal_to' },
  ];
}

const AGES = ['five', 'six', 'seven', 'eight', 'ten', 'twelve'];
const AGE_NUM: Record<string, number> = { five: 5, six: 6, seven: 7, eight: 8, ten: 10, twelve: 12 };

export const canCould: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['ability', 'ability', 'past', 'permission', 'request'] as const);
  if (kind === 'ability' || kind === 'past') {
    const parts = chooseParts(ctx, (p) => !!p.skill);
    if (!parts) return null;
    const neg = ctx.rng.chance(0.35);
    const yn = !neg && kind === 'ability' && ctx.rng.chance(0.3);
    let time: Clause['time'];
    if (kind === 'past') {
      const subj = parts.subj;
      const age = ctx.rng.pick(AGES);
      const pron = subjectPronounEn(subj);
      const be = subj.person === 2 || subj.num === 'pl' ? 'were' : 'was';
      const fp = frPersonOf(subj);
      time = { en: `when ${pron} ${be} ${age}`, fr: FR.frJoin(['quand', subjectPronounFr(subj), FR.imparfait(FR.AVOIR, fp), String(AGE_NUM[age]), 'ans']), front: true };
    }
    const c: Clause = { ...parts, tense: kind === 'past' ? 'could' : 'can', neg, form: yn ? 'yn' : 'decl', modalSense: 'ability', time };
    const v = verbOf(c);
    return clauseItem({
      skillId: 'can_could',
      templateId: `can.${kind}.${neg ? 'neg' : yn ? 'q' : 'aff'}`,
      level: 'A2',
      clause: c,
      blankRoles: yn ? [['aux'], ['verb']] : [['aux', 'verb']],
      hints: yn ? [undefined, v.base] : [neg ? `not / ${v.base}` : v.base],
      distractors: yn
        ? []
        : [
            ...modalDistractors(kind === 'past' ? 'could' : 'can', v.base, neg),
            { text: kind === 'past' ? (neg ? "can't " : 'can ') + v.base : (neg ? "couldn't " : 'could ') + v.base, tag: 'can_could' },
          ],
      neighbours: mutate(ctx, c, ['subj', 'neg']),
      explanation:
        kind === 'past'
          ? `Capacité dans le passé → could / couldn't + base verbale (= « savait / pouvait »).`
          : `Capacité au présent → can / can't + base verbale, identique à toutes les personnes (✗ cans, ✗ can to). Ici « savoir » en français.`,
      options: { timeFront: ctx.rng.chance(0.5) },
    });
  }
  if (kind === 'permission') {
    const parts = chooseParts(ctx, (p) => ['open_window', 'close_window', 'watch_tv', 'use_laptop', 'go_home', 'take_photos', 'listen_radio', 'charge_phone'].includes(p.id), { pronouns: 1 });
    if (!parts) return null;
    const subj = ctx.rng.pick(PRONOUNS.filter((p) => p.id === 'i' || p.id === 'we'));
    const c: Clause = { ...parts, subj, tense: 'can', form: 'yn', modalSense: 'permission' };
    const v = verbOf(c);
    return clauseItem({
      skillId: 'can_could',
      templateId: 'can.permission',
      level: 'A2',
      clause: c,
      blankRoles: [['aux']],
      distractors: [
        { text: 'Do', tag: 'modal_s' },
        { text: 'Am', tag: 'be_plus_base' },
        { text: 'Must', tag: 'meaning' },
      ],
      neighbours: mutate(ctx, c, ['neg']),
      explanation: `Demander la permission : Can I / Can we + base verbale (${v.base}) ? (plus poli : Could I…? / May I…?)`,
      extraAnswers: undefined,
    });
  }
  // demande polie : « Could you close the window, please? »
  const parts = chooseParts(ctx, (p) => ['open_window', 'close_window', 'help_person', 'call_person', 'wait_for_person', 'repair_thing', 'charge_phone', 'do_shopping', 'pay_bill', 'book_table'].includes(p.id));
  if (!parts) return null;
  const you = ctx.rng.pick(PRONOUNS.filter((p) => p.person === 2));
  const c: Clause = { ...parts, subj: you, tense: 'could', form: 'yn', modalSense: 'request' };
  const r = realizeEn(c);
  const slots: Slot[] = [...r.slots, s(',', { role: 'punct' }), s('please', { role: 'please' })];
  const plz = you.num === 'pl' ? "s'il vous plaît" : "s'il te plaît";
  const fr = realizeFr(c).replace(/\u00a0\?$/, `, ${plz}\u00a0?`);
  const v = verbOf(c);
  return buildItem({
    skillId: 'can_could',
    templateId: 'can.request',
    level: 'A2',
    slots,
    end: '?',
    fr,
    blankGroups: [indicesByRole(slots, ['aux'])],
    distractors: [
      { text: 'Do', tag: 'meaning' },
      { text: 'Must', tag: 'register' },
      { text: 'Are', tag: 'be_plus_base' },
    ],
    explanation: `Demande polie : Could you + base verbale (${v.base}), please? (Can you…? est plus familier.)`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj }),
  });
};

// ---------------------------------------------------------------------------

interface RuleSentence {
  en: [string, string, string];
  fr: string;
  answer: "mustn't" | "don't have to" | "doesn't have to";
}

const RULES: RuleSentence[] = [
  { en: ['You', 'use your phone during the exam', '.'], fr: "Tu ne dois pas utiliser ton téléphone pendant l'examen (c'est interdit).", answer: "mustn't" },
  { en: ['You', 'park here', '.'], fr: "Tu ne dois pas te garer ici (c'est interdit).", answer: "mustn't" },
  { en: ['Visitors', 'touch the paintings', '.'], fr: "Les visiteurs ne doivent pas toucher les tableaux (c'est interdit).", answer: "mustn't" },
  { en: ['You', 'be late for the meeting', '.'], fr: "Tu ne dois surtout pas être en retard à la réunion.", answer: "mustn't" },
  { en: ['Passengers', 'smoke on the plane', '.'], fr: "Les passagers ne doivent pas fumer dans l'avion (c'est interdit).", answer: "mustn't" },
  { en: ['You', 'swim here: it is dangerous', '.'], fr: "Tu ne dois pas nager ici : c'est dangereux.", answer: "mustn't" },
  { en: ['You', 'come if you are busy', '.'], fr: "Tu n'as pas besoin de venir si tu es occupé (ce n'est pas obligatoire).", answer: "don't have to" },
  { en: ["It's Sunday, so I", 'get up early', '.'], fr: "C'est dimanche, donc je n'ai pas besoin de me lever tôt.", answer: "don't have to" },
  { en: ['You', 'pay: the museum is free', '.'], fr: "Tu n'as pas besoin de payer : le musée est gratuit.", answer: "don't have to" },
  { en: ['We', 'wear a uniform at our school', '.'], fr: "Nous ne sommes pas obligés de porter un uniforme dans notre école.", answer: "don't have to" },
  { en: ['She', 'work on Fridays', '.'], fr: "Elle n'a pas besoin de travailler le vendredi (ce n'est pas obligatoire).", answer: "doesn't have to" },
  { en: ['He', 'cook tonight: we are going to a restaurant', '.'], fr: "Il n'a pas besoin de cuisiner ce soir : nous allons au restaurant.", answer: "doesn't have to" },
];

export const mustHaveTo: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['haveto', 'haveto', 'hadto', 'must', 'rule', 'rule'] as const);
  if (kind === 'rule') {
    const r = ctx.rng.pick(RULES);
    const slots: Slot[] = [...words(r.en[0], 'pre'), s(r.answer === "mustn't" ? ["mustn't", 'must not'] : r.answer === "don't have to" ? ["don't have to", 'do not have to'] : ["doesn't have to", 'does not have to'], { role: 'modal' }), ...words(r.en[1], 'post')];
    const other: Distractor[] =
      r.answer === "mustn't"
        ? [{ text: r.en[0] === 'She' || r.en[0] === 'He' ? "doesn't have to" : "don't have to", tag: 'mustnt_dont_have_to' }, { text: "mustn't to", tag: 'modal_to' }]
        : [{ text: "mustn't", tag: 'mustnt_dont_have_to' }, { text: r.answer === "doesn't have to" ? "don't have to" : "doesn't have to", tag: 'do_wrong_person' }];
    return buildItem({
      skillId: 'must_have_to',
      templateId: `must.rule.${r.answer === "mustn't" ? 'mustnt' : 'donthave'}`,
      level: 'B1',
      slots,
      end: '.',
      fr: r.fr,
      blankGroups: [indicesByRole(slots, ['modal'])],
      distractors: other,
      showTranslation: true,
      instruction: "mustn't (interdiction) ou don't have to (pas nécessaire) ?",
      explanation: r.answer === "mustn't" ? "C'est une interdiction → mustn't (il ne faut pas)." : "Ce n'est pas obligatoire, mais c'est permis → don't / doesn't have to.",
      lexemes: [`rule:${r.en[1]}`],
    });
  }
  const parts = chooseParts(ctx, (p) => ['get_up', 'work_late', 'do_homework', 'go_school', 'take_taxi', 'see_doctor', 'study_hard', 'tidy_room', 'do_shopping', 'finish_work', 'wear_clothes', 'go_work', 'pay_bill', 'leave_home', 'call_person', 'charge_phone'].includes(p.id));
  if (!parts) return null;
  const neg = kind !== 'must' && ctx.rng.chance(0.3);
  const tense = kind === 'hadto' ? 'hadTo' : kind === 'must' ? 'must' : 'haveTo';
  const time =
    kind === 'hadto'
      ? pickTimeFor(ctx, 'past', parts.pred)
      : ctx.rng.chance(0.5)
        ? allowsHabit(parts.pred) && ctx.rng.chance(0.5)
          ? pickTime(ctx, ['habit'])
          : pickTimeFor(ctx, 'future', parts.pred)
        : undefined;
  const c: Clause = { ...parts, tense, neg, time };
  const v = verbOf(c);
  const third = c.subj.person === 3 && c.subj.num === 'sg';
  const distractors: Distractor[] =
    tense === 'haveTo'
      ? neg
        ? [
            { text: `${third ? "don't" : "doesn't"} have to ${v.base}`, tag: 'do_wrong_person' },
            { text: `haven't to ${v.base}`, tag: 'do_support' },
            { text: `${third ? "doesn't" : "don't"} have to ${EN.thirdPerson(v)}`, tag: 'aux_plus_inflected' },
          ]
        : [
            { text: `${third ? 'have' : 'has'} to ${v.base}`, tag: 'have_wrong_person' },
            { text: `${third ? 'has' : 'have'} ${v.base}`, tag: 'modal_to' },
            { text: `must to ${v.base}`, tag: 'modal_to' },
          ]
      : tense === 'hadTo'
        ? neg
          ? [{ text: `hadn't to ${v.base}`, tag: 'do_support' }, { text: `didn't had to ${v.base}`, tag: 'aux_plus_inflected' }]
          : [{ text: `must ${v.base}`, tag: 'tense_past' }, { text: `have to ${v.base}`, tag: 'tense_past' }, { text: `had ${v.base}`, tag: 'modal_to' }]
        : modalDistractors('must', v.base);
  return clauseItem({
    skillId: 'must_have_to',
    templateId: `must.${tense}.${neg ? 'neg' : 'aff'}`,
    level: 'A2',
    clause: c,
    blankRoles: [['aux', 'verb']],
    hints: [`${tense === 'must' ? 'must' : 'have to'}${neg ? ' (négatif)' : ''} / ${v.base}`],
    distractors,
    neighbours: mutate(ctx, c, ['subj', 'neg']),
    explanation:
      tense === 'hadTo'
        ? `Au passé, must n'existe pas : on utilise had to (négatif : didn't have to).`
        : tense === 'must'
          ? `must + base verbale : obligation (souvent ressentie par celui qui parle).`
          : neg
            ? `don't / doesn't have to = ce n'est pas nécessaire (≠ mustn't = interdit).`
            : `have to / has to + base verbale : obligation extérieure. Avec « ${c.subj.en} » : ${third ? 'has to' : 'have to'}.`,
    options: { timeFront: ctx.rng.chance(0.2) },
  });
};

// ---------------------------------------------------------------------------

interface Advice {
  /** Problème exprimé à la 1ʳᵉ personne. */
  problem: string;
  /** Même problème pour une 3ᵉ personne ({S} = sujet, {his} = possessif). */
  problem3: string;
  pred: string;
  obj?: string;
  neg?: boolean;
  /** Expressions de temps possibles pour le conseil. */
  when?: { en: string; fr: string }[];
}

const TONIGHT = { en: 'tonight', fr: 'ce soir' };
const TODAY = { en: 'today', fr: "aujourd'hui" };
const TOMORROW = { en: 'tomorrow', fr: 'demain' };
const NOW = { en: 'now', fr: 'maintenant' };

const ADVICE: Advice[] = [
  { problem: "I'm really tired.", problem3: '{S} is really tired.', pred: 'go_bed_early', when: [TONIGHT] },
  { problem: "I'm exhausted.", problem3: '{S} is exhausted.', pred: 'rest', when: [TODAY] },
  { problem: 'I have an exam tomorrow.', problem3: '{S} has an exam tomorrow.', pred: 'revise_exam', when: [TONIGHT] },
  { problem: "I can't find my keys.", problem3: "{S} can't find {his} keys.", pred: 'look_for_item', obj: 'key' },
  { problem: 'My room is a mess.', problem3: "{S}'s room is a mess.", pred: 'tidy_room', when: [TODAY] },
  { problem: "I'm always late for work.", problem3: '{S} is always late for work.', pred: 'get_up' },
  { problem: 'My phone battery is almost dead.', problem3: "{S}'s phone battery is almost dead.", pred: 'charge_phone', when: [NOW] },
  { problem: "I'm cold.", problem3: '{S} is cold.', pred: 'put_on_jumper' },
  { problem: 'I feel ill.', problem3: '{S} feels ill.', pred: 'see_doctor', when: [TODAY, TOMORROW] },
  { problem: 'I feel ill.', problem3: '{S} feels ill.', pred: 'stay_home', when: [TODAY, TOMORROW] },
  { problem: "It's going to rain.", problem3: "It's going to rain.", pred: 'take_umbrella', when: [TODAY] },
  { problem: "I'm always thirsty.", problem3: '{S} is always thirsty.', pred: 'drink_water' },
  { problem: 'I eat a lot of junk food.', problem3: '{S} eats a lot of junk food.', pred: 'eat_vegetables' },
  { problem: "I can't sleep at night.", problem3: "{S} can't sleep at night.", pred: 'drink_coffee_evening', neg: true },
  { problem: 'I feel sick.', problem3: '{S} feels sick.', pred: 'eat_too_much', neg: true },
  { problem: "I'm very stressed.", problem3: '{S} is very stressed.', pred: 'work_late', neg: true },
  { problem: "I'm bored at home.", problem3: '{S} is bored at home.', pred: 'go_cinema', when: [TONIGHT] },
  { problem: "I'm bored at home.", problem3: '{S} is bored at home.', pred: 'meet_friends', when: [TONIGHT] },
  { problem: "I don't know anyone in this town.", problem3: "{S} doesn't know anyone in this town.", pred: 'join_club' },
  { problem: 'My car is very old.', problem3: "{S}'s car is very old.", pred: 'buy_thing', obj: 'car' },
  { problem: 'I want to speak better English.', problem3: '{S} wants to speak better English.', pred: 'study_hard' },
  { problem: "I'm always hungry at work.", problem3: '{S} is always hungry at work.', pred: 'have_breakfast' },
];

export const shouldAdvice: ItemGenerator = (ctx) => {
  const a = ctx.rng.pick(ADVICE);
  const pred = predicate(a.pred);
  if (ctx.level === 'A2' && pred.lv === 'B1') return null;
  const third = ctx.rng.chance(0.45);
  const other = third ? ctx.rng.pick([...NAMES, ...PEOPLE.filter((p) => p.num === 'sg' && !p.child)]) : null;
  const subj = other ? pronoun3(other) : ctx.rng.pick(PRONOUNS.filter((p) => p.id === 'you' || p.id === 'you_f'));
  const picked = objFor(ctx, pred, a.obj);
  const obj = picked && a.obj === 'key' ? { ...picked, det: 'poss' as const, plural: true } : picked && a.obj === 'car' ? { ...picked, det: 'a' as const, plural: false } : picked;
  const when = a.when && ctx.rng.chance(0.5) ? ctx.rng.pick(a.when) : undefined;
  const c: Clause = { subj, pred, obj, tense: 'should', neg: !!a.neg, time: when };
  if (pred.obj && !c.obj) return null;
  const v = verbOf(c);
  const problem = other
    ? a.problem3.replace('{S}', other.proper ? other.en : cap(other.en)).replace('{his}', other.g === 'f' ? 'her' : 'his')
    : a.problem;
  return clauseItem({
    skillId: 'should',
    templateId: `should.${a.neg ? 'neg' : 'aff'}.${third ? '3' : '2'}`,
    level: 'A2',
    clause: c,
    blankRoles: [['aux', 'verb']],
    hints: [`${a.neg ? 'should (négatif)' : 'should'} / ${v.base}`],
    distractors: modalDistractors('should', v.base, !!a.neg),
    neighbours: mutate(ctx, c, ['neg']),
    context: `— ${problem}`,
    explanation: `Conseil → should${a.neg ? "n't" : ''} + base verbale (= « ${third ? 'il / elle devrait' : 'tu devrais'}${a.neg ? ' pas' : ''} »). Jamais de to après should.`,
    extraLexemes: [`advice:${a.pred}`],
  });
};

function pronoun3(s0: Subject): Subject {
  const en = subjectPronounEn(s0);
  return { ...s0, id: `${s0.id}_pron`, en, fr: subjectPronounFr(s0), pron: true, proper: false };
}

// ---------------------------------------------------------------------------

export const mightMay: ItemGenerator = (ctx) => {
  if (ctx.rng.chance(0.2)) {
    const w = ctx.rng.pick([
      { en: 'rain', fr: 'il pleuvra peut-être' },
      { en: 'snow', fr: 'il neigera peut-être' },
    ]);
    const later = ctx.rng.pick([
      { en: 'later', fr: 'plus tard' },
      { en: 'this afternoon', fr: 'cet après-midi' },
      { en: 'tomorrow', fr: 'demain' },
    ]);
    const slots: Slot[] = [s('It', { role: 'subj', proper: true }), s(['might', 'may'], { role: 'aux' }), s(w.en, { role: 'verb' }), ...words(later.en, 'time')];
    return buildItem({
      skillId: 'might_may',
      templateId: `might.weather.${w.en}`,
      level: 'B1',
      slots,
      end: '.',
      fr: joinFrench([`${cap(w.fr.replace('peut-être', ''))}peut-être ${later.fr}`.replace(/\s+/g, ' ')], '.'),
      blankGroups: [indicesByRole(slots, ['aux', 'verb'])],
      hints: [w.en],
      distractors: modalDistractors('might', w.en),
      explanation: 'Possibilité incertaine → might / may + base verbale (= « il se peut que », « peut-être »).',
      lexemes: [`weather:${w.en}`],
    });
  }
  const parts = chooseParts(ctx, (p) => !p.routine && p.k !== 'state' && !BARE_SKILLS.has(p.id) && !ACCIDENTS.has(p.id));
  if (!parts) return null;
  const neg = ctx.rng.chance(0.3);
  const c: Clause = { ...parts, tense: 'might', neg, time: pickTimeFor(ctx, 'future', parts.pred) };
  const v = verbOf(c);
  const r = realizeEn(c);
  const slots = r.slots.map((sl) => (sl.role === 'aux' ? { ...sl, alts: neg ? ['might not', 'may not', "mightn't"] : ['might', 'may'] } : sl));
  return buildItem({
    skillId: 'might_may',
    templateId: `might.${neg ? 'neg' : 'aff'}`,
    level: 'B1',
    slots,
    end: '.',
    fr: realizeFr(c),
    blankGroups: [indicesByRole(slots, ['aux', 'verb'])],
    hints: [`${neg ? 'not / ' : ''}${v.base}`],
    distractors: [...modalDistractors('might', v.base), { text: `will ${v.base}`, tag: 'might_possibility' }].filter((d) => !neg || d.tag !== 'modal_s'),
    explanation: `Possibilité (pas une certitude) → might${neg ? ' not' : ''} / may${neg ? ' not' : ''} + base verbale. Le français dit souvent « peut-être ».`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj, time: c.time }),
  });
};

// ---------------------------------------------------------------------------
// Demandes, offres, suggestions (choix en contexte)

interface Situation {
  context: string;
  answer: string;
  fr: string;
  distractors: Distractor[];
  why: string;
}

const SITUATIONS: Situation[] = [
  {
    context: 'Au restaurant, vous voulez demander l\'addition.',
    answer: 'Could I have the bill, please?',
    fr: "Pourrais-je avoir l'addition, s'il vous plaît ?",
    distractors: [{ text: 'Give me the addition.', tag: 'false_friend' }, { text: 'I want the bill now.', tag: 'register' }, { text: 'Can I to have the bill?', tag: 'modal_to' }],
    why: "Demande polie : Could I have…, please? « addition » est un faux ami (= une addition mathématique) : on dit the bill (UK) / the check (US).",
  },
  {
    context: 'Vous proposez une boisson à un invité.',
    answer: 'Would you like a cup of tea?',
    fr: 'Voulez-vous une tasse de thé ?',
    distractors: [{ text: 'Do you like a cup of tea?', tag: 'meaning' }, { text: 'Would you like to a cup of tea?', tag: 'modal_to' }, { text: 'You want tea?', tag: 'register' }],
    why: "Offre polie : Would you like + nom ? (Do you like…? = « aimes-tu… en général ? »)",
  },
  {
    context: 'Vous proposez votre aide pour porter un sac.',
    answer: 'Shall I carry your bag?',
    fr: 'Veux-tu que je porte ton sac ?',
    distractors: [{ text: 'Do I carry your bag?', tag: 'meaning' }, { text: 'Shall I to carry your bag?', tag: 'modal_to' }, { text: 'I carry your bag?', tag: 'question_order' }],
    why: 'Proposer de faire quelque chose : Shall I + base verbale ? (ou I\'ll carry it for you.)',
  },
  {
    context: 'Vous suggérez à un ami d\'aller au cinéma ce soir.',
    answer: "Let's go to the cinema tonight.",
    fr: 'Allons au cinéma ce soir.',
    distractors: [{ text: "Let's to go to the cinema tonight.", tag: 'modal_to' }, { text: "Let's going to the cinema tonight.", tag: 'gerund_needed' }, { text: 'We go to the cinema tonight?', tag: 'register' }],
    why: "Suggestion : Let's + base verbale (= « allons… »), ou Why don't we…? / How about + -ing?",
  },
  {
    context: 'Dans un magasin, vous voulez essayer une veste.',
    answer: 'Can I try this jacket on, please?',
    fr: 'Est-ce que je peux essayer cette veste, s\'il vous plaît ?',
    distractors: [{ text: 'Can I essay this jacket?', tag: 'false_friend' }, { text: 'I try this jacket.', tag: 'register' }, { text: 'Can I trying this jacket on?', tag: 'modal_to' }],
    why: 'Demander la permission : Can I + base verbale ? « try on » = essayer un vêtement (« essay » = dissertation).',
  },
  {
    context: 'Vous demandez à quelqu\'un de répéter, poliment.',
    answer: 'Could you repeat that, please?',
    fr: "Pourriez-vous répéter, s'il vous plaît ?",
    distractors: [{ text: 'Repeat!', tag: 'register' }, { text: 'Could you to repeat that?', tag: 'modal_to' }, { text: 'Can you repeating that?', tag: 'modal_to' }],
    why: 'Demande polie : Could you + base verbale, please?',
  },
  {
    context: 'Au téléphone, vous voulez parler à Mme Smith.',
    answer: 'Could I speak to Mrs Smith, please?',
    fr: "Pourrais-je parler à Mme Smith, s'il vous plaît ?",
    distractors: [{ text: 'I want speak with Mrs Smith.', tag: 'register' }, { text: 'Could I speak at Mrs Smith?', tag: 'prep_place' }, { text: 'Can I to speak to Mrs Smith?', tag: 'modal_to' }],
    why: 'Au téléphone : Could I speak to…, please? (speak TO someone).',
  },
  {
    context: 'Vous demandez votre chemin pour aller à la gare.',
    answer: 'Excuse me, how do I get to the station?',
    fr: 'Excusez-moi, comment est-ce que je vais à la gare ?',
    distractors: [{ text: 'Excuse me, where is it the station?', tag: 'question_order' }, { text: 'Excuse me, how I go to the station?', tag: 'question_order' }, { text: 'Sorry, you go to the station?', tag: 'register' }],
    why: "Demander son chemin : How do I get to…? / Where is the…? (sans « it »).",
  },
  {
    context: 'Vous acceptez poliment une invitation.',
    answer: "I'd love to, thank you!",
    fr: "Avec plaisir, merci !",
    distractors: [{ text: "I'd love, thank you!", tag: 'infinitive_needed' }, { text: 'I love to, thank you!', tag: 'meaning' }, { text: 'Yes, I would love it to.', tag: 'register' }],
    why: "Accepter une invitation : I'd love to (= I would love to come).",
  },
  {
    context: 'Vous refusez poliment une invitation.',
    answer: "I'm sorry, but I can't. I'm busy tonight.",
    fr: "Je suis désolé, mais je ne peux pas. Je suis occupé ce soir.",
    distractors: [{ text: "No, I don't want.", tag: 'register' }, { text: "I'm sorry, but I can't to come.", tag: 'modal_to' }, { text: "I'm sorry, I am not free tonight for come.", tag: 'infinitive_needed' }],
    why: "Refuser poliment : I'm sorry, but I can't + raison.",
  },
  {
    context: 'Vous demandez si vous pouvez ouvrir la fenêtre.',
    answer: 'Do you mind if I open the window?',
    fr: 'Ça vous dérange si j\'ouvre la fenêtre ?',
    distractors: [{ text: 'Do you mind if I will open the window?', tag: 'conditional_will_in_if' }, { text: 'Are you mind if I open the window?', tag: 'be_plus_base' }, { text: 'Do you mind I opening the window?', tag: 'gerund_needed' }],
    why: 'Do you mind if I + présent… ? = « ça vous dérange si… ? »',
  },
  {
    context: 'Au café, vous commandez un café.',
    answer: "I'd like a coffee, please.",
    fr: "Je voudrais un café, s'il vous plaît.",
    distractors: [{ text: 'I like a coffee, please.', tag: 'meaning' }, { text: 'I would like to a coffee.', tag: 'modal_to' }, { text: 'Give me coffee.', tag: 'register' }],
    why: "Commander poliment : I'd like (= I would like) + nom. « I like » = j'aime (en général).",
  },
];

export const requestsOffers: ItemGenerator = (ctx) => {
  const sit = ctx.rng.pick(SITUATIONS);
  const end = (sit.answer.match(/[.!?]$/)?.[0] ?? '.') as '.' | '?' | '!';
  const slots: Slot[] = [s(sit.answer.replace(/[.!?]$/, ''), { role: 'answer', proper: true })];
  return buildItem({
    skillId: 'requests_offers',
    templateId: `ro.${sit.answer.slice(0, 12)}`,
    level: 'A2',
    slots,
    end,
    fr: sit.fr,
    blankGroups: [[0]],
    distractors: sit.distractors.map((d) => ({ ...d, text: d.text.replace(/[.!?]$/, '') })),
    context: sit.context,
    mcqOnly: true,
    instruction: 'Que dites-vous dans cette situation ?',
    explanation: sit.why,
    lexemes: [`sit:${sit.answer}`],
  });
};

export { FR };
export type { GenContext };
