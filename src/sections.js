// Sections of the homepage, in document order. `key` indexes t.nav.
// Shared by the navbar, the mobile menu and the footer so the three can never
// drift apart.
export const SECTIONS = [
  { id: 'services', key: 'services' },
  { id: 'why-argo', key: 'why' },
  { id: 'faq', key: 'faq' },
]

// The anchors before they were in English (until 2026-10). Links already
// shared with them still land on the right section (ScrollToTop.jsx).
export const OLD_ANCHORS = {
  servicios: 'services',
  'por-que-argo': 'why-argo',
  contacto: 'contact',
}
