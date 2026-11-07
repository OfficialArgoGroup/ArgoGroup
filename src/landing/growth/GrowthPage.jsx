import { SYMBOL_H, SYMBOL_PATH, SYMBOL_W } from './BrandSymbol.jsx'
import { CtaButton, Dock, Footer, TopBar, WhatsAppIcon } from './chrome.jsx'
import { about, chrome, finalCta, hero, method, thankYou, WHATSAPP_LINK, WHATSAPP_URL, work } from './copy.js'
import FormPanel from './FormPanel.jsx'
import ThankYou from '../shared/ThankYou.jsx'
import Ticker from './Ticker.jsx'
import WorkList from './WorkList.jsx'
import { useCookieBanner } from '../shared/useCookieBanner.js'
import { useFormPanel } from '../shared/useFormPanel.js'
import { useReveal } from '../shared/useReveal.js'
import { usePauseOffscreen } from '../shared/usePauseOffscreen.js'
import { scrollToForm } from '../shared/scrollToForm.js'
import { useFold } from '../shared/useFold.jsx'

const pad = (n) => String(n).padStart(2, '0')

/**
 * One span per word, so each can rise out of its own mask (growth.css, .w).
 * Words from `goldFrom` on are set in gold; with `wideTail` they show on wide
 * screens only (the narrow hero moves them above the form).
 */
function Words({ text, goldFrom = Infinity, wideTail = false }) {
  return text.split(' ').map((word, index) => (
    // The space sits outside the clipped span, or it would be trimmed away.
    <span key={index} className={wideTail && index >= goldFrom ? 'only-wide' : undefined}>
      <span className={index >= goldFrom ? 'w gold' : 'w'} style={{ '--i': index }}><span>{word}</span></span>{' '}
    </span>
  ))
}

// The default headline (1b) is the long one: on narrow screens the hero
// keeps its first sentence, and its gold sentence moves above the form
// (copy.js, hero.narrow).
const SPLIT = '1b'
const splitText = hero.headlines.find(([keys]) => keys === SPLIT)[1]
const SPLIT_TAIL = splitText.slice(splitText.lastIndexOf('. ') + 2)

/** The three differentiators. */
function Points({ className = '' }) {
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

/** The hero headline per variant; the sentence after the last full stop is gold. */
function Headline({ options }) {
  return options.map(([keys, text]) => {
    const lastStop = text.lastIndexOf('. ')
    const goldFrom = lastStop > 0 ? text.slice(0, lastStop + 1).split(' ').length : Infinity
    return (
      <span key={keys} className="vx" data-show={keys}>
        <Words text={text} goldFrom={goldFrom} wideTail={keys === SPLIT} />
      </span>
    )
  })
}

/**
 * /growth, the Meta Ads landing. Conversion-only: no menu, and the only ways
 * out are WhatsApp, email, Privacy, Terms and Cookies. Every text is the
 * client's own (copy.js).
 *
 *   1. Hero + form     the ad's headline, three differentiators, the form
 *                      (phones: a shorter hero, a button down to the form)
 *   2. What we work on five areas, a line on each
 *   3. Method          decide first, four steps, the proof block
 *   4. Who we are      how we work, Barcelona · Miami
 *   5. Close           final CTA, direct contact, legal
 *
 * On wide screens the form is docked on the right for the whole page; on
 * phones it follows the hero and a bottom bar reopens it as a sheet.
 */
export function GrowthPage() {
  const cookies = useCookieBanner()
  const { sheetOpen, openForm, closeForm } = useFormPanel()
  useReveal()
  usePauseOffscreen()
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
            {/* Wide screens: the brief's hero. Phones and portrait tablets:
                shorter, with a button down to the form (hero.narrow). */}
            <p className="eyebrow">
              <span className="only-wide">{hero.eyebrow}</span>
              <span className="only-narrow">{hero.narrow.eyebrow}</span>
            </p>
            <h1 className="hero-title"><Headline options={hero.headlines} /></h1>
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
          {/* Phones and portrait tablets: what left the hero, just above the
              form (the 1b gold sentence shows for 1b only, growth.css). */}
          <div className="form-intro only-narrow">
            <p className="moved-line">{SPLIT_TAIL}</p>
            <Points />
          </div>
        </FormPanel>

        <Ticker items={work.items.map(([title]) => title)} />

        {/* 2 · What we work on */}
        <section className="section tone-light" aria-labelledby="work-title" {...fold('work')}>
          <div className="wrap content">
            <p className="bridge" data-reveal="">{work.bridge}</p>
            <h2 id="work-title" className="section-title" data-reveal="words"><Words text={work.title} goldFrom={lastWords(work.title, 2)} /></h2>
            <WorkList items={work.items} />
            {seeMore('work')}
          </div>
        </section>

        {/* 3 · Method */}
        <section className="section tone-dark plate" aria-labelledby="method-title" data-reveal="plate" {...fold('method')}>
          <div className="wrap content">
            <h2 id="method-title" className="section-title" data-reveal="words"><Words text={method.title} goldFrom={lastWords(method.title, 6)} /></h2>
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
            <blockquote className="proof" data-reveal="draw">
              <p className="proof-title">{method.proof.title}</p>
              <p>{method.proof.body}</p>
            </blockquote>
            <div className="meaning" data-reveal="clip">
              <h3 className="meaning-title">{method.meaningTitle}</h3>
              <p className="meaning-line">{method.meaning}</p>
            </div>
            {seeMore('method')}
          </div>
        </section>

        {/* 4 · Who we are */}
        <section className="section tone-light" aria-labelledby="about-title" {...fold('about')}>
          <div className="wrap content">
            <h2 id="about-title" className="section-title" data-reveal="words"><Words text={about.title} goldFrom={lastWords(about.title, 3)} /></h2>
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
            <h2 id="final-title" className="section-title" data-reveal="words"><Words text={finalCta.title} goldFrom={lastWords(finalCta.title, 2)} /></h2>
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

/** /growth/thank-you. Same bar and style, no navigation, no calendar. */
export function GrowthThankYou() {
  const cookies = useCookieBanner()
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
