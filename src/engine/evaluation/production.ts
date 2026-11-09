/**
 * Évaluation des productions libres (rédactions).
 *
 * Par défaut, l'application utilise l'évaluateur local : gratuit, hors ligne,
 * il ne vérifie que ce qui peut l'être avec certitude (longueur, éléments
 * imposés, erreurs certaines). Cette interface permet de brancher plus tard
 * un évaluateur externe (par exemple un modèle de langage) sans modifier les
 * exercices : il suffirait d'appeler setProductionEvaluator() au démarrage.
 *
 * Règles pour un futur évaluateur externe :
 *  - ses remarques doivent rester distinctes des vérifications certaines
 *    (champ `comments`, affiché comme « avis indicatif ») ;
 *  - il ne doit jamais être obligatoire : en cas d'échec ou d'absence de
 *    configuration, l'évaluateur local prend le relais ;
 *  - aucune clé d'API ne doit être intégrée au code publié.
 */
import { analyseWriting } from '@/engine/exercises/advanced';
import type { WritingExercise, WritingReport } from '@/engine/exercises/types';

export interface ProductionAssessment {
  /** Vérifications automatiques fiables (toujours calculées localement). */
  report: WritingReport;
  /** Origine des commentaires complémentaires. */
  source: 'local' | 'external';
  /** Commentaires qualitatifs indicatifs (évaluateur externe uniquement). */
  comments?: string[];
}

export interface ProductionEvaluator {
  id: string;
  label: string;
  assess(ex: Pick<WritingExercise, 'minWords' | 'maxWords' | 'checks' | 'task'>, text: string): Promise<ProductionAssessment>;
}

export const localEvaluator: ProductionEvaluator = {
  id: 'local',
  label: 'Vérifications locales (gratuites, hors ligne)',
  assess: async (ex, text) => ({ report: analyseWriting(ex, text), source: 'local' }),
};

let current: ProductionEvaluator = localEvaluator;

export function productionEvaluator(): ProductionEvaluator {
  return current;
}

/** Remplace l'évaluateur (null : retour à l'évaluateur local). */
export function setProductionEvaluator(e: ProductionEvaluator | null): void {
  current = e ?? localEvaluator;
}

/**
 * Évalue une production : les vérifications certaines sont toujours locales ;
 * un évaluateur externe ne peut qu'ajouter des commentaires indicatifs.
 */
export async function assessProduction(ex: Pick<WritingExercise, 'minWords' | 'maxWords' | 'checks' | 'task'>, text: string): Promise<ProductionAssessment> {
  const local = analyseWriting(ex, text);
  if (current === localEvaluator) return { report: local, source: 'local' };
  try {
    const ext = await current.assess(ex, text);
    return { report: local, source: 'external', comments: ext.comments };
  } catch {
    return { report: local, source: 'local' };
  }
}
