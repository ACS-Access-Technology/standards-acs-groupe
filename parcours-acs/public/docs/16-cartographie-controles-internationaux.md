# 16 — Cartographie des contrôles et référentiels internationaux

> Ce document rend le corpus **auditable** : chaque exigence majeure devient un contrôle identifié, avec sa preuve, son responsable, sa fréquence et son rattachement aux référentiels internationaux. La `MATRICE-ADOPTION.md` de chaque projet collecte les statuts et preuves de ces contrôles ; `14-auto-audit.md` les vérifie ; `17-registre-risques-derogations.md` trace les écarts.

## 1. Schéma d'identification des contrôles

Format : `ACS-<DOMAINE>-NNN`. Domaines : `SOC` (socle/onboarding), `COD` (code), `GIT` (workflow), `ARC` (architecture), `API`, `TST` (tests), `SEC` (sécurité), `CHN` (supply chain), `CIC` (CI/CD), `EXP` (exploitation), `DON` (données), `PRJ` (projet), `MCO`, `IA`. Un ID est **stable à vie** : un contrôle retiré n'est jamais réutilisé (statut `retiré` au changelog).

## 2. Format d'un contrôle (gabarit)

| Champ | Contenu |
|---|---|
| ID | `ACS-SEC-001` |
| Exigence | Formulation [MUST]/[SHOULD], une phrase |
| Source | Document et section du corpus |
| Référentiels | NIST SSDF, ASVS, SLSA, ISO 27001, SOC 2, CSF… |
| Preuve attendue | Sortie d'outil, log, artefact, lien CI, ticket, ADR — datée et reproductible |
| Responsable | Tech Lead, DevOps/SRE, Sécurité, QA, PO, DPO/juriste |
| Fréquence | PR, release, mensuel, trimestriel, annuel, incident |
| Seuil d'acceptation | Valeur mesurable |
| Dérogation | ADR + date de résorption + contrôle compensatoire + approbateur humain |

## 3. Registre des contrôles (les exigences majeures du corpus)

### Socle et accès

| ID | Exigence [MUST] | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-SOC-001 | MFA activée sur tous les comptes avant tout accès | 01 §J1 | ISO 27001 A.5.17 · CSF PR.AA | Export IdP / captures de configuration | Tech Lead | Trimestriel | 100 % des comptes |
| ACS-SOC-002 | Aucun accès dev en écriture à la production | 01, 08 §6 | SOC 2 CC6 · ISO A.8.2 | Revue des rôles/ACL datée | DevOps | Trimestriel | 0 accès non justifié |
| ACS-SOC-003 | Départ : révocation jour même + rotation des secrets partagés | 01 §Départ | ISO A.5.11 · SOC 2 CC6.2 | Registre des accès, ticket de départ | Tech Lead | À chaque départ | Révocation ≤ 24 h |

### Code et Git

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-COD-001 | Analyse statique au niveau max, zéro erreur, suppressions justifiées | 02 §2 | SSDF PW.7/PW.8 | Log CI de l'étape, liste des suppressions | Tech Lead | PR | 0 erreur |
| ACS-COD-002 | Code généré par IA relu/testé comme code humain ; auteur = celui qui merge | 02 §12 | SSDF PW.7 · doc 19 | Revue tracée sur la PR | Dev | PR | 100 % relu |
| ACS-GIT-001 | `main` protégée : pas de push direct, pas de merge CI rouge | 03 §3 | SSDF PO.3 · SLSA | Config de protection de branche exportée | DevOps | Trimestriel | 0 exception |
| ACS-GIT-002 | Scan de secrets pre-commit + CI ; fuite = rotation immédiate | 03 §7 | SSDF PS.1 · ISO A.8.24 | Config hook + log CI + notes d'incident | Sécurité | PR / incident | 0 secret en clair |
| ACS-GIT-003 | 2 revues sur zone sensible, revue sécurité bloquante ≤ 24 h ouvrées | 03 §4 | SSDF PW.7 · SAMM V | Historique de revues des PR sensibles | Sécurité | PR | 100 % des PR sensibles |

