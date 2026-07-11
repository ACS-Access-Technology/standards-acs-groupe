/// <reference path="../../pb_data/types.d.ts" />
//
// Validation serveur des quiz et de l'attestation — le score, le statut "terminé" et le
// contenu de l'attestation envoyés par le client ne sont JAMAIS pris pour argent comptant.
// Contexte : l'attestation est contractuelle (preuve opposable en audit), donc tout ce qui
// n'est pas recalculé ou reconstruit côté serveur est considéré non fiable (Max, revue party
// mode — 2 passes : la 1ère validait le score mais pas le contenu attesté ni l'obligation de
// répondre réellement au quiz).
//
// Contraintes constatées sur ce runtime JSVM (goja, pool de runtimes prewarmés) :
// - un callback de hook ne peut PAS fermer sur une variable OU FONCTION déclarée au niveau
//   supérieur du fichier (échec silencieux HTTP 400, sans exception JS observable dans les
//   logs) — toute la logique doit être réévaluée/réécrite À L'INTÉRIEUR de chaque callback,
//   require() compris. Piège vécu deux fois de suite en écrivant ce fichier — ne PAS
//   factoriser en fonctions top-level, même si ça duplique du code.
// - les champs "json" renvoient les octets bruts (tableau de codes), pas un objet déjà
//   parsé — il faut décoder puis JSON.parse à la main.
// - $security.sha256(texte) est disponible pour recalculer le hash côté serveur (vérifié :
//   même digest que hashlib.sha256 côté Python).
//
// Duplication volontaire : les deux hooks progressions (create/update ci-dessous) contiennent
// la même logique de validation copiée-collée, PAS factorisée en top-level — voir la contrainte
// de scoping ci-dessus. Si tu corriges un bug dans l'un, répercute-le dans l'autre à la main.
// Les helpers (lireJson / verifierCoherence / noter) sont déclarés À L'INTÉRIEUR de chaque
// callback : autorisé par le runtime, et ça garde chaque hook sous le seuil de complexité
// cognitive (SonarCloud S3776 — le hook create était à 16/15 avant ce découpage).

onRecordCreateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)

  // Helpers locaux au callback (le scoping top-level est interdit sur ce runtime, le local non).
  const lireJson = (brut) => {
    if (brut == null) return null
    const texte = Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut)
    return texte ? JSON.parse(texte) : null
  }
  const verifierCoherence = (donnees, moduleId, corrige) => {
    if (donnees.termine && corrige && !Array.isArray(donnees.reponses)) {
      throw new Error(`module "${moduleId}" marqué terminé sans réponses de quiz soumises`)
    }
    if (!Array.isArray(donnees.reponses)) return false
    if (!corrige) throw new Error(`module inconnu : ${moduleId}`)
    if (donnees.reponses.length !== corrige.length) {
      throw new Error(`nombre de réponses invalide pour ${moduleId} : attendu ${corrige.length}`)
    }
    return true
  }
  const noter = (reponses, corrige) => {
    const bonnes = reponses.filter((r, i) => r === corrige[i]).length
    return Math.round((bonnes / corrige.length) * 100)
  }

  const donnees = lireJson(e.record.get('donnees'))
  if (!donnees) return e.next()

  const moduleId = e.record.get('module')
  const corrige = bareme[moduleId]
  if (!verifierCoherence(donnees, moduleId, corrige)) return e.next()

  donnees.quizScore = noter(donnees.reponses, corrige)
  donnees.scoreSource = 'server'
  e.record.set('donnees', donnees)
  e.next()
}, 'progressions')

onRecordUpdateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)

  // Helpers locaux au callback (le scoping top-level est interdit sur ce runtime, le local non).
  const lireJson = (brut) => {
    if (brut == null) return null
    const texte = Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut)
    return texte ? JSON.parse(texte) : null
  }
  const verifierCoherence = (donnees, moduleId, corrige) => {
    if (donnees.termine && corrige && !Array.isArray(donnees.reponses)) {
      throw new Error(`module "${moduleId}" marqué terminé sans réponses de quiz soumises`)
    }
    if (!Array.isArray(donnees.reponses)) return false
    if (!corrige) throw new Error(`module inconnu : ${moduleId}`)
    if (donnees.reponses.length !== corrige.length) {
      throw new Error(`nombre de réponses invalide pour ${moduleId} : attendu ${corrige.length}`)
    }
    return true
  }
  const noter = (reponses, corrige) => {
    const bonnes = reponses.filter((r, i) => r === corrige[i]).length
    return Math.round((bonnes / corrige.length) * 100)
  }

  const donnees = lireJson(e.record.get('donnees'))
  if (!donnees) return e.next()

  const moduleId = e.record.get('module')
  const corrige = bareme[moduleId]
  if (!verifierCoherence(donnees, moduleId, corrige)) return e.next()

  donnees.quizScore = noter(donnees.reponses, corrige)
  donnees.scoreSource = 'server'
  e.record.set('donnees', donnees)
  e.next()
}, 'progressions')

