// What the landings send (src/landing/shared/tracking.js), through one page
// load in a fake browser. Nothing here touches the network.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { pageEvent, startPageTracking, trackLead } from '../src/landing/shared/tracking.js'

const SITE = 'https://www.groupargous.com'
const settle = () => new Promise((resolve) => { setTimeout(resolve, 0) })

test('a landing load, with the country rule, the content name and the variant', async () => {
  const items = new Map()
  const local = { getItem: (key) => items.get(key) ?? null, setItem: (key, value) => items.set(key, value), removeItem: (key) => items.delete(key) }
  const win = new EventTarget()
  win.location = new URL(`${SITE}/growth?utm_source=meta&utm_term=&fbclid=abc`)
  win.localStorage = local
  win.sessionStorage = local
  win.scrollY = 0
  win.innerHeight = 100
  win.setTimeout = setTimeout
  win.clearTimeout = clearTimeout
  globalThis.window = win
  globalThis.localStorage = local
  const page = new EventTarget()
  Object.assign(page, {
    cookie: '_fbp=fb.1.1.111',
    referrer: '',
    documentElement: { scrollHeight: 1000 },
    createElement: () => new EventTarget(),
    getElementsByTagName: () => [{ parentNode: { insertBefore: () => {} } }],
  })
  globalThis.document = page
  const posts = []
  globalThis.fetch = async (path, init) => {
    if (path === '/api/geo') return new Response(JSON.stringify({ country: 'US' }), { status: 200 })
    posts.push(JSON.parse(init.body))
    return new Response(null, { status: 204 })
  }
  const tracked = () => [...win.fbq.queue].map((call) => [...call]).filter(([method]) => method.startsWith('track'))
  const expected = { content_name: 'growth', content_category: 'growth', variant: '1b' }

  // Nothing leaves until the country says the Pixel may run.
  const stop = startPageTracking({ contentName: 'growth', variant: '1b' })
  assert.equal(win.fbq, undefined)
  await settle()
  await settle()

  assert.deepEqual(tracked().map(([, name]) => name), ['PageView', 'ViewContent'])
  assert.deepEqual(tracked()[1][2], expected, 'ViewContent carries the landing and the variant apart')
  await settle()
  assert.deepEqual(posts.map((post) => post.event_name), ['PageView', 'ViewContent'])
  assert.deepEqual(posts[1].custom_data, expected)
  assert.equal(posts[1].event_id, tracked()[1][3].eventID, 'Pixel and server share the id')
  assert.equal(posts[0].event_source_url, win.location.href)

  // Below half the page: nothing. Past it: once, however much they scroll.
  win.dispatchEvent(new Event('scroll'))
  assert.equal(tracked().length, 2)
  win.scrollY = 600
  win.dispatchEvent(new Event('scroll'))
  win.dispatchEvent(new Event('scroll'))
  assert.deepEqual(tracked().map(([, name]) => name), ['PageView', 'ViewContent', 'Scroll50'])

  pageEvent('FormStart')
  pageEvent('FormStart')

  // WhatsApp, only on its links and once per page.
  const clickOn = (href) => {
    const event = new Event('click')
    const closest = (selector) => (selector.includes('https://wa.me/') && href.startsWith('https://wa.me/') ? {} : null)
    Object.defineProperty(event, 'target', { value: { closest } })
    page.dispatchEvent(event)
  }
  clickOn('https://example.com/')
  clickOn('https://wa.me/34685162838')
  clickOn('https://wa.me/34685162838')
  assert.deepEqual(tracked().slice(3).map(([, name]) => name), ['FormStart', 'Contact'])

  // The Lead: only the Pixel half from here, with the UTMs that have a value.
  await settle()
  const beforeLead = posts.length
  trackLead('6f1c2a3b-0000-4000-8000-000000000001')
  await settle()
  const [, name, data, options] = tracked().at(-1)
  assert.equal(name, 'Lead')
  assert.deepEqual(data, { ...expected, utm_source: 'meta' })
  assert.equal(options.eventID, '6f1c2a3b-0000-4000-8000-000000000001')
  assert.equal(posts.length, beforeLead, 'the server half comes from /api/lead')
  stop()
})
