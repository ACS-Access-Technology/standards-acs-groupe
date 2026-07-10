# 05 — Stratégie de tests

> Principes cardinaux (ISTQB) : tester montre la présence de défauts, jamais leur absence. Le test exhaustif est impossible : on **priorise par le risque** (probabilité × impact métier). Paradoxe du pesticide : des tests qui ne changent jamais ne trouvent plus rien — la suite de tests vit.

## 1. Shift-left : la qualité se décide en amont

- **Analyse de risques produit** dès la conception : liste des fonctions par criticité métier ; elle dicte la profondeur de test de chaque module — on ne teste pas tout pareil.
- **Critères d'acceptation testables dès la spécification**, au format Given/When/Then, AVANT le développement. Un critère non testable est renvoyé à la spécification.
- Stratégie écrite (2-3 pages) par projet : périmètre, niveaux, répartition pyramide, environnements et jeux de données, outillage, critères d'entrée/sortie, gestion des anomalies, responsabilités.

## 2. La pyramide, appliquée

| Niveau | Qui | Contenu | Volume |
|---|---|---|---|
| Unitaires | Développeurs | Règles métier, tous les cas limites des grilles/seuils | La base — majoritaires, rapides |
| Intégration | Développeurs + QA | Contrats de modules, flux outbox → consommateur, autorisations + **isolation des données au niveau base** (une entité A ne lit jamais une donnée d'entité B, testé dans la base elle-même) | Le cœur de la confiance |
| E2E | QA | Les parcours critiques du dossier fonctionnel uniquement | Peu nombreux, stables |
| Non-fonctionnels | QA + DevOps | Charge (concurrence totale, **jalon bloquant** avant mise en production), sécurité (DAST), accessibilité, compatibilité | Selon l'analyse de risques |

Règles :

- Tout test automatisable est automatisé et tourne en CI. Les tests manuels sont réservés à l'exploratoire (sessions en temps boxé, notes obligatoires) et à la recette métier.
- Les tests fonctionnels s'exécutent contre le **SGBD réel du projet** (jamais SQLite en remplacement d'un PostgreSQL de production).
- Un test E2E instable (flaky) est réparé ou supprimé **sous 7 jours** — une suite qu'on ignore est pire que pas de suite.
- **Mutation testing** sur les modules à règles métier denses — un test qui ne tue pas de mutant ne prouve rien.
- **Jamais de données réelles hors production** : jeux anonymisés générés (factories, seeders).

## 3. Suite de sécurité dédiée (bloquante en CI)

Couvre au minimum : références directes non sécurisées (IDOR), contrôle d'accès par rôle (accès accordé ET refusé), politique de sécurité de contenu (CSP), authentification MFA. Exécutée **en arrêt au premier échec** : une régression de sécurité ne peut pas être fusionnée.

## 4. Couverture et quality-gate

- Couverture mesurée à chaque build et remontée à l'outil de qualité continue ; objectif contractuel fixé par projet (référence : 60 % de lignes à la mise en production, 70 % à six mois), progression vérifiée par le quality-gate.
- La couverture est un plancher, pas un objectif : on couvre le **comportement**, pas les lignes.

## 5. Critères d'entrée / sortie (les portes du testeur)

- **Entrée en test système** : build déployé en environnement de test, données chargées, tests unitaires et d'intégration verts, périmètre du lot gelé.
- **Sortie de test système / entrée en recette** : 100 % des cas prévus exécutés, 0 anomalie bloquante ou majeure ouverte, mineures documentées et acceptées, régression verte.
- **Sortie de recette** (= autorisation de mise en production) : PV de recette signé + résultats des tests de charge + rapport du test d'intrusion initial.
- On ne « négocie » pas un critère en cours de phase : si un critère est intenable, on le change formellement (décision tracée), on ne le contourne pas.

## 6. Gestion des anomalies

