import { Link } from '@/app/router';
import { EmptyState } from '@/ui/kit';
import { IconCompass } from '@/ui/icons';

export function NotFoundPage() {
  return (
    <div className="card">
      <EmptyState icon={IconCompass} title="Page introuvable">
        <p>Cette adresse ne correspond à aucune page de l'application.</p>
        <Link to="/" className="btn btn-primary btn-md">
          Retour à l'accueil
        </Link>
      </EmptyState>
    </div>
  );
}
