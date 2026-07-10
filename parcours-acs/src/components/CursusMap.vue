<script setup>
import { ref } from 'vue'
import { modules as tousModules, liens } from '../data/modules.js'
import { icones, CheckCircle2 } from '../data/icones.js'

const props = defineProps({
  modules: Array,
  progression: Object,
  estDebloque: Function,
})
const emit = defineEmits(['ouvrir'])

function coord(id) {
  const m = tousModules.find(x => x.id === id)
  return { x: m.x, y: m.y }
}

function etat(m) {
  if (props.progression[m.id]?.termine) return 'termine'
  return props.estDebloque(m) ? 'debloque' : 'verrouille'
}

/* ---- Viewport : pan, zoom, recentrage animé (façon React Flow) ---- */
const carte = ref(null)
const k = ref(1)
const tx = ref(0)
const ty = ref(0)

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

let animId = null
function animateTo(k2, tx2, ty2, duree = 400) {
  if (animId) cancelAnimationFrame(animId)
  const k0 = k.value, x0 = tx.value, y0 = ty.value
  const t0 = performance.now()
  const ease = t => t < .5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2 // easeInOutCubic
  function pas(now) {
    const t = clamp((now - t0) / duree, 0, 1)
    const e = ease(t)
    k.value = k0 + (k2 - k0) * e
    tx.value = x0 + (tx2 - x0) * e
    ty.value = y0 + (ty2 - y0) * e
    if (t < 1) animId = requestAnimationFrame(pas)
    else animId = null
  }
  animId = requestAnimationFrame(pas)
}

/* Clic sur un nœud : zoom 1.5x + recentrage sur le nœud (décalé pour laisser la place au panneau) */
function clicNoeud(m) {
  const el = carte.value
  const W = el.clientWidth, H = el.clientHeight
  const xpx = (m.x / 100) * W, ypx = (m.y / 100) * H
  const largeurPanneau = W > 640 ? Math.min(480, W * .5) : 0
  const cibleX = (W - largeurPanneau) / 2
  const cibleY = H * 0.45
  const k2 = 1.5
  animateTo(k2, cibleX - k2 * xpx, cibleY - k2 * ypx)
  emit('ouvrir', m)
}

/* Pan : glisser le fond */
let drag = null
function surPointerDown(e) {
  if (e.target.closest('.noeud')) return
  drag = { x: e.clientX, y: e.clientY, tx: tx.value, ty: ty.value }
  carte.value.setPointerCapture(e.pointerId)
}
function surPointerMove(e) {
  if (!drag) return
  tx.value = drag.tx + (e.clientX - drag.x)
  ty.value = drag.ty + (e.clientY - drag.y)
}
function surPointerUp() { drag = null }

/* Zoom à la molette (et pincement trackpad → wheel+ctrl), centré sur le curseur */
function surWheel(e) {
  e.preventDefault()
  const rect = carte.value.getBoundingClientRect()
  const px = e.clientX - rect.left, py = e.clientY - rect.top
  const facteur = Math.exp(-e.deltaY * (e.ctrlKey ? 0.008 : 0.0015))
  const k2 = clamp(k.value * facteur, 0.5, 2.5)
  tx.value = px - (px - tx.value) * (k2 / k.value)
  ty.value = py - (py - ty.value) * (k2 / k.value)
  k.value = k2
}

function recentrer() { animateTo(1, 0, 0, 450) }

defineExpose({ recentrer })
</script>

