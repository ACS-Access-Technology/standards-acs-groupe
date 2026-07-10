# 13 — Vie du produit et MCO (vue développeur)

> La mise en production n'est pas la fin du projet, c'est le début du service. Ce document donne à l'équipe de développement ce qu'elle doit savoir de l'exploitation ; le manuel MCO complet régit le service côté exploitant.

## 1. Entrée en MCO : l'exploitation peut dire non

L'exploitation **refuse** le transfert tant que ne sont pas livrés et vérifiés : documentation d'exploitation (architecture réelle, runbooks, procédures de sauvegarde/restauration/bascule), supervision active avec alerting **testé de bout en bout**, restauration réussie datée de moins de 30 jours, inventaire des comptes au moindre privilège, registre des dérogations et dettes avec dates de résorption, formation du client réalisée.

## 2. Versionnage et releases

- **SemVer** : MAJEUR (rupture), MINEUR (fonctionnalité compatible), CORRECTIF. La rupture de contrat d'API ou d'événement sans incrément majeur est une faute.
- **Notes de version lisibles par le client** à chaque release — générées depuis les Conventional Commits puis relues (le générateur produit la matière, pas le livrable).
- Tags de release signés ; l'artefact déployé correspond au tag (vérifiable par signature).

## 3. Changements en production : trois circuits, jamais mélangés

| Type | Exemples | Circuit |
|---|---|---|
| **Standard** (pré-approuvé) | Correctif mineur derrière feature flag, ajout d'utilisateur, patch OS validé | Automatisé par le pipeline, tracé, sans approbation à chaque fois |
| **Normal** | Évolution fonctionnelle, montée de version majeure d'un composant | Instruction écrite (impact, tests, rollback), validation responsable technique, fenêtre annoncée |
| **Urgent** | Correctif de sécurité critique (SLA ≤ 72 h) | Procédure accélérée avec revue a posteriori sous 5 jours — **l'urgence ne supprime jamais la trace** |

Invariants : tout changement passe par le pipeline (une modification manuelle en production est un **incident**) ; rollback testé disponible ; migrations expand/contract uniquement.

## 4. Incidents, demandes, problèmes (trois flux distincts)

