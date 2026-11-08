/**
 * Vocabulaire : thèmes, listes de mots avec audio, état de la révision
 * espacée de chaque mot, et table des verbes irréguliers.
 */
import { useMemo, useState } from 'react';
import { Link, navigate } from '@/app/router';
import { store, useAppState } from '@/state/store';
import { POS_LABELS, VOCAB_THEMES, type VocabItem } from '@/content/vocabulary';
import { IRREGULAR_VERBS } from '@/content/lexicon/verbs';
import { effectiveMastery } from '@/engine/learning/mastery';
import { cardRetrievability } from '@/engine/learning/fsrs';
import type { ItemState } from '@/engine/learning/types';
import { stripAccents } from '@/engine/core/text';
import { relativeDue } from '@/state/dates';
import { AudioButton } from '@/exercises/audio';
import { Badge, Button, Card, EmptyState, PageHeader, ProgressBar, Segmented } from '@/ui/kit';
import { symbol } from '@/ui/symbols';
import { IconArrowLeft, IconBrain, IconLink, IconPlay, IconRepeat, IconSearch, IconWand } from '@/ui/icons';

type WordStatus = 'new' | 'due' | 'learning' | 'known';

/** Un mot est « mémorisé » quand sa stabilité dépasse deux semaines. */
function wordStatus(st: ItemState | undefined, now: number): WordStatus {
  if (!st) return 'new';
  if (st.card.due <= now) return 'due';
  if (st.card.stability >= 14 && st.card.state === 'review') return 'known';
  return 'learning';
}

const STATUS_LABEL: Record<WordStatus, string> = { new: 'Nouveau', due: 'À revoir', learning: 'En cours', known: 'Mémorisé' };
const STATUS_TONE: Record<WordStatus, 'neutral' | 'warning' | 'accent' | 'success'> = { new: 'neutral', due: 'warning', learning: 'accent', known: 'success' };

function themeStats(ids: string[], items: Record<string, ItemState>, now: number) {
  let seen = 0;
  let due = 0;
  let known = 0;
  for (const id of ids) {
    const st = wordStatus(items[id], now);
    if (st !== 'new') seen++;
    if (st === 'due') due++;
    if (st === 'known') known++;
  }
  return { total: ids.length, seen, due, known };
}

const IRREGULAR_IDS = IRREGULAR_VERBS.map((v) => `irr:${v.base}`);

