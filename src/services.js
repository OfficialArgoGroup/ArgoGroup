// The three services, each with its own page. Positional: entry N is
// t.services.items[N] in src/i18n.js, in both languages.
//
// `crm` is the `servicio` the contact form sends from that page (contract with
// the CRM, see src/landing/shared/crm.js). The CRM has no value for creative
// and brand yet, so it goes as 'otro'; `pagina` (the page's URL) still tells
// the three pages apart. Pending: add 'creatividad_marca' in argo-planning.
//
// `icons` are presentation, not copy: one per card, in order.
export const SERVICE_PAGES = [
  {
    path: '/digital-marketing',
    crm: 'marketing_digital',
    icons: ['target', 'sliders', 'trending'],
  },
  {
    path: '/ai-technology',
    crm: 'sistemas_ia',
    icons: ['cpu', 'database', 'workflow', 'chart'],
  },
  {
    path: '/creative-brand',
    crm: 'otro',
    icons: ['gem', 'layers', 'monitor', 'sparkles'],
  },
]

export const servicePageIndex = (path) => SERVICE_PAGES.findIndex((page) => page.path === path)
