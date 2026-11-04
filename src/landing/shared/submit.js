// Sends a landing lead (/growth, /systems) to the CRM, through this site's own
// /api/lead (server/lead.js), which adds the key the browser must
// never see. The body is the CRM's contract (crm.js).
//
// Review mode: under `vite dev` and in the standalone review copy opened from
// disk there is no /api/lead, so nothing is sent, the console says so, and
// the visitor still reaches the thank-you page.

import { isProductionVisit } from '../../lib/tracking.js'

export const LEAD_ENDPOINT = '/api/lead'

// `?.`: import.meta.env exists only under Vite; plain Node (the tests) has none.
export const reviewMode = () => Boolean(import.meta.env?.DEV) || window.location.protocol === 'file:'

/**
 * Resolves true when the CRM took the lead, false in review mode; throws on
 * failure. `metaConsent`: the visitor accepted Meta's cookies, so /api/lead
 * also sends the Lead to Meta from the server (server/lead.js). It
 * travels as a header, not in the body, because the body goes to the CRM as is.
 * An internal browser or a preview still reaches the CRM, never Meta.
 */
export async function sendLead(payload, { metaConsent = false } = {}) {
  if (reviewMode()) {
    console.warn(`Review mode: the lead is not sent (Meta consent: ${metaConsent ? 'yes' : 'no'})`)
    return false
  }
  const headers = { 'Content-Type': 'application/json' }
  if (metaConsent && isProductionVisit()) headers['X-Argo-Meta-Consent'] = '1'
  const response = await fetch(LEAD_ENDPOINT, {
    method: 'POST',
    headers,
    body: JSON.stringify(payload),
  })
  if (!response.ok) throw new Error(`Lead endpoint responded ${response.status}`)
  return true
}
