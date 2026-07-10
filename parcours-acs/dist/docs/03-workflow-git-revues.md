# 03 — Workflow Git et revues

## 1. Modèle de branches : trunk-based

- Branches **courtes (< 3 jours)** créées depuis `main`, mergées dès que la CI est verte et la revue faite.
- **Une PR = un sujet.** Diff effectif **< 400 lignes** ; au-delà, découper. Une PR mélangée (refactor + feature) est refusée.
- Toute fonctionnalité nouvelle part **derrière un feature flag**, activée par entité ou par environnement — c'est ce qui permet de merger souvent sans exposer du travail inachevé.

## 2. Commits : Conventional Commits

- Format : `type(scope): description` — types : `feat:`, `fix:`, `refactor:`, `security:`, `test:`, `docs:`, `chore:`, `perf:`.
- **Le changelog est généré, pas rédigé** : la qualité des messages de commit est donc contractuelle.
- Jamais de secret, d'identifiant ou de donnée personnelle dans un message de commit.

## 3. Protection de `main`

- Pas de push direct. Pas de force-push. Pas de merge avec CI rouge. **Aucune exception, y compris « urgence »** — l'urgence suit la procédure accélérée (revue express, jamais zéro revue).

## 4. Revues de code

- Toute PR exige : **CI verte + 1 revue**. **2 revues si zone sensible** : authentification, permissions/policies, RLS, audit, migration, crypto, gestion de session, upload de fichiers, désérialisation, requêtes brutes, intégrations externes, outils MCP, paiement.
- La revue sécurité sur zone sensible est **bloquante** ; son délai maximal est de 24 h ouvrées (matrice d'arbitrage, `08-exploitation-observabilite.md` §6).
- Ce que vérifie une revue (dans l'ordre) : le comportement est-il correct et testé ? les règles d'architecture sont-elles respectées ? la grille sécurité passe-t-elle (`06-securite-developpeur.md` §2) ? la documentation est-elle à jour ?
- Ce qu'une revue ne vérifie **pas** : le style (c'est le rôle du formateur en CI).
- Le relecteur est responsable de ce qu'il approuve : « LGTM » sans lecture est une faute professionnelle.

## 5. Premier commit d'une PR touchant l'API

- **Contract-first** : la modification du contrat OpenAPI est le **premier commit** de la PR ; les tests de contrat sont générés depuis le spec. Le code se conforme au contrat, jamais l'inverse.

## 6. Releases et versionnage

- **SemVer** : MAJEUR (rupture de contrat), MINEUR (fonctionnalité compatible), CORRECTIF. Détail dans `13-vie-du-produit-mco.md` §2.
- Tags de release **signés** ; notes de version générées depuis les commits puis relues.
- Signature des commits (GPG/Sigstore) obligatoire sur les dépôts sensibles [SHOULD ailleurs].

## 7. Secrets dans Git

- **Scan de secrets en pre-commit ET en CI** (gitleaks ou équivalent) — la CI seule détecte trop tard : le secret est déjà dans l'historique.
- **Procédure de fuite** : un secret commité est un secret compromis. Rotation immédiate du secret (la réécriture d'historique ne suffit jamais — clones, forks, caches), puis déclaration incident (`06-securite-developpeur.md` §7) et scan de l'historique.

## 8. Contenu obligatoire d'une PR

- Description : quoi, pourquoi, comment tester.
- Lien vers le ticket ; capture ou trace si changement visible.
- Si dérogation à l'architecture : lien vers l'ADR approuvée (sans ADR, pas de merge).
- Si nouvel événement ou modification d'événement : schéma versionné joint et testé par contrat.
- La documentation impactée mise à jour **dans la même PR**.

## 9. CODEOWNERS obligatoire

- Chaque dépôt porte un fichier **`CODEOWNERS` versionné** qui affecte les zones sensibles (authentification, permissions, RLS, audit, crypto, migrations, CI/CD, intégrations, outils MCP, paiement) à l'**équipe sécurité ou aux relecteurs habilités** — la revue à deux sur zone sensible (§4) ne tient que si l'outil désigne automatiquement le bon relecteur, sinon elle dépend de la mémoire de l'auteur.
- La plateforme Git est configurée pour **exiger l'approbation des CODEOWNERS** avant merge sur les chemins couverts.
- Le fichier `CODEOWNERS` est lui-même une zone sensible : sa modification exige l'approbation de l'équipe sécurité.

## 10. Protection minimale par dépôt

Configuration minimale exigée sur **tout dépôt**, vérifiée à la création puis à chaque audit — une protection non configurée équivaut à une règle inexistante :

- [ ] Push direct sur `main` interdit ; force-push interdit ; suppression de branche protégée interdite.
- [ ] Merge conditionné à **CI verte** et au nombre de revues requis (§4), approbations invalidées par tout nouveau commit.
- [ ] Approbation `CODEOWNERS` requise sur les chemins couverts (§9).
- [ ] Scan de secrets actif en CI (§7).
- [ ] Les administrateurs du dépôt sont **soumis aux mêmes règles** (pas de bypass admin) : une protection contournable par un compte compromis ne protège rien.
- Capture ou export de cette configuration conservé comme preuve d'audit dans l'evidence log du projet.

## 11. Labels de risque PR

- Toute PR touchant un domaine à risque porte le label correspondant : **`securite`**, **`migration`**, **`api`**, **`donnees`**, **`infra`**, **`ia-mcp`** — le label déclenche mécaniquement la bonne revue, au lieu de compter sur le relecteur pour deviner le risque.
- Effets obligatoires : `securite` et `ia-mcp` → revue sécurité bloquante (§4) ; `migration` → vérification expand/contract + plan de rollback ; `api` → contract-first vérifié (§5) ; `donnees` → contrôle données personnelles/rétention (`15-gouvernance-des-donnees.md`) ; `infra` → relecteur DevOps.
- L'absence de label sur une PR qui en relevait est un défaut de revue, relevé en rétrospective — les labels sont un outil de routage, pas de décoration.

## 12. Checklist PR

- Toute PR utilise le **gabarit de checklist PR de `10-gabarits.md`** (description, tests, sécurité, documentation, labels de risque), pré-rempli par le template du dépôt — une checklist ad hoc se dégrade PR après PR, un gabarit versionné s'améliore par PR.
- Les cases non applicables sont barrées, jamais supprimées : la trace de ce qui a été considéré fait partie de la preuve de revue.

## 13. Preuve de signature des commits et tags

- Sur les dépôts sensibles, la signature des commits et tags (§6) est **vérifiée par la plateforme** (rejet des commits non signés ou non vérifiés), pas seulement demandée aux développeurs — une règle non appliquée par l'outil dérive en semaines.
- La vérification de signature du tag déployé fait partie des preuves de release conservées dans l'evidence log (rapprochement artefact ↔ tag, `13-vie-du-produit-mco.md` §2).
- La liste des clés de signature autorisées est tenue dans le registre des accès et purgée au départ d'un collaborateur (`01-onboarding-developpeur.md`).
