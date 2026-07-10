<script setup>
import { ref, computed, watch } from 'vue'
import CursusMap from './components/CursusMap.vue'
import ModulePanel from './components/ModulePanel.vue'
import { modules } from './data/modules.js'
import { profils } from './data/lectures.js'

const STORAGE_KEY = 'parcours-acs-v1'

function charger() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

const progression = ref(charger())
const moduleActif = ref(null)
const carteRef = ref(null)

function fermerFiche() {
  moduleActif.value = null
  carteRef.value?.recentrer()   // dézoom automatique : on revoit toute la carte
}
const profil = ref(localStorage.getItem('parcours-acs-profil') || 'junior')
watch(profil, v => localStorage.setItem('parcours-acs-profil', v))
const logoOk = ref(true)
const logoUrl = import.meta.env.BASE_URL + 'logo-acs.png'

watch(progression, v => localStorage.setItem(STORAGE_KEY, JSON.stringify(v)), { deep: true })

const stats = computed(() => {
  const termines = modules.filter(m => progression.value[m.id]?.termine).length
  return { termines, total: modules.length, pct: Math.round((termines / modules.length) * 100) }
})

function estDebloque(m) {
  return m.prerequis.every(p => progression.value[p]?.termine)
}

function ouvrir(m) { moduleActif.value = m }

function basculerObjectif(moduleId, index) {
  const p = progression.value[moduleId] || (progression.value[moduleId] = { objectifs: {}, termine: false })
  if (!p.objectifs) p.objectifs = {}
  p.objectifs[index] = !p.objectifs[index]
}

function basculerTermine(moduleId) {
  const p = progression.value[moduleId] || (progression.value[moduleId] = { objectifs: {}, termine: false })
  p.termine = !p.termine
}

function reinitialiser() {
  if (confirm('Réinitialiser toute la progression ?')) progression.value = {}
}
</script>

<template>
  <div class="app">
    <header>
      <div class="marque">
        <img
          v-if="logoOk"
          class="logo-acs"
          :src="logoUrl"
          alt="ACS Group"
          @error="logoOk = false"
        />
        <span v-else class="logo-texte"><b class="a">A</b><b class="c">C</b><b class="s">S</b> <b class="c">GROUP</b></span>
        <div>
          <h1>Parcours développeur <span>Standards ACS Groupe v1.2</span></h1>
          <p>Suis le chemin, ouvre chaque module, coche les objectifs. Un module se débloque quand ses prérequis sont terminés.</p>
        </div>
      </div>
      <div class="profil-choix" title="Le niveau adapte l'explication, jamais la règle">
        <button
          v-for="pr in profils" :key="pr.id"
          :class="{ actif: profil === pr.id }"
          @click="profil = pr.id"
        >{{ pr.label }}</button>
      </div>
      <div class="score">
        <div class="barre"><div class="remplissage" :style="{ width: stats.pct + '%' }"></div></div>
        <span>{{ stats.termines }}/{{ stats.total }} — {{ stats.pct }} %</span>
        <button class="reset" @click="reinitialiser">Réinitialiser</button>
      </div>
    </header>

    <CursusMap
      ref="carteRef"
      :modules="modules"
      :progression="progression"
      :est-debloque="estDebloque"
      @ouvrir="ouvrir"
    />

    <ModulePanel
      v-if="moduleActif"
      :module="moduleActif"
      :progression="progression[moduleActif.id]"
      :debloque="estDebloque(moduleActif)"
      :profil="profil"
      @fermer="fermerFiche()"
      @objectif="i => basculerObjectif(moduleActif.id, i)"
      @termine="basculerTermine(moduleActif.id)"
    />
  </div>
</template>

<style>
:root {
  --fond: #f7fafb;
  --primaire: #1b2a9e;   /* bleu ACS */
  --accent-rouge: #e8262d;
  --accent-orange: #f28c1f;
  --sur-primaire: #f4f6ff;
  --card: #fff;
  --texte: rgba(18, 28, 66, .85);
  --texte-plein: #121c42;
  --muted: rgba(18, 28, 66, .6);
  --edge: #acb8c0;
  --bordure: #dde7fd;
  --grille: #d5e3ec;
  --ring: 0 0 0 1px rgba(18, 28, 66, .085);
  --ligne-chapitre: #f7fafb;
  --list-hover: color-mix(in srgb, #1b2a9e 8%, transparent);
}
@media (prefers-color-scheme: dark) {
  :root {
    --fond: #171933;
    --primaire: #7c8cf8;   /* bleu ACS éclairci pour le sombre */
    --card: #22244d;
    --texte: rgba(238, 240, 255, .85);
    --texte-plein: #eef0ff;
    --muted: rgba(238, 240, 255, .6);
    --edge: #595e9d;
    --bordure: #2e3163;
    --grille: #262a55;
    --ring: 0 0 0 1px rgba(0, 0, 0, .35);
    --ligne-chapitre: #171933;
    --list-hover: color-mix(in srgb, #7c8cf8 8%, transparent);
  }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  background: var(--fond);
  color: var(--texte);
}
.app { min-height: 100vh; display: flex; flex-direction: column; }
header {
  display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;
  padding: 16px 28px; background: var(--card); box-shadow: var(--ring); position: relative; z-index: 2;
}
h1 { font-size: 20px; font-weight: 700; color: var(--texte-plein); }
h1 span { font-weight: 500; color: var(--muted); font-size: 14px; margin-left: 10px; }
header p { font-size: 13px; color: var(--muted); margin-top: 4px; }
.marque { display: flex; align-items: center; gap: 16px; }
.logo-acs { height: 46px; width: auto; }
.logo-texte { font-weight: 800; font-size: 20px; letter-spacing: .5px; }
.logo-texte .a { color: #e8262d; }
.logo-texte .c { color: #1b2a9e; }
.logo-texte .s { color: #f28c1f; }
.profil-choix {
  display: flex; background: var(--fond); border-radius: 8px; padding: 3px; box-shadow: var(--ring);
}
.profil-choix button {
  border: none; background: none; padding: 6px 14px; font-size: 13px; font-family: inherit;
  color: var(--muted); cursor: pointer; border-radius: 6px;
}
.profil-choix button.actif { background: var(--primaire); color: var(--sur-primaire); font-weight: 500; }
.score { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.barre { width: 180px; height: 8px; background: var(--bordure); border-radius: 8px; overflow: hidden; }
.remplissage { height: 100%; background: linear-gradient(90deg, #e8262d, #f28c1f, #1b2a9e); transition: width .3s; }
.reset {
  border: none; background: var(--fond); color: var(--muted); box-shadow: var(--ring);
  padding: 6px 12px; font-size: 12px; font-family: inherit; border-radius: 8px; cursor: pointer;
}
.reset:hover { color: var(--accent-rouge); }
</style>
