// Meta Conversions API relay for the whole site, at /api/event.
//
// The page calls it only when tracking may run for this visitor
// (src/lib/tracking.js), with the same event_id the Pixel uses, so
// Meta keeps one of the pair. This function adds what only a server knows,
// the visitor's IP and user agent, and the token the browser must never see.
//
// Not the Lead: that one is sent by server/lead.js, from the server
// and only after the CRM has taken the request, so it no longer depends on the
// page staying open long enough. This relay refuses it, so a lead is never
// counted twice from the server.
//
// Served at /api/event by server/worker.js. Environment: see server/meta.js. Without META_PIXEL_ID and
// META_CAPI_TOKEN it answers 204 and contacts nobody.

import { isProduction, metaConfigured, postToMeta, shortText } from './meta.js'

const ALLOWED_EVENTS = new Set(['PageView', 'ViewContent', 'Scroll50', 'FormStart', 'Contact'])
const MAX_BODY = 4 * 1024

const done = (status) => new Response(null, { status, headers: { 'Cache-Control': 'no-store' } })

/** Only flat, small custom data: strings and numbers. */
function cleanCustomData(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data)) return {}
  return Object.fromEntries(Object.entries(data)
    .filter(([key, value]) => /^[a-z_]{1,40}$/.test(key) && (typeof value === 'number' || shortText(value)))
    .slice(0, 10))
}

export default async (request, context) => {
  if (request.method !== 'POST') return done(405)

  // Only the production site's own pages send events here: browsers always
  // put Origin on a POST, and previews and workers.dev stop here.
  if (!isProduction(request.headers.get('origin')) || !isProduction(request.url)) return done(403)

  if (!metaConfigured()) return done(204)

  const raw = await request.text()
  if (Buffer.byteLength(raw, 'utf8') > MAX_BODY) return done(413)
  let event
  try {
    event = JSON.parse(raw)
  } catch {
    return done(400)
  }
  if (!event || !ALLOWED_EVENTS.has(event.event_name)
    || typeof event.event_id !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(event.event_id)
    || !isProduction(event.event_source_url)) {
    return done(400)
  }

  const sent = await postToMeta({
    event_name: event.event_name,
    event_time: Math.floor(Date.now() / 1000),
    event_id: event.event_id,
    action_source: 'website',
    event_source_url: event.event_source_url,
    user_data: {
      client_ip_address: context?.ip || undefined,
      client_user_agent: shortText(request.headers.get('user-agent')),
      fbc: shortText(event.user_data?.fbc),
      fbp: shortText(event.user_data?.fbp),
    },
    custom_data: cleanCustomData(event.custom_data),
  })
  return done(sent ? 204 : 502)
}

