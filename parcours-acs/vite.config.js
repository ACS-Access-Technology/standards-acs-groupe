import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// PWA : formation consultable hors-ligne (mobile inclus) — ROADMAP chantier 5, ADR-001 pour la synchro.
// Dépendance vite-plugin-pwa : MIT, équipe vite-pwa, standard de facto de l'écosystème Vite.
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: 'prompt', // l'utilisateur choisit quand recharger (le corpus = contenu versionné)
      includeAssets: ['pwa-192.png', 'pwa-512.png', 'logo-acs.png'],
      manifest: {
        name: 'Parcours développeur — Standards ACS Groupe',
        short_name: 'Parcours ACS',
        description: 'Le standard de développement ACS Groupe en parcours interactif',
        lang: 'fr',
        display: 'standalone',
        start_url: './',
        theme_color: '#1b2a9e',
        background_color: '#f7fafb',
        icons: [
          { src: 'pwa-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'pwa-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
        ],
      },
      workbox: {
        // Précache du shell + du corpus complet : tout le parcours fonctionne en avion
        globPatterns: ['**/*.{js,css,html,svg,png,webmanifest}', 'docs/*.md'],
        navigateFallback: 'index.html',
        runtimeCaching: [
          {
            // Police Inter (Google Fonts) — cache d'abord, réseau en secours
            urlPattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\/.*/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'polices',
              expiration: { maxEntries: 12, maxAgeSeconds: 60 * 60 * 24 * 365 },
            },
          },
        ],
      },
    }),
  ],
  base: './',
})
