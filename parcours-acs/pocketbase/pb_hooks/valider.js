// Helpers de validation des progressions/attestations — module séparé, chargé par require()
// À L'INTÉRIEUR de chaque hook. C'est la seule factorisation possible sur ce runtime JSVM :
// un callback ne peut pas fermer sur une fonction déclarée au niveau supérieur du MÊME fichier
// (échec silencieux HTTP 400), mais require() évalué dans le callback fonctionne — c'est déjà
// ainsi que bareme.json est chargé. Corrige au passage la duplication signalée par SonarCloud
// (S4144) sans affaiblir la validation.

module.exports = {
  // Les champs "json" de PocketBase renvoient les octets bruts (UTF-8), pas un objet déjà parsé.
  // IMPORTANT : décoder avec toString() du runtime (helper PocketBase, UTF-8 correct).
  // String.fromCharCode/fromCodePoint octet par octet corrompt tout caractère non-ASCII
  // ("Férié" → "FÃ©riÃ©") — donc un nom accentué faussé dans l'attestation ET son hash.
  lireJson: (brut) => {
    if (brut == null) return null
    const texte = Array.isArray(brut) ? toString(brut) : String(brut)
    return texte ? JSON.parse(texte) : null
  },

  // Renvoie true si un score doit être (re)calculé ; lève si les données sont incohérentes.
  verifierCoherence: (donnees, moduleId, corrige) => {
    if (donnees.termine && corrige && !Array.isArray(donnees.reponses)) {
      throw new Error(`module "${moduleId}" marqué terminé sans réponses de quiz soumises`)
    }
    if (!Array.isArray(donnees.reponses)) return false
    if (!corrige) throw new Error(`module inconnu : ${moduleId}`)
    if (donnees.reponses.length !== corrige.length) {
      throw new Error(`nombre de réponses invalide pour ${moduleId} : attendu ${corrige.length}`)
    }
    return true
  },

  noter: (reponses, corrige) => {
    const bonnes = reponses.filter((r, i) => r === corrige[i]).length
    return Math.round((bonnes / corrige.length) * 100)
  },

  // Un module ne compte pour l'attestation que si le score vient du SERVEUR et atteint 75.
  estValide: (d) => !!d && d.termine && d.scoreSource === 'server' && (d.quizScore || 0) >= 75,
}
