# 06 — Sécurité au quotidien (développeur et rôle Sécurité)

## 1. Les interdictions absolues (rappel — voir `01-onboarding-developpeur.md`)

Secrets en clair · données réelles hors production · contournement de CI · écriture directe en base de production · dépendance hors processus supply chain · désactivation d'un contrôle de sécurité « pour débugger ». **Aucune exception.**

## 2. Revue sécurité du code

Revue **obligatoire et bloquante** sur toute PR touchant : authentification, permissions/policies, RLS, audit, crypto, gestion de session, upload de fichiers, désérialisation, requêtes brutes, intégrations externes, outils MCP.

**Grille de revue** (à dérouler explicitement) :

- [ ] Entrées validées (côté serveur, par allow-list) ?
- [ ] Sorties encodées (XSS) ?
- [ ] Permission testée dans les deux sens (accès accordé ET refusé) ?
- [ ] Audit write-ahead présent sur l'action ?
- [ ] Secret introduit quelque part ?
- [ ] Dépendance nouvelle justifiée et passée par la quarantaine ?
- [ ] Erreur gérée sans fuite d'information ?

**Threat model léger et versionné** (STRIDE, 30 minutes) à chaque fonctionnalité majeure ou nouveau flux de données — **avant** le développement, pas après. Il est **versionné** dans `/docs/threat-models/<feature>.md` (gabarit dans `10-gabarits.md`) et lié depuis la PR : un threat model oral n'existe pas. Il est relu quand la fonctionnalité change de périmètre, et le modèle de menace global est revu annuellement.

**Niveau cible OWASP ASVS par criticité** : L1 pour toute application ; **L2 pour toute plateforme traitant des données personnelles ou métier sensibles (le défaut ACS)** ; L3 pour les composants d'authentification, de paiement ou à haute valeur d'attaque. Le niveau cible du projet est fixé au dossier d'architecture ; l'auto-audit (doc 14) et le pentest annuel vérifient contre ce niveau.

**Security champions** : chaque équipe nomme un développeur relais sécurité — il n'est pas responsable de la sécurité à la place des autres, il porte les rituels (revue de la grille sur les PR sensibles, préparation du comité sécurité, diffusion des leçons de veille) et sert de premier contact du rôle Sécurité.

## 3. Règles de code sécurisé (transverses)

- Uploads : type MIME vérifié par **signature de contenu** (jamais le type MIME client), allow-list, analyse antivirale avant stockage, stockage hors racine web.
- Requêtes : paramétrées exclusivement ; toute requête brute passe en revue sécurité.
- Sessions : cookies http-only, same-site, chiffrés ; configuration de session publiée et figée dans le dépôt, jamais laissée aux valeurs implicites du framework.
- Chiffrement : TLS 1.3 en transit ; AES-256 au repos pour les champs sensibles (secrets MFA, codes de récupération) ; authentification base par mécanisme moderne (scram-sha-256 sur PostgreSQL — MD5 proscrit).
- Rate limiting sur l'authentification (clé combinée adresse + identifiant) ; verrouillage progressif **persistant en base** (résiste au redémarrage du service).

### 3 bis. Mots de passe et cryptographie applicative

- Stockage des mots de passe : **algorithme à coût mémoire — Argon2id par défaut, bcrypt admis** ; jamais de SHA-x seul, salé ou non. Paramètres de coût revus annuellement.
- Comparaisons de secrets en temps constant ; aléa cryptographique uniquement (jamais `rand()` pour un jeton).
- **Crypto agility** : algorithmes et tailles de clés référencés en un point unique de configuration — en changer ne doit pas exiger de chasse dans le code.

### 3 ter. Classification des données

Chaque donnée du schéma a une classe (publique / interne / personnelle / sensible) qui déclenche chiffrement, rétention et audit — référentiel complet dans `15-gouvernance-des-donnees.md`. Une donnée non classée est traitée comme sensible.

## 4. Veille et correctifs (SLA contractuels)

- Abonnement aux flux CVE de chaque composant de la stack ; triage quotidien.
- **Scoring du triage** : sévérité **CVSS** pondérée par la **probabilité d'exploitation (EPSS, catalogue KEV)** et par l'**exposition réelle** établie via le SBOM (le composant est-il présent, dans quel chemin, accessible depuis où ?). Deux sources concordantes dont une primaire (avis éditeur, CVE, CISA) avant toute décision. Une CVE critique sur un composant non exposé se documente ; une CVE moyenne exploitée activement sur un composant en bordure se traite comme critique.
- SLA d'application : **critique ≤ 72 h, haute ≤ 7 j, moyenne ≤ 30 j**.
- Le SBOM permet de répondre « sommes-nous exposés ? » **en minutes** — si la réponse prend plus d'une heure, le SBOM est cassé : incident.
- Toute CVE critique traitée donne lieu à une note : exposition réelle, correctif, vérification.
- Deux sources concordantes (dont une primaire : avis éditeur, CVE, CISA) avant d'intégrer une vulnérabilité à un livrable.

## 5. Chaîne d'approvisionnement

