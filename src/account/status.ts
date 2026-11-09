/** Libellés et tonalités de l'état de synchronisation. */
import type { SyncStatus } from './sync';

export const STATUS_LABELS: Record<SyncStatus, string> = {
  disabled: 'Comptes indisponibles',
  guest: 'Invité · se connecter',
  checking: 'Vérification…',
  synced: 'Synchronisé',
  pending: 'Modifications en attente',
  syncing: 'Synchronisation…',
  offline: 'Hors ligne',
  error: 'Erreur de synchronisation',
  conflict: 'Choix requis',
};

export function statusTone(s: SyncStatus): 'ok' | 'busy' | 'warn' | 'off' {
  if (s === 'synced') return 'ok';
  if (s === 'checking' || s === 'syncing' || s === 'pending') return 'busy';
  if (s === 'offline' || s === 'error' || s === 'conflict') return 'warn';
  return 'off';
}
