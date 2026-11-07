// End-to-end checks of every public endpoint, run against scripts/serve.mjs —
// a local stand-in for the host that resolves static files the same way and
// runs server/markdown.js (server/worker.js on Cloudflare) in front of them.

import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { createSiteServer } from '../scripts/serve.mjs'
import { canonicalFor, markdownPathFor, routes, site } from '../src/site.js'

const BROWSER_ACCEPT = 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8'

let server
let origin

before(async () => {
  server = createSiteServer()
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve))
  origin = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((resolve) => server.close(resolve)))

const get = (path, headers = {}) => fetch(`${origin}${path}`, { headers, redirect: 'manual' })

const varyIncludesAccept = (response) =>
  (response.headers.get('vary') || '')
    .split(',')
    .map((value) => value.trim().toLowerCase())
    .includes('accept')

// ── HTML routes ────────────────────────────────────────────────────────────

test('every route answers 200 with HTML for a browser', async () => {
  for (const route of routes) {
    const response = await get(route.path, { accept: BROWSER_ACCEPT })
    assert.equal(response.status, 200, `${route.path} status`)
    assert.match(response.headers.get('content-type'), /^text\/html/, `${route.path} content-type`)

    const body = await response.text()
    assert.match(body, /<h1[\s>]/, `${route.path} must render an H1 server-side`)
    assert.ok(body.includes(canonicalFor(route.path)), `${route.path} canonical`)
  }
})

test('HTML responses vary on Accept and advertise their markdown alternate', async () => {
  for (const route of routes) {
    const response = await get(route.path, { accept: BROWSER_ACCEPT })
    assert.ok(varyIncludesAccept(response), `${route.path} must send Vary: Accept`)
    assert.ok(
      (response.headers.get('link') || '').includes(
        `<${site.origin}${markdownPathFor(route.path)}>; rel="alternate"; type="text/markdown"`,
      ),
      `${route.path} must advertise its markdown alternate in the Link header`,
    )
    await response.text()
  }
})

test('canonical URLs answer 200 directly, with no redirect hop', async () => {
  // A `<slug>/index.html` layout would make the host redirect /slug to /slug/, putting
  // a redirect on every canonical URL and sitemap entry. Guard against that.
  for (const route of routes) {
    const response = await get(route.path, { accept: BROWSER_ACCEPT })
    assert.equal(response.status, 200, `${canonicalFor(route.path)} must not redirect`)
    await response.text()
  }
})

