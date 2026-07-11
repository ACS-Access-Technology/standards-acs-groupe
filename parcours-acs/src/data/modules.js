// Carte du parcours — chaque module = un document du corpus ACS Groupe v1.1
// Positions en % du canevas (flux diagonal bas-gauche → haut-droite, façon cursus Grafikart)

export const modules = [
  {
    id: 'accueil', doc: 'README.md', titre: 'Le standard ACS', icone: 'Landmark', couleur: '#1b2a9e', x: 8, y: 86,
    etape: 'Départ', prerequis: [], essentiel: true,
    resume: "Pourquoi ce corpus existe, les 7 invariants non négociables, la convention [MUST]/[SHOULD] et le parcours de lecture.",
    objectifs: [
      'Connaître les 7 invariants non négociables',
      'Comprendre la convention [MUST]/[SHOULD]/[MAY]',
      'Savoir où vit chaque document du corpus',
    ],
  },
  {
    id: 'onboarding', doc: '01-onboarding-developpeur.md', titre: 'Onboarding', icone: 'Rocket', couleur: '#f28c1f', x: 20, y: 74,
    etape: 'Départ', prerequis: ['accueil'], essentiel: true,
    resume: "Accès, MFA, environnement, et les 6 interdictions absolues à connaître par cœur avant la première ligne de code.",
    objectifs: [
      'Réciter les 6 interdictions absolues',
      'Monter l’environnement local et lancer les tests',
      'Identifier les 3 sources de vérité du projet',
    ],
  },
  {
    id: 'code', doc: '02-standards-de-code.md', titre: 'Standards de code', icone: 'Braces', couleur: '#1b2a9e', x: 33, y: 64,
    etape: 'Socle', prerequis: ['onboarding'], essentiel: true,
    resume: "Formatage, typage strict, analyse statique max — plus les basiques universels : dates UTC, monnaie sans flottant, idempotence, code IA.",
    objectifs: [
      'Configurer formateur + analyse statique au niveau max',
      'Appliquer les règles dates/monnaie/concurrence',
      'Savoir quand un commentaire est justifié',
    ],
  },
  {
    id: 'git', doc: '03-workflow-git-revues.md', titre: 'Git & revues', icone: 'GitBranch', couleur: '#e8262d', x: 46, y: 72,
    etape: 'Socle', prerequis: ['code'], essentiel: true,
    resume: "Trunk-based, Conventional Commits, PR < 400 lignes, protection de main, SemVer, et la procédure de fuite de secret.",
    objectifs: [
      'Livrer une PR conforme (un sujet, CI verte, revue)',
      'Écrire des messages Conventional Commits',
      'Réagir correctement à un secret commité',
    ],
  },
  {
    id: 'toolchain', doc: '09-toolchain.md', titre: 'Toolchain', icone: 'Wrench', couleur: '#f28c1f', x: 33, y: 88,
    etape: 'Référence', prerequis: ['code'],
    resume: "La table d'équivalences par écosystème : chaque fonction du standard déclinée dans ta stack, consignée dans /docs/toolchain.md.",
    objectifs: [
      'Retrouver l’équivalent d’un outil dans ta stack',
      'Remplir le /docs/toolchain.md du projet',
      'Connaître les vigilances de licences (Redis, Vault, k6)',
    ],
  },
  {
    id: 'archi', doc: '04-regles-architecture.md', titre: 'Architecture', icone: 'Layers', couleur: '#1b2a9e', x: 58, y: 62,
    etape: 'Construction', prerequis: ['git'],
    resume: "Les règles bloquantes vérifiées en CI : couches, outbox, migrations expand/contract, audit write-ahead, résilience, cache, corrélation.",
    objectifs: [
      'Publier un événement via l’outbox (jamais en direct)',
      'Écrire une migration expand/contract',
      'Mettre timeout + retry idempotent sur un appel réseau',
    ],
  },
  {
    id: 'api', doc: '11-conception-api.md', titre: 'Conception d’API', icone: 'Plug', couleur: '#f28c1f', x: 71, y: 70,
    etape: 'Construction', prerequis: ['archi'],
    resume: "Erreurs RFC 9457, pagination par curseur, clés d'idempotence, rate limiting, webhooks signés, dépréciation outillée.",
    objectifs: [
      'Créer une route conforme de bout en bout',
      'Normaliser les erreurs en Problem Details',
      'Choisir curseur vs offset en connaissance de cause',
    ],
  },
  {
    id: 'gabarits', doc: '10-gabarits.md', titre: 'Gabarits', icone: 'ClipboardList', couleur: '#1b2a9e', x: 58, y: 84,
    etape: 'Référence', prerequis: ['archi'],
    resume: "ADR, runbook, postmortem, rapport d'anomalie, SECURITY.md, security.txt, toolchain — à adapter, jamais à copier tel quel.",
    objectifs: [
      'Rédiger une ADR en 10 lignes',
      'Savoir quel gabarit sortir dans quelle situation',
    ],
  },
  {
    id: 'tests', doc: '05-strategie-tests.md', titre: 'Tests', icone: 'FlaskConical', couleur: '#f28c1f', x: 62, y: 44,
    etape: 'Qualité', prerequis: ['archi'],
    resume: "La pyramide appliquée, critères d'entrée/sortie, gestion des anomalies, tests de contrat, budget de performance en CI.",
    objectifs: [
      'Tester une permission dans les deux sens',
      'Écrire des critères Given/When/Then avant de coder',
      'Qualifier une anomalie (sévérité ≠ priorité)',
    ],
  },
  {
    id: 'securite', doc: '06-securite-developpeur.md', titre: 'Sécurité', icone: 'ShieldCheck', couleur: '#e8262d', x: 74, y: 50,
    etape: 'Sécurité', prerequis: ['archi'],
    resume: "Revue sécurité bloquante, grille de revue, supply chain avec quarantaine, incidents S1/S2/S3, règles IA/MCP, mapping OWASP Top 10.",
    objectifs: [
      'Dérouler la grille de revue sécurité sur une PR',
      'Faire passer une nouvelle dépendance par le processus complet',
      'Classer un incident S1/S2/S3 et réagir',
    ],
  },
  {
    id: 'donnees', doc: '15-gouvernance-des-donnees.md', titre: 'Données', icone: 'Database', couleur: '#1b2a9e', x: 86, y: 58,
    etape: 'Gouvernance', prerequis: ['securite'],
    resume: "Classification (publique → sensible), finalités dans le schéma, rétentions en code, anonymisation testée, droits des personnes.",
    objectifs: [
      'Classer toute nouvelle colonne à la revue',
      'Implémenter une purge de rétention',
      'Vérifier une anonymisation par un test',
    ],
  },
  {
    id: 'cicd', doc: '07-cicd-supply-chain.md', titre: 'CI/CD', icone: 'Workflow', couleur: '#f28c1f', x: 78, y: 32,
    etape: 'Livraison', prerequis: ['tests', 'securite'],
    resume: "Le pipeline 8 étapes bloquantes, IaC sans exception, SBOM, signatures, rollback testé, métriques DORA.",
    objectifs: [
      'Lire le pipeline du projet étape par étape',
      'Comprendre pourquoi un re-run sans correction est interdit',
      'Suivre les 4 métriques DORA',
    ],
  },
  {
    id: 'exploitation', doc: '08-exploitation-observabilite.md', titre: 'Exploitation', icone: 'Gauge', couleur: '#1b2a9e', x: 90, y: 24,
    etape: 'Exploitation', prerequis: ['cicd'],
    resume: "Supervision hors production, SLO et budget d'erreur, alertes avec runbooks, sauvegardes immuables, astreinte, matrice d'arbitrage.",
    objectifs: [
      'Relier chaque alerte à son runbook',
      'Expliquer la règle du budget d’erreur',
      'Savoir qui tranche dans chaque conflit (matrice)',
    ],
  },
  {
    id: 'projet', doc: '12-cycle-de-vie-projet.md', titre: 'Cycle projet', icone: 'Map', couleur: '#1b2a9e', x: 44, y: 30,
    etape: 'Pilotage', prerequis: ['git'],
    resume: "Les portes J0→J(n+3), la Definition of Ready d'un ticket, les changements de périmètre, les registres qui protègent l'équipe.",
    objectifs: [
      'Vérifier la Definition of Ready avant de coder',
      'Router un changement de périmètre demandé « à l’oral »',
      'Savoir ce qui se passe à chaque porte',
    ],
  },
  {
    id: 'mco', doc: '13-vie-du-produit-mco.md', titre: 'Vie du produit', icone: 'RefreshCw', couleur: '#f28c1f', x: 92, y: 42,
    etape: 'Vie du produit', prerequis: ['exploitation'],
    resume: "SemVer, les trois circuits de changement en production, gestion EOL, SLA chiffrés, migration de données, réversibilité testée.",
    objectifs: [
      'Choisir le bon circuit de changement (standard/normal/urgent)',
      'Tenir l’inventaire EOL',
      'Expliquer pourquoi une réversibilité non testée n’existe pas',
    ],
  },
  {
    id: 'audit', doc: '14-auto-audit.md', titre: 'Auto-audit', icone: 'SearchCheck', couleur: '#e8262d', x: 66, y: 16,
    etape: 'Contrôle continu', prerequis: ['securite', 'exploitation'],
    resume: "La checklist trimestrielle par preuve : accès, configuration, audit trail, sauvegardes, supply chain, dette. « Tu constates, tu ne supposes pas. »",
    objectifs: [
      'Dérouler la checklist trimestrielle',
      'Transformer chaque écart en ticket daté',
      'Produire une restitution recalculable',
    ],
  },
  {
    id: 'risques', doc: '17-registre-risques-derogations.md', titre: 'Risques & dérogations', icone: 'AlertTriangle', couleur: '#e8262d', x: 50, y: 12,
    etape: 'Contrôle continu', prerequis: ['audit'],
    resume: "Le registre vivant : risques avec plan daté, dérogations avec ADR, contrôle compensatoire et date de résorption. Un risque sans plan daté est un vœu.",
    objectifs: [
      'Distinguer risque et dérogation',
      'Inscrire une dérogation complète (ADR + compensatoire + résorption)',
      'Faire vivre le registre à chaque COPROJ',
    ],
  },
  {
    id: 'platform', doc: '18-platform-engineering.md', titre: 'Platform engineering', icone: 'Route', couleur: '#f28c1f', x: 66, y: 4,
    etape: 'Industrialisation', prerequis: ['cicd'],
    resume: "Golden paths, templates pré-conformes, catalogue de services, conformité automatisée : le chemin conforme doit être le chemin le plus facile.",
    objectifs: [
      'Créer un service depuis le template golden path',
      'Tenir le catalogue de services à jour',
      'Savoir quand un écart au golden path exige une ADR',
    ],
  },
  {
    id: 'ia', doc: '19-gouvernance-ia-et-agents.md', titre: 'IA & agents', icone: 'Bot', couleur: '#1b2a9e', x: 94, y: 70,
    etape: 'Gouvernance', prerequis: ['securite'],
    resume: "Assistants IA et agents MCP : usages permis, données interdites dans les prompts, confirmation humaine des écritures sensibles, anti tool-poisoning, audit intégral.",
    objectifs: [
      'Connaître les usages permis/interdits des assistants IA',
      'Expliquer pourquoi le mergeur reste l’auteur responsable',
      'Vérifier les garde-fous MCP (OAuth 2.1, confirmation humaine, journal)',
    ],
  },
]

export const liens = modules.flatMap(m => m.prerequis.map(p => [p, m.id]))
