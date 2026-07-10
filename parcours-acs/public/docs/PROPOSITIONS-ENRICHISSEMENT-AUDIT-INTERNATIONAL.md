# Propositions d'enrichissement audit international

> Destination : Claude Code ou tout agent charge d'enrichir ce corpus. Objectif : transformer le referentiel ACS Groupe en standard auditable de niveau international, sans affaiblir les exigences existantes.

## 1. Mission pour Claude Code

Parcourir chaque fichier du corpus et enrichir la documentation pour qu'elle soit :

- **contractuelle** : les exigences restent claires, non ambiguës et applicables ;
- **auditable** : chaque règle importante doit produire une preuve vérifiable ;
- **internationale** : les exigences doivent être rapprochées des référentiels reconnus ;
- **évolutive** : le standard n'est pas figé ; il doit être révisé, amendé et amélioré à partir des audits, incidents, retours de projet, évolutions réglementaires et nouvelles pratiques de l'industrie.

Ne pas remplacer le corpus existant par une théorie générale. Il faut enrichir ce qui existe, préserver le ton direct, garder les règles actionnables et éviter les longues généralités.

## 2. Doctrine obligatoire : standard vivant

Ajouter dans la documentation une doctrine explicite :

> Un standard ACS Groupe est vivant. Il n'est pas statique, décoratif ou définitif. Toute règle doit pouvoir être confrontée aux preuves de terrain, aux incidents, aux audits, aux changements réglementaires, aux nouvelles menaces et aux évolutions des plateformes. Une règle obsolète se révise ; une règle insuffisante se renforce ; une exception répétée devient un sujet de refonte. Le corpus est donc versionné, revu périodiquement et amendé par PR tracée.

Cette doctrine doit apparaître dans le README et être reflétée dans les documents de gouvernance, d'audit, de MCO et de changelog.

## 3. Règle d'enrichissement par contrôle

Pour chaque exigence critique, ajouter ou préparer un format de contrôle :

| Champ | Attendu |
|---|---|
| **ID contrôle** | Identifiant stable, ex. `ACS-SEC-001`, `ACS-CICD-004` |
| **Exigence** | Formulation claire en MUST / SHOULD / MAY |
| **Référentiels liés** | NIST SSDF, OWASP SAMM/ASVS, SLSA, CIS, ISO 27001, SOC 2, NIST CSF, WCAG, DORA/SRE, cadre légal local |
| **Preuve attendue** | Sortie d'outil, capture, log, artefact, requête, rapport, lien CI, ticket, ADR |
| **Responsable** | Rôle redevable : Tech Lead, DevOps/SRE, Sécurité, QA, Product Owner, DPO/juriste |
| **Fréquence** | A chaque PR, release, trimestre, semestre, année, incident |
| **Seuil d'acceptation** | Valeur mesurable : 0 vulnérabilité critique ouverte, restauration < 30 jours, CI verte, etc. |
| **Dérogation** | ADR obligatoire, date de résorption, contrôle compensatoire, approbateur humain |

Le but n'est pas d'alourdir chaque paragraphe, mais de rendre les exigences majeures contrôlables.

## 4. Référentiels internationaux à mapper

Utiliser ces cadres comme boussole de haut niveau :

- **NIST SSDF SP 800-218** : pratiques de développement logiciel sécurisé.
- **OWASP SAMM** : maturité sécurité applicative par gouvernance, conception, implémentation, vérification et opérations.
- **OWASP ASVS** : exigences techniques vérifiables pour applications web et API.
- **OWASP Top 10** : risques applicatifs majeurs.
- **SLSA / Sigstore / SBOM** : intégrité de la chaîne de construction et livraison logicielle.
- **CIS Controls / CIS Benchmarks** : durcissement et contrôles de cybersécurité.
- **ISO/IEC 27001:2022** : système de management de la sécurité de l'information.
- **SOC 2 Trust Services Criteria** : sécurité, disponibilité, confidentialité, intégrité de traitement, vie privée.
- **NIST CSF 2.0** : gouverner, identifier, protéger, détecter, répondre, rétablir.
- **WCAG 2.2 AA** : accessibilité numérique.
- **DORA / SRE Google** : performance de livraison, SLO, error budget, incident response.
- **Cadre légal local** : droit applicable du pays et du secteur ; ne jamais recopier un cadre étranger sans validation juridique.

