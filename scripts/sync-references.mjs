// Source unique du corpus : les 19 documents + MATRICE-ADOPTION.md à la racine
// sont recopiés vers acs-dev-guard/references/ — jamais édités à la main aux deux endroits.
// Usage : node scripts/sync-references.mjs        (recopie)
//         node scripts/sync-references.mjs --check (échoue si la copie diverge — pour la CI)
import { copyFileSync, mkdirSync, readFileSync, existsSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const racine = join(dirname(fileURLToPath(import.meta.url)), '..')
const cible = join(racine, 'acs-dev-guard', 'references')
const verifier = process.argv.includes('--check')

const FICHIERS = [
  ...Array.from({ length: 19 }, (_, i) => i + 1)
    .map(n => String(n).padStart(2, '0'))
    .map(n => `${n}-${{
      '01': 'onboarding-developpeur', '02': 'standards-de-code', '03': 'workflow-git-revues',
      '04': 'regles-architecture', '05': 'strategie-tests', '06': 'securite-developpeur',
      '07': 'cicd-supply-chain', '08': 'exploitation-observabilite', '09': 'toolchain',
      '10': 'gabarits', '11': 'conception-api', '12': 'cycle-de-vie-projet',
      '13': 'vie-du-produit-mco', '14': 'auto-audit', '15': 'gouvernance-des-donnees',
      '16': 'cartographie-controles-internationaux', '17': 'registre-risques-derogations',
      '18': 'platform-engineering', '19': 'gouvernance-ia-et-agents',
    }[n]}.md`),
  'MATRICE-ADOPTION.md',
]

mkdirSync(cible, { recursive: true })
let divergences = 0
let copies = 0

for (const f of FICHIERS) {
  const source = join(racine, f)
  const destination = join(cible, f)
  if (!existsSync(source)) {
    console.error(`❌ source manquante : ${f}`)
    divergences++
    continue
  }
  if (verifier) {
    const contenuSource = readFileSync(source, 'utf8')
    const contenuCible = existsSync(destination) ? readFileSync(destination, 'utf8') : null
    if (contenuCible !== contenuSource) {
      console.error(`❌ divergent : acs-dev-guard/references/${f} ≠ ${f}`)
      divergences++
    }
  } else {
    copyFileSync(source, destination)
    copies++
  }
}

if (verifier) {
  if (divergences > 0) {
    console.error(`\n${divergences} fichier(s) divergent(s). Lance : node scripts/sync-references.mjs`)
    process.exit(1)
  }
  console.log(`✅ acs-dev-guard/references/ synchronisé avec la racine (${FICHIERS.length} fichiers).`)
} else {
  console.log(`sync-references : ${copies} document(s) recopiés dans acs-dev-guard/references/`)
}
