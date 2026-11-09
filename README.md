# Passerelle — anglais A2 → C2

Application web pour francophones qui veulent progresser en anglais du niveau A2 jusqu'au niveau C2, en quatre étapes : A2 → B1, B1 → B2, B2 → C1, C1 → C2. Elle fonctionne entièrement en local : pas de compte, pas de serveur, pas de clé d'API. La progression est enregistrée dans le navigateur (IndexedDB).

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

Chaque push sur `main` lance `.github/workflows/deploy.yml` : installation, `npm run check`, build avec `BASE_PATH=/<nom du dépôt>/`, puis publication sur GitHub Pages. Dans les réglages du dépôt, **Settings → Pages → Source** doit être sur **GitHub Actions**. La navigation utilise des URL en `#/…`, donc les liens directs et le rafraîchissement fonctionnent sans configuration serveur. Chaque visiteur garde sa propre progression dans son navigateur ; rien n'est envoyé ailleurs, sauf s'il crée un compte (voir ci-dessous).

## Comptes et classement (facultatif)

Un compte permet de retrouver sa progression sur plusieurs appareils et de se comparer à ses amis. Il ne demande qu'un **pseudo** et un **mot de passe** : pas d'email, pas de connexion Google. Sans compte, l'application fonctionne exactement comme avant.

Ces fonctions n'apparaissent que si l'adresse de l'API est fournie au build (`VITE_API_URL`). Sans elle, il n'y a ni page Compte ni Classement, et aucun bouton inactif.

### Architecture

- **API** : un Cloudflare Worker (`worker/`) et une base Cloudflare D1. Les deux restent dans le forfait gratuit ; il n'y a ni serveur permanent ni abonnement.
- **Tables** (`worker/migrations/0001_init.sql`) :
  - `users` : comptes ;
  - `auth_sessions` : sessions de connexion ;
  - `progress` : progression synchronisée ;
  - `scores` : séances comptées au classement ;
  - `attempts` : limitation des tentatives.
- **Frontend** : il reste sur GitHub Pages. IndexedDB reste la source locale : `src/account/` ajoute la connexion et la synchronisation par-dessus le store existant, sans toucher au moteur pédagogique.

### Sécurité

- **Mot de passe** :
  - le navigateur le transforme en clé avec PBKDF2-SHA256 (600 000 itérations), et seule cette clé est envoyée ;
  - le serveur la hache à nouveau avec PBKDF2-SHA256 et un sel aléatoire propre au compte ;
  - le mot de passe n'est donc jamais transmis ni stocké en clair.
  
  Ce découpage tient compte de la limite de temps de calcul du forfait gratuit de Workers.
- **Sessions** :
  - un jeton aléatoire de 256 bits, conservé côté serveur sous forme hachée (SHA-256) ;
  - il expire après 90 jours sans utilisation et est supprimé à la déconnexion ;
  - il est envoyé dans l'en-tête `Authorization`, sans cookie.
- **Limitation des tentatives** :
  - 5 échecs de connexion par pseudo et 30 par adresse IP sur 15 minutes ;
  - 5 inscriptions par adresse IP et par heure ;
  - les adresses IP ne sont conservées que sous forme hachée, au plus 24 heures.
- **CORS** : seule l'origine du site (`ALLOWED_ORIGINS` dans `worker/wrangler.toml`) peut appeler l'API depuis un navigateur.
- **Validation** : toutes les données reçues sont vérifiées par le serveur (pseudo, formats, tailles, résumé de progression, séances).
- **Suppression du compte** : définitive, sur confirmation par mot de passe. Elle efface le compte, les sessions, la progression et les scores.
- **Aucun secret** dans le dépôt : l'identifiant de base D1 et l'adresse de l'API ne sont pas confidentiels.

### Synchronisation

Synchronisé : niveau estimé, maîtrise des notions, vocabulaire, révisions espacées, statistiques, XP, séances, erreurs, rédactions et réglages. C'est le même contenu que l'export, limité aux 2 000 dernières réponses détaillées et compressé.

