import { useEffect, type ReactNode } from 'react';
import { matchPath, useRoute } from './router';
import { Layout } from './Layout';
import { applyMotion, applyTheme, watchSystemTheme } from './theme';
import { store, useAppState } from '@/state/store';
import { Spinner } from '@/ui/kit';
import { DashboardPage } from '@/pages/DashboardPage';
import { PathPage } from '@/pages/PathPage';
import { LessonPage } from '@/pages/LessonPage';
import { PracticePage } from '@/pages/PracticePage';
import { VocabPage, VocabThemePage } from '@/pages/VocabPage';
import { StatsPage } from '@/pages/StatsPage';
import { SettingsPage } from '@/pages/SettingsPage';
import { SessionPage } from '@/pages/SessionPage';
import { PlacementPage } from '@/pages/PlacementPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { AccountPage } from '@/pages/AccountPage';
import { LeaderboardPage } from '@/pages/LeaderboardPage';
import { account } from '@/account/instance';

export function App() {
  const status = useAppState((s) => s.status);
  const error = useAppState((s) => s.error);
  const theme = useAppState((s) => s.settings.theme);
  const motion = useAppState((s) => s.settings.motion);
  const route = useRoute();

  // initialisation (relancée si le module de stockage est rechargé à chaud en développement)
  useEffect(() => {
    if (status === 'loading') void store.ensureInit();
  }, [status]);

  useEffect(() => {
    applyTheme(theme);
    return watchSystemTheme(() => store.getState().settings.theme);
  }, [theme]);

  useEffect(() => applyMotion(motion), [motion]);

  // compte : vérification de la session et synchronisation, une fois la progression locale chargée
  useEffect(() => {
    if (status === 'ready') account.start();
  }, [status]);

  // remonte en haut de page à chaque changement d'écran
  useEffect(() => {
    window.scrollTo?.({ top: 0 });
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [route.path]);

  if (status === 'loading') {
    return (
      <div className="boot">
        <Spinner label="Chargement de votre progression…" />
      </div>
    );
  }
  if (status === 'error') {
    return (
      <div className="boot">
        <div className="card boot-error">
          <h1>Impossible de démarrer</h1>
          <p>{error}</p>
          <button className="btn btn-primary btn-md" onClick={() => location.reload()}>
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (route.path === '/seance') return <SessionPage key={route.query.toString()} query={route.query} />;

  let page: ReactNode;
  let params: Record<string, string> | null;
  if (route.path === '/') page = <DashboardPage />;
  else if (route.path === '/parcours') page = <PathPage />;
  else if ((params = matchPath('/lecon/:id', route.path))) page = <LessonPage skillId={params.id} />;
  else if (route.path === '/entrainement') page = <PracticePage />;
  else if (route.path === '/vocabulaire') page = <VocabPage />;
  else if ((params = matchPath('/vocabulaire/:theme', route.path))) page = <VocabThemePage themeId={params.theme} />;
  else if (route.path === '/statistiques') page = <StatsPage />;
  else if (route.path === '/parametres') page = <SettingsPage />;
  else if (route.path === '/test-niveau') page = <PlacementPage />;
  else if (route.path === '/compte') page = <AccountPage />;
  else if (route.path === '/classement') page = <LeaderboardPage />;
  else page = <NotFoundPage />;

  return <Layout>{page}</Layout>;
}
