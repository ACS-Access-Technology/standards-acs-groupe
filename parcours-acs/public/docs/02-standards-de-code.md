# 02 — Standards de code

> Valables pour tout langage. Les outils concrets par stack sont dans `09-toolchain.md` ; la déclinaison du projet vit dans son `/docs/toolchain.md`.

## 1. Formatage et lint

- **Formatage automatique** : le formateur officiel ou dominant de l'écosystème, appliqué en CI. **Le style ne se discute pas en revue** — une remarque de style en revue signifie que le formateur est mal configuré.
- Lint activé au niveau du projet, zéro avertissement toléré en CI.

## 2. Typage et analyse statique

- **Typage le plus strict que le langage permet** : mode strict activé (types stricts, null-safety, options du compilateur au maximum). Les langages dynamiques utilisent l'annotation de types + un vérificateur (voir table d'équivalences).
- **Analyse statique au niveau maximal du projet** : zéro erreur. Toute suppression d'avertissement (`ignore`, `nolint`, `suppress`, `@phpstan-ignore`…) exige une **justification en commentaire** sur la ligne concernée.

## 3. Nommage et internationalisation

- Nommage et messages **en anglais dans le code** (variables, fonctions, commits) — sauf consigne client contraire explicite (certains projets imposent le français : la consigne client prime, consignée dans le mémoire projet).
- **Textes utilisateur externalisés (i18n) dès le premier commit** — jamais de chaîne en dur dans le code.

## 4. Frontend

- Composants typés ; **aucune logique métier dans les vues**. La vue affiche, le service décide.
- Aucun asset chargé depuis un CDN externe si le dossier d'architecture impose le service local (cas des plateformes souveraines).
- La logique d'autorisation reste **exclusivement côté serveur** : masquer un élément d'interface ne protège rien — la route correspondante porte sa policy et son audit.

## 5. Mobile / terrain (si applicable)

- **Offline-first est le mode nominal, pas une option de synchronisation** : l'application fonctionne sans réseau, synchronise à la reconnexion, de manière idempotente (clé stable par opération), avec conflits détectés et signalés — « dernier horodatage gagne » est proscrit.
- Données mises en cache : chiffrées, restreintes au périmètre de l'utilisateur, jeton d'appareil révocable à distance.

## 6. Gestion des erreurs et logs

- Aucune erreur avalée silencieusement ; aucune fuite d'information interne dans les messages destinés à l'utilisateur (stack traces, chemins, versions).
- Logs structurés (JSON) sur tout nouveau chemin de code ; jamais de donnée personnelle ni de secret dans les logs.

## 7. Performance par construction

- Pagination systématique sur toute liste, avec conservation des critères de requête.
- Chargements liés explicites (eager loading, batch) : **une requête dans une boucle = PR refusée** (N+1).
- Traitements volumineux (exports, imports, envois de masse) : en flux (curseurs, lots par identifiant), jamais par chargement intégral en mémoire, et déportés en file asynchrone.

## 8. Dates, monnaie, nombres (bugs universels)

- **Dates : stockage et calcul en UTC**, conversion au fuseau de l'utilisateur à l'affichage uniquement. Jamais d'arithmétique naïve sur des dates locales (DST, fuseaux). Échanges en ISO 8601.
- **Monnaie et quantités réglementaires : jamais de flottant.** Entiers en plus petite unité (centimes) ou type décimal ; les règles d'arrondi sont écrites et testées.
- Comparaison de flottants : toujours avec tolérance ; égalité stricte interdite.

## 9. Concurrence et idempotence

