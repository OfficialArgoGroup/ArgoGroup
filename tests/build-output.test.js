// Checks the artefacts scripts/prerender.mjs writes into dist/. Requires a
// build first; `npm test` runs one via the `pretest` script.

import assert from 'node:assert/strict'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { test } from 'node:test'

import { canonicalFor, markdownPathFor, routes, site } from '../src/site.js'
import { translations } from '../src/i18n.js'

const DIST = resolve(dirname(fileURLToPath(import.meta.url)), '..', 'dist')

if (!existsSync(join(DIST, 'index.html'))) {
  throw new Error('dist/ is missing — run `npm run build` before the tests')
}

const read = (relative) => readFileSync(join(DIST, relative), 'utf8')

// Flat `<slug>.html`, so the host serves the canonical URL directly rather than
// redirecting /slug to /slug/.
const htmlFor = (path) => read(path === '/' ? 'index.html' : `${path.slice(1)}.html`)

test('the Search Console verification tag survives prerendering', () => {
  // Google re-checks this periodically; losing it silently un-verifies the
  // property and stops the sitemap being read.
  for (const route of routes) {
    assert.match(
      htmlFor(route.path),
      /<meta name="google-site-verification" content="[\w-]+" \/>/,
      `${route.path} must keep the verification tag`,
    )
  }
})

const ENTITIES = { amp: '&', lt: '<', gt: '>', quot: '"', '#x27': "'", '#39': "'", nbsp: ' ' }

// Approximates what a crawler that does not execute JavaScript can read.
const visibleText = (html) => html
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&(#x?[0-9a-fA-F]+|[a-zA-Z]+);/g, (match, name) => ENTITIES[name] ?? match)
  .replace(/\s+/g, ' ')
  .trim()

const jsonLdOf = (html) => {
  const match = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)
  assert.ok(match, 'page must carry a JSON-LD block')
  return JSON.parse(match[1])
}

// ── 1. Content without JavaScript ──────────────────────────────────────────

test('every route is prerendered to a real HTML file', () => {
  for (const route of routes) {
    assert.doesNotThrow(() => htmlFor(route.path), `${route.path} must exist as static HTML`)
  }
})

test('the homepage carries an H1 and 500+ characters of text without JavaScript', () => {
  const html = htmlFor('/')
  assert.match(html, /<h1[\s>]/, 'homepage must have an H1 in the raw HTML')
  assert.ok(
    visibleText(html).length >= 500,
    `homepage raw text is ${visibleText(html).length} chars, expected at least 500`,
  )
})

test('every prerendered route has a heading and real body copy', () => {
  for (const route of routes) {
    const html = htmlFor(route.path)
    assert.match(html, /<h1[\s>]/, `${route.path} must have an H1`)
    assert.ok(visibleText(html).length >= 200, `${route.path} must have body copy in raw HTML`)
  }
})

// The pages agents check to decide a business is real before recommending it.
const TRUST_ANCHORS = ['/about', '/contact', '/privacy-policy']

test('every trust anchor page carries 500+ characters of its own content', () => {
  for (const path of TRUST_ANCHORS) {
    const length = visibleText(htmlFor(path)).length
    assert.ok(length >= 500, `${path} has ${length} chars of raw text, expected at least 500`)
  }
})

test('the about page states who, what and where in the raw HTML', () => {
  const text = visibleText(htmlFor('/about'))
  for (const fragment of ['Barcelona', 'Miami', 'digital marketing', 'English and Spanish']) {
    assert.ok(text.includes(fragment), `/about must mention ${fragment}`)
  }
  assert.match(htmlFor('/about'), /"@type": "AboutPage"/, '/about must be typed as AboutPage in JSON-LD')
})

test('the about page is reachable from every other page', () => {
  // A trust anchor nothing links to is one agents will not find.
  for (const route of routes.filter((r) => r.path !== '/thank-you')) {
    assert.match(htmlFor(route.path), /href="\/about"/, `${route.path} must link to /about`)
  }
})

