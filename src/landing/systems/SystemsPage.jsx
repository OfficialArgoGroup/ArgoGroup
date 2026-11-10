import { useCookieBanner } from '../shared/useCookieBanner.js'
import { useFormPanel } from '../shared/useFormPanel.js'
import { useReveal } from '../shared/useReveal.js'
import { usePauseOffscreen } from '../shared/usePauseOffscreen.js'
import { scrollToForm } from '../shared/scrollToForm.js'
import { useFold } from '../shared/useFold.jsx'
import ThankYou from '../shared/ThankYou.jsx'
import { SYMBOL_H, SYMBOL_PATH, SYMBOL_W } from './BrandSymbol.jsx'
import { CtaButton, Dock, Footer, TopBar, WhatsAppIcon } from './chrome.jsx'
import { useCopy } from './copy.js'
import FormPanel from './FormPanel.jsx'
import PlatformMock from './PlatformMock.jsx'
import Ticker from './Ticker.jsx'
import WorkList from './WorkList.jsx'

const pad = (n) => String(n).padStart(2, '0')

/**
 * One span per word, so each can rise out of its own mask (systems.css, .w).
 * Words from `goldFrom` on are set in gold; with `wideTail` they show on wide
 * screens only (the phone hero moves them above the form).
 */
function Words({ text, goldFrom = Infinity, wideTail = false }) {
  return text.split(' ').map((word, index) => (
    // The space sits outside the clipped span, or it would be trimmed away.
    <span key={index} className={wideTail && index >= goldFrom ? 'only-wide' : undefined}>
      <span className={index >= goldFrom ? 'w gold' : 'w'} style={{ '--i': index }}><span>{word}</span></span>{' '}
    </span>
  ))
}

/** The three differentiators. */
function Points({ className = '' }) {
  const { hero } = useCopy()
  return (
    <ul className={className ? `points ${className}` : 'points'}>
      {hero.points.map(([title, line], index) => (
        <li key={title} style={{ '--i': index }}>
          <strong>{title}</strong> {line}
        </li>
      ))}
    </ul>
  )
}

