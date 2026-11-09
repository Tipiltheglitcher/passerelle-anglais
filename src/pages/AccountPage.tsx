/**
 * Compte : inscription et connexion (pseudo + mot de passe), puis état de la
 * synchronisation, visibilité au classement, déconnexion et suppression.
 */
import { useState, type FormEvent } from 'react';
import { Link } from '@/app/router';
import { account, useAccount } from '@/account/instance';
import { PASSWORD_MIN, PSEUDO_RE } from '@/account/api';
import { SyncIcon } from '@/account/ui';
import { STATUS_LABELS, statusTone } from '@/account/status';
import { Button, Card, EmptyState, Modal, PageHeader, Segmented, Switch } from '@/ui/kit';
import { IconCheck, IconCloudOff, IconInfo, IconLogin, IconLogout, IconRefresh, IconShield, IconTrash, IconTrophy, IconWarning } from '@/ui/icons';

function ErrorNotice({ text }: { text: string | null }) {
  if (!text) return null;
  return (
    <p className="notice notice-danger" role="alert">
      <IconWarning size={18} aria-hidden />
      <span>{text}</span>
    </p>
  );
}

function AuthForms() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [pseudo, setPseudo] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const expired = useAccount((s) => s.message);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError(null);
    const p = pseudo.trim();
    if (!PSEUDO_RE.test(p)) return setError('Pseudo : 3 à 20 caractères, lettres sans accent, chiffres, point, tiret ou tiret bas.');
    if (password.length < PASSWORD_MIN) return setError(`Le mot de passe doit contenir au moins ${PASSWORD_MIN} caractères.`);
    if (password.length > 200) return setError('Mot de passe trop long.');
    if (mode === 'register' && password !== confirm) return setError('Les deux mots de passe ne correspondent pas.');
    setBusy(true);
    try {
      if (mode === 'register') await account.register(p, password);
      else await account.login(p, password);
      setPassword('');
      setConfirm('');
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="account-layout">
      <Card className="account-card">
        <Segmented
          label="Connexion ou inscription"
          value={mode}
          onChange={(v) => {
            setMode(v);
            setError(null);
          }}
          options={[
            { value: 'login', label: 'Se connecter' },
            { value: 'register', label: 'Créer un compte' },
          ]}
        />
        <form className="account-form" onSubmit={(e) => void submit(e)} noValidate>
          <div className="field">
            <label htmlFor="acc-pseudo">Pseudo</label>
            <input
              id="acc-pseudo"
              className="input"
              value={pseudo}
              onChange={(e) => setPseudo(e.target.value)}
              autoComplete="username"
              autoCapitalize="off"
              spellCheck={false}
              maxLength={20}
              required
            />
            {mode === 'register' && <span className="faint small">3 à 20 caractères : lettres sans accent, chiffres, « . », « - » ou « _ ». Il sera visible au classement.</span>}
          </div>
          <div className="field">
            <label htmlFor="acc-password">Mot de passe</label>
            <input
              id="acc-password"
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              minLength={PASSWORD_MIN}
              required
            />
            {mode === 'register' && <span className="faint small">Au moins {PASSWORD_MIN} caractères.</span>}
          </div>
          {mode === 'register' && (
            <div className="field">
              <label htmlFor="acc-confirm">Confirmer le mot de passe</label>
              <input id="acc-confirm" className="input" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} autoComplete="new-password" required />
            </div>
          )}
          {mode === 'register' && (
            <div className="notice notice-warning">
              <IconWarning size={20} aria-hidden />
              <p>
                <strong>Aucune adresse email n’est demandée</strong> : un mot de passe oublié ne peut pas être récupéré. Notez-le ou utilisez un gestionnaire de mots de passe.
              </p>
            </div>
          )}
          <ErrorNotice text={error ?? expired} />
          <Button type="submit" size="lg" block icon={IconLogin} disabled={busy}>
            {busy ? (mode === 'register' ? 'Création du compte…' : 'Connexion…') : mode === 'register' ? 'Créer mon compte' : 'Se connecter'}
          </Button>
        </form>
      </Card>
      <Card className="account-aside">
        <h2>Pourquoi un compte ?</h2>
        <ul className="account-list">
          <li>
            <IconRefresh size={18} aria-hidden /> Retrouver votre progression sur vos autres appareils.
          </li>
          <li>
            <IconTrophy size={18} aria-hidden /> Comparer vos XP avec vos amis dans le classement.
          </li>
          <li>
            <IconShield size={18} aria-hidden /> Seuls un pseudo et un mot de passe sont demandés. Le mot de passe est transformé sur votre appareil avant l’envoi et n’est jamais conservé en clair.
          </li>
        </ul>
        <p className="muted small">
          Le compte est facultatif : sans compte, tout fonctionne et votre progression reste dans ce navigateur. <Link to="/">Continuer sans compte</Link>
        </p>
      </Card>
    </div>
  );
}

