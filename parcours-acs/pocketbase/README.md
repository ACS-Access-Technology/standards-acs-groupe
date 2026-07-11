# Serveur PocketBase — persistance du parcours

> Décision : `docs/adr/ADR-001-persistance-pocketbase.md`. Dépendance `pocketbase` (SDK JS, MIT) ajoutée via le processus supply chain.

## Démarrage (5 minutes)

1. Télécharger le binaire sur pocketbase.io (épingler la version choisie — la consigner ici).
2. `./pocketbase serve --http 0.0.0.0:8090` → l'admin est sur `http://localhost:8090/_/` (créer le compte admin au premier lancement).
3. Créer les collections ci-dessous (ou importer `pb_schema.json` : Settings → Import collections — le format pouvant varier selon la version, la table fait foi).
4. Côté app : copier `.env.example` en `.env.local` et renseigner `VITE_PB_URL=http://localhost:8090`. Sans cette variable, l'app fonctionne en mode local pur (localStorage), comme avant.

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
| donnees | json | `{ objectifs: {...}, termine: bool }` |
| maj | date | Horodatage client (UTC) |

**Index unique sur (dev, module)** — c'est lui qui rend la synchronisation idempotente : rejouer un envoi met à jour, ne duplique jamais.

| Règle | Expression |
|---|---|
| list / view | `dev = @request.auth.id \|\| @request.auth.role = "lead"` |
| create | `@request.auth.id != "" && @request.data.dev = @request.auth.id` |
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
| create | `@request.auth.id != "" && @request.data.dev = @request.auth.id` |
| update / delete | *(vides — personne, une attestation ne se modifie pas)* |

## Comportement de synchronisation (implémenté dans `src/services/synchro.js`)

- localStorage reste le **cache local** : l'app fonctionne intégralement hors-ligne (PWA à venir).
- Chaque changement est poussé (debounce 800 ms) ; hors-ligne ou déconnecté → **file d'attente locale**, vidée à la reconnexion (`online`) ou à la connexion.
- À la connexion : rapatriement du serveur puis fusion **par module** sur l'horodatage `maj` le plus récent. Simplification assumée (donnée pédagogique, pas métier critique) — consignée ici conformément au standard qui exige que les règles de fusion soient explicites.

## Exploitation

- **Sauvegarde** : le dossier `pb_data/` entre dans la rotation 3-2-1 (c'est un SQLite standard — plan de sortie trivial).
- Données personnelles (progression nominative) : classification, rétention et droits des personnes s'appliquent (`15-gouvernance-des-donnees.md`). Rétention proposée : purge de la progression 12 mois après le départ du dev ; les attestations suivent la durée légale RH.
- TLS devant le binaire (reverse proxy) ; comptes lead au moindre privilège ; version épinglée, montée de version = circuit normal.
