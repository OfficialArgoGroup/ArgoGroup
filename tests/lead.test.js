// The landings' road to the CRM: the lead each form builds (src/landing/shared/crm.js)
// and the function that forwards it (server/lead.js, /api/lead), with
// a fake CRM in place of fetch. Nothing here touches the network.

import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'

globalThis.window = { location: { href: 'https://www.groupargous.com/growth?utm_source=facebook&fbclid=abc', hostname: 'www.groupargous.com', search: '?utm_source=facebook&fbclid=abc' } }
const { crmPayload, CRM_FORMS } = await import('../src/landing/shared/crm.js')
const { default: lead } = await import('../server/lead.js')

const context = {
  mountedAt: 1_791_547_200_000,
  eventId: '6f1c2a3b-0000-4000-8000-000000000001',
  attribution: { utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'c1', utm_content: '', utm_term: '', fbclid: 'abc', gclid: '', referrer: 'https://l.facebook.com/' },
}
const values = { name: ' Lola ', email: 'lola@argo.test ', website: 'acme.com', whatsapp: '+34 600 000 101', open_answer: ' We need more qualified leads. ' }

test('each landing sends the CRM contract, with its own service and form', () => {
  const growth = crmPayload({ landing: 'growth', values, context, ids: { fbc: 'fb.1.x.abc', fbp: '' }, consentText: 'I agree to the Privacy Policy.', variant: '1b' })
  assert.equal(growth.nombre, 'Lola')
  assert.equal(growth.email, 'lola@argo.test')
  assert.equal(growth.telefono, '+34600000101')
  assert.equal(growth.servicio, 'marketing_digital')
  assert.equal(growth.formulario, 'landing-marketing-digital')
  assert.equal(growth.consentimiento, true)
  assert.equal(growth.consentimiento_texto, 'I agree to the Privacy Policy.')
  assert.equal(growth.abierto_en, context.mountedAt)
  assert.equal(growth.id_envio, context.eventId)
  assert.equal(growth.web, '', 'the trap field goes empty')
  assert.equal(growth.utm_content, undefined, 'empty attribution is left out')
  assert.equal(growth.fbclid, 'abc')
  assert.equal(growth.variante, '1b')
  assert.equal(growth.fbp, undefined, 'no fbp without consent')
  // The website has its own field (0020); the message is the answer alone.
  assert.equal(growth.mensaje, 'We need more qualified leads.')
  assert.equal(growth.sitio_web, 'https://acme.com')

  const systems = crmPayload({ landing: 'systems', values, context, ids: {}, consentText: 'x' })
  assert.deepEqual([systems.servicio, systems.formulario], [CRM_FORMS.systems.servicio, 'landing-sistemas-ia'])
  assert.equal(systems.variante, undefined)
})

