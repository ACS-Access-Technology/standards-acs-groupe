# 07 — CI/CD et chaîne d'approvisionnement

## 1. Pipeline CI/CD — étapes bloquantes, dans l'ordre

1. Lint + formatage
2. Tests unitaires et d'intégration (contre le SGBD réel du projet)
3. Tests d'architecture (contrat de couches/modules)
4. SAST + scan des dépendances + scan des images
5. Génération du SBOM (CycloneDX), conservé en artefact
6. Signature d'artefact/image (cosign ou équivalent)
7. Déploiement pré-production + tests E2E
8. (release) Déploiement progressif en production (bleu/vert ou canary)

Règles :

- **Échec d'une étape = pipeline arrêté.** Pas de re-run pour « faire passer » sans correction ou justification écrite.
- La suite de tests de sécurité s'exécute **en arrêt au premier échec**.
- Actions/plugins CI **épinglés par empreinte SHA**, jamais par tag mobile.
- Le déploiement n'accepte que des **artefacts signés** ; la signature est vérifiée au déploiement.
- **Rollback : une commande, documentée, testée à chaque release majeure.** Si le rollback n'a pas été testé, la release n'est pas prête.

## 1 bis. Intégrité de la chaîne de build (objectif SLSA)

- **Niveau cible : SLSA Build L2 dès les fondations** (build par plateforme CI hébergée, provenance signée générée), **L3 en cible** (build isolé, provenance infalsifiable). Le niveau atteint est déclaré dans la matrice d'adoption.
- **Provenance et attestations** : chaque artefact de release porte une attestation de provenance (qui a construit quoi, depuis quel commit, avec quelles dépendances — SLSA provenance / in-toto) vérifiable au déploiement, en plus de la signature.
- **Builds isolés, runners éphémères** : un job de build ne réutilise jamais l'état d'un job précédent ; les runners sont jetables ; les secrets de build sont à portée minimale et jamais accessibles aux étapes de test de code non revu.
- **Policy-as-code [SHOULD]** : les règles de déploiement (image signée, non-root, registre privé, labels requis, limites de ressources) sont exprimées en politiques exécutables (OPA/Conftest, Kyverno, ou équivalent de la plateforme) — une règle de déploiement qui ne vit que dans un document finit contournée.
- **Rétention des preuves** : SBOM, signatures, attestations et logs de pipeline des releases sont conservés sur la durée de rétention contractuelle (par défaut : la durée de vie de la release + 12 mois) — c'est ce qui rend un incident de supply chain investigable a posteriori.

## 2. Infrastructure as Code — tout, sans exception

- Toute ressource (cluster, réseau, DNS, structure des secrets, alertes, dashboards) est déclarée en code versionné.
- **Une modification à la main en production est un incident, pas un raccourci** — détectée par drift-detection et annulée.
- Revue obligatoire des plans (`terraform plan` / diff Helm) avant apply ; apply uniquement par le pipeline.

## 3. Environnements (quatre, jamais moins)

| Environnement | Règle |
|---|---|
| Développement | Données fictives générées |
| Pré-production | **Exclusivement données anonymisées** ; recettes et tests de charge s'y déroulent |
| Production | Seul environnement avec données réelles ; accès en écriture réservé au pipeline |
| Site de reprise (DR) | Alimenté par réplication ; bascule exercée et chronométrée contre le RTO |

## 4. Secrets

- Injectés à l'exécution depuis un **coffre-fort** (OpenBao/Vault ou équivalent) — jamais dans le code, les images ou les fichiers d'environnement versionnés.
- Rotation automatisée ; expirations (certificats, jetons) alertées à **J-30** — jamais découvertes à l'expiration.

## 5. Orchestration (Kubernetes ou équivalent retenu)

- Durcissement selon le **benchmark CIS** de la plateforme retenue, vérifié en continu.
- Politiques de pods restrictives ; réseau **default-deny** — tout nouveau flux réseau est une PR sur l'IaC avec justification.
- Admission : images signées uniquement, registre privé uniquement ; images minimales, non-root.
- Base de données et cache **jamais exposés hors réseau privé** ; plan de contrôle jamais exposé.
- Capacité : revue mensuelle (CPU/RAM/stockage/connexions base) ; pooling de connexions dimensionné avant tout changement d'auto-scaling.

## 6. Supply chain (résumé opérationnel — détail dans `06-securite-developpeur.md` §5)

Lockfiles commités · audit de dépendances bloquant à chaque build · quarantaine 7 jours des mises à jour non correctrices · SBOM par build · scan Trivy (critique/haute bloquant) · scripts post-install désactivés · SHA-pinning des actions CI.

## 7. Mesure de la chaîne : métriques DORA

Suivies par trimestre, tendance présentée en comité technique — c'est la mesure objective de la santé de la chaîne, pas un jugement individuel :

| Métrique | Ce qu'elle mesure |
|---|---|
| Fréquence de déploiement | Capacité à livrer petit et souvent |
| Lead time (commit → prod) | Fluidité de la chaîne |
| Taux d'échec de changement | Qualité des releases |
| MTTR (temps de rétablissement) | Efficacité de la réponse aux incidents |

Une dégradation de tendance sur deux trimestres déclenche une action en rétrospective.

## 8. Environnements éphémères [SHOULD]

Quand la stack le permet, un environnement de préview par PR (déployé automatiquement, détruit au merge) : la revue se fait sur du réel, pas sur des captures. Données fictives exclusivement.

## Definition of Done — DevOps

DoD commune + : IaC mergée et appliquée par pipeline ; drift nul ; alertes + runbook créés pour tout nouveau composant ; sauvegarde du nouveau composant intégrée au test de restauration ; documentation d'exploitation à jour.
