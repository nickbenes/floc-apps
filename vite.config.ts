import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  // Vercel deploys serve this at the domain root ('/'). The pace-bene nginx review
  // host serves it at a subpath instead — set VITE_BASE=/floc-apps/ when building
  // for that target so assets, the manifest, and the service worker scope all
  // resolve correctly. See nginx/floc.conf in home-apps for the build command used.
  base: process.env.VITE_BASE || '/',
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'FLoC Apps',
        short_name: 'FLoC',
        description: 'Front Lines of Code — todos, food, and finance, owned entirely by you. No server, no account.',
        theme_color: '#0f172a',
        background_color: '#ffffff',
        display: 'standalone',
        icons: [
          { src: 'pwa-192x192.png', sizes: '192x192', type: 'image/png' },
          { src: 'pwa-512x512.png', sizes: '512x512', type: 'image/png' },
        ],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
})
