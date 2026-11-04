// What the paid landings (/growth, /systems) measure, on top of src/lib/tracking.js.
//
// The Pixel's consent follows the visitor's country here (region.js): in the
// EU/EEA, the UK and Switzerland nothing runs until they press Accept on the
// cookie banner; elsewhere it runs from the start unless they press Reject.
//
// Events, each at most once per page load: PageView and ViewContent on load,
// Scroll50 at half the page, FormStart when someone first clicks into the form,
// Contact on a WhatsApp link, Lead on a successful send. PageView, ViewContent,
// Lead and Contact are Meta's standard events (the campaign optimises for Lead);
// Scroll50 and FormStart are custom, the "C" in Meta Pixel Helper.

import { getAttribution, utmData } from './attribution.js'
import { metaAllowed, resolveRegion } from './region.js'
import { isTrackingEnabled, setConsentRule, track, trackOnce, trackPageView, watchConsent } from '../../lib/tracking.js'

let page = {}

/** One of this landing's once-per-page events, with its content name and variant. */
export const pageEvent = (name) => trackOnce(name, page)

/** The Pixel's Lead, under the id the CRM and the server's Lead also carry. */
export function trackLead(eventId) {
  track('Lead', { ...page, ...utmData(getAttribution()) }, { eventId })
}

/**
 * Load-time events. Sent once the visitor's country is known if the Pixel may
 * run, or the moment they accept; revoked if they later reject. `variant` is
 * the A/B version of the page, when it has one. Returns a cleanup.
 */
export function startPageTracking({ contentName, variant }) {
  setConsentRule(metaAllowed)
  getAttribution()
  page = { content_name: contentName, content_category: contentName, ...(variant ? { variant } : {}) }

  const onLoad = () => {
    if (!isTrackingEnabled()) return
    trackPageView()
    pageEvent('ViewContent')
  }
  onLoad()
  resolveRegion().then(onLoad)
  const stopConsent = watchConsent(onLoad)

  const onScroll = () => {
    const doc = document.documentElement
    if ((window.scrollY + window.innerHeight) / doc.scrollHeight >= 0.5) pageEvent('Scroll50')
  }
  window.addEventListener('scroll', onScroll, { passive: true })

  // Every WhatsApp link, wherever it sits, counts as Contact.
  const onClick = (event) => {
    if (event.target.closest?.('a[href^="https://wa.me/"]')) pageEvent('Contact')
  }
  document.addEventListener('click', onClick)

  return () => {
    stopConsent()
    window.removeEventListener('scroll', onScroll)
    document.removeEventListener('click', onClick)
  }
}
