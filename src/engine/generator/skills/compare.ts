/**
 * Comparer et décrire : comparatifs, superlatifs, as … as, too / enough,
 * adverbes de manière, adjectifs en -ed / -ing.
 */
import * as EN from '@/engine/lang/en/morphology';
import * as FR from '@/engine/lang/fr/morphology';
import { s, type Slot } from '@/engine/core/lattice';
import { joinFrench } from '@/engine/core/text';
import { ADJECTIVES, MANNER_ADVERBS, adjectivesFor } from '@/content/lexicon/adjectives';
import { NOUNS } from '@/content/lexicon/nouns';
import { NAMES, PEOPLE, frPersonOf } from '@/content/lexicon/subjects';
import type { AdjEntry, Predicate, Subject } from '@/content/lexicon/types';
import type { Clause } from '../clause';
import { buildItem, clauseItem, indicesByRole } from '../item';
import { pickSubject, pickTime } from '../pick';
import type { Distractor, GenContext, ItemGenerator } from '../types';
import { mutate } from './common';

function words(text: string, role = 'w'): Slot[] {
  return text.split(' ').filter(Boolean).map((w) => s(w, { role, proper: w === 'I' || /^[A-Z]/.test(w) }));
}

function frAdj(a: AdjEntry, g: 'm' | 'f', plural: boolean): string {
  return FR.adjForm(a.fr, g, plural);
}

/** « plus grand » / « meilleur » / « moins cher » accordé. */
function frComparative(a: AdjEntry, g: 'm' | 'f', plural: boolean): string {
  if (a.fcmp) {
    const [m, f] = a.fcmp.split(';');
    const base = g === 'f' ? f : m;
    return plural && !/s$/.test(base) ? `${base}s` : base;
  }
  return `plus ${frAdj(a, g, plural)}`;
}

const TONIC: Record<string, string> = { me: 'moi', you: 'toi', him: 'lui', her: 'elle', us: 'nous', them: 'eux' };
const OBJ_ALTS: Record<string, string[]> = {
  me: ['me', 'I am', 'I'],
  you: ['you', 'you are'],
  him: ['him', 'he is', 'he'],
  her: ['her', 'she is', 'she'],
  us: ['us', 'we are', 'we'],
  them: ['them', 'they are', 'they'],
};

function cmpDistractors(a: AdjEntry, withThan = true): Distractor[] {
  const t = withThan ? ' than' : '';
  const er = EN.comparativeForms({ en: a.en, cmp: a.cmp === 'more' ? 'er' : a.cmp, dbl: a.dbl })[0];
  const out: Distractor[] = [];
  if (a.cmp === 'er' || a.cmp === 'both') {
    if (a.cmp === 'er') out.push({ text: `more ${a.en}${t}`, tag: 'comparative_form' });
    out.push({ text: `more ${er}${t}`, tag: 'comparative_double' });
  } else if (a.cmp === 'more') {
    out.push({ text: `${a.en}er${t}`.replace(/eer/, 'er'), tag: 'comparative_form' });
    out.push({ text: `most ${a.en}${t}`, tag: 'superlative_form' });
  } else {
    const [cmp] = a.cmp.split('|');
    out.push({ text: `${a.en}er${t}`.replace('gooder', 'gooder').replace('bader', 'badder'), tag: 'comparative_form' });
    out.push({ text: `more ${cmp}${t}`, tag: 'comparative_double' });
  }
  const correct = EN.comparativeForms({ en: a.en, cmp: a.cmp, dbl: a.dbl })[0];
  if (withThan) {
    out.push({ text: `${correct} that`, tag: 'than_that' });
    out.push({ text: `${correct} as`, tag: 'than_that' });
  }
  return out;
}

const THINGS: { cat: string; nouns: string[] }[] = [
  { cat: 'vehicle', nouns: ['car', 'bike', 'motorbike', 'scooter'] },
  { cat: 'device', nouns: ['phone', 'laptop', 'computer', 'tablet', 'camera'] },
  { cat: 'home', nouns: ['house', 'flat'] },
  { cat: 'clothes', nouns: ['jacket', 'coat', 'dress', 'jumper', 'scarf'] },
  { cat: 'place', nouns: ['restaurant', 'hotel', 'cafe', 'museum', 'cinema'] },
  { cat: 'media', nouns: ['film', 'book', 'series', 'documentary', 'novel'] },
];

function pickThing(ctx: GenContext) {
  const group = ctx.rng.pick(THINGS);
  const noun = NOUNS.find((n) => n.id === ctx.rng.pick(group.nouns));
  if (!noun) return null;
  const adjs = adjectivesFor(group.cat, ctx.level).filter((a) => !['new', 'old_t'].includes(a.id) || group.cat !== 'device');
  if (!adjs.length) return null;
  return { noun, adj: ctx.rng.pick(adjs), cat: group.cat };
}

