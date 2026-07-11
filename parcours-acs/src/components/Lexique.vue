<script setup>
import { ref, computed } from 'vue'
import { lexique } from '../data/lexique.js'
import { X } from '../data/icones.js'

const emit = defineEmits(['fermer'])
const recherche = ref('')

const normaliser = s => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

const resultats = computed(() => {
  const q = normaliser(recherche.value.trim())
  if (!q) return lexique
  return lexique.filter(e => normaliser(e.terme).includes(q) || normaliser(e.def).includes(q))
})
</script>

<template>
  <div class="voile-lex" @click.self="emit('fermer')">
    <div class="lex">
      <header>
        <h2 id="lex-titre">Lexique</h2>
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>
      </header>
      <label for="lex-recherche" class="sr-only">Rechercher un terme dans le lexique</label>
      <input
        id="lex-recherche"
        v-model="recherche"
        type="search"
        placeholder="Cherche un terme ou un mot de la définition… (ex. PR, secret, N+1)"
        autofocus
      />
      <div class="liste">
        <div v-for="e in resultats" :key="e.terme" class="entree">
          <span class="terme">{{ e.terme }}</span>
          <span class="def">{{ e.def }}</span>
        </div>
        <p v-if="!resultats.length" class="vide">
          Aucun résultat pour « {{ recherche }} ». Le terme manque ? Propose-le en PR — le lexique vit dans
          <code>src/data/lexique.js</code>.
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.voile-lex {
  overscroll-behavior: contain;
  position: fixed; inset: 0; z-index: 35; background: rgba(18, 28, 66, .35);
  display: flex; justify-content: center; padding: 48px 16px;
}
.lex {
  width: min(760px, 100%); background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  display: flex; flex-direction: column; overflow: hidden;
  animation: apparait .25s ease;
}
@keyframes apparait { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 24px 0;
}
h2 { font-size: 22px; font-weight: 700; color: var(--texte-plein); }
.fermer { border: none; background: none; color: var(--texte-plein); cursor: pointer; }
input {
  margin: 14px 24px; padding: 10px 14px; font-size: 15px; font-family: inherit;
  border: 1px solid var(--bordure); border-radius: 8px; background: var(--fond); color: var(--texte);
}
input:focus { outline: 2px solid var(--primaire); border-color: transparent; }
.liste { overscroll-behavior: contain; overflow-y: auto; padding: 0 24px 24px; display: flex; flex-direction: column; gap: 8px; }
.entree {
  background: var(--ligne-chapitre); border-radius: 4px; padding: 12px 16px;
  font-size: 14px; line-height: 1.55;
}
.entree:hover { background: var(--list-hover); }
.terme { font-weight: 700; color: var(--texte-plein); display: block; margin-bottom: 2px; }
.vide { font-size: 14px; color: var(--muted); padding: 12px 4px; }
.vide code { background: var(--ligne-chapitre); padding: 1px 6px; border-radius: 4px; }
.sr-only { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0,0,0,0); white-space: nowrap; border: 0; }
@media (max-width: 768px) {
  .voile-lex { padding: 12px 8px; }
  input { margin: 12px 16px; }
  .liste { padding: 0 16px 16px; }
}
</style>
