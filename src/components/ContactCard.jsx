import ContactForm from './ContactForm'
import Reveal from './Reveal'
import SplitText from './SplitText'
import { LinkedInIcon, MailIcon, WhatsAppIcon } from './icons'
import { useLang } from '../context/LangContext'
import { site } from '../site.js'

/**
 * The contact panel: direct channels on one side, the form on the other.
 * Shared by the homepage section and the /contact route, which differ only in
 * their copy and in whether the heading is the page's H1. A service page
 * passes its `servicio` for the CRM (src/services.js).
 */
export default function ContactCard({ eyebrow, title, accent, sub, heading = 'h2', servicio }) {
  const { t } = useLang()
  const Heading = heading

  return (
    <Reveal className="contact-card" scale>
      <div className="contact-info">
        {eyebrow && <span className="eyebrow">{eyebrow}</span>}
        <Heading className="section-title" aria-label={title}>
          <SplitText title={title} accent={accent} />
        </Heading>
        <p className="section-sub">{sub}</p>

        <div className="contact-channels">
          <Channel
            className="channel wa"
            href={site.whatsapp}
            external
            icon={<WhatsAppIcon />}
            label={t.contactPage.whatsapp}
            value={site.telephoneDisplay}
          />
          <Channel
            className="channel"
            href={`mailto:${site.email}`}
            icon={<MailIcon />}
            label="Email"
            value={site.email}
          />
          <Channel
            className="channel"
            href={site.sameAs[0]}
            external
            icon={<LinkedInIcon />}
            label={t.contactPage.linkedin}
            value={site.name}
          />
        </div>
      </div>

      <div className="contact-form-wrap">
        <ContactForm servicio={servicio} />
      </div>
    </Reveal>
  )
}

function Channel({ className, href, external, icon, label, value }) {
  const target = external ? { target: '_blank', rel: 'noopener noreferrer' } : {}
  return (
    <a className={className} href={href} {...target}>
      <span className="ch-icon" aria-hidden="true">{icon}</span>
      <span>
        <span className="ch-label">{label}</span>
        <span className="ch-value" style={{ display: 'block' }}>{value}</span>
      </span>
    </a>
  )
}
