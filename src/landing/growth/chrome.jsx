import { useEffect, useState } from 'react'
import BrandSymbol from './BrandSymbol.jsx'
import { useCopy } from './copy.js'

/** Text that differs per ad variant. CSS shows the span matching <html data-variant>. */
export function Vary({ options }) {
  return options.map(([keys, text]) => (
    <span key={keys} className="vx" data-show={keys}>{text}</span>
  ))
}

/**
 * Every CTA leads to the one form. It is a link to #form so it still works
 * before hydration; once hydrated, `onOpen` takes over (focus the docked form
 * on desktop, open the bottom sheet on phones).
 */
export function CtaButton({ children, className = '', onOpen }) {
  const { CTA } = useCopy()
  const open = (event) => {
    if (!onOpen) return
    event.preventDefault()
    onOpen()
  }
  return <a className={`btn ${className}`} href="#form" onClick={open}>{children ?? CTA}</a>
}

/** Chat bubble with a handset: reads as WhatsApp without using its logo file. */
export function WhatsAppIcon() {
  return (
    <svg className="wa-icon" viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" focusable="false">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path transform="translate(6.6 6.1) scale(0.45)" d="M20.01 15.38c-1.23 0-2.42-.2-3.53-.56-.35-.12-.74-.03-1.01.24l-1.57 1.97c-2.83-1.35-5.48-3.9-6.89-6.83l1.95-1.66c.27-.28.35-.67.24-1.02-.37-1.11-.56-2.3-.56-3.53 0-.54-.45-.99-.99-.99H4.19C3.65 3 3 3.24 3 3.99 3 13.28 10.73 21 20.01 21c.71 0 .99-.63.99-1.18v-3.45c0-.54-.45-.99-.99-.99z" fill="currentColor" />
    </svg>
  )
}

/**
 * "BARCELONA · MIAMI" as a flight route: a thin gold line between the two,
 * with a light that travels from one city to the other (css .route). Screen
 * readers get the plain text.
 */
function Cities() {
  const { chrome } = useCopy()
  const [from, to] = chrome.cities.split(' · ')
  return (
    <span className="cities">
      {from}
      <span className="route" aria-hidden="true"><i /></span>
      <span className="sr-only"> · </span>
      {to}
    </span>
  )
}

export function TopBar() {
  const { chrome } = useCopy()
  return (
    <header className="topbar">
      <div className="wrap topbar-inner">
        <BrandSymbol className="logo-symbol" title={chrome.logo} />
        <Cities />
      </div>
    </header>
  )
}

export function Footer({ onCookies }) {
  const { chrome, PRIVACY_URL, TERMS_URL } = useCopy()
  const { copyright, privacy, terms, cookies } = chrome.footer
  return (
    <footer className="footer">
      <div className="wrap footer-inner">
        <span>{copyright}</span>
        <span aria-hidden="true">·</span>
        <a href={PRIVACY_URL} target="_blank" rel="noopener">{privacy}</a>
        <span aria-hidden="true">·</span>
        <a href={TERMS_URL} target="_blank" rel="noopener">{terms}</a>
        <span aria-hidden="true">·</span>
        <button type="button" className="linklike" onClick={onCookies}>{cookies}</button>
      </div>
    </footer>
  )
}

/**
 * Phone bar: shows once the hero and the form under it have scrolled away,
 * hides again whenever the form is on screen.
 */
function useStickyCta(enabled) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!enabled) return undefined
    const hero = document.getElementById('hero')
    const form = document.getElementById('form')
    if (!hero || !form || !('IntersectionObserver' in window)) return undefined

    let heroGone = false
    let formShown = false
    const update = () => setVisible(heroGone && !formShown)

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === hero) heroGone = !entry.isIntersecting && entry.boundingClientRect.top < 0
        if (entry.target === form) formShown = entry.isIntersecting
      }
      update()
    })
    observer.observe(hero)
    observer.observe(form)
    return () => observer.disconnect()
  }, [enabled])

  return visible
}

/**
 * Everything fixed to the bottom of the screen, stacked in one column so the
 * pieces never cover each other: WhatsApp button, sticky CTA, cookie bar.
 */
export function Dock({ cookies, onOpenForm, sheetOpen = false }) {
  const { chrome, PRIVACY_URL, WHATSAPP_URL } = useCopy()
  const stickyVisible = useStickyCta(Boolean(onOpenForm)) && !sheetOpen
  // Client only: see the cookie bar below.
  const [running, setRunning] = useState(false)
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setRunning(true), [])

  return (
    <div className="dock">
      <a className="wa-float" href={WHATSAPP_URL} target="_blank" rel="noopener">
        <WhatsAppIcon />
        <span>{chrome.whatsappLabel}</span>
      </a>
      {onOpenForm && (
        // Hidden with visibility (see .sticky-cta), which also takes the link
        // out of the tab order while it is off screen.
        <div className="sticky-cta" data-visible={stickyVisible ? 'true' : 'false'}>
          <CtaButton className="btn-block btn-boom" onOpen={onOpenForm} />
          <a className="sticky-wa" href={WHATSAPP_URL} target="_blank" rel="noopener"><WhatsAppIcon /><span>{chrome.whatsappLabel}</span></a>
        </div>
      )}
      {/* Only once the page runs: without JavaScript its buttons could not work. */}
      {running && cookies.visible && (
        <section
          className="cookie-bar"
          aria-label="Cookies"
          data-reopened={cookies.reopened ? 'true' : undefined}
        >
          <p>
            {cookies.informative ? chrome.cookieInformative : chrome.cookie}{' '}
            <a href={PRIVACY_URL} target="_blank" rel="noopener">{chrome.cookiePrivacy}</a>
          </p>
          <div className="cookie-actions">
            {cookies.informative
              ? <button type="button" className="cookie-btn" onClick={() => cookies.choose('acknowledged')}>{chrome.ok}</button>
              : <button type="button" className="cookie-btn" onClick={() => cookies.choose('accepted')}>{chrome.accept}</button>}
            <button type="button" className="cookie-btn" onClick={() => cookies.choose('rejected')}>{chrome.reject}</button>
          </div>
        </section>
      )}
    </div>
  )
}