function personPair(ctx: GenContext): { a: Subject; b: { en: string; fr: string; obj?: string } } {
  const a = ctx.rng.pick([...NAMES, ...PEOPLE.filter((p) => !p.child || ctx.rng.chance(0.3))]);
  if (ctx.rng.chance(0.4)) {
    const obj = ctx.rng.pick(['me', 'you', 'him', 'her', 'us', 'them']);
    return { a, b: { en: obj, fr: TONIC[obj], obj } };
  }
  const b = ctx.rng.pick([...NAMES, ...PEOPLE].filter((x) => x.id !== a.id && x.en !== a.en));
  return { a, b: { en: b.en, fr: b.fr } };
}

export const comparatives: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['people', 'people', 'this', 'mine'] as const);
  if (kind === 'people') {
    const { a, b } = personPair(ctx);
    const adj = ctx.rng.pick(adjectivesFor('person', ctx.level).filter((x) => x.id !== 'busy_p'));
    const plural = a.num === 'pl';
    const be = plural ? 'are' : 'is';
    const cmp = EN.comparativeForms(adj);
    const slots: Slot[] = [
      s(a.en, { role: 'subj', proper: !!a.proper }),
      s(be, { role: 'be' }),
      s(cmp, { role: 'cmp' }),
      s('than', { role: 'than' }),
      s(b.obj ? OBJ_ALTS[b.obj] : [b.en], { role: 'obj', proper: /^[A-Z]/.test(b.en) }),
    ];
    const fr = joinFrench([FR.frJoin([a.fr, plural ? 'sont' : 'est', ...frComparative(adj, a.g, plural).split(' '), 'que', ...b.fr.split(' ')])], '.');
    return buildItem({
      skillId: 'comparatives',
      templateId: `cmp.people.${adj.cmp.includes('|') ? 'irr' : adj.cmp}`,
      level: 'A2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['cmp', 'than'])],
      hints: [adj.en],
      distractors: cmpDistractors(adj),
      explanation: comparativeExplanation(adj),
      lexemes: [`adj:${adj.id}`, `subj:${a.id}`],
    });
  }
  const t = pickThing(ctx);
  if (!t) return null;
  const { noun, adj } = t;
  const plural = !noun.po && !noun.u && ctx.rng.chance(0.25);
  const nEn = plural ? EN.pluralize(noun.en) : noun.en;
  const frNoun = { fr: noun.fr, g: noun.g, pl: noun.fpl };
  const cmp = EN.comparativeForms(adj);
  const be = plural ? 'are' : 'is';
  if (kind === 'this') {
    const thisW = plural ? 'These' : 'This';
    const that = plural ? ['those', 'those ones'] : ['that one', 'that'];
    const slots: Slot[] = [s(thisW, { role: 'det', proper: true }), s(nEn, { role: 'obj' }), s(be, { role: 'be' }), s(cmp, { role: 'cmp' }), s('than', { role: 'than' }), s(that, { role: 'obj2' })];
    const celui = plural ? (noun.g === 'f' ? 'celles-là' : 'ceux-là') : noun.g === 'f' ? 'celle-là' : 'celui-là';
    const fr = joinFrench([FR.frJoin([...FR.frNP(frNoun, 'dem', { plural }), plural ? 'sont' : 'est', ...frComparative(adj, noun.g, plural).split(' '), 'que', celui])], '.');
    return buildItem({
      skillId: 'comparatives',
      templateId: `cmp.this.${adj.cmp.includes('|') ? 'irr' : adj.cmp}`,
      level: 'A2',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['cmp', 'than'])],
      hints: [adj.en],
      distractors: cmpDistractors(adj),
      explanation: comparativeExplanation(adj),
      lexemes: [`adj:${adj.id}`, `noun:${noun.id}`],
    });
  }
  const owner = ctx.rng.pick([
    { en: 'My', pron: 'yours', fr: 0, frPron: { m: 'le tien', f: 'la tienne', mpl: 'les tiens', fpl: 'les tiennes' } },
    { en: 'Your', pron: 'mine', fr: 1, frPron: { m: 'le mien', f: 'la mienne', mpl: 'les miens', fpl: 'les miennes' } },
    { en: 'Our', pron: 'theirs', fr: 3, frPron: { m: 'le leur', f: 'la leur', mpl: 'les leurs', fpl: 'les leurs' } },
  ]);
  const slots: Slot[] = [s(owner.en, { role: 'det', proper: true }), s(nEn, { role: 'obj' }), s(be, { role: 'be' }), s(cmp, { role: 'cmp' }), s('than', { role: 'than' }), s(owner.pron, { role: 'obj2' })];
  const pr = plural ? (noun.g === 'f' ? owner.frPron.fpl : owner.frPron.mpl) : noun.g === 'f' ? owner.frPron.f : owner.frPron.m;
  const fr = joinFrench([FR.frJoin([...FR.frNP(frNoun, 'poss', { plural, possessor: { person: owner.fr as FR.FrPerson } }), plural ? 'sont' : 'est', ...frComparative(adj, noun.g, plural).split(' '), 'que', ...pr.split(' ')])], '.');
  return buildItem({
    skillId: 'comparatives',
    templateId: `cmp.mine.${adj.cmp.includes('|') ? 'irr' : adj.cmp}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['cmp', 'than'])],
    hints: [adj.en],
    distractors: cmpDistractors(adj),
    explanation: comparativeExplanation(adj),
    lexemes: [`adj:${adj.id}`, `noun:${noun.id}`],
  });
};

function comparativeExplanation(a: AdjEntry): string {
  const forms = EN.comparativeForms(a);
  if (a.cmp === 'er') return `Adjectif court → -er : ${a.en} → ${forms[0]}${a.dbl ? ' (consonne doublée)' : /y$/.test(a.en) ? ' (y → ier)' : ''}, puis than.`;
  if (a.cmp === 'more') return `Adjectif long → more + adjectif : more ${a.en} than.`;
  if (a.cmp === 'both') return `${a.en} accepte les deux formes : ${forms.join(' / ')} than.`;
  return `Comparatif irrégulier : ${a.en} → ${forms[0]} (than).`;
}

// ---------------------------------------------------------------------------

const ROOMS_ADJ = ['big', 'small', 'bright', 'dark', 'quiet', 'clean', 'comfortable', 'modern', 'beautiful'];

export const superlatives: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['room', 'place', 'person', 'ever'] as const);
  let adj: AdjEntry;
  let slots: Slot[];
  let fr: string;
  const supSlot = (a: AdjEntry) => s(EN.superlativeForms(a).map((x) => `the ${x}`), { role: 'sup' });
  if (kind === 'room' || kind === 'place') {
    const roomNouns = [
      { en: ['room'], fr: 'pièce', g: 'f' as const },
      { en: ['bedroom'], fr: 'chambre', g: 'f' as const },
    ];
    const placeNouns = NOUNS.filter((n) => ['restaurant', 'hotel', 'cafe', 'museum', 'cinema'].includes(n.id)).map((n) => ({ en: [n.en, ...n.syn], fr: n.fr, g: n.g }));
    const noun = ctx.rng.pick(kind === 'room' ? roomNouns : placeNouns);
    const adjs = kind === 'room' ? ADJECTIVES.filter((a) => ROOMS_ADJ.includes(a.id) && (ctx.level === 'B1' || a.lv === 'A2')) : adjectivesFor('place', ctx.level);
    adj = ctx.rng.pick(adjs);
    const container = kind === 'room' ? { en: 'in the house', fr: ['de', 'la', 'maison'] } : { en: 'in the town', fr: ['de', 'la', 'ville'] };
    slots = [...words('This is', 'pre'), supSlot(adj), s(noun.en, { role: 'obj' }), ...words(container.en, 'post')];
    const frN = { fr: noun.fr, g: noun.g };
    const art = frN.g === 'f' ? 'la' : 'le';
    let np: string[];
    if (adj.fcmp) {
      const [m, f] = adj.fcmp.split(';');
      const word = frN.g === 'f' ? f : m;
      np = adj.fpre ? [art, ...word.split(' '), frN.fr] : [...FR.frNP(frN, 'def'), art, ...word.split(' ')];
    } else if (adj.fpre) np = [art, 'plus', frAdj(adj, frN.g, false), frN.fr];
    else np = [...FR.frNP(frN, 'def'), art, 'plus', frAdj(adj, frN.g, false)];
    fr = joinFrench([FR.frJoin(["c'est", ...np, ...container.fr])], '.');
  } else if (kind === 'person') {
    const subj = ctx.rng.pick([...NAMES, ...PEOPLE.filter((p) => p.num === 'sg')]);
    adj = ctx.rng.pick(adjectivesFor('person', ctx.level).filter((x) => !['busy_p'].includes(x.id)));
    const group = ctx.rng.pick([
      { en: 'in my family', fr: ['de', 'ma', 'famille'] },
      { en: 'in the class', fr: ['de', 'la', 'classe'] },
      { en: 'in our team', fr: ['de', 'notre', 'équipe'] },
    ]);
    slots = [s(subj.en, { role: 'subj', proper: !!subj.proper }), s('is', { role: 'be' }), supSlot(adj), ...words(group.en, 'post')];
    const art = subj.g === 'f' ? 'la' : 'le';
    const core = adj.fcmp ? [art, ...(subj.g === 'f' ? adj.fcmp.split(';')[1] : adj.fcmp.split(';')[0]).split(' ')] : [art, 'plus', frAdj(adj, subj.g, false)];
    fr = joinFrench([FR.frJoin([subj.fr, 'est', ...core, ...group.fr])], '.');
  } else {
    const media = ctx.rng.pick([
      { en: 'film', fr: 'film', g: 'm' as const, verb: 'seen', fv: 'vu' },
      { en: 'book', fr: 'livre', g: 'm' as const, verb: 'read', fv: 'lu' },
      { en: 'series', fr: 'série', g: 'f' as const, verb: 'watched', fv: 'regardée' },
      { en: 'meal', fr: 'repas', g: 'm' as const, verb: 'eaten', fv: 'mangé' },
    ]);
    adj = ctx.rng.pick(ADJECTIVES.filter((a) => ['good', 'bad', 'interesting', 'boring', 'funny', 'exciting', 'delicious'].includes(a.id) && (media.en === 'meal' ? ['good', 'bad', 'delicious'].includes(a.id) : a.id !== 'delicious') && (ctx.level === 'B1' || a.lv === 'A2')));
    slots = [...words("It's", 'pre'), supSlot(adj), s(media.en, { role: 'obj' }), ...words(`I have ever ${media.verb}`, 'post')];
    const art = media.g === 'f' ? 'la' : 'le';
    const np = adj.fcmp ? [art, media.g === 'f' ? adj.fcmp.split(';')[1] : adj.fcmp.split(';')[0], media.fr] : [art, media.fr, art, 'plus', frAdj(adj, media.g, false)];
    fr = joinFrench([FR.frJoin(["c'est", ...np, 'que', "j'aie", 'jamais', media.fv])], '.');
  }
  const sup = EN.superlativeForms(adj)[0];
  const cmp = EN.comparativeForms(adj)[0];
  const distractors: Distractor[] = [
    { text: `the ${cmp}`, tag: 'superlative_form' },
    { text: sup, tag: 'superlative_form' },
    ...(adj.cmp === 'er' ? [{ text: `the most ${adj.en}`, tag: 'superlative_form' }, { text: `the most ${sup}`, tag: 'comparative_double' }] : []),
    ...(adj.cmp === 'more' ? [{ text: `the ${adj.en}est`.replace(/eest$/, 'est'), tag: 'superlative_form' }] : []),
    ...(adj.cmp.includes('|') ? [{ text: `the ${adj.en}est`, tag: 'superlative_form' }] : []),
  ];
  return buildItem({
    skillId: 'superlatives',
    templateId: `sup.${kind}.${adj.cmp.includes('|') ? 'irr' : adj.cmp}`,
    level: 'A2',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['sup'])],
    hints: [adj.en],
    distractors,
    explanation:
      adj.cmp === 'er'
        ? `Superlatif d'un adjectif court : the + -est (${sup}). Après le superlatif : in + lieu/groupe.`
        : adj.cmp === 'more'
          ? `Superlatif d'un adjectif long : the most + adjectif (${sup}).`
          : adj.cmp === 'both'
            ? `${adj.en} accepte the ${EN.superlativeForms(adj).join(' / the ')}.`
            : `Superlatif irrégulier : ${adj.en} → the ${sup}.`,
    lexemes: [`adj:${adj.id}`],
  });
};

