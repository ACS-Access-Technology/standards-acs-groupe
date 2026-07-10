# Revue de complétude du corpus — 10 juillet 2026

> **Document historique (v1.0 → v1.1)** — les écarts listés ici ont été résorbés en v1.1 et v1.2 ; l'état courant du corpus est décrit par README.md et CHANGELOG.md. Conservé comme trace de la démarche.

| | |
|---|---|
| **Objet** | Le corpus `standards-acs-groupe/` (11 documents, v1.0) est-il complet pour une boîte tech, tout langage, toutes bonnes pratiques ? |
| **Méthode** | Confrontation aux 9 manuels du standard ACS (cycle de vie complet) + aux référentiels universels (OWASP, ISTQB, ITIL 4, SRE, PMBOK 7, SemVer, 12-factor, WCAG, DORA) |
| **Verdict** | **Solide sur l'exécution (dev → prod), incomplet sur le cycle de vie.** Le corpus couvre ~70 % de ce qu'un manuel du développeur d'une boîte tech doit couvrir. 5 documents manquent, et 7 des 11 existants ont des trous identifiés ci-dessous. |

---

## 1. Ce qui est bien couvert (à ne pas retoucher)

Onboarding avec interdictions absolues · trunk-based + Conventional Commits · règles d'architecture bloquantes (couches, outbox, contract-first, write-ahead) · pyramide de tests avec critères d'entrée/sortie · supply chain (quarantaine, SBOM, SHA-pinning) · pipeline 8 étapes · sauvegardes immuables + matrice d'arbitrage · table d'équivalences multi-langages · gabarits.

La portabilité multi-langage est réelle : chaque règle est énoncée par fonction, les outils sont des exemples canoniques. C'est conforme à l'exigence « tout langage existant ».

---

## 2. Écarts DANS les documents existants

### 02 — Standards de code (écarts les plus nombreux)

- **Dates et fuseaux horaires** : stockage en UTC, conversion à l'affichage uniquement, jamais d'arithmétique naïve sur les dates locales — source de bugs universelle, absente du corpus.
- **Monnaie et décimaux** : jamais de flottant pour l'argent ou les quantités réglementaires (entiers en plus petite unité, ou type décimal).
- **Concurrence** : verrou optimiste par défaut (version/updated_at), verrou pessimiste justifié par ADR ; toute opération d'écriture exposée au réseau est **idempotente** (clé stable).
- **Complexité et taille** : limites indicatives (fonction ≤ 50 lignes, complexité cyclomatique surveillée par le lint) — le seuil exact se règle par stack, la règle d'existence d'un seuil est universelle.
- **Commentaires** : le commentaire explique le *pourquoi*, jamais le *quoi* ; un commentaire TODO sans ticket lié est refusé en revue.
- **Accessibilité** (si frontend) : WCAG 2.2 niveau AA comme plancher — contraste, navigation clavier, labels de formulaires, alternatives textuelles. Totalement absent du corpus.
- **Code généré par IA** : relu et testé au même niveau qu'un code humain ; le développeur qui merge en est l'auteur responsable ; jamais de secret ni de données réelles dans un prompt.

### 03 — Workflow Git

