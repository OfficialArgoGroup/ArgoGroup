import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import SectionTitle from './SectionTitle'
import Reveal from './Reveal'
import { ArrowIcon, CheckIcon } from './icons'
import { icons } from './iconSet'
import { SERVICE_PAGES } from '../services.js'

/**
 * The homepage's introduction to the three services: one block each, with its
 * short line, the whole block a link to the service's own page (where the
 * detail now lives, see src/pages/ServicePage.jsx).
 */
export default function Services() {
  const { t } = useLang()

  return (
    <section className="section services" id="services">
      <div className="container">
        <SectionTitle
          eyebrow={t.services.eyebrow}
          title={t.services.title}
          accent={t.services.accent}
        />

        <div className="service-tabs service-links">
          {t.services.items.map((service, index) => (
            <Link key={service.title} className="service-tab service-link" to={SERVICE_PAGES[index].path}>
              <span className="num">0{index + 1}</span>
              <span className="name">{service.title}</span>
              <span className="desc">{service.subtitle}</span>
              <span className="more">
                {t.services.more}
                <ArrowIcon />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}

/** One of a service's cards, as on its page. */
export function FeatureCard({ icon, section, order }) {
  // The gold spotlight in .feature-card::before follows these two properties.
  const trackPointer = (event) => {
    const rect = event.currentTarget.getBoundingClientRect()
    event.currentTarget.style.setProperty('--mx', `${event.clientX - rect.left}px`)
    event.currentTarget.style.setProperty('--my', `${event.clientY - rect.top}px`)
  }

  return (
    // Cards arrive one after another, as the reference's service row does.
    <Reveal as="article" className="feature-card" delay={order * 110} onPointerMove={trackPointer}>
      <div className="feature-icon">{icons[icon] ?? icons.sparkles}</div>
      <h4>{section.heading}</h4>
      <p className="tagline">{section.headline}</p>
      <ul>
        {section.items.map((item) => (
          <li key={item}><CheckIcon />{item}</li>
        ))}
      </ul>
    </Reveal>
  )
}
