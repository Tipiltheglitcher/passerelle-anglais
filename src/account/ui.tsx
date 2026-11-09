/**
 * Éléments d'interface du compte : pastille de compte (navigation),
 * indicateur de synchronisation et fenêtre de choix en cas de conflit.
 */
import { useState } from 'react';
import { Link } from '@/app/router';
import { Button, Modal } from '@/ui/kit';
import { IconCloud, IconCloudOff, IconRefresh, IconUser, IconWarning } from '@/ui/icons';
import { account, useAccount } from './instance';
import type { Summary } from './api';
import type { SyncStatus } from './sync';
import { STATUS_LABELS, statusTone } from './status';

export function SyncIcon({ status, size = 16 }: { status: SyncStatus; size?: number }) {
  if (status === 'offline') return <IconCloudOff size={size} aria-hidden />;
  if (status === 'error' || status === 'conflict') return <IconWarning size={size} aria-hidden />;
  if (status === 'syncing' || status === 'checking') return <IconRefresh size={size} aria-hidden className="spin" />;
  return <IconCloud size={size} aria-hidden />;
}

/** Pastille de compte : barre latérale (complète) ou bandeau mobile (compacte). */
export function AccountChip({ compact = false }: { compact?: boolean }) {
  const user = useAccount((s) => s.user);
  const status = useAccount((s) => s.status);
  if (status === 'disabled') return null;
  const label = user ? `${user.pseudo} · ${STATUS_LABELS[status]}` : 'Invité : se connecter';
  const tone = statusTone(status);
  if (compact) {
    return (
      <Link to="/compte" className={`account-avatar is-${tone}`} aria-label={`Compte — ${label}`} title={label}>
        {user ? <span aria-hidden>{user.pseudo.slice(0, 1).toUpperCase()}</span> : <IconUser size={20} aria-hidden />}
        {user && <span className="account-dot" aria-hidden />}
      </Link>
    );
  }
  return (
    <Link to="/compte" className={`account-chip is-${tone}`} title={label}>
      <span className="account-avatar is-static" aria-hidden>
        {user ? user.pseudo.slice(0, 1).toUpperCase() : <IconUser size={18} />}
      </span>
      <span className="account-chip-text">
        <strong>{user ? user.pseudo : 'Invité'}</strong>
        <span className="account-chip-status">
          {user && <SyncIcon status={status} size={13} />}
          {user ? STATUS_LABELS[status] : 'Se connecter'}
        </span>
      </span>
    </Link>
  );
}

function fmtDate(ts: number): string {
  if (!ts) return 'aucune';
  return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

function SummaryCard({ title, s }: { title: string; s: Summary | null }) {
  return (
    <div className="sync-compare-card">
      <h3>{title}</h3>
      {s ? (
        <dl>
          <div>
            <dt>XP</dt>
            <dd>{s.xp.toLocaleString('fr-FR')}</dd>
          </div>
          <div>
            <dt>Exercices</dt>
            <dd>{s.exercises.toLocaleString('fr-FR')}</dd>
          </div>
          <div>
            <dt>Niveau estimé</dt>
            <dd>{s.level}</dd>
          </div>
          <div>
            <dt>Dernière séance</dt>
            <dd>{fmtDate(s.lastActivity)}</dd>
          </div>
        </dl>
      ) : (
        <p className="muted small">Aucune progression.</p>
      )}
    </div>
  );
}

/** Fenêtre de choix : affichée tant qu'un conflit attend une décision. */
export function SyncConflictModal() {
  const conflict = useAccount((s) => s.conflict);
  const deferred = useAccount((s) => s.deferred);
  const message = useAccount((s) => s.message);
  const [busy, setBusy] = useState(false);
  if (!conflict) return null;
  const choose = async (c: 'account' | 'device' | 'fresh' | 'later') => {
    setBusy(true);
    try {
      await account.resolve(c);
    } finally {
      setBusy(false);
    }
  };
  const first = conflict.kind === 'first-login';
  const title = first ? 'Récupérer votre progression ?' : conflict.kind === 'device-data' ? 'Quelle progression garder ?' : 'Progression modifiée sur deux appareils';
  return (
    <Modal
      open={!deferred}
      onClose={() => void choose('later')}
      title={title}
      footer={
        first ? (
          <>
            <Button variant="ghost" onClick={() => void choose('later')} disabled={busy}>
              Plus tard
            </Button>
            <Button variant="ghost" className="danger-text" onClick={() => void choose('fresh')} disabled={busy}>
              Partir de zéro
            </Button>
            <Button onClick={() => void choose('device')} disabled={busy}>
              {busy ? 'Envoi…' : 'Envoyer vers mon compte'}
            </Button>
          </>
        ) : (
          <>
            <Button variant="ghost" onClick={() => void choose('later')} disabled={busy}>
              Plus tard
            </Button>
            <Button variant="secondary" onClick={() => void choose('device')} disabled={busy}>
              Garder celle de cet appareil
            </Button>
            <Button onClick={() => void choose('account')} disabled={busy}>
              {busy ? 'Synchronisation…' : 'Garder celle du compte'}
            </Button>
          </>
        )
      }
    >
      {first ? (
        <p>
          Votre compte est encore vide, mais cet appareil contient déjà une progression. Vous pouvez l’envoyer vers votre compte pour la retrouver sur vos autres appareils. « Partir de zéro » efface la progression de cet
          appareil.
        </p>
      ) : conflict.kind === 'device-data' ? (
        <p>Votre compte et cet appareil contiennent chacun une progression différente. Celle que vous ne gardez pas sera remplacée.</p>
      ) : (
        <p>Votre progression a changé sur cet appareil et sur un autre depuis la dernière synchronisation. Choisissez la version à conserver : l’autre sera remplacée.</p>
      )}
      <div className="sync-compare">
        <SummaryCard title="Cet appareil" s={conflict.local} />
        {!first && <SummaryCard title="Votre compte" s={conflict.remote} />}
      </div>
      <p className="muted small">Pour garder une copie de la version remplacée, exportez d’abord votre progression depuis les réglages.</p>
      {message && (
        <p className="notice notice-danger" role="alert">
          <IconWarning size={18} aria-hidden />
          <span>{message}</span>
        </p>
      )}
    </Modal>
  );
}
