// A landing lead, shaped as the CRM's POST /api/leads expects it
// (argo-planning; contract in the ARGO Universe:
// 01-captacion/plataforma/cambios/crm-entrada-web/contrato-formulario.md).
// Both landings send the same shape; `servicio` and `formulario` tell them
// apart in the CRM.

import { cleanPhone, companyOrWebsite } from './fields.js'

export const CRM_FORMS = {
  growth: { servicio: 'marketing_digital', formulario: 'landing-marketing-digital' },
  systems: { servicio: 'sistemas_ia', formulario: 'landing-sistemas-ia' },
}

const orNothing = (value) => value || undefined

/**
 * values: the form's fields; context: attribution, event id and load time;
 * ids: Meta's fbc and fbp; consentText: the exact text beside the checkbox;
 * lang: the page's language, so the reply goes out in it.
 */
export function crmPayload({ landing, values, context, ids, consentText, variant, lang = 'en' }) {
  const { servicio, formulario } = CRM_FORMS[landing]
  // Both optional: the field takes a company name or a website, and the open
  // answer may be empty (the CRM accepts `mensaje` missing).
  const { website, company } = companyOrWebsite(values.website)
  const openAnswer = values.open_answer.trim()
  const { attribution } = context

  return {
    nombre: values.name.trim(),
    email: values.email.trim(),
    telefono: cleanPhone(values.whatsapp),
    empresa: orNothing(company),
    mensaje: orNothing(openAnswer),
    servicio,
    consentimiento: true,
    consentimiento_texto: consentText,
    formulario,
    // Load time and a per-load id: the CRM drops posts under 3 seconds and
    // counts a double click once.
    abierto_en: context.mountedAt,
    id_envio: context.eventId,
    idioma: lang,
    pagina: window.location.href,
    referrer: orNothing(attribution.referrer),
    utm_source: orNothing(attribution.utm_source),
    utm_medium: orNothing(attribution.utm_medium),
    utm_campaign: orNothing(attribution.utm_campaign),
    utm_term: orNothing(attribution.utm_term),
    utm_content: orNothing(attribution.utm_content),
    fbclid: orNothing(attribution.fbclid),
    gclid: orNothing(attribution.gclid),
    // The CRM's trap field: always empty from a person (the form stops bots first).
    web: '',
    // From 0020: the website fills the lead's «Web» (never `web`, the trap
    // field), only when it is a URL; the variant and Meta's ids are kept per
    // entry, for the Conversions API later. fbp exists only after cookie consent.
    sitio_web: orNothing(website),
    variante: orNothing(variant),
    fbc: orNothing(ids.fbc),
    fbp: orNothing(ids.fbp),
  }
}
