// Checks for the /growth Meta Ads landing: variant resolution, lead scoring,
// the built pages (self-hosted fonts, no exits, kept out of search) and how
// they are served. Requires a build first; `npm test` runs one via `pretest`.

import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { after, before, test } from 'node:test'
import vm from 'node:vm'

import { createSiteServer } from '../scripts/serve.mjs'
import { about, finalCta, form, hero, method, VARIANT_KEYS, work } from '../src/landing/growth/copy.js'
import { cleanPhone, companyOrWebsite, emailType, normaliseWebsite } from '../src/landing/shared/fields.js'
import { CAPI_ENDPOINT, PIXEL_ID } from '../src/lib/tracking.js'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const read = (...parts) => readFileSync(join(ROOT, ...parts), 'utf8')

// ── Variant resolution (boot.js, inlined in <head>) ────────────────────────

const BOOT = read('src', 'landing', 'growth', 'boot.js')

/** Runs boot.js against a fake page; returns the variant it picked and the session store. */
function boot(search, session = {}) {
  const attributes = {}
  const store = { ...session }
  const storage = (backing) => ({
    getItem: (key) => (key in backing ? backing[key] : null),
    setItem: (key, value) => { backing[key] = String(value) },
  })
  vm.runInNewContext(BOOT, {
    URLSearchParams,
    window: { location: { search }, sessionStorage: storage(store), localStorage: storage({}), setTimeout: () => {} },
    document: {
      documentElement: {
        setAttribute: (name, value) => { attributes[name] = value },
        classList: { add: () => {}, remove: () => {} },
      },
    },
  })
  return { key: attributes['data-variant'], store }
}

test('each ad lands on its variant through utm_content', () => {
  const ads = {
    'g1-order': '1c',
    'g2-direction': '2',
    'g3-gaps': '1b',
    'g4-straight-answer': '1d',
    'g6-clinic': '3',
    'g7-leads-that-buy': '4b',
    'g8-cost-per-customer': '4a',
  }
  for (const [utm, key] of Object.entries(ads)) {
    assert.equal(boot(`?utm_content=${utm}`).key, key, utm)
  }
})

test('v and h pick the variant directly and win over utm_content', () => {
  assert.equal(boot('?v=1&h=a').key, '1a')
  assert.equal(boot('?v=1&h=d').key, '1d')
  assert.equal(boot('?v=2').key, '2')
  assert.equal(boot('?v=3&h=c').key, '3', 'single-headline variants ignore h')
  assert.equal(boot('?v=4&h=a').key, '4a')
  assert.equal(boot('?v=4').key, '4b', 'V4 defaults to h=b')
  assert.equal(boot('?v=1').key, '1b', 'V1 defaults to h=b')
  assert.equal(boot('?v=4&h=d').key, '4b', 'an h the variant lacks falls back')
  assert.equal(boot('?v=2&utm_content=g6-clinic').key, '2')
})

test('no parameters means V1 h=b, unknown values fall back, and the session remembers', () => {
  assert.equal(boot('').key, '1b')
  assert.equal(boot('?v=9&utm_content=nope').key, '1b')

  const first = boot('?utm_content=g6-clinic')
  assert.equal(first.store.argo_growth_variant, '3')
  assert.equal(boot('', first.store).key, '3', 'a reload without the query keeps the variant')
  assert.equal(boot('', { argo_growth_variant: '<script>' }).key, '1b', 'garbage in storage is ignored')
})

test('every variant has a headline and an open question; the rest is shared', () => {
  const covers = (options, key) => options.filter(([keys]) => keys.split(' ').includes(key)).length
  for (const key of VARIANT_KEYS) {
    assert.equal(covers(hero.headlines, key), 1, `${key} headline`)
    assert.ok(form.openQuestion[key], `${key} open question`)
  }
  assert.equal(typeof hero.subtitle, 'string')
  // The form has its own button; the final section keeps the one CTA.
  assert.equal(form.button, 'Start my free discovery call')
  assert.equal(finalCta.button, "Let's work together")
})

// ── Form fields ────────────────────────────────────────────────────────────

test('a website is accepted with or without https', () => {
  assert.equal(normaliseWebsite('acme.nl'), 'https://acme.nl')
  assert.equal(normaliseWebsite(' https://www.acme.no/ '), 'https://www.acme.no')
  assert.equal(normaliseWebsite('http://acme.nl/about'), 'http://acme.nl/about')
  assert.equal(normaliseWebsite('acme'), null)
  assert.equal(normaliseWebsite(''), null)
})

test('the company field takes a website or a company name', () => {
  assert.deepEqual(companyOrWebsite('acme.com'), { website: 'https://acme.com', company: null })
  assert.deepEqual(companyOrWebsite('https://acme.com/'), { website: 'https://acme.com', company: null })
  assert.deepEqual(companyOrWebsite(' Acme Clinic '), { website: null, company: 'Acme Clinic' })
  assert.deepEqual(companyOrWebsite('   '), { website: null, company: null })
})