test('company or website: a URL goes to sitio_web, a name to empresa, never both', () => {
  const send = (website) => crmPayload({ landing: 'growth', values: { ...values, website }, context, ids: {}, consentText: 'x' })

  for (const url of ['acme.com', 'https://acme.com', 'http://www.acme.nl/about']) {
    const payload = send(url)
    assert.match(payload.sitio_web, /^https?:\/\//, `${url} is a website`)
    assert.equal(payload.empresa, undefined)
  }

  // A name must never reach sitio_web: the CRM answers 400 to anything but an http(s) URL.
  for (const name of ['Acme Clinic', 'acme', 'Smith & Co.']) {
    const payload = send(` ${name} `)
    assert.equal(payload.empresa, name, `${name} is a company`)
    assert.equal(payload.sitio_web, undefined)
  }
  assert.equal(send('x'.repeat(300)).empresa.length, 200, 'within the CRM limit for empresa')
})

test('only name, email and WhatsApp: no empresa, sitio_web or mensaje in the lead', () => {
  const bare = { name: 'Lola', email: 'lola@argo.test', website: '  ', whatsapp: '+34 600 000 101', open_answer: '' }
  for (const landing of ['growth', 'systems']) {
    const payload = crmPayload({ landing, values: bare, context, ids: {}, consentText: 'x' })
    assert.deepEqual([payload.empresa, payload.sitio_web, payload.mensaje], [undefined, undefined, undefined], landing)
    assert.deepEqual([payload.nombre, payload.email, payload.telefono], ['Lola', 'lola@argo.test', '+34600000101'])
    // No minimum length any more: one word is a message.
    assert.equal(crmPayload({ landing, values: { ...bare, open_answer: ' Hi ' }, context, ids: {}, consentText: 'x' }).mensaje, 'Hi')
  }
})

test('the lead fits the contract limits', () => {
  const payload = crmPayload({ landing: 'growth', values, context, ids: {}, consentText: 'I agree.' })
  assert.match(payload.formulario, /^[a-z0-9-]{1,100}$/)
  assert.match(payload.id_envio, /^[A-Za-z0-9-]{8,64}$/)
  assert.ok(['marketing_digital', 'sistemas_ia', 'ambos', 'otro'].includes(payload.servicio))
  assert.ok(Buffer.byteLength(JSON.stringify(payload)) < 16 * 1024)
})

// ---------- The function ----------

const ENV = ['CRM_LEADS_URL', 'CRM_ENTRADA_SECRETO', 'CRM_BYPASS_SECRET']
let calls
let reply
const realFetch = globalThis.fetch

beforeEach(() => {
  calls = []
  reply = () => new Response(JSON.stringify({ ok: true }), { status: 200 })
  process.env.CRM_LEADS_URL = 'https://crm.example/api/leads'
  process.env.CRM_ENTRADA_SECRETO = 'test-key'
  delete process.env.CRM_BYPASS_SECRET
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    return reply()
  }
})

afterEach(() => {
  globalThis.fetch = realFetch
  for (const name of ENV) delete process.env[name]
})

const post = (body, headers = {}) => new Request('https://www.groupargous.com/api/lead', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: 'https://www.groupargous.com', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
})

test('it forwards the body with the key and the visitor IP, and returns the CRM answer', async () => {
  const body = JSON.stringify({ nombre: 'Lola' })
  const response = await lead(post(body), { ip: '203.0.113.7' })
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://crm.example/api/leads')
  assert.equal(calls[0].init.headers.Authorization, 'Bearer test-key')
  assert.equal(calls[0].init.headers['X-Argo-Ip-Cliente'], '203.0.113.7')
  assert.equal(calls[0].init.headers['x-vercel-protection-bypass'], undefined)
  assert.equal(calls[0].init.body, body, 'the body goes as it came')
})

test('the CRM preview bypass is added when set; without an IP none is sent', async () => {
  process.env.CRM_BYPASS_SECRET = 'bypass'
  await lead(post({}), {})
  assert.equal(calls[0].init.headers['X-Argo-Ip-Cliente'], undefined)
  assert.equal(calls[0].init.headers['x-vercel-protection-bypass'], 'bypass')
})

test('the CRM errors reach the page unchanged', async () => {
  reply = () => new Response(JSON.stringify({ ok: false, error: 'datos', campos: ['email'] }), { status: 400 })
  let response = await lead(post({}), {})
  assert.equal(response.status, 400)
  assert.deepEqual((await response.json()).campos, ['email'])

  reply = () => new Response(JSON.stringify({ ok: false, error: 'limite' }), { status: 429 })
  response = await lead(post({}), {})
  assert.equal(response.status, 429)
})

test('without configuration it sends nothing and answers 503', async () => {
  delete process.env.CRM_ENTRADA_SECRETO
  const response = await lead(post({}), {})
  assert.equal(response.status, 503)
  assert.equal(calls.length, 0)
})

