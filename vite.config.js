import { resolve } from 'node:path'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// `vite dev` only: /growth, /systems, their Spanish /es and their /thank-you
// pages are served by their own landing shell, as the prerendered dist/ does.
// Without this, dev falls back to index.html (the main site), which has no
// route for them.
const landingsInDev = () => ({
  name: 'argo-landings-in-dev',
  configureServer(server) {
    server.middlewares.use((req, _res, next) => {
      const [path, query] = req.url.split('?')
      const landing = /^\/(growth|systems)(?:\/es)?(?:\/thank-you)?\/?$/.exec(path)?.[1]
      if (landing) req.url = `/${landing}.html${query ? `?${query}` : ''}`
      next()
    })
  },
})

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), landingsInDev()],
  // Only VITE_* reaches the browser. The landings' CRM settings live in the
  // server function (server/lead.js), never in the bundle.
  envPrefix: ['VITE_'],
  build: {
    rollupOptions: {
      input: {
        // Keyed 'index' so the main site's bundles keep their index-* names.
        index: resolve(import.meta.dirname, 'index.html'),
        // The Meta Ads landings: own shell each, no Google Fonts, no router.
        growth: resolve(import.meta.dirname, 'growth.html'),
        systems: resolve(import.meta.dirname, 'systems.html'),
      },
    },
  },
})
