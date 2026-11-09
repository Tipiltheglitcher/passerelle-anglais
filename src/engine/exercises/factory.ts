/**
 * Fabrique d'exercices : un même item de phrase peut devenir un texte à trous,
 * un QCM, un exercice d'ordre des mots, une traduction, une correction
 * d'erreur, une dictée, une écoute ou une transformation.
 */
import { lattice, latticeText, spec, type Lattice, type Slot } from '@/engine/core/lattice';
import { shortHash, type Rng } from '@/engine/core/rng';
import { capitalizeFirst, normalizeText } from '@/engine/core/text';
import { ZERO_LABEL, type SentenceItem } from '@/engine/generator/types';
import type {
  ClozeExercise,
  ClozePart,
  DictationExercise,
  ErrorExercise,
  Exercise,
  ExerciseType,
  ListeningExercise,
  McqExercise,
  Option,
  TransformationExercise,
  TranslateEnFrExercise,
  TranslateFrEnExercise,
  WordOrderExercise,
} from './types';

/** Étiquettes d'erreur purement grammaticales (utilisables en correction d'erreur). */
const NON_GRAMMATICAL_TAGS = new Set([
  'meaning',
  'register',
  'connector',
  'mustnt_dont_have_to',
  'future_choice',
  'can_could',
  'prep_place',
  'possessive_gender',
  'article_the',
  'article_zero',
  'been_gone',
  'reported_speech',
  'might_possibility',
  'relative_pronoun',
  'first_conditional',
  // niveaux avancés : erreurs de sens (la phrase reste grammaticale hors contexte)
  'deduction_meaning',
  'should_have_meaning',
  'futcont_vs_futperf',
  'linking_whereas',
  'needn_t_have',
  'modal_nuance',
  'hedging',
  'nuance',
  'implicature',
  'style',
  'cohesion',
  'word_formation_meaning',
]);

export function itemText(item: SentenceItem): string {
  return latticeText(lattice(item.slots, item.end));
}

function slotText(sl: Slot): string {
  return sl.alts[0] ?? '';
}

/** Mots de la phrase canonique (sans ponctuation), en conservant les majuscules utiles. */
export function sentenceWords(slots: readonly Slot[]): string[] {
  const out: string[] = [];
  slots.forEach((sl) => {
    const t = slotText(sl);
    if (!t || /^[.,!?;:]$/.test(t)) return;
    t.split(/\s+/).forEach((w, j) => {
      const clean = w.replace(/^[“"]|[.,!?;:”"]+$/g, '');
      if (!clean) return;
      const first = out.length === 0 && j === 0;
      out.push(first && !sl.proper ? clean.charAt(0).toLowerCase() + clean.slice(1) : clean);
    });
  });
  return out;
}

/** Découpe la phrase en parties texte / trou. */
export function slotsToParts(slots: readonly Slot[], end: string): ClozePart[] {
  const parts: ClozePart[] = [];
  let buffer: string[] = [];
  let lastBlank: number | undefined;
  const flush = () => {
    if (buffer.length) {
      const text = buffer.join(' ').replace(/\s+([,.!?;:])/g, '$1');
      parts.push({ kind: 'text', text });
      buffer = [];
    }
  };
  slots.forEach((sl) => {
    if (sl.blank !== undefined) {
      if (lastBlank !== sl.blank) {
        flush();
        parts.push({ kind: 'blank', index: sl.blank });
        lastBlank = sl.blank;
      }
      return;
    }
    lastBlank = undefined;
    const t = slotText(sl);
    if (t) buffer.push(t);
  });
  buffer.push(end);
  flush();
  // majuscule initiale si la phrase commence par du texte
  const first = parts[0];
  if (first && first.kind === 'text') first.text = capitalizeFirst(first.text);
  // ponctuation collée au trou précédent
  return parts.map((p) => (p.kind === 'text' ? { ...p, text: p.text.replace(/^\s*([,.!?;:])/, '$1') } : p));
}

function startsWithBlank(slots: readonly Slot[]): boolean {
  const firstVisible = slots.find((sl) => sl.blank !== undefined || slotText(sl) !== '');
  return !!firstVisible && firstVisible.blank === 0;
}

