<script setup>
import { ref, computed } from 'vue'
import { X, CheckCircle2 } from '../data/icones.js'

const props = defineProps({
  questions: { type: Array, required: true },
  titre: { type: String, default: '' },
})
const emit = defineEmits(['fermer', 'reussi', 'echec'])

const SEUIL = 0.75

const reponses = ref(Array(props.questions.length).fill(null))
const soumis = ref(false)

function choisir(i, opt) {
  if (soumis.value) return
  reponses.value[i] = opt
}

const score = computed(() =>
  reponses.value.filter((r, i) => r === props.questions[i].correct).length
)
const pct = computed(() => Math.round((score.value / props.questions.length) * 100))
const toutRepondu = computed(() => reponses.value.every(r => r !== null))
const reussi = computed(() => score.value / props.questions.length >= SEUIL)

function valider() {
  soumis.value = true
  // Le score affiché ici est indicatif (UX immédiate). La valeur qui compte pour
  // l'attestation est recalculée côté serveur à partir de `reponses` (Max, revue party mode).
  const donnees = { score: pct.value, reponses: [...reponses.value] }
  if (reussi.value) emit('reussi', donnees)
  else emit('echec', donnees)
}
</script>

<template>
  <div class="voile-quiz" role="dialog" aria-modal="true" aria-labelledby="quiz-titre">
    <div class="quiz">
      <header>
        <div>
          <h2 id="quiz-titre">Quiz — {{ titre }}</h2>
          <p>{{ Math.ceil(questions.length * SEUIL) }}/{{ questions.length }} bonnes réponses requises (75 %).</p>
        </div>
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>
      </header>

      <div class="liste">
        <div v-for="(item, i) in questions" :key="i" class="question" :class="{ correcte: soumis && reponses[i] === item.correct, fausse: soumis && reponses[i] !== item.correct }">
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
          <p v-if="soumis && reponses[i] !== item.correct && item.explication" class="explication">{{ item.explication }}</p>
        </div>
      </div>

      <footer>
        <template v-if="!soumis">
          <span class="etat">{{ reponses.filter(r => r !== null).length }}/{{ questions.length }} répondues</span>
          <button class="valider" :disabled="!toutRepondu" @click="valider">Valider</button>
        </template>
        <template v-else>
          <span class="resultat" :class="{ ok: reussi }">
            <CheckCircle2 v-if="reussi" :size="18" />
            Score : {{ pct }} % — {{ reussi ? 'réussi' : 'insuffisant' }}
          </span>
          <span v-if="!reussi" class="conseil">Relis le module, referme puis rouvre la fiche pour retenter.</span>
          <button v-else class="valider" @click="emit('fermer')">Continuer</button>
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
.explication { margin-top: 6px; font-size: 12.5px; color: var(--muted); font-style: italic; }
footer {
  display: flex; align-items: center; justify-content: space-between; gap: 12px;
  padding: 14px 24px 20px; flex-wrap: wrap;
}
.etat { font-size: 13px; color: var(--muted); }
.valider {
  border: none; border-radius: 8px; padding: 10px 18px; font-size: 14px; font-weight: 500;
  font-family: inherit; cursor: pointer; background: var(--primaire); color: var(--sur-primaire);
}
.valider:disabled { background: var(--bordure); color: var(--muted); cursor: not-allowed; }
.resultat { display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: var(--accent-rouge); }
.resultat.ok { color: var(--primaire); }
.conseil { font-size: 12.5px; color: var(--muted); }
@media (max-width: 640px) {
  .voile-quiz { padding: 8px; }
  .quiz { max-height: 94vh; }
}
</style>
