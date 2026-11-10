import { useLang } from '../context/LangContext'
import Reveal from './Reveal'
import SectionTitle from './SectionTitle'

/**
 * How we operate: the four steps of the method.
 * - On the home (no props), the full section from t.methodology.
 * - On a service page, pass that service's own steps (`steps`, from
 *   t.services.items[i].howWeOperate) and it renders as a compact box.
 */
export default function HowWeOperate({ steps }) {
  const { t } = useLang()

  if (steps) {
    return (
      <Reveal as="aside" className="method-box" aria-label={steps.title}>
        <p className="eyebrow">{t.methodology.eyebrow}</p>
        <h2>{steps.title}</h2>
        <ol>
          {steps.items.map((item, index) => (
            <li key={item.title}>
              <span className="num" aria-hidden="true">0{index + 1}</span>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </li>
          ))}
        </ol>
      </Reveal>
    )
  }

  const m = t.methodology
  return (
    <section className="section method" id="how-we-operate">
      <div className="container">
        <SectionTitle center eyebrow={m.eyebrow} title={m.title} accent={m.accent} />
        <div className="method-list">
          {m.items.map((item, index) => (
            <Reveal className="method-item" delay={index * 90} key={item.title}>
              <div className="method-num" aria-hidden="true">0{index + 1}</div>
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