function fmt(ts: number | null): string {
  if (!ts) return 'jamais';
  return new Date(ts).toLocaleString('fr-FR', { day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
}

function AccountDashboard() {
  const user = useAccount((s) => s.user)!;
  const status = useAccount((s) => s.status);
  const lastSyncAt = useAccount((s) => s.lastSyncAt);
  const message = useAccount((s) => s.message);
  const conflict = useAccount((s) => s.conflict);
  const scores = useAccount((s) => s.scores);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [wipe, setWipe] = useState(false);
  const [password, setPassword] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hiddenBusy, setHiddenBusy] = useState(false);

  const closeAll = () => {
    setLogoutOpen(false);
    setDeleteOpen(false);
    setWipe(false);
    setPassword('');
    setConfirmed(false);
    setError(null);
  };

  const doLogout = async () => {
    setBusy(true);
    try {
      await account.logout({ wipeLocal: wipe });
      closeAll();
    } finally {
      setBusy(false);
    }
  };

  const doDelete = async () => {
    setBusy(true);
    setError(null);
    try {
      await account.deleteAccount(password, { wipeLocal: wipe });
      closeAll();
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setBusy(false);
    }
  };

  const toggleHidden = async (visible: boolean) => {
    setHiddenBusy(true);
    setError(null);
    try {
      await account.setHidden(!visible);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setHiddenBusy(false);
    }
  };

  const busySync = status === 'syncing' || status === 'checking';
  return (
    <div className="stack">
      <Card className="account-hero">
        <span className="account-avatar is-static is-lg" aria-hidden>
          {user.pseudo.slice(0, 1).toUpperCase()}
        </span>
        <div className="spacer">
          <h2>{user.pseudo}</h2>
          <p className="muted small">Compte créé le {new Date(user.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
        </div>
      </Card>

      <div className="grid grid-2">
        <Card className="account-card">
          <h2 className="card-title">Synchronisation</h2>
          <p className={`sync-line is-${statusTone(status)}`} role="status">
            <SyncIcon status={status} size={18} />
            <strong>{STATUS_LABELS[status]}</strong>
          </p>
          <p className="muted small">Dernière synchronisation : {fmt(lastSyncAt)}</p>
          <p className="faint small">La progression est envoyée après chaque séance, puis au plus toutes les 5 minutes s’il reste des changements. Elle reste aussi enregistrée sur cet appareil.</p>
          {status === 'offline' && (
            <p className="notice notice-warning">
              <IconCloudOff size={18} aria-hidden />
              <span>Serveur injoignable : vos progrès sont conservés sur cet appareil et seront envoyés dès le retour de la connexion.</span>
            </p>
          )}
          {status === 'error' && <ErrorNotice text={message} />}
          {conflict ? (
            <Button onClick={() => account.reopenConflict()} icon={IconWarning}>
              Choisir la progression à garder
            </Button>
          ) : (
            <Button variant="secondary" icon={IconRefresh} onClick={() => void account.syncNow()} disabled={busySync}>
              {busySync ? 'Synchronisation…' : 'Synchroniser maintenant'}
            </Button>
          )}
        </Card>

        <Card className="account-card">
          <h2 className="card-title">Classement</h2>
          <div className="account-scores">
            <div>
              <span className="faint small">XP de la semaine</span>
              <strong>{scores ? scores.weekXp.toLocaleString('fr-FR') : '—'}</strong>
            </div>
            <div>
              <span className="faint small">XP au classement</span>
              <strong>{scores ? scores.totalXp.toLocaleString('fr-FR') : '—'}</strong>
            </div>
          </div>
          <Switch
            checked={!user.hidden}
            onChange={(v) => {
              if (!hiddenBusy) void toggleHidden(v);
            }}
            label="Apparaître dans le classement"
            description="Seuls votre pseudo, vos XP et votre niveau estimé sont visibles des autres joueurs."
          />
          <Link to="/classement" className="btn btn-secondary btn-md">
            <IconTrophy size={18} aria-hidden /> Voir le classement
          </Link>
        </Card>
      </div>

      <Card className="account-card">
        <h2 className="card-title">Sécurité et données</h2>
        <p className="muted small">
          <IconInfo size={16} aria-hidden className="inline-icon" /> Sans adresse email, un mot de passe oublié ne peut pas être récupéré. La session reste ouverte sur cet appareil jusqu’à la déconnexion (ou après 90 jours
          sans utilisation).
        </p>
        <ErrorNotice text={!deleteOpen ? error : null} />
        <div className="row row-wrap">
          <Button variant="secondary" icon={IconLogout} onClick={() => setLogoutOpen(true)}>
            Se déconnecter
          </Button>
          <span className="spacer" />
          <Button variant="ghost" className="danger-text" icon={IconTrash} onClick={() => setDeleteOpen(true)}>
            Supprimer mon compte
          </Button>
        </div>
      </Card>

      <Modal
        open={logoutOpen}
        onClose={closeAll}
        title="Se déconnecter ?"
        footer={
          <>
            <Button variant="ghost" onClick={closeAll}>
              Annuler
            </Button>
            <Button icon={IconLogout} onClick={() => void doLogout()} disabled={busy}>
              {busy ? 'Déconnexion…' : 'Se déconnecter'}
            </Button>
          </>
        }
      >
        <p>Les derniers changements sont d’abord envoyés vers votre compte. La progression reste ensuite sur cet appareil, en mode invité.</p>
        <label className="check-row">
          <input type="checkbox" checked={wipe} onChange={(e) => setWipe(e.target.checked)} />
          <span>Effacer aussi la progression de cet appareil (conseillé sur un ordinateur partagé)</span>
        </label>
      </Modal>

      <Modal
        open={deleteOpen}
        onClose={closeAll}
        title="Supprimer définitivement le compte ?"
        footer={
          <>
            <Button variant="ghost" onClick={closeAll}>
              Annuler
            </Button>
            <Button variant="danger" icon={IconTrash} disabled={!confirmed || !password || busy} onClick={() => void doDelete()}>
              {busy ? 'Suppression…' : 'Supprimer'}
            </Button>
          </>
        }
      >
        <p>Votre compte, la progression enregistrée sur le serveur et vos résultats au classement seront supprimés définitivement. Cette action est irréversible.</p>
        <div className="field">
          <label htmlFor="del-password">Mot de passe</label>
          <input id="del-password" className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
        </div>
        <label className="check-row">
          <input type="checkbox" checked={wipe} onChange={(e) => setWipe(e.target.checked)} />
          <span>Effacer aussi la progression de cet appareil</span>
        </label>
        <label className="check-row">
          <input type="checkbox" checked={confirmed} onChange={(e) => setConfirmed(e.target.checked)} />
          <span>Je comprends que cette suppression est définitive.</span>
        </label>
        <ErrorNotice text={deleteOpen ? error : null} />
      </Modal>
    </div>
  );
}

export function AccountPage() {
  const status = useAccount((s) => s.status);
  const user = useAccount((s) => s.user);
  if (status === 'disabled') {
    return (
      <EmptyState icon={IconCloudOff} title="Comptes indisponibles">
        Cette version de Passerelle fonctionne uniquement en local : votre progression reste dans ce navigateur.
      </EmptyState>
    );
  }
  return (
    <div className="stack">
      <PageHeader eyebrow="Compte" title={user ? 'Votre compte' : 'Connexion'} subtitle={user ? 'Synchronisation de la progression et classement entre amis.' : 'Retrouvez votre progression sur tous vos appareils et mesurez-vous à vos amis.'} />
      {user ? <AccountDashboard /> : <AuthForms />}
      {user && status === 'synced' && (
        <p className="faint small center">
          <IconCheck size={14} aria-hidden className="inline-icon" /> Progression à jour sur ce compte.
        </p>
      )}
    </div>
  );
}