### Architecture et API

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-ARC-001 | Tests d'architecture (couches/frontières) bloquants en CI | 04 §pré | SAMM D-SA | Log CI Deptrac/équivalent | Tech Lead | PR | 0 violation |
| ACS-ARC-002 | Événements via outbox uniquement, schémas versionnés additifs | 04 §3 | patterns éprouvés | Test de contrat en CI | Dev | PR | 0 publication directe |
| ACS-ARC-003 | Migrations expand/contract, testées sur dump anonymisé | 04 §4 | SSDF PW.9 | Log du test de migration | Dev | Release | 0 drop/rename destructif |
| ACS-ARC-004 | Audit write-ahead sur les actions d'administration, copie WORM | 04 §6 | ISO A.8.15 · SOC 2 CC7 | Test rejoué + config WORM | Sécurité | Trimestriel | Refus 503 si journal indisponible |
| ACS-ARC-005 | Défense en profondeur : 3 niveaux d'autorisation indépendants actifs | 04 §7 | ASVS V4 · CSF PR | Preuves par niveau (config bordure, policies, RLS) | Sécurité | Trimestriel | 3/3 actifs |
| ACS-API-001 | Toute route : policy deny-by-default + tests de permission deux sens | 04 §5, 11 §8 | ASVS V4 · API Top 10 BOLA/BFLA | Inventaire routes↔policies + tests | Dev | PR | 100 % des routes |
| ACS-API-002 | Erreurs RFC 9457, pagination systématique, idempotence des écritures sensibles | 11 | ASVS V13 | Tests de contrat | Dev | PR | 100 % des collections paginées |

### Tests et qualité

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-TST-001 | Suite sécurité (IDOR, RBAC, CSP, MFA) bloquante, arrêt au premier échec | 05 §3 | ASVS · SAMM V-ST | Log CI | QA | PR | 0 échec mergé |
| ACS-TST-002 | Couverture ≥ objectif contractuel, quality-gate actif | 05 §4 | SAMM V | Rapport de couverture + config gate | QA | Release | ≥ 60 % en prod, 70 % à 6 mois (par défaut) |
| ACS-TST-003 | Test E2E flaky réparé ou supprimé ≤ 7 jours | 05 §2 | — | Suivi des flaky (tickets datés) | QA | Hebdo | Âge max 7 jours |
| ACS-TST-004 | Jalon de charge bloquant sur la concurrence totale avant prod | 05 §2, 12 J(n+2) | SRE | Rapport k6/équivalent annexé au PV | DevOps | Release majeure | Objectifs SLO tenus |

### Sécurité et supply chain

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-SEC-001 | SLA correctifs : critique ≤ 72 h, haute ≤ 7 j, moyenne ≤ 30 j | 06 §4 | CSF RS · ISO A.8.8 | Tickets CVE avec horodatage | Sécurité | Continu | 100 % dans les délais |
| ACS-SEC-002 | Réponse « sommes-nous exposés à CVE X ? » en < 1 h via SBOM | 06 §4 | SBOM/SLSA | Exercice chronométré consigné | Sécurité | Trimestriel | < 1 h |
| ACS-SEC-003 | Threat model versionné par fonctionnalité majeure, avant développement | 06 §2 | SSDF PW.1 · SAMM D-TA | Fichiers `/docs/threat-models/` liés aux PR | Sécurité | Par feature majeure | 100 % des features majeures |
| ACS-SEC-004 | Mots de passe Argon2id/bcrypt, comparaison temps constant, crypto agility | 06 §3 bis | ASVS V2/V6 | Revue de config + extrait de code | Sécurité | Annuel | 0 SHA-x seul |
| ACS-CHN-001 | Nouvelle dépendance : justification, santé, licence, scan, quarantaine 7 j | 06 §5 | SSDF PW.4 · SLSA · OpenSSF | Trace du processus sur la PR | Dev | Par dépendance | 100 % |
| ACS-CHN-002 | SBOM CycloneDX par build, conservé en artefact | 07 §1 | SLSA · SSDF PS.3 | Artefact CI daté | DevOps | Build | 100 % des builds |
| ACS-CHN-003 | Actions CI épinglées SHA ; artefacts signés, signature vérifiée au déploiement | 07 §1 | SLSA L2+ · Sigstore | Config CI + log de vérification | DevOps | Release | 0 tag mobile |

