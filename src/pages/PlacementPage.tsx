/** Présentation du test de niveau (le test lui-même se déroule dans la séance). */
import { navigate } from '@/app/router';
import { useAppState } from '@/state/store';
import { PLACEMENT_BANDS } from '@/engine/learning/planner';
import { SKILL_BY_ID } from '@/content/curriculum';
import { levelTone } from '@/content/levels';
import { Badge, Button, Card, PageHeader } from '@/ui/kit';
import { IconArrowRight, IconClock, IconGraduation, IconInfo, IconListChecks } from '@/ui/icons';

export function PlacementPage() {
  const profile = useAppState((s) => s.profile);
  const sessions = useAppState((s) => s.sessions);
  const last = sessions.find((r) => r.mode === 'placement');
  const total = PLACEMENT_BANDS.reduce((n, b) => n + b.skills.length, 0);

  return (
    <div className="stack placement">
      <PageHeader eyebrow="Test de niveau" title={`Où en êtes-vous entre A2 et ${PLACEMENT_BANDS[PLACEMENT_BANDS.length - 1].level} ?`} subtitle="Un test adaptatif : les questions deviennent plus exigeantes au fil des niveaux, et le test s’arrête dès qu’elles sont nettement trop difficiles. Le parcours débloque ensuite ce que vous maîtrisez déjà." />

      {profile.placementDone && (
        <Card className="placement-last">
          <div className="row row-wrap">
            <IconGraduation size={24} aria-hidden />
            <div className="spacer">
              <strong>Dernier résultat : {profile.placementLevel ?? '—'}</strong>
              {last && (
                <p className="muted small" style={{ margin: 0 }}>
                  {last.correct} bonnes réponses sur {last.total}, le {new Date(last.startedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              )}
            </div>
            <Badge tone="accent">Test déjà passé</Badge>
          </div>
        </Card>
      )}

      <div className="grid grid-2">
        <Card>
          <h2>Comment ça marche</h2>
          <ul className="check-list">
            <li>
              <IconListChecks size={18} aria-hidden /> Jusqu’à {total} questions, des bases de l’A2 au niveau {PLACEMENT_BANDS[PLACEMENT_BANDS.length - 1].level}, par bandes de six : le test s’arrête si une bande est réussie à moins de 50 %.
            </li>
            <li>
              <IconClock size={18} aria-hidden /> De 5 à 20 minutes selon votre niveau, sans limite de temps.
            </li>
            <li>
              <IconInfo size={18} aria-hidden /> Pas de correction pendant le test : les réponses sont détaillées à la fin.
            </li>
            <li>
              <IconGraduation size={18} aria-hidden /> Vous pouvez passer une question avec « Passer » si vous ne savez pas : c'est plus juste que de deviner.
            </li>
          </ul>
        </Card>
        <Card>
          <h2>Ce qui est évalué</h2>
          {PLACEMENT_BANDS.map((b) => (
            <div key={b.id} className="band">
              <Badge tone={levelTone(b.level)}>{b.label}</Badge>
              <p className="small muted">{b.skills.map((id) => SKILL_BY_ID[id]?.title).join(' · ')}</p>
            </div>
          ))}
        </Card>
      </div>

      <div className="placement-cta">
        <Button size="lg" iconRight={IconArrowRight} onClick={() => navigate(`/seance?mode=placement&t=${Date.now()}`)}>
          {profile.placementDone ? 'Repasser le test' : 'Commencer le test'}
        </Button>
        <p className="faint small">Le test ne fait jamais baisser votre progression : il ne peut que débloquer des notions et des étapes. Le résultat est une estimation pédagogique, pas une certification CECRL.</p>
      </div>
    </div>
  );
}
