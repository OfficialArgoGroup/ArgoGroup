// Client entry for /systems and /systems/thank-you (systems.html). Hydrates
// the markup scripts/prerender.mjs wrote; `vite dev` serves an empty shell.

import './boot.js'
import './systems.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { startPageTracking } from '../shared/tracking.js'
import { LangContext, langFromPath } from '../shared/lang.js'
import { SystemsPage, SystemsThankYou } from './SystemsPage.jsx'

const isThankYou = window.location.pathname.replace(/\/+$/, '').endsWith('/thank-you')
// /systems/es: Spanish. The prerendered page already says so; `vite dev` serves the
// English shell, so set it here too.
const lang = langFromPath(window.location.pathname)
document.documentElement.lang = lang
const app = (
  <StrictMode>
    <LangContext.Provider value={lang}>
      {isThankYou ? <SystemsThankYou /> : <SystemsPage />}
    </LangContext.Provider>
  </StrictMode>
)

const container = document.getElementById('root')
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)

if (!isThankYou) startPageTracking({ contentName: 'systems', category: 'systems' })
