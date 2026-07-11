<script setup>
import { ref, computed, onMounted } from 'vue'
import { modules } from '../data/modules.js'
import * as synchro from '../services/synchro.js'
import { X, Download, Printer } from '../data/icones.js'

const props = defineProps({
  progression: Object,
  profil: String,
})
const emit = defineEmits(['fermer'])

const nomSaisi = ref('')
const versionCorpus = ref('…')
const attestation = ref(null)
const enregistrementDistant = ref('') // '', 'en cours', 'ok', 'échec'

const nomConnu = computed(() => synchro.connecte.value ? synchro.nomDev.value : nomSaisi.value.trim())

onMounted(async () => {
  try {
    const rep = await fetch(import.meta.env.BASE_URL + 'docs/CHANGELOG.md')
    const texte = await rep.text()
    const m = texte.match(/^##\s*(v[\d.]+)/m)
    versionCorpus.value = m ? m[1] : 'inconnue'
  } catch {
    versionCorpus.value = 'inconnue'
  }
})

async function sha256Hex(texte) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texte))
  return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
}

async function generer() {
  const contenu = {
    dev: { nom: nomConnu.value, profil: props.profil },
    dateUTC: new Date().toISOString(),
    versionCorpus: versionCorpus.value,
    parcours: { total: modules.length, completes: modules.filter(m => props.progression?.[m.id]?.termine).length },
    modules: modules.map(m => ({
      id: m.id,
      titre: m.titre,
      termine: !!props.progression?.[m.id]?.termine,
      quizScore: props.progression?.[m.id]?.quizScore ?? null,
      quizDate: props.progression?.[m.id]?.quizDate ?? null,
    })),
  }
  const hash = await sha256Hex(JSON.stringify(contenu))
  attestation.value = { ...contenu, hash }

  if (synchro.connecte.value) {
    enregistrementDistant.value = 'en cours'
    try {
      await synchro.enregistrerAttestation(contenu, hash)
      enregistrementDistant.value = 'ok'
    } catch {
      enregistrementDistant.value = 'échec'
    }
  }
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
        <button class="valider" :disabled="!nomConnu" @click="generer">Générer l'attestation</button>
      </template>

      <template v-else>
        <div class="feuille" id="feuille-attestation">
          <h2 id="att-titre">Attestation de parcours — Standards ACS Groupe</h2>
          <dl>
            <dt>Développeur</dt><dd>{{ attestation.dev.nom }}</dd>
            <dt>Profil déclaré</dt><dd>{{ attestation.dev.profil }}</dd>
            <dt>Date (UTC)</dt><dd>{{ attestation.dateUTC }}</dd>
            <dt>Version du corpus</dt><dd>{{ attestation.versionCorpus }}</dd>
            <dt>Modules complétés</dt><dd>{{ attestation.parcours.completes }}/{{ attestation.parcours.total }}</dd>
          </dl>
          <table>
            <thead><tr><th>Module</th><th>Score quiz</th><th>Date</th></tr></thead>
            <tbody>
              <tr v-for="m in attestation.modules" :key="m.id">
                <td>{{ m.titre }}</td>
                <td>{{ m.quizScore !== null ? m.quizScore + ' %' : '—' }}</td>
                <td>{{ m.quizDate ? m.quizDate.slice(0, 10) : '—' }}</td>
              </tr>
            </tbody>
          </table>
          <p class="hash">SHA-256 : <code>{{ attestation.hash }}</code></p>
        </div>

        <p v-if="enregistrementDistant === 'ok'" class="statut ok no-print">Enregistrée dans ton compte.</p>
        <p v-else-if="enregistrementDistant === 'échec'" class="statut ko no-print">Échec d'enregistrement distant — le JSON exporté reste ta preuve.</p>

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
