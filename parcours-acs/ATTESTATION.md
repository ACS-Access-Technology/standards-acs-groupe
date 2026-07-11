# Attestation de fin de parcours

Générée quand les 19 modules sont marqués terminés. Contenu : nom du dev (compte PocketBase si connecté, sinon saisie), profil déclaré, date UTC, version du corpus (lue depuis `CHANGELOG.md`), score et date de chaque quiz de module, et un hash SHA-256 du contenu.

Export possible en JSON (téléchargement direct) et en vue imprimable (bouton *Imprimer / PDF*, via l'impression navigateur — `Ctrl/Cmd+P`).

Si le dev est connecté à PocketBase, l'attestation est aussi enregistrée dans la collection `attestations` (append-only, voir `pocketbase/README.md`).

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
