# 10 — Gabarits

> À adapter, jamais à copier tel quel. Chaque gabarit rempli vit dans le dépôt du projet (`/docs/adr/`, `/docs/runbooks/`, etc.).

## 1. ADR — Architecture Decision Record (10 lignes max)

```markdown
# ADR-NNN — <Titre de la décision>

- **Contexte** : <le problème, en 1-2 phrases>
- **Décision** : <ce qui est décidé>
- **Alternatives écartées** : <option A (pourquoi non), option B (pourquoi non)>
- **Conséquences** : <effets, dont coûts récurrents>
- **Statut / date / approbateur** : <proposée|acceptée|remplacée> / <date> / <responsable technique>
```

## 2. Runbook d'alerte

```markdown
# Runbook — <nom de l'alerte>

1. **Symptôme observable** : <ce que voit l'opérateur>
2. **Gravité** : <S1|S2|S3> — <impact utilisateur>
3. **Diagnostic** : <commandes exactes, dans l'ordre>
4. **Remédiation** : <étapes exactes>
5. **Vérification du retour à la normale** : <quoi contrôler>
6. **Escalade** : <qui, à partir de quand>
```

## 3. Postmortem (sans blâme, sous 5 jours ouvrés)

```markdown
# Postmortem — <incident> — <date>

- **Résumé** (2 phrases)
- **Impact chiffré** : <utilisateurs, durée, données>
- **Chronologie horodatée** : <détection → mitigation → résolution>
- **Causes** : <technique + processus>
- **Ce qui a bien fonctionné**
- **Actions correctives** : <datées, assignées — prioritaires sur le backlog>
- **Leçons pour le standard** : <à reverser dans le corpus ACS>
```

## 4. Rapport d'anomalie (QA)

```markdown
# ANO-NNN — <titre factuel>

- **Étapes de reproduction** : <exactes, numérotées>
- **Résultat obtenu** : … / **Résultat attendu** : …
- **Environnement / version** : <pré-prod, build #>
- **Preuve** : <capture, log>
- **Sévérité proposée** : <bloquante|majeure|mineure|cosmétique>
```

## 5. SECURITY.md (structure imposée — manuel dédié pour le détail)

Sections, dans cet ordre : Notre engagement · Signaler une vulnérabilité (canal + clé PGP avec empreinte) · Ce à quoi vous pouvez vous attendre (SLA réels validés) · Périmètre (in/out) · Règles d'engagement (autorisé/interdit) · Safe harbor (conforme au droit local) · Divulgation coordonnée (90 jours par défaut) · Versions supportées · Remerciements · Métadonnées (dernière révision, prochaine ≤ 12 mois).

```markdown
# Security Policy / Politique de sécurité

## Our commitment
The security of our users and their data is a top priority. We welcome
good-faith security research and are committed to working with the
community to verify and address vulnerabilities responsibly.

## Reporting a vulnerability
- **Email**: security@<domain> — PGP key: <link>, fingerprint: `XXXX XXXX …`
- **Backup channel**: <form / platform program URL>
- Please include: description, steps to reproduce, estimated impact,
  affected URLs or versions. Reports accepted in English and French.
- Please do NOT open public issues for security reports.

## What to expect
| Step | Commitment |
|---|---|
| Acknowledgement | within 3 business days |
| Triage & severity (CVSS) | within 10 business days |
| Status updates | at least every 10 business days |
| Fix target | critical ≤ 30 days · high ≤ 60 days · others ≤ 90 days |
| Credit | offered at fix publication (opt-in) |

## Scope
**In scope**: <main domains>, <mobile apps>, <public APIs (/v1)>.
**Out of scope**: third-party services, hosting provider infrastructure,
demo/test environments, findings from automated scanners without a
demonstrated impact.

## Rules of engagement
Allowed: non-destructive testing, use of your own test accounts.
Not allowed: denial of service, social engineering, physical attacks,
spam, accessing or exfiltrating real user data, modifying data,
pivoting to other systems. If you encounter real personal data, stop
immediately and report it.

## Safe harbor
We will not pursue legal action against researchers who act in good
faith, within this policy and applicable law. <Adapter au droit local.>

## Coordinated disclosure
We ask for 90 days before public disclosure; extensions by mutual
agreement.

## Supported versions
| Version | Supported until | Security fixes |
|---|---|---|
| <x.y> | <date> | ✅ |

## Acknowledgements
We thank the researchers listed in our [Hall of Fame](<link>).

_Last reviewed: <date>. Next review: <date>._
```

Règles de fond : 1-2 pages ; chaque engagement daté et mesurable (« sous 3 jours ouvrés », pas « rapidement ») ; jamais d'information exploitable (architecture interne, versions, noms de personnes) ; le canal de signalement est **testé réellement** avant publication ; les SLA publiés sont validés par l'humain responsable.

## 6. security.txt (RFC 9116)

