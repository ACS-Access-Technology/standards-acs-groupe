# 04 — Règles d'architecture (bloquantes, vérifiées en CI)

> Ces règles sont vérifiées mécaniquement par l'outil de tests d'architecture de la stack (Deptrac, dependency-cruiser, ArchUnit… — voir `09-toolchain.md`). Une violation fait échouer la CI : **la CI est souveraine**, une PR fonctionnellement correcte mais en violation d'architecture est refusée.

## 1. Découpage en couches contrôlées

`Route → Controller (mince) → Service (métier) → Repository → Model`

- Les contrôleurs **orchestrent**, ils ne décident pas : aucune logique métier dans les contrôleurs.
- Les services portent la logique métier ; les repositories encapsulent l'accès aux données ; les modèles restent des entités de persistance.
- Validation dans des objets de requête dédiés (Form Request ou équivalent) ; autorisation dans des policies.

## 2. Modules et frontières

1. Un module **n'importe jamais** le code ou les modèles d'un autre module : contrat public ou événement, rien d'autre.
2. Lectures inter-modules : **read model dédié ou méthode batch du contrat**. Un appel de contrat dans une boucle = PR refusée.
3. Les modules sont des périmètres fonctionnels **activables par configuration**, contrôlés sur chaque route par un middleware dédié — masquer une entrée de menu sans couper/protéger la route ne protège rien.

## 3. Événements : transactional outbox obligatoire

- Publication d'événements **uniquement** via la table outbox, écrite **dans la transaction métier**. Publication directe sur le bus = PR refusée. Valable quel que soit le bus (Redis Streams, Kafka, RabbitMQ, NATS…).
- Le relais outbox → bus est une commande planifiée avec reprise sur incident et plafond de tentatives.
- Tout événement a un **schéma versionné** (JSON Schema, Avro ou Protobuf selon la stack) ; toute évolution est **additive** ; toute rupture crée `EventV2` avec double publication transitoire.
- Doctrine transactionnelle : cohérence ACID locale pour les invariants forts ; cohérence éventuelle assumée pour les projections et notifications.

## 4. Migrations de schéma

- **Expand/contract uniquement** : jamais de rename/drop destructif dans la même release. Réversibles. Testées sur un dump anonymisé — quel que soit le SGBD.
- Écrire dans le dialecte du SGBD retenu, jamais dans celui d'un autre (pas de syntaxe MySQL sur un projet PostgreSQL, et inversement).
- Toute correction de données de production passe par une migration ou un script revu, exécuté par le pipeline, tracé dans l'audit.

## 5. API et permissions

- **Contract-first** : le contrat OpenAPI versionné est la source de vérité ; sa modification est le premier commit de la PR ; politique de dépréciation de douze mois sur les versions d'API (`/v1`).
- Chaque nouvelle route a une **policy explicite (deny by default)** et des tests de permission par rôle — y compris les cas « ne doit PAS voir ».
- Chaque route sensible cumule : authentification, MFA, rôle, module actif.
- Les comptes de service (outils tiers, agents IA) traversent les **mêmes couches de défense** que les humains et sont audités à l'identique : toute porte de service est proscrite.

## 6. Audit write-ahead

- Toute action métier écrit son entrée d'audit **avant** exécution (write-ahead) ; sur le périmètre d'administration, l'indisponibilité du journal **refuse la requête** (503). Le middleware d'audit est en tête de chaîne de priorité.
- Ajouter une action sans audit est un **bug de sécurité**, pas un oubli.
- Journal append-only, rétention distincte et prolongée, copie sur stockage WORM ; la consultation des adresses IP d'audit est réservée au rôle technique par permission dédiée.

## 7. Défense en profondeur (trois niveaux indépendants)

1. **Bordure** (reverse proxy) : TLS, en-têtes de sécurité, CSP à nonce par requête, limitation de débit, analyse antivirale des uploads avant stockage.
2. **Application** : policies deny-by-default, middlewares de rôle/MFA/module.
3. **Base de données** : isolation au niveau du moteur (Row-Level Security ou équivalent du SGBD) en refus par défaut.

La compromission d'un niveau laisse les deux autres intacts. La RLS est une couche **supplémentaire**, jamais la seule (leçon CVE-2025-8713).

## 8. Feature flags

- Toute fonctionnalité nouvelle part derrière un flag, activée par entité ou par environnement ; le flag est documenté (qui l'active, quand il sera retiré). Un flag sans date de retrait devient de la dette technique enregistrée.

## 9. Doctrine de résilience (tout appel réseau)

- **Timeout explicite sur TOUT appel réseau** (HTTP, base, cache, file) — jamais de défaut infini ni implicite.
- **Retries réservés aux opérations idempotentes**, avec backoff exponentiel + jitter et plafond de tentatives ; un retry sur une opération non idempotente est un bug.
- **Circuit breaker** sur chaque dépendance externe : après n échecs, on échoue vite au lieu d'empiler les attentes.
- **Dégradation gracieuse définie par fonctionnalité** : ce que fait la plateforme quand une dépendance est indisponible est une décision de conception écrite, pas un comportement découvert en production.

## 10. Doctrine de cache

- Le cache n'est **jamais source de vérité** ; durées de vie différenciées par nature de donnée ; **invalidation explicite** à la modification (attendre l'expiration pour une donnée corrigée est interdit).
- Clés de cache incluant le périmètre d'autorisation quand la donnée en dépend (jamais de donnée d'une entité servie à une autre par collision de clé).

