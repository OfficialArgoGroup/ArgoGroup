// Where the visitor came from, for the forms' hidden data and for Meta.
//
// First touch of the session: the first link that carried campaign details wins,
// so a later link in the same tab, a reload or a move to another page changes
// nothing. One key for the whole site, so it survives a move between pages. The
// last ad click is kept apart, because Meta's fbc wants the latest one.
//
// Where it is kept follows the visitor's country (region.js). In the EU/EEA, the
// UK and Switzerland, and whenever the country is unknown, it reaches browser
// storage only after Accept, and leaves it again on Reject. Until then it lives
// in the open page's memory, which is enough for the form to carry it: the URL
// still has it after a reload. Elsewhere it goes to storage once the country is
// known.

import { getConsent, onConsentChange } from '../../lib/consent.js'
import { getRegion, onRegionChange, resolveRegion } from './region.js'

const KEY = 'argo_attribution'
const PARAMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term', 'fbclid', 'gclid']
const UTM = PARAMS.filter((name) => name.startsWith('utm_'))

// One entry per page load: gone when the visitor leaves the page.
const memory = new WeakMap()

const cookie = (name) => {
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`))
  return match ? decodeURIComponent(match[1]) : ''
}

const mayStore = () => getConsent() === 'accepted' || getRegion() === 'opt-out'

function readStored() {
  try {
    return JSON.parse(window.sessionStorage.getItem(KEY) || 'null')
  } catch {
    return null
  }
}

/** Puts browser storage in line with what the visitor's country and choice allow. */
function syncStorage() {
  try {
    if (mayStore()) window.sessionStorage.setItem(KEY, JSON.stringify(memory.get(window)))
    else window.sessionStorage.removeItem(KEY)
  } catch {
    // Storage blocked: the page's memory still has it.
  }
}

export function getAttribution() {
  const params = new URLSearchParams(window.location.search)
  const fromUrl = Object.fromEntries(PARAMS.map((name) => [name, params.get(name) || '']))
  const urlHasAny = PARAMS.some((name) => fromUrl[name])
  const firstCall = !memory.has(window)
  const saved = firstCall ? readStored() : memory.get(window)
  const savedHasAny = Boolean(saved) && PARAMS.some((name) => saved[name])
  const now = Date.now()

  const attribution = saved && (savedHasAny || !urlHasAny)
    ? { ...saved }
    : { ...fromUrl, landed_at: now, referrer: document.referrer || '' }

  if (fromUrl.fbclid && attribution.click_id !== fromUrl.fbclid) {
    attribution.click_id = fromUrl.fbclid
    attribution.click_at = now
  }
  memory.set(window, attribution)

  if (firstCall) {
    onConsentChange(syncStorage)
    onRegionChange(syncStorage)
    // The landings always ask; the main site only needs the country when there
    // is something to keep and no Accept yet to keep it under.
    if (urlHasAny && !mayStore()) resolveRegion()
  }
  syncStorage()
  return attribution
}

/** The UTMs that have a value, for the custom data of a Lead. */
export function utmData(attribution) {
  return Object.fromEntries(UTM.filter((name) => attribution[name]).map((name) => [name, attribution[name]]))
}

/**
 * Meta's identifiers as they stand right now: call it per event, because the
 * cookies can appear at any moment after load. `fbc` is built from the last
 * fbclid in Meta's documented format when the Pixel has not set the cookie;
 * `fbp` only exists once the Pixel has run, which requires consent.
 */
export function metaIds() {
  const { click_id: clickId, click_at: clickAt } = getAttribution()
  return {
    fbc: cookie('_fbc') || (clickId ? `fb.1.${clickAt}.${clickId}` : ''),
    fbp: cookie('_fbp'),
  }
}

export function newEventId() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') return crypto.randomUUID()
  // RFC 4122 v4 from getRandomValues, for older browsers and non-secure origins.
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  const hex = [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`
}
