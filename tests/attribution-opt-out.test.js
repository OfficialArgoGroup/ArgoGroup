// Campaign details outside the EU/EEA, the UK and Switzerland: stored once the
// country is known, until the visitor rejects. See attribution-opt-in.test.js.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { crmPayload } from '../src/landing/shared/crm.js'
import { getAttribution, metaIds } from '../src/landing/shared/attribution.js'
import { setConsent } from '../src/lib/consent.js'
import { openPage, settle, storage } from './fake-page.js'

const SITE = 'https://www.groupargous.com'
const KEY = 'argo_attribution'
const values = { name: 'Lola', email: 'lola@argo.test', website: '', whatsapp: '+34 600 000 101', open_answer: '' }

// First in this file: region.js asks once, and later tests need the answer.
test('someone who already rejected is not asked for their country, and nothing is stored', () => {
  const page = openPage(`${SITE}/contact?utm_campaign=first`, { country: 'US', consent: 'rejected' })
  assert.equal(getAttribution().utm_campaign, 'first')
  assert.equal(page.geoCalls, 0)
  assert.equal(page.session.getItem(KEY), null)
})

test('stored once the country is known, without waiting for a choice', async () => {
  const page = openPage(`${SITE}/growth?utm_campaign=first`, { country: 'US' })
  getAttribution()
  assert.equal(page.session.getItem(KEY), null, 'not before the answer')
  assert.equal(page.geoCalls, 1)

  await settle()
  assert.equal(JSON.parse(page.session.getItem(KEY)).utm_campaign, 'first')
})

test('the informative OK changes nothing', async () => {
  const page = openPage(`${SITE}/growth?utm_campaign=first`, { country: 'US' })
  getAttribution()
  setConsent('acknowledged')
  assert.equal(JSON.parse(page.session.getItem(KEY)).utm_campaign, 'first')
})

test('Reject takes them out of storage, as in the EU, and the open page can still send them', () => {
  const page = openPage(`${SITE}/growth?utm_campaign=first&fbclid=abc`, { country: 'US' })
  getAttribution()
  assert.ok(page.session.getItem(KEY))

  setConsent('rejected')
  assert.equal(page.session.getItem(KEY), null)

  const lead = crmPayload({ landing: 'growth', values, context: { attribution: getAttribution(), mountedAt: 1, eventId: 'x' }, ids: metaIds(), consentText: 'x' })
  assert.equal(lead.utm_campaign, 'first')
  assert.equal(page.session.getItem(KEY), null, 'reading them for the form does not put them back')
})

test('after a Reject, later pages store nothing; Accept stores again', () => {
  const session = storage()
  const local = storage()
  openPage(`${SITE}/growth?utm_campaign=first`, { country: 'US', session, local })
  getAttribution()
  setConsent('rejected')

  openPage(`${SITE}/systems?utm_campaign=second`, { country: 'US', session, local })
  assert.equal(getAttribution().utm_campaign, 'second', 'the first touch left with the storage')
  assert.equal(session.getItem(KEY), null)

  setConsent('accepted')
  assert.equal(JSON.parse(session.getItem(KEY)).utm_campaign, 'second')
})
