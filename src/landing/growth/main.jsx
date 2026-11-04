// Client entry for /growth and /growth/thank-you (growth.html). Hydrates the
// markup scripts/prerender.mjs wrote; `vite dev` serves an empty shell instead.

import './boot.js'
import './growth.css'
import { StrictMode } from 'react'
import { createRoot, hydrateRoot } from 'react-dom/client'
import { GrowthPage, GrowthThankYou } from './GrowthPage.jsx'
import { startPageTracking } from '../shared/tracking.js'

const isThankYou = window.location.pathname.replace(/\/+$/, '').endsWith('/thank-you')
const app = (
  <StrictMode>
    {isThankYou ? <GrowthThankYou /> : <GrowthPage />}
  </StrictMode>
)

const container = document.getElementById('root')
if (container.firstElementChild) hydrateRoot(container, app)
else createRoot(container).render(app)

if (!isThankYou) {
  const variantKey = document.documentElement.getAttribute('data-variant') || '1b'
  startPageTracking({ contentName: 'growth', variant: variantKey })
}
