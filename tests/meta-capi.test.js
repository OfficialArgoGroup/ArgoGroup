// The Conversions API relay (server/meta-capi.js, /api/event), with
// a fake Meta in place of fetch. Nothing here touches the network.

import assert from 'node:assert/strict'
import { afterEach, beforeEach, test } from 'node:test'
import relay from '../server/meta-capi.js'

const SITE = 'https://www.groupargous.com'
const ENV = ['META_PIXEL_ID', 'META_CAPI_TOKEN', 'META_TEST_EVENT_CODE']
const realFetch = globalThis.fetch
let calls
let reply

beforeEach(() => {
  calls = []
  reply = () => new Response('{"events_received":1}', { status: 200 })
  process.env.META_PIXEL_ID = '123'
  process.env.META_CAPI_TOKEN = 'test-token'
  delete process.env.META_TEST_EVENT_CODE
  globalThis.fetch = async (url, init) => {
    calls.push({ url, body: JSON.parse(init.body) })
    return reply()
  }
})

afterEach(() => {
  globalThis.fetch = realFetch
  for (const name of ENV) delete process.env[name]
})

const event = (overrides = {}) => ({
  event_name: 'Contact',
  event_id: '6f1c2a3b-0000-4000-8000-000000000001',
  event_source_url: `${SITE}/growth?utm_source=facebook`,
  custom_data: { content_category: 'growth', variant: '1b' },
  user_data: { fbc: 'fb.1.1.abc', fbp: 'fb.1.1.123' },
  ...overrides,
})

const post = (body, headers = {}) => new Request(`${SITE}/api/event`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', Origin: SITE, 'User-Agent': 'test-agent', ...headers },
  body: typeof body === 'string' ? body : JSON.stringify(body),
})

test('it sends the event to Meta with the IP, the user agent and the shared event_id', async () => {
  const response = await relay(post(event()), { ip: '203.0.113.7' })
  assert.equal(response.status, 204)
  assert.equal(calls.length, 1)
  assert.equal(calls[0].url, 'https://graph.facebook.com/v21.0/123/events')
  assert.ok(!calls[0].url.includes('test-token'), 'the token never goes in the URL')
  assert.equal(calls[0].body.access_token, 'test-token')
  const [sent] = calls[0].body.data
  assert.equal(sent.event_name, 'Contact')
  assert.equal(sent.event_id, '6f1c2a3b-0000-4000-8000-000000000001')
  assert.equal(sent.action_source, 'website')
  assert.equal(sent.user_data.client_ip_address, '203.0.113.7')
  assert.equal(sent.user_data.client_user_agent, 'test-agent')
  assert.equal(sent.user_data.fbc, 'fb.1.1.abc')
  assert.deepEqual(sent.custom_data, { content_category: 'growth', variant: '1b' })
  assert.equal(calls[0].body.test_event_code, undefined)
})

test('the test event code routes events to Test events', async () => {
  process.env.META_TEST_EVENT_CODE = 'TEST123'
  await relay(post(event()), {})
  assert.equal(calls[0].body.test_event_code, 'TEST123')
})

test('without the Pixel or the token it contacts nobody', async () => {
  delete process.env.META_CAPI_TOKEN
  assert.equal((await relay(post(event()), {})).status, 204)
  assert.equal(calls.length, 0)
})

test('it refuses other sites, other events, odd ids and pages from elsewhere', async () => {
  assert.equal((await relay(post(event(), { Origin: 'https://evil.example' }), {})).status, 403)
  assert.equal((await relay(post(event({ event_name: 'Purchase' })), {})).status, 400)
  // The Lead's server half comes from /api/lead only, so it is never counted twice.
  assert.equal((await relay(post(event({ event_name: 'Lead' })), {})).status, 400)
  assert.equal((await relay(post(event({ event_id: 'x' })), {})).status, 400)
  assert.equal((await relay(post(event({ event_source_url: 'https://evil.example/growth' })), {})).status, 400)
  assert.equal((await relay(post('not json'), {})).status, 400)
  assert.equal((await relay(post(event({ custom_data: { note: 'x'.repeat(5000) } })), {})).status, 413)
  assert.equal((await relay(new Request(`${SITE}/api/event`), {})).status, 405)
  assert.equal(calls.length, 0)
})

test('only production counts: previews, workers.dev and requests without Origin stop here', async () => {
  const preview = 'https://fix-argo-web.sweet-poetry-73fa.workers.dev'
  const fromPreview = new Request(`${preview}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: preview },
    body: JSON.stringify(event({ event_source_url: `${preview}/growth` })),
  })
  assert.equal((await relay(fromPreview, {})).status, 403)

  const spoofed = new Request(`${preview}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: SITE },
    body: JSON.stringify(event()),
  })
  assert.equal((await relay(spoofed, {})).status, 403, 'a production Origin does not make a preview production')

  const noOrigin = new Request(`${SITE}/api/event`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(event()),
  })
  assert.equal((await relay(noOrigin, {})).status, 403)

  assert.equal((await relay(post(event(), { Origin: 'https://groupargous.com' }), {})).status, 204, 'the bare domain is production')
  assert.equal(calls.length, 1)
})

test('custom data stays flat and small', async () => {
  await relay(post(event({ custom_data: { content_category: 'growth', nested: { a: 1 }, 'Bad Key': 'x', value: 3 } })), {})
  assert.deepEqual(calls[0].body.data[0].custom_data, { content_category: 'growth', value: 3 })
})

test('a Meta error or an unreachable Meta is 502, and the page never waits on it', async () => {
  reply = () => new Response('{"error":{}}', { status: 400 })
  assert.equal((await relay(post(event()), {})).status, 502)
  globalThis.fetch = async () => { throw new TypeError('fetch failed') }
  assert.equal((await relay(post(event()), {})).status, 502)
})