export function VocabPage() {
  const items = useAppState((s) => s.items);
  const skills = useAppState((s) => s.skills);
  const now = Date.now();
  const due = store.dueCounts(now).itemsDue;
  const all = useMemo(() => themeStats([...VOCAB_THEMES.flatMap((t) => t.items.map((i) => i.id)), ...IRREGULAR_IDS], items, now), [items, now]);
  const irr = themeStats(IRREGULAR_IDS, items, now);

  return (
    <div className="stack">
      <PageHeader
        eyebrow="Vocabulaire"
        title="Mots, expressions et verbes"
        subtitle="Chaque mot rencontré entre dans la révision espacée : il revient juste avant que vous ne l'oubliiez."
        actions={
          <Button icon={IconRepeat} onClick={() => navigate(`/seance?mode=vocab&t=${now}`)}>
            {due ? `Réviser ${due} mot${due > 1 ? 's' : ''}` : 'Séance de vocabulaire'}
          </Button>
        }
      />

      <Card className="vocab-summary">
        <div className="vocab-summary-grid">
          <div>
            <div className="stat-value">{all.seen}</div>
            <div className="stat-label">mots déjà rencontrés sur {all.total}</div>
          </div>
          <div>
            <div className="stat-value c-success">{all.known}</div>
            <div className="stat-label">mémorisés (stabilité &gt; 2 semaines)</div>
          </div>
          <div>
            <div className="stat-value c-warning">{all.due}</div>
            <div className="stat-label">à revoir maintenant</div>
          </div>
        </div>
        <ProgressBar value={all.total ? all.known / all.total : 0} tone="success" label="Part du vocabulaire mémorisée" />
      </Card>

      <div className="theme-grid">
        <Link to="/vocabulaire/irreguliers" className="theme-card card">
          <span className="theme-icon tone-irr">
            <IconWand size={22} aria-hidden />
          </span>
          <span className="theme-body">
            <span className="theme-title">Verbes irréguliers</span>
            <span className="theme-sub">
              {irr.total} verbes · {irr.seen} rencontrés
              {irr.due > 0 && <Badge tone="warning">{irr.due} à revoir</Badge>}
            </span>
            <ProgressBar value={effectiveMastery(skills.past_simple_irregular, now)} size="sm" tone="accent" label="Maîtrise des verbes irréguliers" />
          </span>
        </Link>
        {VOCAB_THEMES.map((t, i) => {
          const Icon = symbol(t.icon);
          const st = themeStats(
            t.items.map((x) => x.id),
            items,
            now,
          );
          return (
            <Link key={t.id} to={`/vocabulaire/${t.id}`} className="theme-card card">
              <span className={`theme-icon unit-tone-${i % 6}`}>
                <Icon size={22} aria-hidden />
              </span>
              <span className="theme-body">
                <span className="theme-title">{t.title}</span>
                <span className="theme-sub">
                  {st.total} mots · {st.seen} rencontrés
                  {st.due > 0 && <Badge tone="warning">{st.due} à revoir</Badge>}
                </span>
                <ProgressBar value={effectiveMastery(skills[`vocab_${t.id}`], now)} size="sm" tone="accent" label={`Maîtrise du thème ${t.title}`} />
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}

type Filter = 'all' | 'due' | 'new' | 'known';

function matches(text: string, q: string): boolean {
  return stripAccents(text.toLowerCase()).includes(q);
}

export function VocabThemePage({ themeId }: { themeId: string }) {
  if (themeId === 'irreguliers') return <IrregularPage />;
  return <ThemeWords themeId={themeId} />;
}

function ThemeWords({ themeId }: { themeId: string }) {
  const theme = VOCAB_THEMES.find((t) => t.id === themeId);
  const items = useAppState((s) => s.items);
  const [filter, setFilter] = useState<Filter>('all');
  const [query, setQuery] = useState('');
  const now = Date.now();

  if (!theme) {
    return (
      <EmptyState icon={IconBrain} title="Thème introuvable">
        <Link to="/vocabulaire">Retour au vocabulaire</Link>
      </EmptyState>
    );
  }
  const q = stripAccents(query.trim().toLowerCase());
  const list = theme.items.filter((it) => {
    const st = wordStatus(items[it.id], now);
    if (filter === 'due' && st !== 'due') return false;
    if (filter === 'new' && st !== 'new') return false;
    if (filter === 'known' && st !== 'known') return false;
    if (q && !it.en.some((w) => matches(w, q)) && !it.fr.some((w) => matches(w, q))) return false;
    return true;
  });
  const st = themeStats(
    theme.items.map((x) => x.id),
    items,
    now,
  );

  return (
    <div className="stack">
      <Link to="/vocabulaire" className="back-link">
        <IconArrowLeft size={16} aria-hidden /> Vocabulaire
      </Link>
      <PageHeader
        eyebrow={`${st.total} mots et expressions`}
        title={theme.title}
        subtitle={`${st.seen} déjà rencontrés · ${st.known} mémorisés · ${st.due} à revoir`}
        actions={
          <>
            <Button icon={IconPlay} onClick={() => navigate(`/seance?mode=vocab&themes=${theme.id}&t=${now}`)}>
              S'entraîner sur ce thème
            </Button>
            <Button variant="secondary" icon={IconLink} onClick={() => navigate(`/seance?mode=practice&skills=vocab_${theme.id}&types=matching&size=8&t=${now}`)}>
              Associer les mots
            </Button>
          </>
        }
      />
      <div className="word-toolbar">
        <Segmented
          label="Filtrer les mots"
          value={filter}
          onChange={setFilter}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'due', label: `À revoir (${st.due})` },
            { value: 'new', label: 'Nouveaux' },
            { value: 'known', label: 'Mémorisés' },
          ]}
        />
        <label className="search-field">
          <IconSearch size={18} aria-hidden />
          <span className="sr-only">Rechercher un mot</span>
          <input className="input" type="search" placeholder="Rechercher (anglais ou français)…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {list.length === 0 ? (
        <EmptyState icon={IconBrain} title="Aucun mot ne correspond">
          Modifiez le filtre ou la recherche.
        </EmptyState>
      ) : (
        <ul className="word-list">
          {list.map((it) => (
            <WordRow key={it.id} item={it} state={items[it.id]} now={now} />
          ))}
        </ul>
      )}
    </div>
  );
}

