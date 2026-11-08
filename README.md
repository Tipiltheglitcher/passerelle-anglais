# Passerelle — anglais A2 → B1

Application web pour francophones qui veulent passer du niveau A2 au niveau B1 en anglais. Elle fonctionne entièrement en local : pas de compte, pas de serveur, pas de clé d'API. La progression est enregistrée dans le navigateur (IndexedDB).

## Démarrer

Prérequis : Node.js 20 ou plus récent (testé avec Node 22 et npm 12).

```bash
npm install
npm run dev
```

Ouvrez ensuite http://localhost:5173.

Version optimisée :

```bash
npm run build
npm run preview
```

Le dossier `dist/` produit par `npm run build` est un site statique : il peut aussi être servi par n'importe quel serveur web local.

Vérifications :

```bash
npm test          # tests unitaires, d'interaction et de bout en bout (Vitest)
npm run check     # typage + lint + tests + build
```

## Déploiement (GitHub Pages)

Chaque push sur `main` lance `.github/workflows/deploy.yml` : installation, `npm run check`, build avec `BASE_PATH=/<nom du dépôt>/`, puis publication sur GitHub Pages. Dans les réglages du dépôt, **Settings → Pages → Source** doit être sur **GitHub Actions**. La navigation utilise des URL en `#/…`, donc les liens directs et le rafraîchissement fonctionnent sans configuration serveur. Chaque visiteur garde sa propre progression dans son navigateur : rien n'est envoyé au site.

## Ce que contient l'application

- **Parcours guidé** : 47 notions de grammaire A2 → B1 réparties en 12 unités, avec prérequis, plus 17 thèmes de vocabulaire et 3 compétences de communication (lecture, écoute, dialogues).
- **Leçons en français** pour chaque notion : explications, tableaux, exemples à écouter, pièges des francophones, points à retenir.
- **Exercices générés à la volée** (graines reproductibles), validés avant affichage, sans répétition récente : remise en ordre (glisser-déposer, toucher ou clavier), phrase à trous, QCM, traduction FR → EN et EN → FR, correction d'erreur, conjugaison, association, dialogue, compréhension écrite et orale, choix en contexte, transformation, dictée, sprint chronométré.
- **Correction détaillée** : variantes correctes acceptées (contractions, orthographe britannique ou américaine, nombres en chiffres, ordres de mots équivalents, fautes de frappe tolérées hors de la notion évaluée), erreur identifiée et expliquée, différences mot à mot, nouvelle tentative plus loin dans la séance.
- **Apprentissage adaptatif** : maîtrise par notion, révision espacée FSRS (notions et mots), erreurs fréquentes, estimation du niveau CECRL.
- **Modes** : parcours, entraînement libre ou par format, adaptatif, révision grammaticale, vocabulaire, révision des erreurs, défi du jour, sprint de 90 s, test de niveau, 4 examens blancs progressifs.
- **Statistiques** : niveau, maîtrise par unité, activité, évolution de la réussite, réussite par format, principales difficultés, historique des séances.
- **Réglages** : thème clair ou sombre (ou celui du système), animations, objectif quotidien, longueur des séances, voix anglaise, accent, vitesse, lecture automatique, export, import et réinitialisation.

## Organisation du code

```
src/
  content/        contenu pédagogique : curriculum, lexique, vocabulaire, leçons
  engine/
    core/         graine aléatoire, texte, correspondance des réponses (treillis)
    lang/         morphologie anglaise et française (conjugaison, accords, élision)
    generator/    réalisation des phrases EN/FR, 47 générateurs, validation des items
    exercises/    conversion item → exercice, évaluation, vocabulaire, compréhension, dialogues
    learning/     FSRS, maîtrise, sélection, planification des modes, séance
  storage/        IndexedDB (repli en mémoire), export / import validés
  audio/          synthèse vocale (Web Speech) et signaux sonores
  state/          store central, dates, calculs statistiques
  app/ pages/ exercises/ ui/ styles/   interface
```

## Dépendances

- `react`, `react-dom` : interface.
- `lucide-react` : icônes (une seule bibliothèque, importée à l'unité).
- `@fontsource-variable/inter`, `@fontsource-variable/plus-jakarta-sans` : polices embarquées, aucune requête vers un service externe.
- Développement : Vite, TypeScript, ESLint, Vitest, Testing Library, jsdom, fake-indexeddb (IndexedDB simulée dans les tests).

Les graphiques sont dessinés en SVG sans bibliothèque supplémentaire.

## Vos données

Tout reste dans le navigateur utilisé. Effacer les données du site efface la progression : utilisez **Réglages → Exporter ma progression** pour la sauvegarder ou la transférer. Un import est vérifié avant de remplacer quoi que ce soit. En navigation privée, si IndexedDB est indisponible, l'application fonctionne en mémoire et le signale.

## Limites connues

- **Pas de génération par IA** : tout le contenu est produit par des règles et validé automatiquement. L'architecture le permettrait, mais aucun module d'IA n'est branché.
- **Pas de reconnaissance vocale** : l'expression orale n'est pas évaluée.
- **Synthèse vocale** : la qualité dépend des voix installées sur l'appareil. Sans voix anglaise, la voix par défaut du navigateur est utilisée. Sans synthèse vocale, les exercices d'écoute et les dictées sont désactivés.
- **Pas de mode hors ligne installable** : il n'y a pas de service worker. L'application tourne localement via `npm run dev` ou le build statique.
- **Réponses libres** : les variantes courantes sont acceptées, mais une traduction correcte très éloignée de la structure attendue peut être refusée.
- **Contenu** : le thème « Expressions de conversation » n'a pas de phrases d'exemple (pas de phrases à trous pour ce thème). Les « demandes et propositions » se travaillent uniquement par choix de la bonne formule en situation.
- **Paquet JavaScript** non découpé : environ 820 Ko, 270 Ko compressés.