```
Contact: mailto:security@<domain>
Expires: <date ISO 8601, < 1 an>
Encryption: https://<domain>/pgp-key.txt
Acknowledgments: https://<domain>/security/hall-of-fame
Preferred-Languages: en, fr
Canonical: https://<domain>/.well-known/security.txt
Policy: https://<domain>/security
```

À signer en clair (PGP) et à servir en HTTPS sous `/.well-known/security.txt`. Cohérent en substance avec le SECURITY.md (qui est la source).

## 7. `/docs/toolchain.md` du projet (déclinaison de la table d'équivalences)

```markdown
# Toolchain — <projet>

| | |
|---|---|
| **Stack** | <langage/framework/SGBD/infra> |
| **Validé par** | <responsable technique> le <date> |

| Fonction | Outil retenu | Version min. | Bloquant en CI ? | Justification (1 phrase) |
|---|---|---|---|---|
| Formatage | | | oui | |
| Lint | | | oui | |
| Analyse statique / typage | | | oui | |
| Tests | | | oui | |
| Tests d'architecture | | | oui | |
| Mutation testing | | | ciblé | |
| Audit dépendances | | | oui | |
| Scan de secrets (pre-commit + CI) | | | oui | |
| SBOM | | | oui | |
| Scan images / SAST | | | oui | |
| Signature d'artefacts | | | oui | |
| E2E | | | oui | |
| Charge | | | jalon | |
| Observabilité / erreurs / SIEM | | | — | |
| Coffre-fort de secrets | | | — | |
| Isolation moteur BDD | | | — | <RLS ou mécanisme compensatoire justifié> |

Tout outil absent de cette liste doit être validé par la direction technique
avant usage. Licences restrictives signalées avec plan de repli.
```

## 8. Threat model léger (STRIDE, 30 minutes — `/docs/threat-models/<feature>.md`)

Produit **avant** le développement de toute fonctionnalité majeure ou nouveau flux de données (`06-securite-developpeur.md` §2), lié depuis la PR.

```markdown
# Threat model — <fonctionnalité> — <date>

- **Périmètre** : <ce qui est couvert, en 1-2 phrases>
- **Diagramme de flux** : <lien vers le data-flow, trust boundaries incluses>
- **Actifs à protéger** : <données/fonctions et leur classification>

| Menace (STRIDE) | Scénario concret | Contrôle existant/prévu | Reste à faire (ticket) |
|---|---|---|---|
| Spoofing | | | |
| Tampering | | | |
| Repudiation | | | |
| Information disclosure | | | |
| Denial of service | | | |
| Elevation of privilege | | | |

- **Risques acceptés** : <lesquels, pourquoi, approuvés par qui>
- **Prochaine revue** : <au changement de périmètre de la fonctionnalité>
```

## 9. Registre des risques (`/docs/registre-risques.md`, revu à chaque COPIL)

Un risque sans propriétaire ni échéance est une inquiétude, pas un risque géré.

```markdown
| ID | Risque (cause → effet) | Prob. (1-3) | Impact (1-3) | Score | Réponse (éviter/réduire/transférer/accepter) | Action + propriétaire | Échéance | Statut |
|---|---|---|---|---|---|---|---|---|
| RSK-001 | | | | | | | | ouvert |
```

## 10. Registre des dérogations (`/docs/registre-derogations.md`)

Toute dérogation à un MUST du corpus y figure — une exception non tracée est une non-conformité, une exception répétée est un sujet de refonte du standard.

```markdown
| ID | Contrôle dérogé (ACS-XXX-NNN) | Justification | Contrôle compensatoire | ADR | Approbateur humain | Date de résorption | Statut |
|---|---|---|---|---|---|---|---|
| DER-001 | | | | ADR-NNN | | | active |
```

## 11. Evidence log d'audit (`/docs/audit/evidence-log-<periode>.md`)

Collecté au fil de l'eau, pas reconstruit la veille de l'audit — une preuve reconstituée a posteriori n'en est pas une.

```markdown
| Contrôle | Preuve attendue | Preuve fournie | Lien (CI, ticket, artefact) | Date de la preuve | Collectée par | Verdict |
|---|---|---|---|---|---|---|
| ACS-SEC-001 | | | | | | conforme |
```

## 12. Checklist PR (gabarit de description — `.github/PULL_REQUEST_TEMPLATE.md` ou équivalent)

```markdown
## Quoi / pourquoi
<1-3 phrases ; lien vers le ticket>

## Labels de risque
- [ ] sécurité — [ ] migration — [ ] API publique — [ ] données personnelles — [ ] infra — [ ] IA/MCP
(chaque case cochée déclenche la revue renforcée correspondante, `03-workflow-git-revues.md`)

## Auto-vérification (bloquant)
- [ ] Tests ajoutés/adaptés couvrant le comportement (pas les lignes)
- [ ] Migration expand/contract + testée sur dump si schéma touché
- [ ] Contrat OpenAPI/événement versionné si contrat touché
- [ ] Threat model mis à jour si nouveau flux de données
- [ ] Diagrammes C4/data-flow et registre des dépendances à jour si architecture touchée
- [ ] Logs/métriques/traces livrés dans cette PR pour tout nouveau chemin de code
- [ ] Aucun secret, aucune donnée réelle dans le diff
- [ ] Code généré par IA relu et assumé par l'auteur du merge
```

