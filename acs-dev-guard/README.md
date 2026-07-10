# ACS Dev Guard

Skill Claude Code : **police et coach des standards de développement ACS Groupe**. Vérifie chaque commit/PR contre le standard (architecture, sécurité, tests, supply chain) et produit un rapport de conformité avec bloquants et recommandations.

## Installation (chaque développeur)

```bash
# Dans le dépôt du projet (skill partagé par l'équipe) :
mkdir -p .claude/skills
git clone https://github.com/ACS-Access-Technology/acs-dev-guard .claude/skills/acs-dev-guard

# Ou en skill personnel (tous vos projets) :
git clone https://github.com/ACS-Access-Technology/acs-dev-guard ~/.claude/skills/acs-dev-guard
```

Vérifiez avec `claude` puis `/skills` : `acs-dev-guard` doit apparaître.

## Usage

Le skill se déclenche automatiquement quand vous demandez à Claude Code de committer, ouvrir une PR ou revoir du code. Vous pouvez aussi l'invoquer explicitement :

```
> vérifie mon diff avant commit
> est-ce que cette migration est conforme au standard ?
> comment on pagine une nouvelle route API ici ?
```

## Contenu

- `SKILL.md` — le comportement du gardien (routage, contrôles, format de rapport)
- `references/` — le corpus complet des standards ACS Groupe v1.1 (16 documents)

## Gouvernance

Le corpus source vit dans `standards-acs-groupe/` ; toute évolution passe par PR + validation du responsable technique, puis est répercutée ici. Version du corpus embarqué : **v1.2 (juillet 2026)** — 20 documents dont le registre des contrôles ACS-*.
