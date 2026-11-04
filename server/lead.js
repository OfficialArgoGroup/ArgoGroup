// The landings' lead form → the CRM (argo-planning, POST /api/leads).
//
// The browser posts here, on the site's own domain. This function adds what
// the browser must never hold, the CRM key, plus the visitor's IP (the CRM
// keeps it only as a salted hash, to cap submissions per person), and
// forwards the body unchanged. The CRM validates every field again and
// decides; its answer goes back to the page as it came, so the form reacts
// to 400 and 429 as the contract says.
//
// Contract: 01-captacion/plataforma/cambios/crm-entrada-web/contrato-formulario.md
// in the ARGO Universe.
//
// The Meta Lead. When the CRM takes the request AND the visitor has accepted
// Meta's cookies (on the banner or with the optional box on the form, which
// the page reports as `X-Argo-Meta-Consent: 1`), this function sends the Lead
// to Meta's Conversions API itself, with the same event_id as the Pixel's
// Lead (id_envio) so Meta keeps one. From the server it no longer depends on
// the page staying open, an ad blocker or the Pixel having loaded, and it
// carries the email, phone, name and country as SHA-256 hashes, which is what
// lets Meta match the lead to the ad. Without that consent nothing goes to
// Meta (privacy policy, section 11). It runs after the answer is on its way
// (context.waitUntil, see server/worker.js): the visitor never waits for Meta, and a Meta failure
// never turns into a form error.
//
// Served at /api/lead by server/worker.js (Cloudflare).
//
// Environment (Cloudflare → the Worker → Settings → Variables and Secrets, as
// secrets;
// never in the code: this repo is public):
//   CRM_LEADS_URL                     the CRM route, production or a preview's
//   CRM_ENTRADA_SECRETO               the same key as in argo-planning's Vercel
//   CRM_BYPASS_SECRET                 only to reach a protected CRM preview: the
//                                     CRM's Vercel automation bypass secret
//   META_PIXEL_ID, META_CAPI_TOKEN    for the Meta Lead (server/meta.js)
// Without the first two it answers 503 and sends nothing; without the Meta
// pair the lead still reaches the CRM and nothing goes to Meta. Logs carry no
// personal data: status codes and error names only.

import { host, isProduction, metaConfigured, postToMeta, sha256, shortText } from './meta.js'

const MAX_BODY = 16 * 1024
const TIMEOUT_MS = 10_000

// The forms that send a Meta Lead, each with its own content name.
const META_CONTENT = {
  'landing-marketing-digital': 'growth',
  'landing-sistemas-ia': 'systems',
  'web-contacto': 'contact',
}

const UTM = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']

/** Meta's normalisation: trimmed, lowercase; phones as digits with country code. */
const hashed = (value) => (value ? [sha256(value)] : undefined)
const lower = (value) => (typeof value === 'string' ? value.trim().toLowerCase() : '')

/**
 * The Lead as Meta's Conversions API expects it, from the CRM body the form
 * sent. Null when the body is not a lead we can vouch for.
 */