- **Verrou optimiste par défaut** (champ de version ou `updated_at` comparé à l'écriture) ; verrou pessimiste justifié par ADR.
- Toute opération d'écriture exposée au réseau (API, file, synchronisation) est **idempotente** : clé stable par opération, le rejeu n'a jamais d'effet double.
- Les tâches de fond sont rejouables sans double effet ; le délai de reprise d'une tâche est strictement supérieur à son temps d'exécution maximal.

## 10. Complexité, commentaires, TODO

- Limites surveillées par le lint : fonctions courtes (ordre de grandeur ≤ 50 lignes), complexité cyclomatique plafonnée — le seuil exact se règle par stack, l'existence d'un seuil est obligatoire.
- Le commentaire explique le **pourquoi**, jamais le *quoi* (le quoi, c'est le code). Un commentaire qui paraphrase le code est supprimé.
- Un `TODO`/`FIXME` sans ticket lié est refusé en revue.

## 11. Accessibilité (si frontend) [SHOULD → MUST si secteur public]

- Plancher **WCAG 2.2 niveau AA** : contraste suffisant, navigation clavier complète, labels sur tous les champs de formulaire, alternatives textuelles, focus visible, pas d'information portée par la couleur seule.
- Vérification outillée en CI (axe-core ou équivalent) + contrôle manuel clavier sur les parcours critiques.

## 12. Code généré par IA

- Le code généré par un assistant est relu et testé **au même niveau qu'un code humain** ; le développeur qui le merge en est l'**auteur responsable** — « c'est l'IA qui l'a écrit » n'existe pas en revue.
- Jamais de secret, de donnée réelle ni de code propriétaire client dans un prompt vers un service externe non approuvé.
- Les dépendances suggérées par l'IA passent par le processus supply chain complet (elles sont un vecteur connu d'hallucination de paquets — typosquatting).

## 13. Seuils mesurables par défaut

Les seuils suivants s'appliquent **par défaut à tout projet** ; un projet peut les ajuster dans son `/docs/toolchain.md` avec justification écrite — jamais tacitement, car un seuil non écrit est un seuil qui n'existe pas.

| Mesure | Seuil par défaut | Vérifié par |
|---|---|---|
| Complexité cyclomatique | **≤ 10 par fonction** | Lint / outil qualité, bloquant en CI |
| Duplication de code | **< 3 %** du projet | Outil qualité continue |
| Dette technique | **Suivie par l'outil qualité** (SonarQube ou équivalent), tendance revue à chaque release — une dette non mesurée ne se rembourse jamais | Outil qualité continue |

- Un dépassement de seuil bloque la CI ; la dérogation exige une justification en commentaire sur le code concerné ou une ADR si elle est structurelle.

## 14. SAST / SCA par criticité

L'analyse statique de sécurité (SAST) et l'analyse des dépendances (SCA) tournent en CI sur chaque PR — détecter une vulnérabilité après le merge coûte un ordre de grandeur de plus qu'avant.

| Sévérité du résultat | Règle |
|---|---|
| Critique / haute | **Merge bloqué.** Correction ou dérogation ADR avec date de résorption et approbateur humain. |
| Moyenne | Correction sous 30 jours, ticket créé dans la PR qui l'introduit. |
| Basse | Triée à la revue qualité suivante ; jamais accumulée sans ticket. |

- Zones sensibles (`03-workflow-git-revues.md` §4) : aucun résultat SAST critique ou haut ouvert, sans exception.
- Les faux positifs sont marqués dans l'outil avec justification — jamais par désactivation globale de la règle, qui masquerait les vrais positifs suivants.

## 15. Configuration sécurisée par langage et framework

- **Les valeurs par défaut du framework ne sont jamais présumées sûres** : chaque projet part d'une configuration durcie explicite (debug désactivé hors dev, cookies `Secure`/`HttpOnly`/`SameSite`, en-têtes de sécurité, désérialisation restreinte, listing de répertoires coupé) — la majorité des compromissions applicatives exploitent une config par défaut, pas un bug de code.
- La configuration durcie est **versionnée dans le dépôt** (fichiers de config, pas de clic en console) et vérifiée en CI quand l'outillage le permet ; les écarts au durcissement de référence exigent une justification en commentaire.
- Toute montée de version majeure du framework redéclenche la revue de configuration : les défauts changent entre versions.

## 16. Traçabilité du code généré par IA (complète §12)

- Toute PR contenant du code substantiellement généré par un assistant IA **le déclare dans sa description** (outil utilisé, périmètre concerné) — le relecteur adapte sa vigilance, notamment sur les dépendances et les cas limites, points faibles connus de la génération.
- Cette déclaration est une information de revue, **jamais une décharge de responsabilité** : l'auteur de la PR reste l'auteur responsable (§12).
- Sur les dépôts sensibles, l'absence de déclaration constatée a posteriori est traitée comme un défaut de revue, pas comme un détail.

## Definition of Done — code

Un travail de code est terminé quand : le code est mergé sur `main` avec CI verte ; les tests couvrent le **comportement** (pas seulement les lignes) ; la documentation impactée est mise à jour **dans la même PR** (OpenAPI, ADR, runbook, lexique) ; l'observabilité est en place (logs structurés, métriques, traces sur le nouveau chemin) ; et le déploiement en pré-production est vérifié.
