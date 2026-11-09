/**
 * Classement entre joueurs : XP de la semaine et XP cumulés, calculés et
 * plafonnés par le serveur à partir des séances terminées.
 */
import { useEffect, useState } from 'react';
import { Link } from '@/app/router';
import { account, useAccount } from '@/account/instance';
import type { Leaderboard } from '@/account/api';
import { Button, Card, EmptyState, PageHeader, Segmented, Spinner } from '@/ui/kit';
import { IconCloudOff, IconInfo, IconLogin, IconMedal, IconRefresh, IconTrophy, IconWarning } from '@/ui/icons';

const fmt = (n: number) => n.toLocaleString('fr-FR');

export function LeaderboardPage() {
  const status = useAccount((s) => s.status);
  const user = useAccount((s) => s.user);
  const scores = useAccount((s) => s.scores);
  const [period, setPeriod] = useState<'week' | 'all'>('week');
  const [data, setData] = useState<Leaderboard | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [reload, setReload] = useState(0);

  useEffect(() => {
    if (!user) return;
    let alive = true;
    setLoading(true);
    setError(null);
    account
      .leaderboard(period)
      .then((d) => alive && setData(d))
      .catch((e) => alive && setError(e instanceof Error ? e.message : String(e)))
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
    // les XP du joueur changent après une synchronisation : on recharge
  }, [user, period, reload, scores?.totalXp]);

  if (status === 'disabled') {
    return (
      <EmptyState icon={IconCloudOff} title="Classement indisponible">
        Cette version de Passerelle fonctionne uniquement en local.
      </EmptyState>
    );
  }
  if (!user) {
    return (
      <div className="stack">
        <PageHeader eyebrow="Classement" title="Classement entre amis" subtitle="Comparez vos XP de la semaine et votre progression avec vos amis." />
        <Card className="center leaderboard-guest">
          <IconTrophy size={36} aria-hidden />
          <h2>Connectez-vous pour voir le classement</h2>
          <p className="muted">Créez un compte avec un simple pseudo : vos séances compteront dès sa création.</p>
          <Link to="/compte" className="btn btn-primary btn-lg">
            <IconLogin size={18} aria-hidden /> Se connecter ou créer un compte
          </Link>
        </Card>
      </div>
    );
  }

  const me = data?.me ?? null;
  const key = period === 'week' ? 'weekXp' : 'totalXp';
  return (
    <div className="stack">
      <PageHeader
        eyebrow="Classement"
        title="Classement entre amis"
        subtitle={period === 'week' ? 'XP gagnés depuis lundi (00 h UTC). Le classement repart de zéro chaque semaine.' : 'XP cumulés depuis la création de chaque compte.'}
        actions={<Button variant="ghost" icon={IconRefresh} onClick={() => setReload((n) => n + 1)} disabled={loading} aria-label="Actualiser le classement">Actualiser</Button>}
      />
      <Segmented
        label="Période"
        value={period}
        onChange={setPeriod}
        options={[
          { value: 'week', label: 'Cette semaine' },
          { value: 'all', label: 'Depuis le début' },
        ]}
      />

      {me && (
        <Card className="leader-me">
          <div className="leader-me-rank">
            <span className="faint small">Votre position</span>
            <strong>{me.rank ? `${me.rank}${me.rank === 1 ? 'er' : 'e'}` : '—'}</strong>
            {me.rank && data && <span className="faint small">sur {data.players}</span>}
          </div>
          <div>
            <span className="faint small">XP semaine</span>
            <strong>{fmt(me.weekXp)}</strong>
          </div>
          <div>
            <span className="faint small">XP total</span>
            <strong>{fmt(me.totalXp)}</strong>
          </div>
          <div>
            <span className="faint small">Niveau estimé</span>
            <strong>{me.level}</strong>
          </div>
          {me.hidden && (
            <p className="small muted leader-me-note">
              Vous êtes masqué du classement : les autres joueurs ne vous voient pas. <Link to="/compte">Modifier</Link>
            </p>
          )}
        </Card>
      )}

      {error && (
        <p className="notice notice-danger" role="alert">
          <IconWarning size={18} aria-hidden />
          <span>{error}</span>
        </p>
      )}
      {!data && loading && <Spinner label="Chargement du classement…" />}
      {data && (
        <Card className="table-wrap leader-table-card">
          <table className="data-table leader-table">
            <caption className="sr-only">Classement {period === 'week' ? 'de la semaine' : 'global'}</caption>
            <thead>
              <tr>
                <th scope="col">Rang</th>
                <th scope="col">Pseudo</th>
                <th scope="col" className="num">
                  XP semaine
                </th>
                <th scope="col" className="num">
                  XP total
                </th>
                <th scope="col">Niveau</th>
              </tr>
            </thead>
            <tbody>
              {data.rows.map((r) => (
                <tr key={r.pseudo} className={r.me ? 'is-me' : undefined} aria-current={r.me ? 'true' : undefined}>
                  <td>
                    <span className={`leader-rank${r.rank && r.rank <= 3 && r[key] > 0 ? ` is-top is-top-${r.rank}` : ''}`}>
                      {r.rank && r.rank <= 3 && r[key] > 0 ? <IconMedal size={16} aria-hidden /> : null}
                      {r.rank}
                    </span>
                  </td>
                  <td className="leader-pseudo">
                    {r.pseudo}
                    {r.me && <span className="faint small"> (vous)</span>}
                  </td>
                  <td className="num">{fmt(r.weekXp)}</td>
                  <td className="num">{fmt(r.totalXp)}</td>
                  <td>{r.level}</td>
                </tr>
              ))}
              {!data.rows.length && (
                <tr>
                  <td colSpan={5} className="muted">
                    Personne n’apparaît encore au classement.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Card>
      )}

      <p className="faint small leader-rules">
        <IconInfo size={14} aria-hidden className="inline-icon" /> Les XP du classement sont vérifiés par le serveur. Seules comptent les séances terminées après la création du compte et déclarées dans les 7 jours. Les XP
        d’une séance sont plafonnés au maximum possible pour ses réponses, une séance trop rapide est ignorée, et chaque joueur est limité à 2 000 XP par jour. Le niveau affiché est une estimation de l’application, pas
        une certification. Invitez vos amis à créer un compte pour les voir apparaître ici.
      </p>
    </div>
  );
}
