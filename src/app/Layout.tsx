/**
 * Mise en page : barre latérale (ordinateur), barre d'onglets (mobile),
 * en-tête avec série de jours, XP du jour et bascule de thème.
 */
import { useId, type ReactNode } from 'react';
import { Link, useRoute } from './router';
import { useAppState, store } from '@/state/store';
import { resolveTheme } from './theme';
import { dayKey, liveStreak } from '@/state/dates';
import { IconBook, IconFlame, IconHome, IconMoon, IconPath, IconPractice, IconSettings, IconStats, IconSun, IconZap } from '@/ui/icons';
import { IconButton } from '@/ui/kit';

const NAV = [
  { to: '/', label: 'Accueil', short: 'Accueil', icon: IconHome, match: (p: string) => p === '/' },
  { to: '/parcours', label: 'Parcours', short: 'Parcours', icon: IconPath, match: (p: string) => p.startsWith('/parcours') || p.startsWith('/lecon') },
  { to: '/entrainement', label: "S'entraîner", short: 'Exercices', icon: IconPractice, match: (p: string) => p.startsWith('/entrainement') },
  { to: '/vocabulaire', label: 'Vocabulaire', short: 'Mots', icon: IconBook, match: (p: string) => p.startsWith('/vocabulaire') },
  { to: '/statistiques', label: 'Statistiques', short: 'Stats', icon: IconStats, match: (p: string) => p.startsWith('/statistiques') },
  { to: '/parametres', label: 'Réglages', short: 'Réglages', icon: IconSettings, match: (p: string) => p.startsWith('/parametres') },
];

function Logo() {
  // identifiant propre à chaque logo (barre latérale et bandeau mobile coexistent dans le DOM)
  const gid = `logo-${useId().replace(/[^a-zA-Z0-9_-]/g, '')}`;
  return (
    <Link to="/" className="logo" aria-label="Passerelle — accueil">
      <svg viewBox="0 0 64 64" width="34" height="34" aria-hidden>
        <defs>
          <linearGradient id={gid} x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stopColor="var(--primary)" />
            <stop offset="1" stopColor="var(--accent)" />
          </linearGradient>
        </defs>
        <rect width="64" height="64" rx="16" fill={`url(#${gid})`} />
        <path d="M12 42c6-10 14-15 20-15s14 5 20 15" fill="none" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
        <path d="M20 42V34M32 42V28M44 42V34" stroke="#fff" strokeWidth="4" strokeLinecap="round" />
        <path d="M10 44h44" stroke="#fff" strokeWidth="5" strokeLinecap="round" />
      </svg>
      <span className="logo-text">
        Passerelle
        <small>A2 → B1</small>
      </span>
    </Link>
  );
}

export function ThemeToggle() {
  const pref = useAppState((s) => s.settings.theme);
  const current = resolveTheme(pref);
  const next = current === 'dark' ? 'light' : 'dark';
  return (
    <IconButton
      icon={current === 'dark' ? IconSun : IconMoon}
      label={current === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
      onClick={() => store.updateSettings({ theme: next })}
      variant="soft"
    />
  );
}

function HeaderStats() {
  const rawStreak = useAppState((s) => s.profile.streak);
  const lastActive = useAppState((s) => s.profile.lastActiveDate);
  const streak = liveStreak(rawStreak, lastActive, Date.now());
  const xpToday = useAppState((s) => s.daily[dayKey(Date.now())]?.xp ?? 0);
  const goal = useAppState((s) => s.settings.dailyGoalXp);
  const alive = lastActive === dayKey(Date.now());
  return (
    <div className="header-stats">
      <span className={`chip-stat${alive ? ' is-hot' : ''}`} title="Série de jours d'apprentissage">
        <IconFlame size={18} aria-hidden />
        <strong>{streak}</strong>
        <span className="sr-only">jours de série</span>
      </span>
      <span className="chip-stat" title="XP gagnés aujourd'hui / objectif">
        <IconZap size={18} aria-hidden />
        <strong>{xpToday}</strong>
        <span className="muted">/ {goal}</span>
        <span className="sr-only">XP aujourd'hui</span>
      </span>
    </div>
  );
}

export function Layout({ children }: { children: ReactNode }) {
  const route = useRoute();
  const storage = useAppState((s) => s.storage);
  return (
    <div className="app-shell">
      <a className="skip-link" href="#main">
        Aller au contenu
      </a>
      <aside className="sidebar" aria-label="Navigation principale">
        <Logo />
        <nav className="side-nav">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={`side-link${n.match(route.path) ? ' is-active' : ''}`} aria-current={n.match(route.path) ? 'page' : undefined}>
              <n.icon size={20} aria-hidden />
              <span>{n.label}</span>
            </Link>
          ))}
        </nav>
        <div className="side-footer">
          <HeaderStats />
          <ThemeToggle />
        </div>
      </aside>
      <div className="main-col">
        <header className="topbar">
          <Logo />
          <div className="topbar-right">
            <HeaderStats />
            <ThemeToggle />
          </div>
        </header>
        {storage === 'memory' && (
          <div className="banner banner-warning" role="status">
            Le stockage local du navigateur est indisponible : votre progression ne sera pas conservée après fermeture de cet onglet.
          </div>
        )}
        <main id="main" className="content" tabIndex={-1}>
          {children}
        </main>
      </div>
      <nav className="tabbar" aria-label="Navigation">
        {NAV.map((n) => (
          <Link key={n.to} to={n.to} className={`tab-link${n.match(route.path) ? ' is-active' : ''}`} aria-current={n.match(route.path) ? 'page' : undefined}>
            <n.icon size={22} aria-hidden />
            <span>{n.short}</span>
          </Link>
        ))}
      </nav>
    </div>
  );
}
