/**
 * Formats avancés (B2 → C2) construits à partir de contenus rédigés :
 * choix commentés (nuance, registre, implicite, style), textes longs et
 * analyses (arguments, dialogues), organisation de texte, rédaction guidée.
 *
 * La variété vient du tirage pondéré (contenus peu vus d'abord), de l'ordre
 * des options et des questions. La justesse vient de la rédaction : chaque
 * bonne réponse est unique et chaque option est expliquée.
 */
import { shortHash, type Rng } from '@/engine/core/rng';
import type { CefrLevel } from '@/content/lexicon/types';
import type {
  Exercise,
  ExerciseType,
  InsightExercise,
  QuestionFocus,
  ReadingExercise,
  TextOrderExercise,
  WritingCheck,
  WritingExercise,
  WritingIssue,
  WritingReport,
} from './types';

// ---------------------------------------------------------------------------
// Contenus

export interface InsightItem {
  id: string;
  lv: CefrLevel;
  /** Situation (français). */
  sit?: string;
  /** Extrait anglais. */
  passage?: string;
  /** Échange : [locuteur, réplique]. */
  lines?: [string, string][];
  q: string;
  /** Options : la première est la bonne — [texte, explication, étiquette éventuelle]. */
  o: [string, string, string?][];
  /** Explication générale. */
  why: string;
}

export interface PassageQuestion {
  q: string;
  f: QuestionFocus;
  /** Bonne réponse. */
  a: string;
  /** Mauvaises réponses plausibles. */
  w: string[];
  why: string;
}

export interface PassageItem {
  id: string;
  lv: CefrLevel;
  title: string;
  genre?: string;
  /** Paragraphes séparés par une ligne vide. */
  text?: string;
  lines?: [string, string][];
  qs: PassageQuestion[];
  why: string;
}

export interface OrderItem {
  id: string;
  lv: CefrLevel;
  title: string;
  lead?: string;
  /** Segments dans l'ordre correct : [texte, rôle]. */
  segs: [string, string][];
  /** Autres ordres corrects (indices dans segs). */
  alt?: number[][];
  why: string;
}

export interface WritingPrompt {
  id: string;
  lv: CefrLevel;
  title: string;
  prompt: string;
  task: string;
  min: number;
  max: number;
  checks: WritingCheck[];
  rubric: string[];
  phrases: string[];
  model: string;
  why: string;
}

export interface AdvancedContext {
  rng: Rng;
  seed: string;
  difficulty: 1 | 2 | 3;
  /** Poids de nouveauté d'un contenu (faible s'il a été vu récemment). */
  weight?: (key: string) => number;
}

function pickContent<T extends { id: string }>(ctx: AdvancedContext, items: readonly T[]): T {
  return ctx.rng.pickWeighted(items, (it) => (ctx.weight ? ctx.weight(`adv:${it.id}`) : 1));
}

function base(ctx: AdvancedContext, type: ExerciseType, skillId: string, lv: CefrLevel, contentId: string, instruction: string, explanation: string, variant = '') {
  return {
    id: `${type}-${shortHash(`${ctx.seed}|${contentId}|${variant}`)}`,
    type,
    skillId,
    level: lv,
    difficulty: ctx.difficulty,
    instruction,
    explanation,
    signature: shortHash(`${type}|${contentId}|${variant}`),
    structure: `${skillId}.${type}`,
    lexemes: [`adv:${contentId}`],
    itemIds: [],
    seed: ctx.seed,
  };
}

const INSIGHT_INSTRUCTIONS: Record<InsightExercise['type'], string> = {
  nuance: 'Choisissez la formulation qui correspond exactement au sens demandé.',
  register: 'Choisissez la formulation la plus appropriée à la situation.',
  implicature: "Que veut vraiment dire l'interlocuteur ?",
  styleEdit: 'Choisissez la meilleure version du passage.',
};

export function insightExercise(ctx: AdvancedContext, skillId: string, type: InsightExercise['type'], items: readonly InsightItem[]): InsightExercise | null {
  if (!items.length) return null;
  const it = pickContent(ctx, items);
  const options = ctx.rng.shuffle(it.o.map(([text, why, label], i) => ({ text, why, label, correct: i === 0, tag: i === 0 ? undefined : TAG_BY_TYPE[type] })));
  return {
    ...base(ctx, type, skillId, it.lv, it.id, INSIGHT_INSTRUCTIONS[type], it.why),
    type,
    situation: it.sit,
    passage: it.passage,
    lines: it.lines?.map(([speaker, text]) => ({ speaker, text })),
    question: it.q,
    options,
    audioText: it.passage ?? it.lines?.map((l) => l[1]).join(' '),
  };
}

