<script setup>
import { computed, ref, onMounted } from 'vue'
import { modules } from '../data/modules.js'
import { lectures } from '../data/lectures.js'
import { quiz } from '../data/quiz.js'
import { versionActuelle } from '../services/corpusVersion.js'
import { icones, X, Lock, BookOpen, CheckCircle2, AlertTriangle } from '../data/icones.js'
import Quiz from './Quiz.vue'

const props = defineProps({
  module: Object,
  progression: Object,
  debloque: Boolean,
  profil: { type: String, default: 'junior' },
})

const lecture = computed(() => lectures[props.module.id]?.[props.profil] || null)
const emit = defineEmits(['fermer', 'objectif', 'termine', 'lire', 'lexique', 'quiz-reussi'])

const questionsQuiz = computed(() => quiz[props.module.id] || [])
const quizOuvert = ref(false)
// Réinitialisé à chaque (ré)ouverture de la fiche : l'échec impose de refermer/rouvrir pour retenter.
const quizDisponible = ref(true)
const quizReussi = computed(() => (props.progression?.quizScore || 0) >= 75)

const versionCourante = ref(null)
onMounted(async () => { versionCourante.value = await versionActuelle() })
const estObsolete = computed(() =>
  !!(props.progression?.versionCorpus && versionCourante.value && props.progression.versionCorpus !== versionCourante.value)
)

function surEchecQuiz() {
  quizOuvert.value = false
  quizDisponible.value = false
}
function surReussiteQuiz({ score, reponses }) {
  quizOuvert.value = false
  emit('quiz-reussi', { score, reponses })
}

const prerequisTitres = computed(() =>
  props.module.prerequis.map(p => modules.find(m => m.id === p)?.titre)
)

const prerequisManquants = computed(() =>
  props.module.prerequis
    .filter(p => !JSON.parse(localStorage.getItem('parcours-acs-v1') || '{}')[p]?.termine)
    .map(p => modules.find(m => m.id === p)?.titre)
)

const objectifsCoches = computed(() =>
  props.module.objectifs.filter((_, i) => props.progression?.objectifs?.[i]).length
)

const toutCoche = computed(() => objectifsCoches.value === props.module.objectifs.length)
</script>

