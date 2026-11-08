/**
 * Parcours utilisateur de bout en bout (jsdom + IndexedDB simulée) :
 * accueil → séance → réponse → reprise plus tard → statistiques → thème.
 */
import { describe, expect, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { App } from './App';
import { store } from '@/state/store';

describe('application', () => {
  it('parcours essentiel', async () => {
    window.location.hash = '#/';
    const user = userEvent.setup();
    render(<App />);
    await screen.findByText('Passez du niveau A2 au niveau B1', {}, { timeout: 8000 });

    // démarrer la première leçon
    await user.click(screen.getByRole('button', { name: /Commencer la première leçon/ }));
    const skip = await screen.findByRole('button', { name: /Je ne sais pas/ });
    expect(screen.getByRole('button', { name: 'Vérifier' })).toBeDisabled();

    // passer un exercice : la bonne réponse est montrée, sans catégorie d'erreur
    await user.click(skip);
    await screen.findByText('Voici la bonne réponse');
    expect(screen.getByText('Réponse attendue :')).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: 'Continuer' }));
    expect(store.getState().activeSession?.answers).toHaveLength(1);

    // quitter et reprendre plus tard
    await user.click(screen.getByRole('button', { name: 'Quitter la séance' }));
    await user.click(await screen.findByRole('button', { name: 'Reprendre plus tard' }));
    await screen.findByText(/Séance en cours/);
    await user.click(screen.getByRole('button', { name: /Reprendre/ }));
    await screen.findByRole('button', { name: 'Quitter la séance' });
    expect(store.getState().activeSession?.index).toBe(1);

    // terminer et voir le bilan
    await user.click(screen.getByRole('button', { name: 'Quitter la séance' }));
    await user.click(await screen.findByRole('button', { name: 'Terminer et voir le bilan' }));
    await screen.findByText(/bonnes réponses/);
    expect(store.getState().sessions).toHaveLength(1);

    // statistiques réelles
    await user.click(screen.getByRole('button', { name: 'Accueil' }));
    await user.click((await screen.findAllByRole('link', { name: 'Statistiques' }))[0]);
    await screen.findByRole('heading', { name: 'Votre progression' });
    expect(screen.getByText('Historique des séances')).toBeInTheDocument();

    // thème : bascule et préférence enregistrée
    const toggle = screen.getAllByRole('button', { name: /Passer au thème/ })[0];
    const before = document.documentElement.dataset.theme;
    await user.click(toggle);
    await waitFor(() => expect(document.documentElement.dataset.theme).not.toBe(before));
    expect(localStorage.getItem('passerelle.theme')).toBe(document.documentElement.dataset.theme);
  }, 30000);
});
