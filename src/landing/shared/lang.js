// The landings' language. English lives at /growth and /systems; Spanish at
// /growth/es and /systems/es, each with its own thank-you page under it. The
// language comes from the address, so the prerendered HTML and the hydrated
// page always agree, and each ad can link to the language it was written in.

import { createContext, useContext } from 'react'

export const LANGS = ['en', 'es']

export const LangContext = createContext('en')

/** The language of the page being rendered. */
export const useLang = () => useContext(LangContext)

/** '/growth/es' or '/growth/es/thank-you' → 'es'; anything else → 'en'. */
export const langFromPath = (path) => (/^\/[a-z]+\/es(\/|$)/.test(path) ? 'es' : 'en')

/** Where a landing lives in a language: '/growth' or '/growth/es'. */
export const landingPath = (name, lang) => (lang === 'es' ? `/${name}/es` : `/${name}`)
