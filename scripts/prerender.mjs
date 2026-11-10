// Post-build step: turn the Vite SPA shell into real static HTML for every
// route, plus the machine-readable surface agents look for (markdown variants,
// sitemap, robots.txt, llms.txt) and an agent-recoverable 404 page.
//
// Runs after `vite build` (client bundle) and `vite build --ssr` (server bundle).

import { mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath, pathToFileURL } from 'node:url'

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..')
const DIST = join(ROOT, 'dist')
const SSR_ENTRY = join(ROOT, 'dist-ssr', 'entry-server.js')

const load = (...segments) => import(pathToFileURL(join(ROOT, ...segments)).href)

const { renderRoute, renderPageBody } = await import(pathToFileURL(SSR_ENTRY).href)
const { site, routes, canonicalFor, markdownPathFor } = await load('src', 'site.js')
const { markdownFor, llmsTxt, llmsFullTxt, agentInstructions } = await load('src', 'content', 'markdown.js')

const HEAD_START = '<!--head-start-->'
const HEAD_END = '<!--head-end-->'
const APP_HTML = '<!--app-html-->'

const template = readFileSync(join(DIST, 'index.html'), 'utf8')
for (const marker of [HEAD_START, HEAD_END, APP_HTML]) {
  if (!template.includes(marker)) throw new Error(`index.html is missing the ${marker} marker`)
}

const outputs = []

function write(relative, contents) {
  const target = join(DIST, relative)
  mkdirSync(dirname(target), { recursive: true })
  writeFileSync(target, contents, 'utf8')
  outputs.push(`${relative} (${Buffer.byteLength(contents, 'utf8')} bytes)`)
}

// React 19 hoists document metadata (<title>, <meta>, <link>) rendered anywhere
// in the tree to the very front of the renderToString output. Split that prefix
// off so it can go in <head> where crawlers expect it; the rest — including the
// application/ld+json script, which React does not hoist — stays in #root and is
// what the client hydrates.
const HOISTED_HEAD = /^(?:<title[^>]*>[\s\S]*?<\/title>|<meta\b[^>]*?\/?>|<link\b[^>]*?\/?>)+/

function splitHoistedHead(html) {
  const match = html.match(HOISTED_HEAD)
  if (!match) throw new Error('SSR output has no hoisted <head> tags — is <SEO /> still rendered?')
  return { head: match[0], body: html.slice(match[0].length) }
}

function renderHtml(path) {
  const { head, body } = splitHoistedHead(renderRoute(path).html)
  const headStart = template.indexOf(HEAD_START)
  const headEnd = template.indexOf(HEAD_END) + HEAD_END.length

  // Function replacements: rendered markup may legitimately contain "$&".
  return (template.slice(0, headStart) + head + template.slice(headEnd))
    .replace(APP_HTML, () => body)
}

// ── HTML + markdown for every route ────────────────────────────────────────
const documents = []

for (const route of routes) {
  // `<slug>.html`, not `<slug>/index.html`: the host serves the former directly
  // at /slug with a 200, while the latter makes /slug a 301 to /slug/ — which
  // would put a redirect on every canonical URL and every sitemap entry.
  write(route.path === '/' ? 'index.html' : `${route.slug}.html`, renderHtml(route.path))

  const markdown = markdownFor(route.path, { lang: 'en', html: renderPageBody(route.path) })
  write(markdownPathFor(route.path).slice(1), markdown)
  documents.push({ path: route.path, markdown })
}