// ---------------------------------------------------------------------------

export const asAsTooEnough: ItemGenerator = (ctx) => {
  const kind = ctx.rng.pick(['as', 'notas', 'too', 'enough'] as const);
  if (kind === 'as' || kind === 'notas') {
    const { a, b } = personPair(ctx);
    const adj = ctx.rng.pick(adjectivesFor('person', ctx.level).filter((x) => x.id !== 'busy_p'));
    const plural = a.num === 'pl';
    const be = kind === 'notas' ? (plural ? ["aren't", 'are not'] : ["isn't", 'is not']) : [plural ? 'are' : 'is'];
    const slots: Slot[] = [
      s(a.en, { role: 'subj', proper: !!a.proper }),
      s(be, { role: 'be' }),
      s('as', { role: 'as1' }),
      s(adj.en, { role: 'adj' }),
      s('as', { role: 'as2' }),
      s(b.obj ? OBJ_ALTS[b.obj] : [b.en], { role: 'obj', proper: /^[A-Z]/.test(b.en) }),
    ];
    const verbFr = kind === 'notas' ? ['ne', plural ? 'sont' : 'est', 'pas'] : [plural ? 'sont' : 'est'];
    const fr = joinFrench([FR.frJoin([a.fr, ...verbFr, 'aussi', frAdj(adj, a.g, plural), 'que', ...b.fr.split(' ')])], '.');
    return buildItem({
      skillId: 'as_as_too_enough',
      templateId: `asas.${kind}`,
      level: 'B1',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['as1', 'adj', 'as2'])],
      hints: [adj.en],
      distractors: [
        { text: `as ${adj.en} than`, tag: 'as_as' },
        { text: `as ${EN.comparativeForms(adj)[0]} as`, tag: 'as_as' },
        { text: `so ${adj.en} that`, tag: 'as_as' },
      ],
      explanation: `Égalité : as + adjectif (forme simple) + as. ${kind === 'notas' ? 'not as … as = moins … que.' : ''}`,
      lexemes: [`adj:${adj.id}`],
    });
  }
  if (kind === 'too') {
    const item = ctx.rng.pick([
      { en: 'coffee', fr: 'café', g: 'm' as const, adjs: ['hot', 'strong', 'sweet', 'cold'] },
      { en: 'soup', fr: 'soupe', g: 'f' as const, adjs: ['hot', 'cold', 'spicy'] },
      { en: 'jacket', fr: 'veste', g: 'f' as const, adjs: ['expensive', 'big', 'small', 'heavy'] },
      { en: 'restaurant', fr: 'restaurant', g: 'm' as const, adjs: ['expensive', 'noisy'] },
      { en: 'bag', fr: 'sac', g: 'm' as const, adjs: ['heavy', 'small', 'expensive'] },
      { en: 'film', fr: 'film', g: 'm' as const, adjs: ['long', 'boring'] },
      { en: 'street', fr: 'rue', g: 'f' as const, adjs: ['noisy', 'narrow', 'dangerous'] },
    ]);
    const adj = ADJECTIVES.find((a) => a.id === ctx.rng.pick(item.adjs));
    if (!adj || (ctx.level === 'A2' && adj.lv === 'B1')) return null;
    const past = ctx.rng.chance(0.4);
    const slots: Slot[] = [s('This', { role: 'det', proper: true }), s(item.en, { role: 'obj' }), s(past ? 'was' : 'is', { role: 'be' }), s('too', { role: 'too' }), s(adj.en, { role: 'adj' })];
    const fr = joinFrench([FR.frJoin([...FR.frNP({ fr: item.fr, g: item.g }, 'dem'), past ? 'était' : 'est', 'trop', frAdj(adj, item.g, false)])], '.');
    return buildItem({
      skillId: 'as_as_too_enough',
      templateId: `asas.too.${adj.id}`,
      level: 'B1',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['too'])],
      distractors: [
        { text: 'to', tag: 'too_enough' },
        { text: 'too much', tag: 'too_enough' },
        { text: 'enough', tag: 'too_enough' },
      ],
      explanation: `too + adjectif = « trop » (avec une idée de problème). Attention à l'orthographe : too (trop) ≠ to (préposition).`,
      lexemes: [`adj:${adj.id}`],
    });
  }
  const e = ctx.rng.pick([
    { adj: 'old', fr: { m: 'âgé', f: 'âgée' }, todo: 'to drive', frTodo: 'pour conduire' },
    { adj: 'old', fr: { m: 'âgé', f: 'âgée' }, todo: 'to vote', frTodo: 'pour voter' },
    { adj: 'old', fr: { m: 'âgé', f: 'âgée' }, todo: 'to travel alone', frTodo: 'pour voyager seul' },
    { adj: 'tall', fr: { m: 'grand', f: 'grande' }, todo: 'to reach the top shelf', frTodo: "pour atteindre l'étagère du haut" },
    { adj: 'strong', fr: { m: 'fort', f: 'forte' }, todo: 'to carry this box', frTodo: 'pour porter ce carton' },
    { adj: 'fast', fr: { m: 'rapide', f: 'rapide' }, todo: 'to win the race', frTodo: 'pour gagner la course' },
  ]);
  const subj = pickSubject(ctx, { pronouns: 0.4, adult: false });
  const neg = ctx.rng.chance(0.6);
  const plural = subj.num === 'pl';
  const beForm = EN.beForm('present', subj.person, subj.num);
  const be = neg ? (beForm === 'am' ? ['am not'] : [`${beForm}n't`, `${beForm} not`]) : [beForm];
  const subjSlot = s(subj.en, { role: 'subj', proper: !!subj.proper });
  const slots: Slot[] = [subjSlot, s(be, { role: 'be' }), s(e.adj, { role: 'adj' }), s('enough', { role: 'enough' }), ...words(e.todo, 'post')];
  const fp = frPersonOf(subj);
  const etre = FR.present(FR.ETRE, fp);
  let frAdjWord = subj.g === 'f' ? e.fr.f : e.fr.m;
  if (plural && !/s$/.test(frAdjWord)) frAdjWord += 's';
  const todoFr = e.frTodo.replace('seul', subj.g === 'f' ? (plural ? 'seules' : 'seule') : plural ? 'seuls' : 'seul');
  const fr = joinFrench([FR.frJoin([subj.fr, ...(neg ? ['ne', etre, 'pas'] : [etre]), 'assez', frAdjWord, ...todoFr.split(' ')])], '.');
  return buildItem({
    skillId: 'as_as_too_enough',
    templateId: `asas.enough.${neg ? 'neg' : 'aff'}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['adj', 'enough'])],
    hints: [`${e.adj} / enough`],
    distractors: [
      { text: `enough ${e.adj}`, tag: 'too_enough' },
      { text: `too ${e.adj}`, tag: 'meaning' },
      { text: `${e.adj} enought`, tag: 'spelling' },
    ],
    explanation: `adjectif + enough (= assez … pour) : ${e.adj} enough ${e.todo}. enough se place APRÈS l'adjectif.`,
    lexemes: [`adj:${e.adj}`],
  });
};