## 5. Enrichissements par document

### README.md

- Ajouter la doctrine du standard vivant.
- Ajouter une section "Cartographie internationale" listant les référentiels cibles.
- Ajouter une section "Maturité d'adoption" : socle, auditable, international.
- Clarifier que les règles évoluent par PR, revue humaine, changelog et revue annuelle.

### 01-onboarding-developpeur.md

- Ajouter le cycle complet `Joiner / Mover / Leaver`.
- Ajouter preuve de formation sécurité, lecture attestée du corpus et validation MFA.
- Ajouter revue d'accès à J+30 et à chaque changement de rôle.
- Ajouter checklist poste de travail : chiffrement disque, verrouillage, mises à jour, accès coffre-fort, interdiction de stockage local de secrets.

### 02-standards-de-code.md

- Ajouter seuils mesurables : complexité, duplication, dette technique, couverture comportementale.
- Ajouter exigences SAST/SCA par criticité.
- Ajouter règles de configuration sécurisée par langage/framework.
- Ajouter règles de revue du code généré par IA : traçabilité, tests, dépendances, données interdites.

### 03-workflow-git-revues.md

- Ajouter `CODEOWNERS`, protection de branches et règles minimales par dépôt.
- Ajouter labels de risque PR : sécurité, migration, API, données, infra, IA/MCP.
- Ajouter modèle de checklist PR.
- Ajouter preuve de signature commit/tag sur dépôts sensibles.

### 04-regles-architecture.md

- Ajouter C4 diagrams, data-flow diagrams et trust boundaries.
- Ajouter fitness functions d'architecture vérifiées en CI.
- Ajouter exigences multi-tenant : isolation, tests croisés, exports, audit.
- Ajouter registre des dépendances externes et modes dégradés.

### 05-strategie-tests.md

- Ajouter matrice exigence -> test -> preuve.
- Ajouter stratégie flaky tests avec indicateur et délai de correction.
- Ajouter tests de résilience, tests de migration, tests d'accessibilité et tests de rollback.
- Ajouter critères de sortie par niveau de criticité métier.

### 06-securite-developpeur.md

- Ajouter niveau cible OWASP ASVS par criticité.
- Ajouter security champions et rituels de revue sécurité.
- Ajouter scoring CVE avec CVSS, EPSS, exposition réelle et sources primaires.
- Ajouter modèle de threat modeling léger mais versionné.
- Ajouter contrôles spécifiques IA : prompt injection, tool poisoning, validation humaine, journalisation.

### 07-cicd-supply-chain.md

- Ajouter objectif SLSA par niveau de maturité.
- Ajouter provenance, attestations, build isolé, runners éphémères.
- Ajouter policy-as-code : OPA/Conftest/Kyverno ou équivalent.
- Ajouter rétention des artefacts, SBOM et preuves de signature.

### 08-exploitation-observabilite.md

- Ajouter catalogue SLI/SLO par service.
- Ajouter politique d'error budget et conséquences opérationnelles.
- Ajouter incident commander, rôles de crise, communication client.
- Ajouter exercices réguliers : incident, restauration, DR, compromission de compte.
- Ajouter revue mensuelle SRE/FinOps.

### 09-toolchain.md

- Ajouter critères d'acceptation d'un outil : licence, souveraineté, données traitées, mainteneur, cadence de patch, plan de sortie.
- Ajouter OpenSSF Scorecard ou équivalent pour dépendances open source critiques.
- Ajouter alternatives self-hosted quand le SaaS est incompatible avec la souveraineté.

### 10-gabarits.md

Ajouter les gabarits suivants :

- threat model ;
- registre des risques ;
- registre des dérogations ;
- evidence log d'audit ;
- checklist PR ;
- release plan ;
- rollback plan ;
- revue d'architecture ;
- DPIA/PIA ou fiche d'analyse données personnelles ;
- fiche d'acceptation opérationnelle MCO.

### 11-conception-api.md

- Ajouter exigences OAuth2/OIDC, scopes, rotation, mTLS si B2B sensible.
- Ajouter règles BOLA/BFLA et tests obligatoires.
- Ajouter compatibilité ascendante des schémas et politique de rupture.
- Ajouter catalogue d'erreurs métier stable.
- Ajouter limites anti-abus et protection scraping/export massif.