function optionText(t: string, capital: boolean): string {
  if (t === '' || t === '∅') return ZERO_LABEL;
  return capital ? capitalizeFirst(t) : t;
}

function baseFields(item: SentenceItem, type: ExerciseType, seed: string, difficulty: 1 | 2 | 3, instruction: string, sig: string) {
  return {
    id: `${type}-${shortHash(`${seed}|${sig}`)}`,
    type,
    skillId: item.skillId,
    level: item.level,
    difficulty,
    instruction,
    explanation: item.explanation,
    signature: shortHash(`${type}|${sig}`),
    structure: item.templateId,
    lexemes: item.lexemes,
    itemIds: item.itemIds ?? [],
    seed,
    audioText: itemText(item),
  };
}

/** Phrase où le trou n° 0 est remplacé par un texte (pour les erreurs connues). */
function sentenceWithBlankText(item: SentenceItem, text: string): string {
  const slots: Slot[] = [];
  let inserted = false;
  for (const sl of item.slots) {
    if (sl.blank === 0) {
      if (!inserted) {
        slots.push({ alts: [text === '∅' ? '' : text] });
        inserted = true;
      }
    } else slots.push(sl);
  }
  return latticeText(lattice(slots, item.end));
}

export interface FactoryOptions {
  rng: Rng;
  seed: string;
  difficulty: 1 | 2 | 3;
}

export function canMake(item: SentenceItem, type: ExerciseType): boolean {
  if (item.allowedTypes && !item.allowedTypes.includes(type)) return false;
  const words = sentenceWords(item.slots).length;
  const grammaticalDistractors = item.distractors.filter((d) => !NON_GRAMMATICAL_TAGS.has(d.tag) && d.text !== '∅');
  switch (type) {
    case 'cloze':
      return item.blanks.length > 0 && !item.mcqOnly;
    case 'conjugation':
      return !item.mcqOnly && item.blanks.length > 0 && item.blanks.every((b) => !!b.hint) && item.slots.some((s) => s.blank !== undefined && (s.role === 'verb' || s.role === 'aux' || /^(c_|r_)/.test(s.role ?? '')));
    case 'mcq':
    case 'contextChoice':
      return item.blanks.length >= 1 && item.distractors.length >= 2;
    case 'wordOrder':
      return words >= 3 && words <= 14 && !item.context;
    case 'translateFrEn':
      return !!item.fr && words <= 16 && !item.context;
    case 'translateEnFr':
      return (item.frDistractors?.length ?? 0) >= 2 && !item.context;
    case 'errorCorrection':
      return grammaticalDistractors.length > 0 && item.blanks.length >= 1 && !item.mcqOnly && !item.context;
    case 'transformation':
      return !!item.transform && !!item.transform.targetText;
    case 'dictation':
      return words >= 3 && words <= 14 && !item.context;
    case 'listening':
      return (item.enVariants?.length ?? 0) >= 2 && !item.context;
    default:
      return false;
  }
}

