<script setup>
import { computed } from 'vue'
import { icones, CheckCircle2, Lock, ChevronRight } from '../data/icones.js'

const props = defineProps({
  modules: Array,
  progression: Object,
  estDebloque: Function,
})
const emit = defineEmits(['ouvrir'])

const suivantId = computed(() => {
  const m = props.modules.find(x => !props.progression[x.id]?.termine && props.estDebloque(x))
  return m ? m.id : null
})

// Groupe par phase, dans l'ordre du parcours
const groupes = computed(() => {
  const res = []
  for (const m of props.modules) {
    let g = res.find(x => x.phase === m.etape)
    if (!g) { g = { phase: m.etape, items: [] }; res.push(g) }
    g.items.push(m)
  }
  return res
})

function etat(m) {
  if (props.progression[m.id]?.termine) return 'termine'
  return props.estDebloque(m) ? 'debloque' : 'verrouille'
}
</script>

<template>
  <div class="liste-parcours">
    <section v-for="g in groupes" :key="g.phase">
      <p class="phase">{{ g.phase }}</p>
      <button
        v-for="m in g.items" :key="m.id"
        class="module" :class="etat(m)"
        @click="emit('ouvrir', m)"
      >
        <span class="rond" :style="{ background: m.couleur + '18' }">
          <CheckCircle2 v-if="progression[m.id]?.termine" :size="22" color="var(--primaire)" />
          <Lock v-else-if="etat(m) === 'verrouille'" :size="18" color="var(--muted)" />
          <component v-else :is="icones[m.icone]" :size="22" :stroke-width="1.8" :color="m.couleur" />
        </span>
        <span class="infos">
          <span class="titre">{{ m.titre }}</span>
          <span v-if="m.essentiel" class="chip chip-essentiel">Essentiel</span>
          <span v-if="m.id === suivantId" class="chip">À faire maintenant</span>
        </span>
        <ChevronRight class="chevron" :size="18" />
      </button>
    </section>
  </div>
</template>

<style scoped>
.liste-parcours { flex: 1; overflow-y: auto; padding: 16px 16px 32px; display: flex; flex-direction: column; gap: 18px; }
.phase { font-size: 13px; font-weight: 700; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; margin: 6px 4px; }
.module {
  width: 100%; display: flex; align-items: center; gap: 14px; text-align: left;
  background: var(--card); border: none; border-radius: 8px; box-shadow: var(--ring);
  padding: 14px 16px; margin-bottom: 8px; cursor: pointer; font-family: inherit;
}
.module:active { background: var(--list-hover); }
.rond {
  width: 44px; height: 44px; border-radius: 8px; flex-shrink: 0;
  display: flex; align-items: center; justify-content: center;
}
.infos { display: flex; flex-direction: column; gap: 4px; min-width: 0; }
.titre { font-size: 15px; font-weight: 700; color: var(--texte-plein); }
.chip {
  align-self: flex-start; font-size: 11px; font-weight: 700;
  background: var(--primaire); color: var(--sur-primaire);
  padding: 2px 8px; border-radius: 8px;
}
.chip-essentiel { background: var(--accent-rouge); color: #fff; }
.chevron { margin-left: auto; color: var(--muted); flex-shrink: 0; }
.verrouille { opacity: .5; }
.termine .titre { color: var(--muted); }
</style>
