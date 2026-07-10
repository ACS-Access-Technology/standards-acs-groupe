# 15 — Gouvernance des données

> La donnée est gouvernée **dans le schéma**, pas seulement dans le code : classification, finalités et rétentions sont des propriétés du modèle de données, versionnées avec lui.

## 1. Classification (obligatoire pour toute donnée du schéma)

| Classe | Exemples | Obligations déclenchées |
|---|---|---|
| **Publique** | Contenus publiés, référentiels ouverts | Aucune spécifique |
| **Interne** | Données de pilotage, documents de travail | Accès authentifié, audit des modifications |
| **Personnelle** | Identité, contacts, affectations | Minimisation, finalité inscrite, rétention définie, traçabilité des accès, droits des personnes |
| **Sensible** | Secrets MFA, santé, données protégées par la loi locale | Chiffrement applicatif champ par champ, accès par permission dédiée, audit renforcé, rétention stricte |

Règles : toute nouvelle table/colonne déclare sa classe à la revue de PR ; une donnée non classée est traitée comme sensible jusqu'à classification ; la classe la plus haute d'une ligne gouverne son export.

## 2. Minimisation et finalités

- On ne collecte que les données **nécessaires à une finalité déclarée** ; la finalité est inscrite dans le schéma (commentaire de table/colonne ou registre lié), pas seulement dans un document.
- **Cloisonnement des finalités** : une donnée collectée pour la finalité A ne sert pas la finalité B sans base explicite — vérifié en revue quand une requête traverse les domaines.
- Aucune donnée biométrique sans traitement d'exception complet (enclave, autorisation du régulateur, suppression tracée).

## 3. Rétention

- Chaque catégorie de données a une **durée de rétention définie et appliquée par le code** (purge planifiée, testée), pas seulement documentée.
- La piste d'audit a une rétention distincte et prolongée, alignée sur l'obligation légale locale.
- Une donnée dont la rétention est échue est purgée ou anonymisée — l'archivage indéfini « au cas où » est une non-conformité.

## 4. Droits des personnes (réellement opérables)

- Accès, rectification, effacement : chaque droit a une **procédure outillée** avec délai conforme au cadre local, testée — pas une promesse.
- L'effacement respecte les exceptions légales (rétentions obligatoires) et les documente ; il couvre les sauvegardes selon la doctrine définie (expiration naturelle des sauvegardes + non-restauration des données effacées).
- Le registre des traitements est tenu par la maîtrise d'ouvrage avec l'assistance documentaire de l'équipe ; les déclarations à l'autorité locale (CNIL, ARTCI, équivalent) relèvent du responsable de traitement.

## 5. Anonymisation hors production

- Les environnements hors production utilisent **exclusivement** des données générées ou anonymisées.
- Les règles d'anonymisation sont **versionnées et testées elles-mêmes** (un test vérifie qu'aucun champ personnel ne survit à l'anonymisation) — une anonymisation non testée est une fuite en attente.
- L'anonymisation est irréversible (pas de table de correspondance conservée hors production).

## 6. Données de test

