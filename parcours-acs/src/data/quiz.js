// Quiz de validation par module — même pattern que lectures.js (clé = id du module).
// 3-4 QCM par module, tirés des pièges classiques du niveau intermédiaire.
// Seuil de réussite : 75 % (voir Quiz.vue).

export const quiz = {
  accueil: [
    {
      q: "Le corpus ACS Groupe est présenté comme :",
      options: ["Indicatif, à adapter librement", "Contractuel — non conforme = non terminé", "Une checklist optionnelle post-livraison", "Réservé aux nouveaux arrivants"],
      correct: 1,
      explication: "\"Contractuel, pas indicatif\" : le standard gagne en cas de conflit avec la vitesse.",
    },
    {
      q: "Un [SHOULD] ignoré en revue, sans justification écrite, c'est :",
      options: ["Toléré, [SHOULD] n'est qu'une suggestion", "Bloquant tant que la justification n'est pas écrite en revue", "À la discrétion du reviewer, sans trace", "Applicable seulement en production"],
      correct: 1,
    },
    {
      q: "Une dérogation à un [MUST] exige :",
      options: ["Un commentaire de code expliquant le choix", "Une ADR approuvée", "L'accord oral du tech lead", "Rien, si le délai presse"],
      correct: 1,
    },
  ],
  onboarding: [
    {
      q: "Avant tout accès au code au Jour 1, l'onboarding impose :",
      options: ["Une checklist poste de travail", "Rien de particulier, l'accès Git suffit", "Une revue de code d'un projet existant", "La lecture de tout le corpus en une fois"],
      correct: 0,
    },
    {
      q: "Le cycle Joiner / Mover / Leaver sert à :",
      options: ["Suivre uniquement les départs", "Tracer les accès à l'arrivée, au changement de rôle et au départ", "Planifier les congés", "Gérer les promotions"],
      correct: 1,
    },
    {
      q: "Les preuves d'onboarding sont :",
      options: ["Facultatives si le manager fait confiance", "Auditables — elles doivent exister et être datées", "Uniquement orales en entretien", "Supprimées après la période d'essai"],
      correct: 1,
    },
  ],
  code: [
    {
      q: "Le nommage et les messages de commit sont, par défaut :",
      options: ["En français toujours", "En anglais, sauf consigne client explicite contraire", "Libres, au choix du dev", "Bilingues systématiquement"],
      correct: 1,
    },
    {
      q: "Les textes destinés à l'utilisateur (i18n) doivent être externalisés :",
      options: ["Avant la mise en production seulement", "Dès le premier commit — jamais de chaîne en dur", "Uniquement si le produit vise plusieurs pays", "Après validation UX finale"],
      correct: 1,
    },
    {
      q: "L'accessibilité (a11y) dans le standard de code vise :",
      options: ["WCAG 2.2 AA", "Un simple contraste de couleur suffisant", "Aucune norme précise, au jugé", "WCAG niveau A uniquement"],
      correct: 0,
    },
  ],
  git: [
    {
      q: "Le modèle de branches retenu par le standard est :",
      options: ["Git flow avec branches de release longues", "Trunk-based, avec des branches courtes", "Un seul commit direct sur main", "Un fork par développeur sans PR"],
      correct: 1,
    },
    {
      q: "Le format imposé pour les messages de commit est :",
      options: ["Libre tant que c'est en anglais", "Conventional Commits (feat:, fix:, security:…)", "Un simple résumé d'une ligne sans préfixe", "Le ticket Jira uniquement"],
      correct: 1,
    },
    {
      q: "Un secret commité par erreur est traité comme :",
      options: ["Un simple oubli à corriger au prochain commit", "Compromis — rotation immédiate requise, pas juste suppression", "Sans gravité si le dépôt est privé", "À signaler seulement s'il fuite publiquement"],
      correct: 1,
    },
    {
      q: "Une PR respecte la règle de taille quand :",
      options: ["Elle traite un seul sujet, diff < 400 lignes effectives", "Elle regroupe plusieurs sujets pour gagner du temps", "Elle dépasse 1000 lignes si bien documentée", "La taille n'a pas d'importance si les tests passent"],
      correct: 0,
    },
  ],
  toolchain: [
    {
      q: "La table d'équivalences par écosystème sert à :",
      options: ["Imposer un seul langage à tous les projets", "Garder le standard indépendant de la stack tout en outillant chaque écosystème", "Remplacer le dossier d'architecture", "Choisir la base de données par défaut"],
      correct: 1,
    },
    {
      q: "Le choix d'un nouvel outil doit passer par :",
      options: ["Des critères d'acceptation documentés (licence, santé du projet, etc.)", "Un simple vote d'équipe informel", "L'habitude du dernier projet", "Aucun critère particulier"],
      correct: 0,
    },
    {
      q: "Pour les dépendances critiques, le standard recommande [SHOULD] de vérifier :",
      options: ["Le nombre d'étoiles GitHub uniquement", "Un score OpenSSF Scorecard", "La couleur du logo du projet", "La popularité sur les réseaux sociaux"],
      correct: 1,
    },
  ],
  archi: [
    {
      q: "Un événement métier doit être publié :",
      options: ["Directement sur le bus dès qu'il se produit", "Via un transactional outbox, écrit dans la transaction métier", "Par un cron nocturne", "Seulement si l'event bus est disponible"],
      correct: 1,
    },
    {
      q: "L'autorisation dans le standard est vérifiée :",
      options: ["Une seule fois, côté API gateway", "À trois niveaux indépendants : bordure, application, base de données", "Uniquement côté frontend", "Seulement pour les rôles admin"],
      correct: 1,
    },
    {
      q: "Une action d'administration doit être journalisée :",
      options: ["Après exécution, si elle réussit", "Avant l'action (write-ahead) ; l'indisponibilité de l'audit refuse la requête", "Seulement en cas d'incident", "Uniquement pour les suppressions"],
      correct: 1,
    },
    {
      q: "Une migration destructive (rename/drop) doit suivre :",
      options: ["Un pattern expand/contract", "Une exécution directe en heures creuses", "Un simple backup préalable suffisant", "Aucune règle particulière si la table est petite"],
      correct: 0,
    },
  ],
  api: [
    {
      q: "Les erreurs d'API du standard suivent :",
      options: ["Un format libre par service", "RFC 9457 (Problem Details)", "De simples codes HTTP sans corps", "XML uniquement"],
      correct: 1,
    },
    {
      q: "Les écritures sensibles (paiement, création) doivent être :",
      options: ["Idempotentes via une clé dédiée", "Rejouables sans contrôle", "Protégées uniquement par le rate limit", "Réservées aux clients internes"],
      correct: 0,
    },
    {
      q: "BOLA / BFLA désignent :",
      options: ["Des formats de pagination", "Des failles d'autorisation par objet/fonction à tester obligatoirement", "Des standards de nommage d'endpoint", "Des méthodes HTTP dépréciées"],
      correct: 1,
    },
  ],
  gabarits: [
    {
      q: "Une ADR (Architecture Decision Record) est pensée pour tenir :",
      options: ["Sur plusieurs pages détaillées", "En 10 lignes maximum", "Dans un simple message Slack", "Dans le titre de la PR uniquement"],
      correct: 1,
    },
    {
      q: "Un postmortem doit être rendu :",
      options: ["Sous 5 jours ouvrés, sans blâme", "Dans l'heure suivant l'incident", "Seulement si un client s'est plaint", "Un mois après, une fois \"à froid\""],
      correct: 0,
    },
    {
      q: "Le gabarit SECURITY.md a une structure :",
      options: ["Libre, au choix du mainteneur", "Imposée par le standard", "Facultative pour les projets internes", "Uniquement en anglais"],
      correct: 1,
    },
  ],
  tests: [
    {
      q: "La qualité, dans une logique shift-left, se décide :",
      options: ["En fin de sprint, à la recette", "En amont, dès la conception", "Uniquement par la QA", "Après la mise en production"],
      correct: 1,
    },
    {
      q: "La suite de sécurité dédiée est :",
      options: ["Optionnelle selon le projet", "Bloquante en CI", "Réservée aux audits annuels", "Exécutée seulement en pré-production"],
      correct: 1,
    },
    {
      q: "Un test instable (flaky) doit être :",
      options: ["Ignoré silencieusement", "Mesuré, puis mis en quarantaine — jamais désactivé sans trace", "Supprimé définitivement", "Relancé indéfiniment jusqu'au succès"],
      correct: 1,
    },
  ],
  securite: [
    {
      q: "Face à un [MUST] de sécurité bloqué par acs-dev-guard, la bonne réaction est :",
      options: ["Utiliser --no-verify pour avancer", "Corriger l'item, ou ouvrir une ADR approuvée avant tout merge", "Attendre une mise à jour du guard", "Merger si la deadline presse"],
      correct: 1,
    },
    {
      q: "Une nouvelle dépendance externe doit passer par :",
      options: ["Un simple npm install sans trace", "Un processus explicite : justification, vérification, quarantaine", "L'accord oral d'un collègue", "Aucun contrôle si le paquet est populaire"],
      correct: 1,
    },
    {
      q: "La classification S1/S2/S3 d'un incident sert à :",
      options: ["Choisir le canal Slack", "Déterminer la gravité et le protocole de réaction associé", "Compter les incidents pour les statistiques trimestrielles seulement", "Décider qui prend ses congés"],
      correct: 1,
    },
  ],
  donnees: [
    {
      q: "Toute donnée du schéma doit avoir :",
      options: ["Une classification obligatoire", "Un simple commentaire optionnel", "Une classification seulement si elle est personnelle", "Aucune exigence particulière"],
      correct: 0,
    },
    {
      q: "En dehors de la production, les données doivent être :",
      options: ["Copiées telles quelles pour fiabilité des tests", "Anonymisées", "Chiffrées mais identiques aux données réelles", "Accessibles à toute l'équipe sans restriction"],
      correct: 1,
    },
    {
      q: "Les droits des personnes (accès, rectification, effacement) doivent être :",
      options: ["Réellement opérables, pas seulement déclarés", "Traités au cas par cas sans procédure", "Réservés aux clients premium", "Gérés uniquement par le support"],
      correct: 0,
    },
  ],
  cicd: [
    {
      q: "L'Infrastructure as Code s'applique :",
      options: ["Uniquement à la production", "À tout, sans exception", "Seulement si l'équipe DevOps le demande", "Aux environnements de test uniquement"],
      correct: 1,
    },
    {
      q: "Le standard exige combien d'environnements, au minimum ?",
      options: ["Deux (dev, prod)", "Trois", "Quatre, jamais moins", "Un seul avec des feature flags"],
      correct: 2,
    },
    {
      q: "Dans un workflow CI, les actions tierces doivent être épinglées :",
      options: ["Par tag de version (ex: v4)", "Par SHA de commit, jamais par tag", "Par branche latest", "Sans épinglage, la dernière version suffit"],
      correct: 1,
    },
  ],
  exploitation: [
    {
      q: "La production doit être supervisée :",
      options: ["Depuis l'intérieur d'elle-même uniquement", "Depuis l'extérieur d'elle-même (invariant)", "Seulement pendant les heures ouvrées", "Par les seuls développeurs qui l'ont livrée"],
      correct: 1,
    },
    {
      q: "La règle de sauvegarde retenue par le standard est :",
      options: ["3-2-1 avec verrou d'écriture, restauration testée mensuellement", "Une copie quotidienne suffit", "Sauvegarde manuelle avant chaque déploiement", "Aucune règle formelle, au cas par cas"],
      correct: 0,
    },
    {
      q: "Ce qui constitue réellement la garantie d'une sauvegarde, c'est :",
      options: ["Le fait qu'elle existe sur disque", "La restauration testée régulièrement", "Sa taille en Go", "Sa fréquence uniquement"],
      correct: 1,
    },
  ],
  projet: [
    {
      q: "Le cycle de vie projet du standard avance par :",
      options: ["Des pourcentages d'avancement", "Des portes (gates), pas des pourcentages", "Des sprints fixes sans jalon", "Des dates fixées au démarrage uniquement"],
      correct: 1,
    },
    {
      q: "La Definition of Ready d'un ticket doit être vérifiée :",
      options: ["Après le développement, en recette", "Avant de coder", "Seulement pour les tickets complexes", "Jamais formellement, au feeling"],
      correct: 1,
    },
    {
      q: "Un changement de périmètre en cours de projet doit être :",
      options: ["Absorbé silencieusement par l'équipe", "Tracé et arbitré via le processus prévu, pas improvisé", "Refusé systématiquement", "Décidé uniquement par le développeur en charge"],
      correct: 1,
    },
  ],
  mco: [
    {
      q: "L'entrée en MCO (maintien en condition opérationnelle) suppose que :",
      options: ["L'exploitation peut refuser la mise en production", "La mise en production est automatique dès la fin du dev", "Seul le chef de projet décide, sans avis exploitation", "Le MCO commence après le premier incident"],
      correct: 0,
    },
    {
      q: "Les changements en production suivent :",
      options: ["Un seul circuit unique pour tout type de changement", "Trois circuits distincts, jamais mélangés", "Aucun circuit formalisé", "Un circuit différent par développeur"],
      correct: 1,
    },
    {
      q: "La réversibilité et la fin de vie d'un service doivent être :",
      options: ["Anticipées, pas improvisées à la fermeture", "Ignorées tant que le service tourne", "Traitées uniquement en cas d'incident majeur", "Décidées le jour de la coupure"],
      correct: 0,
    },
  ],
  audit: [
    {
      q: "L'auto-audit du corpus se fait à quelle fréquence ?",
      options: ["Annuelle uniquement", "Trimestrielle", "Une seule fois, à la mise en production", "Mensuelle sur tous les contrôles"],
      correct: 1,
    },
    {
      q: "L'evidence log de l'auto-audit est :",
      options: ["Facultatif si l'équipe est petite", "Obligatoire — chaque contrôle a une preuve datée", "Optionnel pour les contrôles [SHOULD]", "Réservé aux audits externes"],
      correct: 1,
    },
    {
      q: "Le contrôle jugé le plus important dans la checklist trimestrielle est :",
      options: ["Le contrôle d'accès", "Les coûts FinOps", "Le nombre de commits", "La couverture de tests uniquement"],
      correct: 0,
    },
  ],
  risques: [
    {
      q: "Un risque et une dérogation sont :",
      options: ["La même chose, interchangeables", "Deux notions distinctes, à ne pas confondre", "Toujours liés à un incident passé", "Gérés dans le même registre sans distinction"],
      correct: 1,
    },
    {
      q: "Une dérogation enregistrée doit avoir :",
      options: ["Un contrôle compensatoire et une date de résorption", "Juste une justification orale", "Aucune limite de temps", "Une validation facultative"],
      correct: 0,
    },
    {
      q: "Au niveau de maturité 3 (« International »), les dérogations doivent être :",
      options: ["Nombreuses mais documentées", "Toutes résorbées ou compensées", "Ignorées si mineures", "Transférées au niveau 2"],
      correct: 1,
    },
  ],
  platform: [
    {
      q: "Un golden path dans le standard désigne :",
      options: ["Un raccourci pour éviter la revue de code", "Un dépôt/template pré-conforme au standard dès la création", "Une exception validée pour les projets urgents", "Un chemin de déploiement manuel"],
      correct: 1,
    },
    {
      q: "La conformité automatisée (policy-as-code) sert à :",
      options: ["Remplacer les revues humaines complètement", "Vérifier en continu que les projets respectent le standard", "Documenter le standard sous forme de wiki", "Suivre uniquement les coûts cloud"],
      correct: 1,
    },
    {
      q: "L'adoption des golden paths se mesure via :",
      options: ["Le ressenti des équipes", "Des métriques d'adoption suivies dans le temps", "Un sondage annuel unique", "Le nombre de repos créés, sans plus"],
      correct: 1,
    },
  ],
  ia: [
    {
      q: "L'usage d'un assistant IA en développement est :",
      options: ["Totalement libre, sans traçabilité", "Encadré : usages permis/interdits, traçabilité, validation humaine", "Interdit sur tout le corpus", "Réservé aux seniors uniquement"],
      correct: 1,
    },
    {
      q: "Une dépendance suggérée par une IA doit être :",
      options: ["Installée directement si le nom semble familier", "Vérifiée — risque d'hallucination ou de typosquatting", "Ignorée, l'IA ne suggère jamais de dépendances", "Ajoutée seulement en développement, jamais en prod"],
      correct: 1,
    },
    {
      q: "Sur une décision engageant le projet, le standard rappelle que :",
      options: ["Un agent IA peut valider seul si la tâche est simple", "L'humain décide toujours, l'agent propose", "La décision finale revient au modèle le plus récent", "Aucune validation n'est requise si le code compile"],
      correct: 1,
    },
    {
      q: "Un outil de type « dev guard » (comme acs-dev-guard) est :",
      options: ["Un substitut à la revue humaine", "Un garde-fou automatisé, pas un substitut à la revue humaine", "Optionnel une fois la CI verte", "Utile uniquement en phase d'audit"],
      correct: 1,
    },
  ],
}
