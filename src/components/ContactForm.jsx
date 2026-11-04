import { useEffect, useRef, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { SendIcon } from './icons'
import { isTrackingEnabled, track } from '../lib/tracking'
import { getAttribution, metaIds, newEventId, utmData } from '../landing/shared/attribution.js'
import { cleanPhone } from '../landing/shared/fields.js'
import { sendLead } from '../landing/shared/submit.js'

// Required fields, in the order the form reads. Kept in step with the field
// list published to agents in src/content/markdown.js.
const REQUIRED = ['name', 'email', 'subject', 'message']

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const EMPTY = { name: '', email: '', phone: '', company: '', subject: '', message: '' }

// Under this, a send is a bot; the CRM drops it too. Same as the landings.
const MIN_FILL_MS = 3000

const ATTRIBUTION = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'fbclid', 'gclid']

export default function ContactForm() {
  const navigate = useNavigate()
  const { t, lang } = useLang()
  const f = t.contactForm

  const [values, setValues] = useState(EMPTY)
  const [agreed, setAgreed] = useState(false)
  const [trap, setTrap] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState(null)
  // When the form appeared and an id for this visit's send (a double click
  // counts once in the CRM). Client only.
  const opened = useRef(null)

  useEffect(() => {
    opened.current = { at: Date.now(), id: newEventId() }
  }, [])

  const errorFor = (name, value = values[name], consent = agreed) => {
    if (name === 'consent') return consent ? null : f.err_consent
    if (REQUIRED.includes(name) && !value.trim()) return f.err_required
    if (name === 'email' && value.trim() && !EMAIL.test(value.trim())) return f.err_email
    if (name === 'phone' && value.trim()) {
      const digits = cleanPhone(value).replace('+', '').length
      if (digits < 6 || digits > 20) return f.err_phone
    }
    return null
  }

  const handleChange = (event) => {
    const { name, value } = event.target
    setValues((previous) => ({ ...previous, [name]: value }))
    // Only re-check a field that is already showing an error, so typing never
    // raises one mid-word.
    setErrors((previous) => (previous[name] ? { ...previous, [name]: errorFor(name, value) } : previous))
  }

  const handleBlur = (event) => {
    const { name, value } = event.target
    setErrors((previous) => ({ ...previous, [name]: errorFor(name, value) }))
  }

  const handleConsent = (event) => {
    setAgreed(event.target.checked)
    setErrors((previous) => (previous.consent ? { ...previous, consent: errorFor('consent', null, event.target.checked) } : previous))
  }

  const handleSubmit = async (event) => {
    event.preventDefault()

    const found = {}
    for (const name of [...Object.keys(EMPTY), 'consent']) {
      const message = errorFor(name)
      if (message) found[name] = message
    }
    setErrors(found)
    if (Object.keys(found).length > 0) {
      document.querySelector('.form-field.has-error input, .form-field.has-error textarea')?.focus()
      return
    }

    // Bots fill the hidden field or send faster than a person can type: they
    // see the thank-you page and nothing is sent.
    if (trap || !opened.current || Date.now() - opened.current.at < MIN_FILL_MS) {
      navigate('/thank-you')
      return
    }

    // The session's first campaign link, wherever on the site it landed.
    const attribution = getAttribution()
    const ids = metaIds()
    const lead = {
      nombre: values.name.trim(),
      email: values.email.trim(),
      telefono: cleanPhone(values.phone) || undefined,
      empresa: values.company.trim() || undefined,
      // The form does not ask which service; the CRM needs one. The subject
      // has no field of its own there, so it opens the message.
      servicio: 'otro',
      mensaje: `${f.subject}: ${values.subject.trim()}\n\n${values.message.trim()}`,
      consentimiento: true,
      consentimiento_texto: `${f.consent} ${f.privacyLink} ${f.consentEnd}`,
      formulario: 'web-contacto',
      abierto_en: opened.current.at,
      id_envio: opened.current.id,
      idioma: lang,
      pagina: window.location.href,
      referrer: attribution.referrer || undefined,
      ...Object.fromEntries(ATTRIBUTION.map((name) => [name, attribution[name] || undefined])),
      // fbp only exists if the visitor accepted cookies (the Meta Pixel sets it).
      fbc: ids.fbc || undefined,
      fbp: ids.fbp || undefined,
      web: '',
    }

    setLoading(true)
    setSubmitError(null)
    try {
      const delivered = await sendLead(lead, { metaConsent: isTrackingEnabled() })
      if (delivered) {
        track('Lead', { content_name: 'contact', content_category: 'contact', ...utmData(attribution) }, { eventId: lead.id_envio })
      }
      navigate('/thank-you')
    } catch {
      setSubmitError(f.err_generic)
    } finally {
      setLoading(false)
    }
  }

  const fieldProps = (name) => ({
    name,
    value: values[name],
    onChange: handleChange,
    onBlur: handleBlur,
    error: errors[name],
    placeholder: f[`ph_${name}`],
  })

  return (
    <form className="form-grid" onSubmit={handleSubmit} noValidate>
      <Field label={f.name} type="text" autoComplete="name" required {...fieldProps('name')} />
      <Field label={f.email} type="email" autoComplete="email" inputMode="email" required {...fieldProps('email')} />
      <Field label={f.phone} type="tel" autoComplete="tel" inputMode="tel" {...fieldProps('phone')} />
      <Field label={f.company} type="text" autoComplete="organization" {...fieldProps('company')} />
      <Field label={f.subject} type="text" full required {...fieldProps('subject')} />
      <Field label={f.message} textarea full required {...fieldProps('message')} />

      {/* Invisible to people and assistive tech; bots fill it in. */}
      <div className="form-trap" aria-hidden="true">
        <label htmlFor="f-company_url">Company URL</label>
        <input id="f-company_url" name="company_url" type="text" tabIndex={-1} autoComplete="off" value={trap} onChange={(event) => setTrap(event.target.value)} />
      </div>

      <div className={errors.consent ? 'form-consent has-error' : 'form-consent'}>
        <input id="f-consent" name="consent" type="checkbox" checked={agreed} onChange={handleConsent} />
        <label htmlFor="f-consent">
          {f.consent}{' '}
          <Link to="/privacy-policy">{f.privacyLink}</Link>{' '}
          {f.consentEnd}
        </label>
        <span className="field-error" role="alert">{errors.consent}</span>
      </div>

      <div className="form-submit">
        {submitError && <p className="field-error" role="alert" style={{ marginBottom: '0.75rem' }}>{submitError}</p>}
        <button className="btn btn-gold" type="submit" disabled={loading}>
          <span>{f.send}</span>
          <SendIcon />
        </button>
      </div>
    </form>
  )
}

function Field({ label, name, error, full, required, textarea, ...rest }) {
  const id = `f-${name}`
  const className = ['form-field', full && 'full', error && 'has-error'].filter(Boolean).join(' ')
  const control = { id, name, required, 'aria-invalid': error ? true : undefined, ...rest }

  return (
    <div className={className}>
      <label htmlFor={id}>
        <span>{label}</span>
        {required && <span className="req" aria-hidden="true"> *</span>}
      </label>
      {textarea
        ? <textarea {...control} className={error ? 'invalid' : undefined} />
        : <input {...control} className={error ? 'invalid' : undefined} />}
      <span className="field-error" role="alert">{error}</span>
    </div>
  )
}
