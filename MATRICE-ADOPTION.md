# Matrice d'adoption du standard — outil d'audit par projet

> À copier dans le dépôt du projet (`/docs/matrice-adoption.md`), remplie à J3 (fondations) puis **revalidée à chaque porte**. C'est l'outil de collecte des preuves : un contrôle sans preuve datée n'est pas conforme. Le détail de chaque contrôle (exigence complète, seuil, référentiels) est dans `16-cartographie-controles-internationaux.md`.

**Projet** : ……… **Responsable technique** : ……… **Date** : ……… **Porte** : J…

**Statuts autorisés** : `conforme` · `partiel` · `non conforme` · `non applicable` (justifiée) · `dérogation ADR` (lien vers l'ADR + date de résorption — reportée dans `17-registre-risques-derogations.md`).

**Règle de passage de porte** : tout [MUST] en `non conforme` ou `partiel` sans dérogation ADR approuvée = critère de non-passage.

## Socle et accès

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-SOC-001 | MFA sur tous les comptes | | | | | |
| ACS-SOC-002 | Aucun accès dev en écriture en prod | | | | | |
| ACS-SOC-003 | Offboarding : révocation ≤ 24 h + rotation | | | | | |

## Code et Git

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-COD-001 | Analyse statique max, zéro erreur | | | | | |
| ACS-COD-002 | Code IA relu et testé comme code humain | | | | | |
| ACS-GIT-001 | `main` protégée sans exception | | | | | |
| ACS-GIT-002 | Scan de secrets pre-commit + CI | | | | | |
| ACS-GIT-003 | Revue sécurité bloquante sur zones sensibles | | | | | |

## Architecture et API

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-ARC-001 | Tests d'architecture bloquants en CI | | | | | |
| ACS-ARC-002 | Outbox obligatoire, schémas versionnés | | | | | |
| ACS-ARC-003 | Migrations expand/contract testées | | | | | |
| ACS-ARC-004 | Audit write-ahead + copie WORM | | | | | |
| ACS-ARC-005 | Défense en profondeur 3 niveaux | | | | | |
| ACS-API-001 | Policies deny-by-default + tests deux sens | | | | | |
| ACS-API-002 | RFC 9457, pagination, idempotence | | | | | |

## Tests et qualité

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-TST-001 | Suite sécurité bloquante (IDOR, RBAC, CSP, MFA) | | | | | |
| ACS-TST-002 | Couverture ≥ objectif + quality-gate | | | | | |
| ACS-TST-003 | Flaky réparé/supprimé ≤ 7 jours | | | | | |
| ACS-TST-004 | Jalon de charge bloquant avant prod | | | | | |

## Sécurité et supply chain

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-SEC-001 | SLA correctifs 72 h / 7 j / 30 j | | | | | |
| ACS-SEC-002 | Exposition CVE répondue < 1 h via SBOM | | | | | |
| ACS-SEC-003 | Threat models versionnés par feature majeure | | | | | |
| ACS-SEC-004 | Argon2id/bcrypt, crypto agility | | | | | |
| ACS-CHN-001 | Processus dépendance complet + quarantaine | | | | | |
| ACS-CHN-002 | SBOM par build, archivé | | | | | |
| ACS-CHN-003 | SHA-pinning + artefacts signés vérifiés | | | | | |

## CI/CD et exploitation

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-CIC-001 | Pipeline 8 étapes bloquantes | | | | | |
| ACS-CIC-002 | IaC exclusive, drift nul | | | | | |
| ACS-CIC-003 | Rollback testé à chaque release majeure | | | | | |
| ACS-EXP-001 | Restauration réelle testée < 30 jours | | | | | |
| ACS-EXP-002 | Supervision hors prod, alerting testé | | | | | |
| ACS-EXP-003 | 100 % des alertes avec runbook | | | | | |
| ACS-EXP-004 | Budget d'erreur appliqué | | | | | |
| ACS-EXP-005 | Postmortems ≤ 5 j, actions suivies | | | | | |

## Données, MCO, IA

| Contrôle | Exigence (résumé) | Statut | Preuve | Lien preuve | Responsable | Prochaine revue |
|---|---|---|---|---|---|---|
| ACS-DON-001 | Schéma 100 % classé | | | | | |
| ACS-DON-002 | Purges de rétention en code, testées | | | | | |
| ACS-DON-003 | Anonymisation hors prod testée | | | | | |
| ACS-DON-004 | Droits des personnes outillés | | | | | |
| ACS-MCO-001 | Inventaire EOL, plans < 6 mois | | | | | |
| ACS-MCO-002 | Export de réversibilité testé < 12 mois | | | | | |
| ACS-IA-001 | Écritures sensibles IA confirmées par un humain | | | | | |
| ACS-IA-002 | Descriptions MCP versionnées et revues | | | | | |

## Prérequis de fondations (à J3, en plus des contrôles)

- [ ] `/docs/toolchain.md` produit (gabarit `10-gabarits.md` §7)
- [ ] 4 environnements en place ; pré-production en données anonymisées exclusivement
- [ ] Secrets servis par coffre-fort ; zéro secret versionné
- [ ] Feature flags opérationnels
- [ ] Critères d'acceptation Given/When/Then exigés à la Definition of Ready

## Dérogations actives

| Contrôle dérogé | ADR | Contrôle compensatoire | Date de résorption | Approbateur |
|---|---|---|---|---|
| | | | | |

*Une dérogation sans ADR approuvée, sans compensatoire et sans date de résorption n'est pas une dérogation : c'est une non-conformité. Le registre complet vit dans `17-registre-risques-derogations.md`.*
