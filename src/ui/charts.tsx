/**
 * Graphiques SVG légers (sans bibliothèque) : colonnes, courbe, barres
 * horizontales. Une seule série par graphique, couleur --chart-1 validée pour
 * les deux thèmes ; info-bulle au survol et au clavier (flèches) ; chaque
 * graphique possède une vue tableau équivalente fournie par la page.
 */
import { useEffect, useId, useRef, useState, type KeyboardEvent, type PointerEvent, type ReactNode } from 'react';

export interface ChartPoint {
  key: string;
  /** Libellé court de l'axe horizontal. */
  axis: string;
  /** null = pas de donnée (aucun point tracé). */
  value: number | null;
  /** Valeur mise en avant dans l'info-bulle. */
  valueText: string;
  /** Lignes secondaires de l'info-bulle (date, détail). */
  detail: string[];
}

function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const measure = () => {
      const w = Math.round(el.getBoundingClientRect().width);
      if (w > 0) setWidth(Math.max(260, w));
    };
    measure();
    if (typeof ResizeObserver === 'undefined') return;
    const ro = new ResizeObserver(measure);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);
  return [ref, width] as const;
}

/** Pas « rond » (1, 2, 5 × 10ⁿ) pour environ `target` graduations. */
export function niceStep(max: number, target = 4, integer = true): number {
  if (max <= 0) return 1;
  const raw = max / target;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const norm = raw / mag;
  const step = (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
  return integer ? Math.max(1, Math.round(step)) : step;
}

const fmt = new Intl.NumberFormat('fr-FR');

/** Une étiquette d'axe toutes les « every » valeurs (même rythme pour tous les graphiques). */
function labelEvery(n: number, width: number): number {
  return Math.max(1, Math.ceil(n / Math.max(1, Math.floor((width - 90) / 44))));
}

/** Colonne à bout arrondi (4 px) et base carrée. */
function columnPath(x: number, yTop: number, w: number, yBase: number): string {
  const h = yBase - yTop;
  const r = Math.min(4, w / 2, h);
  return `M${x},${yBase}V${yTop + r}A${r},${r} 0 0 1 ${x + r},${yTop}H${x + w - r}A${r},${r} 0 0 1 ${x + w},${yTop + r}V${yBase}Z`;
}

interface FrameProps {
  points: ChartPoint[];
  ariaLabel: string;
  active: number | null;
  setActive: (i: number | null) => void;
  width: number;
  left: number;
  band: number;
  children: ReactNode;
}

/** Conteneur commun : focus clavier, info-bulle, annonce pour les lecteurs d'écran. */
function ChartFrame({ points, ariaLabel, active, setActive, width, left, band, children }: FrameProps) {
  const liveId = useId();
  const onKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (!points.length) return;
    const cur = active ?? points.length - 1;
    let next: number | null = null;
    if (e.key === 'ArrowLeft') next = Math.max(0, cur - 1);
    else if (e.key === 'ArrowRight') next = Math.min(points.length - 1, cur + 1);
    else if (e.key === 'Home') next = 0;
    else if (e.key === 'End') next = points.length - 1;
    else if (e.key === 'Escape') {
      setActive(null);
      return;
    }
    if (next !== null) {
      e.preventDefault();
      setActive(next);
    }
  };
  const p = active !== null ? points[active] : null;
  const cx = active !== null ? left + band * active + band / 2 : 0;
  // l'info-bulle se place à côté du point survolé, du côté où il y a de la place
  const toLeft = cx > width / 2;
  return (
    <div
      className="chart-frame"
      tabIndex={0}
      role="group"
      aria-label={`${ariaLabel}. Flèches gauche et droite pour parcourir les valeurs.`}
      aria-describedby={liveId}
      onKeyDown={onKey}
      onFocus={() => active === null && points.length && setActive(points.length - 1)}
      onBlur={() => setActive(null)}
    >
      {children}
      {p && (
        <div className="chart-tip" style={{ left: cx, transform: toLeft ? 'translateX(calc(-100% - 12px))' : 'translateX(12px)' }} aria-hidden>
          <strong>{p.valueText}</strong>
          {p.detail.map((d, i) => (
            <span key={i}>{d}</span>
          ))}
        </div>
      )}
      <span id={liveId} className="sr-only" aria-live="polite">
        {p ? `${p.detail[0] ?? ''} : ${p.valueText}. ${p.detail.slice(1).join('. ')}` : ''}
      </span>
    </div>
  );
}

