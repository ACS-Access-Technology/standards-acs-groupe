# 18 — Platform engineering : industrialiser la conformité

> Le corpus fixe les exigences ; ce document fixe la manière de les rendre **peu coûteuses à respecter**. Principe cardinal : **le chemin conforme doit être le chemin le plus facile.** Si respecter le standard demande plus d'efforts que le contourner, le standard perdra — pas par malveillance, par friction. La plateforme interne (templates, catalogue, policy-as-code) transforme la conformité d'un effort individuel répété en propriété par défaut de l'outillage.

## 1. Golden paths : le dépôt pré-conforme

- Tout nouveau dépôt/service part d'un **template de dépôt pré-conforme** maintenu par l'équipe plateforme (ou le responsable technique quand il n'y a pas d'équipe dédiée). Créer un service « à la main » à partir d'un dépôt vide est interdit sans ADR.
- Le template embarque, prêts à l'emploi :
  - le **pipeline 8 étapes bloquant** (`07-cicd-supply-chain.md` §1), configuré, pas documenté-à-configurer ;
  - le **scan de secrets** pre-commit + CI (`03-workflow-git-revues.md` §7) ;
  - la **protection de branche** et les règles de revue (CODEOWNERS, merge interdit CI rouge) ;
  - les **policies par défaut** : deny-by-default, en-têtes de sécurité, configuration durcie de l'écosystème choisi ;
  - les **gabarits** du corpus pré-copiés : `/docs/adr/`, `/docs/toolchain.md`, `MATRICE-ADOPTION.md`, registres de risques et dérogations (doc 17), SECURITY.md ;
  - la structure de tests (unitaires, contrat, suite sécurité) avec au moins un test de chaque type qui passe.
- Un template existe **par type de composant** récurrent (service API, frontend, batch/worker, bibliothèque interne). Pas de template « universel » flou : un golden path est étroit et opinionné, c'est sa valeur.
- **Tout écart au golden path est une ADR.** Pas un jugement — une trace : l'écart justifié d'aujourd'hui est soit le bug de conformité de demain, soit l'amélioration du template de demain. Les ADR d'écart sont revues périodiquement par l'équipe plateforme : trois projets qui dévient au même endroit signalent un template à corriger, pas trois équipes fautives.

## 2. Templates versionnés et propagés

- Les templates sont **versionnés** (SemVer) et tracés dans leur propre changelog. Un projet sait de quelle version de template il est issu (fichier de marquage dans le dépôt, ex. `.template-version`).
- Une mise à jour de template est **propagée**, pas seulement publiée : l'équipe plateforme ouvre les PR de mise à jour dans les dépôts existants (ou fournit l'outillage de synchronisation qui le fait). Un template corrigé que personne n'applique aux dépôts existants n'a corrigé personne.
- Les mises à jour de sécurité du template (pipeline, policies, scan) sont traitées avec le SLA des correctifs de sécurité (`06-securite-developpeur.md` §4) : la faille d'un template est une faille de tous ses descendants.
- Un dépôt en retard de plus d'une version majeure de template est un écart signalé à l'auto-audit.

## 3. Catalogue de services interne

Un catalogue **unique et à jour** recense tout service en vie (fichier descripteur versionné dans chaque dépôt, agrégé — l'outil importe peu, l'existence et la fraîcheur sont la règle) :

| Champ | Contenu |
|---|---|
| Service | Nom, description en une phrase, criticité métier |
| Propriétaire | Équipe **et** personne redevable (pas « tout le monde ») |
| SLO | Les objectifs tenus, avec lien vers le suivi (`08-exploitation-observabilite.md`) |
| Runbooks | Liens vers les runbooks d'exploitation et le SECURITY.md |
| Dépendances | Services internes et externes dont il dépend, et qui dépendent de lui |
| Environnements | URLs, version de template, statut EOL des briques (`13-vie-du-produit-mco.md` §5) |

- Un service **absent du catalogue n'existe pas** pour l'astreinte, l'audit et la gestion de crise — c'est un finding.
- Le catalogue répond en pratique aux questions de crise : « qui possède X ? », « qui est impacté si X tombe ? », « où est le runbook ? ». S'il ne peut pas y répondre en moins de 5 minutes, il est défaillant.
- La revue du catalogue (propriétaires valides, liens vivants, dépendances à jour) fait partie de l'auto-audit trimestriel.

## 4. Conformité automatisée (policy-as-code)

- Toute règle du corpus **vérifiable par machine doit l'être en CI** : une règle vérifiée automatiquement à chaque PR ne consomme plus d'attention humaine et ne se dégrade pas. La revue humaine se réserve pour ce que la machine ne voit pas (sens, sécurité de conception, données).
- Les politiques sont exprimées en **policy-as-code** (OPA/Conftest, Kyverno, ou équivalent de l'écosystème — `09-toolchain.md`) : versionnées, testées, revues comme du code. Une politique dans un wiki n'est pas une politique.
- Les **vérifications de la matrice d'adoption sont générées par la CI quand c'est possible** : statut de la protection de branche, présence du SBOM, épinglage SHA, couverture, en-têtes de sécurité… La CI produit la preuve datée et son lien, la matrice la référence. Chaque contrôle `ACS-*` automatisable qui ne l'est pas encore est une ligne du backlog plateforme, pas un état de fait.
- L'automatisation **ne remplace jamais** les contrôles exigeant un jugement humain (revue sécurité des zones sensibles, threat model, décisions de dérogation) : elle libère du temps pour eux.

## 5. Métriques d'adoption des golden paths

Suivies par l'équipe plateforme, revues au moins trimestriellement :

| Métrique | Signal |
|---|---|
| % de dépôts actifs issus d'un template | Couverture du golden path |
| % de dépôts à jour de la dernière version majeure de template | Efficacité de la propagation |
| Délai « création de dépôt → premier déploiement conforme » | Friction réelle du chemin conforme |
| Nombre d'ADR d'écart au golden path, par motif | Où le template ne répond pas au besoin |
| % de contrôles de la matrice à preuve générée automatiquement | Progression de la conformité automatisée |

Une adoption qui stagne est un signal **produit**, pas un problème de discipline : le golden path se corrige comme un produit, à partir des frictions constatées. Les métriques et leur tendance alimentent la revue annuelle du standard.

## 6. Preuves attendues (audit)

| Preuve | Vérifiée par |
|---|---|
| Nouveau dépôt du trimestre issu d'un template (marquage de version présent) ou ADR d'écart | Auto-audit trimestriel |
| Changelog des templates + PR de propagation sur les dépôts existants | Auto-audit trimestriel |
| Catalogue : échantillon de services avec propriétaire joignable et runbook accessible | Auto-audit trimestriel |
| Policies versionnées + logs CI des vérifications automatisées | Revue de porte |
| Métriques d'adoption datées, avec tendance vs trimestre précédent | Revue trimestrielle plateforme |
