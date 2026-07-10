# 12 — Cycle de vie projet et jalons (vue développeur)

> Ce que tout membre de l'équipe doit savoir du pilotage : quand a-t-on le droit de commencer quoi, et ce qui conditionne le passage de chaque porte. Le pilotage complet relève du chef de projet (manuel ACS gestion-projet).

## 1. Principe : des portes, pas des pourcentages

Le projet se pilote **par la valeur et les résultats, pas par l'avancement d'activités** : « 80 % du code écrit » n'est pas un statut ; « le parcours critique X est recettable » en est un. Chaque jalon est une **porte** avec critères d'entrée/sortie objectifs : le livrable validé d'une étape est l'**entrée obligatoire** de la suivante.

| Jalon | Livrable de sortie | Critère de passage |
|---|---|---|
| J0 — Lancement | Note de lancement (business case, gouvernance, périmètre) | Validée par le sponsor |
| J1 — Fonctionnel | Dossier d'architecture fonctionnelle | Validation métier client écrite |
| J2 — Technique | Dossier d'architecture technique | Checklist passée ; veille sécurité fraîche ; validation responsable technique |
| J3 — Fondations | Socle exécutable (CI/CD, environnements, squelette modulaire) | Pipeline 8 étapes vert ; règles d'architecture vérifiées au build |
| J4..n — Incréments | Modules livrés par lots | Definition of Done ; démo client ; tests du lot verts |
| J(n+1) — Recette | PV de recette signé | 0 anomalie bloquante/majeure ; critères de sortie atteints |
| J(n+2) — Production | Plateforme en prod + SECURITY.md publié | Checklist de déploiement ; supervision active ; tests de charge tenus |
| J(n+3) — Clôture | Bilan + bascule en MCO | Transfert accepté par l'exploitation ; leçons reversées au standard |

**Conséquences pour le développeur :**

- Pas de développement sans dossier technique validé (J2). Si on te demande de coder avant, signale le risque en une phrase, puis trace la décision.
- **On ne franchit pas une porte avec des critères non tenus** — on documente l'écart et le sponsor décide en connaissance de cause (dérogation écrite avec plan de résorption), ou on ne passe pas.
- Le périmètre validé d'une porte franchie est **gelé** : un changement qui rouvre une porte franchie repasse par elle.

## 2. Definition of Ready d'un ticket (avant de coder)

Un ticket n'entre pas en développement tant qu'il n'a pas :

- [ ] Des **critères d'acceptation testables** au format Given/When/Then — écrits AVANT le développement ; un critère non testable retourne à la spécification.
- [ ] Son rattachement à un module et à un jalon.
- [ ] Ses impacts identifiés : contrat d'API touché ? événement touché ? migration ? permission nouvelle ?
- [ ] Sa taille compatible avec une PR < 400 lignes (sinon, découpé).

## 3. Changements de périmètre

1. Toute demande de changement est **écrite** : quoi, pourquoi, valeur attendue.
2. Instruction sous 5 jours ouvrés : impact délai / coût / risques / dette, alternatives (dont différer en V2).
3. Proportionnalité : mineur sans impact jalon → chef de projet décide et trace ; majeur → comité de pilotage avec instruction écrite.
4. Un développeur n'accepte jamais un changement de périmètre « à l'oral » — il le route vers ce circuit. C'est une protection, pas de la bureaucratie.

## 4. Registres (ce qui protège l'équipe)

- **Registre des décisions** : date, décision, décideur, alternatives écartées — c'est lui qui protège des « on n'avait jamais dit ça ». Les décisions techniques vont en ADR ; les décisions projet au registre.
- **Registre des risques** : chaque risque a un propriétaire, probabilité × impact, un plan daté. Un risque sans plan daté est un vœu. Tout développeur peut (doit) remonter un risque.
- **Compte rendu unique** hebdomadaire : une page — valeur livrée, prochaine porte et son état, 3 risques principaux, décisions attendues. Jamais de rapport d'activité sans décision demandée.

## 5. Clôture

- Rétrospective **sans blâme** ; chaque leçon actionnable est proposée en mise à jour du document du corpus concerné.
- Rien n'est « fini » tant que l'exploitation n'a pas accepté le transfert (critères d'entrée en MCO : `13-vie-du-produit-mco.md` §1).

## 6. RACI par jalon

Chaque porte a un responsable unique et identifié **avant** d'y arriver — un jalon sans redevable nommé se franchit par glissement, jamais par décision :

