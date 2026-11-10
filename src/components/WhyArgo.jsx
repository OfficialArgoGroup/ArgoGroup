import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { ArrowIcon } from './icons'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

/**
 * Why ARGO and About, as one section that fits one screen: label, a one-line
 * title and a short intro across the top (who we are, who leads, where from),
 * then the four differences in a row between fine rules. The home links on to
 * /about, which carries the same section plus the facts (pages/About.jsx).
 */
export default function WhyArgo({ aboutLink = false }) {
  const { t } = useLang()
  const w = t.whyArgo

  return (
    <section className="section why" id="why-argo">
      <div className="container">
        <SectionTitle eyebrow={w.eyebrow} title={w.title} accent={w.accent} />
        <div className="why-intro">
          {w.intro.map((paragraph) => (
            <Reveal as="p" key={paragraph}>{paragraph}</Reveal>
          ))}
        </div>

        <ol className="why-list">
          {w.items.map((item, index) => (
            <Reveal as="li" className="why-item" delay={index * 90} key={item.title}>
              <span className="why-num" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </Reveal>
          ))}
        </ol>

        {aboutLink && (
          <div className="why-foot">
            <Link className="why-more" to="/about">
              <span>{w.more}</span>
              <ArrowIcon />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