- **Incident** (service dégradé) : priorité au rétablissement, pas au diagnostic complet — runbook, contournement, communication, puis postmortem sans blâme pour les majeurs.
- **Demande de service** (accès, export, paramétrage) : catalogue avec délai annoncé ; le répétitif sans risque est automatisé.
- **Problème** (cause racine d'incidents récurrents) : ouvert dès qu'un incident se répète ; propriétaire et échéance obligatoires — sinon les mêmes incidents reviennent chaque mois.

## 5. Gestion du vieillissement (EOL)

- Inventaire des versions de **tous** les composants avec leurs dates de fin de support, tenu à jour (le SBOM en est la source).
- **Toute brique à moins de 6 mois de son EOL a un plan de montée de version planifié** — on ne découvre jamais une fin de support dans un bulletin de vulnérabilité.
- Certificats, clés, secrets : rotation automatisée, alerte à J-30 avant toute expiration.
- Le registre des dérogations est revu trimestriellement ; une dérogation sans date de résorption tenue devient un risque au rapport de service.

## 6. SLA et pilotage par les chiffres

- SLA écrits et **tenables** (jamais promis au-delà de la capacité réelle) ; SLO internes plus stricts que les SLA externes (marge).
- Rapport de service mensuel au client, une page : disponibilité mesurée vs cible, incidents par sévérité avec délais tenus/non tenus, correctifs de sécurité appliqués vs SLA, capacité, risques. **Chiffres extraits de la supervision, recalculables, jamais estimés.**

## 7. Migration de données entrante (remplacement d'un existant)

Cartographie source→cible ; règles de transformation écrites et testées ; **répétition générale complète** sur données réelles anonymisées, chronométrée ; critères d'acceptation (comptages, échantillons vérifiés par le métier) ; bascule avec **point de non-retour explicite** et plan de retour arrière avant ce point ; ancien système gelé en lecture seule pendant la vérification.

## 8. Réversibilité et fin de vie

- **Réversibilité permanente** : le client peut récupérer l'intégralité de ses données en format ouvert documenté, à tout moment ; la procédure d'export complet est **testée une fois par an** — une réversibilité non testée n'existe pas.
- Fin de vie : export final vérifié, purge certifiée conforme aux rétentions légales, révocation des accès, archivage de la piste d'audit sur sa durée légale, PV de fin de service.

## 9. Catalogue de service et calendrier de changement

- Chaque plateforme en MCO a un **catalogue de service écrit** : liste des demandes de service disponibles (accès, export, paramétrage, restauration ponctuelle…), avec pour chacune le délai annoncé, le circuit (automatisé ou manuel) et les préconditions — sans catalogue, chaque demande se négocie au cas par cas et les délais ne s'engagent sur rien.
- Le répétitif sans risque du catalogue est automatisé (§4) ; une demande hors catalogue est instruite comme un changement, pas exécutée « pour rendre service ».
- Un **calendrier de changement** est tenu et partagé avec le client : fenêtres de maintenance récurrentes annoncées, gels convenus (périodes critiques métier), changements normaux planifiés visibles — un changement dont le client découvre la fenêtre en subissant l'indisponibilité est un défaut de service, même réussi techniquement.

## 10. Critères d'acceptation opérationnelle

- Les critères d'entrée en MCO (§1) sont formalisés dans une **fiche d'acceptation opérationnelle** (gabarit dans `10-gabarits.md`), instruite par l'exploitation et signée avant le transfert — une acceptation orale n'engage personne et se conteste au premier incident.
- La fiche liste chaque critère du §1 avec sa preuve datée (lien runbook, compte rendu de restauration < 30 jours, test d'alerte de bout en bout, inventaire des comptes, registre des dérogations, attestation de formation).
- Tout critère non tenu au transfert suit le régime des dérogations : ADR, date de résorption, approbateur humain — jamais d'acceptation « sous réserve » sans plan daté.

## 11. Plan de capacité et revue mensuelle de service

- Chaque plateforme a un **plan de capacité écrit** : ressources actuelles (stockage, calcul, connexions, files), tendance de croissance mesurée, seuils d'alerte, et date estimée d'atteinte des limites — la saturation se planifie sur des courbes, elle ne se découvre pas en incident.
- Une **revue mensuelle de service** examine : SLA/SLO tenus vs cibles, incidents et demandes du mois, capacité et tendance, dérogations et dettes en cours, coûts (jointe à la revue SRE/FinOps, `08-exploitation-observabilite.md` §13) ; décisions consignées avec propriétaire et date.
- Le rapport de service mensuel au client (§6) est une **sortie** de cette revue, pas un document rédigé à part : mêmes chiffres, même source de supervision.

## 12. Communication incident au client

La communication client pendant un incident est un rôle nommé, pas un réflexe (`08-exploitation-observabilite.md` §11) — un client informé par ses propres utilisateurs avant de l'être par nous perd confiance plus sûrement que par l'incident lui-même :

| Question | Règle |
|---|---|
| **Qui informe** | Le rôle « communication client » désigné à l'ouverture (chef de projet par défaut) — jamais l'incident commander, qui pilote la résolution. |
| **Quand** | Premier message dans le délai contractuel dès qualification de l'impact ; puis à la cadence annoncée dans ce premier message, tenue même sans nouveauté (« pas de progrès » est une information). |
| **Quoi** | Impact constaté côté client, périmètre touché, action en cours, prochaine échéance de communication — jamais de spéculation sur la cause avant analyse. |
| **Avec quelles preuves** | Chronologie horodatée du scribe, chiffres extraits de la supervision (jamais estimés, §6) ; le postmortem des incidents majeurs est partagé au client dans la version convenue contractuellement. |

- Chaque communication envoyée est archivée avec l'incident : elle fait partie des preuves du rapport de service et des engagements de délais tenus/non tenus.

## 13. Fin de vie : plan daté (complète §8)

- La fin de vie d'une plateforme s'exécute selon un **plan écrit et daté**, établi dès la notification de fin de service et validé par le client — une fin de vie improvisée produit des données perdues, des accès orphelins et des obligations légales non tenues.
- Le plan fixe des dates pour chaque étape du §8 : export final et vérification par le client, gel en lecture seule, purge certifiée par périmètre de rétention, révocation de la totalité des accès (rapprochée du registre des accès), archivage de la piste d'audit, PV de fin de service.
- Chaque étape produit sa preuve datée (PV d'export vérifié, certificat de purge, extrait du registre des accès à zéro) archivée dans l'evidence log — le PV de fin de service ne se signe que preuves complètes.
- Jalons de suivi : le plan est revu à chaque revue mensuelle de service (§11) jusqu'à exécution complète ; un glissement de date se traite comme un risque, pas comme un report silencieux.