// ---------------------------------------------------------------------------
// Adverbes de manière

const MANNER_PREDS: Record<string, Predicate> = {
  drive: { id: 'm_drive', v: 'drive', fv: 'conduire', k: 'act', lv: 'A2' },
  speak: { id: 'm_speak', v: 'speak', fv: 'parler', k: 'act', lv: 'A2' },
  speak_en: { id: 'm_speak_en', v: 'speak', tail: 'English', fv: 'parler', ftail: 'anglais', k: 'act', lv: 'A2' },
  walk: { id: 'm_walk', v: 'walk', fv: 'marcher', k: 'act', lv: 'A2' },
  eat: { id: 'm_eat', v: 'eat', fv: 'manger', k: 'act', lv: 'A2' },
  work: { id: 'm_work', v: 'work', fv: 'travailler', k: 'act', lv: 'A2', adult: true },
  run: { id: 'm_run', v: 'run', fv: 'courir', k: 'act', lv: 'A2' },
  sing: { id: 'm_sing', v: 'sing', fv: 'chanter', k: 'act', lv: 'A2' },
  dance: { id: 'm_dance', v: 'dance', fv: 'danser', k: 'act', lv: 'A2' },
  cook: { id: 'm_cook', v: 'cook', fv: 'cuisiner', k: 'act', lv: 'A2' },
  swim: { id: 'm_swim', v: 'swim', fv: 'nager', k: 'act', lv: 'A2' },
  play_piano: { id: 'm_piano', v: 'play', tail: 'the piano', fv: 'jouer', ftail: 'du piano', k: 'act', lv: 'A2' },
  sleep: { id: 'm_sleep', v: 'sleep', fv: 'dormir', k: 'act', lv: 'A2' },
  study: { id: 'm_study', v: 'study', fv: 'étudier', k: 'act', lv: 'A2' },
  explain: { id: 'm_explain', v: 'explain', tail: 'things', fv: 'expliquer', ftail: 'les choses', k: 'act', lv: 'A2' },
  wait: { id: 'm_wait', v: 'wait', fv: 'attendre', k: 'act', lv: 'A2' },
  answer: { id: 'm_answer', v: 'answer', tail: 'the questions', fv: 'répondre', ftail: 'aux questions', k: 'act', lv: 'A2' },
  win: { id: 'm_win', v: 'win', tail: 'the match', fv: 'gagner', ftail: 'le match', k: 'evt', lv: 'A2' },
};