## 11. Corrélation et observabilité par conception

- Un **identifiant de corrélation** est généré en bordure et propagé partout : logs, traces, files, événements outbox, appels sortants. Sans lui, l'observabilité est décorative.
- Tout nouveau chemin de code livre ses logs structurés, métriques et traces **dans la même PR** (DoD commune).

## 12. Dossier d'architecture : diagrammes C4 et flux de données

- Le dossier d'architecture contient les **diagrammes C4 niveaux 1 à 3** (contexte, conteneurs, composants) ; le niveau 4 (code) est produit par l'outillage, jamais maintenu à la main — un diagramme manuel diverge du code en quelques semaines.
- Un **diagramme de flux de données (data-flow)** couvre chaque donnée personnelle ou sensible : où elle entre, où elle circule, où elle est stockée, où elle sort. Il alimente le threat model (`06-securite-developpeur.md` §2) et le registre des traitements (`15-gouvernance-des-donnees.md` §10).
- Les **trust boundaries** (internet ↔ bordure, bordure ↔ application, application ↔ base, plateforme ↔ tiers) sont tracées explicitement sur les diagrammes, et chaque traversée de frontière nomme son contrôle (authentification, validation, chiffrement) — une frontière non tracée est une frontière non défendue.
- Les diagrammes sont **au format texte, versionnés avec le code** (Mermaid, PlantUML, Structurizr DSL ou équivalent) et mis à jour dans la PR qui change l'architecture — un diagramme obsolète est pire qu'aucun diagramme, il fait prendre de mauvaises décisions avec assurance.

## 13. Fitness functions d'architecture (vérifiées en CI)

- Chaque règle d'architecture vérifiable mécaniquement l'est par une **fitness function bloquante en CI** : dépendances entre couches et modules (§1-2), publication hors outbox (§3), route sans policy (§5), appel réseau sans timeout (§9) — une règle non vérifiée s'érode à chaque PR pressée.
- Toute nouvelle décision d'architecture (ADR) précise **comment elle sera vérifiée** : fitness function, test de contrat, ou — si l'automatisation est impossible — revue humaine périodique justifiée dans l'ADR.
- Les seuils des fitness functions sont versionnés avec le code ; **assouplir un seuil suit le régime des dérogations** (§16), pas un commit discret.

## 14. Multi-tenant (dès que la plateforme sert plusieurs entités)

- Le **modèle d'isolation** (base par tenant, schéma par tenant, ou discriminant + RLS) est une ADR de cadrage avec ses limites assumées — en changer après coup est une migration majeure, pas un refactoring.
- L'identifiant de tenant est résolu **en bordure ou en tête de chaîne de middlewares** et propagé implicitement (contexte de requête, session de base) — le passer à la main dans chaque requête garantit l'oubli.
- **Tests croisés obligatoires** : pour chaque agrégat exposé, un test prouve qu'un utilisateur du tenant A ne lit ni ne modifie une donnée du tenant B — au niveau API **et** au niveau base (RLS), conformément à `05-strategie-tests.md` §2.
- **Exports, sauvegardes, recherches, caches et files respectent le cloisonnement** : un export ne mélange jamais deux tenants sauf besoin transverse documenté et audité ; les clés de cache incluent le tenant (§10) — la fuite inter-tenant la plus fréquente passe par un export ou un cache, pas par l'API.
- Le **journal d'audit porte le tenant** sur chaque entrée ; toute requête d'administration transverse (multi-tenant) est auditée avec sa justification.

## 15. Registre des dépendances externes et modes dégradés

- Tout appel sortant (API tierce, IdP, paiement, e-mail/SMS, stockage objet, géocodage…) figure dans un **registre versionné** `/docs/dependances-externes.md` : rôle, données échangées et leur classification, SLA du fournisseur, criticité, contact — on ne défend pas une surface qu'on n'a pas inventoriée.
- Chaque dépendance du registre a son **mode dégradé écrit** : ce que fait la plateforme quand elle est indisponible (file de rejeu, cache de secours, fonctionnalité désactivée avec message explicite, procédure manuelle). C'est la concrétisation, dépendance par dépendance, de la doctrine §9.
- Le mode dégradé est **testé** (test de résilience, `05-strategie-tests.md` §12) avant la mise en production puis à chaque changement de la dépendance — un mode dégradé jamais exécuté est une hypothèse, pas un plan.
- [SHOULD] Revue trimestrielle du registre : dépendances disparues, SLA modifiés, modes dégradés encore valides.

## 16. Dérogations

- Toute dérogation à ces règles exige une **ADR** (gabarit dans `10-gabarits.md`) approuvée par le responsable technique humain, versionnée dans `/docs/adr/`. L'agent IA propose, l'humain décide.

## Definition of Done — architecture

DoD commune (`02-standards-de-code.md`) + : tests d'architecture verts ; tests de permission des deux côtés (accès accordé ET refusé) ; schéma d'événement versionné si événement touché ; feature flag documenté ; aucune requête N+1 introduite (vérifié au profiler sur la pré-prod) ; diagrammes C4/data-flow mis à jour si l'architecture change ; registre des dépendances externes mis à jour si un appel sortant est ajouté.
