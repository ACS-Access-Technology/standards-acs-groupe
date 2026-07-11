# Roadmap — Parcours développeur ACS

> Backlog issu du brainstorming du 10/07/2026. Chaque chantier a son objectif, son critère d'acceptation et ses notes d'implémentation. Ordre de réalisation recommandé : P1 → P2 → P3. Une PR par chantier (< 400 lignes, comme il se doit).

## P1 — Transformer la lecture en preuve d'apprentissage

### 1. Quiz de validation par module

- **Pourquoi** : cocher un objectif est déclaratif ; le corpus (doc 01) exige des preuves d'onboarding auditables.
- **Quoi** : 3-4 QCM par module (bonne réponse + explication du pourquoi), à réussir (≥ 75 %) pour débloquer le bouton « J'ai terminé ». Les questions se tirent des lectures existantes (`lectures.js`) — les pièges « intermédiaire » sont d'excellents distracteurs.
- **Implémentation** : `src/data/quiz.js` (même pattern que `lectures.js`), composant `Quiz.vue` dans la fiche, résultat stocké dans la progression (`score`, `date`).
- **Accepté quand** : impossible de terminer un module sans quiz réussi ; échec = revoir la fiche, pas de spam (2e tentative après relecture).

### 2. Attestation de fin de parcours (la preuve d'onboarding)

- **Quoi** : à 19/19, générer une attestation exportable : nom du dev, profil, date, scores par module, version du corpus (v1.2), empreinte SHA-256 du JSON. Export JSON + rendu imprimable (PDF via impression navigateur).
- **Usage** : pièce jointe de la ligne « preuves d'onboarding » dans la matrice d'adoption du projet.
- **Accepté quand** : le fichier exporté est recalculable/vérifiable (hash) et cité dans `01-onboarding-developpeur.md` comme preuve admise.

### 3. Export / import de progression — **maquette PocketBase livrée le 10/07/2026**

Livré : `pocketbase/README.md` (collections, règles deny-by-default, exploitation), `pocketbase/pb_schema.json`, `src/services/synchro.js` (file hors-ligne idempotente, fusion par module documentée), modal de connexion, statut de synchro dans l'en-tête. Reste : déployer le binaire sur l'infra interne, créer les comptes, renseigner `VITE_PB_URL`.

#### (périmètre initial)

- **Pourquoi** : localStorage = perdu si changement de machine ; le lead n'a aucune vue.
- **Quoi** : boutons Exporter/Importer (JSON) dans l'en-tête ; l'attestation (chantier 2) couvre le reporting au lead sans backend.
- **Backend de persistance : DÉCIDÉ → PocketBase** (voir `docs/adr/ADR-001-persistance-pocketbase.md`). Firebase écarté (souveraineté, plan de sortie — 09 §6) ; Supabase écarté (surdimensionné). Schéma cible : collections `devs` (auth interne), `progressions` (module, objectifs, score quiz, horodatage — clé d'idempotence pour la synchro hors-ligne), `attestations` (JSON signé + hash). localStorage devient le cache local du mode PWA, synchronisation idempotente à la reconnexion. Données nominatives : classification, rétention et droits des personnes s'appliquent (doc 15).

### 4. CI du repo + déploiement (dogfooding — le repo doit s'appliquer le standard)

- **Quoi** : GitHub Actions : ① build de l'app ; ② vérifier que `LEXIQUE.md` et `public/docs/` sont régénérés sans diff (sinon échec — doc générée non commitée) ; ③ liens internes morts dans le corpus ; ④ scan de secrets (gitleaks) ; ⑤ déploiement GitHub Pages du build sur push main.
- **Accepté quand** : badge CI vert sur le README ; l'app accessible en ligne pour toute l'équipe ; actions épinglées par SHA (règle 07).

## P2 — Confort d'apprentissage

### 5. PWA hors-ligne — **livré le 10/07/2026** (vite-plugin-pwa, précache shell + 27 docs, toast de mise à jour, indicateur hors-ligne)

- **Pourquoi** : cohérent avec l'ADN offline-first du standard ; le dev continue sa formation dans les transports, sur téléphone.
- **Quoi** : manifest (nom, icônes, couleurs charte `#1b2a9e`/`#f7fafb`, display standalone) + service worker qui précache le shell, les 26 documents de `docs/` et les données — **tout le contenu est statique, le cas d'usage est idéal**. La progression est déjà locale (localStorage), donc fonctionne hors-ligne par nature.
- **Implémentation** : `vite-plugin-pwa` (passer par le processus supply chain : justification, licence MIT, quarantaine) ; stratégie precache pour le shell + stale-while-revalidate pour `docs/` ; bannière « Installer l'application » ; indicateur discret hors-ligne.
- **Attention** : invalidation à chaque release (le SW doit se mettre à jour quand le corpus change — afficher « nouvelle version disponible, recharger »).
- **Accepté quand** : app installable sur iOS/Android, parcours entier consultable en avion, mise à jour du corpus détectée au retour du réseau.

### 6. Mode liste sur mobile

- **Quoi** : sous 640 px, remplacer la carte (positions %, illisible en petit) par une liste verticale ordonnée par phases, avec les mêmes états (verrouillé/débloqué/terminé) et le même badge « suivant ». Prérequis du chantier 5 pour que « mobile » soit vraiment utilisable.

### 7. Recherche globale (Cmd+K)

- **Quoi** : palette de recherche sur modules + lexique + contenu des documents (fetch + index simple en mémoire) ; résultat → ouvre la fiche ou le lecteur au bon endroit.

### 8. Liens profonds

- **Quoi** : `#module=api` et `#doc=11-conception-api.md` dans l'URL — pour coller un lien précis dans Slack (« lis ça avant ta PR »). Restaurer l'état à l'ouverture.

### 9. Lexique cliquable dans les fiches

- **Quoi** : les termes du lexique présents dans les textes des fiches deviennent soulignés pointillés ; survol/clic = définition en tooltip. Détection au rendu depuis `lexique.js` (source unique, rien à baliser à la main).

## P3 — Finitions et ponts

### 10. Ponts vers l'écosystème

- Fin du module Git → encart « Installe acs-dev-guard » avec les commandes ; fin du module IA & agents → création du `.acs-profil` ; fin du parcours → lien vers la matrice d'adoption.

### 11. Conformité de l'app à son propre corpus

- i18n des chaînes en dur (02 §3) ; navigation clavier de la carte + aria + focus visibles (WCAG 2.2 AA, 02 §11) ; audit axe-core en CI.

### 12. Divers

- Logo ACS : déposer `public/logo-acs.png` (le repli texte disparaît tout seul).
- Afficher la version du corpus (lue depuis `CHANGELOG.md`) dans l'en-tête.
- Célébration sobre à 100 % (pas de librairie de confettis à 3 Mo — quelques particules CSS).
- Révision espacée : re-proposer les « pièges » des modules terminés après quelques jours [MAY].

---

*Rappel de méthode : chaque chantier suit le standard — PR mono-sujet, nouvelle dépendance via le processus supply chain (justification, licence, quarantaine 7 j), et pas de notion de temps d'apprentissage dans l'UI (décision du 10/07/2026).*
