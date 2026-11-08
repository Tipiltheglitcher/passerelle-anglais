/**
 * Composants d'interface réutilisables.
 */
import { useEffect, useId, useRef, type ButtonHTMLAttributes, type ComponentType, type ReactNode } from 'react';
import { IconClose } from './icons';

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger' | 'success' | 'soft';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: 'sm' | 'md' | 'lg';
  icon?: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  iconRight?: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  block?: boolean;
}

export function Button({ variant = 'primary', size = 'md', icon: Icon, iconRight: IconR, block, className = '', children, type = 'button', ...rest }: ButtonProps) {
  return (
    <button type={type} className={`btn btn-${variant} btn-${size}${block ? ' btn-block' : ''} ${className}`} {...rest}>
      {Icon && <Icon size={size === 'lg' ? 20 : 18} aria-hidden />}
      {children && <span>{children}</span>}
      {IconR && <IconR size={size === 'lg' ? 20 : 18} aria-hidden />}
    </button>
  );
}

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>;
  label: string;
  size?: number;
  variant?: 'ghost' | 'soft';
}

export function IconButton({ icon: Icon, label, size = 20, variant = 'ghost', className = '', type = 'button', ...rest }: IconButtonProps) {
  return (
    <button type={type} className={`icon-btn icon-btn-${variant} ${className}`} aria-label={label} title={label} {...rest}>
      <Icon size={size} aria-hidden />
    </button>
  );
}

export function Card({ className = '', children, as: Tag = 'section', ...rest }: { className?: string; children: ReactNode; as?: 'section' | 'div' | 'article' } & Record<string, unknown>) {
  return (
    <Tag className={`card ${className}`} {...rest}>
      {children}
    </Tag>
  );
}

export function ProgressBar({ value, label, tone = 'primary', size = 'md' }: { value: number; label?: string; tone?: 'primary' | 'success' | 'accent' | 'warning' | 'danger'; size?: 'sm' | 'md' | 'lg' }) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100);
  return (
    <div className={`progress progress-${size} progress-${tone}`} role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label={label}>
      <div className="progress-fill" style={{ width: `${pct}%` }} />
    </div>
  );
}

export function ProgressRing({ value, size = 96, stroke = 9, children, tone = 'primary', label }: { value: number; size?: number; stroke?: number; children?: ReactNode; tone?: 'primary' | 'accent' | 'streak' | 'success'; label?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(1, Math.max(0, value));
  return (
    <div className={`ring ring-${tone}`} style={{ width: size, height: size }} role="img" aria-label={label ?? `${Math.round(v * 100)} %`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <circle className="ring-track" cx={size / 2} cy={size / 2} r={r} strokeWidth={stroke} fill="none" />
        {v > 0 && (
          <circle
            className="ring-fill"
            cx={size / 2}
            cy={size / 2}
            r={r}
            strokeWidth={stroke}
            fill="none"
            strokeLinecap="round"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - v)}
            transform={`rotate(-90 ${size / 2} ${size / 2})`}
          />
        )}
      </svg>
      <div className="ring-content">{children}</div>
    </div>
  );
}

export function Badge({ children, tone = 'neutral', className = '' }: { children: ReactNode; tone?: 'neutral' | 'primary' | 'success' | 'warning' | 'danger' | 'accent'; className?: string }) {
  return <span className={`badge badge-${tone} ${className}`}>{children}</span>;
}

export function Switch({ checked, onChange, label, description }: { checked: boolean; onChange: (v: boolean) => void; label: string; description?: string }) {
  const id = useId();
  return (
    <div className="switch-row">
      <div className="switch-text">
        <label htmlFor={id} className="switch-label">
          {label}
        </label>
        {description && <p className="muted small">{description}</p>}
      </div>
      <button id={id} type="button" role="switch" aria-checked={checked} className={`switch${checked ? ' is-on' : ''}`} onClick={() => onChange(!checked)}>
        <span className="switch-thumb" />
      </button>
    </div>
  );
}

export function Segmented<T extends string>({ value, options, onChange, label }: { value: T; options: { value: T; label: string }[]; onChange: (v: T) => void; label: string }) {
  return (
    <div className="segmented" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.value} type="button" role="radio" aria-checked={value === o.value} className={value === o.value ? 'is-active' : ''} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  );
}

/** Boîte de dialogue modale accessible (piège du focus, Échap pour fermer). */
export function Modal({ open, onClose, title, children, footer }: { open: boolean; onClose: () => void; title: string; children: ReactNode; footer?: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const titleId = useId();
  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement as HTMLElement | null;
    const node = ref.current;
    const focusables = () => Array.from(node?.querySelectorAll<HTMLElement>('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])') ?? []).filter((el) => !el.hasAttribute('disabled'));
    focusables()[0]?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
      if (e.key === 'Tab') {
        const els = focusables();
        if (!els.length) return;
        const first = els[0];
        const last = els[els.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      prev?.focus?.();
    };
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="modal-backdrop" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref}>
        <header className="modal-header">
          <h2 id={titleId}>{title}</h2>
          <IconButton icon={IconClose} label="Fermer" onClick={onClose} />
        </header>
        <div className="modal-body">{children}</div>
        {footer && <footer className="modal-footer">{footer}</footer>}
      </div>
    </div>
  );
}

export function Stat({ label, value, sub, icon: Icon, tone = 'primary' }: { label: string; value: ReactNode; sub?: ReactNode; icon?: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>; tone?: string }) {
  return (
    <div className={`stat stat-${tone}`}>
      {Icon && (
        <div className="stat-icon">
          <Icon size={20} aria-hidden />
        </div>
      )}
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon: Icon, title, children }: { icon: ComponentType<{ size?: number; 'aria-hidden'?: boolean }>; title: string; children?: ReactNode }) {
  return (
    <div className="empty">
      <div className="empty-icon">
        <Icon size={28} aria-hidden />
      </div>
      <h3>{title}</h3>
      {children && <div className="muted">{children}</div>}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions, eyebrow }: { title: string; subtitle?: ReactNode; actions?: ReactNode; eyebrow?: string }) {
  return (
    <header className="page-header">
      <div>
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <h1>{title}</h1>
        {subtitle && <p className="page-subtitle">{subtitle}</p>}
      </div>
      {actions && <div className="page-actions">{actions}</div>}
    </header>
  );
}

export function Spinner({ label = 'Chargement…' }: { label?: string }) {
  return (
    <div className="spinner-wrap" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span className="sr-only">{label}</span>
    </div>
  );
}
