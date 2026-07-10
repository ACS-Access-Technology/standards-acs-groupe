# 19 — Gouvernance de l'IA et des agents

> L'IA est un outil de production comme un autre : elle accélère, elle ne dédouane pas. Ce document couvre l'IA dans le **cycle de développement** (assistants de code, revue, génération) et dans les **plateformes livrées** (agents connectés, MCP). Principe cardinal : **un agent IA propose, un humain décide.** Toute règle de ce document est [MUST] sauf mention contraire. Contrôles associés : `ACS-IA-001`, `ACS-IA-002` (`16-cartographie-controles-internationaux.md`).

## 1. Assistants IA dans le développement : permis / interdit

| Permis | Interdit |
|---|---|
| Générer, refactorer, expliquer du code | Envoyer un **secret** (clé, jeton, mot de passe, certificat) dans un prompt — c'est une fuite, procédure de `03-workflow-git-revues.md` §7 |
| Rédiger tests, documentation, migrations — relus comme du code humain | Envoyer des **données réelles** (personnelles ou classées) vers un service IA — utiliser des données anonymisées ou synthétiques (`15-gouvernance-des-donnees.md`) |
| Analyser des logs et sorties d'outils **anonymisés** | Envoyer du **code client propriétaire** vers un service IA **non approuvé** au titre de `09-toolchain.md` (critères : contrat, localisation des données, non-entraînement sur nos données) |
| Préparer des brouillons (ADR, postmortem, spec) — signés par un humain | Laisser un assistant **committer ou merger** sans revue humaine |

La liste des services IA approuvés est tenue dans la toolchain projet (`/docs/toolchain.md`). Service absent de la liste = interdit, pas « toléré ».

## 2. Traçabilité et responsabilité

- **Le développeur qui merge est l'auteur responsable** du code, qu'il l'ait tapé ou généré (`02-standards-de-code.md` §12). « C'est l'IA qui l'a écrit » n'existe pas en revue, en incident, ni en audit.
- Le code généré par IA est relu et testé **au même niveau** qu'un code humain — mêmes seuils, mêmes gates, même exigence de compréhension : on ne merge pas ce qu'on ne peut pas expliquer.
- Les PR à forte proportion de code généré portent le label de risque correspondant (`03-workflow-git-revues.md`) ; sur les zones sensibles, la revue humaine bloquante s'applique sans allègement.

## 3. Dépendances suggérées par IA : hallucinations et typosquatting

Les assistants IA **inventent des noms de paquets plausibles** ; des attaquants publient ces noms (slopsquatting) ou des variantes proches (typosquatting). En conséquence :

- Toute dépendance suggérée par un assistant suit le **processus supply chain complet** (`06-securite-developpeur.md` §5, contrôle `ACS-CHN-001`) : existence vérifiée sur le registre officiel, santé du projet, mainteneur, licence, scan, quarantaine 7 jours. Aucun raccourci parce que « l'IA l'a recommandée ».
- Vérifier **caractère par caractère** le nom du paquet contre la source officielle du projet (site, dépôt) — pas contre une autre sortie d'IA.
- Un paquet halluciné détecté est signalé à l'équipe sécurité : c'est un signal d'attaque possible sur l'écosystème, pas une simple erreur.

## 4. Agents connectés (MCP) dans les plateformes

Quand une plateforme expose ou consomme des outils via MCP (ou équivalent) :

