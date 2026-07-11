// Génère le barème serveur (pocketbase/pb_hooks/bareme.json) à partir de src/data/quiz.js —
// seule source de vérité des bonnes réponses. Le hook PocketBase recalcule le score à partir
// de ce fichier ; il ne fait jamais confiance au score envoyé par le client (Max, revue party mode).
import { writeFileSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { quiz } from '../src/data/quiz.js'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const cible = join(racine, 'pocketbase', 'pb_hooks', 'bareme.json')

const bareme = {}
for (const [moduleId, questions] of Object.entries(quiz)) {
  bareme[moduleId] = questions.map(q => q.correct)
}

mkdirSync(dirname(cible), { recursive: true })
writeFileSync(cible, JSON.stringify(bareme, null, 2) + '\n')
console.log(`gen-bareme : barème de ${Object.keys(bareme).length} modules écrit dans pocketbase/pb_hooks/bareme.json`)