- **SemVer + gestion des releases** : versionnage sémantique, notes de version lisibles par le client, tags signés.
- **Signature des commits** (GPG/Sigstore) sur les dépôts sensibles.
- **Hooks pre-commit** : scan de secrets (gitleaks ou équivalent) en local ET en CI — la CI seule détecte trop tard, le secret est déjà dans l'historique.
- **Procédure de fuite de secret** : rotation immédiate du secret (la réécriture d'historique ne suffit jamais), déclaration incident.

### 04 — Règles d'architecture

- **Doctrine de résilience** : timeouts explicites sur TOUT appel réseau (jamais de défaut infini), retries avec backoff exponentiel + jitter réservés aux opérations idempotentes, circuit breakers sur les dépendances externes, dégradation gracieuse définie par fonctionnalité.
- **Doctrine de cache** : durées de vie différenciées, invalidation explicite (jamais « on attend l'expiration » pour une donnée corrigée), le cache n'est jamais source de vérité.
- **Conception d'API détaillée** : mérite un document dédié (voir §3, doc 11).
- **Corrélation** : un identifiant de corrélation traverse toute requête (logs, traces, files, événements) — condition de l'observabilité réelle.

### 05 — Tests

- **Gestion des données de test** : qui génère, qui rafraîchit, comment on anonymise (règles d'anonymisation testées elles-mêmes).
- **Tests de contrat consommateur/producteur** entre modules et vis-à-vis des API externes.
- **Budget de performance en CI** : seuil de régression (latence, requêtes SQL par page) qui casse le build — le test de charge du jalon ne suffit pas, la régression se détecte au quotidien.

### 06 — Sécurité

- **Stockage des mots de passe** : algorithme à coût mémoire (Argon2id par défaut, bcrypt admis), jamais SHA-x seul — absent alors que c'est la base.
- **Classification des données** : chaque donnée du schéma a une classe (publique / interne / personnelle / sensible) qui déclenche chiffrement, rétention et audit — le corpus l'implique sans l'énoncer.
- **Mapping OWASP Top 10 → contre-mesures du standard** : une table de correspondance rend le corpus auditable d'un coup d'œil.

### 07 — CI/CD

- **Métriques DORA** : fréquence de déploiement, lead time, taux d'échec de changement, MTTR — suivies par trimestre ; c'est la mesure objective de la santé de la chaîne.
- **Environnements éphémères** (préview par PR) : recommandés quand la stack le permet.

### 08 — Exploitation

- **Astreinte** : rotation écrite, compensation, escalade, droit au sommeil (une alerte non actionnable la nuit est un bug d'alerting).
- **Gestion des coûts (FinOps)** : revue mensuelle des coûts d'infra jointe à la revue de capacité.

---

## 3. Documents MANQUANTS (le vrai trou : le cycle de vie hors exécution)

Le corpus s'arrête aux frontières du développement. Une boîte tech a besoin des 5 documents suivants — tous existent déjà en substance dans les manuels ACS, il faut les décliner au format du corpus :

### 11 — Conception d'API (guide dédié)

Erreurs normalisées (RFC 9457/7807 Problem Details), pagination par curseur pour les listes volumineuses, idempotency keys sur les POST sensibles, conventions de nommage des ressources, filtrage/tri standardisés, en-têtes de rate limit, politique de dépréciation outillée (en-têtes `Deprecation`/`Sunset`), webhooks signés avec rejeu. Aujourd'hui dispersé entre 03 et 04, insuffisant.

### 12 — Cycle de vie projet et jalons (vue développeur)

Les portes J0→J(n+3) du manuel de gestion de projet, vues du développeur : ce qu'on a le droit de commencer et quand (pas de dev sans dossier technique validé), Definition of Ready d'un ticket (critères d'acceptation Given/When/Then présents AVANT de coder), registre des décisions et des risques, gel du périmètre par porte. Sans ce document, un nouveau développeur ne sait pas *où* son travail s'insère.

### 13 — Vie du produit et MCO (vue développeur)

SemVer et notes de version ; les trois circuits de changement en production (standard / normal / urgent — l'urgence ne supprime jamais la trace) ; gestion du vieillissement : inventaire EOL, toute brique à < 6 mois de fin de support a un plan de montée de version ; réversibilité : export complet testé annuellement (« une réversibilité non testée n'existe pas ») ; migration de données entrante (répétition générale chronométrée, point de non-retour explicite, gel de l'ancien système en lecture seule).

### 14 — Auto-audit périodique (checklist trimestrielle)

Déclinaison légère du manuel d'audit : contrôle d'accès (tester « ne doit PAS voir »), configuration (en-têtes, cookies, CORS), dérive IaC, sauvegardes prouvées, couverture d'audit trail, principe cardinal « tu constates, tu ne supposes pas » — chaque écart devient un ticket avec sévérité et échéance. Une boîte tech qui n'auto-audite pas découvre ses écarts pendant l'audit du client.

### 15 — Gouvernance des données

Classification (cf. §2/06) ; rétentions par catégorie inscrites dans le schéma ; anonymisation pour les environnements hors production (règles versionnées et testées) ; droits des personnes réellement opérables (accès, rectification, effacement) ; registre des traitements ; cloisonnement des finalités. Le cadre légal cité reste celui du projet (jamais recopié d'un autre pays).

---

## 4. Enrichissements transverses (le corpus comme produit)

1. **Matrice d'adoption par projet** : checklist de conformité au corpus qu'un projet remplit à J3 (fondations) puis à chaque porte — c'est ce qui rend le standard *vérifiable* et pas décoratif.
2. **Gabarit `/docs/toolchain.md`** prêt à remplir (le corpus l'exige sans le fournir).
3. **Versionnage du corpus lui-même** : CHANGELOG, processus de proposition d'amendement (PR + validation responsable technique), revue annuelle datée.
4. **Niveaux d'exigence** : marquer chaque règle [MUST] / [SHOULD] (RFC 2119) — aujourd'hui tout est au même niveau, ce qui affaiblit les MUST.
5. **Parcours par rôle** : le README trace le parcours développeur ; ajouter les parcours DevOps, QA et Sécurité (mêmes documents, ordre différent).

---

## 5. Priorisation proposée

| Priorité | Action | Effort |
|---|---|---|
| **P1** | Doc 12 (cycle de vie projet) + doc 13 (MCO) — le trou de cycle de vie | 2 docs nouveaux |
| **P1** | Enrichir 02 (dates/monnaie/concurrence/IA) et 06 (mots de passe, classification) — les basiques manquants | Éditions ciblées |
| **P1** | Matrice d'adoption par projet + gabarit toolchain.md | 2 fichiers courts |
| **P2** | Doc 11 (API), doc 15 (données), enrichir 03 (SemVer, secrets) et 04 (résilience, cache) | 2 docs + éditions |
| **P2** | Marquage [MUST]/[SHOULD] sur tout le corpus | Passe globale |
| **P3** | Doc 14 (auto-audit), DORA (07), astreinte/FinOps (08), a11y (02), parcours par rôle | Compléments |

---

*Revue produite selon le standard ACS Groupe (manuels architecture-technique, dev-devops-securite, tests-recette, gestion-projet, mco-maintenance, audit-plateforme, security-md). Chaque écart cité renvoie à une pratique de référence, pas à une préférence.*
