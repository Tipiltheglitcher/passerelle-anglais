/**
 * Questions : mots interrogatifs, réponses courtes, questions sur le sujet,
 * question tags.
 */
import * as EN from '@/engine/lang/en/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { capitalizeFirst, joinFrench } from '@/engine/core/text';
import { BARE_SKILLS, FUTURE_STATES, allowsHabit, allowsProgressive } from '@/content/lexicon/predicates';
import { subjectPronounEn } from '@/content/lexicon/subjects';
import { enNounPhrase, realizeEn, realizeFr, verbGroup, type Clause, type Tense, type WhTarget } from '../clause';
import { buildItem, clauseItem, indicesByRole } from '../item';
import { lexemesOf, pickTime, pickTimeFor } from '../pick';
const PP_EXPERIENCE_OK = new Set(['go_country', 'go_city', 'go_place', 'visit_city', 'play_sport', 'play_game', 'read', 'lose_item', 'break_thing', 'forget_item', 'fly_country', 'stay_hotel', 'cook_dish', 'take_taxi', 'play_instrument', 'miss_bus']);
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { cap, chooseParts, mutate, pn, verbOf } from './common';

const WH_WORDS = ['What', 'Where', 'When', 'Who', 'How often', 'What time', 'How long', 'Why'];

function npText(c: Clause): string {
  if (!c.obj) return '';
  const sl = enNounPhrase(c.obj, { neg: false, question: false, subj: c.subj });
  return sl.map((x) => x.alts[0]).filter(Boolean).join(' ');
}

/** Réponse attendue à une question ouverte (pour lever l'ambiguïté du mot interrogatif). */
function answerLine(c: Clause): string {
  switch (c.wh) {
    case 'place': {
      const prep = c.pred.prt === 'in' ? 'In' : 'To';
      return `${prep} ${npText(c)}.`;
    }
    case 'obj':
      return `${capitalizeFirst(npText(c))}.`;
    case 'time':
    case 'freq':
    case 'clock':
    case 'dur':
      return `${capitalizeFirst(c.time?.en ?? '')}.`;
    default:
      return '';
  }
}

function whFor(c: Clause): string[] {
  switch (c.wh) {
    case 'place':
      return ['Where'];
    case 'obj':
      return c.obj?.noun.c.includes('person') ? ['Who', 'Whom'] : ['What'];
    case 'time':
      return ['When'];
    case 'clock':
      return ['What time', 'When'];
    case 'freq':
      return ['How often'];
    case 'dur':
      return ['How long'];
    default:
      return ['What'];
  }
}

function possibleTargets(c: Pick<Clause, 'pred' | 'obj'>, tense: Tense): WhTarget[] {
  const out: WhTarget[] = [];
  const cats = c.pred.obj?.cats ?? [];
  if (cats.some((x) => ['city', 'country', 'place'].includes(x))) out.push('place', 'place');
  if (c.obj && !cats.some((x) => ['city', 'country', 'place', 'sport', 'language', 'subject'].includes(x))) out.push('obj');
  if (tense === 'presSimple' && allowsHabit(c.pred) && !['get_dressed', 'brush_teeth', 'have_shower'].includes(c.pred.id)) out.push('freq');
  if (tense === 'presSimple' && c.pred.routine) out.push('clock', 'clock');
  if (tense === 'pastSimple' || tense === 'will' || tense === 'goingTo') out.push('time');
  return out;
}