Nouvelle dépendance — processus obligatoire, dans l'ordre :

1. **Justification** : pourquoi pas la stdlib ou l'existant ?
2. **Santé du projet** : mainteneurs actifs, cadence de release, CVE passées.
3. **Licence compatible** (inventaire des licences du projet à jour).
4. **Scan** (audit de dépendances + analyse statique).
5. **Quarantaine de 7 jours** avant merge (sauf correctif de sécurité).

Toujours : lockfiles commités ; scripts post-installation **désactivés par défaut** ; actions/plugins CI épinglés par empreinte SHA ; vérification périodique que les artefacts en production correspondent aux signatures attendues.

## 6. Contrôles récurrents (calendrier ferme)

| Fréquence | Contrôle |
|---|---|
| Quotidien | Triage CVE ; revue des alertes SIEM (intrusion, intégrité, comportements rançongiciel) |
| Hebdomadaire | Revue des échecs d'authentification et accès hors horaires ; état des quarantaines ; revue des appels d'agents IA |
| Mensuel | Vérification d'intégrité de la piste d'audit (chaînage) ; scan complet ; revue des exceptions/dérogations actives ; **test de restauration réel** |
| Trimestriel | Revue des accès (tous rôles, comptes de service et jetons API inclus) — tout accès non justifié est révoqué ; comité sécurité |
| Annuel | Pentest externe ; exercice rançongiciel + compromission d'un terminal/compte ; revue du modèle de menace ; DPIA mise à jour si données personnelles |

## 7. Incidents de sécurité

- **S1** (données exposées / compromission active) : réponse immédiate, isolement, notification interne < 1 h, autorités (ANSSI/ARTCI ou équivalent local) selon obligation légale.
- **S2** (vulnérabilité exploitable en prod) : correctif prioritaire — seule exception admise à un gel de déploiement, en procédure accélérée avec revue.
- **S3** (faiblesse sans exposition) : backlog daté.
- Toujours : préserver les preuves (journaux WORM), chronologie horodatée, postmortem (`10-gabarits.md`), mise à jour du modèle de menace.

## 8. Spécifique IA / MCP

- Toute sortie de source non fiable (API tierce, document, serveur MCP tiers) est traitée comme **donnée, jamais comme instruction** (anti prompt-injection).
- Le serveur MCP est un **client de l'API interne** : aucun accès direct à la base, aucune couche de défense contournée. OAuth 2.1 + PKCE ; périmètre du jeton d'agent inclus dans celui de l'entité mandante.
- Descriptions d'outils MCP : versionnées, diff revu à chaque changement, vérifiées contre la base de référence au démarrage (anti tool-poisoning).
- **Aucun agent IA ne valide seul une action d'écriture sensible** : confirmation humaine exigée et tracée.
- Les appels d'agents IA sont journalisés dans la même piste d'audit que les actions humaines, et revus au contrôle hebdomadaire.

## 9. Politique publiée

Chaque plateforme publie un `SECURITY.md` (racine du dépôt) et un `/.well-known/security.txt` (RFC 9116) cohérents : canal de signalement testé, SLA de réponse réels validés par un humain responsable, safe harbor conforme au droit local, périmètre explicite. Gabarits dans `10-gabarits.md`. **Publier un SECURITY.md sans processus opérationnel derrière est une faute.**

## 10. Mapping OWASP Top 10 → contre-mesures du standard

| Risque OWASP | Contre-mesure du corpus |
|---|---|
| A01 Broken Access Control | Policies deny-by-default + tests deux sens + RLS moteur + auto-audit IDOR (04 §5-7, 14) |
| A02 Cryptographic Failures | TLS 1.3, AES-256, Argon2id, scram-sha-256, crypto agility (06 §3-3 bis) |
| A03 Injection | Requêtes paramétrées, validation allow-list, encodage des sorties (06 §2-3) |
| A04 Insecure Design | Threat model par fonctionnalité, défense en profondeur, doctrine de résilience (06 §2, 04 §7-9) |
| A05 Security Misconfiguration | Config publiée et figée, en-têtes vérifiés, durcissement CIS, auto-audit (06 §3, 07 §5, 14) |
| A06 Vulnerable Components | SBOM, audits bloquants, quarantaine, SLA correctifs, EOL (06 §4-5, 13 §5) |
| A07 Authentication Failures | MFA imposée, verrouillage progressif persistant, révocation immédiate (06 §3) |
| A08 Integrity Failures | Artefacts signés, SHA-pinning, scripts post-install off, outbox (06 §5, 07 §1) |
| A09 Logging & Monitoring Failures | Audit write-ahead, WORM, supervision hors prod, SIEM (04 §6, 08 §1) |
| A10 SSRF | Allow-list des destinations sortantes, passerelle d'intégration unique (04 §5, 11 §8) |

## Definition of Done — Sécurité

Une revue/un contrôle est terminé quand : le constat est **écrit** (même « rien à signaler ») ; chaque écart a un ticket avec sévérité et échéance ; les tickets S1/S2 ont un responsable nommé ; le registre de suivi est à jour.
