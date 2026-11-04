// Campaign details in the EU/EEA, the UK and Switzerland: browser storage only
// after Accept. One file per country answer: region.js asks once per page load,
// and in Node that means once per file.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { crmPayload } from '../src/landing/shared/crm.js'
import { getAttribution, metaIds } from '../src/landing/shared/attribution.js'
import { setConsent } from '../src/lib/consent.js'
import { openPage, settle, storage } from './fake-page.js'

const SITE = 'https://www.groupargous.com'
const KEY = 'argo_attribution'
const values = { name: 'Lola', email: 'lola@argo.test', website: '', whatsapp: '+34 600 000 101', open_answer: '' }

test('without Accept nothing is stored, and the form still carries the details', async () => {
  const page = openPage(`${SITE}/growth?utm_source=meta&utm_campaign=first&fbclid=abc`, { country: 'ES' })
  const attribution = getAttribution()
  await settle()

  assert.equal(page.geoCalls, 1, 'there is something to keep, so the page asks')
  assert.equal(page.session.getItem(KEY), null)
  assert.equal(attribution.utm_campaign, 'first')

  const lead = crmPayload({ landing: 'growth', values, context: { attribution: getAttribution(), mountedAt: 1, eventId: 'x' }, ids: metaIds(), consentText: 'x' })
  assert.equal(lead.utm_source, 'meta')
  assert.equal(lead.utm_campaign, 'first')
  assert.equal(lead.fbclid, 'abc')
  assert.equal(page.session.getItem(KEY), null, 'reading them for the form stores nothing')
})

test('the memory lasts while the page does: a route change keeps the first touch', async () => {
  const page = openPage(`${SITE}/?utm_campaign=first`, { country: 'ES' })
  getAttribution()
  await settle()
  window.location = new URL(`${SITE}/contact?utm_campaign=second`)
  assert.equal(getAttribution().utm_campaign, 'first')
  window.location = new URL(`${SITE}/about`)
  assert.equal(getAttribution().utm_campaign, 'first')
  assert.equal(page.session.getItem(KEY), null)
})

test('a new page load has only its own URL: the memory does not outlive the page', async () => {
  openPage(`${SITE}/growth?utm_campaign=first`, { country: 'ES' })
  getAttribution()
  await settle()
  openPage(`${SITE}/contact`, { country: 'ES' })
  assert.equal(getAttribution().utm_campaign, '')
})

test('Accept stores them at that moment, and Reject takes them out again', async () => {
  const page = openPage(`${SITE}/growth?utm_campaign=first`, { country: 'ES' })
  getAttribution()
  await settle()
  assert.equal(page.session.getItem(KEY), null)

  page.local.setItem('argo_cookie_consent', 'accepted')
  setConsent('accepted')
  assert.equal(JSON.parse(page.session.getItem(KEY)).utm_campaign, 'first')

  setConsent('rejected')
  assert.equal(page.session.getItem(KEY), null)
  assert.equal(getAttribution().utm_campaign, 'first', 'the open page can still send them')
  assert.equal(page.session.getItem(KEY), null)
})

test('a visitor who accepted earlier stores at once, without asking for the country', () => {
  const session = storage()
  const page = openPage(`${SITE}/?utm_campaign=first`, { consent: 'accepted', session })
  getAttribution()
  assert.equal(page.geoCalls, 0)
  assert.equal(JSON.parse(session.getItem(KEY)).utm_campaign, 'first')
})

test('with Accept stored, a later page keeps the first touch', () => {
  const session = storage()
  openPage(`${SITE}/growth?utm_campaign=first`, { consent: 'accepted', session })
  getAttribution()
  openPage(`${SITE}/contact?utm_campaign=second`, { consent: 'accepted', session })
  assert.equal(getAttribution().utm_campaign, 'first')
})

test('details stored before a Reject in another moment do not stay', async () => {
  const session = storage({ [KEY]: JSON.stringify({ utm_campaign: 'old' }) })
  openPage(`${SITE}/contact`, { consent: 'rejected', session })
  assert.equal(getAttribution().utm_campaign, 'old', 'still usable by this page')
  assert.equal(session.getItem(KEY), null)
})

test('the main site asks for the country only with something to keep', () => {
  const page = openPage(`${SITE}/about`, { country: 'ES' })
  getAttribution()
  assert.equal(page.geoCalls, 0)
})