const ADV_ERRORS: Record<string, string> = {
  carefully: 'carefuly',
  easily: 'easyly',
  happily: 'happyly',
  beautifully: 'beautifuly',
  patiently: 'patientely',
  dangerously: 'dangerousely',
  healthily: 'healthyly',
  fluently: 'fluentely',
};

export const adverbsManner: ItemGenerator = (ctx) => {
  const adv = ctx.rng.pick(MANNER_ADVERBS);
  const key = ctx.rng.pick(adv.with);
  const pred = MANNER_PREDS[key];
  if (!pred) return null;
  const subj = pickSubject(ctx, { adult: !!pred.adult });
  const tense = pred.k === 'evt' ? 'pastSimple' : ctx.rng.chance(0.6) ? 'presSimple' : 'pastSimple';
  const c: Clause = {
    subj,
    pred,
    tense,
    manner: { en: adv.en, fr: adv.fr },
    ...(tense === 'pastSimple' ? { time: pickTime(ctx, ['past'], (t) => ['yesterday', 'last_week', 'last_weekend', 'last_night'].includes(t.id)) } : {}),
  };
  const adjWord = adv.adj;
  const distractors: Distractor[] = [{ text: adjWord, tag: 'adverb_adjective' }];
  if (ADV_ERRORS[adv.en]) distractors.push({ text: ADV_ERRORS[adv.en], tag: 'spelling' });
  if (adv.en === 'well') distractors.push({ text: 'goodly', tag: 'adverb_adjective' });
  if (adv.en === 'fast') distractors.push({ text: 'fastly', tag: 'adverb_adjective' });
  if (adv.en === 'hard') distractors.push({ text: 'hardly', tag: 'meaning' });
  return clauseItem({
    skillId: 'adverbs_manner',
    templateId: `adv.${adv.en}`,
    level: 'B1',
    clause: c,
    blankRoles: [['manner']],
    hints: [adjWord],
    distractors,
    neighbours: mutate(ctx, c, ['subj']),
    explanation:
      adv.en === 'well'
        ? "L'adverbe de good est well (irrégulier) : she sings well (✗ good)."
        : adv.en === 'fast' || adv.en === 'hard'
          ? `${adv.en} est à la fois adjectif et adverbe (✗ ${adv.en}ly${adv.en === 'hard' ? ' : hardly signifie « à peine »' : ''}).`
          : `Pour décrire comment on fait l'action, on utilise l'adverbe : ${adjWord} → ${adv.en}.`,
  });
};

