import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import AnchorLink from './AnchorLink'
import { InstagramIcon, LinkedInIcon } from './icons'
import { ArgoSymbol } from './Logo'
import { SERVICE_PATHS, site } from '../site.js'
import { SECTIONS } from '../sections.js'

export default function Navbar() {
  const { t, lang, setLang } = useLang()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  // Over an ink panel (the black version of the home hero marks itself
  // data-nav-ink) the bar stays transparent on light inks, however far it has
  // scrolled: that hero holds the screen for three viewports while its globe
  // dives. The home hero is cream now, so no page starts over ink; if it goes
  // back to black, start this as pathname === '/' so the prerendered HTML
  // already has the light inks.
  const [overInk, setOverInk] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const navRef = useRef(null)
  const [visibleSection, setVisibleSection] = useState(null)

  // Only the homepage has sections; elsewhere nothing is underlined.
  const activeSection = pathname === '/' ? visibleSection : null

  // Solid background once the page has moved off the hero.
  useEffect(() => {
    const onScroll = () => {
      setScrolled(document.documentElement.scrollTop > 24)
      const panel = document.querySelector('[data-nav-ink]')
      const barHeight = navRef.current ? navRef.current.offsetHeight : 0
      setOverInk(Boolean(panel) && panel.getBoundingClientRect().bottom > barHeight)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    window.addEventListener('resize', onScroll)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('resize', onScroll)
    }
  }, [pathname])

  // Underline whichever section is filling the viewport. Only the homepage has
  // sections to track.
  useEffect(() => {
    if (pathname !== '/') return

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setVisibleSection(entry.target.id)
        }
      },
      { rootMargin: '-40% 0px -55% 0px' },
    )

    for (const section of SECTIONS) {
      const el = document.getElementById(section.id)
      if (el) observer.observe(el)
    }
    return () => observer.disconnect()
  }, [pathname])

  const closeMenu = () => setMenuOpen(false)

  return (
    <>
      <nav ref={navRef} className={overInk ? 'nav over-ink' : scrolled ? 'nav scrolled' : 'nav'} id="nav" aria-label={site.name}>
        <div className="container nav-inner">
          <Brand onClick={closeMenu} />

          <div className="nav-links">
            {SECTIONS.map((section) => (section.id === 'services' ? (
              <ServicesMenu
                key={section.id}
                active={activeSection === section.id || SERVICE_PATHS.includes(pathname)}
              />
            ) : (
              <AnchorLink
                key={section.id}
                id={section.id}
                className={activeSection === section.id ? 'nav-link active' : 'nav-link'}
              >
                {t.nav[section.key]}
              </AnchorLink>
            )))}
            <Link className={pathname === '/about' ? 'nav-link active' : 'nav-link'} to="/about">
              {t.nav.about}
            </Link>
          </div>

          <div className="nav-actions">
            <a className="social-btn" href={site.sameAs[0]} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn">
              <LinkedInIcon />
            </a>
            <a className="social-btn" href={site.sameAs[1]} target="_blank" rel="noopener noreferrer" aria-label="Instagram">
              <InstagramIcon />
            </a>
            <LangToggle lang={lang} setLang={setLang} />
            <AnchorLink id="contact" className="btn btn-gold">
              {t.nav.cta}
            </AnchorLink>
            <button
              className="nav-burger"
              aria-label={t.nav.cta}
              aria-expanded={menuOpen}
              aria-controls="mobileMenu"
              onClick={() => setMenuOpen((open) => !open)}
            >
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      <div className={menuOpen ? 'mobile-menu open' : 'mobile-menu'} id="mobileMenu">
        {SECTIONS.map((section) => (section.id === 'services' ? (
          // No room to hide anything here: the three landings are simply listed.
          <div className="mobile-submenu" key={section.id}>
            <span className="mobile-submenu-label">{t.nav[section.key]}</span>
            {t.services.items.map((service, index) => (
              <Link className="nav-link" to={SERVICE_PATHS[index]} onClick={closeMenu} key={SERVICE_PATHS[index]}>
                {service.title}
              </Link>
            ))}
          </div>
        ) : (
          <AnchorLink key={section.id} id={section.id} className="nav-link" onNavigate={closeMenu}>
            {t.nav[section.key]}
          </AnchorLink>
        )))}
        <Link className="nav-link" to="/about" onClick={closeMenu}>{t.nav.about}</Link>
        <Link className="nav-link" to="/contact" onClick={closeMenu}>{t.nav.contact}</Link>
        <div className="mobile-menu-footer">
          <LangToggle lang={lang} setLang={setLang} />
          <AnchorLink id="contact" className="btn btn-gold" onNavigate={closeMenu}>{t.nav.cta}</AnchorLink>
        </div>
      </div>
    </>
  )
}

/**
 * "Services" and its three landings. It opens on hover with a mouse and on
 * click or tap otherwise; the links stay in the HTML for crawlers either way.
 */
function ServicesMenu({ active }) {
  const { t } = useLang()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const rootRef = useRef(null)
  const buttonRef = useRef(null)
  const hovering = useRef(false)

  useEffect(() => {
    if (!open) return
    const onPointerDown = (event) => {
      if (!rootRef.current.contains(event.target)) setOpen(false)
    }
    const onKeyDown = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      buttonRef.current.focus()
    }
    document.addEventListener('pointerdown', onPointerDown)
    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('pointerdown', onPointerDown)
      document.removeEventListener('keydown', onKeyDown)
    }
  }, [open])

  const onHover = (entering) => (event) => {
    if (event.pointerType !== 'mouse') return
    hovering.current = entering
    setOpen(entering)
  }

  return (
    <div
      className={open ? 'nav-menu open' : 'nav-menu'}
      ref={rootRef}
      onPointerEnter={onHover(true)}
      onPointerLeave={onHover(false)}
      onBlur={(event) => {
        if (!rootRef.current.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        ref={buttonRef}
        className={active ? 'nav-link nav-menu-button active' : 'nav-link nav-menu-button'}
        aria-expanded={open}
        aria-controls="servicesMenu"
        // The hover already opened it: a click there must not shut it again.
        onClick={(event) => {
          if (!(event.detail > 0 && hovering.current)) setOpen((current) => !current)
        }}
      >
        {t.nav.services}
        <span className="nav-chevron" aria-hidden="true" />
      </button>
      <div className="nav-menu-panel" id="servicesMenu">
        <ul>
          {t.services.items.map((service, index) => (
            <li key={SERVICE_PATHS[index]}>
              <Link
                to={SERVICE_PATHS[index]}
                aria-current={pathname === SERVICE_PATHS[index] ? 'page' : undefined}
                onClick={() => setOpen(false)}
              >
                {service.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

function Brand({ onClick }) {
  return (
    <Link className="brand" to="/" aria-label={site.name} onClick={onClick}>
      <ArgoSymbol className="brand-symbol" />
    </Link>
  )
}

export function LangToggle({ lang, setLang }) {
  return (
    <div className="lang-toggle" role="group" aria-label="Language">
      {['es', 'en'].map((code) => (
        <button
          key={code}
          type="button"
          className={lang === code ? 'active' : undefined}
          aria-pressed={lang === code}
          onClick={() => setLang(code)}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  )
}
