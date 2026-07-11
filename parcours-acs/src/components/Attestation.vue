<script setup>
import { ref, computed, onMounted } from 'vue'
import { modules } from '../data/modules.js'
import * as synchro from '../services/synchro.js'
import { versionActuelle } from '../services/corpusVersion.js'
import { X, Download, Printer, AlertTriangle } from '../data/icones.js'

const props = defineProps({
  progression: Object,
  profil: String,
})
const emit = defineEmits(['fermer'])

const nomSaisi = ref('')
const versionCorpus = ref('…')
const attestation = ref(null)
const verifieServeur = ref(false) // true seulement si contenu/hash viennent du hook PocketBase, pas du navigateur
const erreurServeur = ref('')

const nomConnu = computed(() => synchro.connecte.value ? synchro.nomDev.value : nomSaisi.value.trim())

onMounted(async () => {
  versionCorpus.value = await versionActuelle()
})

async function sha256Hex(texte) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

// Le titre d'un module n'est pas une donnée contractuelle (juste un libellé d'affichage) —
// il n'a pas à être hashé ni vérifié serveur, on l'enrichit localement pour la lecture.
function titre(moduleId) {
  return modules.find(m => m.id === moduleId)?.titre || moduleId
}

// Modules pas encore validés côté serveur, calculé localement — PocketBase masque le détail
// des erreurs levées par un hook (juste "Something went wrong..."), donc le seul moyen
// d'indiquer QUEL module bloque est de re-vérifier côté client avant même d'appeler le
// serveur (Fatima, revue party mode, 3e passe : un rejet muet, sans nom de module, est
// undiagnosticable pour un dev qui vient de terminer son parcours).
const modulesNonValides = computed(() =>
  modules.filter(m => {
    const p = props.progression?.[m.id]
    return !(p?.termine && p?.scoreSource === 'server' && (p?.quizScore || 0) >= 75)
  })
)

async function generer() {
  erreurServeur.value = ''

  if (modulesNonValides.value.length > 0) {
    erreurServeur.value = `Pas encore validés côté serveur (resynchronise puis réessaie) : ${modulesNonValides.value.map(m => m.titre).join(', ')}`
    return
  }

  if (synchro.connecte.value) {
    // Le contenu et le hash affichés/exportés sont ceux renvoyés par le hook PocketBase — le
    // navigateur ne calcule plus rien de contractuel, il ne fait que soumettre nom/profil,
    // deux champs informatifs (Max, revue party mode, 2e passe : le hook reconstruit et
    // recorrèle tout le reste depuis les progressions server-validated).
    try {
      const enregistrement = await synchro.enregistrerAttestation({ dev: { nom: nomConnu.value, profil: props.profil } }, '')
      attestation.value = { ...enregistrement.contenu, hash: enregistrement.hash, verifieServeur: true }
      verifieServeur.value = true
    } catch {
      erreurServeur.value = 'Attestation refusée par le serveur — resynchronise (bouton de statut en haut) puis réessaie ; si le problème persiste, un module a pu être invalidé après coup.'
    }
    return
  }

  // Hors connexion : l'attestation reste calculable localement pour un usage pédagogique,
  // mais elle N'EST PAS opposable en audit — rien n'a été revérifié côté serveur.
  const contenu = {
    dev: { nom: nomConnu.value, profil: props.profil },
    dateUTC: new Date().toISOString(),
    parcours: { total: modules.length, completes: modules.filter(m => props.progression?.[m.id]?.termine).length },
    modules: modules
      .filter(m => props.progression?.[m.id]?.termine)
      .map(m => ({
        id: m.id,
        termine: true,
        quizScore: props.progression?.[m.id]?.quizScore ?? null,
        quizDate: props.progression?.[m.id]?.quizDate ?? null,
        versionCorpusValidation: props.progression?.[m.id]?.versionCorpus ?? null,
      })),
  }
  const hash = await sha256Hex(JSON.stringify(contenu))
  // `verifieServeur` est écrit DANS le JSON exporté (Fatima, revue party mode, 3e passe : un
  // fichier transmis des semaines plus tard doit rester lisible comme non probant sans
  // dépendre du contexte de l'écran) mais HORS du contenu haché — comme côté connecté, le
  // hash ne couvre que `contenu` ; `hash` et `verifieServeur` sont des métadonnées ajoutées
  // après coup (voir ATTESTATION.md pour la procédure de recalcul).
  attestation.value = { ...contenu, hash, verifieServeur: false }
  verifieServeur.value = false
}

