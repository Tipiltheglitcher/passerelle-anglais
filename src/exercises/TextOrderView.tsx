/**
 * Organisation d'un texte : réordonner des segments (boutons monter /
 * descendre, ou flèches du clavier sur l'élément sélectionné).
 */
import { useEffect, useState } from 'react';
import type { TextOrderExercise } from '@/engine/exercises/types';
import type { ExerciseViewProps } from './common';
import { IconArrowDown, IconArrowUp, IconCheck, IconClose } from '@/ui/icons';

export function TextOrderView({ exercise: ex, phase, onChange }: ExerciseViewProps<TextOrderExercise>) {
  const [order, setOrder] = useState<string[]>(() => ex.segments.map((s) => s.id));
  const [focus, setFocus] = useState<string | null>(null);
  useEffect(() => {
    const initial = ex.segments.map((s) => s.id);
    setOrder(initial);
    setFocus(null);
    onChange({ kind: 'sequence', ids: initial });
  }, [ex.id, ex.segments, onChange]);

  const byId = new Map(ex.segments.map((s) => [s.id, s]));
  const checked = phase === 'checked';
  const target = ex.orders[0];

  const move = (id: string, delta: number) => {
    if (checked) return;
    const i = order.indexOf(id);
    const j = i + delta;
    if (j < 0 || j >= order.length) return;
    const next = order.slice();
    [next[i], next[j]] = [next[j], next[i]];
    setOrder(next);
    onChange({ kind: 'sequence', ids: next });
  };

  return (
    <div className="ex-order">
      <h3 className="order-title" lang="en">
        {ex.title}
      </h3>
      {ex.lead && (
        <p className="order-lead" lang="en">
          {ex.lead}
        </p>
      )}
      <ol className="order-list" aria-label="Parties du texte, dans l'ordre choisi">
        {order.map((id, i) => {
          const seg = byId.get(id)!;
          const ok = checked ? target[i] === id : null;
          return (
            <li
              key={id}
              className={`order-item${focus === id ? ' is-focus' : ''}${ok === true ? ' is-correct' : ok === false ? ' is-wrong' : ''}`}
              tabIndex={checked ? -1 : 0}
              onFocus={() => setFocus(id)}
              onKeyDown={(e) => {
                if (e.key === 'ArrowUp') {
                  e.preventDefault();
                  move(id, -1);
                } else if (e.key === 'ArrowDown') {
                  e.preventDefault();
                  move(id, 1);
                }
              }}
              aria-label={`Position ${i + 1} : ${seg.text}`}
            >
              <span className="order-num" aria-hidden>
                {checked ? ok ? <IconCheck size={14} /> : <IconClose size={14} /> : i + 1}
              </span>
              <span className="order-text" lang="en">
                {seg.text}
                {checked && <span className="order-role">Place attendue : {target.indexOf(id) + 1} · {seg.role}</span>}
              </span>
              {!checked && (
                <span className="order-moves">
                  <button type="button" className="icon-btn" aria-label="Monter" onClick={() => move(id, -1)} disabled={i === 0}>
                    <IconArrowUp size={16} aria-hidden />
                  </button>
                  <button type="button" className="icon-btn" aria-label="Descendre" onClick={() => move(id, 1)} disabled={i === order.length - 1}>
                    <IconArrowDown size={16} aria-hidden />
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ol>
      {!checked && <p className="faint small">Déplacez les parties avec les flèches (ou les touches ↑ ↓ sur la partie sélectionnée), puis vérifiez.</p>}
    </div>
  );
}