- **Quand** : après chaque séance, puis au plus toutes les 5 minutes s'il reste des changements, et quand l'onglet passe en arrière-plan. Hors ligne, les progrès restent sur l'appareil et partent au retour de la connexion.
- **Versions** : chaque envoi porte un numéro de version, et le serveur refuse d'écraser une version plus récente.
- **Choix demandés à l'utilisateur** (avec le détail des XP, du nombre d'exercices et de la date de dernière séance de chaque côté) :
  - à la première connexion avec une progression locale ;
  - à la connexion sur un appareil qui contient déjà une progression ;
  - quand deux appareils ont modifié la progression en même temps.

  Une progression n'est donc jamais remplacée silencieusement.
- **Déconnexion** : la progression reste sur l'appareil, ou est effacée si on le demande (ordinateur partagé).

### Classement

- **Hebdomadaire** (depuis le lundi 00 h UTC) **et global**. Pour chaque joueur : rang, pseudo, XP de la semaine, XP totaux et niveau estimé, plus sa position personnelle. Aucune autre donnée n'est exposée.
- **Masquage** : on peut se retirer du classement depuis la page Compte.
- **Calcul des XP par le serveur** : il ne reprend pas la valeur envoyée. Pour chaque séance terminée :
  - cohérence des nombres ;
  - au moins 1,5 s par exercice en moyenne ;
  - séance terminée après la création du compte et déclarée dans les 7 jours ;
  - XP plafonnés au maximum possible pour ses réponses ;
  - pas de double comptage ;
  - plafond de 2 000 XP par jour.

  C'est une validation de vraisemblance, pas un anti-triche complet : le serveur ne rejoue pas les exercices.

### Mise en service

Prérequis : un compte Cloudflare (gratuit).

```bash
cd worker
npm install
npx wrangler login                      # ouvre le navigateur pour autoriser Wrangler
npx wrangler d1 create passerelle       # copier le database_id affiché dans wrangler.toml
npm run db:migrate:remote               # crée les tables
npm run deploy                          # publie l'API : https://passerelle-api.<sous-domaine>.workers.dev
```

Ensuite, indiquez cette adresse dans `VITE_API_URL` (étape de build de `.github/workflows/deploy.yml`) et poussez sur `main`. L'API de ce dépôt est publiée sur `https://passerelle-api.maathixsrs.workers.dev`.

En local :
1. `npm --prefix worker run db:migrate:local` ;
2. `npm --prefix worker run dev` (API sur le port 8787) ;
3. un fichier `.env.development.local` contenant `VITE_API_URL=http://localhost:8787` ;
4. `npm run dev`.

### Limites

- **Pas de récupération du mot de passe** : sans adresse email, un mot de passe oublié ne peut pas être réinitialisé. La progression reste toutefois sur les appareils déjà utilisés, et l'export reste possible.
- **Blocage temporaire** : la limitation par pseudo permet à un tiers de bloquer temporairement la connexion d'un compte (15 minutes) en multipliant les essais.
- **Niveau estimé du classement** : il est calculé par l'application sur l'appareil du joueur. Ce n'est pas une valeur vérifiée par le serveur.
- **Quotas du forfait gratuit** : 100 000 requêtes par jour pour Workers, 5 Go et 100 000 écritures par jour pour D1. C'est largement suffisant pour un groupe d'amis.

## Ce que contient l'application

- **Parcours guidé en quatre étapes** :
  - **A2 → B1** : 47 notions de grammaire réparties en 12 unités, 17 thèmes de vocabulaire, 3 compétences de communication (lecture, écoute, dialogues) ;
  - **B1 → B2, B2 → C1, C1 → C2** : 48 compétences supplémentaires (20 en B2, 15 en C1, 13 en C2) en grammaire, lexique et compétences écrites, plus 7 thèmes de vocabulaire avancé (collocations, phrasal verbs, expressions idiomatiques, lexique du débat et académique, faux amis subtils).
  Chaque étape reprend les descripteurs du CECRL (reformulés) et se termine par un examen de passage.
