import { useLang } from '../context/LangContext'
import Reveal from '../components/Reveal'
import { FeatureCard } from '../components/Services'
import Methodology from '../components/Methodology'
import ContactCard from '../components/ContactCard'
import { SERVICE_PAGES } from '../services.js'

/**
 * A service's own page (/digital-marketing, /ai-technology, /creative-brand):
 * what the homepage used to show for it, then «How we operate» for that
 * service, then the site's contact form, sent with the service as `servicio`.
 */
export default function ServicePage({ index }) {
  const { t } = useLang()
  const service = t.services.items[index]
  const page = SERVICE_PAGES[index]
  const c = t.homeContact

  return (
    <main id="main">
      <section className="page services service-page">
        <div className="container">
          <Reveal className="section-head">
            <span className="eyebrow">{t.services.eyebrow}</span>
            <h1 className="section-title">{service.title}</h1>
          </Reveal>

          <p className="service-intro">{service.subtitle}</p>
          <div className="section-grid">
            {service.sections.map((section, sectionIndex) => (
              <FeatureCard
                key={section.heading}
                icon={page.icons[sectionIndex]}
                section={section}
                order={sectionIndex}
              />
            ))}
          </div>
        </div>
      </section>

      <Methodology items={service.method} />

      <section className="section contact" id="contact">
        <div className="container">
          <ContactCard eyebrow={c.eyebrow} title={c.title} accent={c.accent} sub={c.sub} servicio={page.crm} />
        </div>
      </section>
    </main>
  )
}
