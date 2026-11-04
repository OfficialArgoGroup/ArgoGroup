// Cookie consent. The banner writes the visitor's choice here; the Meta Pixel
// (tracking.js) reads it here and does nothing until it says 'accepted'. For
// EU/EEA visitors that is a legal requirement, not a preference.

export const CONSENT_KEY = 'argo_cookie_consent'
const EVENT = 'argo:consent'

export function getConsent() {
  try {
    return localStorage.getItem(CONSENT_KEY)
  } catch {
    // Storage blocked: treat as "not asked", which means no tracking.
    return null
  }
}

export const hasConsent = () => getConsent() === 'accepted'

export function setConsent(choice) {
  try {
    localStorage.setItem(CONSENT_KEY, choice)
  } catch {
    // Private mode or blocked storage: the choice still applies to this visit
    // through the event below, it just will not be remembered.
  }
  window.dispatchEvent(new CustomEvent(EVENT, { detail: choice }))
}

/** Calls `callback(choice)` whenever the visitor changes their mind. */
export function onConsentChange(callback) {
  const handler = (event) => callback(event.detail)
  window.addEventListener(EVENT, handler)
  return () => window.removeEventListener(EVENT, handler)
}
