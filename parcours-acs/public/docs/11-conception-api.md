# 11 — Conception d'API

> Complète `04-regles-architecture.md` §5 (contract-first, deny-by-default). Valable pour toute API HTTP, quel que soit le langage. Sauf mention [SHOULD], tout est [MUST].

## 1. Le contrat d'abord

- Le contrat OpenAPI versionné est la **source de vérité** ; sa modification est le premier commit de la PR ; les tests de contrat sont générés depuis le spec.
- API versionnée par préfixe (`/v1`) ; politique de dépréciation de **douze mois**, outillée : en-têtes `Deprecation` et `Sunset` sur les endpoints dépréciés, suivi des consommateurs encore actifs avant coupure.
- Documentation interactive générée depuis le contrat ; sandbox à données fictives pour les consommateurs externes [SHOULD].

## 2. Erreurs normalisées

- Format unique : **Problem Details (RFC 9457)** — `type`, `title`, `status`, `detail`, `instance`, plus un code d'erreur métier stable et documenté.
- Jamais de fuite d'information interne (stack trace, chemin, version, SQL) dans une réponse d'erreur.
- Les erreurs de validation listent **tous** les champs en défaut en une seule réponse, pas un par un.

## 3. Ressources et conventions

- Noms de ressources au pluriel, en minuscules (`/projets/{id}/jalons`) ; pas de verbe dans l'URL — le verbe est la méthode HTTP.
- Méthodes sémantiques : GET sans effet de bord, PUT/DELETE idempotents, POST pour la création et les actions.
- Filtrage, tri et sélection standardisés (`?filtre[statut]=actif&tri=-created_at`) et documentés au contrat.
- Horodatages en **ISO 8601 UTC** ; montants en plus petite unité entière ou décimal sérialisé en chaîne (`02-standards-de-code.md` §8).

## 4. Pagination