test('it refuses other sites, other methods, other formats and big bodies', async () => {
  assert.equal((await lead(post({}, { Origin: 'https://evil.example' }), {})).status, 403)
  assert.equal((await lead(new Request('https://www.groupargous.com/api/lead'), {})).status, 405)
  assert.equal((await lead(post('x', { 'Content-Type': 'text/plain' }), {})).status, 415)
  assert.equal((await lead(post(JSON.stringify({ m: 'x'.repeat(17 * 1024) })), {})).status, 413)
  assert.equal(calls.length, 0)
})

test('a login wall or an unreachable CRM becomes 503, never a false ok', async () => {
  reply = () => new Response('<html>Vercel login</html>', { status: 401 })
  assert.equal((await lead(post({}), {})).status, 503)

  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  assert.equal((await lead(post({}), {})).status, 503)
})

// ---------- The Meta Lead, sent from the server ----------

const { createHash } = await import('node:crypto')
const sha = (value) => createHash('sha256').update(value).digest('hex')
const META_ENV = ['META_PIXEL_ID', 'META_CAPI_TOKEN', 'META_TEST_EVENT_CODE']
const landingLead = () => crmPayload({ landing: 'growth', values, context, ids: { fbc: 'fb.1.x.abc', fbp: 'fb.1.1.123' }, consentText: 'I agree.', variant: '1b' })
const withConsent = { 'X-Argo-Meta-Consent': '1', 'User-Agent': 'test-agent' }
const metaCalls = () => calls.filter((call) => call.url.startsWith('https://graph.facebook.com/'))

afterEach(() => {
  for (const name of META_ENV) delete process.env[name]
})

const enableMeta = () => {
  process.env.META_PIXEL_ID = '123'
  process.env.META_CAPI_TOKEN = 'test-token'
}

test('with Meta consent, a lead the CRM took becomes a server Lead with hashed contact data', async () => {
  enableMeta()
  const pending = []
  const response = await lead(post(landingLead(), withConsent), { ip: '203.0.113.7', geo: { country: { code: 'NL' } }, waitUntil: (job) => pending.push(job) })
  assert.equal(response.status, 200)
  assert.equal(pending.length, 1, 'Meta is sent after the answer, through waitUntil')
  await Promise.all(pending)

  assert.equal(calls[0].url, 'https://crm.example/api/leads', 'the CRM first')
  const [meta] = metaCalls()
  assert.equal(meta.url, 'https://graph.facebook.com/v21.0/123/events')
  const body = JSON.parse(meta.init.body)
  assert.equal(body.access_token, 'test-token')
  const [sent] = body.data
  assert.equal(sent.event_name, 'Lead')
  assert.equal(sent.event_id, context.eventId, 'the same id as the Pixel Lead, so Meta keeps one')
  assert.equal(sent.action_source, 'website')
  assert.equal(sent.event_source_url, 'https://www.groupargous.com/growth?utm_source=facebook&fbclid=abc')
  assert.deepEqual(sent.user_data.em, [sha('lola@argo.test')])
  assert.deepEqual(sent.user_data.ph, [sha('34600000101')])
  assert.deepEqual(sent.user_data.fn, [sha('lola')])
  assert.equal(sent.user_data.ln, undefined, 'one word: no last name')
  assert.deepEqual(sent.user_data.country, [sha('nl')])
  assert.equal(sent.user_data.client_ip_address, '203.0.113.7')
  assert.equal(sent.user_data.client_user_agent, 'test-agent')
  assert.equal(sent.user_data.fbc, 'fb.1.x.abc')
  assert.equal(sent.user_data.fbp, 'fb.1.1.123')
  assert.deepEqual(sent.custom_data, { content_name: 'growth', content_category: 'growth', variant: '1b', utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'c1' })
  assert.ok(!meta.init.body.includes('lola@argo.test'), 'no readable email reaches Meta')
  assert.ok(!meta.init.body.includes('600000101'), 'no readable phone reaches Meta')
})

