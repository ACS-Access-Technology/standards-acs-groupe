<script setup>
import { ref, computed } from 'vue'
import { quiz } from '../data/quizFinal.js'
import { X, CheckCircle2 } from '../data/icones.js'

const emit = defineEmits(['fermer', 'reussi'])

const SEUIL = 8 // sur 10

const reponses = ref(Array(quiz.length).fill(null))
const soumis = ref(false)

function choisir(i, opt) {
  if (soumis.value) return
  reponses.value[i] = opt
}

const score = computed(() =>
  reponses.value.filter((r, i) => r === quiz[i].correct).length
)

const toutRepondu = computed(() => reponses.value.every(r => r !== null))
const reussi = computed(() => score.value >= SEUIL)

function valider() {
  soumis.value = true
  if (reussi.value) emit('reussi')
}

function reessayer() {
  reponses.value = Array(quiz.length).fill(null)
  soumis.value = false
}
</script>

<template>
  <div class="voile-quiz" role="dialog" aria-modal="true" aria-labelledby="quiz-titre">
    <div class="quiz">
      <header>
        <div>
          <h2 id="quiz-titre">Validation des connaissances</h2>
          <p>Palier « application » — {{ SEUIL }}/{{ quiz.length }} requis pour terminer le parcours.</p>
        </div>
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>
      </header>

      <div class="liste">
        <div v-for="(item, i) in quiz" :key="i" class="question" :class="{ correcte: soumis && reponses[i] === item.correct, fausse: soumis && reponses[i] !== item.correct }">
          <p class="enonce">{{ i + 1 }}. {{ item.q }}</p>
          <label v-for="(opt, oi) in item.options" :key="oi" class="option">
            <input
              type="radio"
              :name="'q' + i"
              :checked="reponses[i] === oi"
              :disabled="soumis"
              @change="choisir(i, oi)"
            />
            <span>{{ opt }}</span>
          </label>
        </div>
      </div>

      <footer>
        <template v-if="!soumis">
          <span class="etat">{{ reponses.filter(r => r !== null).length }}/{{ quiz.length }} répondues</span>
          <button class="valider" :disabled="!toutRepondu" @click="valider">Valider</button>
        </template>
        <template v-else>
          <span class="resultat" :class="{ ok: reussi }">
            <CheckCircle2 v-if="reussi" :size="18" />
            Score : {{ score }}/{{ quiz.length }} — {{ reussi ? 'réussi' : 'insuffisant' }}
          </span>
          <button v-if="!reussi" class="valider" @click="reessayer">Recommencer</button>
          <button v-else class="valider" @click="emit('fermer')">Terminer</button>
        </template>
      </footer>
    </div>
  </div>
</template>

<style scoped>
.voile-quiz {
  position: fixed; inset: 0; z-index: 45; background: rgba(18, 28, 66, .45);
  display: flex; align-items: center; justify-content: center; padding: 16px;
}
.quiz {
  width: min(680px, 100%); max-height: 88vh; background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  display: flex; flex-direction: column; overflow: hidden;
}
header {
  display: flex; justify-content: space-between; align-items: flex-start;
  padding: 20px 24px 12px; gap: 12px;
}
h2 { font-size: 20px; font-weight: 700; color: var(--texte-plein); }
header p { font-size: 13px; color: var(--muted); margin-top: 4px; }
.fermer { border: none; background: none; color: var(--texte-plein); cursor: pointer; flex-shrink: 0; }
.liste { overflow-y: auto; padding: 0 24px 12px; display: flex; flex-direction: column; gap: 18px; }
.question { border-bottom: 1px solid var(--bordure); padding-bottom: 14px; }
.question.correcte .enonce { color: var(--texte-plein); }
.question.fausse .enonce::after { content: ' — réponse à revoir'; color: var(--accent-rouge); font-size: 12px; font-weight: 400; }
.enonce { font-size: 14px; font-weight: 700; color: var(--texte-plein); margin-bottom: 8px; }
.option {
  display: flex; align-items: center; gap: 8px; padding: 6px 4px; font-size: 13.5px;
  color: var(--texte); cursor: pointer;
}
.option input { accent-color: var(--primaire); }
footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 24px 20px;
}
.etat { font-size: 13px; color: var(--muted); }
.valider {
  border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 500;
  font-family: inherit; cursor: pointer; background: var(--primaire); color: var(--sur-primaire);
}
.valider:disabled { background: var(--bordure); color: var(--muted); cursor: not-allowed; }
.resultat { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--accent-rouge); }
.resultat.ok { color: var(--primaire); }
@media (max-width: 640px) {
  .voile-quiz { padding: 8px; }
  .quiz { max-height: 94vh; }
}
</style>
