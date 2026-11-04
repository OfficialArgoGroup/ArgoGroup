import { useEffect, useRef, useState } from 'react'
import { getAttribution, metaIds, newEventId } from '../shared/attribution.js'
import { Vary } from './chrome.jsx'
import { form as copy, PRIVACY_URL, WHATSAPP_URL } from './copy.js'
import { crmPayload } from '../shared/crm.js'
import { cleanPhone, EMAIL_RE } from '../shared/fields.js'
import { sendLead } from '../shared/submit.js'
import { pageEvent, trackLead } from '../shared/tracking.js'
import { isTrackingEnabled } from '../../lib/tracking.js'
import { useMetaConsentBox } from '../shared/useMetaConsentBox.js'
import { thankYouUrl, useVariantKey } from './variant.js'

// One step, typed fields, the same shape as the contact form on the main site.
// Sent to the CRM through /api/lead (shared/crm.js, shared/submit.js).
const EMPTY = { name: '', email: '', website: '', whatsapp: '', open_answer: '' }
// The fields that can stop the form, in screen order. Company or website and
// the open question are optional and never do.
const ORDER = ['name', 'email', 'whatsapp', 'consent']
// What the progress bar counts: the fields the form cannot be sent without.
const REQUIRED = ['name', 'email', 'whatsapp', 'consent']
// The CRM's limit for `mensaje` (argo-planning, lib/crm-web.ts).
const MAX_ANSWER = 5000
const MIN_FILL_MS = 3000

// The open question per variant, grouped like the hero's text so CSS can show
// the right one from the first paint (the form is above the fold on desktop).
const QUESTIONS = Object.entries(
  Object.entries(copy.openQuestion).reduce((byText, [key, text]) => {
    byText[text] = byText[text] ? `${byText[text]} ${key}` : key
    return byText
  }, {}),
).map(([text, keys]) => [keys, text])

function errorFor(name, values) {
  switch (name) {
    case 'name': return values.name.trim() ? null : copy.added.errName
    case 'email': return EMAIL_RE.test(values.email.trim()) ? null : copy.errors.email
    case 'whatsapp': return cleanPhone(values.whatsapp).replace('+', '').length >= 8 ? null : copy.added.errWhatsapp
    case 'consent': return values.consent ? null : copy.added.errConsent
    default: return null
  }
}

function Field({ name, label, required, help, error, textarea, more, ...rest }) {
  const id = `f-${name}`
  const describedBy = [help && `${id}-help`, error && `${id}-error`].filter(Boolean).join(' ') || undefined
  const control = {
    id,
    name,
    className: textarea ? 'input textarea' : 'input',
    'aria-invalid': error ? 'true' : undefined,
    'aria-describedby': describedBy,
    'aria-required': required ? 'true' : undefined,
    ...rest,
  }
  return (
    <div className={['field', textarea && 'full', more && 'field-more'].filter(Boolean).join(' ')}>
      <label className="field-label" htmlFor={id}>
        {label}
        {required
          ? <span className="req" aria-hidden="true"> *</span>
          : <span className="optional"> {copy.added.optional}</span>}
      </label>
      {textarea ? <textarea rows={4} {...control} /> : <input {...control} />}
      {help && <p className="field-help" id={`${id}-help`}>{help}</p>}
      {error && <p className="field-error" id={`${id}-error`}>{error}</p>}
    </div>
  )
}

