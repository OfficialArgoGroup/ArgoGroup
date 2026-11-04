// Campaign details outside the EU/EEA, the UK and Switzerland: stored as soon
// as the country is known, whatever the banner says. See attribution-opt-in.test.js.

import assert from 'node:assert/strict'
import { test } from 'node:test'
import { getAttribution } from '../src/landing/shared/attribution.js'
import { setConsent } from '../src/lib/consent.js'
import { openPage, settle } from './fake-page.js'

const KEY = 'argo_attribution'

test('nothing is stored until the country is known, then it is, and Reject leaves it', async () => {
  const page = openPage('https://www.groupargous.com/growth?utm_campaign=first', { country: 'US' })
  getAttribution()
  assert.equal(page.session.getItem(KEY), null, 'not before the answer')

  await settle()
  assert.equal(JSON.parse(page.session.getItem(KEY)).utm_campaign, 'first')

  page.local.setItem('argo_cookie_consent', 'rejected')
  setConsent('rejected')
  assert.equal(JSON.parse(page.session.getItem(KEY)).utm_campaign, 'first')
})