test('only name, email, WhatsApp and the consent are required on the form', () => {
  const html = built['/growth']
  for (const name of ['name', 'email', 'whatsapp']) {
    assert.match(html, new RegExp(`id="f-${name}"[^>]*aria-required="true"`), `${name} is required`)
  }
  for (const name of ['website', 'open_answer']) {
    assert.doesNotMatch(html, new RegExp(`id="f-${name}"[^>]*aria-required`), `${name} is optional`)
  }
  assert.equal(html.match(/class="optional"/g)?.length, 2, 'the two optional fields say so')
  assert.equal(form.added.website, 'Company or website')
  assert.ok(!('detail' in form.errors), 'no minimum length for the open answer')
  const source = read('src', 'landing', 'growth', 'LeadForm.jsx')
  assert.match(source, /const REQUIRED = \['name', 'email', 'whatsapp', 'consent'\]/, 'the progress bar counts only those')
})

test('a WhatsApp number keeps only digits and its leading +', () => {
  assert.equal(cleanPhone('+31 6 1234 5678'), '+31612345678')
  assert.equal(cleanPhone('(47) 912-34-567'), '4791234567')
  assert.equal(cleanPhone(''), '')
})

test('email type separates free mailboxes from work domains', () => {
  assert.equal(emailType('anna@gmail.com'), 'free')
  assert.equal(emailType('Lars@Online.no'), 'free')
  assert.equal(emailType('anna@acme.nl'), 'work')
})

// ── Tracking: the site's Pixel, the server half on this domain ─────────────

test('Meta Pixel and CAPI point at the site Pixel and the own /api/event', () => {
  assert.equal(PIXEL_ID, '3872072809596261')
  assert.equal(CAPI_ENDPOINT, '/api/event')
})

// ── Built pages ────────────────────────────────────────────────────────────

const built = {
  '/growth': read('dist', 'growth.html'),
  '/growth/thank-you': read('dist', 'growth', 'thank-you.html'),
}

test('both pages are prerendered, noindex, and resolve the variant in <head>', () => {
  for (const [path, html] of Object.entries(built)) {
    assert.match(html, /<meta name="robots" content="noindex, nofollow" \/>/, `${path} noindex`)
    const head = html.slice(0, html.indexOf('</head>'))
    assert.ok(head.includes('argo_growth_variant'), `${path} boot script inlined in <head>`)
    assert.match(html, /<h1[\s>]/, `${path} H1`)
  }
  // Each headline word sits in its own span (it rises on its own), so compare text only.
  const text = built['/growth'].replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')
  for (const [, headline] of hero.headlines) assert.ok(text.includes(headline), `headline in HTML: ${headline}`)
})

test('fonts are self-hosted: nothing is loaded from Google Fonts', () => {
  const assets = readdirSync(join(ROOT, 'dist', 'assets')).filter((file) => file.startsWith('growth-'))
  for (const source of [...Object.values(built), ...assets.map((file) => read('dist', 'assets', file))]) {
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(source))
  }
  assert.match(built['/growth'], /\/fonts\/cormorant-garamond-latin-600-normal\.woff2/)
  assert.match(built['/growth'], /\/fonts\/dm-sans-latin-wght-normal\.woff2/)
})

test('the only ways out are the form, WhatsApp, email, Privacy and Terms', () => {
  const allowed = [
    /^#form$/,
    /^https:\/\/wa\.me\/34685162838\?text=/,
    /^mailto:info@groupargous\.com$/,
    /^https:\/\/www\.groupargous\.com\/(privacy-policy|terms-of-service)$/,
  ]
  for (const [path, html] of Object.entries(built)) {
    const body = html.slice(html.indexOf('<body'))
    const hrefs = [...body.matchAll(/<a\b[^>]*href="([^"]*)"/g)].map((match) => match[1].replace(/&amp;/g, '&'))
    assert.ok(hrefs.length > 0, path)
    for (const href of hrefs) assert.ok(allowed.some((pattern) => pattern.test(href)), `${path} links to ${href}`)
    assert.ok(!/<nav[\s>]/.test(body), `${path} has no menu`)
  }
})

test('the page follows the five-part structure, with the form straight after the hero', () => {
  const html = built['/growth']
  const order = ['id="hero"', 'id="form"', 'id="work-title"', 'id="method-title"', 'id="about-title"', 'id="final-title"']
  const positions = order.map((marker) => html.indexOf(marker))
  assert.ok(positions.every((at) => at > 0), `all sections present: ${positions}`)
  assert.deepEqual([...positions].sort((a, b) => a - b), positions, 'sections in order')

  assert.equal(hero.points.length, 3)
  assert.equal(work.items.length, 5)
  assert.equal(method.steps.length, 4)
  assert.equal(about.rows.length, 4)
  assert.equal(html.match(/<form\b/g).length, 1, 'one form on the page')
  // Nothing under the form's button: the brief asks for none.
  assert.ok(!html.includes("We'll get in touch to set up your call"))
  assert.ok(!html.includes('No cost. No sales deck.'))
})