// ── Meta Ads landings: /growth and /systems ────────────────────────────────
// Each has its own shell (<name>.html): no site chrome, no Google Fonts,
// noindex, and deliberately absent from `routes`, so it stays out of the
// sitemap, llms.txt and the markdown mirror. Its boot script is inlined so
// the page is right at first paint (growth: the ad variant; both: motion and
// the cookie choice).
{
  const { renderLanding } = await import(pathToFileURL(SSR_ENTRY).href)
  const attr = (value) => value.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;')

  for (const name of ['growth', 'systems']) {
    const { COPY } = await load('src', 'landing', name, 'copy.js')
    // The stylesheet is small; inlining it saves a render-blocking round trip
    // on the mobile connections the ads send people in on.
    const template = readFileSync(join(DIST, `${name}.html`), 'utf8')
      .replace(new RegExp(`<link rel="stylesheet"[^>]*href="(/assets/${name}-[^"]+\\.css)">`), (_, href) =>
        `<style>${readFileSync(join(DIST, href), 'utf8').trim()}</style>`)
    const boot = readFileSync(join(ROOT, 'src', 'landing', name, 'boot.js'), 'utf8')
      .replace(/^\/\/.*\n/gm, '')
      .trim()

    for (const marker of ['<!--landing-head-->', '<!--landing-boot-->', APP_HTML]) {
      if (!template.includes(marker)) throw new Error(`${name}.html is missing the ${marker} marker`)
    }
    if (!template.includes('<style>')) throw new Error(`${name}.html: stylesheet not found to inline`)

    // English at /<name>, Spanish at /<name>/es (src/landing/shared/lang.js).
    const pages = [
      { path: `/${name}`, file: `${name}.html`, lang: 'en', ...COPY.en.meta.landing },
      { path: `/${name}/thank-you`, file: `${name}/thank-you.html`, lang: 'en', ...COPY.en.meta.thankYou },
      { path: `/${name}/es`, file: `${name}/es.html`, lang: 'es', ...COPY.es.meta.landing },
      { path: `/${name}/es/thank-you`, file: `${name}/es/thank-you.html`, lang: 'es', ...COPY.es.meta.thankYou },
    ]
    if (!template.includes('<html lang="en"')) throw new Error(`${name}.html: <html lang="en"> not found`)
    for (const page of pages) {
      write(page.file, template
        .replace('<html lang="en"', () => `<html lang="${page.lang}"`)
        .replace('<!--landing-head-->', () => `<title>${attr(page.title)}</title>\n    <meta name="description" content="${attr(page.description)}" />`)
        .replace('<!--landing-boot-->', () => `<script>${boot}</script>`)
        .replace(APP_HTML, () => renderLanding(page.path)))
    }
  }
}

// ── sitemap.xml ────────────────────────────────────────────────────────────
const lastmod = new Date().toISOString().slice(0, 10)

write('sitemap.xml', [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
  ...routes.filter((route) => route.sitemap).map((route) => [
    '  <url>',
    `    <loc>${canonicalFor(route.path)}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${route.changefreq}</changefreq>`,
    `    <priority>${route.priority}</priority>`,
    '  </url>',
  ].join('\n')),
  '</urlset>',
  '',
].join('\n'))

// ── robots.txt ─────────────────────────────────────────────────────────────
write('robots.txt', [
  '# https://www.robotstxt.org/robotstxt.html',
  'User-agent: *',
  'Allow: /',
  '',
  '# AI and agent crawlers are welcome. A markdown mirror of every page is',
  '# listed in /llms.txt, and the HTML URLs answer Accept: text/markdown.',
  '# When to use this provider and how to make contact:',
  `# ${site.origin}/agent-instructions.md`,
  '',
  `Sitemap: ${site.origin}/sitemap.xml`,
  '',
].join('\n'))

// ── llms.txt / llms-full.txt ───────────────────────────────────────────────
write('agent-instructions.md', agentInstructions('en'))
write('llms.txt', llmsTxt('en'))
write('llms-full.txt', llmsFullTxt(documents))

// ── 404 ────────────────────────────────────────────────────────────────────
const notFoundMarkdown = [
  '# 404 - Page not found',
  '',
  `> That path does not exist on ${site.origin}. Nothing was moved; the URL is simply not a page on this site.`,
  '',
  '## Where to look next',
  '',
  `- [Home](${canonicalFor('/')}) - what ${site.name} does`,
  `- [About](${canonicalFor('/about')}) - who ${site.name} is, offices, and how it works`,
  `- [Contact](${canonicalFor('/contact')}) - reach the team, reply within 24 hours`,
  `- [Privacy Policy](${canonicalFor('/privacy-policy')})`,
  `- [Cookie Policy](${canonicalFor('/cookie-policy')})`,
  `- [Terms of Service](${canonicalFor('/terms-of-service')})`,
  '',
  '## Machine-readable index',
  '',
  `- [/agent-instructions.md](${site.origin}/agent-instructions.md) - when to use this provider and how to make contact`,
  `- [/llms.txt](${site.origin}/llms.txt) - every page, with a one-line description`,
  `- [/llms-full.txt](${site.origin}/llms-full.txt) - the whole site as one markdown document`,
  `- [/sitemap.xml](${site.origin}/sitemap.xml) - every indexable URL`,
  `- [/robots.txt](${site.origin}/robots.txt) - crawler policy`,
  '',
  'Every HTML page also answers with markdown when requested with the',
  'Accept: text/markdown header, and each has a .md twin listed in /llms.txt.',
  '',
].join('\n')