export function metaLead(lead, request, context) {
  const content = META_CONTENT[lead?.formulario]
  if (!content) return null
  if (typeof lead.id_envio !== 'string' || !/^[A-Za-z0-9-]{8,64}$/.test(lead.id_envio)) return null
  // The page the lead was sent from: this site, in production. A preview's
  // test lead may reach a CRM, never Meta.
  if (!isProduction(request.url) || host(lead.pagina) !== host(request.url)) return null

  const email = lower(lead.email)
  const phone = typeof lead.telefono === 'string' ? lead.telefono.replace(/\D/g, '') : ''
  const names = lower(lead.nombre).split(/\s+/).filter(Boolean)
  const country = lower(context?.geo?.country?.code)
  const variant = typeof lead.variante === 'string' && /^[a-z0-9]{1,4}$/.test(lead.variante) ? lead.variante : undefined

  return {
    event_name: 'Lead',
    event_time: Math.floor(Date.now() / 1000),
    event_id: lead.id_envio,
    action_source: 'website',
    event_source_url: lead.pagina,
    user_data: {
      em: hashed(email.includes('@') ? email : ''),
      ph: hashed(phone.length >= 8 ? phone : ''),
      fn: hashed(names[0]),
      ln: hashed(names.length > 1 ? names[names.length - 1] : ''),
      country: hashed(/^[a-z]{2}$/.test(country) ? country : ''),
      client_ip_address: context?.ip || undefined,
      client_user_agent: shortText(request.headers.get('user-agent')),
      fbc: shortText(lead.fbc),
      fbp: shortText(lead.fbp),
    },
    custom_data: {
      content_name: content,
      content_category: content,
      ...(variant ? { variant } : {}),
      ...Object.fromEntries(UTM.filter((name) => shortText(lead[name])).map((name) => [name, lead[name]])),
    },
  }
}

/** Sends the Lead to Meta without holding up the answer to the visitor. */
async function reportLead(body, request, context) {
  if (request.headers.get('x-argo-meta-consent') !== '1' || !metaConfigured()) return
  let lead
  try {
    lead = JSON.parse(body)
  } catch {
    return
  }
  const event = metaLead(lead, request, context)
  if (!event) return
  const job = postToMeta(event)
  if (typeof context?.waitUntil === 'function') context.waitUntil(job)
  else await job
}

const answer = (status, body) => new Response(JSON.stringify(body), {
  status,
  headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
})

const unavailable = () => answer(503, { ok: false, error: 'no_disponible' })

/** Same host as this function, or no Origin at all (not a browser). */
function sameSite(origin, requestUrl) {
  if (!origin) return true
  try {
    return new URL(origin).host === new URL(requestUrl).host
  } catch {
    return false
  }
}

export default async (request, context) => {
  if (request.method !== 'POST') return answer(405, { ok: false, error: 'metodo' })

  // Only this site's own pages post here.
  if (!sameSite(request.headers.get('origin'), request.url)) {
    return answer(403, { ok: false, error: 'no_autorizado' })
  }

  const url = process.env.CRM_LEADS_URL
  const key = process.env.CRM_ENTRADA_SECRETO
  if (!url || !key) {
    console.warn('[lead] not configured: CRM_LEADS_URL or CRM_ENTRADA_SECRETO missing')
    return unavailable()
  }

  if (!(request.headers.get('content-type') || '').toLowerCase().startsWith('application/json')) {
    return answer(415, { ok: false, error: 'formato' })
  }
  const body = await request.text()
  if (Buffer.byteLength(body, 'utf8') > MAX_BODY) {
    return answer(413, { ok: false, error: 'demasiado_grande' })
  }

  const headers = { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` }
  // Without it every lead would share one submission cap in the CRM.
  const ip = context?.ip
  if (ip) headers['X-Argo-Ip-Cliente'] = ip
  const bypass = process.env.CRM_BYPASS_SECRET
  if (bypass) headers['x-vercel-protection-bypass'] = bypass

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers,
      body,
      redirect: 'manual',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    })
    let result = null
    try {
      result = JSON.parse(await response.text())
    } catch {
      // Not the CRM answering (a login wall, a proxy error page): handled below.
    }
    if (!result || typeof result.ok !== 'boolean') {
      console.warn(`[lead] unexpected answer from the CRM: ${response.status}`)
      return unavailable()
    }
    if (!result.ok) console.warn(`[lead] CRM said ${response.status} ${result.error ?? ''}`)
    // Only a lead the CRM really took counts as a Lead in Meta.
    if (response.ok && result.ok) await reportLead(body, request, context)
    return answer(response.status, result)
  } catch (error) {
    console.warn(`[lead] could not reach the CRM: ${error?.name ?? 'error'}`)
    return unavailable()
  }
}

