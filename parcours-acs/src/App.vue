<script setup>
import { ref, computed, watch, onUnmounted, nextTick } from 'vue'
import CursusMap from './components/CursusMap.vue'
import CursusListe from './components/CursusListe.vue'
import ModulePanel from './components/ModulePanel.vue'
import DocViewer from './components/DocViewer.vue'
import Lexique from './components/Lexique.vue'
import Connexion from './components/Connexion.vue'
import * as synchro from './services/synchro.js'
import { registerSW } from 'virtual:pwa-register'
import QuizFinal from './components/QuizFinal.vue'
import Attestation from './components/Attestation.vue'
import { versionActuelle } from './services/corpusVersion.js'
import { modules } from './data/modules.js'
import { profils } from './data/lectures.js'

const STORAGE_KEY = 'parcours-acs-v1'

function charger() {
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || {} } catch { return {} }
}

const progression = ref(charger())
const moduleActif = ref(null)
const carteRef = ref(null)
// PWA : proposer la mise à jour quand une nouvelle version du corpus est publiée
const majDisponible = ref(false)
const appliquerMaj = registerSW({
  onNeedRefresh() { majDisponible.value = true },
})
const horsLigne = ref(!navigator.onLine)
window.addEventListener('online', () => { horsLigne.value = false })
window.addEventListener('offline', () => { horsLigne.value = true })

const mq = window.matchMedia('(max-width: 768px)')
const estMobile = ref(mq.matches)
const surMq = e => { estMobile.value = e.matches }
mq.addEventListener('change', surMq)
onUnmounted(() => mq.removeEventListener('change', surMq))
const docActif = ref(null)
const lexiqueOuvert = ref(false)
const quizOuvert = ref(false)
const quizReussi = ref(localStorage.getItem('parcours-acs-quiz-reussi') === '1')
const attestationOuverte = ref(false)

function marquerQuizReussi() {
  quizReussi.value = true
  localStorage.setItem('parcours-acs-quiz-reussi', '1')
}

function fermerFiche() {
  moduleActif.value = null
  carteRef.value?.recentrer()   // dézoom automatique : on revoit toute la carte
}
const premiereVisite = ref(!localStorage.getItem('parcours-acs-profil'))
const profil = ref(localStorage.getItem('parcours-acs-profil') || 'junior')
const bienvenueRef = ref(null)

function choisirProfil(id) {
  profil.value = id
  premiereVisite.value = false
}
watch(profil, v => localStorage.setItem('parcours-acs-profil', v))

watch(premiereVisite, async ouverte => {
  if (!ouverte) return
  await nextTick()
  bienvenueRef.value?.querySelector('button')?.focus()
}, { immediate: true })

function pieger(e) {
  if (e.key !== 'Tab') return
  const focusables = bienvenueRef.value?.querySelectorAll('button')
  if (!focusables?.length) return
  const premier = focusables[0]
  const dernier = focusables[focusables.length - 1]
  if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus() }
  else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus() }
}
const logoOk = ref(true)
const logoUrl = import.meta.env.BASE_URL + 'logo-acs.png'

watch(progression, v => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(v))
  synchro.planifier(v)   // pousse vers PocketBase si configuré (file locale sinon)
}, { deep: true })

const connexionOuverte = ref(false)

// Fusion au login : par module, l'horodatage le plus récent gagne (simplification documentée)
function fusionner(distante) {
  const locale = progression.value
  const majLocale = Number(localStorage.getItem('parcours-acs-maj') || 0)
  for (const [module, entree] of Object.entries(distante)) {
    const distantPlusRecent = new Date(entree.maj).getTime() >= majLocale
    const existant = locale[module]
    // Ce qui vient de rapatrier() est lu directement depuis PocketBase — donc déjà repassé
    // par le hook de revalidation serveur. Ce n'est jamais une donnée "client" locale.
    const donneesDistantes = { ...entree.donnees, scoreSource: entree.donnees?.scoreSource || 'server' }
    if (!existant) { locale[module] = donneesDistantes; continue }

    // Le reste de la fiche (objectifs, termine) suit l'horodatage le plus récent.
    // Le score de quiz suit une règle différente et plus stricte (Fatima, revue party mode,
    // 2e passe) : un score "server" (recalculé par le hook PocketBase) bat toujours un score
    // "client" (calculé localement, pas encore revalidé) quel que soit le montant — sinon un
    // score local jamais repassé par le hook pourrait battre un score serveur légitime dans
    // la fenêtre avant sa propre revalidation. Entre deux scores de même provenance, le
    // meilleur gagne, comme avant.
    const base = distantPlusRecent ? donneesDistantes : existant
    const autre = distantPlusRecent ? existant : donneesDistantes
    const fusionne = { ...base }
    const autreEstServeur = autre?.scoreSource === 'server'
    const baseEstServeur = fusionne?.scoreSource === 'server'
    const autreGagne = autreEstServeur && !baseEstServeur
      ? true
      : (autreEstServeur === baseEstServeur && (autre?.quizScore ?? -1) > (fusionne.quizScore ?? -1))
    if (autreGagne) {
      fusionne.quizScore = autre.quizScore
      fusionne.quizDate = autre.quizDate
      fusionne.versionCorpus = autre.versionCorpus
      fusionne.scoreSource = autre.scoreSource
    }
    locale[module] = fusionne
  }
}

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