export const whQuestions: ItemGenerator = (ctx) => {
  const tense = ctx.rng.pick(['presSimple', 'presSimple', 'pastSimple', 'pastSimple', 'presCont', 'will'] as const);
  const parts = chooseParts(ctx, (p) => !p.be && (tense !== 'presCont' || allowsProgressive(p)) && (tense === 'presSimple' || p.k !== 'state') && !BARE_SKILLS.has(p.id), { exclude: ['i', 'i_f'] });
  if (!parts) return null;
  const targets = possibleTargets(parts, tense);
  if (!targets.length) return null;
  const wh = ctx.rng.pick(targets);
  let time: Clause['time'];
  if (wh === 'freq') time = pickTime(ctx, ['habit']);
  else if (wh === 'clock') time = clockSpec(ctx);
  else if (wh === 'time') time = pickTimeFor(ctx, tense === 'pastSimple' ? 'past' : 'future', parts.pred);
  const c: Clause = { ...parts, tense, form: 'wh', wh, time };
  const answer = answerLine(c);
  if (!answer || answer === '.') return null;
  const v = verbOf(c);
  const mode = ctx.rng.pick(['word', 'word', 'aux', 'order'] as const);
  const correctWh = whFor(c);
  if (mode === 'word') {
    return clauseItem({
      skillId: 'wh_questions',
      templateId: `wh.word.${wh}`,
      level: 'A2',
      clause: c,
      blankRoles: [['wh']],
      distractors: WH_WORDS.filter((w) => !correctWh.includes(w) && !(wh === 'clock' && w === 'When') && !(w === 'Why')).map((w) => ({ text: w, tag: 'meaning' })),
      neighbours: mutate(ctx, c, ['subj']),
      context: `— ${answer}`,
      instruction: 'Choisissez le mot interrogatif qui correspond à la réponse.',
      explanation: `La réponse « ${answer} » indique ${{ place: 'un lieu → Where', obj: c.obj?.noun.c.includes('person') ? 'une personne → Who' : 'une chose → What', time: 'un moment → When', clock: 'une heure → What time', freq: 'une fréquence → How often', dur: 'une durée → How long', subj: 'une personne → Who' }[wh]}.`,
    });
  }
  const { p, n } = pn(c);
  const vg = verbGroup(c);
  const op = vg.op ?? 'do';
  if (mode === 'aux') {
    return clauseItem({
      skillId: 'wh_questions',
      templateId: `wh.aux.${tense}`,
      level: 'A2',
      clause: c,
      blankRoles: [['aux']],
      distractors: ['do', 'does', 'did', 'is', 'are', 'will', 'was']
        .filter((a) => a !== op)
        .filter((a) => !(tense === 'presSimple' && ['did', 'will', 'was'].includes(a)))
        .map((a) => ({ text: a, tag: ['is', 'are', 'was'].includes(a) && op !== 'is' && op !== 'are' ? 'be_plus_base' : a === 'do' || a === 'does' ? 'do_wrong_person' : 'tense_past' })),
      neighbours: mutate(ctx, c, ['subj']),
      context: `— ${answer}`,
      showTranslation: tense !== 'presSimple',
      explanation: `Ordre : mot interrogatif + ${op} + sujet + verbe. Avec « ${c.subj.en} » au ${tense === 'presSimple' ? 'présent simple' : tense === 'pastSimple' ? 'prétérit' : tense === 'presCont' ? 'présent continu' : 'futur'} → ${op}.`,
    });
  }
  // ordre des mots : mot interrogatif + auxiliaire + sujet + verbe
  const r = realizeEn(c);
  const idx = indicesByRole(r.slots, ['aux', 'subj', 'verb']);
  const contiguous = idx.every((x, i) => i === 0 || x === idx[i - 1] + 1);
  if (!contiguous) return null;
  const subjTxt = c.subj.en;
  const main = vg.words.map((w) => w[0]).join(' ');
  const decl = tense === 'presSimple' ? EN.presentSimple(v, p, n) : tense === 'pastSimple' ? EN.pastSimple(v, p, n) : main;
  const distractors: Distractor[] = [
    { text: `${subjTxt} ${tense === 'presCont' || tense === 'will' ? `${op} ${main}` : decl}`, tag: 'question_order' },
    { text: `${subjTxt} ${op} ${main}`, tag: 'question_order' },
  ];
  if (tense === 'presSimple' || tense === 'pastSimple') distractors.push({ text: `${op} ${subjTxt} ${decl}`, tag: 'aux_plus_inflected' });
  return buildItem({
    skillId: 'wh_questions',
    templateId: `wh.order.${tense}`,
    level: 'A2',
    slots: r.slots,
    end: '?',
    fr: realizeFr(c),
    blankGroups: [idx],
    distractors,
    context: `— ${answer}`,
    explanation: `Dans une question : mot interrogatif + auxiliaire (${op}) + sujet + verbe (${main}). On ne garde jamais l'ordre de la phrase affirmative.`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj, time: c.time }),
  });
};

