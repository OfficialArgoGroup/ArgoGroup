import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import AnchorLink from '../components/AnchorLink'
import { CheckIcon } from '../components/icons'
import Reveal from '../components/Reveal'
import ServiceScene from '../components/ServiceScene'
import { ServiceNames } from '../components/Services'

/**
 * One service: its sections on the left and, on the right, a visual that stays
 * in place while they scroll past and changes with the section being read.
 * Narrow screens have no room beside the text, so each section carries its own.
 */
export default function ServicePage({ index }) {
  const { t } = useLang()
  const service = t.services.items[index]
  const [active, setActive] = useState(0)
  const listRef = useRef(null)

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(Number(entry.target.dataset.section))
        }
      },
      { rootMargin: '-45% 0px -50% 0px' },
    )
    for (const section of listRef.current.querySelectorAll('[data-section]')) observer.observe(section)
    return () => observer.disconnect()
  }, [])

  return (
    <main id="main" className="page svc-page">
      <div className="container">
        {/* The title sits in the text column, so the first section and the
            visual are both on screen from the first paint. */}
        <div className="svc-grid">
          <div className="svc-list" ref={listRef}>
            <Reveal className="svc-head">
              <AnchorLink id="services" className="eyebrow svc-back">{t.services.title}</AnchorLink>
              <h1 className="section-title">{service.title}</h1>
              <p className="section-sub">{service.subtitle}</p>
            </Reveal>
            {service.sections.map((section, sectionIndex) => (
              <article className="svc-section" data-section={sectionIndex} key={sectionIndex}>
                <div className="svc-visual-inline"><ServiceScene service={index} section={sectionIndex} /></div>
                <span className="num" aria-hidden="true">0{sectionIndex + 1}</span>
                <h2>{section.heading}</h2>
                <p className="tagline">{section.headline}</p>
                <ul>
                  {section.items.map((item) => (
                    <li key={item}><CheckIcon />{item}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>

          <div className="svc-visual" aria-hidden="true">
            {service.sections.map((section, sectionIndex) => (
              <div className={sectionIndex === active ? 'svc-scene is-active' : 'svc-scene'} key={sectionIndex}>
                <ServiceScene service={index} section={sectionIndex} active={sectionIndex === active} />
                <p className="svc-caption"><span>0{sectionIndex + 1}</span>{section.heading}</p>
              </div>
            ))}
          </div>
        </div>

        <Reveal className="about-cta">
          <h2>{t.about.ctaTitle}</h2>
          <p>{t.about.ctaSub}</p>
          <Link className="btn btn-gold" to="/contact">{t.about.cta}</Link>
        </Reveal>

        <div className="svc-others">
          <ServiceNames skip={index} />
        </div>
      </div>
    </main>
  )
}
