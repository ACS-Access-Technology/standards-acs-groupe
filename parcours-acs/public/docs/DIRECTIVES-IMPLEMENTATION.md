# Directives d'implémentation — à exécuter par Claude Code

> **Destinataire** : Claude Code, dans le dépôt `standards-acs-groupe`.
> **Prérequis** : le skill `acs-dev-guard` est installé (`.claude/skills/` ou `~/.claude/skills/`) — applique-le à chacun de tes propres commits. Lis `parcours-acs/ROADMAP.md` (le détail des chantiers) et `parcours-acs/docs/adr/ADR-001-persistance-pocketbase.md` avant de commencer.

## Règles de conduite (non négociables)

1. **Une PR par chantier**, mono-sujet, < 400 lignes de diff effectif, message Conventional Commits.
2. Avant chaque commit : vérifie ton propre diff avec la grille acs-dev-guard (secrets, données réelles, i18n, dépendances).
3. Toute **nouvelle dépendance** passe le processus supply chain : justification écrite dans la PR, licence, santé du projet — et s'ajoute au lockfile uniquement.
4. Aucune notion de **temps d'apprentissage** dans l'UI (décision du 10/07/2026).
5. Chaque chantier a sa **Definition of Done** ci-dessous : non satisfaite = non terminé.
6. En cas d'ambiguïté : la ROADMAP fait foi ; si elle est muette, pose la question plutôt que d'interpréter.

## État des lieux (ce qui existe déjà — ne pas refaire)

App Vue 3/Vite dans `parcours-acs/` : carte Grafikart (pan/zoom/recentrage, nœud actif net + autres estompés), mode liste mobile < 768 px, profils junior/intermédiaire/senior (`lectures.js`), lexique interactif (59 termes, `LEXIQUE.md` généré), lecteur de documents intégré (corpus servi via `public/docs/`, script `sync-docs`), tooltip de progression, écran de bienvenue, terminaison conditionnée aux objectifs, **maquette PocketBase complète** (`pocketbase/README.md` + `pb_schema.json` v0.37, `src/services/synchro.js` avec file hors-ligne idempotente, `Connexion.vue`, statut dans l'en-tête, `scripts/test-pocketbase.mjs`).

## Chantier 0 — Déploiement PocketBase (infra, pas de code)

Suivre `parcours-acs/pocketbase/README.md` : binaire **v0.37.4** (vérifier l'empreinte SHA-256 consignée), `superuser upsert`, collections selon la table (le `pb_schema.json` aide, la table fait foi), comptes devs + un compte `lead`, TLS via reverse proxy, `pb_data/` dans la rotation de sauvegarde.
**DoD** : `node scripts/test-pocketbase.mjs <url> <email> <mdp>` → **5/5 contrôles verts** ; `VITE_PB_URL` documentée pour l'équipe.

## Chantier 1 — Quiz de validation par module (P1)

`src/data/quiz.js` (même pattern que `lectures.js`) : 3-4 QCM par module (19 modules), bonne réponse + explication du pourquoi ; tirer les distracteurs des « pièges » intermédiaires. Composant `Quiz.vue` dans la fiche : le bouton « J'ai terminé ce module » n'est actif qu'après objectifs cochés **ET quiz réussi ≥ 75 %** ; échec → invitation à relire, 2ᵉ tentative après réouverture de la fiche. Score et date stockés dans la progression (donc synchronisés).
**DoD** : impossible de terminer sans quiz réussi ; scores visibles dans la fiche ; les 19 modules ont leurs questions ; build vert.

## Chantier 2 — Attestation de fin de parcours (P1)

À 19/19 : génération d'une attestation — nom du dev (depuis le compte PocketBase si connecté, sinon saisie), profil, date UTC, scores par module, version du corpus (lue depuis `CHANGELOG.md`), **hash SHA-256 du JSON** (Web Crypto). Export JSON + vue imprimable (PDF via impression navigateur). Si connecté : enregistrement dans la collection `attestations` (append-only).
**DoD** : le JSON exporté est vérifiable (recalcul du hash documenté dans le README) ; l'attestation est citée comme preuve d'onboarding admise dans `01-onboarding-developpeur.md` (une phrase à ajouter, PR séparée sur le corpus).

## Chantier 3 — CI GitHub Actions + Pages (P1 — dogfooding)

Workflow sur push/PR : ① build de `parcours-acs` ; ② `gen-lexique` + `sync-docs` puis échec si `git diff` non vide (doc générée non commitée) ; ③ scan de secrets (gitleaks) ; ④ liens internes morts dans les .md du corpus. Sur push `main` : déploiement GitHub Pages du build. **Actions épinglées par SHA de commit, jamais par tag** (règle 07 du corpus).
**DoD** : badge CI dans le README ; app accessible via l'URL Pages ; un secret volontairement introduit en local fait échouer le scan (testé puis retiré, jamais poussé).

## Chantier 4 — PWA hors-ligne (P2)

`vite-plugin-pwa` (dépendance : processus supply chain complet). Manifest aux couleurs ACS (`#1b2a9e`/`#f7fafb`, display standalone, icônes depuis le logo une fois `public/logo-acs.png` déposé). Précache du shell + `docs/` en stale-while-revalidate. Bannière d'installation discrète ; toast « Nouvelle version disponible — recharger » quand le service worker détecte une mise à jour du corpus. La synchro existante (`synchro.js`) gère déjà le hors-ligne — ne pas la dupliquer.
**DoD** : installable iOS/Android ; parcours entier consultable en mode avion ; mise à jour détectée au retour du réseau ; Lighthouse PWA sans erreur bloquante.

## Chantier 5 — Confort (P2, une PR par item)

Dans l'ordre : liens profonds (`#module=api`, `#doc=…`, restaurés à l'ouverture) → recherche globale Cmd+K (modules + lexique + contenu des docs) → termes du lexique cliquables dans les fiches (détection depuis `lexique.js`, tooltip de définition) → version du corpus affichée dans l'en-tête (lue depuis `CHANGELOG.md`).

## Chantier 6 — Ponts écosystème + conformité (P3)

Encart fin du module Git : « Installe acs-dev-guard » avec les commandes ; fin du module IA : proposer la création du `.acs-profil` ; fin de parcours : lien matrice d'adoption. Puis conformité de l'app à son propre corpus : i18n des chaînes en dur, navigation clavier de la carte + aria + focus visibles (WCAG 2.2 AA), audit axe-core en CI.

## Vérification finale (après chaque chantier)

```bash
cd parcours-acs && npm run build        # doit passer
node scripts/test-pocketbase.mjs …      # si le chantier touche la synchro
```

Et rejouer le test du « junior qui débarque » : navigation privée, l'écran de bienvenue s'affiche, le badge « Commence ici » pointe le premier module, impossible de terminer sans lire ni réussir le quiz.
