// Lectures par profil — la RÈGLE est unique (le corpus), seule l'EXPLICATION s'adapte.
// junior : explication simple + analogie + exemple concret
// intermediaire : résumé + piège classique
// senior : la règle, sèche

export const profils = [
  { id: 'junior', label: 'Junior' },
  { id: 'intermediaire', label: 'Intermédiaire' },
  { id: 'senior', label: 'Senior' },
]

export const lectures = {
  accueil: {
    junior: {
      simple: "Le corpus, c'est le règlement du jeu : 7 règles jamais négociables et des documents qui expliquent comment on travaille ici. Tu n'as pas à tout retenir d'un coup — le parcours te les fait découvrir dans le bon ordre.",
      analogie: "C'est le code de la route avant de conduire : tu n'apprends pas toutes les routes par cœur, tu apprends les règles qui évitent l'accident.",
      exemple: "Avant ta première PR, tu sauras déjà pourquoi on ne pousse jamais sur main et pourquoi un secret ne va jamais dans le code.",
    },
    intermediaire: {
      resume: "Les 7 invariants (Zero Trust, défense en profondeur, journalisation totale, outbox, sauvegardes immuables, supervision hors production, supply chain maîtrisée), la convention [MUST]/[SHOULD] et la gouvernance du standard vivant.",
      piege: "Traiter le standard comme de la documentation indicative — il est contractuel : une Definition of Done non satisfaite = travail non terminé.",
    },
    senior: { regle: "Tout est [MUST] sauf marquage contraire ; dérogation = ADR approuvée ; 7 invariants non négociables. Le README est la table d'orientation du corpus." },
  },
  onboarding: {
    junior: {
      simple: "Ton arrivée est balisée : accès avec MFA obligatoire, environnement local, puis une première petite PR accompagnée — à ton rythme, mais dans cet ordre. Les 6 interdictions absolues sont à connaître par cœur — elles protègent la plateforme, et toi avec.",
      analogie: "C'est l'accueil sécurité d'un chantier : casque d'abord (MFA), zones interdites ensuite (la production), puis on te confie l'outillage.",
      exemple: "La doc d'installation ne marche pas chez toi ? La corriger EST ta première PR.",
    },
    intermediaire: {
      resume: "Parcours d'arrivée : accès tracés au moindre privilège, interdictions absolues, sources de vérité, poste de travail durci, preuves d'onboarding et revue d'accès à J+30.",
      piege: "Demander un accès production « pour aller plus vite » — jamais accordé, par conception : les devs n'ont pas d'accès en écriture à la prod.",
    },
    senior: { regle: "MFA avant tout accès ; aucun accès dev en écriture prod ; 6 interdictions absolues ; première PR < 400 lignes en binôme ; revue d'accès J+30 et à chaque changement de rôle." },
  },
  code: {
    junior: {
      simple: "Le formateur et l'analyse statique font le ménage à ta place : ton code est vérifié automatiquement avant même la revue humaine. Et quelques règles universelles t'évitent les bugs les plus connus du métier : dates en UTC, jamais d'argent en flottant, textes utilisateur externalisés.",
      analogie: "L'analyse statique, c'est le correcteur orthographique du code : tu écris, il souligne, tu corriges avant de publier.",
      exemple: "0.1 + 0.2 n'est pas égal à 0.3 en flottant — c'est exactement pour ça qu'un montant se stocke en centimes entiers.",
    },
    intermediaire: {
      resume: "Formatage automatique (le style ne se discute pas en revue), typage le plus strict du langage, analyse statique au niveau max, i18n dès le premier commit, règles dates/monnaie/concurrence/idempotence, code IA relu comme du code humain.",
      piege: "Supprimer un avertissement d'analyse statique sans justification en commentaire — refusé en revue, chaque suppression s'explique.",
    },
    senior: { regle: "Typage max, zéro erreur statique, suppressions justifiées, i18n premier commit, UTC/décimal/idempotence/verrou optimiste, seuils mesurables consignés dans /docs/toolchain.md." },
  },
  git: {
    junior: {
      simple: "On travaille en branches courtes (moins de 3 jours) qu'on fusionne vite. Chaque commit annonce ce qu'il fait avec un préfixe (feat:, fix:…) — c'est ce qui génère le changelog tout seul. Et main est protégée : personne n'y pousse directement, même pas le chef.",
      analogie: "La PR, c'est une porte avec un vigile (la CI) et un témoin (le relecteur) : il faut que les deux disent oui.",
      exemple: "Ta PR fait 800 lignes ? Découpe-la : une PR = un sujet, moins de 400 lignes de diff effectif.",
    },
    intermediaire: {
      resume: "Trunk-based, Conventional Commits, CI verte + 1 revue (2 sur zone sensible, revue sécurité bloquante ≤ 24 h), CODEOWNERS, labels de risque, scan de secrets pre-commit + CI, SemVer et tags signés.",
      piege: "Un secret commité « supprimé au commit suivant » — trop tard, il est dans l'historique (clones, forks, caches) : rotation immédiate obligatoire.",
    },
    senior: { regle: "Trunk-based, branches < 3 j, PR < 400 lignes mono-sujet, main intouchable, 2 revues zones sensibles, gitleaks pre-commit + CI, fuite = secret compromis." },
  },
  toolchain: {
    junior: {
      simple: "Chaque fonction du standard (formater, tester, scanner les dépendances…) a son outil dans TA stack : ce document est la table de correspondance. Ton projet consigne ses choix dans /docs/toolchain.md.",
      analogie: "C'est la même recette avec des ustensiles différents selon la cuisine : PHP, JavaScript ou Python, la fonction reste identique.",
      exemple: "« Tests d'architecture » = Deptrac en PHP, dependency-cruiser en JS/TS, ArchUnit en Java.",
    },
    intermediaire: {
      resume: "Table d'équivalences par écosystème, fonctions indépendantes du langage (SBOM, signature, SIEM…), exigence d'isolation au niveau du moteur BDD, critères d'acceptation d'un outil et vigilances de licences.",
      piege: "Adopter un outil hors liste sans validation — tout outil passe les critères (licence, souveraineté, données traitées, santé du mainteneur, plan de sortie).",
    },
    senior: { regle: "Déclinaison projet obligatoire dans /docs/toolchain.md ; isolation moteur BDD exigée ou mécanisme compensatoire justifié ; vigilances : Redis ≥ 7.4, Vault/BUSL, k6/AGPL." },
  },
  archi: {
    junior: {
      simple: "Le code est rangé en couches : le contrôleur reçoit, le service décide, le repository accède aux données. Un module ne fouille jamais dans un autre — il passe par un contrat ou un événement. Bonne nouvelle : la CI vérifie ces règles automatiquement, elle te préviendra.",
      analogie: "Une cuisine de restaurant : le serveur (contrôleur) ne cuisine pas, le chef (service) ne sert pas en salle, et personne ne pioche dans le frigo d'un autre poste.",
      exemple: "Afficher des données d'un autre module dans un tableau de bord ? Read model dédié — jamais une boucle d'appels (c'est le fameux N+1).",
    },
    intermediaire: {
      resume: "Couches strictes vérifiées en CI, frontières de modules par contrat/événement, transactional outbox, migrations expand/contract, contract-first, audit write-ahead, défense en profondeur, doctrines de résilience et de cache, corrélation.",
      piege: "Publier un événement directement sur le bus — tout passe par la table outbox, écrite dans la même transaction que la donnée métier.",
    },
    senior: { regle: "Couches + frontières vérifiées CI (refus souverain), outbox obligatoire, expand/contract, write-ahead 503, 3 niveaux d'autorisation, timeouts partout, retries idempotents, cache jamais source de vérité." },
  },
  api: {
    junior: {
      simple: "Une API se conçoit contrat d'abord : tu décris la route dans OpenAPI avant de la coder. Ensuite trois réflexes : toute liste est paginée, toute erreur a le même format, et chaque route a sa policy qui dit qui a le droit.",
      analogie: "Le contrat OpenAPI, c'est le plan de l'architecte : on ne pose pas une brique avant qu'il soit validé.",
      exemple: "Ta route GET /v1/projets doit refuser un utilisateur d'une autre direction — et un test automatique doit le prouver, dans les deux sens.",
    },
    intermediaire: {
      resume: "Contract-first (premier commit), erreurs RFC 9457, pagination par curseur, clés d'idempotence, rate limiting par consommateur, webhooks signés rejouables, OAuth2/OIDC pour les externes, dépréciation outillée 12 mois.",
      piege: "Renvoyer l'entité entière par réflexe — exposition excessive : la réponse contient les champs du cas d'usage, pas plus (BOLA/BFLA se testent).",
    },
    senior: { regle: "OpenAPI = premier commit, RFC 9457, pagination systématique (curseur si volumineux), Idempotency-Key sur écritures sensibles, 429 + Retry-After, rupture = version majeure uniquement." },
  },
  gabarits: {
    junior: {
      simple: "Pas besoin d'inventer la forme : ADR, runbook, postmortem, checklist PR… tout a un gabarit prêt à remplir. Tu copies, tu remplis, c'est conforme.",
      analogie: "Des formulaires pré-imprimés : l'important, c'est ce que tu écris dedans, pas la mise en page.",
      exemple: "On te demande une ADR ? 10 lignes max : contexte, décision, alternatives écartées, conséquences, approbateur. C'est tout.",
    },
    intermediaire: {
      resume: "17 gabarits actionnables : décisions (ADR, revue d'archi), exploitation (runbook, postmortem, rollback plan), qualité (anomalie, checklist PR), sécurité (threat model, SECURITY.md), conformité (DPIA, evidence log, registres).",
      piege: "Livrer un gabarit copié tel quel sans adaptation — le gabarit est un point de départ, jamais un livrable fini.",
    },
    senior: { regle: "17 gabarits ; ADR 10 lignes ; threat model 30 min ; tout gabarit rempli vit dans le dépôt du projet (/docs/…)." },
  },
  tests: {
    junior: {
      simple: "On teste par étages : beaucoup de tests unitaires rapides, des tests d'intégration pour vérifier que les briques s'emboîtent, très peu de tests bout-en-bout. Et on écrit les critères d'acceptation AVANT de coder — tu sais où tu vas.",
      analogie: "Une pyramide : la base large et solide (unitaires) porte tout, le sommet (E2E) est étroit et précieux.",
      exemple: "Ton ticket dit « Étant donné un agent de la direction A, quand il liste les projets, alors il ne voit que ceux de A » — tu sais exactement quoi tester avant ta première ligne.",
    },
    intermediaire: {
      resume: "Pyramide contre SGBD réel, critères Given/When/Then à la Definition of Ready, suite sécurité bloquante, tests de contrat, budget de performance en CI, anomalies revérifiées par le testeur, criticité métier qui module la profondeur.",
      piege: "Fermer une anomalie sur parole du développeur — c'est le testeur qui revérifie, avec un test de non-régression qui aurait détecté le bug.",
    },
    senior: { regle: "Pyramide + SGBD réel, sécurité en arrêt premier échec, mutation testing ciblé, flaky ≤ 7 j, budget perf CI, 0 bloquante/majeure en prod, sévérité ≠ priorité." },
  },
  securite: {
    junior: {
      simple: "La sécurité fait partie de ton travail quotidien, pas d'une équipe lointaine : chaque PR sensible passe une grille de 7 questions, chaque nouvelle dépendance passe 7 jours de quarantaine, et un secret qui fuite se remplace immédiatement.",
      analogie: "La grille de revue, c'est la checklist du pilote avant décollage : un peu ennuyeuse — jusqu'au jour où elle t'évite le crash.",
      exemple: "Tu veux ajouter un package trouvé sur un forum ? Justification, santé du projet, licence, scan, puis 7 jours de quarantaine. Pas d'exception.",
    },
    intermediaire: {
      resume: "Revue bloquante sur zones sensibles avec grille explicite, threat model STRIDE versionné avant développement, ASVS L2 par défaut, veille CVE quotidienne scorée (CVSS + EPSS + exposition SBOM), SLA 72 h/7 j/30 j, security champions.",
      piege: "Valider le type MIME déclaré par le client — c'est la signature de contenu qui fait foi, jamais ce que déclare le navigateur.",
    },
    senior: { regle: "ASVS L2 défaut (L3 auth/paiement), revue sécurité bloquante ≤ 24 h ouvrées, SLA 72 h/7 j/30 j, exposition CVE < 1 h via SBOM, threat models dans /docs/threat-models/ liés aux PR." },
  },
  donnees: {
    junior: {
      simple: "Chaque donnée a une étiquette (publique, interne, personnelle, sensible) qui dit comment la traiter : chiffrement, durée de conservation, qui peut la voir. Dans le doute ? Une donnée sans étiquette est traitée comme sensible.",
      analogie: "Comme le tri sélectif, mais pour l'information : se tromper de poubelle coûte cher — ici, légalement.",
      exemple: "Hors production, jamais de vraies données : les jeux de test sont générés ou anonymisés, et l'anonymisation est elle-même testée par un test automatique.",
    },
    intermediaire: {
      resume: "Classification dans le schéma, finalités inscrites, rétentions appliquées en code (purges testées), droits des personnes outillés, anonymisation versionnée, rôles data owner/steward/DPO, lineage, déclencheurs DPIA, cadre légal local.",
      piege: "Prolonger la rétention « au cas où » — une donnée dont la durée est échue se purge ou s'anonymise : l'archivage indéfini est une non-conformité.",
    },
    senior: { regle: "Schéma 100 % classé (non classé = sensible), purges en code testées, droits opérables dans les délais légaux, DPIA sur déclencheurs, cadre légal du pays du projet — jamais recopié." },
  },
  cicd: {
    junior: {
      simple: "Le pipeline vérifie ton code en 8 étapes, toutes bloquantes : si une étape échoue, on corrige — on ne relance pas en croisant les doigts. Et personne ne modifie la production à la main : tout passe par du code versionné.",
      analogie: "Une chaîne de montage avec 8 postes de contrôle qualité : la pièce défectueuse ne passe jamais au poste suivant.",
      exemple: "Ton build échoue au scan de dépendances ? On corrige la CVE (mise à jour, ou dérogation ADR) — on ne désactive pas le scan.",
    },
    intermediaire: {
      resume: "Pipeline 8 étapes bloquantes, IaC exclusive avec drift-detection, SBOM par build, artefacts signés vérifiés au déploiement, SLSA L2 (L3 cible), provenance et attestations, rollback testé, métriques DORA trimestrielles.",
      piege: "Relancer un job qui a échoué pour « faire passer » — sans correction ou justification écrite, c'est un contournement de CI : interdiction absolue.",
    },
    senior: { regle: "8 étapes bloquantes sans re-run de complaisance, IaC drift nul, SHA-pinning, SLSA L2→L3 avec provenance signée, runners éphémères, policy-as-code, rétention des preuves release + 12 mois." },
  },
  exploitation: {
    junior: {
      simple: "Une fois en production, la plateforme est surveillée depuis un autre serveur — si un attaquant entre, il ne voit pas qu'on l'observe. Chaque alerte a sa procédure pas-à-pas (le runbook), et on s'entraîne à restaurer les sauvegardes tous les mois, pour de vrai.",
      analogie: "Les caméras d'une banque ne sont pas stockées dans le coffre : si le coffre saute, les images restent.",
      exemple: "Une alerte te réveille à 3 h du matin sans que tu puisses rien faire ? C'est un bug d'alerting — elle sera corrigée ou supprimée sous 7 jours.",
    },
    intermediaire: {
      resume: "Supervision hors production, catalogue SLI/SLO avec budget d'erreur (épuisé = gel des features), alertes 100 % runbookées, sauvegardes 3-2-1 immuables restauration mensuelle réelle, rôles de crise, postmortems sans blâme ≤ 5 j, FinOps mensuel.",
      piege: "Croire la sauvegarde « faite » parce que le fichier existe — seule la restauration testée (démarrage + intégrité applicative) compte.",
    },
    senior: { regle: "Supervision hors prod non négociable, error budget appliqué, 3-2-1 object-lock + restau mensuelle consignée, DR semestrielle chronométrée vs RTO, actions postmortem prioritaires backlog." },
  },
  projet: {
    junior: {
      simple: "Un projet avance par portes : on ne code pas avant que l'architecture soit validée, on ne met pas en production avant la recette signée. Et ton ticket doit être « prêt » avant que tu commences : critères d'acceptation écrits, impacts identifiés.",
      analogie: "Un jeu de plateau à cases obligatoires : on ne saute pas de case, même pressé — c'est ce qui évite de refaire le tour.",
      exemple: "On te demande une fonctionnalité « vite fait, à l'oral » ? Tu la routes vers le circuit de changement écrit. C'est une protection, pas de la bureaucratie.",
    },
    intermediaire: {
      resume: "Portes J0 → J(n+3) à critères objectifs, Definition of Ready, périmètre gelé par porte franchie, registres des décisions et des risques, RACI par jalon, paquet de preuves par porte, audit readiness avant production.",
      piege: "Commencer un développement sans critères Given/When/Then — un critère non testable retourne à la spécification, pas dans ton IDE.",
    },
    senior: { regle: "Pilotage par la valeur (pas « 80 % du code »), portes infranchissables sans critères tenus ou dérogation sponsor, DoR exigée, changement de périmètre = circuit écrit proportionné." },
  },
  mco: {
    junior: {
      simple: "La mise en production, c'est le début du service, pas la fin du projet. Les versions suivent SemVer, chaque changement en prod suit un circuit selon son risque, et on surveille la date de fin de vie de chaque brique pour ne jamais être surpris.",
      analogie: "Une voiture après l'achat : révisions planifiées, pièces changées avant la panne, carnet d'entretien à jour.",
      exemple: "PostgreSQL annonce la fin du support de ta version dans 5 mois ? Le plan de montée de version existe déjà — sinon c'est un écart d'audit.",
    },
    intermediaire: {
      resume: "Trois circuits de changement (standard/normal/urgent — l'urgence ne supprime jamais la trace), inventaire EOL avec plans < 6 mois, SLA pilotés par chiffres recalculables, catalogue de service, migration avec point de non-retour explicite, réversibilité testée.",
      piege: "Le correctif urgent « sans trace vu l'urgence » — l'urgence accélère le circuit (revue a posteriori sous 5 jours), elle ne supprime jamais la trace.",
    },
    senior: { regle: "SemVer strict, changement = pipeline (manuel = incident), EOL < 6 mois planifié, rapport de service mensuel recalculable, export de réversibilité testé < 12 mois." },
  },
  audit: {
    junior: {
      simple: "Chaque trimestre, l'équipe vérifie elle-même ses règles, preuves à l'appui : « je crois que c'est bon » ne compte pas — il faut la capture, le log, le test rejoué. Et on ne s'auto-note pas : c'est un collègue d'un autre domaine qui vérifie le tien.",
      analogie: "Le contrôle technique du véhicule : mieux vaut le passer soi-même régulièrement que découvrir les freins usés le jour de l'accident.",
      exemple: "Contrôle d'accès : tu essaies VRAIMENT de lire les données d'une autre direction avec un compte de test — et tu archives la preuve du refus.",
    },
    intermediaire: {
      resume: "Checklist trimestrielle par preuve reproductible, revue croisée par pair, échantillonnage documenté, evidence log versionné, scoring aligné sur les contrôles ACS-*, dashboard de remédiation entre deux audits, restitution comparée au trimestre précédent.",
      piege: "Auditer son propre travail — l'auto-validation complaisante est le mode d'échec n° 1 : revue croisée obligatoire.",
    },
    senior: { regle: "Preuve datée, reproductible, rejouable par un tiers — sinon ce n'est pas une preuve. Échantillon ≥ 10 éléments ou 10 %, findings critiques signalés immédiatement, écart récurrent = cause racine." },
  },
  risques: {
    junior: {
      simple: "Tous les risques et toutes les exceptions aux règles vivent dans un registre unique. Une exception (« dérogation ») n'existe que si elle a une ADR approuvée, une mesure de compensation et une date de fin.",
      analogie: "Un prêt à la banque : accordé par écrit, avec garantie et date de remboursement — jamais un arrangement de couloir.",
      exemple: "« On activera la RLS plus tard » ? D'accord : ADR signée, contrôle compensatoire décrit, date de résorption. Sinon, c'est une non-conformité.",
    },
    intermediaire: {
      resume: "Registre unique risques + dérogations : probabilité × impact, propriétaire, plan daté (éviter/réduire/transférer/accepter), alimenté par l'auto-audit et les postmortems, revu à chaque COPROJ et comité sécurité.",
      piege: "Le risque noté puis oublié — un risque sans plan daté est un vœu ; une dérogation expirée devient une non-conformité signalée.",
    },
    senior: { regle: "Dérogation = ADR + compensatoire + résorption datée + approbateur humain, sans exception ; revue COPROJ ; écart d'audit critique > 72 h monte automatiquement au registre." },
  },
  platform: {
    junior: {
      simple: "Plutôt que refaire la conformité à chaque projet, on la préfabrique : un template de dépôt déjà conforme (pipeline, scans, protections inclus). Créer un nouveau service conforme prend des minutes, pas des jours.",
      analogie: "Des maisons préfabriquées aux normes : l'électricité est conforme en sortie d'usine, pas vérifiée après coup.",
      exemple: "Nouveau microservice ? Tu pars du golden path : la CI 8 étapes, le scan de secrets et les gabarits sont déjà dedans.",
    },
    intermediaire: {
      resume: "Golden paths (le chemin conforme est le chemin le plus facile), templates versionnés et propagés, catalogue de services interne (absent du catalogue = n'existe pas), conformité automatisée en policy-as-code, métriques d'adoption.",
      piege: "Bricoler son propre setup « plus simple » — tout écart au golden path est une ADR, pas une préférence personnelle.",
    },
    senior: { regle: "Template pré-conforme obligatoire pour tout nouveau service, mises à jour propagées, catalogue tenu, preuves de matrice générées par CI quand c'est possible." },
  },
  ia: {
    junior: {
      simple: "L'IA t'assiste mais ne signe jamais à ta place : le code généré est relu comme du code humain — c'est TOI l'auteur au moment du merge. Et jamais de secret ni de vraie donnée dans un prompt. Les agents connectés ont moins de droits qu'un humain, jamais plus.",
      analogie: "Un stagiaire brillant mais que tu ne connais pas : tu relis tout ce qu'il produit, et tu ne lui confies pas les clés du coffre.",
      exemple: "L'IA te suggère un package ? Vérifie d'abord qu'il existe vraiment (les paquets « hallucinés » sont un vecteur d'attaque connu), puis processus supply chain complet.",
    },
    intermediaire: {
      resume: "Usages permis/interdits des assistants, traçabilité en PR, dépendances suggérées = processus supply chain, agents MCP durcis (OAuth 2.1+PKCE, périmètre ⊆ mandant, confirmation humaine des écritures, anti tool-poisoning), journalisation intégrale.",
      piege: "Coller un bout de config avec un jeton dedans dans un chat IA — c'est une fuite de secret : rotation immédiate, comme pour Git.",
    },
    senior: { regle: "Auteur = mergeur ; prompts sans secret/donnée réelle/code client ; MCP : ACS-IA-001 (confirmation humaine) et ACS-IA-002 (descriptions versionnées) ; sortie non fiable = donnée, jamais instruction." },
  },
}