function WordRow({ item, state, now }: { item: VocabItem; state: ItemState | undefined; now: number }) {
  const st = wordStatus(state, now);
  const r = state ? cardRetrievability(state.card, now) : 0;
  return (
    <li className="word-row card">
      <div className="word-main">
        <AudioButton text={item.en[0]} label={`Écouter « ${item.en[0]} »`} />
        <div className="word-text">
          <span className="word-en" lang="en">
            {item.en.join(' / ')}
          </span>
          <span className="word-fr">{item.fr.join(' / ')}</span>
        </div>
        <div className="word-tags">
          <Badge>{POS_LABELS[item.pos] ?? item.pos}</Badge>
          <Badge tone={item.lv === 'B1' ? 'accent' : 'primary'}>{item.lv}</Badge>
        </div>
      </div>
      {item.ex && (
        <div className="word-example">
          <AudioButton text={item.ex.en} label="Écouter l'exemple" />
          <div>
            <span lang="en">{item.ex.en}</span>
            <span className="faint"> — {item.ex.fr}</span>
          </div>
        </div>
      )}
      <div className="word-srs">
        <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>
        {state && (
          <>
            <span className="small faint">
              {st === 'due' ? 'révision due' : `prochaine révision ${relativeDue(state.card.due, now)}`} · {state.correct}/{state.seen} réussites
            </span>
            <span className="word-retention" title="Probabilité estimée de vous en souvenir aujourd'hui">
              <ProgressBar value={r} size="sm" tone={r >= 0.85 ? 'success' : r >= 0.6 ? 'accent' : 'warning'} label={`Mémorisation estimée : ${Math.round(r * 100)} %`} />
            </span>
          </>
        )}
      </div>
    </li>
  );
}

const PATTERN_LABEL: Record<string, string> = {
  ABC: 'Trois formes différentes (go – went – gone)',
  ABB: 'Prétérit = participe passé (buy – bought – bought)',
  AAA: 'Trois formes identiques (put – put – put)',
  ABA: 'Base = participe passé (come – came – come)',
};

function IrregularPage() {
  const items = useAppState((s) => s.items);
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<'all' | 'A2' | 'B1'>('all');
  const now = Date.now();
  const q = stripAccents(query.trim().toLowerCase());
  const verbs = IRREGULAR_VERBS.filter((v) => (level === 'all' || v.lv === level) && (!q || [v.base, ...v.past, ...v.pp, v.fr].some((w) => matches(w, q))));
  const groups = (['ABB', 'ABC', 'ABA', 'AAA'] as const).map((p) => ({ p, verbs: verbs.filter((v) => v.pattern === p) })).filter((g) => g.verbs.length);

  return (
    <div className="stack">
      <Link to="/vocabulaire" className="back-link">
        <IconArrowLeft size={16} aria-hidden /> Vocabulaire
      </Link>
      <PageHeader
        eyebrow={`${IRREGULAR_VERBS.length} verbes`}
        title="Verbes irréguliers"
        subtitle="Base verbale, prétérit, participe passé. Les verbes sont regroupés par « famille » de formes, ce qui aide à les mémoriser."
        actions={
          <>
            <Button icon={IconPlay} onClick={() => navigate(`/seance?mode=practice&skills=past_simple_irregular&types=conjugation,matching&t=${now}`)}>
              S'entraîner
            </Button>
            <Link to="/lecon/past_simple_irregular" className="btn btn-secondary btn-md">
              Voir la leçon
            </Link>
          </>
        }
      />
      <div className="word-toolbar">
        <Segmented
          label="Niveau"
          value={level}
          onChange={setLevel}
          options={[
            { value: 'all', label: 'Tous' },
            { value: 'A2', label: 'A2' },
            { value: 'B1', label: 'B1' },
          ]}
        />
        <label className="search-field">
          <IconSearch size={18} aria-hidden />
          <span className="sr-only">Rechercher un verbe</span>
          <input className="input" type="search" placeholder="Rechercher un verbe…" value={query} onChange={(e) => setQuery(e.target.value)} />
        </label>
      </div>
      {groups.length === 0 && <EmptyState icon={IconBrain} title="Aucun verbe ne correspond" />}
      {groups.map((g) => (
        <Card key={g.p} className="irr-group">
          <h2 className="irr-title">{PATTERN_LABEL[g.p]}</h2>
          <div className="table-wrap">
            <table className="irr-table">
              <thead>
                <tr>
                  <th scope="col">Base</th>
                  <th scope="col">Prétérit</th>
                  <th scope="col">Participe passé</th>
                  <th scope="col">Sens</th>
                  <th scope="col">
                    <span className="sr-only">État</span>
                  </th>
                </tr>
              </thead>
              <tbody>
                {g.verbs.map((v) => {
                  const st = wordStatus(items[`irr:${v.base}`], now);
                  return (
                    <tr key={v.base}>
                      <td lang="en">
                        <span className="irr-cell">
                          <AudioButton text={`${v.base}, ${v.past[0]}, ${v.pp[0]}`} label={`Écouter ${v.base}`} />
                          <strong>{v.base}</strong>
                        </span>
                      </td>
                      <td lang="en">{v.past.join(' / ')}</td>
                      <td lang="en">{v.pp.join(' / ')}</td>
                      <td>{v.fr}</td>
                      <td>{st !== 'new' && <Badge tone={STATUS_TONE[st]}>{STATUS_LABEL[st]}</Badge>}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      ))}
    </div>
  );
}