| Jalon | Responsable (R) | Approbateur (A) | Consultés (C) | Informés (I) |
|---|---|---|---|---|
| J0 — Lancement | Chef de projet | Sponsor | Direction technique | Équipe |
| J1 — Fonctionnel | Chef de projet | Métier client | Responsable technique, UX | Équipe |
| J2 — Technique | Responsable technique | Direction technique | Sécurité, DevOps | Chef de projet, client |
| J3 — Fondations | DevOps | Responsable technique | Sécurité | Équipe |
| J4..n — Incréments | Tech lead du lot | Responsable technique + démo client | QA, Sécurité (zones sensibles) | Sponsor |
| J(n+1) — Recette | QA | Client (PV signé) | Chef de projet, métier | Équipe |
| J(n+2) — Production | DevOps | Responsable technique + sponsor | Sécurité, exploitation | Client |
| J(n+3) — Clôture | Chef de projet | Sponsor + exploitation | Toute l'équipe | Direction |

- Un seul **A** par jalon : deux approbateurs, c'est aucun. Le tableau s'adapte par projet mais chaque case reste nominative dans la note de lancement.

## 7. Paquet de preuves par porte

Franchir une porte produit un **paquet de preuves archivé** (evidence log du projet) — sans preuve datée, le passage de porte est invérifiable en audit et contestable par le client :

| Porte | Preuves minimales attendues |
|---|---|
| J0 | Note de lancement signée par le sponsor |
| J1 | Dossier fonctionnel + validation métier écrite (mail ou PV) |
| J2 | Dossier technique + checklist passée + trace de la veille sécurité + validation du responsable technique |
| J3 | Lien CI pipeline vert + rapport des règles d'architecture au build |
| J4..n | DoD cochée par module + compte rendu de démo + rapport de tests du lot |
| J(n+1) | PV de recette signé + liste des anomalies avec statut |
| J(n+2) | Checklist de déploiement + captures supervision active + rapport de charge + SECURITY.md publié |
| J(n+3) | PV de transfert exploitation + bilan + leçons reversées au standard |

- Chaque preuve est datée, rattachée à son auteur et **conservée dans l'evidence log** — pas dans une boîte mail personnelle.

## 8. Exigences non fonctionnelles : validées avant J3

- Les exigences non fonctionnelles — performance cible, volumétrie, disponibilité/SLO, sécurité, accessibilité, capacité, rétention des données — sont **chiffrées et validées par le client avant J3** : les fondations (infrastructure, choix de moteur, architecture de données) se dimensionnent sur ces chiffres, et les redécouvrir en recette coûte une refonte.
- Une exigence non fonctionnelle non chiffrée (« rapide », « robuste ») retourne à la spécification, comme un critère d'acceptation non testable (§2).
- Chaque exigence validée est rattachée à sa preuve future (test de charge, rapport d'accessibilité, SLO mesuré) dans la matrice exigence → test → preuve (`05-strategie-tests.md`).

## 9. Fournisseurs et sous-traitants

- Tout fournisseur ou sous-traitant intervenant sur le projet est soumis **aux mêmes exigences que l'équipe interne** — standards de code, revues, sécurité, interdictions absolues, gestion des accès — car la responsabilité vis-à-vis du client ne se sous-traite pas.
- Ces exigences sont **contractualisées avant la première intervention** : référence explicite au corpus (ou exigences équivalentes démontrées), clause d'audit, engagement de signalement d'incident, sort des accès et des données en fin de contrat.
- Accès des intervenants externes : moindre privilège, durée bornée à la mission, tracés dans le registre des accès, revus au même rythme que les internes (`01-onboarding-developpeur.md`) — un compte externe oublié est une porte d'entrée permanente.
- Les livrables externes passent la même Definition of Done et les mêmes revues : pas de « voie rapide fournisseur ».

## 10. Audit readiness avant production

La porte J(n+2) intègre un critère explicite d'**« audit readiness »** : la plateforme doit être auditable le jour de sa mise en production, pas des mois après.

- [ ] **Evidence log à jour** : toutes les preuves des portes franchies (§7) présentes, datées, accessibles.
- [ ] **Matrice d'adoption remplie** (`MATRICE-ADOPTION.md`) : chaque contrôle avec statut, preuve ou dérogation tracée.
- [ ] Registre des dérogations sans entrée orpheline : chaque dérogation a son ADR, sa date de résorption et son approbateur.
- [ ] Registres des décisions et des risques (§4) à jour.
- Un critère non tenu suit la règle des portes (§1) : dérogation écrite du sponsor avec plan de résorption, ou on ne passe pas.
