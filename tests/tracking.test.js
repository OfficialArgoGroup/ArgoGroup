// The single tracking module (src/lib/tracking.js) and the first-touch
// attribution under it, in a fake browser. Nothing here touches the network.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { setConsent } from '../src/lib/consent.js'
import { getAttribution, metaIds, utmData } from '../src/landing/shared/attribution.js'

const SITE = 'https://www.groupargous.com'
const storage = (seed = {}) => {
  const items = new Map(Object.entries(seed))
  return {
    getItem: (key) => (items.has(key) ? items.get(key) : null),
    setItem: (key, value) => { items.set(key, String(value)) },
    removeItem: (key) => { items.delete(key) },
  }
}

let visits = 0

/** A fresh page load: its own module state, with browser storage carried over if given. */
async function visit(url, { consent = 'accepted', cookies = '', local = storage(), session = storage() } = {}) {
  if (consent) local.setItem('argo_cookie_consent', consent)
  const scripts = []
  const posts = []
  const win = new EventTarget()
  win.location = new URL(url)
  win.localStorage = local
  win.sessionStorage = session
  globalThis.window = win
  globalThis.localStorage = local
  globalThis.document = {
    cookie: cookies,
    referrer: '',
    createElement: () => {
      const script = new EventTarget()
      scripts.push(script)
      return script
    },
    getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }],
  }
  globalThis.fetch = async (path, init) => {
    posts.push({ path, body: JSON.parse(init.body) })
    return new Response(null, { status: 204 })
  }
  const tracking = await import(`../src/lib/tracking.js?visit=${visits++}`)
  return {
    tracking,
    scripts,
    posts,
    local,
    session,
    fbqCalls: () => [...(win.fbq?.queue ?? [])].map((call) => [...call]),
    tracked: () => [...(win.fbq?.queue ?? [])].map((call) => [...call]).filter(([method]) => method === 'track' || method === 'trackCustom'),
  }
}

const settle = (ms = 0) => new Promise((resolve) => { setTimeout(resolve, ms) })
const FBP = '_fbp=fb.1.1.111'

test('one event: one init, one Pixel call and one server call, with the same event_id and the full URL', async () => {
  const page = await visit(`${SITE}/contact?utm_source=fb`, { cookies: FBP })
  const id = page.tracking.track('Contact', { content_name: 'x' })
  page.tracking.track('Contact', { content_name: 'x' })
  await settle()

  assert.equal(page.scripts.length, 1, 'fbevents.js loads once')
  assert.equal(page.scripts[0].src, 'https://connect.facebook.net/en_US/fbevents.js')
  assert.equal(page.fbqCalls().filter(([method]) => method === 'init').length, 1, 'one init')
  assert.deepEqual(page.tracked()[0], ['track', 'Contact', { content_name: 'x' }, { eventID: id }])
  assert.equal(page.posts.length, 2)
  assert.equal(page.posts[0].path, '/api/event')
  assert.equal(page.posts[0].body.event_id, id)
  assert.equal(page.posts[0].body.event_source_url, `${SITE}/contact?utm_source=fb`)
})

test('custom events go as trackCustom', async () => {
  const page = await visit(`${SITE}/growth`, { cookies: FBP })
  page.tracking.track('Scroll50')
  assert.equal(page.tracked()[0][0], 'trackCustom')
})

test('the Lead takes the given id and has no /api/event half: the server sends it', async () => {
  const page = await visit(`${SITE}/contact`, { cookies: FBP })
  assert.equal(page.tracking.track('Lead', {}, { eventId: 'lead-id-123' }), 'lead-id-123')
  await settle()
  assert.equal(page.tracked()[0][3].eventID, 'lead-id-123')
  assert.equal(page.posts.length, 0)
})

test('only production: previews, workers.dev and localhost load nothing and call nothing', async () => {
  for (const host of ['https://argo-web.sweet-poetry-73fa.workers.dev', 'https://fix-argo-web.sweet-poetry-73fa.workers.dev', 'https://deploy-preview-25--argogroupus.netlify.app', 'http://localhost:5173', 'https://groupargous.com.evil.example']) {
    const page = await visit(`${host}/growth`, { cookies: FBP })
    assert.equal(page.tracking.isTrackingEnabled(), false, host)
    page.tracking.track('PageView')
    page.tracking.trackPageView()
    page.tracking.trackOnce('ViewContent')
    await settle()
    assert.equal(page.scripts.length, 0, `${host} loads no Pixel`)
    assert.equal(page.posts.length, 0, `${host} calls no /api/event`)
  }
  assert.equal((await visit('https://groupargous.com/')).tracking.isTrackingEnabled(), true, 'the bare domain counts')
})