- **Formats avancés** (en plus des 14 formats de base) : reformulation avec mot imposé (type Cambridge), nuance de sens, registre, sens implicite et ironie, correction de style, lecture de textes longs, analyse d'argumentation (thèse, concession, sophismes), analyse de dialogues naturels, remise en ordre de paragraphes, rédaction guidée.
- **Quatre domaines suivis séparément** : grammaire, lexique, compréhension et expression écrites, oral (compréhension uniquement).
- **Leçons en français** pour chaque notion : explications, tableaux, exemples à écouter, pièges des francophones, points à retenir.
- **Exercices générés à la volée** (graines reproductibles), validés avant affichage, sans répétition récente : remise en ordre (glisser-déposer, toucher ou clavier), phrase à trous, QCM, traduction FR → EN et EN → FR, correction d'erreur, conjugaison, association, dialogue, compréhension écrite et orale, choix en contexte, transformation, dictée, sprint chronométré.
- **Correction détaillée** : variantes correctes acceptées (contractions, orthographe britannique ou américaine, nombres en chiffres, ordres de mots équivalents, fautes de frappe tolérées hors de la notion évaluée), erreur identifiée et expliquée, différences mot à mot, nouvelle tentative plus loin dans la séance.
- **Apprentissage adaptatif** : maîtrise par notion, révision espacée FSRS (notions et mots), erreurs fréquentes, estimation du niveau CECRL.
- **Progression fondée sur les résultats, pas sur l'XP** : une étape s'ouvre quand l'examen de passage du niveau précédent est réussi, ou quand le test de niveau a situé l'apprenant au-delà. L'application indique quand l'examen devient pertinent (couverture ≥ 70 % des notions, maîtrise moyenne ≥ 60 %, aucun domaine sous 50 %). Un examen est réussi avec au moins 70 % au total et 60 % dans chaque domaine suffisamment représenté (3 questions ou plus).
- **Test de niveau adaptatif** de A2 à C2 : il s'arrête dès qu'une tranche est nettement échouée.
- **Modes** : parcours, entraînement libre ou par format, adaptatif, révision grammaticale, vocabulaire, révision des erreurs, défi du jour, sprint de 90 s, test de niveau, 4 examens blancs A2 → B1, puis pour B2, C1 et C2 un examen de langue, un examen de compétences et un examen de passage.
- **Statistiques** : niveau estimé global et par domaine, maîtrise par unité, activité, évolution de la réussite, réussite par format, principales difficultés, historique des séances, rédactions enregistrées.

### Rédactions : ce qui est vérifié, ce qui ne l'est pas

La rédaction se déroule en deux temps. L'application vérifie de façon **certaine** :
- la longueur ;
- la présence des éléments imposés (connecteurs, formules) ;
- une liste d'erreurs typiques des francophones qui sont fautives dans tous les contextes (par exemple *informations*, *depend of*, *since three years*).

Elle affiche aussi les mots trop répétés. Elle ne juge **ni** la pertinence des idées, **ni** la cohérence d'ensemble, **ni** la correction grammaticale complète. Ces points relèvent d'une auto-évaluation sur une grille, avec un modèle de réponse ; cette auto-évaluation est conservée à titre indicatif et n'entre ni dans le score ni dans les examens de passage.

### Évaluateur externe facultatif

`src/engine/evaluation/production.ts` définit une interface `ProductionEvaluator`. Par défaut, seul l'évaluateur local (gratuit, hors ligne) est utilisé. Un évaluateur externe (par exemple un modèle de langage auto-hébergé) pourrait être branché avec `setProductionEvaluator()`. Ses remarques restent séparées des vérifications certaines et sont affichées comme « avis indicatif ». En cas d'erreur, l'application revient à l'évaluateur local. Aucun évaluateur externe n'est fourni, et aucune clé ne doit être intégrée au code publié.
- **Réglages** : thème clair ou sombre (ou celui du système), animations, objectif quotidien, longueur des séances, voix anglaise, accent, vitesse, lecture automatique, export, import et réinitialisation.

## Organisation du code

