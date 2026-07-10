# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Not app code. Documentary corpus: **ACS Groupe internal development standard** (v1.2, French). 19 numbered markdown docs (`01-…` to `19-…`) at repo root, contractual not indicative — "un travail qui ne satisfait pas les Definition of Done n'est pas terminé". Plus one Vue app (`parcours-acs/`) that renders the corpus as an interactive onboarding path, and a Claude Code skill (`acs-dev-guard/`) that enforces the standard against other repos' diffs.

Rule levels used throughout: **[MUST]** (default, mandatory), **[SHOULD]** (deviation needs one-line justification in review), **[MAY]** (optional). A [MUST] deviation requires an approved ADR.

## Repo structure

- `01-…19-….md` — the standard itself, root level, read in numbered order (see reading path in `README.md`).
- `MATRICE-ADOPTION.md` — per-project audit tool (controls/status/evidence/owner), copied into consuming projects and revalidated at each project gate.
- `16-cartographie-controles-internationaux.md` — maps corpus controls to NIST SSDF, OWASP SAMM/ASVS, SLSA, CIS, ISO 27001, SOC 2, NIST CSF, WCAG 2.2 AA, DORA.
- `17-registre-risques-derogations.md` — risk/deviation register.
- `acs-dev-guard/` — a Claude Code **skill** (`SKILL.md` + `references/*.md`, a synced copy of the root docs + `evals/evals.json`). This is what actually gets loaded into another project's `.claude/skills/` to enforce the standard live during commits/PRs/reviews.
- `parcours-acs/` — Vue 3 + Vite SPA presenting the corpus as a browsable/interactive course (`src/App.vue`, `src/components/`, `src/data/`).
- `CHANGELOG.md` — versioned history of corpus changes (required for any edit to the standard).

## Working on the corpus (docs 01–19, MATRICE, registers)

- Any edit to a numbered doc **must** be mirrored into `acs-dev-guard/references/<same-filename>.md` — the skill reads from its own `references/` copy, not the root files. Check both when changing a rule.
- Corpus changes go through PR review and get an entry in `CHANGELOG.md` (motive, impact, effective date, expected evidence) — this is a review of the standard's history, not incidental docs.
- Don't invent or soften rules; a [MUST] downgrade or new exception requires the ADR/register mechanism described in `17-registre-risques-derogations.md`, not a silent edit.
- Keep the routing table in `acs-dev-guard/SKILL.md` ("Table de routage") in sync if you add/rename/remove a doc — it's how the skill decides which reference to read for a given diff.

## `parcours-acs/` (Vue app)

```bash
cd parcours-acs
npm install
npm run dev       # Vite dev server
npm run build      # production build → dist/
npm run preview    # preview the build
```

No test suite or linter configured in this subproject. Content displayed by the app lives in `src/data/`; keep it consistent with the root corpus docs it summarizes rather than a fork of the rules.

## `acs-dev-guard/` (the enforcement skill)

Read `acs-dev-guard/SKILL.md` before touching it — it defines the skill's routing table (which diff pattern triggers which reference doc), the "always active" absolute checks (no secrets, no prod data in fixtures, no CI bypass, no disabled security control, Conventional Commits, no unjustified new dependency), and the profile-based pedagogy adaptation (`.acs-profil`: junior/intermediaire/senior — adapts explanation depth only, never the verdict). `evals/evals.json` holds the skill's eval cases; update it when routing or blocking logic changes.