test('?argo_internal=1 silences this browser from then on, ?argo_internal=0 clears it', async () => {
  const local = storage()
  let page = await visit(`${SITE}/growth?argo_internal=1`, { local, cookies: FBP })
  page.tracking.track('PageView')
  await settle()
  assert.equal(page.scripts.length + page.posts.length, 0)
  assert.equal(local.getItem('argo_internal'), '1')

  page = await visit(`${SITE}/about`, { local, cookies: FBP })
  assert.equal(page.tracking.isTrackingEnabled(), false, 'still silent on any later URL')

  page = await visit(`${SITE}/about?argo_internal=0`, { local, cookies: FBP })
  assert.equal(page.tracking.isTrackingEnabled(), true)
  assert.equal(local.getItem('argo_internal'), null)
})

test('the flag sticks just by opening a page, on any address, even if the page sends nothing', async () => {
  for (const url of [`${SITE}/growth/thank-you?argo_internal=1`, 'http://localhost:4180/systems?argo_internal=1']) {
    const local = storage()
    await visit(url, { local })
    assert.equal(local.getItem('argo_internal'), '1', url)
  }
})

test('the flag still holds in its own URL when storage is blocked', async () => {
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => { throw new Error('blocked') } }
  const page = await visit(`${SITE}/growth?argo_internal=1`, { consent: null, local: blocked })
  assert.equal(page.tracking.isProductionVisit(), false)
})

test('consent is the third condition: production without it sends nothing', async () => {
  for (const consent of [null, 'rejected', 'acknowledged']) {
    const page = await visit(`${SITE}/`, { consent })
    assert.equal(page.tracking.isProductionVisit(), true)
    assert.equal(page.tracking.isTrackingEnabled(), false, String(consent))
    page.tracking.track('PageView')
    await settle()
    assert.equal(page.scripts.length + page.posts.length, 0, String(consent))
  }
})

test('the page rule replaces it, and is still under the production and internal checks', async () => {
  let page = await visit(`${SITE}/growth`, { consent: 'rejected' })
  page.tracking.setConsentRule(() => true)
  assert.equal(page.tracking.isTrackingEnabled(), true)
  page = await visit('http://localhost:5173/growth')
  page.tracking.setConsentRule(() => true)
  assert.equal(page.tracking.isTrackingEnabled(), false)
})

test('the PageView waits for Accept, and a later Reject and Accept follow through', async () => {
  const page = await visit(`${SITE}/about`, { consent: null, cookies: FBP })
  const stop = page.tracking.startSiteTracking()
  page.tracking.trackPageView()
  assert.equal(page.scripts.length, 0)

  setConsent('accepted')
  assert.deepEqual(page.tracked().map(([, name]) => name), ['PageView'])

  setConsent('rejected')
  assert.deepEqual(page.fbqCalls().at(-1), ['consent', 'revoke'])
  setConsent('accepted')
  assert.deepEqual(page.fbqCalls().at(-1), ['consent', 'grant'])
  assert.equal(page.tracked().length, 1, 'the same page still counts once')
  stop()
})

test('a PageView per route, and never the same path twice in a row', async () => {
  const page = await visit(`${SITE}/`, { cookies: FBP })
  page.tracking.trackPageView()
  page.tracking.trackPageView()
  window.location = new URL(`${SITE}/contact?x=1`)
  page.tracking.trackPageView()
  window.location = new URL(`${SITE}/contact?x=2`)
  page.tracking.trackPageView()
  window.location = new URL(`${SITE}/`)
  page.tracking.trackPageView()
  await settle()
  assert.equal(page.tracked().length, 3)
  assert.deepEqual(page.posts.map((post) => new URL(post.body.event_source_url).pathname), ['/', '/contact', '/'])
})

test('trackOnce counts once per page, but an event dropped by consent can still go', async () => {
  const page = await visit(`${SITE}/growth`, { consent: null, cookies: FBP })
  page.tracking.trackOnce('Scroll50')
  localStorage.setItem('argo_cookie_consent', 'accepted')
  page.tracking.trackOnce('Scroll50')
  page.tracking.trackOnce('Scroll50')
  assert.equal(page.tracked().length, 1)
})

// ── fbp and fbc, read per event ─────────────────────────────────────────────

