import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import AnchorLink from '../components/AnchorLink'
import Reveal from '../components/Reveal'
import ServiceScene from '../components/ServiceScene'
import HowWeOperate from '../components/HowWeOperate'

/**
 * One service. On desktop its blocks play as one fixed scene under the header:
 * information on the left half, the visual on the right half, one block at a
 * time; scrolling swaps block and visual together, one block per screen of
 * scroll (argo.css, "Service pages: the scene"). The page title shows above
 * them on the first block. On phones and short screens the blocks simply
 * stack, each with its visual below it.
 */
export default function ServicePage({ index }) {
  const { t } = useLang()
  const service = t.services.items[index]
  const blocks = service.sections
  const [active, setActive] = useState(0)
  const storyRef = useRef(null)
  const afterRef = useRef(null)

  // The active block follows the scroll position through the scene: one
  // screen of scroll per block, switching halfway between two stops.
  useEffect(() => {
    let frame = 0
    const update = () => {
      frame = 0
      const story = storyRef.current
      const stop = story && story.querySelector('.svc-stop')
      if (!stop || getComputedStyle(stop).display === 'none') return setActive(0) // stacked layout
      // How far the scene has run: the story's top against the line the stage
      // sticks to (just under the header), in screens.
      const stickAt = parseFloat(getComputedStyle(story.querySelector('.svc-stage')).top) || 0
      const run = stickAt - story.getBoundingClientRect().top
      setActive(Math.min(blocks.length - 1, Math.max(0, Math.round(run / stop.offsetHeight))))
    }
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update)
    }
    update()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [blocks.length])

  // Snapping (argo.css, html.svc-snap) only while the scene is on screen:
  // once what comes after it reaches the top half, ordinary scrolling.
  useEffect(() => {
    const root = document.documentElement
    // Snapping switched back on mid-scroll (coming up from below) can leave the
    // page between two stops: when that scroll stops, settle on the nearest.
    // Only then; the rest of the time the browser's own snapping does it.
    let pendingSettle = false
    let timer
    const observer = new IntersectionObserver(
      ([entry]) => {
        const snap = !entry.isIntersecting
        if (snap && !root.classList.contains('svc-snap')) pendingSettle = true
        root.classList.toggle('svc-snap', snap)
      },
      { rootMargin: '0px 0px -50% 0px' },
    )
    observer.observe(afterRef.current)

    const settle = () => {
      if (!pendingSettle) return
      pendingSettle = false
      if (getComputedStyle(root).scrollSnapType === 'none') return // phones, short screens
      const offset = parseFloat(getComputedStyle(root).scrollPaddingTop) || 0
      const stops = [...storyRef.current.querySelectorAll('.svc-stop'), afterRef.current]
        .map((el) => el.getBoundingClientRect().top + window.scrollY - offset)
      const nearest = stops.reduce((a, b) => (Math.abs(b - window.scrollY) < Math.abs(a - window.scrollY) ? b : a))
      if (Math.abs(nearest - window.scrollY) > 2) window.scrollTo({ top: nearest })
    }
    const onScroll = () => {
      clearTimeout(timer)
      timer = setTimeout(settle, 180)
    }
    window.addEventListener('scroll', onScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', onScroll)
      clearTimeout(timer)
      root.classList.remove('svc-snap')
    }
  }, [])

  const pad = (n) => String(n).padStart(2, '0')

  return (
    <main id="main" className="page svc-page">
      <section className="svc-story" ref={storyRef} style={{ '--blocks': blocks.length }}>
        {/* Snap points, one screen apart: one per block. */}
        {blocks.map((section, blockIndex) => (
          <div className="svc-stop" style={{ '--i': blockIndex }} aria-hidden="true" key={blockIndex} />
        ))}

        {/* The stage: one screen, fixed while the story scrolls by. The page
            title shows on the first block only (is-past folds it away). */}
        <div className={active > 0 ? 'svc-stage is-past' : 'svc-stage'}>
          <div className="container svc-frame">
            <Reveal className="svc-head">
              <AnchorLink id="services" className="eyebrow svc-back">{t.services.title}</AnchorLink>
              <h1 className="section-title">{service.title}</h1>
              <p className="section-sub">{service.subtitle}</p>
            </Reveal>

            <div className="svc-grid">
              <div className="svc-text">
                <div className="svc-blocks">
                  {blocks.map((section, blockIndex) => (
                    <article
                      className={blockIndex === active ? 'svc-section is-active' : 'svc-section'}
                      data-section={blockIndex}
                      key={blockIndex}
                    >
                      <header className="svc-index">
                        <span className="svc-num" aria-hidden="true">{pad(blockIndex + 1)}</span>
                        <h2>{section.heading}</h2>
                        <p className="tagline">{section.headline}</p>
                      </header>
                      <ul className="svc-items">
                        {section.items.map((item) => (
                          <li key={item.name}>
                            <h3>{item.name}</h3>
                            <p>{item.desc}</p>
                          </li>
                        ))}
                      </ul>
                      {/* Stacked layout: the visual goes under its block. */}
                      <div className="svc-visual-inline"><ServiceScene service={index} section={blockIndex} /></div>
                    </article>
                  ))}
                </div>

                <p className="svc-progress" aria-hidden="true">
                  <span><b>{pad(active + 1)}</b> / {pad(blocks.length)}</span>
                  <span className="svc-dots">
                    {blocks.map((section, blockIndex) => <i className={blockIndex === active ? 'on' : undefined} key={blockIndex} />)}
                  </span>
                </p>
              </div>

              <div className="svc-visual" aria-hidden="true">
                {blocks.map((section, blockIndex) => (
                  <div className={blockIndex === active ? 'svc-scene is-active' : 'svc-scene'} key={blockIndex}>
                    <ServiceScene service={index} section={blockIndex} active={blockIndex === active} />
                    <p className="svc-caption"><span>{pad(blockIndex + 1)}</span>{section.heading}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* After the scene: ordinary scrolling again, no snapping. */}
      <div className="container svc-after" ref={afterRef}>
        {/* Branding has no steps of its own, so no box there. */}
        {service.howWeOperate && <HowWeOperate steps={service.howWeOperate} />}

        <Reveal className="about-cta">
          <h2>{t.about.ctaTitle}</h2>
          <p>{t.about.ctaSub}</p>
          <Link className="btn btn-gold" to="/contact">{t.about.cta}</Link>
        </Reveal>
      </div>
    </main>
  )
}