export function ColumnChart({ points, ariaLabel, height = 220 }: { points: ChartPoint[]; ariaLabel: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const M = { top: 24, right: 8, bottom: 26, left: 40 };
  const plotW = width - M.left - M.right;
  const plotH = height - M.top - M.bottom;
  const max = Math.max(0, ...points.map((p) => p.value ?? 0));
  const step = niceStep(max);
  const top = Math.max(step, Math.ceil(max / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(v);
  const n = Math.max(1, points.length);
  const band = plotW / n;
  const barW = Math.max(2, Math.min(24, band * 0.62));
  const y = (v: number) => M.top + plotH - (v / top) * plotH;
  const every = labelEvery(n, width);
  let maxIdx = -1;
  points.forEach((p, i) => {
    if ((p.value ?? 0) > 0 && (maxIdx < 0 || (p.value ?? 0) >= (points[maxIdx].value ?? 0))) maxIdx = i;
  });

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.floor((e.clientX - r.left - M.left) / band);
    setActive(i >= 0 && i < points.length ? i : null);
  };

  return (
    <div ref={ref} className="chart">
      <ChartFrame points={points} ariaLabel={ariaLabel} active={active} setActive={setActive} width={width} left={M.left} band={band}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} onPointerMove={onMove} onPointerLeave={() => setActive(null)} aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line className={t === 0 ? 'chart-axis' : 'chart-grid'} x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart-tick" x={M.left - 8} y={y(t)} dy="0.35em" textAnchor="end">
                {fmt.format(t)}
              </text>
            </g>
          ))}
          {points.map((p, i) => {
            const cx = M.left + band * i + band / 2;
            const v = p.value ?? 0;
            const showAxis = (n - 1 - i) % every === 0;
            return (
              <g key={p.key}>
                {v > 0 && <path className={`chart-col${active === i ? ' is-active' : ''}`} d={columnPath(cx - barW / 2, y(v), barW, y(0))} />}
                {i === maxIdx && (
                  <text className="chart-value" x={cx} y={y(v) - 7} textAnchor="middle">
                    {fmt.format(v)}
                  </text>
                )}
                {showAxis && (
                  <text className="chart-tick" x={cx} y={height - 8} textAnchor="middle">
                    {p.axis}
                  </text>
                )}
              </g>
            );
          })}
          {active !== null && <rect className="chart-hover-band" x={M.left + band * active} y={M.top} width={band} height={plotH} />}
        </svg>
      </ChartFrame>
    </div>
  );
}

