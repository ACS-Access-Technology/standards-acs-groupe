# 17 — Registre des risques et dérogations

> Chaque projet tient un registre **vivant** de ses risques et de ses dérogations, versionné dans le dépôt (`/docs/registres/risques.md` et `/docs/registres/derogations.md`). Ce registre n'est pas un document d'ouverture de projet qu'on remplit une fois : il est alimenté en continu, revu à chaque comité, et confronté aux preuves. Un risque que personne ne relit est un risque qu'on a accepté sans le dire.

## 1. Risque ou dérogation ? Ne pas confondre

| | Risque | Dérogation |
|---|---|---|
| **Nature** | Un événement **incertain** qui, s'il survient, dégrade le projet ou la plateforme (délai, sécurité, données, réputation) | Un écart **certain et volontaire** à un contrôle `ACS-*` ou à un [MUST] du corpus |
| **Déclencheur** | Identification en atelier, auto-audit, postmortem, veille, changement de contexte | Impossibilité assumée de satisfaire un contrôle, ici et maintenant |
| **Exige** | Un propriétaire + un plan de traitement daté | Une ADR approuvée + un contrôle compensatoire + une date de résorption + un approbateur humain |
| **Vit dans** | Table des risques (§2) | Table des dérogations (§3) |

Une dérogation **génère toujours** une entrée de risque associée si l'écart expose la plateforme (le contrôle non tenu ne protège plus). L'inverse n'est pas vrai : un risque n'est pas une autorisation d'écart.

## 2. Table des risques (gabarit)

| ID | Description (cause → événement → conséquence) | Probabilité (1–4) | Impact (1–4) | Criticité (P×I) | Propriétaire | Plan de traitement | Échéance du plan | Date de revue |
|---|---|---|---|---|---|---|---|---|
| RSK-001 | | | | | | Éviter / Réduire / Transférer / Accepter + actions concrètes | | |

Règles de tenue :

- **Un ID stable par risque** (`RSK-NNN`), jamais réutilisé. Un risque clos reste dans le registre avec son statut et sa date de clôture.
- La description suit la forme **cause → événement → conséquence** (« parce que X, il peut arriver Y, ce qui provoquerait Z »). « Risque sécurité » n'est pas une description.
- **Probabilité × impact** sur une échelle 1–4 chacun. Criticité ≥ 9 : traitement prioritaire, visible au COPROJ. La grille exacte se fixe au cadrage — la règle d'existence d'une grille est universelle.
- Le **plan de traitement** choisit explicitement l'une des quatre stratégies : **éviter** (supprimer la cause), **réduire** (probabilité ou impact), **transférer** (assurance, contrat, sous-traitant), **accepter** (décision tracée d'un responsable habilité). « On surveille » n'est aucune des quatre.
- Chaque risque a **un propriétaire nommé** (une personne, pas une équipe) et **une date de revue**. À la date de revue : réévaluer probabilité, impact et avancement du plan.
- **Accepter** un risque de criticité ≥ 9 exige une validation au niveau COPROJ, tracée.

## 3. Table des dérogations (gabarit)

| ID | Contrôle dérogé (`ACS-*`) | ADR (lien) | Motif (une phrase) | Contrôle compensatoire | Date de résorption | Approbateur humain | Statut |
|---|---|---|---|---|---|---|---|
| DER-001 | | | | | | | active / résorbée / expirée |

Règles de tenue :

- Une dérogation référence **toujours** un contrôle identifié de `16-cartographie-controles-internationaux.md` (ou la section précise du document dérogé si le contrôle n'a pas encore d'ID — ce qui est en soi un sujet pour le registre des contrôles).
- **Pas d'ADR, pas de dérogation.** L'ADR expose le contexte, les options écartées et les conséquences assumées (gabarit dans `10-gabarits.md`).
- Le **contrôle compensatoire** est obligatoire et vérifiable : il décrit ce qui protège la plateforme *pendant* la dérogation, avec sa propre preuve. « Vigilance renforcée » n'est pas un contrôle compensatoire.
- La **date de résorption** est une date, pas une condition (« quand on aura le temps » est refusé). Elle est au plus à la **prochaine porte du projet** ou à 6 mois, le plus proche des deux ; au-delà, la dérogation doit être re-approuvée explicitement.
- L'**approbateur est un humain** habilité (responsable technique ou au-dessus, selon la criticité du contrôle). Un agent IA ne valide jamais une dérogation (`19-gouvernance-ia-et-agents.md`).
- La dérogation est reportée dans la `MATRICE-ADOPTION.md` du projet avec le statut `dérogation ADR`.

## 4. Règles de vie du registre

- **Un risque sans plan daté est un vœu.** Toute ligne de la table des risques sans plan de traitement ni échéance est un écart d'auto-audit, pas une ligne de registre.
- **Une dérogation expirée devient une non-conformité signalée.** Le jour où la date de résorption est dépassée sans résorption ni re-approbation, le contrôle passe `non conforme` dans la matrice d'adoption, un ticket est ouvert avec la sévérité du contrôle sous-jacent, et le fait est signalé au COPROJ suivant — pas silencieusement reconduit.
- **Revue à chaque COPROJ et à chaque comité sécurité** : les risques de criticité ≥ 9, les dérogations actives et toute dérogation approchant de sa date de résorption (< 30 jours) sont passés en revue nominativement. Le compte rendu du comité mentionne le registre — un comité qui ne l'a pas ouvert ne l'a pas revu.
- **Alimentation obligatoire** : chaque écart constaté par l'auto-audit (`14-auto-audit.md`) et chaque action issue d'un postmortem (`08-exploitation-observabilite.md` §5) qui n'est pas corrigée immédiatement entre au registre — comme risque ou comme dérogation selon sa nature (§1). Un finding d'audit qui disparaît sans entrer au registre ni être corrigé est une falsification de fait.
- Le registre est **versionné** : chaque modification est un commit, l'historique fait preuve. Une exception qui se répète d'un projet à l'autre remonte au responsable du standard : c'est un sujet de refonte du corpus, pas une dérogation de plus.

## 5. Preuves attendues (audit)

| Preuve | Vérifiée par |
|---|---|
| Registres présents, versionnés, avec historique de commits sur le trimestre | Auto-audit trimestriel |
| Aucune ligne de risque sans propriétaire, plan et date | Auto-audit trimestriel |
| Aucune dérogation expirée non signalée | Auto-audit trimestriel + revue de porte |
| Comptes rendus de COPROJ/comité sécurité mentionnant la revue du registre | Revue de porte |
| Chaque finding d'auto-audit non corrigé tracé au registre | Revue croisée (doc 14) |