// ---------------------------------------------------------------------------
// Adjectifs en -ed / -ing

interface EdIng {
  stem: string;
  ed: string;
  ing: string;
  frEd: { m: string; f: string } | 'ennuyer';
  frIng: { m: string; f: string };
  things: string[];
  ctx?: { en: string; fr: string; things: string[] };
}

const THINGS_FR: Record<string, { fr: string; g: 'm' | 'f'; pl?: boolean }> = {
  film: { fr: 'film', g: 'm' }, book: { fr: 'livre', g: 'm' }, trip: { fr: 'voyage', g: 'm' }, lesson: { fr: 'leçon', g: 'f' },
  match: { fr: 'match', g: 'm' }, news: { fr: 'nouvelle', g: 'f' }, exam: { fr: 'examen', g: 'm' }, party: { fr: 'fête', g: 'f' },
  journey: { fr: 'trajet', g: 'm' }, day: { fr: 'journée', g: 'f' }, meeting: { fr: 'réunion', g: 'f' }, situation: { fr: 'situation', g: 'f' },
  story: { fr: 'histoire', g: 'f' }, concert: { fr: 'concert', g: 'm' }, weekend: { fr: 'week-end', g: 'm' }, museum: { fr: 'musée', g: 'm' },
  result: { fr: 'résultat', g: 'm' }, holiday: { fr: 'vacances', g: 'f', pl: true }, noise: { fr: 'bruit', g: 'm' }, view: { fr: 'vue', g: 'f' },
  problem: { fr: 'problème', g: 'm' }, meal: { fr: 'repas', g: 'm' }, dream: { fr: 'rêve', g: 'm' }, mistake: { fr: 'erreur', g: 'f' },
};

