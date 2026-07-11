# Attestation de fin de parcours

Générée quand les 19 modules sont marqués terminés.

## Deux natures d'attestation — ne pas confondre

**Connecté à PocketBase** : contractuelle, opposable en audit. Le `contenu` et le `hash` affichés/exportés sont **entièrement reconstruits côté serveur** (`pocketbase/pb_hooks/main.pb.js`) à partir des 19 `progressions` server-validated du compte authentifié — le navigateur ne calcule rien de contractuel, il ne soumet que le `profil` déclaré (restreint à `junior`/`intermediaire`/`senior`, purement informatif). Le `nom` vient exclusivement du compte, jamais du client. `verifieServeur: true`.

**Hors connexion** : pédagogique / auto-évaluation uniquement, **pas opposable en audit** — rien n'a été revérifié côté serveur, tout est calculé et hashé par le navigateur. `verifieServeur: false`, écrit dans le JSON exporté lui-même (pas seulement affiché à l'écran), pour rester lisible comme non probant même des semaines plus tard, hors contexte.

Export possible en JSON (téléchargement direct) et en vue imprimable (bouton *Imprimer / PDF*, via l'impression navigateur — `Ctrl/Cmd+P`).

## Politique de gel de version (revue party mode, Winston/Fatima)

Chaque module conserve, au moment où son quiz est réussi côté serveur, la **version du corpus alors en vigueur** (`versionCorpusValidation`, gelée — jamais recalculée après coup). Si le corpus évolue ensuite, le module ne se réinvalide pas automatiquement — la fiche du module affiche un avertissement (« validé sur une version antérieure »), mais l'attestation elle-même n'encode pas de flag d'obsolescence : c'est une **photo à l'instant T**, pas un abonnement à la dernière version du corpus. Un `lead` qui audite une attestation doit croiser la colonne « Version » avec `CHANGELOG.md` s'il veut savoir si un module a été retouché depuis.

## Vérifier un JSON exporté

Le champ `hash` est le SHA-256 hexadécimal de la sérialisation JSON de l'attestation **sans les champs `hash` et `verifieServeur`** (ce sont des métadonnées ajoutées après le calcul, jamais hachées). Pour recalculer et comparer :

```bash
node -e "
const fs = require('fs')
const a = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
const { hash, verifieServeur, ...contenu } = a
crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(contenu)))
  .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''))
  .then(recalcul => {
    console.log('hash attesté :', hash)
    console.log('hash recalculé :', recalcul)
    console.log(recalcul === hash ? 'OK — le contenu n\'a pas été modifié' : 'ÉCHEC — le contenu a été altéré')
  })
" chemin/vers/attestation.json
```

**Ce que ce recalcul prouve, et ce qu'il ne prouve pas** : un hash qui matche prouve que le fichier n'a pas été modifié après sa génération. Pour une attestation `verifieServeur: false`, il ne prouve **rien** sur la véracité des scores déclarés — ils n'ont jamais été revérifiés. Seule une attestation `verifieServeur: true` a ses scores garantis par le hook serveur (`pocketbase/pb_hooks/main.pb.js`, voir `pocketbase/README.md` § Validation serveur des quiz).

L'ordre des clés dans l'objet `contenu` est fixé par le code (`src/components/Attestation.vue` côté client, `pocketbase/pb_hooks/main.pb.js` côté serveur) — une sérialisation JSON standard (`JSON.stringify`, sans réordonnancement) donne un résultat déterministe et reproductible.