function clockSpec(ctx: GenContext) {
  const h = ctx.rng.int(6, 11);
  const m = ctx.rng.pick([0, 0, 30, 15, 45] as const);
  const words = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve'];
  const en = m === 0 ? `at ${words[h]} o'clock` : m === 30 ? `at half past ${words[h]}` : m === 15 ? `at quarter past ${words[h]}` : `at quarter to ${words[h + 1]}`;
  const fr = m === 0 ? `à ${h} heures` : m === 30 ? `à ${h} heures et demie` : m === 15 ? `à ${h} heures et quart` : `à ${h + 1} heures moins le quart`;
  const alts =
    m === 0
      ? [`at ${h}`, `at ${words[h]}`, `at ${h}:00`, `at ${h} o'clock`]
      : m === 30
        ? [`at ${h}:30`, `at ${words[h]} thirty`]
        : m === 15
          ? [`at ${h}:15`, `at a quarter past ${words[h]}`, `at ${words[h]} fifteen`]
          : [`at ${h}:45`, `at a quarter to ${words[h + 1]}`, `at ${words[h]} forty-five`];
  return { id: `clock_${h}_${m}`, en, alts, fr };
}

export { clockSpec };

// ---------------------------------------------------------------------------

export const shortAnswers: ItemGenerator = (ctx) => {
  const tense = ctx.rng.pick(['presSimple', 'presSimple', 'pastSimple', 'presCont', 'presPerf', 'will', 'can'] as const);
  const parts = chooseParts(
    ctx,
    (p) =>
      (tense !== 'presCont' || allowsProgressive(p)) &&
      (tense !== 'can' || !!p.skill) &&
      (tense === 'presSimple' || tense === 'can' || p.k !== 'state' || !!p.be) &&
      (tense !== 'will' || p.k !== 'state' || FUTURE_STATES.has(p.id)) &&
      (tense !== 'presPerf' || PP_EXPERIENCE_OK.has(p.id)),
    { exclude: ['i', 'i_f'] },
  );
  if (!parts) return null;
  const c: Clause = { ...parts, tense, form: 'yn', ...(tense === 'presPerf' ? { ppAdv: 'ever' as const } : {}) };
  const vg = verbGroup(c);
  const op = vg.op ?? 'do';
  const yes = ctx.rng.chance(0.5);
  // pronom de la réponse
  let pron: string;
  let rp: EN.Person = 3;
  let rn: EN.GNumber = c.subj.num;
  if (c.subj.person === 2) {
    pron = c.subj.num === 'sg' ? 'I' : 'we';
    rp = 1;
  } else if (c.subj.person === 1) {
    pron = 'you';
    rp = 2;
  } else pron = subjectPronounEn(c.subj);
  if (rp === 3 && c.subj.num === 'sg') rn = 'sg';
  // auxiliaire adapté au pronom de la réponse
  const answerOp = (() => {
    const v = verbOf(c);
    const tmp: Clause = { ...c, form: 'yn', subj: { ...c.subj, person: rp, num: rn } };
    const g = verbGroup(tmp);
    if (v.base === 'be' && tense === 'presSimple') return EN.beForm('present', rp, rn);
    return g.op ?? 'do';
  })();
  const negForm = answerOp === 'am' ? "'m not" : answerOp === 'can' ? "can't" : answerOp === 'will' ? "won't" : `${answerOp}n't`;
  const answerAlts = yes
    ? [`Yes, ${pron} ${answerOp}`]
    : answerOp === 'am'
      ? [`No, ${pron}'m not`, `No, ${pron} am not`]
      : [`No, ${pron} ${negForm}`, `No, ${pron} ${answerOp === 'can' ? 'cannot' : `${answerOp} not`}`];
  // « Do we…? » : « Yes, we do » est aussi correct que « Yes, you do ».
  if (c.subj.person === 1 && c.subj.num === 'pl') {
    answerAlts.push(...answerAlts.map((a) => a.replace(/\byou\b/, 'we')));
  }
  const slots: Slot[] = [s(answerAlts, { role: 'answer', proper: true })];
  const r = realizeEn(c);
  const question = r.slots.map((sl) => sl.alts[0]).join(' ');
  const qText = capitalizeFirst(question.replace(/\s+([,?])/g, '$1')) + '?';
  const v = verbOf(c);
  const mainVerb = vg.words.length ? vg.words[vg.words.length - 1][0] : v.base;
  const distractors: Distractor[] = yes
    ? [
        { text: `Yes, ${pron} ${mainVerb === answerOp ? v.base : mainVerb}`, tag: 'short_answer' },
        { text: `Yes, ${pron} ${answerOp === 'do' ? 'am' : answerOp === 'does' ? 'is' : 'do'}`, tag: 'short_answer' },
        ...(['am', 'is', 'are', 'have', 'has', 'will'].includes(answerOp)
          ? [{ text: `Yes, ${pron}${answerOp === 'am' ? "'m" : answerOp === 'are' ? "'re" : answerOp === 'will' ? "'ll" : answerOp === 'have' ? "'ve" : "'s"}`, tag: 'short_answer' }]
          : []),
        { text: `Yes, ${pron === 'I' ? 'you' : pron === 'you' ? 'I' : pron === 'he' ? 'she' : 'he'} ${answerOp}`, tag: 'pronoun_case' },
      ]
    : [
        { text: `No, ${pron} ${negForm} ${mainVerb === answerOp ? v.base : mainVerb}`, tag: 'short_answer' },
        { text: `No, ${pron} not`, tag: 'short_answer' },
        { text: `No, ${pron} ${answerOp === 'do' ? "isn't" : answerOp === 'does' ? "don't" : "doesn't"}`, tag: 'short_answer' },
      ];
  const fr = joinFrench([`${realizeFr(c)} — ${yes ? 'Oui' : 'Non'}`], '.');
  return buildItem({
    skillId: 'short_answers',
    templateId: `sa.${tense}.${yes ? 'yes' : 'no'}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [[0]],
    distractors,
    context: qText,
    instruction: `Répondez par une réponse courte ${yes ? 'affirmative (Yes…)' : 'négative (No…)'}.`,
    explanation: `Réponse courte : ${yes ? 'Yes' : 'No'} + pronom + auxiliaire de la question (${op}). ${yes ? 'Pas de contraction en fin de réponse affirmative (✗ Yes, I\'m).' : 'Le négatif se contracte : ' + negForm + '.'}`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj }),
    noFinalContraction: yes,
  });
};

// ---------------------------------------------------------------------------

const SUBJ_Q = ['break_thing', 'open_window', 'close_window', 'win_lottery', 'pay_bill', 'do_washing_up', 'cook_dinner', 'clean_room', 'eat_food', 'book_table', 'water_plants'];

export const subjectQuestions: ItemGenerator = (ctx) => {
  const subjectQ = ctx.rng.chance(0.55);
  if (subjectQ) {
    const parts = chooseParts(ctx, (p) => SUBJ_Q.includes(p.id));
    if (!parts) return null;
    const obj = parts.obj ? { ...parts.obj, det: 'the' as const } : undefined;
    if (parts.pred.obj && !parts.pred.obj.dets.includes('the')) return null;
    const c: Clause = { ...parts, obj, tense: 'pastSimple', form: 'wh', wh: 'subj' };
    const v = verbOf(c);
    const past = EN.pastSimple(v);
    return clauseItem({
      skillId: 'subject_questions',
      templateId: 'sq.subject',
      level: 'B1',
      clause: c,
      blankRoles: [['verb']],
      hints: [v.base],
      distractors: [
        { text: `did ${v.base}`, tag: 'subject_question_do' },
        { text: `did ${past}`, tag: 'subject_question_do' },
        ...(EN.isIrregular(v) ? [{ text: EN.regularEd({ base: v.base, dbl: v.dbl })[0], tag: 'irregular_past' }] : []),
      ],
      neighbours: mutate(ctx, c, ['obj']),
      instruction: 'Question portant sur le sujet : complète.',
      explanation: `« Who » est ici le SUJET (qui a fait l'action ?) : pas d'auxiliaire did, le verbe est directement au prétérit : Who ${past}…?`,
    });
  }
  const parts = chooseParts(ctx, (p) => ['call_person', 'buy_thing', 'help_person', 'wait_for_person', 'eat_food', 'read', 'watch', 'order_dish'].includes(p.id), { noYou: false });
  if (!parts) return null;
  const tense = 'pastSimple' as const;
  const c: Clause = { ...parts, tense, form: 'wh', wh: 'obj' };
  const vg = verbGroup(c);
  const op = vg.op ?? 'do';
  return clauseItem({
    skillId: 'subject_questions',
    templateId: `sq.object.${tense}`,
    level: 'B1',
    clause: c,
    blankRoles: [['aux']],
    distractors: [
      { text: tense === 'pastSimple' ? 'does' : 'did', tag: 'tense_past' },
      { text: 'is', tag: 'be_plus_base' },
      { text: op === 'do' ? 'does' : op === 'does' ? 'do' : 'was', tag: 'do_wrong_person' },
    ],
    neighbours: mutate(ctx, c, ['subj']),
    showTranslation: true,
    instruction: "Question portant sur l'objet : complète avec l'auxiliaire.",
    explanation: `Ici, « ${c.subj.en} » est le sujet et la question porte sur l'OBJET : on garde l'auxiliaire (${op}) + sujet + base verbale.`,
  });
};

// ---------------------------------------------------------------------------

export const questionTags: ItemGenerator = (ctx) => {
  const tense = ctx.rng.pick(['presSimple', 'presSimple', 'pastSimple', 'presCont', 'will', 'can', 'presPerf'] as const);
  const parts = chooseParts(
    ctx,
    (p) => (tense !== 'presCont' || allowsProgressive(p)) && (tense !== 'can' || !!p.skill) && (tense === 'presSimple' || tense === 'can' || p.k !== 'state' || !!p.be),
  );
  if (!parts) return null;
  const neg = ctx.rng.chance(0.4);
  const c: Clause = { ...parts, tense, neg };
  const vg = verbGroup({ ...c, neg: true });
  const op = vg.op ?? 'do';
  const { p, n } = pn(c);
  const pron = c.subj.pron ? (c.subj.en === 'I' ? 'I' : c.subj.en) : subjectPronounEn(c.subj);
  const negOf = (o: string) => (o === 'am' ? "aren't" : o === 'will' ? "won't" : o === 'can' ? "can't" : `${o}n't`);
  const tagAux = neg ? op : negOf(op);
  const tag = `${tagAux} ${pron}`;
  const r = realizeEn(c);
  const slots: Slot[] = [...r.slots, s(',', { role: 'punct' }), s(tag, { role: 'tag', proper: pron === 'I' })];
  const wrongPron = pron === 'he' ? 'she' : pron === 'she' ? 'he' : pron === 'they' ? 'he' : pron === 'I' ? 'you' : 'they';
  const distractors: Distractor[] = [
    { text: neg ? `${negOf(op)} ${pron}` : `${op} ${pron}`, tag: 'question_tag' },
    { text: neg ? 'is it' : "isn't it", tag: 'question_tag' },
    { text: `${tagAux} ${wrongPron}`, tag: 'question_tag' },
    ...(op !== 'do' && op !== 'does' && op !== 'did' ? [{ text: neg ? EN.doForm(p, n) + ` ${pron}` : `${EN.doForm(p, n)}n't ${pron}`, tag: 'question_tag' }] : []),
  ];
  const fr = joinFrench([`${realizeFr(c).replace(/\.$/, '')}, n'est-ce pas`], '?');
  return buildItem({
    skillId: 'question_tags',
    templateId: `qt.${tense}.${neg ? 'neg' : 'aff'}`,
    level: 'B1',
    slots,
    end: '?',
    fr,
    blankGroups: [indicesByRole(slots, ['tag'])],
    distractors,
    explanation: `Phrase ${neg ? 'négative → tag affirmatif' : 'affirmative → tag négatif'}, avec l'auxiliaire de la phrase (${op === 'am' ? 'am → aren\'t I' : op}) et le pronom « ${pron} ».`,
    lexemes: lexemesOf({ subj: c.subj, pred: c.pred, obj: c.obj }),
  });
};

export { cap };
