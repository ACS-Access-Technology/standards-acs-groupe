# 09 — Toolchain : table d'équivalences par écosystème

> Le standard énonce des **fonctions** ; chaque projet retient les **outils** de sa stack et les consigne dans son `/docs/toolchain.md` (produit en début de projet — c'est un livrable, pas une option). Les outils cités sont des exemples canoniques, non exhaustifs.

## 1. Table d'équivalences par langage

| Fonction | PHP | JavaScript / TypeScript | Python | Java / Kotlin | Go | .NET (C#) |
|---|---|---|---|---|---|---|
| Formatage | Pint / PHP-CS-Fixer | Prettier / Biome | Black / Ruff format | ktlint / Spotless | gofmt | dotnet format |
| Lint | PHPCS | ESLint / Biome | Ruff | Detekt / Checkstyle | golangci-lint | Roslyn analyzers |
| Analyse statique / typage | PHPStan, Psalm | tsc strict | mypy / Pyright strict | compilateur + Error Prone | vet + staticcheck | nullable enable + analyzers |
| Tests | Pest / PHPUnit | Vitest / Jest | pytest | JUnit 5 / Kotest | testing + testify | xUnit / NUnit |
| Mutation testing | Infection | Stryker | mutmut / cosmic-ray | Pitest | go-mutesting | Stryker.NET |
| Tests d'architecture | Deptrac | dependency-cruiser | import-linter | ArchUnit | go-arch-lint | ArchUnitNET / NetArchTest |
| Verrouillage dépendances | composer.lock | package-lock / pnpm-lock | uv.lock / poetry.lock | Gradle lockfile | go.sum | packages.lock.json |
| Audit dépendances | composer audit | npm audit / osv-scanner | pip-audit / osv-scanner | OWASP Dep-Check | govulncheck | dotnet list --vulnerable |
| E2E web / mobile | — | Playwright / Cypress | Playwright | Playwright / Selenium | — | Playwright |

## 2. Fonctions indépendantes du langage

| Fonction | Outils canoniques |
|---|---|
| SBOM | Syft, CycloneDX |
| Scan d'images | Trivy, Grype |
| Signature d'artefacts | cosign, Sigstore |
| DAST | OWASP ZAP |
| Secrets | OpenBao / Vault |
| SIEM | Wazuh |
| Observabilité | OpenTelemetry (standard quelle que soit la stack), SigNoz |
| Suivi d'erreurs | Sentry (repli auto-hébergé) |
| Disponibilité | Uptime Kuma |
| Charge | k6, Gatling, Locust |
| Qualité continue | SonarQube / SonarCloud (le service cloud n'analyse que le code, jamais les données) |

## 3. Exigence base de données

L'exigence est **l'isolation vérifiable au niveau du moteur** : RLS PostgreSQL, Row-Level Security SQL Server, politiques Oracle VPD, règles équivalentes MySQL/MariaDB via vues ou proxy. Si le moteur retenu ne sait pas le faire, le dossier d'architecture doit justifier le mécanisme compensatoire.

## 4. Exemple de déclinaison : plateforme PHP/Laravel

| Fonction | Outil retenu | Version minimale de sécurité |
|---|---|---|
| Langage / framework | PHP / Laravel / Livewire | 8.3 / 12.62.0 / 4.3.1 |
| Base de données | PostgreSQL | 16.14 (scram-sha-256 exclusivement) |
| Cache / files / bus | Redis (branche 7.2, BSD ; repli Valkey) | 7.2.14 |
| Formatage / analyse statique | Pint / PHPStan + Larastan (niveau max) | — |
| Tests / architecture | Pest + PHPUnit / Deptrac | — |
| RBAC / MFA / audit | spatie/laravel-permission / pragmarx/google2fa / owen-it/laravel-auditing | 8.0.0 / 9.0.0 / 14.0.4 |
| Exports | PhpWord / maatwebsite-excel / dompdf | — |
| Antivirus uploads | ClamAV (définitions quotidiennes) | — |
| Bordure | NGINX (TLS 1.3, CSP à nonce, HSTS) | 1.25 |
| Supervision | Sentry + SigNoz + Uptime Kuma + Wazuh | — |
| Supply chain | composer audit + npm audit, Trivy, Syft, cosign | — |
| Secrets | OpenBao | — |
| Charge | k6 (usage interne — AGPL sans incidence) | — |
| Orchestration (cible) | Kubernetes 3 nœuds HA, durci CIS, PgBouncer | — |

## 5. Licences — vigilances connues

- **Redis ≥ 7.4** : licences RSALv2/SSPLv1 restrictives — rester en 7.2.x ou basculer sur **Valkey** (BSD-3-Clause, protocole compatible).
- **HashiCorp Vault** : licence BUSL — préférer **OpenBao** (MPL-2.0, fork compatible).
- **k6** : AGPL-3.0 — admis en outil interne uniquement, jamais intégré au produit livré (replis : Gatling, Locust).
- Tout outil absent de l'inventaire du projet doit être **validé par la direction technique avant usage**.

## 6. Critères d'acceptation d'un outil

Tout nouvel outil (bibliothèque structurante, service, SaaS, agent) est évalué contre les critères suivants **avant adoption**, évaluation consignée dans le `/docs/toolchain.md` du projet — un outil adopté sans évaluation se découvre en incident ou en audit :

| Critère | Question à trancher |
|---|---|
| **Licence** | Compatible avec l'usage (interne vs intégré au livrable) ? Risque de changement de licence (précédents Redis, Vault, §5) ? |
| **Souveraineté** | Où tournent le service et ses données ? Sous quelle juridiction ? Compatible avec les exigences du client et du cadre légal local ? |
| **Données traitées** | Quelles données transitent par l'outil (code, secrets, données personnelles, données client) ? Un outil qui voit les données entre au registre des traitements (`15-gouvernance-des-donnees.md`). |
| **Santé du mainteneur** | Projet actif (commits, releases, réponse aux vulnérabilités) ? Un seul mainteneur est un point de défaillance unique. |
| **Cadence de patch** | Les vulnérabilités sont-elles corrigées rapidement ? Historique CVE vérifié. |
| **Plan de sortie** | Comment sort-on de l'outil (format d'export, alternative identifiée, coût de migration estimé) ? Un outil sans porte de sortie est un engagement irréversible pris par défaut. |

- Un critère non satisfaisant n'interdit pas l'adoption mais exige une **décision explicite de la direction technique**, tracée avec le risque accepté.

## 7. OpenSSF Scorecard pour les dépendances critiques [SHOULD]

- Les dépendances open source **critiques** (exposées au réseau, touchant l'authentification/crypto, ou sans remplacement rapide) sont évaluées avec **OpenSSF Scorecard ou équivalent** avant adoption puis au moins annuellement — le score objective la santé du projet au lieu de s'en remettre à sa notoriété.
- Un score en dégradation nette ou un signal grave (dépôt archivé, mainteneur parti, revues absentes) déclenche l'examen du plan de sortie (§6) ; le résultat de l'évaluation est consigné dans le `/docs/toolchain.md`.

## 8. Souveraineté : alternatives self-hosted

- Quand un SaaS est **incompatible avec les exigences de souveraineté** du projet (localisation des données, juridiction, client secteur public), l'équivalent **auto-hébergé prime** — la commodité d'un SaaS ne prévaut jamais sur une exigence de souveraineté contractuelle ou légale.
- Replis canoniques déjà admis par ce corpus : Sentry auto-hébergé, SigNoz, Uptime Kuma, Wazuh, OpenBao, SonarQube ; toute fonction de la table §2 doit avoir un repli auto-hébergeable identifié dans le `/docs/toolchain.md` du projet.
- Le choix SaaS vs self-hosted est un choix d'architecture : il se trace en ADR avec les données traitées (§6) et le coût d'exploitation honnêtement estimé (`08-exploitation-observabilite.md` §8).
