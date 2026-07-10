# Changelog du corpus

## v1.2 — 10 juillet 2026

> **Entrée en vigueur** : immédiate pour tout nouveau projet. Projets existants : mise en conformité exigée à la **prochaine porte** du cycle de vie (`12-cycle-de-vie-projet.md`).
>
> **Action requise (projets existants)** : adopter la nouvelle `MATRICE-ADOPTION.md` à IDs de contrôle `ACS-*` — reporter les statuts existants dans le nouveau format (statuts, preuves, liens, responsables) et la faire revalider à la prochaine porte. Créer les registres de risques et de dérogations (doc 17) ; toute dérogation à un [MUST] en cours doit y être régularisée (ADR, contrôle compensatoire, date de résorption, approbateur humain).

### Added

- `16-cartographie-controles-internationaux.md` : **registre des contrôles ACS** — IDs stables `ACS-<DOMAINE>-NNN`, exigence, preuve attendue, responsable, fréquence, seuil d'acceptation, et **mapping vers les référentiels internationaux** (NIST SSDF, OWASP SAMM/ASVS/Top 10, SLSA/Sigstore/SBOM, CIS, ISO 27001, SOC 2, NIST CSF 2.0, WCAG 2.2 AA, DORA/SRE, cadre légal local).
- `17-registre-risques-derogations.md` : registre vivant des risques (probabilité×impact, propriétaire, plan éviter/réduire/transférer/accepter daté) et des dérogations (contrôle `ACS-*`, ADR, contrôle compensatoire, date de résorption, approbateur humain) ; règles : risque sans plan daté = vœu, dérogation expirée = non-conformité signalée, revue à chaque COPROJ/comité sécurité, alimentation depuis l'auto-audit et les postmortems.
- `18-platform-engineering.md` : golden paths (templates de dépôt pré-conformes : pipeline 8 étapes, scan de secrets, policies, gabarits inclus), templates versionnés et propagés, catalogue de services interne (propriétaires, SLO, runbooks, dépendances), conformité automatisée (policy-as-code, preuves de la matrice générées par CI), métriques d'adoption ; tout écart au golden path = ADR.
- `19-gouvernance-ia-et-agents.md` : usages permis/interdits des assistants IA (jamais de secret, de donnée réelle ni de code client vers un service non approuvé), traçabilité (le mergeur est l'auteur responsable), dépendances hallucinées/typosquatting → processus supply chain, agents MCP (OAuth 2.1+PKCE, périmètre ⊆ mandant, outils annotés par risque, confirmation humaine `ACS-IA-001`, anti tool-poisoning `ACS-IA-002`, journalisation unifiée, revue hebdo), anti prompt-injection, décision humaine obligatoire, limites des outillages « dev guard ».
- `PROPOSITIONS-ENRICHISSEMENT-AUDIT-INTERNATIONAL.md` : instructions d'enrichissement du corpus (mission exécutée en v1.2 — conservé comme trace).
- **README** : sections **Cartographie internationale** (référentiels cibles par document) et **Maturité d'adoption** (niveaux 1 Socle / 2 Auditable / 3 International, avec preuves).

### Changed

- **README** : doctrine du **standard vivant** — corpus évolutif, versionné, relu humainement, amendé par PR tracée à partir des audits, incidents, retours de projet, changements réglementaires et nouvelles menaces ; gouvernance précisée (motif, impact, date d'entrée en vigueur et preuves attendues pour toute mise à jour).
- **MATRICE-ADOPTION.md** : transformée en **outil d'audit** — colonnes contrôle `ACS-*`, exigence, statut (`conforme` / `partiel` / `non conforme` / `non applicable` / `dérogation ADR`), preuve, lien preuve, responsable, fréquence, référentiel, prochaine revue ; revalidée à chaque porte.
- **14-auto-audit** : renforcé — **revue croisée par pair** (l'auditeur d'un domaine n'est jamais son constructeur), **méthode d'échantillonnage** (≥ 10 éléments ou 10 %), **evidence log** versionné par trimestre (preuve attendue/fournie/lien/statut/responsable), scoring aligné sur les IDs `ACS-*`, comparaison avec le trimestre précédent et **dashboard de remédiation** (écarts ouverts, âge, sévérité, propriétaire).
- **01, 02, 03, 04, 05, 08, 09, 10, 11, 12, 13, 15** : enrichissements ciblés vers l'auditabilité — 01 : cycle Joiner/Mover/Leaver, revue d'accès J+30, checklist poste de travail ; 02 : seuils mesurables, SAST/SCA par criticité ; 03 : CODEOWNERS, labels de risque PR, checklist PR ; 04 : C4/data-flow/trust boundaries, fitness functions, exigences multi-tenant ; 05 : matrice exigence→test→preuve, tests de résilience/migration/rollback ; 08 : catalogue SLI/SLO, incident commander, exercices réguliers ; 09 : critères d'acceptation d'un outil, OpenSSF Scorecard ; 10 : nouveaux gabarits (threat model, registres, evidence log, checklist PR, release/rollback plan, DPIA, acceptation MCO) ; 11 : OAuth2/OIDC, BOLA/BFLA, compatibilité des schémas, anti-abus ; 12 : RACI par jalon, paquet de preuves par porte, audit readiness ; 13 : catalogue de service, plan de fin de vie, réversibilité testée ; 15 : data owner/steward, lineage, DPIA, vérification d'effacement.

### Security

- **06-securite-developpeur** : niveau cible **OWASP ASVS par criticité** applicative, **security champions** et rituels de revue sécurité, scoring des CVE par **CVSS + EPSS + exposition réelle** (sources primaires), **threat model léger mais versionné** par fonctionnalité majeure, contrôles spécifiques IA (prompt injection, tool poisoning, validation humaine, journalisation).
- **07-cicd-supply-chain** : objectif **SLSA L2 → L3** par maturité, **provenance et attestations** de build, build isolé sur **runners éphémères**, **policy-as-code** (OPA/Conftest/Kyverno ou équivalent), **rétention** des artefacts, SBOM et preuves de signature.

## v1.1 — 10 juillet 2026

Suite à la revue de complétude (`REVUE-COMPLETUDE-2026-07-10.md`) :

- **Nouveaux documents** : 11-conception-api, 12-cycle-de-vie-projet, 13-vie-du-produit-mco, 14-auto-audit, 15-gouvernance-des-donnees, MATRICE-ADOPTION.
- **02** : dates/UTC, monnaie sans flottant, concurrence et idempotence, complexité/commentaires/TODO, accessibilité WCAG 2.2 AA, code généré par IA.
- **03** : SemVer et releases, signature des commits, scan de secrets pre-commit, procédure de fuite de secret.
- **04** : doctrine de résilience (timeouts, retries, circuit breakers), doctrine de cache, identifiant de corrélation.
- **05** : données de test, tests de contrat, budget de performance en CI.
- **06** : mots de passe Argon2id, crypto agility, classification des données, mapping OWASP Top 10 → contre-mesures.
- **07** : métriques DORA, environnements éphémères.
- **08** : astreinte, FinOps.
- **10** : gabarit `/docs/toolchain.md`.
- **README** : convention de niveaux d'exigence [MUST]/[SHOULD]/[MAY], parcours par rôle (DevOps, QA, Sécurité), index à 16 documents.

## v1.0 — 10 juillet 2026

Corpus initial (11 documents), dérivé de l'Offre technique DGPSP v1.0 et des manuels du standard ACS Groupe (dev-devops-securite, tests-recette, security-md).
