/**
 * Remise en ordre des mots : fonctionne au toucher (toucher une tuile la
 * déplace), à la souris (glisser-déposer ou clic) et au clavier (Entrée pour
 * placer/retirer, flèches gauche/droite pour déplacer une tuile placée,
 * Retour arrière pour la retirer).
 */
import { useCallback, useEffect, useRef, useState, type KeyboardEvent as RKeyboardEvent, type PointerEvent as RPointerEvent } from 'react';
import type { WordOrderExercise } from '@/engine/exercises/types';
import type { ExerciseViewProps } from './common';
import { IconUndo } from '@/ui/icons';

interface Drag {
  id: string;
  from: 'bank' | 'answer';
  startX: number;
  startY: number;
  x: number;
  y: number;
  active: boolean;
  width: number;
  height: number;
}

export function WordOrderView({ exercise: ex, phase, onChange, onSubmit }: ExerciseViewProps<WordOrderExercise>) {
  const [placed, setPlaced] = useState<string[]>([]);
  const [drag, setDrag] = useState<Drag | null>(null);
  const [insertAt, setInsertAt] = useState<number | null>(null);
  const [announce, setAnnounce] = useState('');
  const answerRef = useRef<HTMLDivElement>(null);
  const bankRef = useRef<HTMLDivElement>(null);
  const tileRefs = useRef(new Map<string, HTMLButtonElement>());
  const focusAfter = useRef<string | null>(null);

  useEffect(() => {
    setPlaced([]);
    setDrag(null);
  }, [ex.id]);

  const textOf = useCallback((id: string) => ex.tiles.find((t) => t.id === id)?.text ?? '', [ex.tiles]);

  const commit = useCallback(
    (next: string[]) => {
      setPlaced(next);
      const needed = ex.accepted[0]?.length ?? ex.tiles.length;
      onChange(next.length >= needed ? { kind: 'order', tiles: next } : null);
    },
    [ex.accepted, ex.tiles.length, onChange],
  );

  useEffect(() => {
    if (focusAfter.current) {
      tileRefs.current.get(focusAfter.current)?.focus();
      focusAfter.current = null;
    }
  });

  const locked = phase === 'checked';
  const bank = ex.tiles.filter((t) => !placed.includes(t.id));

  const place = (id: string, at?: number) => {
    if (locked) return;
    const without = placed.filter((p) => p !== id);
    const idx = at === undefined ? without.length : Math.max(0, Math.min(at, without.length));
    const next = [...without.slice(0, idx), id, ...without.slice(idx)];
    commit(next);
    setAnnounce(`« ${textOf(id)} » placé en position ${idx + 1}.`);
  };

  const remove = (id: string) => {
    if (locked) return;
    commit(placed.filter((p) => p !== id));
    setAnnounce(`« ${textOf(id)} » retiré.`);
  };

  const move = (id: string, delta: number) => {
    const i = placed.indexOf(id);
    const j = i + delta;
    if (i < 0 || j < 0 || j >= placed.length) return;
    const next = [...placed];
    [next[i], next[j]] = [next[j], next[i]];
    focusAfter.current = id;
    commit(next);
    setAnnounce(`« ${textOf(id)} » déplacé en position ${j + 1}.`);
  };

  // --- glisser-déposer (pointeur : souris, stylet, doigt)
  const computeInsert = (x: number, y: number): number | null => {
    const zone = answerRef.current;
    if (!zone) return null;
    const r = zone.getBoundingClientRect();
    if (x < r.left - 24 || x > r.right + 24 || y < r.top - 24 || y > r.bottom + 24) return null;
    const ids = placed.filter((p) => p !== drag?.id);
    let idx = ids.length;
    for (let k = 0; k < ids.length; k++) {
      const el = tileRefs.current.get(ids[k]);
      if (!el) continue;
      const b = el.getBoundingClientRect();
      const sameLine = y >= b.top - 8 && y <= b.bottom + 8;
      if ((sameLine && x < b.left + b.width / 2) || y < b.top - 8) {
        idx = k;
        break;
      }
    }
    return idx;
  };

  const onPointerDown = (e: RPointerEvent<HTMLButtonElement>, id: string, from: 'bank' | 'answer') => {
    if (locked || e.button !== 0) return;
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    try {
      el.setPointerCapture?.(e.pointerId);
    } catch {
      /* capture indisponible (anciens navigateurs) : le glisser reste possible sans elle */
    }
    setDrag({ id, from, startX: e.clientX, startY: e.clientY, x: e.clientX, y: e.clientY, active: false, width: r.width, height: r.height });
  };

  const onPointerMove = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const dist = Math.hypot(e.clientX - drag.startX, e.clientY - drag.startY);
    const active = drag.active || dist > 6;
    setDrag({ ...drag, x: e.clientX, y: e.clientY, active });
    if (active) setInsertAt(computeInsert(e.clientX, e.clientY));
  };

  const onPointerUp = (e: RPointerEvent<HTMLButtonElement>) => {
    if (!drag) return;
    const d = drag;
    setDrag(null);
    setInsertAt(null);
    if (!d.active) {
      // simple toucher / clic
      if (d.from === 'bank') place(d.id);
      else remove(d.id);
      return;
    }
    const idx = computeInsert(e.clientX, e.clientY);
    if (idx !== null) place(d.id, idx);
    else if (d.from === 'answer') {
      const bankZone = bankRef.current?.getBoundingClientRect();
      if (bankZone && e.clientY >= bankZone.top - 20) remove(d.id);
    }
  };

  const onKeyAnswer = (e: RKeyboardEvent<HTMLButtonElement>, id: string) => {
    if (locked) return;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      move(id, -1);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      move(id, 1);
    } else if (e.key === 'Backspace' || e.key === 'Delete') {
      e.preventDefault();
      remove(id);
    }
  };

  const tile = (id: string, from: 'bank' | 'answer', index?: number) => {
    const isDragging = drag?.active && drag.id === id;
    return (
      <button
        key={id}
        ref={(el) => {
          if (el) tileRefs.current.set(id, el);
          else tileRefs.current.delete(id);
        }}
        type="button"
        className={`tile${isDragging ? ' is-dragging' : ''}${from === 'answer' ? ' tile-placed' : ''}`}
        onPointerDown={(e) => onPointerDown(e, id, from)}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={() => {
          setDrag(null);
          setInsertAt(null);
        }}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (from === 'bank') place(id);
            else remove(id);
            return;
          }
          if (from === 'answer') onKeyAnswer(e, id);
        }}
        disabled={locked}
        aria-label={from === 'bank' ? `${textOf(id)} — placer` : `${textOf(id)}, position ${(index ?? 0) + 1} — Entrée pour retirer, flèches pour déplacer`}
        lang="en"
      >
        {textOf(id)}
      </button>
    );
  };

  const answerIds = placed.filter((p) => !(drag?.active && drag.id === p));

  return (
    <div className="ex-order">
      <div className="order-prompt">
        <p className="translation translation-prompt">{ex.translation}</p>
      </div>
      <div ref={answerRef} className={`answer-line${placed.length === 0 ? ' is-empty' : ''}${drag?.active ? ' is-target' : ''}`} aria-label="Votre phrase">
        {answerIds.length === 0 && insertAt === null && <span className="answer-placeholder">Touchez ou glissez les mots ici…</span>}
        {answerIds.map((id, i) => (
          <span key={id} className="tile-slot">
            {insertAt === i && <span className="insert-caret" aria-hidden />}
            {tile(id, 'answer', i)}
          </span>
        ))}
        {insertAt !== null && insertAt >= answerIds.length && <span className="insert-caret" aria-hidden />}
      </div>
      <div ref={bankRef} className="word-bank" aria-label="Mots disponibles">
        {bank.map((t) => tile(t.id, 'bank'))}
        {bank.length === 0 && !locked && <span className="faint small">Tous les mots sont placés.</span>}
      </div>
      <div className="ex-tools">
        {!locked && placed.length > 0 && (
          <button type="button" className="link-btn" onClick={() => commit([])}>
            <IconUndo size={16} aria-hidden /> Tout retirer
          </button>
        )}
        {!locked && placed.length >= (ex.accepted[0]?.length ?? 0) && (
          <span className="faint small">
            Appuyez sur <kbd>Entrée</kbd> pour vérifier
          </span>
        )}
      </div>
      {drag?.active && (
        <div className="tile tile-ghost" style={{ left: drag.x - drag.width / 2, top: drag.y - drag.height / 2, width: drag.width }} aria-hidden>
          {textOf(drag.id)}
        </div>
      )}
      <div className="sr-only" aria-live="polite">
        {announce}
      </div>
      <SubmitOnEnter enabled={!locked} onSubmit={onSubmit} />
    </div>
  );
}

function SubmitOnEnter({ enabled, onSubmit }: { enabled: boolean; onSubmit: () => void }) {
  useEffect(() => {
    if (!enabled) return;
    const on = (e: KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) onSubmit();
    };
    window.addEventListener('keydown', on);
    return () => window.removeEventListener('keydown', on);
  }, [enabled, onSubmit]);
  return null;
}
