import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { SERVICE_PATHS } from '../site.js'
import { ArrowIcon } from './icons'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

/**
 * The services by name only: the detail lives on each service's own page
 * (pages/ServicePage.jsx). `skip` leaves one out, for the links under a service.
 */
export function ServiceNames({ skip }) {
  const { t } = useLang()

  return (
    <ul className="service-names">
      {t.services.items.map((service, index) => (index === skip ? null : (
        <Reveal as="li" delay={index * 90} key={service.title}>
          <Link className="service-name" to={SERVICE_PATHS[index]}>
            <span className="num" aria-hidden="true">0{index + 1}</span>
            <h3 className="name">{service.title}</h3>
            <ArrowIcon />
          </Link>
        </Reveal>
      )))}
    </ul>
  )
}

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
        <ServiceNames />
      </div>
    </section>
  )
}
