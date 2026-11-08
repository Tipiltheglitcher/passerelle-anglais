/**
 * Correction des exercices : comparaison tolérante (contractions, variantes,
 * fautes de frappe hors point de grammaire), détection des erreurs connues
 * pour une explication ciblée.
 */
import { diffWords, matchAnswer, specFromStrings, type AnswerSpec } from '@/engine/core/lattice';
import { cleanTypography, normalizeText, stripAccents } from '@/engine/core/text';
import { ERROR_TAGS } from '@/engine/generator/errors';
import type { Distractor } from '@/engine/generator/types';
import type { EvalResult, Exercise, ExerciseResponse } from './types';

const OK = ['Correct !', 'Bravo !', 'Excellent !', 'Parfait !', 'Très bien !'];

function okHeadline(seed: string): string {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) >>> 0;
  return OK[h % OK.length];
}

/** Détecte une erreur connue (distracteur) dans la saisie. */
export function detectKnown(value: string, known: readonly Distractor[]): string | undefined {
  for (const d of known) {
    if (!d.text || d.text === '∅') continue;
    if (matchAnswer(value, specFromStrings([d.text]), { maxTypos: 0 }).ok) return d.tag;
  }
  return undefined;
}

const FINAL_CONTRACTION = /\b[a-z]+'(m|re|s|ve|ll|d)\s*[.!?]*\s*$/i;

