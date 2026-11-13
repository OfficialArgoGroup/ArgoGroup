import { useEffect, useRef, useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import AnchorLink from './AnchorLink'
import { ChevronDown, InstagramIcon, LinkedInIcon } from './icons'
import { ArgoSymbol } from './Logo'
import { site } from '../site.js'
import { SECTIONS } from '../sections.js'
import { SERVICE_PAGES } from '../services.js'

export default function Navbar() {
  const { t, lang, setLang } = useLang()
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const [visibleSection, setVisibleSection] = useState(null)

  // Only the homepage has sections; elsewhere nothing is underlined.
  const activeSection = pathname === '/' ? visibleSection : null

  // Solid background once the page has moved off the hero.
  useEffect(() => {
    const onScroll = () => setScrolled(document.documentElement.scrollTop > 24)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

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
      <nav className={scrolled ? 'nav scrolled' : 'nav'} id="nav" aria-label={site.name}>
        <div className="container nav-inner">
          <Brand onClick={closeMenu} />

          <div className="nav-links">
            <ServicesMenu />
            {SECTIONS.filter((section) => section.id !== 'services').map((section) => (
              <AnchorLink
                key={section.id}
                id={section.id}
                className={activeSection === section.id ? 'nav-link active' : 'nav-link'}
              >
                {t.nav[section.key]}
              </AnchorLink>
            ))}
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
            <AnchorLink id="contact" className="btn btn-gold" local>
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
        <span className="nav-link mobile-menu-label">{t.nav.services}</span>
        {SERVICE_PAGES.map((page, index) => (
          <Link
            key={page.path}
            className={pathname === page.path ? 'nav-link mobile-menu-sub active' : 'nav-link mobile-menu-sub'}
            to={page.path}
            onClick={closeMenu}
          >
            {t.services.items[index].title}
          </Link>
        ))}
        {SECTIONS.filter((section) => section.id !== 'services').map((section) => (
          <AnchorLink key={section.id} id={section.id} className="nav-link" onNavigate={closeMenu}>
            {t.nav[section.key]}
          </AnchorLink>
        ))}
        <Link className="nav-link" to="/about" onClick={closeMenu}>{t.nav.about}</Link>
        <Link className="nav-link" to="/contact" onClick={closeMenu}>{t.nav.contact}</Link>
        <div className="mobile-menu-footer">
          <LangToggle lang={lang} setLang={setLang} />
          <AnchorLink id="contact" className="btn btn-gold" onNavigate={closeMenu} local>{t.nav.cta}</AnchorLink>
        </div>
      </div>
    </>
  )
}

/**
 * «Services ▾» on desktop: the three service pages. Opens on hover (CSS), on
 * click or tap, and from the keyboard; Escape, a click outside or choosing a
 * page closes it.
 */
function ServicesMenu() {
  const { t } = useLang()
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const onServicePage = SERVICE_PAGES.some((page) => page.path === pathname)

  // Close it when the page changes. Adjusted during render, not in an effect.
  const [lastPath, setLastPath] = useState(pathname)
  if (lastPath !== pathname) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onPointer = (event) => {
      if (!ref.current?.contains(event.target)) setOpen(false)
    }
    const onKey = (event) => {
      if (event.key !== 'Escape') return
      setOpen(false)
      ref.current?.querySelector('button')?.focus()
    }
    document.addEventListener('pointerdown', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('pointerdown', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  return (
    <div
      ref={ref}
      className={open ? 'nav-dropdown open' : 'nav-dropdown'}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false)
      }}
    >
      <button
        type="button"
        className={onServicePage ? 'nav-link nav-dropdown-toggle active' : 'nav-link nav-dropdown-toggle'}
        aria-expanded={open}
        aria-controls="servicesMenu"
        onClick={() => setOpen((value) => !value)}
      >
        {t.nav.services}
        <ChevronDown size={14} />
      </button>
      <div className="nav-dropdown-panel" id="servicesMenu">
        {SERVICE_PAGES.map((page, index) => (
          <Link
            key={page.path}
            className={pathname === page.path ? 'nav-dropdown-item active' : 'nav-dropdown-item'}
            aria-current={pathname === page.path ? 'page' : undefined}
            to={page.path}
            onClick={() => setOpen(false)}
          >
            {t.services.items[index].title}
          </Link>
        ))}
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