test('the systems landing sends its own category, and a full name splits into first and last', async () => {
  enableMeta()
  const payload = crmPayload({ landing: 'systems', values: { ...values, name: 'Lola  de la Vega' }, context, ids: {}, consentText: 'x' })
  await lead(post(payload, withConsent), {})
  const [sent] = JSON.parse(metaCalls()[0].init.body).data
  assert.deepEqual(sent.custom_data, { content_name: 'systems', content_category: 'systems', utm_source: 'facebook', utm_medium: 'paid', utm_campaign: 'c1' })
  assert.deepEqual(sent.user_data.fn, [sha('lola')])
  assert.deepEqual(sent.user_data.ln, [sha('vega')])
})

test('the main site contact form sends its Lead the same way', async () => {
  enableMeta()
  await lead(post({ ...landingLead(), formulario: 'web-contacto', variante: undefined }, withConsent), {})
  const [sent] = JSON.parse(metaCalls()[0].init.body).data
  assert.equal(sent.custom_data.content_name, 'contact')
  assert.deepEqual(sent.user_data.em, [sha('lola@argo.test')])
})

test('a lead from a preview may reach the CRM, never Meta', async () => {
  enableMeta()
  const preview = 'https://fix-argo-web.sweet-poetry-73fa.workers.dev'
  const request = new Request(`${preview}/api/lead`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: preview, ...withConsent },
    body: JSON.stringify({ ...landingLead(), pagina: `${preview}/growth` }),
  })
  assert.equal((await lead(request, {})).status, 200)
  assert.equal(metaCalls().length, 0)
})

test('without Meta consent, nothing goes to Meta', async () => {
  enableMeta()
  const response = await lead(post(landingLead(), { 'User-Agent': 'test-agent' }), {})
  assert.equal(response.status, 200)
  assert.equal(calls.length, 1)
  assert.equal(metaCalls().length, 0)
})

test('no Meta Lead for a lead the CRM refused, for other forms, or without the Meta settings', async () => {
  enableMeta()
  reply = () => new Response(JSON.stringify({ ok: false, error: 'limite' }), { status: 429 })
  await lead(post(landingLead(), withConsent), {})
  assert.equal(metaCalls().length, 0, 'refused by the CRM')

  reply = () => new Response(JSON.stringify({ ok: true }), { status: 200 })
  await lead(post({ ...landingLead(), formulario: 'otro-formulario' }, withConsent), {})
  await lead(post({ ...landingLead(), pagina: 'https://evil.example/growth' }, withConsent), {})
  await lead(post({ ...landingLead(), id_envio: 'x' }, withConsent), {})
  assert.equal(metaCalls().length, 0, 'not a lead we can vouch for')

  delete process.env.META_CAPI_TOKEN
  await lead(post(landingLead(), withConsent), {})
  assert.equal(metaCalls().length, 0, 'not configured')
})

test('a Meta failure never reaches the visitor', async () => {
  enableMeta()
  const realReply = reply
  globalThis.fetch = async (url, init) => {
    calls.push({ url, init })
    if (url.startsWith('https://graph.facebook.com/')) throw new TypeError('fetch failed')
    return realReply()
  }
  const response = await lead(post(landingLead(), withConsent), {})
  assert.equal(response.status, 200)
  assert.deepEqual(await response.json(), { ok: true })
  assert.equal(metaCalls().length, 1)
})

test('the page asks /api/lead for the Meta Lead with a header, never in the CRM body', async () => {
  const { sendLead } = await import('../src/landing/shared/submit.js')
  const payload = landingLead()
  await sendLead(payload, { metaConsent: true })
  await sendLead(payload)
  const [withIt, without] = calls
  assert.equal(withIt.url, '/api/lead')
  assert.equal(withIt.init.headers['X-Argo-Meta-Consent'], '1')
  assert.equal(without.init.headers['X-Argo-Meta-Consent'], undefined)
  assert.equal(withIt.init.body, JSON.stringify(payload), 'the body is the CRM contract, unchanged')
})
