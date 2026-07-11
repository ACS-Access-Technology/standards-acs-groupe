// Quiz de validation — palier "application", pas juste "lecture".
// Question dernier bloc = scénario violation [MUST] (couvre le cas limite : que fait le guard, que dois-tu faire).

export const quiz = [
  {
    q: "Un [MUST] est ignoré dans ta PR. Qu'est-ce qui est requis pour que ce soit accepté ?",
    options: [
      "Rien, c'est au reviewer de trancher au cas par cas",
      "Une ADR approuvée consignant la dérogation",
      "Un commentaire dans le code expliquant le choix",
      "L'accord oral du tech lead suffit",
    ],
    correct: 1,
  },
  {
    q: "Un [SHOULD] est ignoré sans justification en review. Que se passe-t-il ?",
    options: [
      "Rien, [SHOULD] est juste indicatif",
      "La PR est bloquée comme pour un [MUST]",
      "Le reviewer doit refuser tant qu'aucune justification n'est écrite dans la review",
      "Ça dépend de l'humeur du reviewer",
    ],
    correct: 2,
  },
  {
    q: "Un [MAY] dans le standard signifie :",
    options: [
      "Obligatoire mais avec un délai de tolérance",
      "Optionnel — laissé au jugement de l'équipe",
      "Interdit sauf dérogation",
      "Applicable uniquement en production",
    ],
    correct: 1,
  },
  {
    q: "Tu commites un secret par erreur. Premier réflexe correct ?",
    options: [
      "Supprimer le fichier et faire un nouveau commit",
      "Attendre que quelqu'un le remarque",
      "Révoquer/rotation immédiate du secret, puis traiter l'historique git",
      "Le laisser, un commit privé n'est pas exposé",
    ],
    correct: 2,
  },
  {
    q: "acs-dev-guard bloque ta PR sur un item classé « always active » (ex: secret détecté). Tu peux :",
    options: [
      "Merger quand même si la deadline presse",
      "Utiliser --no-verify pour bypasser le check",
      "Corriger l'item bloquant — ces checks ne s'ouvrent pas au cas par cas",
      "Demander au guard de faire une exception ponctuelle",
    ],
    correct: 2,
  },
  {
    q: "Une nouvelle dépendance externe doit être ajoutée au projet. Que dit le standard ?",
    options: [
      "Ajout libre si le package est populaire (>1000 stars)",
      "Elle passe par un processus explicite (justification, vérif, traçabilité) — pas un simple npm install",
      "Aucune contrainte, c'est un détail d'implémentation",
      "Seul le lead peut ajouter des dépendances, sans autre vérification",
    ],
    correct: 1,
  },
  {
    q: "Tu ouvres un module dont les prérequis ne sont pas tous terminés. Que permet le parcours ?",
    options: [
      "Rien, le module reste totalement inaccessible",
      "Tu peux quand même le lire, mais il reste marqué verrouillé/non débloqué",
      "Il faut contacter un admin pour un accès manuel",
      "Le module se débloque automatiquement après 24h",
    ],
    correct: 1,
  },
  {
    q: "Un incident de sécurité est classé S1/S2/S3. Cette classification sert à :",
    options: [
      "Décider qui doit être informé sur Slack",
      "Déterminer la gravité et donc l'urgence/le protocole de réaction",
      "Uniquement pour les statistiques trimestrielles",
      "Choisir quel service redémarrer en premier",
    ],
    correct: 1,
  },
  {
    q: "Scénario — ton diff modifie un fichier de config et supprime une validation de permission jugée « inutile ». C'est un [MUST] du standard sécurité. Le guard le bloque. Que fais-tu ?",
    options: [
      "Tu retires la validation quand même car ton use case ne l'exige pas",
      "Tu restaures la validation, ou tu ouvres une ADR argumentée avant tout merge",
      "Tu ignores le blocage, ce n'est qu'un avertissement",
      "Tu attends que le guard soit mis à jour pour ne plus bloquer ce cas",
    ],
    correct: 1,
  },
  {
    q: "Scénario (suite) — ton ADR pour la dérogation ci-dessus est écrite mais pas encore approuvée. Peux-tu merger ?",
    options: [
      "Oui, l'ADR étant rédigée, l'intention suffit",
      "Non — une dérogation à un [MUST] exige une ADR *approuvée*, pas seulement rédigée",
      "Oui, si le CI passe par ailleurs",
      "Oui, à condition de merger un vendredi",
    ],
    correct: 1,
  },
]
