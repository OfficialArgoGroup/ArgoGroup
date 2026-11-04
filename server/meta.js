// Meta Conversions API, shared by the two functions that talk to it:
//   server/meta-capi.js  /api/event  browser events (PageView, ViewContent…)
//   server/lead.js       /api/lead   the Lead, once the CRM has taken it
//
// Environment (Cloudflare secrets; never in the code: this repo is public):
//   META_PIXEL_ID          the Pixel the events go to
//   META_CAPI_TOKEN        Conversions API access token from Events Manager
//   META_TEST_EVENT_CODE   optional: sends to Events Manager → Test events
//                          instead of live data. Only for short windows: while
//                          it is set, every real visit goes there too.
// Logs carry no personal data: status codes and event names only.

import { createHash } from 'node:crypto'
import { PRODUCTION_HOSTS } from '../src/site.js'

export const GRAPH_VERSION = 'v21.0'
const TIMEOUT_MS = 5_000

export const metaConfigured = () => Boolean(process.env.META_PIXEL_ID && process.env.META_CAPI_TOKEN)

export const host = (url) => {
  try {
    return new URL(url).host
  } catch {
    return null
  }
}

/** Previews share production's secrets: only this says whether Meta may hear about a request. */
export const isProduction = (url) => PRODUCTION_HOSTS.includes(host(url))

export const shortText =(value) => (typeof value === 'string' && value !== '' && value.length <= 500 ? value : undefined)

/** Meta's format for personal data: SHA-256, lowercase hex, of the normalised value. */
export const sha256 = (value) => createHash('sha256').update(value, 'utf8').digest('hex')

/**
 * Sends one event to Meta. Resolves to true when Meta took it, false when it
 * refused or could not be reached; never throws, so a caller can fire and forget.
 */
export async function postToMeta(event) {
  const body = {
    data: [event],
    // In the body, not the URL, so it never shows up in request logs.
    access_token: process.env.META_CAPI_TOKEN,
  }
  if (process.env.META_TEST_EVENT_CODE) body.test_event_code = process.env.META_TEST_EVENT_CODE

  try {
    const response = await fetch(`https://graph.facebook.com/${GRAPH_VERSION}/${process.env.META_PIXEL_ID}/events`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    if (!response.ok) console.warn(`[meta] Meta said ${response.status} for ${event.event_name}`)
    return response.ok
  } catch (error) {
    console.warn(`[meta] could not reach Meta for ${event.event_name}: ${error?.name ?? 'error'}`)
    return false
  }
}
