// Génère LEXIQUE.md (corpus) depuis src/data/lexique.js — source unique.
import { lexique } from '../src/data/lexique.js'
import { writeFileSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..', '..')
let md = `# Lexique — Standards ACS Groupe

> Définitions en une phrase, pensées pour un nouvel arrivant. Version interactive (recherche) dans l'application \`parcours-acs\`.
> **Fichier généré** depuis \`parcours-acs/src/data/lexique.js\` (\`npm run gen-lexique\`) — ne pas éditer à la main.

| Terme | Définition |
|---|---|
`
for (const { terme, def } of lexique) md += `| **${terme}** | ${def} |\n`
writeFileSync(join(racine, 'LEXIQUE.md'), md)
console.log(`LEXIQUE.md généré (${lexique.length} termes)`)