function exporterJSON() {
  const blob = new Blob([JSON.stringify(attestation.value, null, 2)], { type: 'application/json' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = `attestation-${(nomConnu.value || 'dev').toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${attestation.value.dateUTC.slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(a.href)
}

function imprimer() {
  window.print()
}
</script>

<template>
  <div class="voile-att" role="dialog" aria-modal="true" aria-labelledby="att-titre">
    <div class="att">
      <button class="fermer no-print" @click="emit('fermer')"><X :size="18" /></button>

      <template v-if="!attestation">
        <h2 id="att-titre">Attestation de fin de parcours</h2>
        <p>Les {{ modules.length }} modules sont terminés. Génère ton attestation — elle inclut ton nom, ton profil, la date, le score de chaque quiz de module et un hash SHA-256 vérifiable.</p>
        <label v-if="!synchro.connecte.value" class="champ">
          Ton nom (non connecté — saisie manuelle)
          <input v-model="nomSaisi" type="text" placeholder="Prénom Nom" />
        </label>
        <p v-else class="connecte">Connecté en tant que <strong>{{ synchro.nomDev.value }}</strong> — le nom vient de ton compte.</p>
        <p v-if="!synchro.connecte.value" class="alerte-obsolete">
          <AlertTriangle :size="14" class="inline-ico" />
          Non connecté : l'attestation reste calculée localement, à titre pédagogique — elle n'est pas revérifiée côté serveur et n'a pas de valeur contractuelle.
        </p>
        <p v-if="erreurServeur" class="statut ko">{{ erreurServeur }}</p>
        <button class="valider" :disabled="!nomConnu" @click="generer">Générer l'attestation</button>
      </template>

      <template v-else>
        <div class="feuille" id="feuille-attestation">
          <h2 id="att-titre">Attestation de parcours — Standards ACS Groupe</h2>
          <p v-if="verifieServeur" class="statut ok">Contenu et hash générés et vérifiés côté serveur (PocketBase) — opposable.</p>
          <p v-else class="alerte-obsolete">
            <AlertTriangle :size="14" class="inline-ico" />
            Non vérifié côté serveur — valeur pédagogique uniquement.
          </p>
          <dl>
            <dt>Développeur</dt><dd>{{ attestation.dev.nom }}</dd>
            <dt>Profil déclaré</dt><dd>{{ attestation.dev.profil }}</dd>
            <dt>Date (UTC)</dt><dd>{{ attestation.dateUTC }}</dd>
            <dt>Modules complétés</dt><dd>{{ attestation.parcours.completes }}/{{ attestation.parcours.total }}</dd>
          </dl>
          <table>
            <thead><tr><th>Module</th><th>Score quiz</th><th>Date</th><th>Version</th></tr></thead>
            <tbody>
              <tr v-for="m in attestation.modules" :key="m.id">
                <td>{{ titre(m.id) }}</td>
                <td>{{ m.quizScore !== null ? m.quizScore + ' %' : '—' }}</td>
                <td>{{ m.quizDate ? m.quizDate.slice(0, 10) : '—' }}</td>
                <td>{{ m.versionCorpusValidation ?? '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="hash">SHA-256 : <code>{{ attestation.hash }}</code></p>
        </div>

        <div class="actions no-print">
          <button class="valider" @click="exporterJSON"><Download :size="16" /> Exporter le JSON</button>
          <button class="valider secondaire" @click="imprimer"><Printer :size="16" /> Imprimer / PDF</button>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.voile-att {
  position: fixed; inset: 0; z-index: 46; background: rgba(18, 28, 66, .45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.att {
  width: min(640px, 100%); max-height: 90vh; overflow-y: auto; background: var(--card);
  border-radius: 8px; box-shadow: var(--ring); padding: 28px; position: relative;
}
.fermer { position: absolute; top: 14px; right: 14px; border: none; background: none; color: var(--texte-plein); cursor: pointer; }
h2 { font-size: 20px; font-weight: 700; color: var(--texte-plein); margin-bottom: 10px; }
.att > p { font-size: 14px; color: var(--muted); margin-bottom: 14px; }
.champ { display: flex; flex-direction: column; gap: 6px; font-size: 13px; color: var(--texte); margin-bottom: 14px; }
.champ input { padding: 8px 10px; border-radius: 6px; border: 1px solid var(--bordure); font-family: inherit; font-size: 14px; }
.connecte { font-size: 13px; margin-bottom: 14px; }
.valider {
  border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 500;
  font-family: inherit; cursor: pointer; background: var(--primaire); color: var(--sur-primaire);
  display: inline-flex; align-items: center; gap: 6px;
}
.valider:disabled { background: var(--bordure); color: var(--muted); cursor: not-allowed; }
.valider.secondaire { background: var(--fond); color: var(--texte); box-shadow: var(--ring); }
.feuille { border: 1px solid var(--bordure); border-radius: 8px; padding: 20px; margin-bottom: 14px; }
dl { display: grid; grid-template-columns: auto 1fr; gap: 4px 12px; font-size: 14px; margin: 12px 0; }
dt { color: var(--muted); }
dd { font-weight: 600; color: var(--texte-plein); }
table { width: 100%; border-collapse: collapse; font-size: 13px; margin-top: 10px; }
th, td { text-align: left; padding: 6px 8px; border-bottom: 1px solid var(--bordure); }
.hash { margin-top: 12px; font-size: 12px; word-break: break-all; color: var(--muted); }
.alerte-obsolete { background: #fbeeb1; color: #121c42; border-radius: 4px; padding: 10px 14px; font-size: 12.5px; margin: 10px 0; }
tr.obsolete td { color: var(--accent-orange); }
.inline-ico { vertical-align: -2px; }
.hash code { background: var(--ligne-chapitre); padding: 2px 6px; border-radius: 4px; }
.statut { font-size: 13px; margin-bottom: 10px; }
.statut.ok { color: var(--primaire); }
.statut.ko { color: var(--accent-rouge); }
.actions { display: flex; gap: 10px; flex-wrap: wrap; }
@media print {
  .no-print { display: none !important; }
  .voile-att { position: static; background: none; padding: 0; }
  .att { box-shadow: none; max-height: none; overflow: visible; width: 100%; }
}
</style>