test('a trailing slash redirects to the canonical URL', async () => {
  const response = await get('/contact/', { accept: BROWSER_ACCEPT })
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/contact')

  const followed = await get('/contact', { accept: BROWSER_ACCEPT })
  assert.equal(followed.status, 200)
  assert.match(await followed.text(), /Let&#x27;s talk|Let's talk/)
})

test('a redirect is passed through rather than answered with markdown', async () => {
  const response = await get('/contact/', { accept: 'text/markdown' })
  assert.equal(response.status, 301)
  assert.equal(response.headers.get('location'), '/contact')
  assert.ok(varyIncludesAccept(response), 'a negotiated redirect must still vary on Accept')
})

// ── acceptmarkdown.com ─────────────────────────────────────────────────────

test('Accept: text/markdown returns markdown, not HTML', async () => {
  for (const route of routes) {
    const response = await get(route.path, { accept: 'text/markdown' })

    assert.equal(response.status, 200, `${route.path} status`)
    assert.equal(
      response.headers.get('content-type'),
      'text/markdown; charset=utf-8',
      `${route.path} must return the markdown media type`,
    )
    assert.ok(varyIncludesAccept(response), `${route.path} must send Vary: Accept`)

    const body = await response.text()
    assert.match(body, /^# /, `${route.path} markdown must open with an H1`)
    assert.ok(!body.includes('<!doctype html>'), `${route.path} must not return the HTML shell`)
    assert.ok(body.includes(canonicalFor(route.path)), `${route.path} markdown canonical`)
  }
})

test('the Vary header names both Accept and Accept-Encoding', async () => {
  const response = await get('/', { accept: 'text/markdown' })
  assert.equal(response.headers.get('vary'), 'Accept, Accept-Encoding')
  await response.text()
})

test('markdown responses link back to the canonical HTML URL', async () => {
  const response = await get('/contact', { accept: 'text/markdown' })
  assert.ok((response.headers.get('link') || '').includes(`<${canonicalFor('/contact')}>; rel="canonical"`))
  await response.text()
})

test('text/x-markdown is honoured too', async () => {
  const response = await get('/', { accept: 'text/x-markdown' })
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  await response.text()
})

test('q-values decide the winner', async () => {
  const markdownWins = await get('/', { accept: 'text/html;q=0.5, text/markdown;q=0.9' })
  assert.match(markdownWins.headers.get('content-type'), /^text\/markdown/)
  await markdownWins.text()

  const htmlWins = await get('/', { accept: 'text/html, text/markdown;q=0.4' })
  assert.match(htmlWins.headers.get('content-type'), /^text\/html/)
  await htmlWins.text()

  const optedOut = await get('/', { accept: 'text/markdown;q=0, text/html' })
  assert.match(optedOut.headers.get('content-type'), /^text\/html/)
  await optedOut.text()
})

test('browsers and wildcard clients still get HTML', async () => {
  for (const accept of [BROWSER_ACCEPT, '*/*', 'text/*']) {
    const response = await get('/', { accept })
    assert.match(response.headers.get('content-type'), /^text\/html/, `Accept: ${accept}`)
    await response.text()
  }
})

test('HEAD negotiates the same way but sends no body', async () => {
  const response = await fetch(`${origin}/`, { method: 'HEAD', headers: { accept: 'text/markdown' } })
  assert.equal(response.status, 200)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.ok(varyIncludesAccept(response))
  assert.equal(await response.text(), '')
})

test('methods other than GET and HEAD pass straight through', async () => {
  const response = await fetch(`${origin}/`, {
    method: 'POST',
    headers: { accept: 'text/markdown' },
  })
  assert.match(response.headers.get('content-type'), /^text\/html/, 'POST must not negotiate')
  await response.text()
})

test('a markdown-only client gets 406 where no markdown representation exists', async () => {
  const response = await get('/404.html', { accept: 'text/markdown' })
  assert.equal(response.status, 406)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.ok((await response.text()).includes(`${site.origin}/llms.txt`))
})

test('the .md URLs are also reachable directly', async () => {
  for (const route of routes) {
    const response = await get(markdownPathFor(route.path))
    assert.equal(response.status, 200, `${markdownPathFor(route.path)} status`)
    assert.match(response.headers.get('content-type'), /^text\/markdown/)
    assert.match(await response.text(), /^# /)
  }
})

// ── 404s ───────────────────────────────────────────────────────────────────

test('nonexistent paths return a real 404, never the app shell', async () => {
  for (const path of ['/does-not-exist', '/blog/nope', '/contact/extra']) {
    const response = await get(path, { accept: BROWSER_ACCEPT })
    assert.equal(response.status, 404, `${path} must 404`)

    const body = await response.text()
    assert.ok(!body.includes('id="root"'), `${path} must not serve the app shell`)
  }
})

test('the 404 body points agents at the sitemap, llms.txt and site map', async () => {
  const body = await (await get('/does-not-exist', { accept: BROWSER_ACCEPT })).text()
  for (const pointer of ['/llms.txt', '/sitemap.xml', '/robots.txt', '/contact']) {
    assert.ok(body.includes(pointer), `404 body must mention ${pointer}`)
  }
  assert.ok(body.includes('# 404 - Page not found'), '404 body must embed a markdown recovery block')
})

test('a 404 negotiated as markdown returns markdown with a 404 status', async () => {
  const response = await get('/does-not-exist', { accept: 'text/markdown' })
  assert.equal(response.status, 404)
  assert.equal(response.headers.get('content-type'), 'text/markdown; charset=utf-8')
  assert.ok(varyIncludesAccept(response))

  const body = await response.text()
  assert.match(body, /^# 404 - Page not found/)
  assert.ok(body.includes(`${site.origin}/llms.txt`))
  assert.ok(body.includes(`${site.origin}/sitemap.xml`))
})

// ── machine-readable files ─────────────────────────────────────────────────

test('the machine-readable files are all served', async () => {
  const expectations = [
    ['/robots.txt', /^text\/plain/],
    ['/sitemap.xml', /^application\/xml/],
    ['/llms.txt', /^text\/plain/],
    ['/llms-full.txt', /^text\/plain/],
    ['/404.md', /^text\/markdown/],
    ['/agent-instructions.md', /^text\/markdown/],
  ]

  for (const [path, contentType] of expectations) {
    const response = await get(path)
    assert.equal(response.status, 200, `${path} status`)
    assert.match(response.headers.get('content-type'), contentType, `${path} content-type`)
    assert.ok((await response.text()).length > 0, `${path} body`)
  }
})

test('llms.txt and robots.txt both point at agent instructions that resolve', async () => {
  const llms = await (await get('/llms.txt')).text()
  const robots = await (await get('/robots.txt')).text()
  const path = `${site.origin}/agent-instructions.md`
  assert.ok(llms.includes(path), 'llms.txt must link the agent instructions')
  assert.ok(robots.includes(path), 'robots.txt must point at the agent instructions')

  const response = await get('/agent-instructions.md')
  assert.equal(response.status, 200)
  assert.match(response.headers.get('content-type'), /^text\/markdown/)
})

test('robots.txt advertises the sitemap that actually exists', async () => {
  const robots = await (await get('/robots.txt')).text()
  const match = robots.match(/^Sitemap: (.+)$/m)
  assert.ok(match, 'robots.txt must declare a sitemap')

  const sitemap = await get(new URL(match[1]).pathname)
  assert.equal(sitemap.status, 200)
  assert.match(await sitemap.text(), /<urlset/)
})

test('every URL listed in llms.txt resolves', async () => {
  const llms = await (await get('/llms.txt')).text()
  const urls = [...llms.matchAll(/\((https:\/\/[^)]+)\)/g)]
    .map((match) => match[1])
    .filter((url) => url.startsWith(site.origin))

  assert.ok(urls.length >= routes.filter((route) => route.sitemap).length)
  for (const url of urls) {
    const response = await get(new URL(url).pathname)
    assert.equal(response.status, 200, `${url} listed in llms.txt must resolve`)
    await response.text()
  }
})

test('every URL in sitemap.xml resolves with a 200', async () => {
  const sitemap = await (await get('/sitemap.xml')).text()
  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])

  for (const loc of locations) {
    const response = await get(new URL(loc).pathname, { accept: BROWSER_ACCEPT })
    assert.equal(response.status, 200, `${loc} must resolve`)
    await response.text()
  }
})