const ED_ING: EdIng[] = [
  { stem: 'bore', ed: 'bored', ing: 'boring', frEd: 'ennuyer', frIng: { m: 'ennuyeux', f: 'ennuyeuse' }, things: ['film', 'book', 'lesson', 'match', 'meeting', 'concert', 'weekend', 'museum', 'trip'], ctx: { en: 'during the', fr: 'pendant', things: ['film', 'lesson', 'meeting', 'concert', 'match'] } },
  { stem: 'interest', ed: 'interested', ing: 'interesting', frEd: { m: 'intéressé', f: 'intéressée' }, frIng: { m: 'intéressant', f: 'intéressante' }, things: ['film', 'book', 'lesson', 'story', 'museum', 'trip', 'meeting'] },
  { stem: 'tire', ed: 'tired', ing: 'tiring', frEd: { m: 'fatigué', f: 'fatiguée' }, frIng: { m: 'fatigant', f: 'fatigante' }, things: ['trip', 'journey', 'day', 'match', 'meeting'], ctx: { en: 'after the', fr: 'après', things: ['trip', 'journey', 'match', 'party', 'meeting'] } },
  { stem: 'excite', ed: 'excited', ing: 'exciting', frEd: { m: 'enthousiaste', f: 'enthousiaste' }, frIng: { m: 'passionnant', f: 'passionnante' }, things: ['film', 'book', 'match', 'story', 'trip', 'concert'] },
  { stem: 'surprise', ed: 'surprised', ing: 'surprising', frEd: { m: 'surpris', f: 'surprise' }, frIng: { m: 'surprenant', f: 'surprenante' }, things: ['news', 'story', 'result', 'situation'], ctx: { en: 'by the', fr: 'par', things: ['news', 'result'] } },
  { stem: 'disappoint', ed: 'disappointed', ing: 'disappointing', frEd: { m: 'déçu', f: 'déçue' }, frIng: { m: 'décevant', f: 'décevante' }, things: ['film', 'match', 'result', 'concert', 'meal', 'book'], ctx: { en: 'by the', fr: 'par', things: ['result', 'film', 'meal'] } },
  { stem: 'frighten', ed: 'frightened', ing: 'frightening', frEd: { m: 'effrayé', f: 'effrayée' }, frIng: { m: 'effrayant', f: 'effrayante' }, things: ['film', 'story', 'dream', 'situation'], ctx: { en: 'during the', fr: 'pendant', things: ['film'] } },
  { stem: 'embarrass', ed: 'embarrassed', ing: 'embarrassing', frEd: { m: 'gêné', f: 'gênée' }, frIng: { m: 'gênant', f: 'gênante' }, things: ['situation', 'mistake'] },
  { stem: 'relax', ed: 'relaxed', ing: 'relaxing', frEd: { m: 'détendu', f: 'détendue' }, frIng: { m: 'reposant', f: 'reposante' }, things: ['weekend', 'day', 'trip', 'holiday'], ctx: { en: 'after the', fr: 'après', things: ['weekend', 'holiday'] } },
  { stem: 'annoy', ed: 'annoyed', ing: 'annoying', frEd: { m: 'agacé', f: 'agacée' }, frIng: { m: 'agaçant', f: 'agaçante' }, things: ['situation', 'noise', 'problem', 'meeting'], ctx: { en: 'by the', fr: 'par', things: ['noise'] } },
  { stem: 'amaze', ed: 'amazed', ing: 'amazing', frEd: { m: 'émerveillé', f: 'émerveillée' }, frIng: { m: 'incroyable', f: 'incroyable' }, things: ['trip', 'concert', 'film', 'view', 'day'], ctx: { en: 'by the', fr: 'par', things: ['view', 'concert'] } },
  { stem: 'worry', ed: 'worried', ing: 'worrying', frEd: { m: 'inquiet', f: 'inquiète' }, frIng: { m: 'inquiétant', f: 'inquiétante' }, things: ['news', 'situation', 'problem', 'result'], ctx: { en: 'about the', fr: 'pour', things: ['exam', 'situation', 'result'] } },
  { stem: 'shock', ed: 'shocked', ing: 'shocking', frEd: { m: 'choqué', f: 'choquée' }, frIng: { m: 'choquant', f: 'choquante' }, things: ['news', 'story', 'film', 'situation'], ctx: { en: 'by the', fr: 'par', things: ['news', 'film'] } },
];