/** Retire articles et « to » initiaux (traduction d'un mot isolé). */
function stripLeading(s: string, lang: 'en' | 'fr'): string {
  let t = cleanTypography(s).trim().toLowerCase();
  if (lang === 'en') t = t.replace(/^(to|a|an|the)\s+/, '');
  else t = t.replace(/^(le|la|les|un|une|des|du|de la|de l'|l'|se |s')\s*/, '');
  return t.replace(/\s*\([^)]*\)\s*/g, ' ').trim();
}

function wordModeMatch(value: string, answers: AnswerSpec): boolean {
  const v = normalizeText(stripLeading(value, 'en'));
  return answers.lattices.some((l) =>
    l.slots.every((sl) => sl.alts.some((a) => normalizeText(stripLeading(a, 'en')) === v)),
  );
}

export function evaluate(ex: Exercise, r: ExerciseResponse): EvalResult {
  const head = okHeadline(ex.id);
  switch (ex.type) {
    case 'wordOrder': {
      if (r.kind !== 'order') break;
      const texts = r.tiles.map((id) => ex.tiles.find((t) => t.id === id)?.text ?? '');
      const lower = texts.map((t) => t.toLowerCase());
      const ok = ex.accepted.some((acc) => acc.length === lower.length && acc.every((w, i) => w.toLowerCase() === lower[i]));
      return {
        correct: ok,
        score: ok ? 1 : 0,
        expected: ex.answerText,
        userAnswer: texts.join(' '),
        headline: ok ? head : 'Pas tout à fait…',
        errorTag: ok ? undefined : 'word_order',
        diff: ok ? undefined : diffWords(ex.accepted[0].join(' '), texts.join(' ')),
      };
    }
    case 'cloze':
    case 'conjugation': {
      if (ex.variant === 'grid') {
        if (r.kind !== 'blanks') break;
        const results = ex.fields.map((f, i) => matchAnswer(r.values[i] ?? '', f.answer, { maxTypos: 0 }).ok);
        const n = results.filter(Boolean).length;
        const ok = n === ex.fields.length;
        return {
          correct: ok,
          score: n / ex.fields.length,
          expected: ex.fields.map((f) => `${f.label} : ${f.display}`).join(' · '),
          userAnswer: r.values.join(' / '),
          headline: ok ? head : n > 0 ? 'Presque…' : 'Incorrect',
          errorTag: ok ? undefined : 'irregular_past',
        };
      }
      if (r.kind !== 'blanks') break;
      const flags = ex.blanks.map((b, i) => {
        const v = r.values[i] ?? '';
        if (!v.trim() && b.display !== '') return false;
        if (ex.noFinalContraction && FINAL_CONTRACTION.test(v)) return false;
        return matchAnswer(v, b.answer, { maxTypos: 0 }).ok;
      });
      const n = flags.filter(Boolean).length;
      const ok = n === ex.blanks.length;
      let tag: string | undefined;
      if (!ok) {
        const firstWrong = flags.findIndex((f) => !f);
        if (firstWrong === 0) tag = detectKnown(r.values[0] ?? '', ex.known);
        if (!tag && ex.noFinalContraction && FINAL_CONTRACTION.test(r.values[0] ?? '')) tag = 'short_answer';
      }
      return {
        correct: ok,
        score: n / ex.blanks.length,
        expected: ex.blanks.map((b) => b.display).join(' … '),
        userAnswer: r.values.join(' … '),
        headline: ok ? head : n > 0 ? 'Presque…' : 'Incorrect',
        errorTag: tag,
        note: ok ? undefined : `Phrase correcte : ${ex.answerText}`,
      };
    }
    case 'mcq':
    case 'contextChoice':
    case 'translateEnFr':
    case 'listening': {
      if (r.kind !== 'choice') break;
      const opt = ex.options[r.index];
      const correct = ex.options.find((o) => o.correct);
      const ok = !!opt?.correct;
      return {
        correct: ok,
        score: ok ? 1 : 0,
        expected: correct?.text ?? '',
        userAnswer: opt?.text ?? '',
        headline: ok ? head : 'Incorrect',
        errorTag: ok ? undefined : opt?.tag,
      };
    }
    case 'translateFrEn':
    case 'transformation':
    case 'dictation': {
      if (r.kind !== 'text') break;
      const value = r.value;
      if (!value.trim()) {
        return { correct: false, score: 0, expected: ex.answerText, userAnswer: '', headline: 'Réponse vide', errorTag: undefined };
      }
      if (ex.type === 'translateFrEn' && ex.wordMode && wordModeMatch(value, ex.answer)) {
        return { correct: true, score: 1, expected: ex.answerText, userAnswer: value, headline: head };
      }
      const m = matchAnswer(value, ex.answer, { maxTypos: ex.type === 'dictation' ? 1 : undefined });
      if (m.ok && !(ex.type === 'translateFrEn' && ex.noFinalContraction && FINAL_CONTRACTION.test(value))) {
        const note = m.typos
          ? `Faute${m.typos > 1 ? 's' : ''} de frappe tolérée${m.typos > 1 ? 's' : ''} : ${m.typoWords.map((t) => `${t.got} → ${t.expected}`).join(', ')}.`
          : normalizeText(value) !== normalizeText(ex.answerText)
            ? `Réponse acceptée. Proposition de référence : ${ex.answerText}`
            : undefined;
        return {
          correct: true,
          score: m.typos ? 0.85 : 1,
          typo: m.typos > 0,
          expected: ex.answerText,
          userAnswer: value,
          headline: m.typos ? 'Correct (attention à l\'orthographe)' : head,
          note,
        };
      }
      let tag: string | undefined;
      if (ex.type === 'translateFrEn') {
        for (const k of ex.known) {
          if (matchAnswer(value, specFromStrings([k.text]), { maxTypos: 1 }).ok) {
            tag = k.tag;
            break;
          }
        }
      }
      return {
        correct: false,
        score: 0,
        expected: ex.answerText,
        userAnswer: value,
        headline: 'Pas tout à fait…',
        errorTag: tag,
        diff: diffWords(ex.answerText.replace(/[.?!]$/, ''), value.replace(/[.?!]$/, '')),
      };
    }
    case 'errorCorrection': {
      if (r.kind !== 'error') break;
      const found = r.index >= ex.wrong[0] && r.index <= ex.wrong[1];
      const fixed = found && matchAnswer(r.correction, ex.correction, { maxTypos: 0 }).ok;
      return {
        correct: found && fixed,
        score: found ? (fixed ? 1 : 0.4) : 0,
        expected: ex.correctionText,
        userAnswer: r.correction,
        headline: found && fixed ? head : found ? 'Bonne erreur repérée, mais la correction est inexacte' : "Ce n'était pas l'erreur",
        errorTag: ex.tag,
        note: `Phrase correcte : ${ex.correctSentence}`,
      };
    }
    case 'matching':
    case 'dialogue':
    case 'reading': {
      if (r.kind !== 'multi') break;
      const score = r.total ? Math.max(0, (r.correct - (ex.type === 'matching' ? r.mistakes * 0.5 : 0)) / r.total) : 0;
      const perfect = ex.type === 'matching' ? r.mistakes === 0 : r.correct === r.total;
      // réussite : une seule erreur tolérée en association, 75 % de bonnes réponses en lecture / dialogue
      const ok = ex.type === 'matching' ? r.mistakes <= 1 && r.correct === r.total : r.total > 0 && r.correct / r.total >= 0.75;
      return {
        correct: ok,
        score: perfect ? 1 : Math.round(score * 100) / 100,
        expected: '',
        userAnswer: `${r.correct}/${r.total}`,
        headline: perfect ? head : ok ? 'Bien joué, quelques erreurs' : score >= 0.5 ? 'Presque : à retravailler' : 'À retravailler',
        ...(ex.type === 'matching' && r.missedIds ? { itemOutcomes: Object.fromEntries(ex.itemIds.map((id) => [id, !r.missedIds!.includes(id)])) } : {}),
        errorTag: r.tags?.[0],
      };
    }
    default:
      break;
  }
  return { correct: false, score: 0, expected: '', userAnswer: '', headline: 'Réponse invalide' };
}

export function errorLabel(tag?: string): string | undefined {
  return tag ? ERROR_TAGS[tag]?.label : undefined;
}

export function errorExplanation(tag?: string): string | undefined {
  return tag ? ERROR_TAGS[tag]?.explanation : undefined;
}

/** Comparaison française tolérante (vocabulaire EN → FR saisi). */
export function matchFrench(value: string, answers: string[]): { ok: boolean; accentOnly: boolean } {
  const v = normalizeText(stripLeading(value, 'fr'));
  const vNo = stripAccents(v);
  let accentOnly = false;
  for (const a of answers) {
    const n = normalizeText(stripLeading(a, 'fr'));
    if (n === v) return { ok: true, accentOnly: false };
    if (stripAccents(n) === vNo) accentOnly = true;
  }
  return { ok: accentOnly, accentOnly };
}