const TAG_BY_TYPE: Record<InsightExercise['type'], string> = {
  nuance: 'nuance',
  register: 'register',
  implicature: 'implicature',
  styleEdit: 'style',
};

const PASSAGE_INSTRUCTIONS: Record<'longReading' | 'argument' | 'dialogueAnalysis', string> = {
  longReading: 'Lisez le texte attentivement, puis répondez aux questions.',
  argument: "Lisez l'argumentation, puis analysez-la.",
  dialogueAnalysis: "Lisez l'échange, puis répondez aux questions sur ce qui est dit… et sous-entendu.",
};

export function passageExercise(ctx: AdvancedContext, skillId: string, type: 'longReading' | 'argument' | 'dialogueAnalysis', items: readonly PassageItem[]): ReadingExercise | null {
  if (!items.length) return null;
  const it = pickContent(ctx, items);
  const questions = it.qs.map((q) => ({
    q: q.q,
    focus: q.f,
    explanation: q.why,
    options: ctx.rng.shuffle([{ text: q.a, correct: true }, ...q.w.map((w) => ({ text: w, correct: false, tag: `reading_${q.f}` }))]),
  }));
  return {
    ...base(ctx, type, skillId, it.lv, it.id, PASSAGE_INSTRUCTIONS[type], it.why),
    type,
    title: it.title,
    genre: it.genre,
    text: it.text ?? '',
    lines: it.lines?.map(([speaker, text]) => ({ speaker, text })),
    questions,
    passRate: 0.75,
  };
}

export function textOrderExercise(ctx: AdvancedContext, skillId: string, items: readonly OrderItem[]): TextOrderExercise | null {
  if (!items.length) return null;
  const it = pickContent(ctx, items);
  const segments = it.segs.map(([text, role], i) => ({ id: `s${i}`, text, role }));
  const correct = segments.map((s) => s.id);
  let shuffled = ctx.rng.shuffle(segments);
  for (let k = 0; k < 5 && shuffled.every((s, i) => s.id === correct[i]); k++) shuffled = ctx.rng.shuffle(segments);
  const orders = [correct, ...(it.alt ?? []).map((a) => a.map((i) => `s${i}`))];
  return {
    ...base(ctx, 'textOrder', skillId, it.lv, it.id, 'Remettez les parties du texte dans un ordre logique et cohérent.', it.why),
    type: 'textOrder',
    title: it.title,
    lead: it.lead,
    segments: shuffled,
    orders,
  };
}

export function writingExercise(ctx: AdvancedContext, skillId: string, items: readonly WritingPrompt[]): WritingExercise | null {
  if (!items.length) return null;
  const it = pickContent(ctx, items);
  return {
    ...base(ctx, 'writing', skillId, it.lv, it.id, 'Rédigez votre texte en anglais, puis comparez-le aux critères et au modèle.', it.why),
    type: 'writing',
    title: it.title,
    prompt: it.prompt,
    task: it.task,
    minWords: it.min,
    maxWords: it.max,
    checks: it.checks,
    rubric: it.rubric,
    phrases: it.phrases,
    model: it.model,
  };
}

// ---------------------------------------------------------------------------
// Analyse automatique d'une production écrite

interface CertainError {
  tag: string;
  re: RegExp;
  fix: (m: string) => string;
  why: string;
}

/** Indénombrables dont le pluriel est toujours fautif dans l'usage courant. */
const UNCOUNTABLE = ['information', 'advice', 'knowledge', 'furniture', 'equipment', 'luggage', 'homework', 'feedback'];

