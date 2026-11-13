import { useLang } from '../context/LangContext'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

/**
 * «How we operate»: the four steps side by side (stacked on phones, see
 * .method-list in argo.css). The homepage shows the general steps; a service
 * page passes its own.
 */
export default function Methodology({ items }) {
  const { t } = useLang()
  const steps = items ?? t.methodology.items

  return (
    <section className="section method" id="how-we-operate">
      <div className="container">
        <SectionTitle
          center
          eyebrow={t.methodology.eyebrow}
          title={t.methodology.title}
          accent={t.methodology.accent}
        />

        <div className="method-list">
          {steps.map((item, index) => (
            <Reveal className="method-item" key={item.number} delay={index * 110}>
              <div className="method-num" aria-hidden="true">{item.number}</div>
              <div className="method-body">
                <h3>{item.title}</h3>
                <p>{item.desc}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}