### 12-cycle-de-vie-projet.md

- Ajouter RACI/RASCI par jalon.
- Ajouter paquet de preuves attendu à chaque porte.
- Ajouter validation des exigences non fonctionnelles avant J3.
- Ajouter gestion fournisseurs et sous-traitants.
- Ajouter critère "audit readiness" avant production.

### 13-vie-du-produit-mco.md

- Ajouter catalogue de service, calendrier de changement, critères d'acceptation opérationnelle.
- Ajouter plan capacité et revue mensuelle de service.
- Ajouter communication incident client : qui, quand, quoi, preuves.
- Ajouter plan de fin de vie, archivage et réversibilité testée.

### 14-auto-audit.md

- Ajouter IDs de contrôle, méthode d'échantillonnage et scoring.
- Ajouter colonne preuve attendue / preuve fournie / lien / responsable.
- Ajouter comparaison avec trimestre précédent.
- Ajouter revue croisée par pair pour éviter l'auto-validation complaisante.
- Ajouter dashboard de remédiation : écarts ouverts, âge, sévérité, propriétaire.

### 15-gouvernance-des-donnees.md

- Ajouter data owner, data steward et DPO/juriste selon contexte.
- Ajouter data lineage et registre des traitements.
- Ajouter base légale, transfert transfrontalier, localisation et sous-traitants.
- Ajouter déclencheurs DPIA/PIA.
- Ajouter vérification d'effacement et gestion des sauvegardes après effacement.

### MATRICE-ADOPTION.md

Transformer la matrice en outil d'audit :

| Contrôle | Exigence | Statut | Preuve | Lien preuve | Responsable | Fréquence | Référentiel | Prochaine revue |
|---|---|---|---|---|---|---|---|---|

Statuts recommandés : `conforme`, `partiel`, `non conforme`, `non applicable`, `dérogation ADR`.

### CHANGELOG.md

- Ajouter les changements avec date, impact, migration attendue et date d'entrée en vigueur.
- Séparer `Added`, `Changed`, `Deprecated`, `Removed`, `Security`.
- Mentionner les règles modifiées qui imposent une action aux projets existants.

### REVUE-COMPLETUDE-2026-07-10.md

- Marquer le document comme historique ou ajouter un statut des écarts résolus/restants.
- Eviter qu'un auditeur lise une revue ancienne comme l'état courant du corpus.

### Standards-Developpement-ACS-Groupe.docx

- Le document Word doit être généré depuis les sources Markdown.
- Ajouter page de contrôle documentaire : version, date, source, hash ou commit, approbateur, historique.
- Ne pas modifier le `.docx` manuellement si une chaîne de génération existe.

## 6. Documents supplémentaires proposés

Créer si pertinent :

1. `16-cartographie-controles-internationaux.md` : mapping ACS -> référentiels internationaux.
2. `17-registre-risques-derogations.md` : risques, exceptions, contrôles compensatoires, dates de résorption.
3. `18-platform-engineering.md` : golden paths, templates, service catalog, paved roads, conformité automatisée.
4. `19-gouvernance-ia-et-agents.md` : IA, MCP, prompts, données interdites, validation humaine, audit.

## 7. Definition of Done pour l'enrichissement

Le travail de Claude Code est terminé quand :

- chaque document a reçu des propositions ou enrichissements concrets ;
- le README affirme clairement que le standard est évolutif ;
- les exigences majeures sont reliées à des preuves auditables ;
- la matrice d'adoption permet de collecter les preuves ;
- le changelog trace les modifications ;
- aucun MUST existant n'a été affaibli ;
- les nouvelles règles restent indépendantes de la stack ;
- les dérogations exigent une ADR, une date de résorption et un approbateur humain.

## 8. Priorisation

| Priorité | Travail |
|---|---|
| P1 | README, MATRICE-ADOPTION, 14-auto-audit, 06-securite-developpeur, 07-cicd-supply-chain |
| P2 | 10-gabarits, 04-regles-architecture, 05-strategie-tests, 15-gouvernance-des-donnees |
| P3 | 01-onboarding, 02-standards-code, 03-workflow-git, 08-exploitation, 09-toolchain, 11-13 |

Commencer par P1 : c'est ce qui transforme le corpus en référentiel vérifiable.