export function itemToExercise(item: SentenceItem, type: ExerciseType, o: FactoryOptions): Exercise | null {
  if (!canMake(item, type)) return null;
  const canonical = itemText(item);
  const norm = normalizeText(canonical);
  const { rng, seed, difficulty } = o;
  switch (type) {
    case 'cloze':
    case 'conjugation': {
      const ex: ClozeExercise = {
        ...baseFields(item, type, seed, difficulty, type === 'conjugation' ? 'Conjuguez le verbe entre parenthèses à la bonne forme.' : item.instruction ?? 'Complétez la phrase.', `${norm}|${item.blanks.map((b) => b.display).join('/')}`),
        type,
        variant: 'sentence',
        parts: slotsToParts(item.slots, item.end),
        blanks: item.blanks.map((b) => ({ answer: b.answer, display: b.display, hint: difficulty === 3 && type === 'cloze' && !item.showTranslation ? b.hint : b.hint })),
        translation: item.fr,
        showTranslation: !!item.showTranslation || difficulty === 1,
        context: item.context,
        answerText: canonical,
        known: item.distractors,
        noFinalContraction: item.noFinalContraction,
      };
      if (type === 'conjugation' && item.instruction) ex.instruction = `${item.instruction} Conjuguez le verbe entre parenthèses.`;
      return ex;
    }
    case 'mcq':
    case 'contextChoice': {
      const capital = startsWithBlank(item.slots) || !!item.mcqOnly && item.blanks[0]?.display.length > 20;
      const correct = item.blanks[0].display;
      const opts: Option[] = [
        { text: optionText(correct, capital), correct: true },
        ...rng.sample(item.distractors, 3).map((d) => ({ text: optionText(d.text, capital), correct: false, tag: d.tag })),
      ];
      // pour les QCM à plusieurs trous, les autres trous sont affichés résolus
      const slots = item.slots.map((sl) => (sl.blank !== undefined && sl.blank > 0 ? { ...sl, blank: undefined } : sl));
      const isContext = type === 'contextChoice' || item.skillId === 'requests_offers';
      const ex: McqExercise = {
        ...baseFields(item, isContext ? 'contextChoice' : 'mcq', seed, difficulty, item.instruction ?? (isContext && item.context ? 'Que dites-vous dans cette situation ?' : isContext ? 'Choisissez la forme qui convient dans cette phrase.' : 'Choisissez la bonne réponse.'), `${norm}|mcq`),
        type: isContext ? 'contextChoice' : 'mcq',
        context: item.context,
        stem: item.mcqOnly && item.skillId === 'requests_offers' ? undefined : slotsToParts(slots, item.end),
        question: item.skillId === 'requests_offers' ? item.context : undefined,
        options: rng.shuffle(dedupeOptions(opts)),
        translation: item.fr,
        showTranslation: !!item.showTranslation,
      };
      return ex;
    }
    case 'wordOrder': {
      const words = sentenceWords(item.slots);
      const accepted = [words, ...(item.altOrders ?? []).map((alt) => sentenceWords(alt))];
      let tiles = words.map((w, i) => ({ id: `t${i}`, text: w }));
      if (difficulty === 3) {
        const extra = item.distractors.filter((d) => !d.text.includes(' ') && d.text !== '∅' && !words.includes(d.text)).slice(0, 1);
        tiles = tiles.concat(extra.map((d, i) => ({ id: `x${i}`, text: d.text })));
      }
      let shuffled = rng.shuffle(tiles);
      for (let k = 0; k < 4 && shuffled.map((t) => t.text).join(' ') === words.join(' '); k++) shuffled = rng.shuffle(tiles);
      const ex: WordOrderExercise = {
        ...baseFields(item, 'wordOrder', seed, difficulty, "Remettez les mots dans l'ordre pour traduire la phrase.", `${norm}|order`),
        type: 'wordOrder',
        tiles: shuffled,
        accepted,
        translation: item.fr,
        answerText: canonical,
      };
      return ex;
    }
    case 'translateFrEn': {
      const lattices: Lattice[] = [lattice(item.slots, item.end), ...(item.altOrders ?? []).map((a) => lattice(a, item.end)), ...(item.extraAnswers ?? [])];
      const ex: TranslateFrEnExercise = {
        ...baseFields(item, 'translateFrEn', seed, difficulty, 'Traduisez la phrase en anglais.', `${normalizeText(item.fr)}|fren`),
        type: 'translateFrEn',
        source: item.fr,
        answer: spec(...lattices),
        answerText: canonical,
        known: item.distractors.filter((d) => d.text !== '∅').map((d) => ({ text: sentenceWithBlankText(item, d.text), tag: d.tag })),
        noFinalContraction: item.noFinalContraction,
      };
      return ex;
    }
    case 'translateEnFr': {
      const opts: Option[] = [{ text: item.fr, correct: true }, ...rng.sample(item.frDistractors ?? [], 3).map((t) => ({ text: t, correct: false, tag: 'meaning' }))];
      const ex: TranslateEnFrExercise = {
        ...baseFields(item, 'translateEnFr', seed, difficulty, 'Choisissez la traduction correcte.', `${norm}|enfr`),
        type: 'translateEnFr',
        source: canonical,
        options: rng.shuffle(dedupeOptions(opts)),
      };
      return ex;
    }
    case 'errorCorrection': {
      const candidates = item.distractors.filter((d) => !NON_GRAMMATICAL_TAGS.has(d.tag) && d.text !== '∅');
      const d = rng.pick(candidates);
      const tokens: string[] = [];
      let start = -1;
      let endIdx = -1;
      let inserted = false;
      item.slots.forEach((sl) => {
        if (sl.blank === 0) {
          if (inserted) return;
          inserted = true;
          start = tokens.length;
          d.text.split(/\s+/).filter(Boolean).forEach((w) => tokens.push(w));
          endIdx = tokens.length - 1;
          return;
        }
        const t = slotText(sl);
        if (!t) return;
        if (/^[.,!?;:]$/.test(t)) {
          tokens.push(t);
          return;
        }
        t.split(/\s+/).forEach((w) => tokens.push(w));
      });
      tokens.push(item.end);
      if (start < 0 || endIdx < start) return null;
      if (tokens[0] && /^[a-z]/.test(tokens[0])) tokens[0] = capitalizeFirst(tokens[0]);
      const ex: ErrorExercise = {
        ...baseFields(item, 'errorCorrection', seed, difficulty, "Une erreur s'est glissée dans la phrase : sélectionnez le mot erroné, puis corrigez-le.", `${norm}|err|${d.text}`),
        type: 'errorCorrection',
        tokens,
        wrong: [start, endIdx],
        correction: item.blanks[0].answer,
        correctionText: item.blanks[0].display,
        correctSentence: canonical,
        tag: d.tag,
        translation: item.fr,
      };
      return ex;
    }
    case 'transformation': {
      const t = item.transform!;
      const ex: TransformationExercise = {
        ...baseFields(item, 'transformation', seed, difficulty, t.instruction, `${normalizeText(t.source)}|${normalizeText(t.targetText)}`),
        type: 'transformation',
        source: t.source,
        task: t.instruction,
        answer: t.target,
        answerText: t.targetText,
        audioText: t.targetText,
      };
      return ex;
    }
    case 'dictation': {
      const ex: DictationExercise = {
        ...baseFields(item, 'dictation', seed, difficulty, 'Écoutez la phrase et écrivez-la.', `${norm}|dict`),
        type: 'dictation',
        audioText: canonical,
        answer: spec(lattice(item.slots, item.end)),
        answerText: canonical,
        translation: item.fr,
      };
      return ex;
    }
    case 'listening': {
      const opts: Option[] = [{ text: canonical, correct: true }, ...rng.sample(item.enVariants ?? [], 3).map((t) => ({ text: t, correct: false, tag: 'meaning' }))];
      const ex: ListeningExercise = {
        ...baseFields(item, 'listening', seed, difficulty, 'Écoutez et choisissez la phrase que vous entendez.', `${norm}|listen`),
        type: 'listening',
        mode: 'which',
        audioText: canonical,
        question: 'Quelle phrase avez-vous entendue ?',
        options: rng.shuffle(dedupeOptions(opts)),
        transcript: canonical,
        translation: item.fr,
      };
      return ex;
    }
    default:
      return null;
  }
}

function dedupeOptions(opts: Option[]): Option[] {
  const seen = new Set<string>();
  return opts.filter((o) => {
    const k = normalizeText(o.text);
    if (seen.has(k)) return false;
    seen.add(k);
    return true;
  });
}

/** Formats possibles pour un item, du plus guidé au plus exigeant. */
export const TYPE_DIFFICULTY: Record<ExerciseType, 1 | 2 | 3> = {
  mcq: 1,
  contextChoice: 1,
  listening: 1,
  matching: 1,
  wordOrder: 1,
  translateEnFr: 2,
  cloze: 2,
  conjugation: 2,
  errorCorrection: 2,
  dialogue: 2,
  reading: 2,
  transformation: 3,
  translateFrEn: 3,
  dictation: 3,
  keyword: 3,
  nuance: 2,
  register: 2,
  implicature: 2,
  styleEdit: 3,
  longReading: 3,
  argument: 3,
  dialogueAnalysis: 3,
  textOrder: 3,
  writing: 3,
};