async function enregistrerQuiz(moduleId, { score, reponses }) {
  const p = progression.value[moduleId] || (progression.value[moduleId] = { objectifs: {}, termine: false })
  p.quizScore = score // indicatif, hors ligne uniquement — le hook PocketBase le recalcule et l'écrase à la synchro
  p.quizDate = new Date().toISOString()
  p.versionCorpus = await versionActuelle() // gel de la version validée (cf. Attestation.vue pour la détection d'obsolescence)
  p.reponses = reponses // transmis au serveur pour revalidation (pocketbase/pb_hooks/main.pb.js) ; jamais affiché tel quel
  p.scoreSource = 'client' // jamais fait confiance dans une fusion tant que le hook serveur ne l'a pas revalidé (cf. fusionner())
}

function reinitialiser() {
  if (confirm('Réinitialiser toute la progression ?')) {
    progression.value = {}
    quizReussi.value = false
    localStorage.removeItem('parcours-acs-quiz-reussi')
  }
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
      <div class="actions">
      <button class="btn-lexique" @click="lexiqueOuvert = true">Lexique</button>
      <button
        v-if="synchro.actif"
        class="btn-lexique btn-sync"
        :title="synchro.enAttente.value ? synchro.enAttente.value + ' modification(s) en attente de synchronisation' : 'Synchronisé'"
        @click="synchro.connecte.value ? synchro.deconnecter() : connexionOuverte = true"
      >
        <span class="point" :class="{ ok: synchro.connecte.value && !synchro.enAttente.value, attente: synchro.enAttente.value }"></span>
        {{ synchro.connecte.value ? synchro.nomDev.value : 'Se connecter' }}
      </button>
      <div class="profil-choix" title="Le niveau adapte l'explication, jamais la règle">
        <button
          v-for="pr in profils" :key="pr.id"
          :class="{ actif: profil === pr.id }"
          @click="profil = pr.id"
        >{{ pr.label }}</button>
      </div>
      </div>
      <div class="score">
        <div class="barre"><div class="remplissage" :style="{ width: stats.pct + '%' }"></div></div>
        <span>{{ stats.termines }}/{{ stats.total }} — {{ stats.pct }} %</span>
        <button
          v-if="stats.pct === 100 && !quizReussi"
          class="valider-connaissances"
          @click="quizOuvert = true"
        >Valider mes connaissances</button>
        <span v-else-if="quizReussi" class="quiz-ok">Connaissances validées ✓</span>
        <button
          v-if="stats.pct === 100"
          class="valider-connaissances"
          @click="attestationOuverte = true"
        >Voir mon attestation</button>
        <button class="reset" @click="reinitialiser">Réinitialiser</button>
      </div>
    </header>

    <template v-if="estMobile">
      <CursusListe
        :modules="modules"
        :progression="progression"
        :est-debloque="estDebloque"
        @ouvrir="ouvrir"
      />
      <button class="reset-mobile" @click="reinitialiser">Réinitialiser la progression</button>
    </template>
    <CursusMap
      v-else
      ref="carteRef"
      @reinitialiser="reinitialiser"
      :actif="moduleActif ? moduleActif.id : null"
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
      @quiz-reussi="donnees => enregistrerQuiz(moduleActif.id, donnees)"
      @lire="d => docActif = d"
      @lexique="lexiqueOuvert = true"
    />

    <DocViewer v-if="docActif" :doc="docActif" @fermer="docActif = null" />
    <Lexique v-if="lexiqueOuvert" @fermer="lexiqueOuvert = false" />
    <Connexion v-if="connexionOuverte" @fermer="connexionOuverte = false" @fusion="fusionner" />

    <div v-if="majDisponible" class="toast-maj" role="status">
      <span>Nouvelle version du parcours disponible.</span>
      <button @click="appliquerMaj()">Recharger</button>
    </div>
    <div v-if="horsLigne" class="toast-horsligne" role="status">
      Hors connexion — tout le parcours reste disponible, ta progression est enregistrée en local.
    </div>
    <QuizFinal v-if="quizOuvert" @fermer="quizOuvert = false" @reussi="marquerQuizReussi" />
    <Attestation v-if="attestationOuverte" :progression="progression" :profil="profil" @fermer="attestationOuverte = false" />

    <div v-if="premiereVisite" class="bienvenue-voile">
      <div
        class="bienvenue"
        ref="bienvenueRef"
        role="dialog"
        aria-modal="true"
        aria-labelledby="bienvenue-titre"
        @keydown="pieger"
      >
        <h2 id="bienvenue-titre">Bienvenue dans le parcours ACS 👋</h2>
        <p class="bienvenue-enjeu">{{ modules.length }} modules · obligatoire avant ta première PR</p>
        <p>Chaque point de la carte est un module des standards de développement. Tu ouvres un module, tu lis, tu coches ses objectifs — et le suivant se débloque. Suis le badge « Commence ici ».</p>
        <p><strong>Choisis ton profil</strong> : il adapte seulement la façon d'expliquer (plus d'exemples pour un junior, la règle sèche pour un senior). Les règles et les objectifs sont les mêmes pour tout le monde — et tu peux changer à tout moment en haut de l'écran.</p>
        <div class="choix">
          <button v-for="pr in profils" :key="pr.id" @click="choisirProfil(pr.id)">{{ pr.label }}</button>
        </div>
      </div>
    </div>
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
  --muted: rgba(18, 28, 66, .7);
  --edge: #acb8c0;
  --bordure: #dde7fd;
  --grille: #d5e3ec;
  --ring: 0 0 0 1px rgba(18, 28, 66, .085);
  /* Socle 3D des nœuds : face supérieure, épaisseur, ombre au sol */
  --socle-haut-1: #ffffff;
  --socle-haut-2: #ccd6e2;
  --socle-cote-1: #9aa9bd;
  --socle-cote-2: #75859c;
  --socle-ombre: rgba(18, 28, 66, .16);
  --avert-fond: #fbeeb1;
  --avert-texte: #4a3a05;
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
    --muted: rgba(238, 240, 255, .72);
    --edge: #595e9d;
    --bordure: #2e3163;
    --grille: #262a55;
    --ring: 0 0 0 1px rgba(0, 0, 0, .35);
    --socle-haut-1: #3a3e78;
    --socle-haut-2: #262a55;
    --socle-cote-1: #1c1f45;
    --socle-cote-2: #12142f;
    --socle-ombre: rgba(0, 0, 0, .45);
    --avert-fond: #3d3512;
    --avert-texte: #f0e4ac;
    --ligne-chapitre: #171933;
    --list-hover: color-mix(in srgb, #7c8cf8 8%, transparent);
  }
}
* { margin: 0; padding: 0; box-sizing: border-box; }
:focus-visible { outline: 2px solid var(--primaire); outline-offset: 2px; border-radius: 4px; }
body {
  font-family: 'Inter', system-ui, -apple-system, sans-serif;
  font-weight: 400;
  background: var(--fond);
  color: var(--texte);
}
.app { min-height: 100vh; display: flex; flex-direction: column; }
header {
  display: flex; justify-content: space-between; align-items: center; gap: 24px; flex-wrap: wrap;
  padding: 14px 28px; background: var(--card); box-shadow: var(--ring); position: relative; z-index: 2;
}
.actions { display: flex; align-items: center; gap: 10px; }
h1 { font-size: 20px; font-weight: 700; color: var(--texte-plein); }
h1 span { font-weight: 500; color: var(--muted); font-size: 14px; margin-left: 10px; }
header p { font-size: 13px; color: var(--muted); margin-top: 4px; }
.marque { display: flex; align-items: center; gap: 16px; }
.logo-acs { height: 46px; width: auto; }
.logo-texte { font-weight: 800; font-size: 20px; letter-spacing: .5px; }
.logo-texte .a { color: #e8262d; }
.logo-texte .c { color: #1b2a9e; }
.logo-texte .s { color: #f28c1f; }
.btn-lexique {
  border: none; background: var(--fond); box-shadow: var(--ring); border-radius: 8px;
  padding: 8px 14px; font-size: 13px; font-family: inherit; color: var(--texte); cursor: pointer;
}
.btn-lexique:hover { color: var(--primaire); }
.btn-sync { display: flex; align-items: center; gap: 8px; }
.point { width: 8px; height: 8px; border-radius: 50%; background: var(--muted); }
.point.ok { background: #1f7a4d; }
.point.attente { background: var(--accent-orange); }
.profil-choix {
  display: flex; background: var(--fond); border-radius: 8px; padding: 3px; box-shadow: var(--ring);
}
.profil-choix button {
  border: none; background: none; padding: 6px 14px; font-size: 13px; font-family: inherit;
  color: var(--muted); cursor: pointer; border-radius: 6px;
}
.profil-choix button.actif { background: var(--primaire); color: var(--sur-primaire); font-weight: 500; }
.bienvenue-voile {
  position: fixed; inset: 0; z-index: 40; background: rgba(18, 28, 66, .25);
  backdrop-filter: blur(6px); -webkit-backdrop-filter: blur(6px);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.bienvenue {
  width: min(520px, 100%); background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  padding: 32px; display: flex; flex-direction: column; gap: 14px;
}
.bienvenue h2 { font-size: 22px; font-weight: 700; color: var(--texte-plein); }
.bienvenue-enjeu { font-size: 13px; font-weight: 600; color: var(--primaire); text-transform: uppercase; letter-spacing: .04em; }
.bienvenue p { font-size: 15px; line-height: 1.6; }
.choix { display: flex; gap: 10px; margin-top: 6px; }
.choix button {
  flex: 1; padding: 10px; border: none; border-radius: 8px; cursor: pointer;
  background: var(--primaire); color: var(--sur-primaire); font-size: 15px; font-weight: 500; font-family: inherit;
}
.choix button:hover { opacity: .9; }
.score { display: flex; align-items: center; gap: 12px; font-size: 13px; }
.reset-mobile {
  margin: 0 16px 24px; padding: 12px; border: none; border-radius: 8px;
  background: var(--card); box-shadow: var(--ring); color: var(--muted);
  font-size: 13px; font-family: inherit; cursor: pointer;
}
.reset-mobile:hover { color: var(--accent-rouge); }
.toast-maj, .toast-horsligne {
  position: fixed; bottom: 16px; left: 50%; transform: translateX(-50%);
  display: flex; align-items: center; gap: 14px; z-index: 50;
  background: var(--texte-plein); color: var(--fond);
  padding: 12px 18px; border-radius: 8px; font-size: 14px;
  box-shadow: 0 4px 16px rgba(18, 28, 66, .25);
  max-width: calc(100vw - 32px);
}
.toast-maj button {
  border: none; border-radius: 6px; padding: 7px 14px; cursor: pointer;
  background: var(--primaire); color: var(--sur-primaire); font-family: inherit; font-size: 13px; font-weight: 500;
}
.toast-horsligne { background: var(--avert-fond); color: var(--avert-texte); }
@media (max-width: 768px) {
  header { padding: 12px 16px; gap: 12px; }
  header p { display: none; }
  .logo-acs { height: 34px; }
  h1 { font-size: 16px; }
  h1 span { display: block; margin-left: 0; font-size: 12px; }
  .barre { width: 90px; }
  .profil-choix button { padding: 11px 12px; font-size: 12px; }
  .btn-lexique { padding: 11px 14px; }
}
.barre { width: 180px; height: 8px; background: var(--bordure); border-radius: 8px; overflow: hidden; }
.remplissage { height: 100%; background: var(--primaire); transition: width .3s; }

.valider-connaissances {
  border: none; background: var(--primaire); color: var(--sur-primaire); border-radius: 8px;
  padding: 6px 12px; font-size: 12px; font-family: inherit; cursor: pointer; font-weight: 500;
}
.quiz-ok { font-size: 12px; color: var(--primaire); font-weight: 600; }
</style>
