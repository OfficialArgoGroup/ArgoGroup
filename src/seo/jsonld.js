// Builds the JSON-LD graph that is inlined into the prerendered HTML.
// Everything here is derived from src/site.js + src/i18n.js so the structured
// data can never drift from what the page actually says.

import { site, canonicalFor } from '../site.js'
import { translations } from '../i18n.js'
import { SERVICE_PAGES } from '../services.js'

const postalAddress = (loc) => ({
  '@type': 'PostalAddress',
  addressLocality: loc.addressLocality,
  ...(loc.addressRegion ? { addressRegion: loc.addressRegion } : {}),
  addressCountry: loc.addressCountry,
})

const organization = (t) => ({
  '@type': ['Organization', 'ProfessionalService'],
  '@id': `${site.origin}/#organization`,
  name: site.name,
  legalName: site.legalName,
  alternateName: site.alternateNames,
  url: site.url,
  logo: { '@type': 'ImageObject', url: site.logo },
  image: site.image,
  description: t.meta.description,
  slogan: t.hero.sub,
  email: site.email,
  telephone: site.telephone,
  address: postalAddress(site.locations[0]),
  location: site.locations.map((loc) => ({
    '@type': 'Place',
    name: loc.name,
    address: postalAddress(loc),
  })),
  areaServed: [
    { '@type': 'Country', name: 'Spain' },
    { '@type': 'Country', name: 'United States' },
    { '@type': 'Place', name: 'Worldwide' },
  ],
  knowsLanguage: site.languages,
  openingHours: site.openingHours,
  sameAs: site.sameAs,
  contactPoint: [
    {
      '@type': 'ContactPoint',
      contactType: 'sales',
      email: site.email,
      telephone: site.telephone,
      availableLanguage: ['English', 'Spanish'],
      areaServed: ['ES', 'US'],
      url: canonicalFor('/contact'),
    },
  ],
  hasOfferCatalog: {
    '@type': 'OfferCatalog',
    name: t.services.title,
    itemListElement: t.services.items.map((service, index) => ({
      '@type': 'Offer',
      itemOffered: {
        '@type': 'Service',
        '@id': `${canonicalFor(SERVICE_PAGES[index].path)}#service`,
        url: canonicalFor(SERVICE_PAGES[index].path),
        name: service.title,
        description: service.subtitle,
        provider: { '@id': `${site.origin}/#organization` },
        serviceType: service.title,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: service.title,
          itemListElement: service.sections.map((section) => ({
            '@type': 'Offer',
            itemOffered: {
              '@type': 'Service',
              name: section.heading,
              description: section.headline,
            },
          })),
        },
      },
    })),
  },
})

const website = (t) => ({
  '@type': 'WebSite',
  '@id': `${site.origin}/#website`,
  url: site.url,
  name: site.name,
  description: t.meta.description,
  inLanguage: site.languages,
  publisher: { '@id': `${site.origin}/#organization` },
})

const webPage = (path, { type = 'WebPage', name, description }) => ({
  '@type': type,
  '@id': `${canonicalFor(path)}#webpage`,
  url: canonicalFor(path),
  name,
  description,
  isPartOf: { '@id': `${site.origin}/#website` },
  about: { '@id': `${site.origin}/#organization` },
  inLanguage: 'en',
})

const faqPage = (t) => ({
  '@type': 'FAQPage',
  '@id': `${site.origin}/#faq`,
  mainEntity: t.faq.items.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: { '@type': 'Answer', text: item.a },
  })),
})

const PAGE_TYPES = {
  '/': { type: 'WebPage' },
  '/about': { type: 'AboutPage' },
  '/contact': { type: 'ContactPage' },
  '/thank-you': { type: 'WebPage' },
  '/privacy-policy': { type: 'WebPage' },
  '/cookie-policy': { type: 'WebPage' },
  '/terms-of-service': { type: 'WebPage' },
}

/**
 * @param {string} path      route path, e.g. '/contact'
 * @param {object} meta      { title, description } already resolved for the route
 * @param {string} lang      'en' | 'es'
 * @returns {object}         a schema.org @graph document
 */
export function buildJsonLd(path, meta, lang = 'en') {
  const t = translations[lang] || translations.en
  const servicePage = SERVICE_PAGES.find((page) => page.path === path)
  const graph = [
    organization(t),
    website(t),
    {
      ...webPage(path, {
        type: (PAGE_TYPES[path] || {}).type || 'WebPage',
        name: meta.title,
        description: meta.description,
      }),
      // A service's page is about that service, not the organization.
      ...(servicePage ? { about: { '@id': `${canonicalFor(path)}#service` } } : {}),
    },
  ]
  if (path === '/') graph.push(faqPage(t))
  return { '@context': 'https://schema.org', '@graph': graph }
}

// JSON-LD is injected inside a <script> tag: `</script>` and HTML comment
// openers inside string values would end the block early.
const JSON_ESCAPES = { '<': '\\u003c', '>': '\\u003e', '&': '\\u0026' }

export function serializeJsonLd(doc) {
  return JSON.stringify(doc, null, 2).replace(/[<>&]/g, (char) => JSON_ESCAPES[char])
}