<template>
  <div class="voile" @click.self="emit('fermer')">
    <div class="fiche">

      <!-- Colonne principale -->
      <div class="principale">
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>

        <div class="espace-noeud" aria-hidden="true"></div>

        <div class="identite-mobile">
          <span class="tuile" :style="{ background: module.couleur }">
            <component :is="icones[module.icone]" :size="26" :stroke-width="1.8" color="#fff" />
          </span>
          <h1>{{ module.titre }}</h1>
        </div>

        <p v-if="!debloque" class="verrou">
          <Lock :size="14" class="inline-ico" /> Prérequis à terminer d'abord :
          {{ prerequisManquants.join(', ') }}. Tu peux quand même lire le module.
        </p>

        <div class="carte-bloc description">
          <template v-if="profil === 'junior' && lecture">
            <p>{{ lecture.simple }}</p>
            <p class="analogie"><Lightbulb :size="15" class="inline-ico" /> <em>{{ lecture.analogie }}</em></p>
            <p class="exemple"><strong>Concrètement :</strong> {{ lecture.exemple }}</p>
          </template>
          <template v-else-if="profil === 'intermediaire' && lecture">
            <p>{{ lecture.resume }}</p>
            <p class="piege"><strong>Piège classique :</strong> {{ lecture.piege }}</p>
          </template>
          <template v-else-if="profil === 'senior' && lecture">
            <p class="regle">{{ lecture.regle }}</p>
            <p class="renvoi">Le détail normatif est dans <code>{{ module.doc }}</code>.</p>
          </template>
          <p v-else>{{ module.resume }}</p>
        </div>

        <div class="duo">
          <div class="carte-bloc">
            <h3>Informations</h3>
            <ul>
              <li>{{ module.objectifs.length }} objectifs</li>
              <li>Étape : {{ module.etape }}</li>
              <li>Prérequis : {{ prerequisTitres.length ? prerequisTitres.join(', ') : 'aucun' }}</li>
            </ul>
          </div>
          <div class="carte-bloc">
            <h3>Liens utiles</h3>
            <ul>
              <li><a href="#" @click.prevent="emit('lire', module.doc)">Le document complet</a></li>
              <li><a href="#" @click.prevent="emit('lire', 'README.md')">Le README du corpus</a></li>
              <li><a href="#" @click.prevent="emit('lire', '10-gabarits.md')">Les gabarits</a></li>
              <li><a href="#" @click.prevent="emit('lexique')">Le lexique (un mot t'échappe ?)</a></li>
            </ul>
          </div>
        </div>

        <p v-if="progression?.termine && estObsolete" class="verrou obsolete">
          <AlertTriangle :size="14" class="inline-ico" /> Validé sur une version antérieure du corpus (le contenu a évolué depuis). Ta validation reste enregistrée ; relis le module si tu veux la rafraîchir.
        </p>
        <button
          v-if="progression?.termine || (toutCoche && quizReussi)"
          class="valider" :class="{ fait: progression?.termine }"
          @click="emit('termine')"
        >
          <CheckCircle2 :size="18" />
          <template v-if="progression?.termine">Terminé — cliquer pour rouvrir</template>
          <template v-else>J'ai terminé ce module</template>
        </button>
        <button
          v-else-if="toutCoche && questionsQuiz.length && quizDisponible"
          class="valider"
          @click="quizOuvert = true"
        >
          <CheckCircle2 :size="18" />Lancer le quiz de validation
        </button>
        <p v-else-if="toutCoche && questionsQuiz.length && !quizDisponible" class="verrou">
          Quiz non réussi ({{ progression?.quizScore ?? 0 }} %). Referme la fiche puis rouvre-la pour retenter.
        </p>
        <button v-else class="valider" disabled>
          <CheckCircle2 :size="18" />Coche les objectifs pour terminer ({{ objectifsCoches }}/{{ module.objectifs.length }})
        </button>

        <Quiz
          v-if="quizOuvert"
          :questions="questionsQuiz"
          :titre="module.titre"
          @fermer="quizOuvert = false"
          @reussi="surReussiteQuiz"
          @echec="surEchecQuiz"
        />
      </div>

      <!-- Colonne chapitres -->
      <aside class="chapitres-col">
        <h2><BookOpen :size="22" class="inline-ico" /> Objectifs
          <span class="compteur">{{ objectifsCoches }}/{{ module.objectifs.length }}</span>
        </h2>

        <p class="titre-section">1. À maîtriser</p>
        <div class="carte-liste">
          <label v-for="(o, i) in module.objectifs" :key="i" class="ligne">
            <span>{{ o }}</span>
            <input
              type="checkbox"
              :checked="progression?.objectifs?.[i] || false"
              @change="emit('objectif', i)"
            />
          </label>
        </div>

        <p class="titre-section">2. Ressources</p>
        <div class="carte-liste">
          <a class="ligne lien" href="#" @click.prevent="emit('lire', module.doc)">
            <span>{{ module.doc }}</span>
          </a>
        </div>
      </aside>

    </div>
  </div>
</template>

<style scoped>
/* La fiche recouvre le canevas, qui reste visible très estompé derrière */
.voile {
  position: fixed; inset: 0; z-index: 10;
  background: color-mix(in srgb, var(--fond) 25%, transparent);
}
@media (max-width: 768px) {
  .voile { background: var(--fond); } /* pas de canevas derrière sur mobile */
  .fiche { padding: 24px 16px 60px; gap: 20px; }
  .fermer { top: -6px; width: 44px; height: 44px; }
  overflow-y: auto;
}
.fiche {
  max-width: 1350px; margin: 0 auto; padding: 110px 32px 110px;
  display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 48px;
  transition: all .6s ease;
  animation: apparait .3s ease;
}
@keyframes apparait { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (max-width: 980px) { .fiche { grid-template-columns: 1fr; gap: 28px; } }

/* --- Colonne principale --- */
.principale { display: flex; flex-direction: column; gap: 18px; position: relative; }
.espace-noeud { height: 185px; } /* le nœud réel, resté net sur le canevas, occupe cet espace */
.identite-mobile { display: none; }
h1 { font-size: 22px; font-weight: 700; color: var(--primaire); }
@media (max-width: 768px) {
  .espace-noeud { display: none; }
  .identite-mobile { display: flex; align-items: center; gap: 12px; padding-top: 8px; }
  .tuile { width: 48px; height: 48px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
}
.fermer {
  position: absolute; top: 0; right: 0; width: 36px; height: 36px;
  border: none; background: none; color: var(--texte-plein); cursor: pointer;
}
.identite { display: flex; flex-direction: column; align-items: center; gap: 14px; padding: 8px 0 16px; }
.logo {
  width: 64px; height: 64px; border-radius: 8px;
  display: flex; align-items: center; justify-content: center;
}
h1 { font-size: 24px; font-weight: 700; color: var(--primaire); text-align: center; }

.verrou { background: var(--avert-fond); color: var(--avert-texte); padding: 12px 16px; font-size: 14px; border-radius: 8px; }
.verrou.obsolete { font-size: 13px; }

.carte-bloc { background: var(--card); border-radius: 8px; padding: 16px; box-shadow: var(--ring); }
.description p { font-size: 16px; line-height: 1.75; max-width: 72ch; }
.description p + p { margin-top: 14px; }
.analogie { background: var(--list-hover); border-radius: 4px; padding: 12px 16px; font-size: 15px; }
.exemple { font-size: 15px; }
.piege { background: var(--avert-fond); color: var(--avert-texte); border-radius: 4px; padding: 12px 16px; font-size: 15px; }
.regle { font-weight: 500; }
.renvoi { font-size: 13px; color: var(--muted); }
.renvoi code { background: var(--ligne-chapitre); padding: 1px 6px; border-radius: 4px; }
h3 { font-size: 18px; font-weight: 700; color: var(--texte-plein); margin-bottom: 10px; }
.carte-bloc ul { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 8px; font-size: 15px; }
.carte-bloc a { color: var(--texte); text-decoration: none; }
.carte-bloc a:hover { color: var(--primaire); text-decoration: underline; }
.duo { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
@media (max-width: 640px) { .duo { grid-template-columns: 1fr; } }

/* Bouton principal : primaire, rayon 8, 18px médium, pleine largeur, sans ombre */
.valider {
  width: 100%; padding: 10px 16px; border: none; border-radius: 8px;
  background: var(--primaire); color: var(--sur-primaire);
  font-size: 18px; font-weight: 500; font-family: inherit; cursor: pointer;
  display: flex; align-items: center; justify-content: center; gap: 8px;
  margin-top: 4px;
}
.valider.fait { background: var(--card); color: var(--primaire); box-shadow: var(--ring); }
.valider:disabled { background: var(--bordure); color: var(--muted); cursor: not-allowed; }

/* --- Colonne chapitres --- */
.chapitres-col { display: flex; flex-direction: column; gap: 12px; }
h2 {
  font-size: 24px; font-weight: 700; color: var(--texte-plein);
  display: flex; align-items: center; gap: 8px;
}
.compteur { font-size: 14px; font-weight: 400; color: var(--muted); margin-left: auto; }
.titre-section { font-size: 16px; font-weight: 700; color: var(--texte-plein); margin-top: 8px; }

/* Une carte blanche par section ; lignes séparées par un filet, durée à droite */
.carte-liste {
  background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  display: flex; flex-direction: column; overflow: hidden;
}
.ligne {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 12px 16px; font-size: 14px; color: var(--texte);
  cursor: pointer; text-decoration: none;
  border-bottom: 1px solid var(--bordure);
  transition: background .15s ease;
}
.ligne:last-child { border-bottom: none; }
.ligne:hover { background: var(--list-hover); }
.ligne input { accent-color: var(--primaire); flex-shrink: 0; }
.inline-ico { vertical-align: -3px; }
</style>