export default function LeadForm() {
  const variantKey = useVariantKey()
  const [values, setValues] = useState({ ...EMPTY, consent: false })
  const [errors, setErrors] = useState({})
  const [status, setStatus] = useState('idle')
  const [context, setContext] = useState(null)
  const [honeypot, setHoneypot] = useState('')
  const [started, setStarted] = useState(false)
  // The optional fields (company, the open question) wait behind a link.
  const [more, setMore] = useState(false)
  const metaBox = useMetaConsentBox()
  const formRef = useRef(null)

  // Attribution and the lead's event_id exist only in the browser.
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setContext({ attribution: getAttribution(), eventId: newEventId(), mountedAt: Date.now() })
  }, [])

  // First touch of the form: stops the button's shine and sends FormStart.
  const markStarted = () => {
    if (started) return
    setStarted(true)
    pageEvent('FormStart')
  }

  const update = (name, value) => {
    const next = { ...values, [name]: value }
    setValues(next)
    // Only re-check a field already showing an error, so typing never raises one mid-word.
    if (errors[name]) setErrors((current) => ({ ...current, [name]: errorFor(name, next) }))
  }

  const blur = (event) => {
    const { name, value } = event.target
    if (!value.trim()) return
    setErrors((current) => ({ ...current, [name]: errorFor(name, values) }))
  }

  const fieldProps = (name) => ({
    name,
    value: values[name],
    error: errors[name],
    onChange: (event) => update(name, event.target.value),
    onFocus: markStarted,
    onBlur: blur,
  })

  const submit = async (event) => {
    event.preventDefault()
    if (status === 'sending') return

    const found = Object.fromEntries(ORDER.map((name) => [name, errorFor(name, values)]).filter(([, message]) => message))
    setErrors(found)
    const first = ORDER.find((name) => found[name])
    if (first) {
      formRef.current?.querySelector(`[name="${first}"]`)?.focus()
      return
    }

    const destination = thankYouUrl(variantKey)

    // Bots: fill the hidden field, or post faster than a person can type.
    if (honeypot || !context || Date.now() - context.mountedAt < MIN_FILL_MS) {
      window.location.assign(destination)
      return
    }

    const ids = metaIds()
    const payload = crmPayload({
      landing: 'growth',
      values,
      context,
      ids,
      consentText: copy.consent.join(''),
      variant: variantKey,
    })

    setStatus('sending')
    // The optional Meta box, if ticked, counts from here: Pixel and server Lead.
    const metaConsent = metaBox.commit()
    try {
      const delivered = await sendLead(payload, { metaConsent })
      if (delivered) {
        trackLead(context.eventId)
        // Give the pixel a moment to send before the page unloads.
        if (isTrackingEnabled()) await new Promise((resolve) => setTimeout(resolve, 300))
      }
      window.location.assign(destination)
    } catch {
      setStatus('failed')
    }
  }

  // Shows company and the open question, and puts the cursor in the first.
  const openMore = () => {
    setMore(true)
    requestAnimationFrame(() => formRef.current?.querySelector('[name="website"]')?.focus())
  }

  return (
    <form ref={formRef} className="lead-form" onSubmit={submit} noValidate data-started={started ? 'true' : undefined} data-more={more ? 'true' : undefined}>
      {/* Fills as the required fields become valid. Decorative: the fields say the rest. */}
      <div className="form-progress" aria-hidden="true">
        <span style={{ '--p': REQUIRED.filter((name) => !errorFor(name, values)).length / REQUIRED.length }} />
      </div>
      <div className="form-grid">
        <Field label={copy.added.name} required autoComplete="name" placeholder={copy.added.phName} {...fieldProps('name')} />
        <Field label={copy.added.email} required type="email" inputMode="email" autoComplete="email" placeholder={copy.added.phEmail} help={copy.help.email} {...fieldProps('email')} />
        <Field label={copy.added.whatsapp} required type="tel" inputMode="tel" autoComplete="tel" placeholder={copy.added.phWhatsapp} {...fieldProps('whatsapp')} />
        {!more && (
          <button type="button" className="more-toggle linklike" onClick={openMore}>{copy.added.more}</button>
        )}
        {/* Plain text, not inputMode="url": a company name needs the space bar. */}
        <Field label={copy.added.website} more autoComplete="organization" placeholder={copy.added.phWebsite} help={copy.help.website} {...fieldProps('website')} />
        <Field label={<Vary options={QUESTIONS} />} more textarea maxLength={MAX_ANSWER} placeholder={copy.placeholder} {...fieldProps('open_answer')} />
      </div>

      <div className="field">
        <label className="consent">
          <input
            type="checkbox"
            name="consent"
            checked={values.consent}
            onChange={(event) => { markStarted(); update('consent', event.target.checked) }}
            aria-invalid={errors.consent ? 'true' : undefined}
            aria-describedby={errors.consent ? 'f-consent-error' : undefined}
          />
          <span>
            {copy.consent[0]}
            <a href={PRIVACY_URL} target="_blank" rel="noopener">{copy.consent[1]}</a>
            {copy.consent[2]}
          </span>
        </label>
        {errors.consent && <p className="field-error" id="f-consent-error">{errors.consent}</p>}
      </div>

      {/* Optional, unticked: only for visitors who have not accepted cookies. */}
      {metaBox.visible && (
        <div className="field">
          <label className="consent consent-optional">
            <input
              type="checkbox"
              name="meta_consent"
              checked={metaBox.checked}
              onChange={(event) => metaBox.setChecked(event.target.checked)}
            />
            <span>{copy.added.metaConsent}</span>
          </label>
        </div>
      )}

      {/* Honeypot: invisible to people and assistive tech, irresistible to bots. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="f-company_name">Company name</label>
        <input
          id="f-company_name"
          name="company_name"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
          value={honeypot}
          onChange={(event) => setHoneypot(event.target.value)}
        />
      </div>

      <button type="submit" className="btn btn-block btn-boom btn-shine" disabled={status === 'sending'}>
        <span>{status === 'sending' ? copy.sending : copy.button}</span>
        <svg className="btn-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
          <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      <div aria-live="polite">
        {status === 'failed' && (
          <p className="form-failed">
            {copy.failed[0]}
            <a href={WHATSAPP_URL} target="_blank" rel="noopener">{copy.failed[1]}</a>
            {copy.failed[2]}
          </p>
        )}
      </div>
    </form>
  )
}
