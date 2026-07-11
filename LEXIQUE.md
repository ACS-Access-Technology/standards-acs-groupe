# Lexique — Standards ACS Groupe

> Définitions en une phrase, pensées pour un nouvel arrivant. Version interactive (recherche) dans l'application `parcours-acs`.
> **Fichier généré** depuis `parcours-acs/src/data/lexique.js` (`npm run gen-lexique`) — ne pas éditer à la main.

| Terme | Définition |
|---|---|
| **ADR** | Architecture Decision Record : une note de 10 lignes qui garde la trace d'une décision technique — le contexte, le choix, ce qu'on a écarté et pourquoi. |
| **Analyse statique** | Un outil qui lit ton code sans l'exécuter et signale les erreurs probables (types, null, code mort) — comme un correcteur orthographique du code. |
| **ASVS** | Référentiel OWASP qui liste les exigences de sécurité d'une application web, par niveaux (L1 à L3) — chez ACS, le niveau 2 est le défaut. |
| **Audit write-ahead** | La trace d'audit est écrite AVANT d'exécuter l'action ; si le journal est indisponible, l'action est refusée — aucune action d'admin sans trace. |
| **BOLA / IDOR** | Accéder aux données de quelqu'un d'autre en changeant un identifiant dans l'URL ou l'API — la faille n° 1 des API, testée systématiquement chez nous. |
| **Budget d'erreur (error budget)** | La marge d'indisponibilité qu'on s'autorise sur un SLO ; quand elle est consommée, on gèle les nouveautés et on répare la fiabilité. |
| **CI / CD** | La chaîne automatique qui vérifie (CI) puis déploie (CD) ton code à chaque changement — chez nous, 8 étapes toutes bloquantes. |
| **CODEOWNERS** | Un fichier qui dit qui doit relire quoi : toucher une zone sensible déclenche automatiquement la revue de l'équipe responsable. |
| **Coffre-fort de secrets** | Le service (OpenBao, Vault…) qui garde les mots de passe et clés, injectés à l'exécution — jamais écrits dans le code ou la config versionnée. |
| **Conventional Commits** | Format des messages de commit (feat:, fix:, security:…) qui permet de générer le changelog automatiquement. |
| **Corrélation (ID de)** | Un identifiant unique qui suit une requête partout (logs, files, événements) pour reconstituer son parcours quand quelque chose casse. |
| **CSP** | Content Security Policy : un en-tête qui dit au navigateur quelles sources de scripts/styles sont autorisées — un rempart contre le XSS. |
| **CVE** | L'identifiant public d'une faille de sécurité connue (ex. CVE-2025-54068) — notre veille les trie tous les jours. |
| **DoD (Definition of Done)** | La liste de conditions qui définissent « terminé » : tant qu'une case manque, le travail n'est pas fini, quel que soit le temps passé. |
| **DoR (Definition of Ready)** | Les conditions pour COMMENCER un ticket : critères d'acceptation écrits, impacts identifiés, taille raisonnable. |
| **DPIA** | Analyse d'impact sur les données personnelles : obligatoire avant certains traitements sensibles, avec le juriste/DPO. |
| **DR (site de reprise)** | L'environnement de secours qui prend le relais si la production brûle — on teste la bascule deux fois par an, chrono en main. |
| **E2E (test bout-en-bout)** | Un test qui rejoue un parcours utilisateur complet dans un vrai navigateur — précieux mais coûteux, on en garde peu. |
| **EOL (fin de support)** | La date après laquelle un composant ne reçoit plus de correctifs de sécurité — toute brique à moins de 6 mois de son EOL a un plan de migration. |
| **Expand / contract** | La façon sûre de modifier un schéma de base : on ajoute d'abord (expand), on migre, puis on retire plus tard (contract) — jamais de rename/drop brutal. |
| **Feature flag** | Un interrupteur qui active/désactive une fonctionnalité sans redéployer — ce qui permet de fusionner souvent du travail non fini sans l'exposer. |
| **Flaky (test instable)** | Un test qui échoue ou réussit au hasard : il est réparé ou supprimé sous 7 jours, car une suite qu'on ignore ne protège plus rien. |
| **Golden path** | Le modèle de dépôt pré-conforme (pipeline, scans, gabarits inclus) : le chemin conforme doit être le chemin le plus facile. |
| **HSTS** | En-tête qui impose au navigateur de toujours parler en HTTPS avec le site. |
| **IaC (Infrastructure as Code)** | Toute l'infrastructure décrite en code versionné : une modification à la main en production est un incident, pas un raccourci. |
| **Idempotent** | Une opération qu'on peut rejouer sans double effet (grâce à une clé stable) — indispensable pour les retries et la synchronisation. |
| **Lockfile** | Le fichier qui fige la version exacte de chaque dépendance (composer.lock, package-lock.json) — pour que tout le monde installe exactement la même chose. |
| **MCP** | Model Context Protocol : la porte par laquelle un agent d'IA se connecte à une plateforme — chez nous, jamais plus de droits qu'un humain, et toute écriture confirmée. |
| **MFA** | Authentification à deux facteurs : mot de passe + code temporaire — obligatoire sur tous les comptes, avant tout autre accès. |
| **Migration** | Un script versionné qui modifie le schéma de la base — c'est le SEUL moyen de toucher aux données de production. |
| **Mutation testing** | Un outil qui introduit volontairement des bugs pour vérifier que tes tests les attrapent — un test qui ne tue pas de mutant ne prouve rien. |
| **N+1** | Le piège de performance classique : une requête par élément d'une liste au lieu d'une seule pour tout charger — une requête dans une boucle = PR refusée. |
| **Outbox (transactional)** | Pattern qui garantit qu'un événement n'est publié QUE si la donnée est bien enregistrée : l'événement s'écrit dans la même transaction, puis un relais le publie. |
| **Pentest** | Test d'intrusion mené par des experts externes qui attaquent la plateforme pour de vrai — avant la mise en production, puis chaque année. |
| **Pipeline** | La suite d'étapes automatiques que traverse ton code du commit au déploiement — si une étape échoue, tout s'arrête. |
| **Policy** | La règle de code qui décide qui a le droit de faire quoi sur une ressource — refus par défaut : ce qui n'est pas autorisé explicitement est interdit. |
| **Postmortem** | L'analyse sans blâme d'un incident : chronologie, causes, actions correctives datées — on cherche ce qui a cassé, jamais qui a cassé. |
| **PR (Pull Request)** | Ta proposition de changement : un sujet, moins de 400 lignes, CI verte et une revue avant de fusionner. |
| **Prompt injection** | Manipuler un agent d'IA en cachant des instructions dans un contenu qu'il lit — parade : tout contenu externe est une donnée, jamais un ordre. |
| **Quality-gate** | Un seuil de qualité mesurable (couverture, dette) dont le non-respect bloque la fusion ou le déploiement. |
| **Quarantaine (dépendance)** | Les 7 jours d'attente avant d'adopter une mise à jour de dépendance non urgente — le temps que la communauté détecte un paquet piégé. |
| **RBAC** | Contrôle d'accès par rôles : les permissions sont attachées à des rôles, et les personnes reçoivent des rôles — jamais des droits en direct. |
| **Read model** | Une vue précalculée et optimisée pour la lecture (tableaux de bord) — pour éviter d'interroger les modules en boucle. |
| **RLS (Row-Level Security)** | Le moteur de base de données filtre lui-même les lignes selon l'utilisateur — troisième couche de défense, jamais la seule. |
| **Rollback** | Revenir à la version précédente en une commande — testé à chaque release majeure, sinon la release n'est pas prête. |
| **RPO / RTO** | RPO : combien de données on accepte de perdre au maximum (en durée). RTO : combien de temps on accepte d'être à l'arrêt. Les deux se testent. |
| **Runbook** | La procédure pas-à-pas pour réagir à une alerte : symptôme, diagnostic, remédiation, escalade — chaque alerte a le sien. |
| **SBOM** | L'inventaire exact de tous les composants d'un build — c'est lui qui permet de répondre en minutes à « sommes-nous touchés par cette CVE ? ». |
| **SemVer** | Versionnage MAJEUR.MINEUR.CORRECTIF : on incrémente le majeur dès qu'on casse la compatibilité. |
| **SIEM** | Le système qui collecte et corrèle les événements de sécurité pour détecter les intrusions (Wazuh chez nous). |
| **SLA / SLO** | SLA : l'engagement de service promis au client. SLO : l'objectif interne, plus strict, qui sert de marge de sécurité. |
| **SLSA** | Référentiel d'intégrité de la chaîne de build : prouver qu'un artefact déployé vient bien de notre code, notre CI, sans altération. |
| **STRIDE** | La grille des 6 familles de menaces (usurpation, falsification, répudiation, fuite, déni de service, élévation) — la base d'un threat model de 30 minutes. |
| **Threat model** | Se demander AVANT de coder : qui pourrait attaquer cette fonctionnalité, comment, et qu'est-ce qu'on met en face — 30 minutes, versionné. |
| **Tool poisoning** | Piéger la description d'un outil exposé à un agent d'IA pour détourner son comportement — parade : descriptions versionnées et diffs revus. |
| **Trunk-based** | Travailler en branches très courtes fusionnées vite sur main, plutôt qu'en longues branches qui divergent pendant des semaines. |
| **WORM** | Write Once Read Many : un stockage où rien ne peut être modifié ni effacé après écriture — utilisé pour les sauvegardes et la piste d'audit. |
| **XSS** | Injecter du script dans une page vue par d'autres utilisateurs — parade : encoder toute sortie et une CSP stricte. |
| **Zero Trust** | Ne jamais faire confiance par défaut : chaque requête est authentifiée, autorisée et journalisée, même à l'intérieur du réseau, même pour les admins. |
