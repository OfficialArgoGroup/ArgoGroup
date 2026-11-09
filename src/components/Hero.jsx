import { useLang } from '../context/LangContext'
import AnchorLink from './AnchorLink'
import { ArrowIcon } from './icons'
import { ArgoSymbol } from './Logo'

export default function Hero() {
  const { t } = useLang()

  return (
    <header className="hero">
      <ArgoSymbol className="hero-mark" />

      <div className="container hero-content">
        <div className="hero-main">
          <span className="hero-badge hero-in" style={{ '--hero-delay': '0ms' }}>
            {t.hero.badge}
          </span>

          {/* One-line wordmark, brandbook 04: GROUP, a gold hairline, ARGO. */}
          <h1 className="hero-title">
            <span className="hero-wm-group">Group</span>
            <span className="hero-wm-rule" aria-hidden="true" />{' '}
            <span className="hero-wm-argo">{t.hero.headline}</span>
          </h1>

          <p className="hero-sub hero-in" style={{ '--hero-delay': '220ms' }}>{t.hero.sub}</p>
          <p className="hero-sub2 hero-in" style={{ '--hero-delay': '320ms' }}>{t.hero.sub2}</p>

          <div className="hero-ctas hero-in" style={{ '--hero-delay': '420ms' }}>
            <AnchorLink id="contact" className="btn btn-gold">
              <span>{t.hero.cta1}</span>
              <ArrowIcon />
            </AnchorLink>
            <AnchorLink id="services" className="btn btn-ghost">{t.hero.cta2}</AnchorLink>
          </div>
        </div>

        <div className="hero-stats hero-in" style={{ '--hero-delay': '560ms' }}>
          {t.hero.stats.map((stat) => (
            <div key={stat.label} className="hero-stat">
              <div className="value">{stat.value}</div>
              <div className="label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </header>
  )
}
