# Serveur PocketBase — persistance du parcours

> Décision : `docs/adr/ADR-001-persistance-pocketbase.md`. Dépendance `pocketbase` (SDK JS, MIT) ajoutée via le processus supply chain.

## Démarrage (5 minutes)

1. Télécharger le binaire sur pocketbase.io — **version épinglée : v0.37.4** (inclut le correctif de sécurité OAuth2 du 27/04/2026). Empreinte SHA-256 du zip linux_amd64 : `e6cb338e54329e328e4f42b999ac820901d2d23b7e7562417259b0ef882edf9c` — à vérifier après téléchargement (`shasum -a 256`).
2. `./pocketbase superuser upsert admin@acs.local <mot-de-passe>` puis `./pocketbase serve --http 0.0.0.0:8090` → l'admin est sur `http://localhost:8090/_/`.
3. Créer les collections ci-dessous (ou importer `pb_schema.json` : Settings → Import collections — le format pouvant varier selon la version, la table fait foi).
4. Côté app : copier `.env.example` en `.env.local` et renseigner `VITE_PB_URL=http://localhost:8090`. Sans cette variable, l'app fonctionne en mode local pur (localStorage), comme avant.
5. Vérifier l'installation : `node scripts/test-pocketbase.mjs http://localhost:8090 <email-dev> <mdp>` (5 contrôles automatiques, dont l'idempotence et le cloisonnement).
6. **Copier `pb_hooks/` à côté du binaire** (`--hooksDir` ou dossier `pb_hooks/` au même niveau que l'exécutable) — indispensable, voir « Validation serveur des quiz » ci-dessous.

## Collections et règles (deny-by-default : règle vide = admin uniquement)

### `users` (collection auth intégrée) — champs ajoutés

| Champ | Type | Note |
|---|---|---|
| nom | text | Affichage |
| role | select (dev, lead) | `dev` par défaut |

### `progressions`

| Champ | Type | Note |
|---|---|---|
| dev | relation → users (required) | Propriétaire |
| module | text (required) | id du module (ex. `archi`) |
| donnees | json | `{ objectifs: {...}, termine: bool, quizScore, quizDate, versionCorpus, reponses? }` |
| maj | date | Horodatage client (UTC) |

**Index unique sur (dev, module)** — c'est lui qui rend la synchronisation idempotente : rejouer un envoi met à jour, ne duplique jamais.

| Règle | Expression |
|---|---|
| list / view | `dev = @request.auth.id \|\| @request.auth.role = "lead"` |
| create | `@request.auth.id != "" && @request.body.dev = @request.auth.id` |
| update | `dev = @request.auth.id` |
| delete | *(vide — admin uniquement)* |

### `attestations` (append-only)

| Champ | Type |
|---|---|
| dev | relation → users (required) |
| contenu | json |
| hash | text |
| emis | date |

| Règle | Expression |
|---|---|
| list / view | `dev = @request.auth.id \|\| @request.auth.role = "lead"` |
| create | `@request.auth.id != "" && @request.body.dev = @request.auth.id` |
| update / delete | *(vides — personne, une attestation ne se modifie pas)* |

## Validation serveur des quiz (`pb_hooks/main.pb.js`)

**L'attestation est contractuelle** (preuve opposable en audit/client) — un score de quiz calculé et déclaré uniquement côté navigateur est falsifiable en un `curl` (revue party mode, Max). Le score qui compte n'est donc jamais celui envoyé par le client :

1. Le quiz envoie ses réponses brutes (`donnees.reponses`, tableau d'index) en plus du score indicatif affiché à l'écran.
2. `pb_hooks/main.pb.js` intercepte chaque création/mise à jour de `progressions` : s'il y a `reponses`, il recalcule le score depuis `pb_hooks/bareme.json` (généré depuis `src/data/quiz.js` par `npm run gen-bareme` — **jamais édité à la main**, resynchroniser après toute modification du quiz) et **écrase** `donnees.quizScore` avec la valeur recalculée. Un score client mensonger est donc silencieusement corrigé, jamais accepté.
3. La création d'une `attestation` est elle-même interceptée : refusée tant que les 19 `progressions` du dev authentifié n'existent pas toutes avec `termine: true` et un `quizScore` recalculé ≥ 75. Impossible de forger une attestation sans avoir réellement réussi chaque quiz.

**Contrainte de ce runtime JS (goja, pool de runtimes prewarmés)** : un callback de hook ne peut fermer sur aucune variable/fonction déclarée en dehors de lui (échec silencieux) — `require()` du barème et toute la logique sont donc réévalués à l'intérieur de chaque callback, pas factorisés en haut de fichier. Documenté en commentaire dans `main.pb.js` pour ne pas se faire piéger en le refactorant.

Testé en local (sandbox) : score triché sans réponses → ignoré, mauvaises réponses → 0 recalculé, bonnes réponses avec score client mensonger → 100 recalculé (score client écrasé), attestation refusée à 2/19 modules validés puis acceptée à 19/19.

## Comportement de synchronisation (implémenté dans `src/services/synchro.js`)

- localStorage reste le **cache local** : l'app fonctionne intégralement hors-ligne (PWA à venir).
- Chaque changement est poussé (debounce 800 ms) ; hors-ligne ou déconnecté → **file d'attente locale**, vidée à la reconnexion (`online`) ou à la connexion.
- À la connexion : rapatriement du serveur puis fusion **par module** sur l'horodatage `maj` le plus récent. Simplification assumée (donnée pédagogique, pas métier critique) — consignée ici conformément au standard qui exige que les règles de fusion soient explicites.

## Exploitation

- **Sauvegarde** : le dossier `pb_data/` entre dans la rotation 3-2-1 (c'est un SQLite standard — plan de sortie trivial).
- Données personnelles (progression nominative) : classification, rétention et droits des personnes s'appliquent (`15-gouvernance-des-donnees.md`). Rétention proposée : purge de la progression 12 mois après le départ du dev ; les attestations suivent la durée légale RH.
- TLS devant le binaire (reverse proxy) ; comptes lead au moindre privilège ; version épinglée, montée de version = circuit normal.
