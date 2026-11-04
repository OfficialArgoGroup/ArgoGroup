// Legal guarantees of the built site: nothing loads from Google Fonts (the
// visitor's IP would reach Google before any consent), and the cookie policy
// is published, linked and lists what the code really stores. Needs a build.

import assert from 'node:assert/strict'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { test } from 'node:test'

const DIST = join(import.meta.dirname, '..', 'dist')
const walk = (dir) => readdirSync(dir).flatMap((name) => {
  const path = join(dir, name)
  return statSync(path).isDirectory() ? walk(path) : [path]
})
const read = (...parts) => readFileSync(join(DIST, ...parts), 'utf8')

test('no built page or stylesheet loads anything from Google Fonts', () => {
  const files = walk(DIST).filter((file) => /\.(html|css|js)$/.test(file))
  assert.ok(files.length > 0, 'run the build first')
  for (const file of files) {
    assert.ok(!/fonts\.(googleapis|gstatic)\.com/.test(readFileSync(file, 'utf8')), `${file} reaches Google Fonts`)
  }
})

test('the site fonts are served from this domain', () => {
  const index = read('index.html')
  assert.match(index, /href="\/fonts\/inter-latin-wght-normal\.woff2"/)
  assert.match(index, /href="\/fonts\/playfair-display-latin-wght-normal\.woff2"/)
  for (const font of ['inter-latin-wght-normal.woff2', 'playfair-display-latin-wght-normal.woff2', 'OFL-inter.txt', 'OFL-playfair-display.txt']) {
    assert.ok(statSync(join(DIST, 'fonts', font)).size > 0, font)
  }
})

test('the cookie policy is published, in the sitemap and linked from every page footer', () => {
  const page = read('cookie-policy.html')
  for (const name of ['argo_cookie_consent', 'argo-lang', 'argo_growth_variant', 'argo_attribution', 'argo_internal', '_fbp', '_fbc']) {
    assert.ok(page.includes(name), `cookie policy lists ${name}`)
  }
  assert.ok(read('sitemap.xml').includes('/cookie-policy</loc>'))
  assert.ok(read('llms.txt').includes('/cookie-policy'))
  for (const path of ['index.html', 'about.html', 'contact.html', 'privacy-policy.html']) {
    assert.ok(read(path).includes('href="/cookie-policy"'), `${path} links to the cookie policy`)
  }
})

test('the contact form sends to this site, not to Formspree', () => {
  const assets = walk(join(DIST, 'assets')).filter((file) => file.endsWith('.js')).map((file) => readFileSync(file, 'utf8')).join('\n')
  assert.ok(!/formspree/i.test(assets), 'no Formspree in the bundle')
  assert.ok(!/formspree/i.test(read('privacy-policy.html')), 'no Formspree in the privacy policy')
  assert.ok(assets.includes('web-contacto'), 'the contact form posts as web-contacto')
})
