import assert from 'node:assert/strict'
import { test } from 'node:test'

import { htmlToMarkdown } from '../src/content/htmlToMarkdown.js'
import { llmsTxt, markdownFor } from '../src/content/markdown.js'
import { buildJsonLd, serializeJsonLd } from '../src/seo/jsonld.js'
import { canonicalFor, markdownPathFor, routes, SERVICE_PATHS, site } from '../src/site.js'
import { translations } from '../src/i18n.js'

// ── htmlToMarkdown ─────────────────────────────────────────────────────────

test('htmlToMarkdown converts headings, paragraphs and lists', () => {
  const markdown = htmlToMarkdown(
    '<section><h1>Title</h1><p>First.</p><h2>Sub</h2><ul><li>one</li><li>two</li></ul></section>',
  )
  assert.equal(markdown, '# Title\n\nFirst.\n\n## Sub\n\n- one\n- two')
})

test('htmlToMarkdown numbers ordered lists', () => {
  assert.equal(htmlToMarkdown('<ol><li>a</li><li>b</li></ol>'), '1. a\n2. b')
})

test('htmlToMarkdown keeps links', () => {
  assert.equal(
    htmlToMarkdown('<p>Mail <a href="mailto:info@groupargous.com" class="x">us</a>.</p>'),
    'Mail [us](mailto:info@groupargous.com).',
  )
})

test('htmlToMarkdown drops svg, script and button content', () => {
  assert.equal(
    htmlToMarkdown('<div><svg><path d="M0"/></svg><p>Kept</p><button>Accept</button></div>'),
    'Kept',
  )
})

test('htmlToMarkdown decodes entities and escapes markdown syntax', () => {
  assert.equal(htmlToMarkdown('<p>A &amp; B</p>'), 'A & B')
  assert.equal(htmlToMarkdown('<p>2 * 3 [x]</p>'), '2 \\* 3 \\[x\\]')
})

// ── page markdown ──────────────────────────────────────────────────────────