- Rapport utile : titre factuel, étapes de reproduction exactes, obtenu vs attendu, environnement/version, preuve, sévérité proposée (gabarit dans `10-gabarits.md`).
- Sévérités : **bloquante** (empêche l'usage ou corrompt des données — arrêt du lot), **majeure** (fonction clé dégradée sans contournement), **mineure** (contournement existant), **cosmétique**. La sévérité est un fait métier ; la **priorité** de correction est une décision projet — ne pas confondre.
- Cycle : ouverte → corrigée → **revérifiée par le testeur** (jamais fermée sur parole du développeur) → fermée. Toute correction s'accompagne d'un test de non-régression qui aurait détecté l'anomalie.
- Métriques : anomalies ouvertes par sévérité, taux de réouverture, densité par module (les zones denses reçoivent plus de tests).
- Aucune anomalie de sévérité bloquante ou majeure n'est reportée en production.

## 7. Recette métier (UAT)

- Faite par le **client** (utilisateurs réels), organisée par l'équipe : scénarios en langage métier issus du dossier fonctionnel, données réalistes anonymisées, environnement de pré-production dédié et stable.
- Cahier de recette : chaque scénario a ses étapes, son résultat attendu, sa case verdict — cas nominaux ET cas d'exception.
- Se conclut par un **PV signé des deux parties** (périmètre, scénarios passés/échoués, sort des anomalies restantes, réserves datées). Sans PV signé, pas de mise en production.

## 8. Données de test et tests de contrat

- **Gestion des données de test** : générées par factories/seeders, réalistes en volume et distribution ; le jeu de pré-production est rafraîchi par le pipeline selon un calendrier ; les règles d'anonymisation sont elles-mêmes testées (`15-gouvernance-des-donnees.md` §5).
- **Tests de contrat consommateur/producteur** : entre modules (schémas d'événements) et vis-à-vis des API externes consommées — un mock non contractuel valide un comportement qui n'existe plus.

## 9. Budget de performance en CI

- Seuils de régression qui **cassent le build** : latence des endpoints critiques, nombre de requêtes SQL par page (anti-N+1), taille des bundles front le cas échéant.
- Le test de charge du jalon (§2) prouve la tenue en charge une fois ; le budget en CI empêche la régression **au quotidien**.

## 10. Matrice exigence → test → preuve

- Chaque exigence du dossier fonctionnel et chaque exigence non fonctionnelle retenue est tracée vers **au moins un cas de test** et vers la **preuve de son exécution** (lien CI, rapport daté) — une exigence sans test est un trou de recette, un test sans preuve n'est pas auditable.
- La matrice vit **dans le dépôt** : identifiants d'exigence portés par les tests (nom, annotation, tag) ; [SHOULD] extraction automatisée plutôt que tableur maintenu à la main, qui diverge en deux sprints.
- Elle est jointe au rapport de tests de chaque jalon ; c'est la **première preuve** que demande l'auditeur des contrôles `ACS-TST-*` (`16-cartographie-controles-internationaux.md`).

## 11. Tests instables (flaky) : mesure et quarantaine

- La règle du §2 reste entière : un test flaky est **réparé ou supprimé sous 7 jours**.
- Le **taux de flakiness** est un indicateur suivi : proportion d'exécutions où un test échoue puis passe sans changement de code, mesurée par la CI et revue à la revue qualité. Seuil : **< 1 % des exécutions de la suite** ; au-delà, la stabilisation passe devant les features — une suite non fiable n'est plus une preuve, donc plus une protection.
- **Quarantaine explicite** : un test identifié flaky est déplacé dans une suite en quarantaine qui continue de tourner mais ne bloque pas le merge, avec ticket daté et propriétaire. La quarantaine **ne suspend pas** le délai de 7 jours : elle protège la CI, pas le test.
- Interdits : skip silencieux sans ticket, re-run jusqu'au vert, désactivation « temporaire » sans date — ce sont les trois gestes qui rendent une suite décorative.

## 12. Tests de résilience, de migration, d'accessibilité et de rollback

- **Résilience** : pour chaque dépendance du registre (`04-regles-architecture.md` §15), un test provoque son indisponibilité (timeout, 5xx, coupure) et vérifie que le mode dégradé écrit se produit — messages corrects, rejeu sans doublon, aucune corruption. Exécuté avant la mise en production, puis à chaque changement de la dépendance.
- **Migration** : toute migration de schéma s'exécute en CI sur un **dump anonymisé représentatif en volume** (`04-regles-architecture.md` §4) ; le test mesure la durée, vérifie la réversibilité et l'absence de perte — une migration testée sur base vide ne prouve rien.
- **Accessibilité** : scan automatisé (axe-core ou équivalent) **bloquant sur les parcours critiques**, cible WCAG 2.2 AA ; [SHOULD] vérification manuelle clavier + lecteur d'écran sur ces mêmes parcours avant la recette — les scanners ne détectent qu'une partie des violations.
- **Rollback** : le scénario de retour arrière du release plan (`10-gabarits.md`) est **exécuté en pré-production avant chaque release majeure** — applicatif et données (expand/contract) : on prouve qu'on sait revenir, on ne l'espère pas.

## 13. Critères de sortie modulés par la criticité métier

Les critères du §5 sont un **plancher commun** ; l'analyse de risques du §1 les durcit ou permet un allègement tracé — tester tout au même niveau gaspille l'effort là où le risque est faible et en manque là où il est critique.

| Criticité (issue de l'analyse de risques) | Exigences de sortie |
|---|---|
| **Critique** (indisponibilité ou corruption = impact métier, légal ou financier majeur) | §5 + mutation testing sur les règles denses + tests de résilience et de rollback exécutés + charge au jalon + aucune anomalie, même mineure, non arbitrée en comité |
| **Standard** | §5 tels quels |
| **Faible** (module périphérique, réversible, sans donnée sensible) | §5, E2E limités au parcours nominal — allègement tracé dans la stratégie de tests |

- La criticité est fixée par l'**analyse de risques validée au cadrage**, jamais requalifiée par l'équipe en fin de phase — sinon tout devient « faible » sous la pression du calendrier.
- Aucun allègement ne touche la suite de sécurité (§3) ni la couverture contractuelle (§4) : elles sont dues quelle que soit la criticité.

## Contrôle qualité avant livraison d'un rapport de tests (bloquant)

- [ ] Chaque exigence du dossier fonctionnel est tracée vers au moins un cas de test (matrice de traçabilité).
- [ ] La profondeur de test par module correspond à l'analyse de risques.
- [ ] Les critères de sortie sont objectivement atteints, preuves à l'appui.
- [ ] Toute anomalie fermée a été revérifiée et a son test de non-régression.
- [ ] Les chiffres du rapport sont exacts et recalculables.
- [ ] Aucune donnée réelle utilisée hors production.
