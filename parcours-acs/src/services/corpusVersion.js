// Version courante du corpus (lue depuis CHANGELOG.md, mise en cache pour la session).
let cache = null

export async function versionActuelle() {
  if (cache) return cache
  try {
    const rep = await fetch(import.meta.env.BASE_URL + 'docs/CHANGELOG.md')
    const texte = await rep.text()
    const m = texte.match(/^##\s*(v[\d.]+)/m)
    cache = m ? m[1] : 'inconnue'
  } catch {
    cache = 'inconnue'
  }
  return cache
}
