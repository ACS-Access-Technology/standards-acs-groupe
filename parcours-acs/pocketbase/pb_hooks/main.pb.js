/// <reference path="../../pb_data/types.d.ts" />
//
// Validation serveur des quiz — le score envoyé par le client n'est JAMAIS pris pour argent
// comptant. Ce hook recalcule le score à partir des réponses brutes soumises et du barème
// (bareme.json, généré depuis src/data/quiz.js par `npm run gen-bareme` — jamais édité à la main).
// Contexte : l'attestation de parcours est contractuelle (preuve opposable en audit), donc un
// score déclaré côté navigateur et jamais revérifié ne vaut rien (Max, revue party mode).
//
// Contraintes constatées sur ce runtime JSVM (goja, pool de runtimes prewarmés) :
// - un callback de hook ne peut PAS fermer sur une variable/fonction déclarée au niveau
//   supérieur du fichier (échec silencieux, sans exception JS observable) — require(), le
//   barème et toute logique doivent être réévalués À L'INTÉRIEUR de chaque callback.
// - les champs "json" renvoient les octets bruts (tableau de codes), pas un objet déjà
//   parsé — il faut décoder puis JSON.parse à la main.

onRecordCreateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)
  const brut = e.record.get('donnees')
  const texte = brut == null ? '' : (Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut))
  const donnees = texte ? JSON.parse(texte) : null
  if (donnees && Array.isArray(donnees.reponses)) {
    const moduleId = e.record.get('module')
    const corrige = bareme[moduleId]
    if (!corrige) throw new Error(`module inconnu : ${moduleId}`)
    if (donnees.reponses.length !== corrige.length) throw new Error(`nombre de réponses invalide pour ${moduleId} : attendu ${corrige.length}`)
    const bonnes = donnees.reponses.filter((r, i) => r === corrige[i]).length
    donnees.quizScore = Math.round((bonnes / corrige.length) * 100) // le score déclaré par le client est ignoré, jamais fait confiance
    e.record.set('donnees', donnees)
  }
  e.next()
}, 'progressions')

onRecordUpdateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)
  const brut = e.record.get('donnees')
  const texte = brut == null ? '' : (Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut))
  const donnees = texte ? JSON.parse(texte) : null
  if (donnees && Array.isArray(donnees.reponses)) {
    const moduleId = e.record.get('module')
    const corrige = bareme[moduleId]
    if (!corrige) throw new Error(`module inconnu : ${moduleId}`)
    if (donnees.reponses.length !== corrige.length) throw new Error(`nombre de réponses invalide pour ${moduleId} : attendu ${corrige.length}`)
    const bonnes = donnees.reponses.filter((r, i) => r === corrige[i]).length
    donnees.quizScore = Math.round((bonnes / corrige.length) * 100)
    e.record.set('donnees', donnees)
  }
  e.next()
}, 'progressions')

// Une attestation ne peut être créée que si les 19 progressions du dev existent réellement,
// lui appartiennent, et ont chacune un score >= 75 tel que RECALCULÉ ci-dessus (donc pas un
// score que le dev aurait pu forger côté client). Append-only + create non vérifié = une preuve
// qui ne prouve rien (Max, revue party mode).
onRecordCreateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)
  const devId = e.record.get('dev')
  if (!devId || !e.auth || devId !== e.auth.id) {
    throw new Error("dev de l'attestation ne correspond pas au compte authentifié")
  }

  const progressions = $app.findRecordsByFilter('progressions', 'dev = {:dev}', '', 0, 0, { dev: devId })

  const parModule = {}
  for (const p of progressions) {
    const brut = p.get('donnees')
    const texte = brut == null ? '' : (Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut))
    parModule[p.get('module')] = texte ? JSON.parse(texte) : null
  }

  const manquants = []
  for (const m of Object.keys(bareme)) {
    const donnees = parModule[m]
    if (!donnees || !donnees.termine || (donnees.quizScore || 0) < 75) manquants.push(m)
  }
  if (manquants.length > 0) {
    throw new Error(`attestation refusée — modules non validés côté serveur : ${manquants.join(', ')}`)
  }
  e.next()
}, 'attestations')
