# 14 — Auto-audit périodique

> Déclinaison légère du manuel d'audit ACS : l'équipe s'audite elle-même chaque trimestre, avant que le client ou un tiers ne le fasse. Principe cardinal : **tu constates, tu ne supposes pas** — chaque affirmation s'appuie sur une preuve reproductible (requête, capture, extrait de log, sortie d'outil datée). « Je crois que c'est bon » n'est pas un constat.

## 1. Règles

- L'auto-audit se fait sur **pré-production** (données anonymisées) ; jamais de test intrusif en production sans autorisation écrite.
- Chaque écart devient un **ticket avec sévérité et échéance** (grille : critique < 72 h · élevé ≤ 30 j · moyen ≤ 90 j · faible backlog).
- Le constat est écrit même quand tout est conforme (« rien à signaler » daté vaut preuve de contrôle).
- Les findings critiques sont signalés **immédiatement**, sans attendre la fin de l'audit.
- **Revue croisée par pair** : l'auditeur d'un domaine n'est jamais celui qui l'a construit ce trimestre (un dev audite l'exploitation, un DevOps audite le code…) — l'auto-validation complaisante est le mode d'échec n° 1 de l'auto-audit.
- **Échantillonnage** : quand un contrôle porte sur une population (routes, comptes, actions d'audit), tirer un échantillon d'au moins 10 éléments ou 10 % (le plus grand des deux), en incluant systématiquement les éléments créés au trimestre. La méthode de tirage est notée dans la restitution.
- **Scoring** : chaque contrôle reçoit un statut `conforme` / `partiel` / `non conforme` / `non applicable`, aligné sur les IDs de `16-cartographie-controles-internationaux.md`.

## 1 bis. Evidence log (obligatoire)

Chaque ligne de contrôle vérifiée alimente un journal de preuves versionné (`/docs/audits/<AAAA-TQ>/evidence-log.md`) :

| Contrôle (ID) | Preuve attendue | Preuve fournie | Lien | Statut | Responsable | Écart/ticket |
|---|---|---|---|---|---|---|

Une preuve est **datée, reproductible et rejouable** par un tiers — sinon ce n'est pas une preuve.

## 2. Checklist trimestrielle

### Contrôle d'accès (le plus important)

- [ ] Élévation horizontale testée : un utilisateur de l'entité/direction A ne peut PAS lire une donnée de B — testé sur les routes ET dans la base (IDOR/BOLA).
- [ ] Élévation verticale testée : un rôle inférieur ne peut PAS appeler une action d'administration (y compris en appelant l'API directement, pas seulement via l'UI).
- [ ] Toute route exposée a une policy — vérifié par inventaire des routes vs inventaire des policies (une route masquée en UI mais joignable est un finding).
- [ ] Comptes et jetons : aucun compte dormant, aucun jeton sans date d'expiration, comptes de service au moindre privilège.

### Configuration et durcissement

- [ ] En-têtes de sécurité présents et corrects (CSP, HSTS, X-Content-Type-Options…) — vérifié par outil, sortie datée.
- [ ] Cookies : HttpOnly, Secure, SameSite.
- [ ] CORS en allow-list ; aucun endpoint de debug/admin exposé ; messages d'erreur sans fuite.
- [ ] TLS : version et suites conformes, certificats valides > 30 jours.

### Journalisation et audit trail

- [ ] Échantillon d'actions sensibles rejouées : chacune a produit son entrée d'audit (qui/quoi/quand/IP) — l'échantillon couvre chaque module livré au trimestre.
- [ ] Intégrité de la piste vérifiée (chaînage) ; copie WORM présente.
- [ ] Reconstitution test : « qui a fait quoi » sur un incident simulé, reconstitué en < 30 minutes.

### Sauvegardes et continuité

- [ ] Dernière restauration **réelle** testée < 30 jours, résultat consigné (démarrage + intégrité applicative, pas seulement « le fichier existe »).
- [ ] Immuabilité vérifiée : tentative de suppression d'une sauvegarde par un compte admin → refusée.
- [ ] Dernier exercice de bascule DR < 6 mois, chronométré vs RTO.

### Chaîne d'approvisionnement

- [ ] SBOM du dernier build présent ; question-test « sommes-nous exposés à <CVE récente> ? » répondue en < 1 heure.
- [ ] Aucune dépendance en vulnérabilité critique/haute non traitée ; quarantaines à jour.
- [ ] Dérive IaC nulle (aucune modification manuelle en production sur le trimestre).

### Qualité et dette

- [ ] Couverture conforme à l'objectif contractuel ; quality-gate non contourné sur le trimestre.
- [ ] Tests d'architecture verts ; liste des suppressions d'avertissements revue (chacune justifiée).
- [ ] Feature flags : aucun flag au-delà de sa date de retrait.
- [ ] Inventaire EOL : aucun composant à < 6 mois de fin de support sans plan.

## 3. Restitution

Une page : conformités, findings par sévérité (nombres recalculables), tickets créés avec échéances, **comparaison chiffrée avec le trimestre précédent** (contrôles passés de non conforme → conforme, écarts nouveaux, écarts récurrents). Présentée au comité sécurité trimestriel (`06-securite-developpeur.md` §6). Les leçons récurrentes remontent en amendement du corpus.

## 4. Dashboard de remédiation (tenu entre deux audits)

Suivi permanent des écarts ouverts, revu au comité sécurité :

| Écart (ID contrôle) | Sévérité | Âge (jours) | Propriétaire | Échéance | Statut |
|---|---|---|---|---|---|

Règles : un écart critique > 72 h ou élevé > 30 j passe automatiquement au registre des risques (`17-registre-risques-derogations.md`) avec signalement au responsable technique ; un écart qui réapparaît deux trimestres de suite déclenche une analyse de cause racine (le contrôle, l'outillage ou la règle elle-même est en cause).
