// Test d'installation PocketBase — 5 contrôles, preuves à l'appui (doc 14 : tu constates, tu ne supposes pas).
// Usage : node scripts/test-pocketbase.mjs http://localhost:8090 dev@acs.local motdepasse
import PocketBase from 'pocketbase'

const [url, email, mdp] = process.argv.slice(2)
if (!url || !email || !mdp) {
  console.log('Usage : node scripts/test-pocketbase.mjs <url> <email-dev> <mot-de-passe>')
  process.exit(1)
}

const pb = new PocketBase(url)
let ok = 0, ko = 0
const test = (nom, passe, detail = '') => {
  console.log(`${passe ? '✅' : '❌'} ${nom}${detail ? ' — ' + detail : ''}`)
  passe ? ok++ : ko++
}

// 1. Authentification
try {
  await pb.collection('users').authWithPassword(email, mdp)
  test('Authentification', true, (pb.authStore.record || pb.authStore.model).id)
} catch (e) {
  test('Authentification', false, String(e))
  process.exit(1)
}
const devId = (pb.authStore.record || pb.authStore.model).id
const MODULE = 'test-module-' + Date.now()

// 2. Création d'une progression
let rec
try {
  rec = await pb.collection('progressions').create({ dev: devId, module: MODULE, donnees: { termine: false }, maj: new Date().toISOString() })
  test('Création progression', true, rec.id)
} catch (e) { test('Création progression', false, String(e)) }

// 3. Idempotence : recréer le même (dev, module) doit ÉCHOUER (index unique) → l'upsert du service fait update
let doublonRefuse = false
try {
  await pb.collection('progressions').create({ dev: devId, module: MODULE, donnees: {}, maj: new Date().toISOString() })
} catch { doublonRefuse = true }
test('Index unique (dev, module) — pas de doublon possible', doublonRefuse)

// 4. Upsert (le flux du service) : update du même module → toujours 1 seul enregistrement
try {
  await pb.collection('progressions').update(rec.id, { donnees: { termine: true }, maj: new Date().toISOString() })
  const liste = await pb.collection('progressions').getList(1, 50, { filter: pb.filter('module = {:m}', { m: MODULE }) })
  test('Upsert idempotent (1 enregistrement, à jour)', liste.items.length === 1 && liste.items[0].donnees.termine === true)
} catch (e) { test('Upsert idempotent', false, String(e)) }

// 5. Cloisonnement : je ne vois QUE mes progressions (les règles filtrent côté serveur)
try {
  const toutes = await pb.collection('progressions').getFullList()
  const autres = toutes.filter(r => r.dev !== devId)
  test('Cloisonnement : aucune progression d\'un autre dev visible', autres.length === 0, `${toutes.length} enregistrement(s), tous à moi`)
} catch (e) { test('Cloisonnement', false, String(e)) }

// Nettoyage
try { await pb.collection('progressions').delete(rec.id) } catch { /* delete admin-only : normal, le garder est sans effet */ }

console.log(`\n${ok}/${ok + ko} contrôles passés${ko ? ' — CORRIGER AVANT USAGE' : ' — installation conforme'}`)
process.exit(ko ? 1 : 0)