### CI/CD et exploitation

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-CIC-001 | Pipeline 8 étapes bloquantes ; échec = arrêt, pas de re-run sans correction | 07 §1 | SSDF PO.4 | Config pipeline + historique | DevOps | Continu | 0 contournement |
| ACS-CIC-002 | IaC exclusive ; modification manuelle en prod = incident ; drift nul | 07 §2 | CIS · SOC 2 CC8 | Rapport de drift mensuel | DevOps | Mensuel | Drift = 0 |
| ACS-CIC-003 | Rollback une commande, testé à chaque release majeure | 07 §1 | SRE | Compte rendu du test | DevOps | Release majeure | Testé avant release |
| ACS-EXP-001 | Sauvegardes 3-2-1 immuables ; restauration réelle testée mensuellement | 08 §4 | CSF RC · ISO A.8.13 | Compte rendu daté de restauration | DevOps | Mensuel | < 30 jours |
| ACS-EXP-002 | Supervision hors production, alerting testé de bout en bout | 08 §1 | CSF DE | Preuve d'alerte de test reçue | DevOps | Semestriel | Testé |
| ACS-EXP-003 | Chaque alerte a un runbook ; alerte non actionnable traitée ≤ 7 j | 08 §3 | SRE | Inventaire alertes↔runbooks | DevOps | Trimestriel | 100 % |
| ACS-EXP-004 | Budget d'erreur : épuisé ⇒ gel des features | 08 §2 | SRE | Suivi SLO + décisions tracées | DevOps | Mensuel | Règle appliquée |
| ACS-EXP-005 | Postmortem sans blâme ≤ 5 j ouvrés, actions prioritaires suivies | 08 §5 | CSF RS/RC | Postmortems + suivi des actions | DevOps | Par incident majeur | 100 % |

### Données, MCO, IA

| ID | Exigence | Source | Référentiels | Preuve attendue | Responsable | Fréquence | Seuil |
|---|---|---|---|---|---|---|---|
| ACS-DON-001 | Toute donnée du schéma classée ; non classée = sensible | 15 §1 | ISO A.5.12 · SOC 2 C | Revue du schéma annotée | DPO/Tech Lead | Par migration | 100 % |
| ACS-DON-002 | Rétentions appliquées **en code** (purges testées) | 15 §3 | Cadre légal local | Tests de purge + planification | Dev | Trimestriel | 100 % des catégories |
| ACS-DON-003 | Anonymisation hors prod versionnée et testée | 15 §5 | Cadre légal local | Test « aucun champ personnel ne survit » | QA | Par rafraîchissement | 0 donnée réelle hors prod |
| ACS-DON-004 | Droits des personnes outillés et testés (accès, rectification, effacement) | 15 §4 | Loi locale (ARTCI/CNIL…) | Procédures testées, délais mesurés | DPO | Annuel | Délais légaux tenus |
| ACS-MCO-001 | Inventaire EOL ; brique < 6 mois de fin de support ⇒ plan daté | 13 §5 | CIS 2 · ISO A.8.8 | Inventaire EOL daté | DevOps | Trimestriel | 0 composant sans plan |
| ACS-MCO-002 | Réversibilité : export complet testé annuellement | 13 §8 | Souveraineté / contrat | Compte rendu du test d'export | DevOps | Annuel | < 12 mois |
| ACS-IA-001 | Aucune écriture sensible validée par un agent IA seul ; confirmation humaine tracée | 06 §8, 19 | NIST AI RMF · référentiel MCP | Journal des appels d'agents | Sécurité | Hebdo | 100 % confirmées |
| ACS-IA-002 | Sorties de sources non fiables = données, jamais instructions ; descriptions MCP versionnées | 06 §8, 19 | OWASP LLM Top 10 | Revue des diffs de descriptions d'outils | Sécurité | Par changement | 100 % revus |

## 4. Comment l'auditeur (interne ou externe) utilise ce registre

1. Sélectionner les contrôles applicables au projet (tous, sauf non-applicabilité justifiée dans la matrice).
2. Pour chaque contrôle : demander la **preuve attendue**, vérifier qu'elle est **datée, reproductible et dans le seuil**. Une preuve manquante = non conforme, pas « à vérifier plus tard ».
3. Statuts : `conforme` / `partiel` / `non conforme` / `non applicable` / `dérogation ADR` — reportés dans la `MATRICE-ADOPTION.md` du projet.
4. Les écarts alimentent `17-registre-risques-derogations.md` avec sévérité, propriétaire et échéance.

## 5. Évolution du registre

Ajouter un contrôle = PR avec ID nouveau, mapping référentiels et preuve définie. Modifier un seuil = entrée `Changed` au changelog avec date d'entrée en vigueur et action attendue des projets existants. Retirer un contrôle = statut `retiré`, jamais de réutilisation d'ID. Revue complète du registre : annuelle, avec l'instantané de veille à jour.