/** Courbe d'une proportion (0–1), avec trous là où il n'y a pas de donnée. */
export function LineChart({ points, ariaLabel, height = 220 }: { points: ChartPoint[]; ariaLabel: string; height?: number }) {
  const [ref, width] = useWidth<HTMLDivElement>();
  const [active, setActive] = useState<number | null>(null);
  const M = { top: 20, right: 44, bottom: 26, left: 44 };
  const plotW = width - M.left - M.right;
  const plotH = height - M.top - M.bottom;
  const n = Math.max(1, points.length);
  const band = plotW / n;
  const x = (i: number) => M.left + band * i + band / 2;
  const y = (v: number) => M.top + plotH * (1 - v);
  const ticks = [0, 0.25, 0.5, 0.75, 1];
  const every = labelEvery(n, width);

  // segments continus
  const segments: number[][] = [];
  let cur: number[] = [];
  points.forEach((p, i) => {
    if (p.value === null) {
      if (cur.length) segments.push(cur);
      cur = [];
    } else cur.push(i);
  });
  if (cur.length) segments.push(cur);
  const last = [...points.keys()].reverse().find((i) => points[i].value !== null);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const r = e.currentTarget.getBoundingClientRect();
    const i = Math.round((e.clientX - r.left - M.left - band / 2) / band);
    setActive(Math.max(0, Math.min(points.length - 1, i)));
  };

  return (
    <div ref={ref} className="chart">
      <ChartFrame points={points} ariaLabel={ariaLabel} active={active} setActive={setActive} width={width} left={M.left} band={band}>
        <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} onPointerMove={onMove} onPointerLeave={() => setActive(null)} aria-hidden>
          {ticks.map((t) => (
            <g key={t}>
              <line className={t === 0 ? 'chart-axis' : 'chart-grid'} x1={M.left} x2={width - M.right} y1={y(t)} y2={y(t)} />
              <text className="chart-tick" x={M.left - 8} y={y(t)} dy="0.35em" textAnchor="end">
                {Math.round(t * 100)} %
              </text>
            </g>
          ))}
          {segments.map((seg) => {
            const line = seg.map((i, k) => `${k ? 'L' : 'M'}${x(i)},${y(points[i].value!)}`).join('');
            const area = `${line}L${x(seg[seg.length - 1])},${y(0)}L${x(seg[0])},${y(0)}Z`;
            return (
              <g key={seg[0]}>
                {seg.length > 1 && <path className="chart-area" d={area} />}
                {seg.length > 1 && <path className="chart-line" d={line} />}
                {seg.length === 1 && seg[0] !== last && <circle className="chart-dot" cx={x(seg[0])} cy={y(points[seg[0]].value!)} r={4} />}
              </g>
            );
          })}
          {points.map((p, i) =>
            (n - 1 - i) % every === 0 ? (
              <text key={p.key} className="chart-tick" x={x(i)} y={height - 8} textAnchor="middle">
                {p.axis}
              </text>
            ) : null,
          )}
          {last !== undefined && (
            <>
              <circle className="chart-dot" cx={x(last)} cy={y(points[last].value!)} r={4} />
              <text className="chart-value" x={x(last) + 9} y={y(points[last].value!)} dy="0.35em" textAnchor="start">
                {Math.round(points[last].value! * 100)} %
              </text>
            </>
          )}
          {active !== null && (
            <>
              <line className="chart-crosshair" x1={x(active)} x2={x(active)} y1={M.top} y2={y(0)} />
              {points[active].value !== null && <circle className="chart-dot is-active" cx={x(active)} cy={y(points[active].value!)} r={5} />}
            </>
          )}
        </svg>
      </ChartFrame>
    </div>
  );
}

export interface BarRow {
  key: string;
  label: ReactNode;
  /** Proportion 0–1 (longueur de la barre). */
  value: number;
  valueText: string;
  sub?: ReactNode;
}

/** Barres horizontales (une série) : piste claire, remplissage --chart-1, valeur en bout. */
export function BarRows({ rows, label }: { rows: BarRow[]; label: string }) {
  return (
    <ul className="bar-rows" aria-label={label}>
      {rows.map((r) => (
        <li key={r.key} className="bar-row">
          <div className="bar-row-label">
            {r.label}
            {r.sub && <span className="bar-row-sub">{r.sub}</span>}
          </div>
          <div className="bar-row-track" aria-hidden>
            {r.value > 0 && <span className="bar-row-fill" style={{ width: `${Math.max(1.5, Math.min(1, r.value) * 100)}%` }} />}
          </div>
          <span className="bar-row-value">{r.valueText}</span>
        </li>
      ))}
    </ul>
  );
}
