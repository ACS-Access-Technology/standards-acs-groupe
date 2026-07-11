<script setup>
import { ref } from 'vue'
import { connecter, erreur } from '../services/synchro.js'
import { X } from '../data/icones.js'

const emit = defineEmits(['fermer', 'fusion'])
const email = ref('')
const motDePasse = ref('')
const enCours = ref(false)
const echec = ref('')

async function valider() {
  echec.value = ''
  enCours.value = true
  try {
    const distante = await connecter(email.value, motDePasse.value)
    emit('fusion', distante)
    emit('fermer')
  } catch {
    echec.value = 'Identifiants refusés — vérifie ton email et ton mot de passe.'
  } finally {
    enCours.value = false
  }
}
</script>

<template>
  <div class="voile-cx" @click.self="emit('fermer')">
    <form class="cx" @submit.prevent="valider">
      <button type="button" class="fermer" @click="emit('fermer')"><X :size="16" /></button>
      <h2>Connexion</h2>
      <p>Connecte-toi pour retrouver ta progression sur toutes tes machines. Hors connexion, tout continue de fonctionner en local.</p>
      <label>Email <input v-model="email" type="email" required autocomplete="username" /></label>
      <label>Mot de passe <input v-model="motDePasse" type="password" required autocomplete="current-password" /></label>
      <p v-if="echec" class="echec">{{ echec }}</p>
      <p v-else-if="erreur" class="echec">{{ erreur }}</p>
      <button type="submit" class="valider" :disabled="enCours">
        {{ enCours ? 'Connexion…' : 'Se connecter' }}
      </button>
    </form>
  </div>
</template>

<style scoped>
.voile-cx {
  overscroll-behavior: contain; position: fixed; inset: 0; z-index: 45; background: rgba(18, 28, 66, .45); display: flex; align-items: center; justify-content: center; padding: 16px; }
.cx {
  width: min(400px, 100%); background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  padding: 28px; display: flex; flex-direction: column; gap: 14px; position: relative;
}
.fermer { position: absolute; top: 12px; right: 12px; border: none; background: none; color: var(--muted); cursor: pointer; }
h2 { font-size: 20px; font-weight: 700; color: var(--texte-plein); }
p { font-size: 14px; line-height: 1.5; }
label { display: flex; flex-direction: column; gap: 6px; font-size: 13px; font-weight: 500; color: var(--texte-plein); }
input {
  padding: 10px 12px; font-size: 15px; font-family: inherit;
  border: 1px solid var(--bordure); border-radius: 8px; background: var(--fond); color: var(--texte);
}
input:focus { outline: 2px solid var(--primaire); border-color: transparent; }
.echec { color: var(--accent-rouge); font-size: 13px; }
.valider {
  padding: 10px 16px; border: none; border-radius: 8px; cursor: pointer;
  background: var(--primaire); color: var(--sur-primaire); font-size: 15px; font-weight: 500; font-family: inherit;
}
.valider:disabled { opacity: .6; cursor: wait; }
</style>