const ED_SPELLING: Record<string, string> = { boring: 'boreing', bored: 'boreed', interesting: 'intresting', tired: 'tierd', worried: 'worryed', worrying: 'woring', surprised: 'surprized', amazing: 'amazeing', relaxing: 'relaxxing', embarrassing: 'embarassing', embarrassed: 'embarassed', disappointing: 'dissapointing', disappointed: 'dissapointed', frightened: 'frightend' };

export const edIngAdjectives: ItemGenerator = (ctx) => {
  const pair = ctx.rng.pick(ED_ING);
  const thing = ctx.rng.chance(0.5);
  const past = ctx.rng.chance(0.65);
  if (thing) {
    const tId = ctx.rng.pick(pair.things);
    const t = THINGS_FR[tId];
    if (!t) return null;
    const slots: Slot[] = [s('The', { role: 'det', proper: true }), s(tId, { role: 'obj' }), s(past ? 'was' : 'is', { role: 'be' }), s(pair.ing, { role: 'adj' })];
    const art = t.pl ? 'les' : FR.startsWithVowelSound(t.fr) ? "l'" : t.g === 'f' ? 'la' : 'le';
    const etre = t.pl ? (past ? 'étaient' : 'sont') : past ? 'était' : 'est';
    const adjFr = FR.adjForm({ m: pair.frIng.m, f: pair.frIng.f }, t.g, !!t.pl);
    const fr = joinFrench([FR.frJoin([art === "l'" ? `l'${t.fr}` : art, ...(art === "l'" ? [] : [t.fr]), etre, adjFr])], '.');
    return buildItem({
      skillId: 'ed_ing_adjectives',
      templateId: `edi.thing.${pair.stem}`,
      level: 'B1',
      slots,
      end: '.',
      fr,
      blankGroups: [indicesByRole(slots, ['adj'])],
      hints: [pair.stem],
      distractors: [{ text: pair.ed, tag: 'ed_ing' }, ...(ED_SPELLING[pair.ing] ? [{ text: ED_SPELLING[pair.ing], tag: 'spelling' }] : [])],
      explanation: `« The ${tId} » est la CAUSE du sentiment → adjectif en -ing : ${pair.ing}. (Une personne qui ressent : ${pair.ed}.)`,
      lexemes: [`edi:${pair.stem}`],
    });
  }
  const subj = pickSubject(ctx, { pronouns: 0.5 });
  const be = past ? EN.beForm('past', subj.person, subj.num) : EN.beForm('present', subj.person, subj.num);
  const withCtx = pair.ctx && ctx.rng.chance(0.6);
  const ctxThing = withCtx ? ctx.rng.pick(pair.ctx!.things) : null;
  const slots: Slot[] = [s(subj.en, { role: 'subj', proper: !!subj.proper }), s(be, { role: 'be' }), s(pair.ed, { role: 'adj' }), ...(ctxThing ? words(`${pair.ctx!.en} ${ctxThing}`, 'post') : [])];
  const fp = frPersonOf(subj);
  const plural = subj.num === 'pl';
  let frWords: string[];
  if (pair.frEd === 'ennuyer') {
    const v = { inf: 'ennuyer', pres: 'ennuie|ennuies|ennuie|ennuyons|ennuyez|ennuient', fut: 'ennuier' };
    frWords = [subj.fr, ...FR.frVerbPhrase(v, { tense: past ? 'imparfait' : 'present', person: fp, gender: subj.g, plural, pronominal: true })];
  } else {
    const adjFr = FR.adjForm(pair.frEd, subj.g, plural);
    frWords = [subj.fr, past ? FR.imparfait(FR.ETRE, fp) : FR.present(FR.ETRE, fp), adjFr];
  }
  if (ctxThing) {
    const t = THINGS_FR[ctxThing];
    frWords.push(pair.ctx!.fr, ...FR.frNP({ fr: t.fr, g: t.g }, 'def', { plural: !!t.pl }));
  }
  const fr = joinFrench([FR.frJoin(frWords)], '.');
  return buildItem({
    skillId: 'ed_ing_adjectives',
    templateId: `edi.person.${pair.stem}`,
    level: 'B1',
    slots,
    end: '.',
    fr,
    blankGroups: [indicesByRole(slots, ['adj'])],
    hints: [pair.stem],
    distractors: [{ text: pair.ing, tag: 'ed_ing' }, ...(ED_SPELLING[pair.ed] ? [{ text: ED_SPELLING[pair.ed], tag: 'spelling' }] : [])],
    explanation: `« ${subj.en} » RESSENT le sentiment → adjectif en -ed : ${pair.ed}. (Ce qui provoque le sentiment : ${pair.ing}.)`,
    lexemes: [`edi:${pair.stem}`, `subj:${subj.id}`],
  });
};

export type { Subject };