## 13. Release plan (`/docs/releases/release-<version>.md`)

```markdown
# Release <version> — <date cible>

- **Contenu** : <PR/tickets inclus ; changements de schéma ; flags impactés>
- **Prérequis** : <migrations, variables, dépendances, ordre d'exécution>
- **Fenêtre + impact** : <date/heure, interruption attendue, qui est prévenu>
- **Déroulé** : <étapes exactes, exécutant par étape>
- **Vérifications post-déploiement** : <checks santé, parcours critique, métriques à surveiller 24 h>
- **Critères de rollback** : <seuils objectifs qui déclenchent le retour arrière — décidés AVANT, pas à chaud>
- **Rollback** : <lien vers le rollback plan §14>
- **Go/No-Go** : <responsable humain qui prononce le go, preuves exigées>
```

## 14. Rollback plan (annexé au release plan, testé en pré-production avant release majeure)

```markdown
# Rollback — release <version>

- **Déclencheurs** : <seuils objectifs : taux d'erreur, latence, échec du parcours critique>
- **Décideur** : <rôle habilité à déclencher, joignable pendant la fenêtre>
- **Procédure applicative** : <commande(s) exacte(s) de retour à <version-1>>
- **Données** : <réversibilité expand/contract ; ce qui n'est PAS réversible et le plan associé>
- **Durée estimée** : <mesurée lors du test en pré-production, pas devinée>
- **Vérification post-rollback** : <quoi contrôler pour déclarer le retour à la normale>
- **Test** : exécuté le <date> en pré-production — <lien preuve>
```

## 15. Revue d'architecture (avant développement d'un module majeur, puis à chaque changement structurant)

```markdown
# Revue d'architecture — <module/projet> — <date>

- **Participants** : <dont au moins un pair extérieur à l'équipe>
- **Supports examinés** : C4 1-3, data-flow + trust boundaries, ADR, registre des dépendances externes
- **Points de contrôle** : couches/frontières (04 §1-2) · outbox/événements (04 §3) ·
  migrations (04 §4) · deny-by-default (04 §5) · audit write-ahead (04 §6) ·
  défense en profondeur (04 §7) · résilience/modes dégradés (04 §9, §15) ·
  multi-tenant si applicable (04 §14) · exigences non fonctionnelles chiffrées
- **Écarts identifiés** : <chacun → ticket ou ADR de dérogation, jamais « noté »>
- **Verdict** : <approuvé | approuvé avec réserves datées | refusé> — <approbateur humain>
```

## 16. Fiche DPIA/PIA — analyse d'impact données personnelles (`/docs/dpia/<traitement>.md`)

Déclenchée selon `15-gouvernance-des-donnees.md` §12 ; le juriste/DPO valide, l'équipe technique documente.

```markdown
# DPIA — <traitement> — <date>

- **Traitement** : <finalité, personnes concernées, données (classes du §1), volumes>
- **Base légale** : <consentement | contrat | obligation légale | intérêt légitime…>
- **Flux** : <lien data-flow ; localisation ; sous-traitants ; transferts transfrontaliers>
- **Nécessité/proportionnalité** : <minimisation, rétention, alternatives écartées>

| Risque pour les personnes | Gravité | Probabilité | Mesures (existantes + prévues) | Risque résiduel |
|---|---|---|---|---|
| Accès illégitime | | | | |
| Modification non désirée | | | | |
| Disparition des données | | | | |

- **Avis DPO/juriste** : <favorable | favorable avec conditions | consultation autorité requise>
- **Décision du responsable de traitement** : <nom, date>
- **Revue** : <au changement de périmètre du traitement, sinon annuelle>
```

## 17. Fiche d'acceptation opérationnelle MCO (avant transfert en exploitation — `13-vie-du-produit-mco.md`)

Rien ne passe en MCO sans cette fiche signée : l'exploitation refuse un service qu'elle ne sait pas opérer.

```markdown
# Acceptation opérationnelle — <service> — <date>

| Critère | Preuve (lien) | OK |
|---|---|---|
| Supervision : SLI/SLO définis, dashboards en place | | ☐ |
| Chaque alerte a son runbook testé | | ☐ |
| Sauvegardes 3-2-1 actives + restauration testée (date) | | ☐ |
| Rollback testé sur la dernière release | | ☐ |
| Modes dégradés des dépendances externes documentés | | ☐ |
| Astreinte/escalade : rôles, contacts, horaires | | ☐ |
| Documentation d'exploitation à jour (accès, jobs, purges) | | ☐ |
| Inventaire EOL initialisé, matrice d'adoption à jour | | ☐ |
| Registre des dérogations vide ou daté | | ☐ |

- **Réserves** : <datées, avec propriétaire>
- **Verdict** : <accepté | refusé> — <responsable exploitation> / <responsable projet>
```

