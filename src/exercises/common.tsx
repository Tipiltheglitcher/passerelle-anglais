/** Éléments communs aux vues d'exercices. */
import { useState, type ReactNode } from 'react';
import type { ClozePart, EvalResult, Exercise, ExerciseResponse } from '@/engine/exercises/types';
import { IconEye, IconEyeOff } from '@/ui/icons';
import { useAppState } from '@/state/store';

export interface ExerciseViewProps<E extends Exercise = Exercise> {
  exercise: E;
  /** « answering » tant que la réponse n'est pas vérifiée. */
  phase: 'answering' | 'checked';
  result: EvalResult | null;
  /** Réponse courante (null si incomplète). */
  onChange: (r: ExerciseResponse | null) => void;
  /** Demande de validation (touche Entrée, fin d'un exercice en plusieurs étapes). */
  onSubmit: () => void;
}

export function Translation({ text, force = false }: { text?: string; force?: boolean }) {
  const pref = useAppState((s) => s.settings.showTranslations);
  const [open, setOpen] = useState(force || pref);
  if (!text) return null;
  if (force) return <p className="translation">{text}</p>;
  return (
    <div className="translation-wrap">
      <button type="button" className="link-btn" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        {open ? <IconEyeOff size={16} aria-hidden /> : <IconEye size={16} aria-hidden />}
        {open ? 'Masquer la traduction' : 'Voir la traduction'}
      </button>
      {open && <p className="translation">{text}</p>}
    </div>
  );
}

/** Affiche une phrase dont les trous sont rendus par une fonction. */
export function Sentence({ parts, renderBlank, className = '' }: { parts: ClozePart[]; renderBlank: (index: number) => ReactNode; className?: string }) {
  return (
    <p className={`sentence ${className}`} lang="en">
      {parts.map((p, i) =>
        p.kind === 'text' ? (
          <span key={i} className="sentence-text">
            {p.text}
          </span>
        ) : (
          <span key={i} className="sentence-blank">
            {renderBlank(p.index)}
          </span>
        ),
      )}
    </p>
  );
}

export function ContextLine({ text }: { text?: string }) {
  if (!text) return null;
  return (
    <p className="context-line" lang="en">
      {text}
    </p>
  );
}

/** Champ texte adapté aux réponses en anglais (pas de correction automatique). */
export const englishInputProps = {
  autoComplete: 'off',
  autoCorrect: 'off',
  autoCapitalize: 'off',
  spellCheck: false,
  lang: 'en',
} as const;