- Générées par factories/seeders, réalistes en volume et en distribution (les bugs de pagination et de performance n'apparaissent pas sur 10 lignes).
- Le jeu de données de pré-production est rafraîchi selon un calendrier défini, par le pipeline.

## 7. Exports et transferts

- Tout export applique la classification : les champs sensibles n'en sortent que par permission dédiée, et l'export est audité (qui a exporté quoi, quand).
- Transferts vers des tiers/sous-traitants : encadrement contractuel, minimisation des champs transmis, localisation conforme à l'exigence de souveraineté du projet.
- Les données de supervision et d'erreurs sont **purgées des données personnelles avant transmission** aux outils de suivi.

## 8. Cadre légal

Le cadre applicable est **celui du pays et du secteur du projet** — jamais recopié d'un autre projet. Il est identifié au cadrage (autorité de protection des données, agence cyber, standards sectoriels) et cité dans le dossier d'architecture. En cas de doute sur une obligation légale, la question va au juriste ; l'équipe technique ne tranche pas seule.

## 9. Rôles de gouvernance (nommés, jamais implicites)

- Chaque domaine de données a un **data owner** nommé côté métier : il décide de la classification, des finalités, des rétentions et des accès de son domaine — une donnée sans propriétaire est une donnée que personne ne défend.
- Un **data steward** (côté équipe) applique ces décisions dans le schéma, les purges et les exports, et signale au data owner tout écart entre la règle et le terrain.
- Un **DPO ou juriste référent** est identifié au cadrage — interne, mutualisé ou externe selon le contexte : il valide bases légales, transferts et DPIA ; sans lui, aucune question du §8 ne se tranche.
- Les trois rôles figurent nominativement dans le dossier de cadrage ; un rôle vacant plus de 30 jours est un risque inscrit au registre (`10-gabarits.md` §9) — un rôle vacant silencieux, c'est la gouvernance qui s'arrête sans que personne ne le sache.

## 10. Data lineage et registre des traitements

- Pour toute donnée personnelle ou sensible, le **lineage** est documenté : point d'entrée (formulaire, API, import), transformations, stockages, sorties (exports, tiers, supervision) — sans lineage, on ne peut prouver ni l'effacement ni la minimisation. Le diagramme de flux de données du dossier d'architecture (`04-regles-architecture.md` §12) en est le support ; il est mis à jour dans la PR qui crée un nouveau flux.
- Le **registre des traitements** liste, par traitement : finalité, catégories de données et de personnes, base légale, destinataires, durées de rétention, transferts, mesures de sécurité. Il est tenu par la maîtrise d'ouvrage (§4) avec l'assistance documentaire de l'équipe, versionné, et revu à chaque nouveau traitement — au plus tard à la revue de la PR qui l'introduit, pas après la mise en production.
- Tout nouveau traitement de données personnelles est **déclaré au registre avant d'exister en production** : un traitement non enregistré est une non-conformité, quelle que soit sa qualité technique.

## 11. Base légale, localisation, transferts et sous-traitants

- Chaque traitement de données personnelles cite sa **base légale** (consentement, contrat, obligation légale, intérêt légitime… selon le cadre local) dans le registre des traitements — un traitement sans base légale est illicite même s'il est utile.
- La **localisation des données** (hébergement primaire, sauvegardes, réplicas, supervision) est documentée et conforme à l'exigence de souveraineté du projet ; un changement de région d'hébergement est une décision tracée (ADR), pas un réglage d'infrastructure.
- Tout **transfert transfrontalier** est identifié dans le registre avec son mécanisme de conformité (adéquation, clauses contractuelles, autorisation de l'autorité locale) validé par le DPO/juriste — y compris les transferts invisibles : SaaS de supervision, e-mailing, CDN, support à distance.
- Chaque **sous-traitant** accédant aux données figure dans le registre avec : données accédées, localisation, encadrement contractuel, engagement de notification d'incident, et sort des données en fin de contrat. [SHOULD] Revue annuelle de la liste des sous-traitants — les intégrations s'accumulent plus vite qu'on ne les documente.

## 12. Déclencheurs de DPIA/PIA

Une **analyse d'impact** (gabarit `10-gabarits.md` §16) est obligatoire **avant développement** dès qu'un des déclencheurs suivants est présent — après coup, elle ne peut plus infléchir la conception, elle ne fait que la constater :

- traitement à grande échelle de données sensibles (§1) ou de personnes vulnérables ;
- surveillance systématique (géolocalisation, journalisation comportementale, vidéo) ;
- croisement de sources de données conçues pour des finalités distinctes ;
- décision automatisée produisant un effet significatif sur une personne (scoring, éligibilité, sanction) ;
- nouvelle technologie de traitement (biométrie, IA sur données personnelles) ;
- transfert transfrontalier vers un pays sans cadre reconnu équivalent ;
- tout cas où la liste de l'autorité locale l'exige.

En cas de doute, le DPO/juriste tranche ; l'absence de DPIA est son choix documenté, jamais un oubli d'équipe.

## 13. Vérification d'effacement et doctrine des sauvegardes

- Tout effacement (droit d'une personne §4 ou rétention échue §3) est **vérifié par une procédure outillée** qui contrôle les stockages primaires ET secondaires : base, index de recherche, caches, files, exports, journaux applicatifs — un effacement déclaré mais non vérifié est une promesse, pas une conformité.
- La **doctrine sauvegardes** est écrite et opposable : les données effacées disparaissent des sauvegardes par expiration naturelle (durée de rétention des sauvegardes documentée et communiquée) ; d'ici là, un **registre des effacements** garantit qu'une restauration ne ressuscite pas une donnée effacée — la ré-application du registre est une étape obligatoire de toute procédure de restauration, testée avec elle (`08-exploitation-observabilite.md`).
- La piste d'audit conserve la **trace de l'effacement** (qui, quoi, quand, base de la demande) sans conserver la donnée effacée elle-même — sinon l'audit devient le contournement de l'effacement.
- [SHOULD] Un test périodique choisit une donnée effacée et prouve son absence de tous les stockages accessibles, y compris après une restauration d'essai.
