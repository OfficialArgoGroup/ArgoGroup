// Client entry for /growth and /growth/thank-you (growth.html). Hydrates the
// markup scripts/prerender.mjs wrote; `vite dev` serves an empty shell instead.

import './boot.js'
import './growth.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { GrowthPage, GrowthThankYou } from './GrowthPage.jsx'
import { startPageTracking } from '../shared/tracking.js'
import { LangContext, langFromPath } from '../shared/lang.js'

const isThankYou = window.location.pathname.replace(/\/+$/, '').endsWith('/thank-you')
// /growth/es: Spanish. The prerendered page already says so; `vite dev` serves the
// English shell, so set it here too.
const lang = langFromPath(window.location.pathname)
document.documentElement.lang = lang
const app = (
  <StrictMode>
    <LangContext.Provider value={lang}>
      {isThankYou ? <GrowthThankYou /> : <GrowthPage />}
    </LangContext.Provider>
  </StrictMode>
)

const container = document.getElementById('root')
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)

if (!isThankYou) {
  const variantKey = document.documentElement.getAttribute('data-variant') || '1b'
  startPageTracking({ contentName: `v${variantKey}`, category: 'growth' })
}
