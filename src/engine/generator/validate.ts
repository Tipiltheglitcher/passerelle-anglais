/**
 * Contrôles de qualité appliqués à CHAQUE item généré, à l'exécution comme
 * dans les tests. Un item qui échoue est rejeté (le générateur en produit un
 * autre) : on ne présente jamais un exercice dont la correction serait douteuse.
 */
import { lattice, latticeText, matchAnswer } from '@/engine/core/lattice';
import { indefiniteArticle } from '@/engine/lang/en/morphology';
import { startsWithVowelSound } from '@/engine/lang/fr/morphology';
import type { SentenceItem } from './types';

const BAD_MARKERS = /undefined|null|NaN|\{|\}|~|\[object/;

export function checkEnglish(text: string): string[] {
  const p: string[] = [];
  if (!text.trim()) p.push('phrase anglaise vide');
  if (BAD_MARKERS.test(text)) p.push(`marqueur interne dans « ${text} »`);
  if (/\s{2,}/.test(text)) p.push(`espaces doubles dans « ${text} »`);
  if (!/^[A-Z0-9"']/.test(text)) p.push(`majuscule manquante : « ${text} »`);
  if (!/[.?!]$/.test(text)) p.push(`ponctuation finale manquante : « ${text} »`);
  const words = text.replace(/[.,!?;:]/g, ' ').split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    const w = words[i].toLowerCase();
    const next = words[i + 1];
    if ((w === 'a' || w === 'an') && /^[a-z]/i.test(next)) {
      if (next === next.toUpperCase() && next.length > 1 && w === 'a') continue; // sigles : a UFO
      const expected = indefiniteArticle(next);
      if (expected !== w) p.push(`article « ${w} ${next} » incorrect dans « ${text} »`);
    }
    if (w === words[i + 1].toLowerCase() && !['that', 'had'].includes(w)) p.push(`mot répété « ${w} » dans « ${text} »`);
  }
  return p;
}

const FR_ELIDABLE = new Set(['je', 'me', 'te', 'se', 'le', 'la', 'de', 'ne', 'que']);

export function checkFrench(text: string): string[] {
  const p: string[] = [];
  if (!text.trim()) p.push('phrase française vide');
  if (BAD_MARKERS.test(text)) p.push(`marqueur interne dans « ${text} »`);
  if (/ {2,}/.test(text)) p.push(`espaces doubles dans « ${text} »`);
  if (!/[.?!]$/.test(text)) p.push(`ponctuation finale manquante : « ${text} »`);
  const lower = ` ${text.toLowerCase().replace(/[.,!?;:\u00a0]/g, ' ')} `;
  for (const bad of [' de le ', ' à le ', ' de les ', ' à les ', ' si il ', ' si ils ']) {
    if (lower.includes(bad)) p.push(`contraction manquante « ${bad.trim()} » dans « ${text} »`);
  }
  const words = lower.split(/\s+/).filter(Boolean);
  for (let i = 0; i < words.length - 1; i++) {
    if (FR_ELIDABLE.has(words[i]) && startsWithVowelSound(words[i + 1])) {
      p.push(`élision manquante « ${words[i]} ${words[i + 1]} » dans « ${text} »`);
    }
  }
  return p;
}

export function validateItem(item: SentenceItem): string[] {
  const problems: string[] = [];
  const text = latticeText(lattice(item.slots, item.end));
  problems.push(...checkEnglish(text));
  problems.push(...checkFrench(item.fr));
  if (!item.explanation) problems.push('explication manquante');
  item.blanks.forEach((b, i) => {
    if (item.mcqOnly && !b.display.trim()) return;
    if (!b.display.trim()) problems.push(`trou ${i} vide`);
    if (!matchAnswer(b.display, b.answer).ok) problems.push(`trou ${i} : la réponse de référence n'est pas acceptée`);
  });
  for (const d of item.distractors) {
    if (item.blanks[0] && matchAnswer(d.text, item.blanks[0].answer, { maxTypos: 0 }).ok) {
      problems.push(`distracteur « ${d.text} » accepté comme bonne réponse`);
    }
  }
  for (const alt of item.altOrders ?? []) problems.push(...checkEnglish(latticeText(lattice(alt, item.end))));
  for (const f of item.frDistractors ?? []) problems.push(...checkFrench(f));
  if (item.transform) {
    problems.push(...checkEnglish(item.transform.targetText));
    if (!matchAnswer(item.transform.targetText, item.transform.target).ok) problems.push('transformation : cible non acceptée');
  }
  return problems;
}
