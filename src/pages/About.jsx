import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import Reveal from '../components/Reveal'
import WhyArgo from '../components/WhyArgo'

export default function About() {
  const { t } = useLang()
  const a = t.about

  return (
    <main id="main" className="page about-page">
      <div className="container">
        <Reveal className="section-head center">
          <h1 className="section-title">{a.title}</h1>
          <p className="section-sub">{a.sub}</p>
        </Reveal>
      </div>

      {/* Why ARGO and About are one section: the same one the home shows. */}
      <WhyArgo />

      <div className="container">

        <Reveal className="facts">
          <h2>{a.factsTitle}</h2>
          <dl>
            {a.facts.map((fact) => (
              <div key={fact.label}>
                <dt>{fact.label}</dt>
                <dd>{fact.value}</dd>
              </div>
            ))}
          </dl>
        </Reveal>

        <Reveal className="about-cta">
          <h2>{a.ctaTitle}</h2>
          <p>{a.ctaSub}</p>
          <Link className="btn btn-gold" to="/contact">{a.cta}</Link>
        </Reveal>
      </div>
    </main>
  )
}