function Arrow() {
  return (
    <svg className="btn-arrow" viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" focusable="false">
      <path d="M4 12h14M12 5l7 7-7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

/** Gold from `count` words before the end. */
const lastWords = (text, count) => text.split(' ').length - count

/** Gold from the sentence after the last full stop. */
const lastSentence = (text) => {
  const lastStop = text.lastIndexOf('. ')
  return lastStop > 0 ? text.slice(0, lastStop + 1).split(' ').length : Infinity
}

/** A sentence whose last sentence gets a gold underline drawn on reveal. */
function Marked({ text }) {
  const lastStop = text.lastIndexOf('. ')
  if (lastStop < 0) return text
  return (
    <>
      {text.slice(0, lastStop + 2)}
      <em className="mark">{text.slice(lastStop + 2)}</em>
    </>
  )
}

/**
 * /systems, the Meta Ads landing for custom systems, AI and applications.
 * Conversion-only: no menu, and the only ways out are WhatsApp, email,
 * Privacy, Terms and Cookies. Every text is the client's own (copy.js).
 * Same design as /growth.
 *
 *   1. Hero + form     the headline, three differentiators, the form
 *   2. What we build   the illustrative interface, four blocks, the focus line
 *   3. Method          four steps, what that means for you
 *   4. Who we are      how we work, Barcelona · Miami
 *   5. Close           final CTA, direct contact, legal
 *
 * On wide screens the form is docked on the right for the whole page; on
 * phones it follows the hero and a bottom bar reopens it as a sheet.
 */
export function SystemsPage() {
  const cookies = useCookieBanner()
  const { sheetOpen, openForm, closeForm } = useFormPanel()
  useReveal()
  usePauseOffscreen()
  const { about, chrome, finalCta, gold, hero, method, WHATSAPP_URL, work } = useCopy()
  // Phones: the long parts of sections 2–4 fold behind "See more".
  const { fold, seeMore } = useFold(chrome.added)

  return (
    <>
      {/* Thin gold line that fills as the page is read (CSS scroll timeline). */}
      <div className="progress" aria-hidden="true" />
      <TopBar />
      <main id="main" className="page">
        {/* 1 · Hero */}
        <section id="hero" className="hero tone-dark">
          <div className="wrap content">
            {/* Wide screens: the brief's hero. Phones and tablets: shorter, with a
                button down to the form (hero.narrow). */}
            <p className="eyebrow">{hero.eyebrow}</p>
            <h1 className="hero-title"><Words text={hero.headline} goldFrom={lastSentence(hero.headline)} wideTail /></h1>
            <p className="hero-sub only-wide">{hero.subtitle}</p>
            <p className="hero-sub only-narrow">{hero.narrow.subtitle}</p>
            {/* Phones and portrait tablets: the review button, its line and WhatsApp.
                Wide screens have the form beside the hero and need no button. */}
            <div className="hero-cta only-narrow">
              <a className="btn btn-boom" href="#form" onClick={scrollToForm}>{hero.narrow.button}<Arrow /></a>
              <p className="hero-note">{hero.narrow.note}</p>
              <a className="wa-link" href={WHATSAPP_URL} target="_blank" rel="noopener">{hero.narrow.whatsapp}</a>
            </div>
            <Points className="only-wide" />
          </div>
        </section>

        <FormPanel sheetOpen={sheetOpen} onClose={closeForm}>
          {/* Phones and tablets: what left the first screen, just above the form. */}
          <div className="form-intro only-narrow">
            <p className="form-intro-line">{hero.headline.slice(hero.headline.lastIndexOf('. ') + 2)}</p>
            <Points />
          </div>
        </FormPanel>

        <Ticker items={work.items.map(([title]) => title)} />

        {/* 2 · What we build */}
        <section className="section tone-light" aria-labelledby="work-title" {...fold('work')}>
          <div className="wrap content">
            <p className="bridge" data-reveal=""><Marked text={work.bridge} /></p>
            <h2 id="work-title" className="section-title" data-reveal="words"><Words text={work.title} goldFrom={lastWords(work.title, gold.work)} /></h2>
            <PlatformMock mock={work.mock} />
            <WorkList items={work.items} />
            <p className="focus" data-reveal="clip">{work.closing}</p>
            {seeMore('work')}
          </div>
        </section>

        {/* 3 · Method */}
        <section className="section tone-dark plate" aria-labelledby="method-title" data-reveal="plate" {...fold('method')}>
          <div className="wrap content">
            <h2 id="method-title" className="section-title" data-reveal="words"><Words text={method.title} goldFrom={lastSentence(method.title)} /></h2>
            <p className="lead" data-reveal="">{method.intro}</p>
            <ol className="steps">
              {method.steps.map(([title, text], index) => (
                <li key={title} data-reveal="card" style={{ '--i': index }}>
                  <span className="num" aria-hidden="true">{pad(index + 1)}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </li>
              ))}
            </ol>
            <div className="meaning">
              <h3 className="meaning-title" data-reveal="clip">{method.meaningTitle}</h3>
              <ul className="meaning-rows">
                {method.meaning.map(([title, text], index) => (
                  <li key={title} data-reveal="left" style={{ '--i': index }}><strong>{title}</strong> {text}</li>
                ))}
              </ul>
            </div>
            {seeMore('method')}
          </div>
        </section>

        {/* 4 · Who we are */}
        <section className="section tone-light" aria-labelledby="about-title" {...fold('about')}>
          <div className="wrap content">
            <h2 id="about-title" className="section-title" data-reveal="words"><Words text={about.title} goldFrom={lastSentence(about.title)} /></h2>
            <p className="lead" data-reveal="">{about.intro}</p>
            <ul className="rows">
              {about.rows.map(([title, text], index) => (
                <li key={title} data-reveal="left" style={{ '--i': index }}><strong>{title}</strong> {text}</li>
              ))}
            </ul>
            <p className="about-closing" data-reveal="clip">{about.closing}</p>
            <p className="cities-line">{about.cities}</p>
            {seeMore('about')}
          </div>
        </section>

        {/* 5 · Close */}
        <section className="section tone-dark final plate" aria-labelledby="final-title" data-reveal="plate">
          <div className="wrap content">
            <h2 id="final-title" className="section-title" data-reveal="words"><Words text={finalCta.title} goldFrom={lastWords(finalCta.title, gold.final)} /></h2>
            <p className="lead" data-reveal="">{finalCta.sub}</p>
            <CtaButton className="final-cta btn-boom" onOpen={openForm}>{finalCta.button}</CtaButton>
            <p className="contact">
              {finalCta.contactLead}{' '}
              <a href={WHATSAPP_URL} target="_blank" rel="noopener">{finalCta.whatsapp}</a>
              {' · '}
              <a href={`mailto:${finalCta.email}`}>{finalCta.email}</a>
            </p>
            <p className="cities-line">{finalCta.cities}</p>
          </div>
        </section>
      </main>
      <Footer onCookies={cookies.reopen} />
      <Dock cookies={cookies} onOpenForm={openForm} sheetOpen={sheetOpen} />
    </>
  )
}

/** /systems/thank-you. Same bar and style, no navigation, no calendar. */
export function SystemsThankYou() {
  const cookies = useCookieBanner()
  const { thankYou, WHATSAPP_LINK, WHATSAPP_URL } = useCopy()
  // No scroll reveals here; it tells boot.js the page script ran, so motion stays on.
  useReveal()

  return (
    <>
      <TopBar />
      <ThankYou
        copy={thankYou}
        symbol={{ path: SYMBOL_PATH, width: SYMBOL_W, height: SYMBOL_H }}
        whatsapp={{ url: WHATSAPP_URL, label: WHATSAPP_LINK, icon: <WhatsAppIcon /> }}
      />
      <div className="tone-dark">
        <Footer onCookies={cookies.reopen} />
      </div>
      <Dock cookies={cookies} />
    </>
  )
}