function agreeFix(m: string): string {
  const subj = m.split(/\s|'/)[0];
  return /^(he|she)$/i.test(subj) ? `${subj} agrees` : `${subj} agree`;
}

/**
 * Erreurs dont on est certain qu'elles sont fautives quel que soit le contexte
 * (calques fréquents chez les francophones). Une tournure absente de cette
 * liste n'est pas pour autant correcte : l'outil ne juge pas la qualité globale.
 */
const CERTAIN_ERRORS: CertainError[] = [
  { tag: 'agree', re: /\b(I am|I'm|we are|we're|they are|they're|you are|you're|he is|she is|he's|she's) agree\b/gi, fix: agreeFix, why: '« Être d’accord » se dit to agree (verbe) : I agree, she agrees.' },
  ...UNCOUNTABLE.map<CertainError>((w) => ({
    tag: 'uncountable',
    re: new RegExp(`\\b(an? |many |several |a few |few |these |those )?${w}s\\b`, 'gi'),
    fix: (m) => {
      const det = m.toLowerCase().replace(new RegExp(`${w}s$`), '').trim();
      const map: Record<string, string> = { a: 'a piece of', an: 'a piece of', many: 'much', several: 'some', 'a few': 'a little', few: 'little', these: 'this', those: 'that' };
      return det ? `${map[det] ?? det} ${w}` : w;
    },
    why: `${w} est indénombrable en anglais : pas de pluriel (some ${w}, a piece of ${w}).`,
  })),
  {
    tag: 'uncountable',
    // seulement quand le nom n'est pas le premier élément d'un nom composé (an information desk est correct)
    re: /\b(a|an) (advice|information|furniture|equipment|feedback|evidence|research|luggage|homework)(?=\s*(?:[.,;:!?]|$)|\s+(?:about|on|for|from|to|that|which|is|was|and|or|of)\b)/gi,
    fix: (m) => `a piece of ${m.split(' ')[1]}`,
    why: 'Nom indénombrable : on dit some … ou a piece of …, jamais a/an.',
  },
  { tag: 'depend_on', re: /\bdepend(s|ed|ing)? of\b/gi, fix: (m) => m.replace(/ of$/i, ' on'), why: '« Dépendre de » = depend on.' },
  { tag: 'explain_to', re: /\bexplain(s|ed)? (me|him|her|us|them)\b/gi, fix: (m) => m.replace(/ (me|him|her|us|them)$/i, ' to $1'), why: 'explain something to somebody : explain to me, jamais explain me.' },
  { tag: 'for_since', re: /\bsince (two|three|four|five|six|several|many|\d+) (years|months|weeks|days|hours)\b/gi, fix: (m) => m.replace(/^since/i, 'for'), why: 'Avec une durée, on emploie for (for three years) ; since introduit un point de départ (since 2019).' },
  { tag: 'double_comparative', re: /\bmore (better|worse|easier|harder|bigger|smaller|cheaper|faster|higher|lower|greater)\b/gi, fix: (m) => m.split(' ')[1], why: 'Double comparatif : better, easier… contiennent déjà la marque du comparatif.' },
  { tag: 'other_hand', re: /\b(in|at) the other hand\b/gi, fix: () => 'on the other hand', why: '« D’autre part / en revanche » = on the other hand.' },
  { tag: 'contrary', re: /\b(at|in) the contrary\b/gi, fix: () => 'on the contrary', why: '« Au contraire » = on the contrary.' },
  { tag: 'according_to_me', re: /\baccording to me\b/gi, fix: () => 'in my opinion', why: 'according to s’emploie pour rapporter l’avis d’autrui (according to the report) ; pour son propre avis : in my opinion / in my view.' },
  { tag: 'people_plural', re: /\bpeople (is|was|has|does)\b/gi, fix: (m) => m.replace(/(is|was|has|does)$/i, (v) => ({ is: 'are', was: 'were', has: 'have', does: 'do' })[v.toLowerCase()] ?? v), why: 'people est pluriel : people are, people have.' },
  { tag: 'it_exists', re: /\bit exists?\b (a|an|many|some|several|no)\b/gi, fix: (m) => `there ${/(many|some|several)$/i.test(m) ? 'are' : 'is'} ${m.split(' ').pop()}`, why: '« Il existe » = there is / there are, et non it exists.' },
  { tag: 'discuss_about', re: /\bdiscuss(es|ed|ing)? about\b/gi, fix: (m) => m.replace(/ about$/i, ''), why: 'discuss est transitif : discuss a problem (sans about).' },
  { tag: 'emphasise_on', re: /\bemphasi[sz](e|es|ed|ing) on\b/gi, fix: (m) => m.replace(/ on$/i, ''), why: 'emphasise est transitif : emphasise a point (mais put emphasis on).' },
  { tag: 'despite_of', re: /\bdespite of\b/gi, fix: () => 'despite', why: 'despite s’emploie sans of (despite the rain) ; in spite of prend of.' },
  { tag: 'an_other', re: /\ban other\b/gi, fix: () => 'another', why: 'another s’écrit en un seul mot.' },
  { tag: 'each_others', re: /\beach others\b/gi, fix: () => 'each other', why: 'each other est invariable.' },
  { tag: 'same_time', re: /\bin the same time\b/gi, fix: () => 'at the same time', why: '« En même temps » = at the same time.' },
  { tag: 'much_people', re: /\b(so|too|how) much (people|cars|students|problems|countries|jobs)\b/gi, fix: (m) => m.replace(/much/i, 'many'), why: 'many avec un nom dénombrable pluriel.' },
  { tag: 'assist_to', re: /\bassist(s|ed)? to (a|an|the)\b/gi, fix: (m) => m.replace(/assist(s|ed)? to/i, (x) => x.replace(/assist/i, 'attend').replace(/ to$/i, '')), why: '« Assister à » = attend (assist = aider).' },
  { tag: 'listen_to', re: /\blisten(s|ed|ing)? (music|the radio|podcasts)\b/gi, fix: (m) => m.replace(/^(listen\w*) /i, '$1 to '), why: 'listen to something.' },
  { tag: 'comparing_to', re: /\bcomparing (to|with)\b/gi, fix: (m) => m.replace(/comparing/i, 'compared'), why: '« Par rapport à » = compared to / compared with.' },
  { tag: 'a_such', re: /\ba such\b/gi, fix: () => 'such a', why: 'L’article suit such : such a good idea.' },
];

const STOP = new Set(
  'the a an and or but so of to in on at for with by from as is are was were be been being it its this that these those there their they them he she his her we our you your i my me not no do does did have has had will would can could should may might must very more most also than then which who whom whose what when where why how all some any such into about over after before because although though while if one ones just only even well'.split(' '),
);

export function analyseWriting(ex: Pick<WritingExercise, 'minWords' | 'maxWords' | 'checks'>, text: string): WritingReport {
  const words = text.trim() ? text.trim().split(/\s+/).filter((w) => /\p{L}/u.test(w)).length : 0;
  const lengthOk = words >= ex.minWords && words <= ex.maxWords;
  const checks = ex.checks.map((c) => {
    const found = new Set<string>();
    for (const p of c.patterns) {
      const re = new RegExp(`\\b(?:${p})\\b`, 'gi');
      for (const m of text.matchAll(re)) found.add(m[0].toLowerCase());
    }
    return { id: c.id, label: c.label, ok: found.size >= (c.min ?? 1), found: [...found] };
  });
  const issues: WritingIssue[] = [];
  for (const e of CERTAIN_ERRORS) {
    for (const m of text.matchAll(e.re)) {
      if (issues.length >= 12) break;
      issues.push({ tag: e.tag, found: m[0], fix: e.fix(m[0]), why: e.why });
    }
  }
  const counts = new Map<string, number>();
  for (const w of text.toLowerCase().match(/[a-z']+/g) ?? []) {
    if (w.length < 4 || STOP.has(w)) continue;
    counts.set(w, (counts.get(w) ?? 0) + 1);
  }
  const limit = Math.max(3, Math.ceil(words / 45));
  const repeated = [...counts.entries()].filter(([, n]) => n > limit).map(([word, count]) => ({ word, count })).sort((a, b) => b.count - a.count).slice(0, 5);
  const checkScore = checks.length ? checks.filter((c) => c.ok).length / checks.length : 1;
  const issueScore = Math.max(0, 1 - issues.length * 0.25);
  const lengthScore = lengthOk ? 1 : words >= ex.minWords * 0.7 ? 0.5 : 0;
  const autoScore = words === 0 ? 0 : Math.round(((lengthScore + checkScore * 2 + issueScore) / 4) * 100) / 100;
  return { words, lengthOk, checks, issues, repeated, autoScore };
}

/** Réponse correcte de référence pour les tests (ordre attendu, etc.). */
export function isAdvanced(ex: Exercise): boolean {
  return ['keyword', 'nuance', 'register', 'implicature', 'styleEdit', 'longReading', 'argument', 'dialogueAnalysis', 'textOrder', 'writing'].includes(ex.type);
}
