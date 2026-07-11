# Standards de développement ACS Groupe

| | |
|---|---|
| **Statut** | Standard interne ACS Groupe — applicable à tout projet de plateforme |
| **Public** | Développeurs, DevOps/SRE, Sécurité, QA — et tout nouvel arrivant |
| **Version** | 1.2.1 — Juillet 2026 (voir `CHANGELOG.md`) |
| **Portée** | Indépendant de la stack : tout langage, tout framework, tout SGBD, tout cloud |
| **Origine** | Consolidé depuis le référentiel ACS Groupe et éprouvé en conditions réelles de production |

Ce corpus est **contractuel, pas indicatif** : un travail qui ne satisfait pas les Definition of Done n'est pas terminé, quel que soit le temps investi. En cas de conflit entre vitesse et standard, le standard gagne.

**Niveaux d'exigence** : toute règle du corpus est **obligatoire [MUST]** sauf marquage explicite **[SHOULD]** (recommandée — l'écart se justifie en une phrase en revue) ou **[MAY]** (optionnelle). Une dérogation à un [MUST] exige une ADR approuvée.

**Standard vivant** : ce corpus n'est pas statique. Il évolue avec les audits, incidents, retours de projet, nouvelles menaces, évolutions réglementaires et pratiques internationales. Une règle obsolète se révise ; une règle insuffisante se renforce ; une exception répétée devient un sujet de refonte. Toute évolution est versionnée, relue humainement, tracée dans `CHANGELOG.md` et reliée à des preuves quand elle touche un contrôle auditable.

## Parcours du nouveau développeur (ordre de lecture recommandé, à ton rythme)

| Temps | Lire | Objectif |
|---|---|---|
| T1 | `01-onboarding-developpeur.md` | Accès, environnement, interdictions absolues |
| T2 | `02-standards-de-code.md` + `03-workflow-git-revues.md` | Écrire et livrer du code conforme |
| T3 | `04-regles-architecture.md` + `11-conception-api.md` | Les règles bloquantes vérifiées en CI |
| T4 | `05-strategie-tests.md` + `06-securite-developpeur.md` | Tester et sécuriser comme on code |
| T5 | `07-cicd-supply-chain.md` + `08-exploitation-observabilite.md` | Le chemin jusqu'à la production |
| T6 | `12-cycle-de-vie-projet.md` + `13-vie-du-produit-mco.md` + `15-gouvernance-des-donnees.md` | Où le travail s'insère, et ce qui vit après la prod |
| Référence | `09-toolchain.md` + `10-gabarits.md` + `14-auto-audit.md` + `MATRICE-ADOPTION.md` | Outils, gabarits, vérification |

**Parcours par rôle** (mêmes documents, ordre différent) :

- **DevOps/SRE** : 01 → 07 → 08 → 04 → 13 → 06 → 14
- **QA** : 01 → 05 → 12 (Definition of Ready) → 04 → 14 → 15
- **Sécurité** : 01 → 06 → 14 → 04 → 07 → 15 → 10 (SECURITY.md)

## Index du corpus

| Document | Contenu |
|---|---|
| `01-onboarding-developpeur.md` | Parcours d'arrivée J1 / semaine 1 / mois 1, checklists d'accès |
| `02-standards-de-code.md` | Formatage, typage, analyse statique, dates/monnaie/concurrence, a11y, code IA |
| `03-workflow-git-revues.md` | Trunk-based, Conventional Commits, PR, revues, SemVer, secrets dans Git |
| `04-regles-architecture.md` | Couches, modules, outbox, migrations, audit write-ahead, résilience, cache, corrélation |
| `05-strategie-tests.md` | Pyramide, critères d'entrée/sortie, anomalies, contrats, budget de performance |
| `06-securite-developpeur.md` | Interdictions, revue sécurité, crypto, supply chain, incidents, IA/MCP, mapping OWASP |
| `07-cicd-supply-chain.md` | Pipeline bloquant, IaC, SBOM, signature, rollback, DORA |
| `08-exploitation-observabilite.md` | SLO, alertes/runbooks, sauvegardes immuables, postmortems, astreinte, arbitrages |
| `09-toolchain.md` | Table d'équivalences par écosystème + déclinaison canonique PHP/Laravel |
| `10-gabarits.md` | 17 gabarits : ADR, runbook, postmortem, anomalie, SECURITY.md, toolchain, threat model, registres, evidence log, checklist PR, release/rollback plan, DPIA, acceptation MCO |
| `11-conception-api.md` | Erreurs RFC 9457, pagination, idempotence, rate limit, webhooks, dépréciation |
| `12-cycle-de-vie-projet.md` | Portes J0→J(n+3), Definition of Ready, changements de périmètre, registres |
| `13-vie-du-produit-mco.md` | SemVer, circuits de changement, EOL, SLA, migration de données, réversibilité |
| `14-auto-audit.md` | Checklist trimestrielle par preuve : accès, config, audit trail, sauvegardes, dette |
| `15-gouvernance-des-donnees.md` | Classification, finalités, rétentions, droits des personnes, anonymisation |
| `16-cartographie-controles-internationaux.md` | Registre des contrôles ACS (IDs, preuves, responsables) + mapping vers les référentiels internationaux |
| `17-registre-risques-derogations.md` | Risques, dérogations, contrôles compensatoires, dates de résorption |
| `18-platform-engineering.md` | Golden paths, templates, catalogue de services, conformité automatisée |
| `19-gouvernance-ia-et-agents.md` | IA et agents : usages permis, données interdites, validation humaine, audit |
| `MATRICE-ADOPTION.md` | Outil d'audit par projet : contrôles, statuts, preuves, responsables — revalidé à chaque porte |
| `PROPOSITIONS-ENRICHISSEMENT-AUDIT-INTERNATIONAL.md` | Instructions d'enrichissement (mission exécutée en v1.2 — conservé comme trace) |

