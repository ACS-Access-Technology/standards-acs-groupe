<script setup>
import { ref, watch, onMounted } from 'vue'
import { marked } from 'marked'
import { X } from '../data/icones.js'

const props = defineProps({ doc: String })
const emit = defineEmits(['fermer'])

const html = ref('<p>Chargement…</p>')

async function charger() {
  try {
    const rep = await fetch(import.meta.env.BASE_URL + 'docs/' + props.doc)
    if (!rep.ok) throw new Error(rep.status)
    html.value = marked.parse(await rep.text())
  } catch {
    html.value = '<p>Document introuvable. Relance <code>npm run dev</code> (la copie des documents se fait au démarrage).</p>'
  }
}
onMounted(charger)
watch(() => props.doc, charger)
</script>

<template>
  <div class="voile-doc" @click.self="emit('fermer')">
    <article class="doc">
      <header>
        <code>{{ doc }}</code>
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>
      </header>
      <div class="contenu" v-html="html"></div>
    </article>
  </div>
</template>

<style scoped>
.voile-doc {
  position: fixed; inset: 0; z-index: 30;
  background: rgba(18, 28, 66, .35);
  display: flex; justify-content: center; padding: 48px 16px;
}
.doc {
  width: min(920px, 100%); background: var(--card); border-radius: 8px; box-shadow: var(--ring);
  display: flex; flex-direction: column; overflow: hidden;
  animation: apparait .25s ease;
}
@keyframes apparait { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: none; } }
header {
  display: flex; justify-content: space-between; align-items: center;
  padding: 14px 24px; border-bottom: 1px solid var(--bordure); flex-shrink: 0;
}
header code { font-size: 13px; color: var(--muted); background: var(--ligne-chapitre); padding: 2px 8px; border-radius: 4px; }
.fermer { border: none; background: none; color: var(--texte-plein); cursor: pointer; }
.contenu { padding: 28px 36px 48px; overflow-y: auto; font-size: 15px; line-height: 1.7; }

.contenu :deep(h1) { font-size: 24px; font-weight: 700; color: var(--texte-plein); margin: 8px 0 16px; }
.contenu :deep(h2) { font-size: 20px; font-weight: 700; color: var(--texte-plein); margin: 28px 0 10px; }
.contenu :deep(h3) { font-size: 16px; font-weight: 700; color: var(--texte-plein); margin: 20px 0 8px; }
.contenu :deep(p) { margin: 10px 0; }
.contenu :deep(ul), .contenu :deep(ol) { padding-left: 24px; margin: 10px 0; }
.contenu :deep(li) { margin: 5px 0; }
.contenu :deep(blockquote) {
  border-left: 3px solid var(--primaire); background: var(--list-hover);
  padding: 10px 16px; margin: 14px 0; border-radius: 0 4px 4px 0;
}
.contenu :deep(code) { background: var(--ligne-chapitre); padding: 1px 6px; border-radius: 4px; font-size: 13px; }
.contenu :deep(pre) { background: var(--ligne-chapitre); padding: 14px 16px; border-radius: 8px; overflow-x: auto; margin: 14px 0; }
.contenu :deep(pre code) { background: none; padding: 0; }
.contenu :deep(table) { border-collapse: collapse; width: 100%; margin: 14px 0; font-size: 14px; display: block; overflow-x: auto; }
.contenu :deep(th), .contenu :deep(td) { border: 1px solid var(--bordure); padding: 8px 12px; text-align: left; vertical-align: top; }
.contenu :deep(th) { background: var(--ligne-chapitre); font-weight: 700; color: var(--texte-plein); }
.contenu :deep(a) { color: var(--primaire); }
.contenu :deep(hr) { border: none; border-top: 1px solid var(--bordure); margin: 20px 0; }
@media (max-width: 768px) {
  .voile-doc { padding: 12px 8px; }
  .contenu { padding: 18px 16px 32px; font-size: 14px; }
}
</style>
