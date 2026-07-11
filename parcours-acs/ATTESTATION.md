# Attestation de fin de parcours

Générée quand les 19 modules sont marqués terminés. Contenu : nom du dev (compte PocketBase si connecté, sinon saisie), profil déclaré, date UTC, version du corpus (lue depuis `CHANGELOG.md`), score et date de chaque quiz de module, et un hash SHA-256 du contenu.

Export possible en JSON (téléchargement direct) et en vue imprimable (bouton *Imprimer / PDF*, via l'impression navigateur — `Ctrl/Cmd+P`).

Si le dev est connecté à PocketBase, l'attestation est aussi enregistrée dans la collection `attestations` (append-only, voir `pocketbase/README.md`).

## Politique de gel de version (revue party mode, Winston/Fatima)

Chaque module conserve, au moment où son quiz est réussi, la **version du corpus alors en vigueur** (`versionCorpus`, gelée — jamais recalculée après coup). Si le corpus évolue ensuite, ce module ne se réinvalide pas automatiquement : la fiche affiche un avertissement (« validé sur une version antérieure ») et l'attestation marque le module `obsolete: true`, sans bloquer la génération.

**Choix assumé** : l'attestation est une **photo à l'instant T**, jamais périmée automatiquement — pas un abonnement à la dernière version du corpus. Un `lead` qui audite une attestation doit lire la colonne « Version » module par module, pas seulement la version globale en en-tête.

## Vérifier un JSON exporté

Le champ `hash` est le SHA-256 hexadécimal de la sérialisation JSON de l'attestation **sans le champ `hash` lui-même**. Pour recalculer et comparer :

```bash
node -e "
const fs = require('fs')
const a = JSON.parse(fs.readFileSync(process.argv[1], 'utf8'))
const { hash, ...contenu } = a
crypto.subtle.digest('SHA-256', new TextEncoder().encode(JSON.stringify(contenu)))
  .then(b => Array.from(new Uint8Array(b)).map(x => x.toString(16).padStart(2, '0')).join(''))
  .then(recalcul => {
    console.log('hash attesté :', hash)
    console.log('hash recalculé :', recalcul)
    console.log(recalcul === hash ? 'OK — le contenu n\'a pas été modifié' : 'ÉCHEC — le contenu a été altéré')
  })
" chemin/vers/attestation.json
```

L'ordre des clés dans l'objet `contenu` est fixé par le code (`src/components/Attestation.vue`, fonction `generer`) — une sérialisation JSON standard (`JSON.stringify`, sans réordonnancement) donne un résultat déterministe et reproductible.
