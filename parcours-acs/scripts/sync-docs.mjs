// Copie le corpus (../*.md) dans public/docs/ pour que l'app serve les documents elle-même.
import { copyFileSync, mkdirSync, readdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
const cible = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'docs')
mkdirSync(cible, { recursive: true })
let n = 0
for (const f of readdirSync(racine)) {
  if (f.endsWith('.md')) { copyFileSync(join(racine, f), join(cible, f)); n++ }
}
console.log(`sync-docs : ${n} documents copiés dans public/docs/`)
