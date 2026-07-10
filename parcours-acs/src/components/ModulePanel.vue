<script setup>
import { computed } from 'vue'
import { modules } from '../data/modules.js'
import { lectures } from '../data/lectures.js'
import { icones, X, Lock, BookOpen, CheckCircle2 } from '../data/icones.js'

const props = defineProps({
  module: Object,
  progression: Object,
  debloque: Boolean,
  profil: { type: String, default: 'junior' },
})

const lecture = computed(() => lectures[props.module.id]?.[props.profil] || null)
const emit = defineEmits(['fermer', 'objectif', 'termine'])

const DOCS_URL = 'https://github.com/acs-groupe/standards-acs-groupe/blob/main/'

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
</script>

<template>
  <div class="voile" @click.self="emit('fermer')">
    <div class="fiche">

      <!-- Colonne principale -->
      <div class="principale">
        <button class="fermer" @click="emit('fermer')"><X :size="18" /></button>

        <div class="identite">
          <span class="logo" :style="{ background: module.couleur }">
            <component :is="icones[module.icone]" :size="34" :stroke-width="1.8" color="#fff" />
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
            <p class="analogie">💡 <em>{{ lecture.analogie }}</em></p>
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
              <li><a :href="DOCS_URL + module.doc" target="_blank" rel="noopener">Le document complet</a></li>
              <li><a :href="DOCS_URL + 'README.md'" target="_blank" rel="noopener">Le README du corpus</a></li>
              <li><a :href="DOCS_URL + '10-gabarits.md'" target="_blank" rel="noopener">Les gabarits</a></li>
            </ul>
          </div>
        </div>

        <button class="valider" :class="{ fait: progression?.termine }" @click="emit('termine')">
          <CheckCircle2 :size="18" />
          {{ progression?.termine ? 'Terminé — cliquer pour rouvrir' : 'Commencer ce module' }}
        </button>
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
          <a class="ligne lien" :href="DOCS_URL + module.doc" target="_blank" rel="noopener">
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
  background: color-mix(in srgb, var(--fond) 60%, transparent);
  overflow-y: auto;
}
.fiche {
  max-width: 1350px; margin: 0 auto; padding: 120px 32px 80px;
  display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 48px;
  transition: all .6s ease;
  animation: apparait .3s ease;
}
@keyframes apparait { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: none; } }
@media (max-width: 980px) { .fiche { grid-template-columns: 1fr; gap: 28px; } }

/* --- Colonne principale --- */
.principale { display: flex; flex-direction: column; gap: 16px; position: relative; }
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

.verrou { background: #fbeeb1; color: #121c42; padding: 12px 16px; font-size: 14px; border-radius: 8px; }

.carte-bloc { background: var(--card); border-radius: 8px; padding: 16px; box-shadow: var(--ring); }
.description p { font-size: 16px; line-height: 1.75; }
.description p + p { margin-top: 14px; }
.analogie { background: var(--list-hover); border-radius: 4px; padding: 12px 16px; font-size: 15px; }
.exemple { font-size: 15px; }
.piege { background: #fbeeb1; color: #121c42; border-radius: 4px; padding: 12px 16px; font-size: 15px; }
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