## Les invariants non négociables (tous documents, tous projets)

1. **Zero Trust** : chaque requête est authentifiée, autorisée et journalisée — y compris celles des rôles techniques et des outils tiers.
2. **Défense en profondeur** : l'autorisation est vérifiée à trois niveaux indépendants (bordure, application, base de données). Jamais un mécanisme unique.
3. **Journalisation totale** : aucune action sans trace ; sur le périmètre d'administration, l'audit est écrit *avant* l'action (write-ahead) et son indisponibilité refuse la requête.
4. **Transactional outbox** : aucun événement publié directement sur le bus ; l'événement est écrit dans la transaction métier.
5. **Sauvegardes immuables anti-rançongiciel** : règle 3-2-1 avec verrou d'écriture, restauration testée mensuellement — c'est la restauration testée qui constitue la garantie.
6. **Supervision hors production** : la production est observée depuis l'extérieur d'elle-même.
7. **Chaîne d'approvisionnement maîtrisée** : lockfiles, audits bloquants, SBOM, quarantaine, signatures.

## Cartographie internationale

Le corpus est rapproché des référentiels reconnus — le détail contrôle par contrôle est dans `16-cartographie-controles-internationaux.md` :

| Référentiel | Ce qu'il couvre dans le corpus |
|---|---|
| NIST SSDF (SP 800-218) | Développement sécurisé : docs 02, 03, 06, 07 |
| OWASP SAMM / ASVS / Top 10 | Maturité et exigences applicatives : docs 04, 06, 11, 14 |
| SLSA / Sigstore / SBOM (CycloneDX) | Intégrité de la chaîne de build : doc 07 |
| CIS Controls / Benchmarks | Durcissement : docs 07, 08 |
| ISO/IEC 27001:2022 · SOC 2 TSC | Management de la sécurité, preuves d'audit : docs 06, 14, 16, MATRICE |
| NIST CSF 2.0 | Gouverner → rétablir : docs 06, 08, 13, 17 |
| WCAG 2.2 AA | Accessibilité : doc 02 §11 |
| DORA / SRE | Performance de livraison, SLO, error budget : docs 07, 08 |
| Cadre légal local | Données personnelles, cybersécurité : doc 15 — jamais recopié d'un autre pays |

## Maturité d'adoption (par projet)

| Niveau | Critère | Preuve |
|---|---|---|
| **1 — Socle** | Interdictions absolues + pipeline bloquant + matrice remplie à J3 | Matrice d'adoption initiale |
| **2 — Auditable** | Chaque contrôle [MUST] a une preuve datée et un responsable ; auto-audit trimestriel tenu | Evidence log + restitutions d'auto-audit |
| **3 — International** | Mapping référentiels tenu (doc 16), revue croisée par pair, dérogations toutes résorbées ou compensées | Audit externe / due diligence passés sans écart majeur |

## Gouvernance du standard

- Le **dossier d'architecture technique du projet est la loi** ; toute dérogation exige une ADR approuvée par le responsable technique, versionnée dans `/docs/adr/`.
- Un agent IA **propose**, un humain **décide** : aucun engagement public, aucune dérogation au standard n'est validé par un agent seul.
- **Amélioration continue** : toute leçon apprise sur un projet est proposée en mise à jour du document concerné au responsable technique. Les modifications du corpus passent par PR revue et sont tracées dans `CHANGELOG.md` ; revue complète du corpus une fois par an.
- **Évolution contrôlée** : le standard est un produit documentaire maintenu. Les audits, postmortems, CVE majeures, changements de loi, changements de stack et écarts récurrents déclenchent une proposition d'amendement. Une mise à jour du standard indique toujours son motif, son impact, sa date d'entrée en vigueur et les preuves attendues.
- En début de projet, l'équipe produit la **déclinaison concrète** de la toolchain (`/docs/toolchain.md`, gabarit dans `10-gabarits.md` §7) et copie `MATRICE-ADOPTION.md` dans le dépôt : la matrice est revalidée à chaque porte du projet.
