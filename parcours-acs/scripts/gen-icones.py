#!/usr/bin/env python3
# Génère les icônes PWA (192/512, + maskable) depuis le logo officiel public/logo-acs.png.
# Usage : python3 scripts/gen-icones.py   (depuis parcours-acs/)
from PIL import Image
import os, sys

SRC = 'public/logo-acs.png'
if not os.path.exists(SRC):
    sys.exit("❌ Dépose d'abord le logo dans parcours-acs/public/logo-acs.png")

logo = Image.open(SRC).convert('RGBA')

for taille in (192, 512):
    # Fond blanc (le logo est prévu pour fond clair), logo centré avec marge 12 %
    fond = Image.new('RGBA', (taille, taille), '#ffffff')
    zone = int(taille * 0.76)
    l = logo.copy()
    l.thumbnail((zone, zone), Image.LANCZOS)
    fond.paste(l, ((taille - l.width) // 2, (taille - l.height) // 2), l)
    fond.convert('RGB').save(f'public/pwa-{taille}.png')
    print(f'✅ public/pwa-{taille}.png (depuis le logo officiel)')

print('Puis : npx vite build --emptyOutDir=false')