- **Toute collection est paginée** — aucune route « liste tout ».
- Pagination par **curseur** pour les collections volumineuses ou à écriture fréquente (l'offset saute ou duplique des lignes) ; offset admis [SHOULD] pour les petites collections d'administration.
- La réponse porte les métadonnées de pagination (curseur suivant, ou total quand il est calculable à coût borné).

## 5. Idempotence et écritures

- Tout POST à effet non rejouable (création de paiement, envoi, validation) accepte une **clé d'idempotence** (`Idempotency-Key`) : le rejeu renvoie la réponse originale, jamais un double effet.
- Écritures concurrentes : contrôle de version optimiste (`If-Match`/ETag ou champ de version) — l'écrasement silencieux est proscrit.

## 6. Limitation de débit

- Rate limiting par consommateur (jamais global uniquement) ; réponse `429` avec `Retry-After` ; en-têtes de quota exposés (`RateLimit-*`) [SHOULD].
- Les limites sont documentées au contrat et testées.

## 7. Webhooks sortants (si la plateforme en émet)

- Signés (HMAC sur le corps + horodatage, tolérance de rejeu courte) ; le consommateur peut vérifier la signature avec un secret par abonnement, rotatif.
- Livraison au moins une fois, **rejouable** ; le consommateur doit être idempotent — c'est documenté dans le contrat du webhook.
- File de retry avec backoff exponentiel + jitter, plafond de tentatives, alerte sur échec définitif.

## 8. Sécurité (rappels — détail dans `06-securite-developpeur.md`)

- Authentification par endpoint, aucune route anonyme non listée explicitement au contrat ; policies deny-by-default ; MFA/rôle/module sur les routes sensibles.
- Pas d'exposition excessive : la réponse contient les champs nécessaires au cas d'usage, pas l'entité entière par réflexe (BOLA/excessive data exposure).
- CORS en allow-list explicite ; jamais `*` avec credentials.

## 9. Consommateurs externes : OAuth2 / OIDC

- Tout consommateur externe s'authentifie via **OAuth2/OIDC** (client credentials pour le machine-à-machine, authorization code + PKCE pour les applications utilisateur) — jamais de clé API statique seule sur un périmètre sensible, car une clé statique ne porte ni périmètre ni expiration.
- **Scopes minimaux** : chaque client reçoit uniquement les scopes de son cas d'usage, mappés sur les permissions serveur ; un scope large « par confort » est un accès excessif.
- **Rotation** : secrets clients et jetons ont une durée de vie bornée ; les refresh tokens sont rotatifs et révocables ; la révocation d'un client coupe l'accès immédiatement — testé, pas supposé.
- **mTLS exigé pour les intégrations B2B sensibles** (finance, données personnelles à grande échelle, secteur public) : l'authentification mutuelle empêche l'usage d'un jeton volé depuis une machine non autorisée.

## 10. BOLA / BFLA : règles et tests obligatoires

BOLA (accès à l'objet d'autrui) et BFLA (accès à la fonction d'un autre rôle) sont les deux premières causes de compromission d'API — ils se testent, ils ne se supposent pas :

- **Toute route paramétrée par un identifiant vérifie que l'objet appartient au périmètre de l'appelant** (policy côté serveur), jamais seulement que l'appelant est authentifié.
- Identifiants exposés **non énumérables** (UUID ou équivalent) [SHOULD] — la non-énumérabilité complète le contrôle d'accès, elle ne le remplace jamais.
- **Tests obligatoires dans les deux sens sur chaque route** : l'utilisateur A ne lit ni ne modifie les objets de B (BOLA) ; un rôle sans la fonction reçoit un refus sur l'endpoint, même si l'interface ne l'affiche pas (BFLA). Une route sans ces tests ne passe pas la Definition of Done.
- Les refus sont journalisés dans l'audit : une rafale de refus BOLA est un signal d'attaque, pas du bruit.

## 11. Compatibilité ascendante et politique de rupture

- Toute évolution de schéma publiée est **rétrocompatible** : ajout de champ optionnel, nouvel endpoint, nouvelle valeur documentée comme extensible. Retirer ou renommer un champ, changer un type ou une sémantique, rendre obligatoire un champ optionnel sont des **ruptures**.
- **Une rupture n'est licite qu'en version majeure** (`/v2`), avec la période de dépréciation outillée de douze mois (§1) — un consommateur externe ne peut pas suivre des ruptures silencieuses dans une version stable.
- La compatibilité est vérifiée en CI par comparaison des schémas (diff OpenAPI ou équivalent) : une rupture non intentionnelle est détectée avant merge, pas par le premier client cassé.
- Les schémas d'événements suivent la même politique : un événement publié est un contrat.

## 12. Catalogue d'erreurs métier

- Les codes d'erreur métier (§2) sont regroupés dans un **catalogue unique, versionné avec le contrat** : code stable, signification, condition de déclenchement, action attendue du consommateur — sans catalogue, chaque consommateur interprète les erreurs à sa façon et casse au premier changement.
- Un code publié est **stable** : il ne change jamais de signification ; un code obsolète est déprécié puis retiré selon la politique de rupture (§11), jamais réutilisé pour autre chose.
- Toute nouvelle erreur métier introduite dans une PR met à jour le catalogue **dans la même PR**.

## 13. Limites anti-abus : scraping et export massif

- Au-delà du rate limiting par consommateur (§6), les endpoints de collection portent des **limites anti-extraction** : taille de page maximale imposée, profondeur de parcours bornée par curseur, quota journalier de volume par consommateur — un consommateur légitime n'a jamais besoin d'aspirer la base entière.
- L'export massif est un **cas d'usage explicite, jamais un contournement** : endpoint d'export dédié, asynchrone, soumis à permission propre, journalisé dans l'audit (qui, quoi, quand, volume) ; il n'est pas déductible en paginant plus vite.
- Détection outillée des motifs d'extraction (parcours exhaustif, cadence anormale, rotation de jetons) avec alerte — le scraping se détecte par le comportement, pas par requête isolée.
- Ces limites sont documentées au contrat et testées, comme toute limite (§6).

## Definition of Done — API

Contrat mis à jour en premier commit ; tests de contrat verts ; erreurs au format RFC 9457 ; pagination présente ; idempotence traitée sur les écritures sensibles ; rate limit configuré ; permissions testées dans les deux sens ; documentation générée vérifiée.
