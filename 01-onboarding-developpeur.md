# 01 — Onboarding développeur

> Objectif : un nouveau développeur livre sa première PR conforme en une semaine, et est autonome sur un module en un mois. Ce parcours est le même pour tous, quel que soit le niveau.

## Jour 1 — Accès et cadre

### Accès à provisionner (par le responsable technique, tracés dans le registre des accès)

- [ ] Compte Git (dépôts du projet, droits en lecture/écriture sur les branches, **jamais** admin par défaut)
- [ ] **MFA activée sur tous les comptes avant tout autre accès** — condition bloquante
- [ ] Accès CI/CD en lecture ; accès aux environnements de dev et pré-production uniquement
- [ ] **Aucun accès en écriture à la production** : les développeurs n'ont pas d'accès en écriture à la production. Point final.
- [ ] Coffre-fort de secrets : accès au périmètre strictement nécessaire
- [ ] Outils de suivi (tickets, supervision en lecture)

### Lectures obligatoires du jour 1

1. Le **dossier d'architecture technique du projet** (c'est la loi du projet).
2. Les **interdictions absolues** ci-dessous — à relire jusqu'à les connaître par cœur.
3. `02-standards-de-code.md` et `03-workflow-git-revues.md`.

### Interdictions absolues (tous rôles, aucune exception)

1. Secret, jeton ou mot de passe en clair — dans le code, la config, les logs, les tickets ou les messages de commit.
2. Données réelles de production hors production (dev/test utilisent des jeux anonymisés générés).
3. Contournement d'une étape bloquante de CI, même temporaire.
4. Accès direct en écriture à la base de production (toute correction de données passe par une migration ou un script revu, exécuté par le pipeline, tracé dans l'audit).
5. Dépendance ajoutée sans passer par le processus supply chain (`06-securite-developpeur.md`).
6. Désactivation d'un contrôle de sécurité (RLS, policy, rate limit) « pour débugger » — on débogue en pré-prod avec des données fictives.

Une violation d'interdiction absolue est un incident de sécurité, pas une erreur de débutant : elle se signale immédiatement, elle ne se cache pas.

## Semaine 1 — Environnement et première PR

- [ ] Environnement local monté depuis la documentation du dépôt (si la doc ne suffit pas, la corriger est votre **première PR**).
- [ ] Suite de tests exécutée localement en vert ; pipeline CI compris étape par étape (`07-cicd-supply-chain.md`).
- [ ] Lecture du `/docs/toolchain.md` du projet (déclinaison des outils pour la stack).
- [ ] Première PR livrée sur un ticket balisé « bon premier ticket » : petite (< 400 lignes), un seul sujet, accompagnée par un développeur référent.
- [ ] Revue de cette PR faite en binôme : c'est là que s'apprennent les conventions réelles du projet.

## Mois 1 — Autonomie

- [ ] A livré des PR sur au moins deux modules différents, dont une touchant un test de permission (accès accordé ET refusé).
- [ ] Sait écrire une migration expand/contract et un événement outbox conformes (`04-regles-architecture.md`).
- [ ] A participé à une revue de code en tant que relecteur.
- [ ] A lu les runbooks d'exploitation du projet et sait où ils vivent.
- [ ] Connaît la matrice d'arbitrage entre rôles (`08-exploitation-observabilite.md`, §6).

## Sources de vérité (à intérioriser dès le premier jour)

- Le **dossier d'architecture technique** : toute dérogation exige une ADR approuvée, versionnée dans `/docs/adr/`.
- Le **contrat OpenAPI** et les **schémas d'événements** : la source de vérité des interfaces. Le code s'y conforme, jamais l'inverse.
- Les **consignes spécifiques du client** (mémoire projet, exclusions, vocabulaire imposé) : elles s'appliquent à tout livrable, y compris les messages de commit et la documentation.

## Checklist poste de travail (Jour 1, avant tout accès au code)

Le poste de travail est le premier maillon de la chaîne de compromission : un portable volé non chiffré vaut une fuite complète du périmètre accessible.

- [ ] **Chiffrement intégral du disque activé** (FileVault, BitLocker, LUKS ou équivalent) — vérifié, pas déclaré.
- [ ] **Verrouillage automatique de session ≤ 5 minutes** d'inactivité, déverrouillage par authentification.
- [ ] **Mises à jour automatiques de l'OS et du navigateur activées** ; un poste non patché est une porte d'entrée connue des attaquants.
- [ ] **Accès au coffre-fort de secrets configuré et testé** : c'est le seul endroit où vivent les secrets.
- [ ] **Interdiction de secrets stockés localement** : aucun secret dans un fichier local, un `.env` commité, un gestionnaire de notes ou le trousseau personnel — le coffre-fort du projet est l'unique emplacement, car un secret hors coffre échappe à la rotation et à la révocation.

Checklist signée par le développeur et le responsable technique, conservée dans le registre des accès.

## Preuves d'onboarding (auditables)

L'onboarding n'est terminé que lorsque les preuves suivantes sont consignées dans le registre des accès — un onboarding sans preuve est invérifiable en audit :

- [ ] **Formation sécurité suivie et attestée** (date, contenu, signature) — couvre au minimum les interdictions absolues et la procédure de signalement d'incident.
- [ ] **Lecture du corpus attestée** : le développeur atteste par écrit avoir lu les documents obligatoires du jour 1 ; l'attestation engage, elle n'est pas une formalité. L'attestation générée par le parcours interactif (`parcours-acs/`, hash SHA-256 vérifiable) est admise comme preuve dès lors que les 19 modules et leurs quiz de validation sont terminés.
- [ ] **MFA validée** : preuve d'activation sur chaque compte provisionné, vérifiée par le responsable technique — pas d'auto-déclaration.

## Revue d'accès à J+30

- À J+30, le responsable technique compare les accès effectifs du nouvel arrivant au registre des accès et **retire tout accès non utilisé ou surdimensionné** : les droits provisionnés « au cas où » sont la première source de dérive du moindre privilège.
- Résultat consigné (date, écarts constatés, corrections) dans le registre des accès.

## Cycle Joiner / Mover / Leaver

L'arrivée (Joiner, jour 1), le changement de rôle (Mover, ci-dessous) et le départ (Leaver, section suivante) suivent chacun une checklist tracée dans le registre des accès : les accès fantômes naissent presque toujours d'un mouvement interne non traité.

### Changement de rôle (Mover) — revue d'accès obligatoire

- [ ] **Tout changement de rôle, de projet ou de périmètre déclenche une revue d'accès complète** sous 5 jours ouvrés : les accès de l'ancien rôle sont retirés, ceux du nouveau provisionnés — jamais de simple cumul, car le cumul silencieux d'accès est l'angle mort classique des audits.
- [ ] Rotation des secrets partagés du périmètre quitté si le nouveau rôle n'y donne plus droit.
- [ ] Revue consignée dans le registre des accès (date, ancien périmètre, nouveau périmètre, approbateur).

## Départ d'un collaborateur (miroir de l'arrivée)

- [ ] Révocation de tous les accès le jour du départ (Git, CI, coffre-fort, environnements, jetons personnels) — vérifiée contre le registre des accès.
- [ ] Rotation des secrets partagés auxquels il avait accès.
- [ ] Transfert documenté des sujets en cours (pas de savoir uniquement oral).
