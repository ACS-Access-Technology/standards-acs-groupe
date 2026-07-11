// Vérifie les liens Markdown internes du corpus (root + acs-dev-guard/references).
// Usage : node scripts/check-liens.mjs
import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { join, dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const dossiers = [racine, join(racine, 'acs-dev-guard', 'references')]

const LIEN = /\[[^\]]*\]\(([^)]+)\)/g

let fichiers = []
for (const d of dossiers) {
  if (!existsSync(d)) continue
  fichiers.push(...readdirSync(d).filter(f => f.endsWith('.md')).map(f => join(d, f)))
}

let morts = 0
for (const chemin of fichiers) {
  const texte = readFileSync(chemin, 'utf8')
  for (const m of texte.matchAll(LIEN)) {
    let cible = m[1].trim()
    if (/^(https?:|mailto:|#)/.test(cible)) continue // externe ou ancre pure — hors périmètre
    if (/^<.*>$/.test(cible)) continue // placeholder de gabarit (ex: <link>), pas un vrai chemin
    cible = cible.split('#')[0]
    if (!cible) continue
    const chemInAbsolu = resolve(dirname(chemin), cible)
    if (!existsSync(chemInAbsolu)) {
      console.error(`❌ lien mort : ${chemin} → ${m[1]}`)
      morts++
    }
  }
}

if (morts > 0) {
  console.error(`\n${morts} lien(s) mort(s) trouvé(s).`)
  process.exit(1)
}
console.log(`✅ Aucun lien interne mort (${fichiers.length} fichiers vérifiés).`)