test('every route builds markdown with a title, summary and canonical URL', () => {
  for (const route of routes) {
    const markdown = markdownFor(route.path, { lang: 'en', html: '<h1>x</h1><p>body</p>' })
    assert.match(markdown, /^# /, `${route.path} must open with an H1`)
    assert.match(markdown, /\n> /, `${route.path} must carry a summary blockquote`)
    assert.ok(
      markdown.includes(`Canonical URL: ${canonicalFor(route.path)}`),
      `${route.path} must state its canonical URL`,
    )
    assert.ok(
      markdown.includes(`${site.origin}${markdownPathFor(route.path)}`),
      `${route.path} must link its own markdown URL`,
    )
    assert.ok(markdown.endsWith('\n'), `${route.path} markdown must end with a newline`)
  }
})

test('homepage markdown names the services and carries the FAQ, like the page', () => {
  const markdown = markdownFor('/')
  const t = translations.en

  t.services.items.forEach((service, index) => {
    assert.ok(markdown.includes(`[${service.title}](${canonicalFor(SERVICE_PATHS[index])})`), `missing link to: ${service.title}`)
  })
  for (const item of t.faq.items) {
    assert.ok(markdown.includes(item.q), `missing FAQ question: ${item.q}`)
    assert.ok(markdown.includes(item.a), `missing FAQ answer for: ${item.q}`)
  }
  assert.ok(markdown.length > 3000, 'homepage markdown should be substantial')
})

test('each service page markdown carries that service in full', () => {
  translations.en.services.items.forEach((service, index) => {
    const markdown = markdownFor(SERVICE_PATHS[index])
    for (const section of service.sections) {
      assert.ok(markdown.includes(section.heading), `missing section: ${section.heading}`)
      for (const item of section.items) {
        assert.ok(markdown.includes(item.name) && markdown.includes(item.desc), `missing item: ${item.name}`)
      }
    }
  })
})

test('markdownFor rejects unknown routes', () => {
  assert.throws(() => markdownFor('/nope'), /No metadata for route/)
})

// ── llms.txt ───────────────────────────────────────────────────────────────

test('llms.txt follows the llmstxt.org shape', () => {
  const text = llmsTxt('en')
  const lines = text.split('\n')

  assert.equal(lines[0], `# ${site.name}`, 'must start with a single H1')
  assert.match(lines[2], /^> /, 'the H1 must be followed by a blockquote summary')
  assert.ok(text.includes('## Pages'), 'must list pages under an H2')
  assert.match(text, /^- \[.+\]\(https:\/\/.+\): .+$/m, 'links must be "- [name](url): notes"')

  for (const route of routes.filter((entry) => entry.sitemap)) {
    assert.ok(
      text.includes(`${site.origin}${markdownPathFor(route.path)}`),
      `llms.txt must link ${route.path}`,
    )
  }
  assert.ok(!text.includes('/thank-you'), 'the post-conversion page is not an entry point')
})

// ── JSON-LD ────────────────────────────────────────────────────────────────

const typesOf = (doc) => doc['@graph'].flatMap((node) => node['@type'])

test('the homepage graph identifies the organization, the site and the FAQ', () => {
  const doc = buildJsonLd('/', translations.en.meta.pages['/'])

  assert.equal(doc['@context'], 'https://schema.org')
  const types = typesOf(doc)
  assert.ok(types.includes('Organization'))
  assert.ok(types.includes('WebSite'))
  assert.ok(types.includes('WebPage'))
  assert.ok(types.includes('FAQPage'))

  const organization = doc['@graph'][0]
  assert.equal(organization.name, site.name)
  assert.equal(organization.url, site.url)
  assert.equal(organization.email, site.email)
  assert.deepEqual(organization.sameAs, site.sameAs)
  assert.ok(organization.description.length > 0)

  const faq = doc['@graph'].find((node) => node['@type'] === 'FAQPage')
  assert.equal(faq.mainEntity.length, translations.en.faq.items.length)
  for (const question of faq.mainEntity) {
    assert.equal(question['@type'], 'Question')
    assert.equal(question.acceptedAnswer['@type'], 'Answer')
    assert.ok(question.acceptedAnswer.text.length > 0)
  }
})

test('every route builds a valid graph, and only the homepage carries the FAQ', () => {
  for (const route of routes) {
    const doc = buildJsonLd(route.path, translations.en.meta.pages[route.path])
    const page = doc['@graph'].find((node) => String(node['@id']).endsWith('#webpage'))

    assert.equal(page.url, canonicalFor(route.path), `${route.path} webpage url`)
    assert.equal(page.name, translations.en.meta.pages[route.path].title)
    assert.equal(
      typesOf(doc).includes('FAQPage'),
      route.path === '/',
      `${route.path} FAQ placement`,
    )
  }

  assert.equal(
    buildJsonLd('/contact', translations.en.meta.pages['/contact'])['@graph'][2]['@type'],
    'ContactPage',
  )
})

test('the Spanish graph uses Spanish copy', () => {
  const doc = buildJsonLd('/', translations.es.meta.pages['/'], 'es')
  assert.equal(doc['@graph'][0].description, translations.es.meta.description)
  const faq = doc['@graph'].find((node) => node['@type'] === 'FAQPage')
  assert.equal(faq.mainEntity[0].name, translations.es.faq.items[0].q)
})

test('serializeJsonLd escapes characters that could break out of a script tag', () => {
  const serialized = serializeJsonLd({ '@context': 'https://schema.org', name: '</script><b>&' })
  assert.ok(!serialized.includes('</script>'))
  assert.ok(!serialized.includes('<'))
  assert.ok(!serialized.includes('>'))
  assert.ok(!serialized.includes('&'))
  assert.equal(JSON.parse(serialized).name, '</script><b>&')
})