test('wide screens keep the brief hero; phones and portrait tablets get the shorter one', () => {
  const html = built['/growth']
  const heroHtml = html.slice(html.indexOf('id="hero"'), html.indexOf('</section>', html.indexOf('id="hero"')))
  const text = (part) => part.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/\s+/g, ' ')
  // Wide: the brief's eyebrow, subtitle and points, the 1b gold sentence in the headline.
  assert.match(heroHtml, /<span class="only-wide">ARGO · YOUR GROWTH PARTNER FOR DIGITAL MARKETING<\/span>/)
  assert.ok(heroHtml.includes(`<p class="hero-sub only-wide">${hero.subtitle.replace(/'/g, '&#x27;')}</p>`), 'brief subtitle, wide only')
  assert.match(heroHtml, /<ul class="points only-wide">/, 'points in the hero, wide only')
  assert.match(heroHtml, /<span class="only-wide"><span class="w gold"/, '1b gold sentence in the headline, wide only')
  // Narrow: shorter eyebrow and subtitle, a button down to the form, the WhatsApp link.
  for (const line of [hero.narrow.eyebrow, hero.narrow.subtitle, hero.narrow.button, hero.narrow.note, hero.narrow.whatsapp]) {
    assert.ok(text(heroHtml).includes(line), `in the hero: ${line}`)
  }
  assert.match(heroHtml, /class="hero-cta only-narrow"><a class="btn btn-boom" href="#form">/, 'the button goes down to the form')
  assert.match(html, /class="form-intro only-narrow"><p class="moved-line">Not three suppliers and a gap between them\.<\/p><ul class="points">/, 'gold sentence and points above the form')
})

test('the thank-you page: shared design, styles inlined, the new first step', () => {
  const html = built['/growth/thank-you']
  assert.ok(!/<link rel="stylesheet"/.test(html), 'no stylesheet request: thank-you.css is inside the inlined one')
  assert.ok(html.includes('class="seal"') && html.includes('thanks-halo'), 'markup and styles of shared/ThankYou')
  assert.equal(html.match(/class="journey-num"/g)?.length, 3, 'three steps')
  assert.ok(!html.includes('thanks-ready') && !html.includes('Useful to have ready'), 'no "useful to have ready" box')
  assert.ok(html.includes('We review what you sent us.'), 'step 1 no longer promises a website review')
})

test('the optional Meta box is never in the prerendered page: the browser adds it only without consent', () => {
  assert.ok(!built['/growth'].includes('meta_consent'), 'not rendered on the server')
  assert.ok(built['/growth'].includes('name="consent"'), 'the required consent is')
  assert.match(form.added.metaConsent, /^Optional:/)
})

test('the landing stays out of the sitemap and llms.txt', () => {
  assert.ok(!read('dist', 'sitemap.xml').includes('/growth'))
  assert.ok(!read('dist', 'llms.txt').includes('/growth'))
})

test('banned words and claims appear nowhere in the landing', () => {
  // Assembled from parts so that searching the project for them stays clean.
  const banned = [
    ['writ', 'ten'], ['summ', 'ary'], ['30-min', 'ute'], ['one working ', 'day'],
    ['minimum ', 'contract'], ['2-day ', 'diagnosis'], ['PRU', 'EBA'], ['CONFIR', 'MAR'],
    ['unl', 'ock'], ['superch', 'arge'], ['game-ch', 'anger'], ['seam', 'less'],
    ['cutting-', 'edge'], ['predictable ', 'revenue'], ['dedicated account ', 'manager'],
  ].map((parts) => parts.join(''))

  const dir = join(ROOT, 'src', 'landing', 'growth')
  const sources = {
    ...Object.fromEntries(readdirSync(dir).map((file) => [file, read('src', 'landing', 'growth', file)])),
    'growth.html': read('growth.html'),
    'dist/growth.html': built['/growth'],
    'dist/growth/thank-you.html': built['/growth/thank-you'],
  }
  for (const [file, source] of Object.entries(sources)) {
    for (const word of banned) assert.ok(!source.toLowerCase().includes(word.toLowerCase()), `${file} contains "${word}"`)
  }

  // "account manager" only where the client's own copy has it.
  const accountManager = 'account ' + 'manager'
  const allowed = [about.rows[1][1]]
  assert.ok(allowed.every((line) => line.includes(accountManager)))
  const elsewhere = read('src', 'landing', 'growth', 'copy.js').split('\n')
    .filter((line) => line.includes(accountManager) && !allowed.some((text) => line.includes(text)))
  assert.deepEqual(elsewhere, [])
})

// ── Served like the host serves it ──────────────────────────────────────────

let server
let origin

before(async () => {
  server = createSiteServer()
  await new Promise((done) => server.listen(0, '127.0.0.1', done))
  origin = `http://127.0.0.1:${server.address().port}`
})

after(() => new Promise((done) => server.close(done)))

test('/growth and /growth/thank-you answer 200 directly, with no redirect', async () => {
  for (const path of ['/growth', '/growth?utm_content=g2-direction', '/growth/thank-you?v=1&h=b']) {
    const response = await fetch(`${origin}${path}`, { redirect: 'manual', headers: { accept: 'text/html' } })
    assert.equal(response.status, 200, path)
    assert.match(response.headers.get('content-type'), /^text\/html/, path)
  }
})
