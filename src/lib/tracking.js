// Meta Pixel + Conversions API: the only place the site talks to Meta from the
// browser, for the main site and the landings alike.
//
// An event leaves the page only when isTrackingEnabled() says so, which takes
// all three of:
//   1. a production address (never a preview, workers.dev or localhost);
//   2. not a browser marked as internal: ?argo_internal=1 on any URL marks it
//      and ?argo_internal=0 clears it;
//   3. the visitor's consent, by the rule of the page: Accept everywhere on the
//      main site, the country rule on the landings (setConsentRule, region.js).
// Otherwise the event is dropped, not queued: fbevents.js is not loaded and
// /api/event is not called.
//
// Each event goes once to the Pixel and once to the server half (/api/event,
// server/meta-capi.js) with the same event_id, so Meta keeps one. The Lead's
// server half is sent by server/lead.js once the CRM has taken the request
// (SERVER_SENT below): contact details only ever travel through /api/lead, and
// they are hashed there, on the server.

import { getAttribution, metaIds, newEventId } from '../landing/shared/attribution.js'
import { PRODUCTION_HOSTS } from '../site.js'
import { hasConsent, onConsentChange } from './consent.js'

export const PIXEL_ID = '3872072809596261'
export const CAPI_ENDPOINT = '/api/event'
export const INTERNAL_KEY = 'argo_internal'

const STANDARD = new Set(['PageView', 'ViewContent', 'Lead', 'Contact'])
const SERVER_SENT = new Set(['Lead'])

// On a first visit fbevents.js is still loading when the first events fire, and
// it is what sets _fbp. The server half waits this long for the cookie.
const FBP_WAIT_MS = 2000
const FBP_POLL_MS = 100

let consentRule = hasConsent
let loaded = false
let pixelFailed = false
let revoked = false
let lastPageView = null
const sentOnce = new Set()

/** The landings replace "accepted cookies" with their country rule. */
export function setConsentRule(rule) {
  consentRule = rule
}

function isInternal() {
  const flag = new URLSearchParams(window.location.search).get('argo_internal')
  try {
    if (flag === '1') window.localStorage.setItem(INTERNAL_KEY, '1')
    if (flag === '0') window.localStorage.removeItem(INTERNAL_KEY)
    return window.localStorage.getItem(INTERNAL_KEY) === '1'
  } catch {
    // Storage blocked: the flag only holds while it is in the URL.
    return flag === '1'
  }
}

// On load, on any page and any address: the flag must stick even on a page that
// sends nothing, like a landing's thank-you page. (No window while prerendering.)
if (typeof window !== 'undefined') isInternal()

/** A production address and not an internal browser: consent is a separate question. */
export const isProductionVisit = () => !isInternal() && PRODUCTION_HOSTS.includes(window.location.hostname)

/** True when events are actually leaving the page. */
export const isTrackingEnabled = () => isProductionVisit() && consentRule()

// Meta's base code, minus the unconditional init and PageView, and with a way
// to know the script failed (an ad blocker, usually).
function loadPixel() {
  if (loaded) return
  loaded = true
  if (!window.fbq) {
    const fbq = function () {
      if (fbq.callMethod) fbq.callMethod.apply(fbq, arguments)
      else fbq.queue.push(arguments)
    }
    window.fbq = fbq
    if (!window._fbq) window._fbq = fbq
    fbq.push = fbq
    fbq.loaded = true
    fbq.version = '2.0'
    fbq.queue = []
    const script = document.createElement('script')
    script.async = true
    script.src = 'https://connect.facebook.net/en_US/fbevents.js'
    script.addEventListener('error', () => { pixelFailed = true })
    const first = document.getElementsByTagName('script')[0]
    first.parentNode.insertBefore(script, first)
  }
  window.fbq('consent', 'grant')
  window.fbq('init', PIXEL_ID)
}

/** Resolves when _fbp exists, or when it no longer makes sense to wait for it. */
function fbpSettled() {
  const settled = () => Boolean(metaIds().fbp) || pixelFailed
  if (settled()) return Promise.resolve()
  return new Promise((resolve) => {
    const startedAt = Date.now()
    let timer = null
    const finish = () => {
      clearInterval(timer)
      window.removeEventListener('pagehide', finish)
      resolve()
    }
    timer = setInterval(() => {
      if (settled() || Date.now() - startedAt >= FBP_WAIT_MS) finish()
    }, FBP_POLL_MS)
    // The visitor is leaving: send what there is, while the page still can.
    window.addEventListener('pagehide', finish)
  })
}

async function sendToServer(name, eventId, customData) {
  // Now, not after the wait: the page may have changed route by then.
  const eventSourceUrl = window.location.href
  await fbpSettled()
  try {
    await fetch(CAPI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      keepalive: true,
      body: JSON.stringify({
        event_name: name,
        event_id: eventId,
        event_source_url: eventSourceUrl,
        custom_data: customData,
        // Read per event: the cookies may appear at any moment after load.
        user_data: metaIds(),
      }),
    })
  } catch {
    // Measurement must never get in the visitor's way.
  }
}

/**
 * Sends one event to the Pixel and the server half with a shared event_id, and
 * returns the id. A no-op while isTrackingEnabled() is false. Pass `eventId`
 * when the id already exists (the form's, which is also the CRM's id_envio).
 */
export function track(name, customData = {}, { eventId = newEventId() } = {}) {
  if (!isTrackingEnabled()) return eventId
  loadPixel()
  window.fbq(STANDARD.has(name) ? 'track' : 'trackCustom', name, customData, { eventID: eventId })
  if (!SERVER_SENT.has(name)) sendToServer(name, eventId, customData)
  return eventId
}

/** At most once per page. An event dropped by consent can still go later. */
export function trackOnce(name, customData) {
  if (!isTrackingEnabled()) return
  const key = `${name} ${window.location.pathname}`
  if (sentOnce.has(key)) return
  sentOnce.add(key)
  track(name, customData)
}

/** PageView for the current path. The same path never counts twice in a row. */
export function trackPageView() {
  if (!isTrackingEnabled()) return
  const { pathname } = window.location
  if (pathname === lastPageView) return
  lastPageView = pathname
  track('PageView')
}

/**
 * Follows the visitor's choice: `onAllowed` runs when events may leave the
 * page, and the Pixel stops when they may not. Returns a cleanup.
 */
export function watchConsent(onAllowed) {
  return onConsentChange(() => {
    if (isTrackingEnabled()) {
      if (revoked) {
        revoked = false
        window.fbq('consent', 'grant')
      }
      onAllowed()
    } else if (loaded && !revoked) {
      revoked = true
      window.fbq('consent', 'revoke')
    }
  })
}

/**
 * The main site: first-touch attribution now, before the first route change
 * drops the query string, and the current page's PageView when consent arrives.
 * App.jsx sends the PageView of each route.
 */
export function startSiteTracking() {
  getAttribution()
  return watchConsent(trackPageView)
}
