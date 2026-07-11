// Synchronisation PocketBase — localStorage reste le cache local (offline-first).
// Idempotence : index unique (dev, module) côté serveur → un envoi rejoué met à jour, ne duplique jamais.
import { ref } from 'vue'
import PocketBase from 'pocketbase'

const URL_PB = import.meta.env.VITE_PB_URL || ''
const CLE_FILE = 'parcours-acs-sync-queue'

export const actif = !!URL_PB
export const connecte = ref(false)
export const nomDev = ref('')
export const enAttente = ref(0)
export const erreur = ref('')

const pb = actif ? new PocketBase(URL_PB) : null
if (pb && pb.authStore.isValid) {
  connecte.value = true
  nomDev.value = pb.authStore.model?.nom || pb.authStore.model?.email || ''
}

/* --- File d'attente locale : dernier état par module (idempotent par nature) --- */
function lireFile() {
  try { return JSON.parse(localStorage.getItem(CLE_FILE)) || {} } catch { return {} }
}
function ecrireFile(f) {
  localStorage.setItem(CLE_FILE, JSON.stringify(f))
  enAttente.value = Object.keys(f).length
}
enAttente.value = Object.keys(lireFile()).length

/* --- Envoi d'un module (upsert) --- */
async function upsert(module, donnees, maj) {
  const devId = pb.authStore.model.id
  const existant = await pb.collection('progressions')
    .getList(1, 1, { filter: pb.filter('dev = {:dev} && module = {:module}', { dev: devId, module }) })
  const corps = { dev: devId, module, donnees, maj }
  if (existant.items.length) await pb.collection('progressions').update(existant.items[0].id, corps)
  else await pb.collection('progressions').create(corps)
}

/* --- Vider la file (reconnexion, login) --- */
export async function vider() {
  if (!actif || !pb.authStore.isValid) return
  const file = lireFile()
  for (const [module, entree] of Object.entries(file)) {
    try {
      await upsert(module, entree.donnees, entree.maj)
      delete file[module]
      ecrireFile(file)
    } catch (e) {
      erreur.value = 'Synchronisation en attente (' + (e?.status || 'réseau') + ')'
      return // on retentera au prochain déclencheur
    }
  }
  erreur.value = ''
}

/* --- Planifier l'envoi de la progression (appelé par App au moindre changement) --- */
let minuteur = null
export function planifier(progression) {
  if (!actif) return
  clearTimeout(minuteur)
  minuteur = setTimeout(() => {
    const file = lireFile()
    const maintenant = new Date().toISOString() // UTC, comme il se doit
    for (const [module, donnees] of Object.entries(progression)) {
      file[module] = { donnees, maj: maintenant }
    }
    ecrireFile(file)
    vider()
  }, 800)
}

/* --- Connexion / déconnexion --- */
export async function connecter(email, motDePasse) {
  erreur.value = ''
  await pb.collection('users').authWithPassword(email, motDePasse)
  connecte.value = true
  nomDev.value = pb.authStore.model?.nom || pb.authStore.model?.email || ''
  const distante = await rapatrier()
  await vider()
  return distante
}

export function deconnecter() {
  pb.authStore.clear()
  connecte.value = false
  nomDev.value = ''
}

/* --- Rapatriement : fusion PAR MODULE sur l'horodatage le plus récent.
   Simplification assumée et documentée (donnée pédagogique) — cf. pocketbase/README.md --- */
export async function rapatrier() {
  const devId = pb.authStore.model.id
  const enregistrements = await pb.collection('progressions')
    .getFullList({ filter: pb.filter('dev = {:dev}', { dev: devId }) })
  const distante = {}
  for (const r of enregistrements) distante[r.module] = { donnees: r.donnees, maj: r.maj }
  return distante
}

/* --- Reprise automatique au retour du réseau --- */
if (actif) window.addEventListener('online', vider)