<template>
  <div
    ref="carte" class="carte" :class="{ 'en-drag': !!drag }"
    :style="{
      backgroundSize: (65 * k) + 'px ' + (37.5 * k) + 'px',
      backgroundPosition: tx + 'px ' + ty + 'px',
    }"
    @pointerdown="surPointerDown" @pointermove="surPointerMove"
    @pointerup="surPointerUp" @pointercancel="surPointerUp"
    @wheel="surWheel"
  >
    <div class="monde" :style="{ transform: 'translate(' + tx + 'px,' + ty + 'px) scale(' + k + ')' }">
      <svg class="fils" viewBox="0 0 100 100" preserveAspectRatio="none">
        <line
          v-for="([de, vers], i) in liens" :key="i"
          :x1="coord(de).x" :y1="coord(de).y"
          :x2="coord(vers).x" :y2="coord(vers).y"
          :class="{ actif: progression[de]?.termine }"
        />
      </svg>

      <button
        v-for="m in modules" :key="m.id"
        class="noeud" :class="etat(m)"
        :style="{ left: m.x + '%', top: m.y + '%' }"
        @click="clicNoeud(m)"
      >
        <span class="pastille">
          <svg class="socle" width="40" height="27" viewBox="0 0 40 27" aria-hidden="true">
            <ellipse cx="20" cy="13.5" rx="15" ry="8.5" />
          </svg>
          <span class="icone">
            <CheckCircle2 v-if="progression[m.id]?.termine" :size="36" :stroke-width="2" color="var(--primaire)" />
            <component v-else :is="icones[m.icone]" :size="36" :stroke-width="1.8" :color="m.couleur" />
          </span>
        </span>
        <span class="libelle">{{ m.titre }}</span>
        <span class="etape">{{ m.etape }}</span>
      </button>
    </div>

    <button class="recentrer" title="Recentrer la vue" @click.stop="recentrer">⌖</button>
  </div>
</template>

<style scoped>
/* Grille isométrique : tuile 65 x 37.5, trait 1px — elle suit le pan et le zoom */
.carte {
  position: relative; flex: 1; min-height: 660px; overflow: hidden;
  background-color: var(--fond);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='65' height='37.5'%3E%3Cpath d='M0 18.75 L32.5 0 L65 18.75 L32.5 37.5 Z' fill='none' stroke='%23d5e3ec' stroke-width='1'/%3E%3C/svg%3E");
  cursor: grab; touch-action: none;
}
.carte.en-drag { cursor: grabbing; }
@media (prefers-color-scheme: dark) {
  .carte {
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='65' height='37.5'%3E%3Cpath d='M0 18.75 L32.5 0 L65 18.75 L32.5 37.5 Z' fill='none' stroke='%23262a55' stroke-width='1'/%3E%3C/svg%3E");
  }
}
.monde { position: absolute; inset: 0; transform-origin: 0 0; will-change: transform; }

.fils { position: absolute; inset: 0; width: 100%; height: 100%; overflow: visible; }
.fils line {
  stroke: var(--edge);
  stroke-width: 2px;
  stroke-dasharray: 5;
  vector-effect: non-scaling-stroke;
  animation: dashdraw .5s linear infinite;
}
.fils line.actif { stroke: var(--primaire); }
@keyframes dashdraw {
  from { stroke-dashoffset: 10; }
  to { stroke-dashoffset: 0; }
}

.noeud {
  position: absolute; transform: translate(-50%, -50%);
  display: flex; flex-direction: column; align-items: center;
  background: none; border: none; cursor: pointer; font-family: inherit;
}
.pastille { position: relative; width: 48px; height: 62px; }
.socle { position: absolute; bottom: 0; left: 50%; transform: translateX(-50%); overflow: visible; }
.socle ellipse { fill: var(--card); stroke: var(--edge); stroke-width: 7; }
.termine .socle ellipse { stroke: var(--primaire); }
.icone {
  position: absolute; left: 50%; bottom: 12px; transform: translateX(-50%);
  width: 48px; height: 48px; display: flex; align-items: center; justify-content: center;
  /* lift au survol : 0.3s, courbe standard Tailwind */
  transition: all .3s cubic-bezier(.4, 0, .2, 1);
}
.noeud:hover .icone { transform: translateX(-50%) translateY(-4px); }
.icone :deep(svg) { filter: drop-shadow(0 1px 1px rgba(18, 28, 66, .18)); }
.libelle { font-size: 16px; font-weight: 700; color: var(--texte-plein); margin-top: 6px; }
.etape { font-size: 12px; color: var(--muted); margin-top: 2px; }
.verrouille { opacity: .45; }
.verrouille .icone { filter: grayscale(1); opacity: .8; }

.recentrer {
  position: absolute; bottom: 16px; left: 16px; width: 36px; height: 36px;
  border: none; border-radius: 8px; background: var(--card); box-shadow: var(--ring);
  color: var(--muted); font-size: 20px; cursor: pointer;
}
.recentrer:hover { color: var(--texte); }
</style>
