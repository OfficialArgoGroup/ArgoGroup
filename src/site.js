// Single source of truth for site identity.
// Consumed by the SSR/prerender pipeline (JSON-LD, sitemap, llms.txt, markdown
// variants), by the SEO component, and by the tests.

export const SITE_ORIGIN = 'https://www.groupargous.com'

export const site = {
  origin: SITE_ORIGIN,
  url: `${SITE_ORIGIN}/`,
  name: 'Group ARGO',
  legalName: 'ARGO Group',
  alternateNames: ['ARGO Group', 'ARGO'],
  email: 'info@groupargous.com',
  telephone: '+34685162838',
  telephoneDisplay: '+34 685 162 838',
  whatsapp: 'https://wa.me/34685162838',
  logo: `${SITE_ORIGIN}/argo-logo.png`,
  image: `${SITE_ORIGIN}/og-image.jpg`,
  sameAs: [
    'https://www.linkedin.com/company/group-argo/',
    'https://www.instagram.com/group_argo/',
  ],
  locations: [
    { name: 'Barcelona', addressLocality: 'Barcelona', addressCountry: 'ES' },
    { name: 'Miami', addressLocality: 'Miami', addressRegion: 'FL', addressCountry: 'US' },
  ],
  openingHours: 'Mo-Fr 09:00-18:00',
  languages: ['en', 'es'],
}

// Every route the SPA router serves. `prerender` drives the static HTML +
// markdown build; `sitemap` decides what ends up in sitemap.xml and llms.txt.
export const routes = [
  { path: '/', slug: 'index', sitemap: true, changefreq: 'weekly', priority: '1.0' },
  { path: '/about', slug: 'about', sitemap: true, changefreq: 'monthly', priority: '0.8' },
  { path: '/digital-marketing', slug: 'digital-marketing', sitemap: true, changefreq: 'monthly', priority: '0.9' },
  { path: '/ai-technology', slug: 'ai-technology', sitemap: true, changefreq: 'monthly', priority: '0.9' },
  { path: '/creative-brand', slug: 'creative-brand', sitemap: true, changefreq: 'monthly', priority: '0.9' },
  { path: '/contact', slug: 'contact', sitemap: true, changefreq: 'monthly', priority: '0.9' },
  { path: '/privacy-policy', slug: 'privacy-policy', sitemap: true, changefreq: 'yearly', priority: '0.3' },
  { path: '/cookie-policy', slug: 'cookie-policy', sitemap: true, changefreq: 'yearly', priority: '0.3' },
  { path: '/terms-of-service', slug: 'terms-of-service', sitemap: true, changefreq: 'yearly', priority: '0.3' },
  // Post-conversion confirmation page: reachable, but not a search entry point.
  { path: '/thank-you', slug: 'thank-you', sitemap: false, changefreq: 'yearly', priority: '0.1' },
]

export const canonicalFor = (path) =>
  path === '/' ? `${SITE_ORIGIN}/` : `${SITE_ORIGIN}${path}`

// Path of the text/markdown alternate representation for an HTML route.
export const markdownPathFor = (path) => {
  const route = routes.find((r) => r.path === path)
  return route ? `/${route.slug}.md` : null
}
