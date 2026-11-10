// The live ad variant, as boot.js left it on <html data-variant>.
//
// The prerendered HTML is the same for every variant (CSS picks the visible
// headline), so the server snapshot is the default and React swaps in the real
// one straight after hydrating. Only below-the-fold text (the form's open
// question) depends on this, so the swap is never seen.

import { useSyncExternalStore } from 'react'
import { landingPath } from '../shared/lang.js'

export const DEFAULT_VARIANT = '1b'

const read = () => {
  if (typeof document === 'undefined') return DEFAULT_VARIANT
  return document.documentElement.getAttribute('data-variant') || DEFAULT_VARIANT
}

const subscribe = () => () => {}

export function useVariantKey() {
  return useSyncExternalStore(subscribe, read, () => DEFAULT_VARIANT)
}

/** '4a' → { key: '4a', variant: '4', headline: 'a' }; '2' → headline ''. */
export function splitVariant(key) {
  return { key, variant: key.charAt(0), headline: key.slice(1) }
}

/** Thank-you URL carrying the variant the lead came in on. */
export function thankYouUrl(key, lang = 'en') {
  const { variant, headline } = splitVariant(key)
  return `${landingPath('growth', lang)}/thank-you?v=${variant}${headline ? `&h=${headline}` : ''}`
}