```
src/
  content/        contenu pédagogique : niveaux CECRL, curriculum, lexique, vocabulaire, leçons
    advanced/     étapes B2, C1, C2 : banques de phrases, textes, dialogues, rédactions
  engine/
    core/         graine aléatoire, texte, correspondance des réponses (treillis)
    lang/         morphologie anglaise et française (conjugaison, accords, élision)
    generator/    réalisation des phrases EN/FR, générateurs, banques à variables (bank.ts), validation
    exercises/    conversion item → exercice, évaluation, formats avancés, analyse des rédactions
    evaluation/   interface d'évaluation des productions (locale par défaut)
    learning/     FSRS, maîtrise, sélection, planification, progression par étapes
  storage/        IndexedDB (repli en mémoire), export / import validés
  account/        compte, synchronisation, classement (client de l'API)
  audio/          synthèse vocale (Web Speech) et signaux sonores
  state/          store central, dates, calculs statistiques
  app/ pages/ exercises/ ui/ styles/   interface
worker/
  src/            API Cloudflare Worker : comptes, sessions, progression, classement
  migrations/     schéma SQL de la base D1
  test/           tests de l'API sur SQLite en mémoire
```

## Dépendances

- `react`, `react-dom` : interface.
- `lucide-react` : icônes (une seule bibliothèque, importée à l'unité).
- `@fontsource-variable/inter`, `@fontsource-variable/plus-jakarta-sans` : polices embarquées, aucune requête vers un service externe.
- Développement : Vite, TypeScript, ESLint, Vitest, Testing Library, jsdom, fake-indexeddb (IndexedDB simulée dans les tests).

Les graphiques sont dessinés en SVG sans bibliothèque supplémentaire.

## Vos données

Tout reste dans le navigateur utilisé. Effacer les données du site efface la progression : utilisez **Réglages → Exporter ma progression** pour la sauvegarder ou la transférer. Un import est vérifié avant de remplacer quoi que ce soit. En navigation privée, si IndexedDB est indisponible, l'application fonctionne en mémoire et le signale.

**Migration** : la base passe en version 2 (ajout des rédactions). Au premier lancement, une progression existante (A2 → B1) est conservée telle quelle. Les niveaux validés sont reconstruits à partir de l'historique : un examen blanc final réussi valide B1 et ouvre l'étape B1 → B2. Les exports de l'ancienne version restent importables.

## Limites connues

- **Estimations, pas certifications** : les niveaux affichés sont des estimations fondées sur les exercices de l'application. Ils ne remplacent pas un examen officiel (Cambridge, IELTS, TOEIC…). Plus le niveau est élevé, plus l'écart avec une évaluation humaine peut être important : à partir de C1, une partie de la compétence (finesse stylistique, argumentation libre) échappe à une correction automatique fiable.
- **Pas de génération par IA** : tout le contenu est produit par des règles ou rédigé à la main, puis validé automatiquement. Seule l'évaluation des rédactions prévoit un point de branchement facultatif (voir plus haut).
- **Contenus avancés rédigés à la main** : les textes longs, analyses d'argumentation, questions d'implicite, d'ironie et de registre de B2 à C2 sont en nombre limité, quelques-uns à une dizaine par format et par niveau. Ils finissent donc par se répéter si l'on s'entraîne beaucoup. Les phrases de grammaire avancée sont, elles, combinées à partir de banques à variables.
- **Questions de nuance** : seules les distinctions nettes sont proposées comme réponse unique ; une explication accompagne chaque option.
- **Pas de reconnaissance vocale** : l'expression orale n'est pas évaluée. Le domaine « oral » ne mesure que la compréhension.
- **Synthèse vocale** : la qualité dépend des voix installées sur l'appareil. Sans voix anglaise, la voix par défaut du navigateur est utilisée. Sans synthèse vocale, les exercices d'écoute et les dictées sont désactivés.
- **Pas de mode hors ligne installable** : il n'y a pas de service worker. L'application tourne localement via `npm run dev` ou le build statique.
- **Réponses libres** : les variantes courantes sont acceptées, mais une traduction correcte très éloignée de la structure attendue peut être refusée.
- **Contenu** : le thème « Expressions de conversation » n'a pas de phrases d'exemple (pas de phrases à trous pour ce thème). Les « demandes et propositions » se travaillent uniquement par choix de la bonne formule en situation.
- **Écoute** : les exercices d'écoute et de dictée restent de niveau A2 → B1 ; aucun audio authentique n'est fourni pour les niveaux avancés.
- **Paquet JavaScript** : environ 1,2 Mo (410 Ko compressés), réparti en quatre fichiers (application, bibliothèques, contenu de base, contenu avancé) pour profiter du cache du navigateur. Tout est chargé au démarrage.