test('the first event waits for _fbp, which the Pixel sets after load', async () => {
  const page = await visit(`${SITE}/growth`)
  page.tracking.track('PageView')
  await settle(20)
  assert.equal(page.posts.length, 0, 'the server half is waiting')
  document.cookie = FBP
  await settle(150)
  assert.equal(page.posts.length, 1)
  assert.equal(page.posts[0].body.user_data.fbp, 'fb.1.1.111')
})

test('each event reads the cookies as they stand at that moment', async () => {
  const page = await visit(`${SITE}/growth`, { cookies: FBP })
  page.tracking.track('PageView')
  await settle()
  document.cookie = `_fbp=fb.1.1.222; _fbc=fb.1.5.click`
  page.tracking.track('Scroll50')
  await settle()
  assert.equal(page.posts[0].body.user_data.fbc, '')
  assert.deepEqual(page.posts[1].body.user_data, { fbc: 'fb.1.5.click', fbp: 'fb.1.1.222' })
})

test('a blocked Pixel stops the wait, and the event goes without fbp', async () => {
  const page = await visit(`${SITE}/growth`)
  page.tracking.track('PageView')
  page.scripts[0].dispatchEvent(new Event('error'))
  await settle(150)
  assert.equal(page.posts.length, 1)
  assert.equal(page.posts[0].body.user_data.fbp, '')
})

test('leaving the page stops the wait too, with the URL of the moment the event fired', async () => {
  const page = await visit(`${SITE}/growth`)
  page.tracking.track('PageView')
  window.location = new URL(`${SITE}/elsewhere`)
  window.dispatchEvent(new Event('pagehide'))
  await settle()
  assert.equal(page.posts.length, 1)
  assert.equal(page.posts[0].body.event_source_url, `${SITE}/growth`)
})

test('the wait has an end: the event goes without _fbp after two seconds', async () => {
  const page = await visit(`${SITE}/growth`)
  page.tracking.track('PageView')
  await settle(2200)
  assert.equal(page.posts.length, 1)
})

test('fbc: the cookie wins; without it, built from the last fbclid, in milliseconds', async () => {
  await visit(`${SITE}/growth?fbclid=abc`)
  const before = Date.now()
  const { fbc } = metaIds()
  assert.match(fbc, /^fb\.1\.\d{13}\.abc$/)
  assert.ok(Number(fbc.split('.')[2]) <= Date.now() && Number(fbc.split('.')[2]) >= before - 5000)
  assert.equal(metaIds().fbc, fbc, 'the same value on every event')

  document.cookie = '_fbc=fb.1.9.fromcookie'
  assert.equal(metaIds().fbc, 'fb.1.9.fromcookie')
})

// ── First touch ─────────────────────────────────────────────────────────────

test('first touch: the first campaign link of the session wins, across pages', async () => {
  const session = storage()
  await visit(`${SITE}/growth?utm_source=meta&utm_campaign=first&fbclid=one`, { session })
  assert.equal(getAttribution().utm_campaign, 'first')

  await visit(`${SITE}/growth?utm_source=google&utm_campaign=second&fbclid=two`, { session })
  const later = getAttribution()
  assert.equal(later.utm_source, 'meta')
  assert.equal(later.utm_campaign, 'first')
  assert.equal(later.fbclid, 'one', 'first touch for the CRM')
  assert.match(metaIds().fbc, /\.two$/, 'the latest click for Meta')

  await visit(`${SITE}/contact`, { session })
  assert.equal(getAttribution().utm_campaign, 'first', 'moving to another page keeps it')
})

test('a first visit with no campaign does not hide the ad click that follows', async () => {
  const session = storage()
  await visit(`${SITE}/`, { session })
  assert.equal(getAttribution().utm_source, '')
  await visit(`${SITE}/growth?utm_source=meta`, { session })
  assert.equal(getAttribution().utm_source, 'meta')
})

test('with session storage blocked it still remembers during the visit', async () => {
  const blocked = { getItem: () => { throw new Error('blocked') }, setItem: () => { throw new Error('blocked') }, removeItem: () => {} }
  await visit(`${SITE}/growth?utm_source=blocked`, { session: blocked })
  assert.equal(getAttribution().utm_source, 'blocked')
  window.location = new URL(`${SITE}/contact`)
  assert.equal(getAttribution().utm_source, 'blocked')
})

test('utmData keeps only the UTMs that have a value', () => {
  assert.deepEqual(utmData({ utm_source: 'meta', utm_term: '', fbclid: 'x', landed_at: 1 }), { utm_source: 'meta' })
})