test('agent-instructions.md names best-fit jobs and how to make contact', () => {
  const instructions = read('agent-instructions.md')
  assert.match(instructions, /^# .+agent instructions$/m)
  for (const heading of ['## When to use', '## Outside the listed service lines', '## How to make contact']) {
    assert.ok(instructions.includes(heading), `agent-instructions.md must have a "${heading}" section`)
  }
  assert.ok(instructions.includes(site.email), 'must give an email address')
  assert.ok(instructions.includes(canonicalFor('/contact')), 'must link the contact form')
  // Generic marketing copy does not read as guidance: require named platforms.
  for (const specific of ['HubSpot', 'Pipedrive', 'n8n', 'Make', 'LinkedIn Ads']) {
    assert.ok(instructions.includes(specific), `must name ${specific} as a concrete fit signal`)
  }
})

test('llms.txt carries when-to-use guidance and stays within the llmstxt.org shape', () => {
  const llms = read('llms.txt')
  assert.ok(llms.includes('**When to use this provider.**'), 'llms.txt must say when to use the provider')
  assert.ok(llms.includes('/agent-instructions.md'), 'llms.txt must link the full agent instructions')

  // llmstxt.org: H1, optional blockquote, free-form markdown with no headings,
  // then `##` sections of links. Anything between the blockquote and the first
  // `##` must therefore stay heading-free.
  const lines = llms.split('\n')
  assert.match(lines[0], /^# /, 'must open with an H1')
  const firstSection = lines.findIndex((line) => line.startsWith('## '))
  const freeForm = lines.slice(1, firstSection === -1 ? lines.length : firstSection)
  for (const line of freeForm) {
    assert.ok(!/^#{1,6} /.test(line), `free-form area must not contain a heading: ${line}`)
  }
})

test('the homepage renders its service and FAQ copy into the raw HTML', () => {
  const text = visibleText(htmlFor('/'))
  for (const service of translations.en.services.items) {
    assert.ok(text.includes(service.title), `raw HTML is missing service: ${service.title}`)
  }
  assert.ok(text.includes(translations.en.faq.items[0].q), 'raw HTML is missing the FAQ')
})

test('the app still mounts on a root node with the prerendered markup inside', () => {
  const html = htmlFor('/')
  assert.match(html, /<div id="root"><div class="min-h-screen/, 'markup must be inside #root')
  assert.match(html, /<script type="module"[^>]*src="\/assets\/index-[^"]+\.js"/, 'client bundle must still load')
})

test('reveal animations are neutralised when JavaScript is unavailable', () => {
  const html = htmlFor('/')
  assert.match(html, /<noscript>[\s\S]*\[data-reveal\][\s\S]*<\/noscript>/, 'noscript reveal rule missing')
  assert.match(html, /data-reveal=""/, 'reveal elements must be tagged')
})

// ── 2. Head metadata ───────────────────────────────────────────────────────

test('each route has exactly one title, description and canonical, and they are its own', () => {
  for (const route of routes) {
    const html = htmlFor(route.path)
    const meta = translations.en.meta.pages[route.path]

    assert.equal((html.match(/<title[\s>]/g) || []).length, 1, `${route.path} title count`)
    assert.equal((html.match(/name="description"/g) || []).length, 1, `${route.path} description count`)
    assert.equal((html.match(/rel="canonical"/g) || []).length, 1, `${route.path} canonical count`)

    assert.ok(html.includes(`href="${canonicalFor(route.path)}"`), `${route.path} canonical target`)
    assert.ok(
      html.includes(meta.description),
      `${route.path} must use its own description`,
    )
    assert.ok(
      html.includes(meta.title.replace(/&/g, '&amp;')),
      `${route.path} must use its own title`,
    )
  }
})

test('each route advertises its markdown alternate', () => {
  for (const route of routes) {
    assert.ok(
      htmlFor(route.path).includes(
        `<link rel="alternate" type="text/markdown" href="${site.origin}${markdownPathFor(route.path)}"/>`,
      ),
      `${route.path} must link its markdown twin`,
    )
  }
})

// ── 5. JSON-LD structured data ─────────────────────────────────────────────

test('the homepage ships an Organization, WebSite, WebPage and FAQPage graph', () => {
  const doc = jsonLdOf(htmlFor('/'))
  const types = doc['@graph'].flatMap((node) => node['@type'])

  assert.equal(doc['@context'], 'https://schema.org')
  for (const expected of ['Organization', 'WebSite', 'WebPage', 'FAQPage']) {
    assert.ok(types.includes(expected), `homepage JSON-LD is missing ${expected}`)
  }

  const organization = doc['@graph'][0]
  assert.equal(organization.name, site.name)
  assert.equal(organization.url, site.url)
  assert.ok(organization.description)
  assert.deepEqual(organization.sameAs, site.sameAs)
})

test('every route ships parseable JSON-LD pointing at its own URL', () => {
  for (const route of routes) {
    const doc = jsonLdOf(htmlFor(route.path))
    const page = doc['@graph'].find((node) => String(node['@id']).endsWith('#webpage'))
    assert.equal(page.url, canonicalFor(route.path), `${route.path} JSON-LD url`)
  }
})

// ── 3. Markdown variants ───────────────────────────────────────────────────

test('every route has a markdown twin with a heading and its canonical URL', () => {
  for (const route of routes) {
    const markdown = read(markdownPathFor(route.path).slice(1))
    assert.match(markdown, /^# .+/, `${markdownPathFor(route.path)} must start with an H1`)
    assert.ok(
      markdown.includes(canonicalFor(route.path)),
      `${markdownPathFor(route.path)} must state its canonical URL`,
    )
    assert.ok(markdown.length > 200, `${markdownPathFor(route.path)} must have content`)
  }
})

test('legal markdown is generated from the rendered page, not a stub', () => {
  const privacy = read('privacy-policy.md')
  assert.ok(privacy.includes('## 1. Who We Are'), 'privacy policy sections must be converted')
  assert.ok(privacy.includes('GDPR'), 'privacy policy body must be present')
  assert.ok(read('terms-of-service.md').includes('## 2. These Terms and Your Agreement'))
})

// ── 4. Machine-readable index ──────────────────────────────────────────────

test('sitemap.xml lists the indexable routes and nothing else', () => {
  const sitemap = read('sitemap.xml')
  assert.match(sitemap, /^<\?xml version="1\.0" encoding="UTF-8"\?>/)
  assert.ok(sitemap.includes('http://www.sitemaps.org/schemas/sitemap/0.9'))

  const locations = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) => match[1])
  assert.deepEqual(
    locations,
    routes.filter((route) => route.sitemap).map((route) => canonicalFor(route.path)),
  )
  assert.ok(!locations.some((loc) => loc.endsWith('/thank-you')))
  for (const lastmod of [...sitemap.matchAll(/<lastmod>([^<]+)<\/lastmod>/g)]) {
    assert.match(lastmod[1], /^\d{4}-\d{2}-\d{2}$/)
  }
})

test('robots.txt allows crawling and points at the sitemap', () => {
  const robots = read('robots.txt')
  assert.match(robots, /^User-agent: \*$/m)
  assert.match(robots, /^Allow: \/$/m)
  assert.ok(robots.includes(`Sitemap: ${site.origin}/sitemap.xml`))
  assert.ok(!/^Disallow: \/$/m.test(robots), 'the site must not be blocked')
})

test('llms.txt and llms-full.txt are published', () => {
  assert.match(read('llms.txt'), /^# Group ARGO\n\n> /)
  const full = read('llms-full.txt')
  for (const route of routes) {
    assert.ok(full.includes(canonicalFor(route.path)), `llms-full.txt must include ${route.path}`)
  }
})

// ── 404 ────────────────────────────────────────────────────────────────────

test('404.html is a real page that hands agents somewhere to go', () => {
  const html = read('404.html')
  assert.match(html, /<meta name="robots" content="noindex, follow"/)
  assert.match(html, /<h1>404 - Page not found<\/h1>/)

  const text = visibleText(html)
  for (const pointer of ['/llms.txt', '/sitemap.xml', '/contact', '/robots.txt']) {
    assert.ok(text.includes(pointer), `404 page must point at ${pointer}`)
  }
  // The markdown recovery block is rendered into the page itself, so an agent
  // sees it even when it did not negotiate for markdown.
  assert.ok(text.includes('# 404 - Page not found'), '404 page must embed its markdown body')
  assert.ok(text.includes('## Where to look next'))
})

test('404.md is the same recovery information as markdown', () => {
  const markdown = read('404.md')
  assert.match(markdown, /^# 404 - Page not found\n\n> /)
  assert.ok(markdown.includes(`${site.origin}/llms.txt`))
  assert.ok(markdown.includes(`${site.origin}/sitemap.xml`))
  assert.ok(markdown.includes(canonicalFor('/contact')))
})