// L'attestation ne peut être créée que si les 19 progressions du dev existent réellement,
// lui appartiennent, et ont chacune un score >= 75 tel que RECALCULÉ ci-dessus. Le `contenu`
// et le `hash` soumis par le client sont entièrement IGNORÉS et RECONSTRUITS ici : un contenu
// attesté qui ne serait jamais recorrélé aux progressions serveur, même avec un hash valide,
// ne prouve que l'intégrité d'un mensonge (Max, revue party mode, 2e passe).
onRecordCreateRequest((e) => {
  const bareme = require(`${__hooks}/bareme.json`)
  const devId = e.record.get('dev')
  if (!devId || !e.auth || devId !== e.auth.id) {
    throw new Error("dev de l'attestation ne correspond pas au compte authentifié")
  }

  // Limite explicite (> 19 modules possibles) — la sémantique de limite 0 de
  // $app.findRecordsByFilter n'est pas assez fiable pour un contrôle contractuel. Pas de tri
  // par date ("-updated" n'est pas un nom de champ de tri valide dans ce contexte — testé,
  // rejeté avec GoError) : on itère tout et on garde la première occurrence par module
  // (index unique (dev, module) du schéma = un seul enregistrement possible de toute façon).
  const progressions = $app.findRecordsByFilter('progressions', 'dev = {:dev}', '', 100, 0, { dev: devId })

  // L'index unique (dev, module) du schéma empêche déjà les doublons — on trie quand même
  // explicitement par mise à jour la plus récente et on ne garde que la première occurrence
  // par module, au cas où cette garantie schema venait à changer.
  const lireJson = (brut) => {
    if (brut == null) return null
    const texte = Array.isArray(brut) ? String.fromCharCode(...brut) : String(brut)
    return texte ? JSON.parse(texte) : null
  }

  const parModule = {}
  for (const p of progressions) {
    const moduleId = p.get('module')
    if (parModule[moduleId]) continue
    parModule[moduleId] = lireJson(p.get('donnees'))
  }

  const estValide = (d) => !!d && d.termine && d.scoreSource === 'server' && (d.quizScore || 0) >= 75

  const manquants = Object.keys(bareme).filter((m) => !estValide(parModule[m]))
  const modulesValides = Object.keys(bareme)
    .filter((m) => estValide(parModule[m]))
    .map((m) => ({
      id: m,
      termine: true,
      quizScore: parModule[m].quizScore,
      quizDate: parModule[m].quizDate || null,
      versionCorpusValidation: parModule[m].versionCorpus || null,
    }))
  if (manquants.length > 0) {
    throw new Error(`attestation refusée — modules non validés côté serveur : ${manquants.join(', ')}`)
  }

  // Reconstruction serveur du contenu attesté : le nom vient EXCLUSIVEMENT du compte
  // authentifié (jamais du client — un nom mensonger sur une vraie attestation reste un
  // mensonge sur l'identité, donc contractuel, pas cosmétique). Le profil déclaré vient du
  // client mais est restreint à un enum fermé (Max, revue party mode, 3e passe : un profil en
  // texte libre était injectable tel quel dans un document hashé — "Lead Architecte Certifié
  // Niveau 9" passait sans contrôle). Tout ce qui prouve la conformité (modules, scores) vient
  // exclusivement des progressions server-validated ci-dessus.
  const PROFILS_CONNUS = ['junior', 'intermediaire', 'senior']
  const contenuClient = lireJson(e.record.get('contenu')) || {}
  const profilDeclare = contenuClient.dev && contenuClient.dev.profil
  const profil = PROFILS_CONNUS.indexOf(profilDeclare) !== -1 ? profilDeclare : null

  const contenu = {
    dev: { nom: e.auth.get('nom') || e.auth.get('email'), profil },
    dateUTC: new Date().toISOString(),
    parcours: { total: Object.keys(bareme).length, completes: modulesValides.length },
    modules: modulesValides,
  }
  const hash = $security.sha256(JSON.stringify(contenu))

  e.record.set('contenu', contenu)
  e.record.set('hash', hash)
  e.next()
}, 'attestations')