write('404.md', notFoundMarkdown)

const escapeHtml = (value) => value
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')

write('404.html', `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, follow" />
    <title>404 - Page not found | ${site.name}</title>
    <meta name="description" content="That path does not exist on ${site.origin}. Use the page list, sitemap or llms.txt below to find the right URL." />
    <link rel="alternate" type="text/markdown" href="${site.origin}/404.md" />
    <link rel="icon" href="/argo-favicon.ico?v=2" sizes="48x48">
    <link rel="icon" href="/argo-icon.svg?v=2" type="image/svg+xml">
    <link rel="apple-touch-icon" href="/argo-apple-touch-icon.png?v=2">
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; background: #0d0d0d; color: #f2ede4; font-family: Inter, system-ui, sans-serif; }
      main { max-width: 44rem; margin: 0 auto; padding: 6rem 1.5rem; }
      h1 { font-family: "Playfair Display", Georgia, Cambria, serif; font-size: clamp(2.25rem, 6vw, 3rem); font-weight: 700; margin: 0 0 1rem; }
      h2 { font-family: "Playfair Display", Georgia, Cambria, serif; font-size: 1.25rem; margin: 2.5rem 0 0.75rem; }
      .rule { width: 4rem; height: 1px; background: #d4af37; margin-bottom: 1.5rem; }
      p { color: #a39f98; line-height: 1.7; }
      ul { padding-left: 1.1rem; color: #a39f98; line-height: 1.9; }
      a { color: #d4af37; }
      pre { background: #1a1a1a; border: 1px solid #262626; border-radius: 2px; padding: 1.25rem; overflow-x: auto; color: #a39f98; font-size: 0.8125rem; line-height: 1.7; white-space: pre-wrap; }
      .btn { display: inline-block; margin-top: 2rem; background: #d4af37; color: #0d0d0d; font-weight: 600; font-size: 0.8rem; letter-spacing: 0.16em; text-transform: uppercase; padding: 0.9rem 1.6rem; border-radius: 2px; text-decoration: none; }
    </style>
  </head>
  <body>
    <main>
      <h1>404 - Page not found</h1>
      <div class="rule"></div>
      <p>That path does not exist on ${site.origin}. Nothing was moved; the URL is simply not a page on this site.</p>

      <h2>Where to look next</h2>
      <ul>
        <li><a href="/">Home</a> - what ${site.name} does</li>
        <li><a href="/contact">Contact</a> - reach the team, reply within 24 hours</li>
        <li><a href="/privacy-policy">Privacy Policy</a></li>
        <li><a href="/cookie-policy">Cookie Policy</a></li>
        <li><a href="/terms-of-service">Terms of Service</a></li>
      </ul>

      <h2>Machine-readable index</h2>
      <ul>
        <li><a href="/llms.txt">/llms.txt</a> - every page, with a one-line description</li>
        <li><a href="/llms-full.txt">/llms-full.txt</a> - the whole site as one markdown document</li>
        <li><a href="/sitemap.xml">/sitemap.xml</a> - every indexable URL</li>
        <li><a href="/robots.txt">/robots.txt</a> - crawler policy</li>
      </ul>

      <h2>The same, as markdown</h2>
      <pre>${escapeHtml(notFoundMarkdown)}</pre>

      <a class="btn" href="/">Back to home</a>
    </main>
  </body>
</html>
`)

// ── self-check ─────────────────────────────────────────────────────────────
const home = readFileSync(join(DIST, 'index.html'), 'utf8')
const homeText = home
  .replace(/<script[\s\S]*?<\/script>/g, ' ')
  .replace(/<style[\s\S]*?<\/style>/g, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/\s+/g, ' ')
  .trim()

console.log('prerendered:')
for (const line of outputs) console.log(`  ${line}`)
console.log(`  homepage raw-HTML text: ${homeText.length} chars`)

if (!/<h1[\s>]/.test(home)) throw new Error('Prerendered homepage has no <h1>')
if (homeText.length < 500) throw new Error(`Prerendered homepage has only ${homeText.length} characters of text`)