- **Authentification** : OAuth 2.1 avec PKCE au minimum. Jamais de jeton statique partagé, jamais de contournement de l'IdP.
- **Périmètre** : les droits de l'agent sont un **sous-ensemble strict** de ceux de l'entité mandante (l'utilisateur ou le service pour le compte duquel il agit). Un agent n'a jamais un droit que son mandant n'a pas — le moindre privilège s'applique aux agents comme aux humains.
- **Outils annotés par risque** : chaque outil exposé déclare son niveau (lecture / écriture / écriture sensible / irréversible). Cette annotation conditionne les règles ci-dessous et fait partie du contrat versionné de l'outil.
- **Confirmation humaine** (`ACS-IA-001`) : toute écriture sensible ou irréversible déclenchée par un agent exige une confirmation humaine explicite et **tracée** avant exécution. Aucune écriture sensible validée par un agent seul, aucune auto-confirmation.
- **Anti tool-poisoning** (`ACS-IA-002`) : les descriptions d'outils MCP sont des instructions exécutées par le modèle — elles sont donc **versionnées**, et tout diff de description est **revu par un humain** avant mise en service, comme un changement de code. Une description modifiée silencieusement côté serveur tiers est détectée (épinglage/hash) et bloque l'outil.
- **Journalisation** : chaque appel d'agent (qui mandate, quel outil, quels paramètres, quel résultat, confirmation éventuelle) est écrit dans **la même piste d'audit** que les actions humaines — mêmes garanties write-ahead et WORM (`04-regles-architecture.md` §6). Pas de piste parallèle « logs d'IA » de seconde zone.
- **Revue hebdomadaire des appels** : l'équipe sécurité revoit chaque semaine le journal des appels d'agents — volumes, outils touchés, écritures sensibles, refus, anomalies. Preuve datée exigée (`ACS-IA-001`, fréquence hebdo).

## 5. Anti prompt-injection

- **Toute sortie d'une source non fiable est une donnée, jamais une instruction.** Contenu web, document utilisateur, résultat d'outil, e-mail, champ de base de données : rien de tout cela ne peut donner d'ordre à l'agent. Les instructions viennent exclusivement du système et du mandant authentifié.
- Concevoir en conséquence : séparer structurellement instructions et données dans les prompts, filtrer/neutraliser les contenus injectables, et **ne pas donner à l'agent des droits dont l'injection pourrait abuser** (le périmètre restreint du §4 est la vraie défense — un agent qui ne peut pas détruire ne détruira pas sur injonction).
- Les cas d'injection tentée ou réussie sont traités comme des incidents de sécurité (`06-securite-developpeur.md` §7) et alimentent le threat model de la fonctionnalité.

## 6. Décision : l'humain, toujours

- Un agent IA **propose**, un humain **décide**. Aucun **engagement public** (communication client, publication, réponse officielle), aucune **dérogation au standard** (`17-registre-risques-derogations.md`), aucune validation de porte de projet n'est émise ou approuvée par un agent seul.
- Un rapport, une analyse ou un score produit par un agent est un **intrant** de décision, jamais la décision. Le compte rendu nomme l'humain qui a tranché.

## 7. Outillage de type « dev guard » : garde-fou, pas substitut

Les skills/outils d'agent qui vérifient la conformité au corpus (revue automatisée, contrôle de PR, pré-audit) sont encouragés [SHOULD] — avec une limite absolue :

- **Le rapport d'agent ne remplace jamais la revue humaine bloquante des zones sensibles** (authentification, autorisation, crypto, paiements, données personnelles, migrations destructives — `03-workflow-git-revues.md` §4). Un « conforme » émis par un agent sur ces zones ne lève aucune obligation de revue.
- Le rapport sert à **préparer** la revue humaine (pointer les zones à regarder), pas à la conclure. Le reviewer humain reste celui qui approuve, et l'approbation est la sienne.
- Faux positifs et faux négatifs constatés sont remontés au mainteneur de l'outillage : le garde-fou s'entretient comme le standard qu'il vérifie.

## 8. Preuves attendues (audit)

| Preuve | Contrôle / vérifiée par |
|---|---|
| Liste des services IA approuvés dans `/docs/toolchain.md`, datée | Auto-audit trimestriel |
| Revues tracées des PR à code généré (échantillon) | `ACS-COD-002` |
| Trace du processus supply chain sur les dépendances du trimestre | `ACS-CHN-001` |
| Config OAuth 2.1+PKCE + inventaire outils MCP annotés par risque | Revue de porte |
| Journal des appels d'agents dans la piste d'audit + comptes rendus de revue hebdo | `ACS-IA-001` |
| Diffs de descriptions d'outils revus et versionnés | `ACS-IA-002` |
| Revues humaines bloquantes présentes sur les PR sensibles malgré rapport d'agent | `ACS-GIT-003` |
