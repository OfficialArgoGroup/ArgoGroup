import { useEffect, useId, useRef, useState } from "react";
import { GlobeScene } from "./globeScene.js";
import { ARGO_MARK_PATH, ARGO_MARK_VIEWBOX } from "./argoMark.js";
import "./ArgoHero.css";

const DEFAULT_LINKS = [
  { label: "Servicios", href: "#servicios" },
  { label: "Casos", href: "#casos" },
  { label: "Nosotros", href: "#nosotros" },
  { label: "Contacto", href: "#contacto" },
];

// Example figures — swap for real case-study numbers before launch.
// city must match a name in CITIES (globeScene.js); side: 1 = right gutter, -1 = left;
// hang: where the card sits relative to its marker.
const DEFAULT_CARDS = [
  { city: "Barcelona", side: 1, hang: "below", label: "Barcelona · Ads", before: "ROAS ", gold: "4.2x", after: "", caption: "Meta + Google · 90 days" },
  { city: "Miami", side: -1, hang: "mid", label: "Miami · CRM", before: "", gold: "+38%", after: " leads", caption: "HubSpot pipeline" },
  { city: "London", side: 1, hang: "above", label: "London · AI", before: "CPL ", gold: "−27%", after: "", caption: "n8n + Make workflows" },
];

// Every visible or announced string. The site passes its own, per language, from
// src/i18n.js (argoHero); these English defaults keep the component usable alone.
const DEFAULT_COPY = {
  ariaLabel: "Group ARGO — growth-driven marketing and AI automation",
  markLabel: "Group ARGO symbol",
  pill: "AI automation · Paid media · CRM",
  title: "Growth-driven marketing",
  titleAccent: "& AI automation.",
  lede: "Paid media, CRM and automation systems that turn ad spend into predictable revenue.",
  book: "Book a call",
  work: "See our work",
  locations: "Barcelona · Miami",
  scroll: "Scroll",
  navLabel: "Main",
  homeLabel: "Group ARGO — home",
  menuLabel: "Menu",
  openMenu: "Open menu",
  closeMenu: "Close menu",
};

/**
 * Group ARGO home hero: dot-matrix globe, 3D gold logo, scroll-pinned camera dive.
 * Render it first on the home page; whatever comes after it in the page is the
 * "next section" the dive hands off to.
 */
export default function ArgoHero({
  links = DEFAULT_LINKS,
  bookHref = "#contacto", // null: no booking button
  workHref = "#casos",
  showNav = true, // set false if the site already has a global header
  cards = DEFAULT_CARDS,
  rotationSpeed = 6, // degrees per second
  wordmarkSrc = "/brand/argo-wordmark-cream.svg",
  copy: copyProp,
  theme = "ink", // "ink" (black) or "cream" (ARGO cream, deeper gold)
}) {
  const copy = { ...DEFAULT_COPY, ...copyProp };
  const cream = theme === "cream";
  // The 3D mark's gold: on cream the light top of the ink version washes out,
  // so the whole ramp sits a few steps deeper.
  const markGold = cream
    ? ["#E2C46A", "#C9A445", "#A8842A", "#7C6018", "#B38F33", "#D9B95A"]
    : ["#FFF4C8", "#E9CB66", "#B9932B", "#8C6A15", "#D4AF37", "#FFEBA6"];
  const [menuOpen, setMenuOpen] = useState(false);
  // useId keeps the SVG gradient/filter ids unique if the mark ever renders twice
  const uid = useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const id = (name) => `${name}-${uid}`;

  const trackRef = useRef(null);
  const heroRef = useRef(null);
  const canvasRef = useRef(null);
  const contentRef = useRef(null);
  const navRef = useRef(null);
  const footRef = useRef(null);
  const logoRef = useRef(null);
  const cardRefs = useRef([]);
  const burgerRef = useRef(null);
  const closeRef = useRef(null);
  const sceneRef = useRef(null);

  // Mount the canvas engine once. Everything inside runs only in the browser,
  // so this component is safe for SSR/SSG (nothing touches window at render time).
  useEffect(() => {
    const scene = new GlobeScene(
      {
        track: trackRef.current,
        hero: heroRef.current,
        canvas: canvasRef.current,
        content: contentRef.current,
        nav: navRef.current,
        foot: footRef.current,
        logo: logoRef.current,
        cards: cardRefs.current,
      },
      { rotationSpeed, cards, showCards: true, theme }
    );
    scene.start();
    sceneRef.current = scene;
    // The cards park beside the headline's widest line, measured on resize and
    // when document.fonts is first ready. A face that finishes loading later
    // (the bold headline) changes that width: measure again then too.
    const remeasure = () => scene.resize();
    if (document.fonts) document.fonts.addEventListener("loadingdone", remeasure);
    return () => {
      if (document.fonts) document.fonts.removeEventListener("loadingdone", remeasure);
      sceneRef.current = null;
      scene.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // A new headline (language switch) has a new width: the cards follow it.
  useEffect(() => {
    const frame = requestAnimationFrame(() => sceneRef.current && sceneRef.current.resize());
    return () => cancelAnimationFrame(frame);
  }, [copy.title, copy.titleAccent]);

  // Mobile menu: lock page scroll, close on Escape, move focus in and back out.
  useEffect(() => {
    if (!menuOpen) return undefined;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current && closeRef.current.focus();
    const onKey = (e) => e.key === "Escape" && setMenuOpen(false);
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
      burgerRef.current && burgerRef.current.focus();
    };
  }, [menuOpen]);

  return (
    <>
      {/* data-nav-ink (black version only): the site's fixed navbar stays
          transparent, on light inks, while this panel is under it. */}
      <div className={cream ? "ah-track ah-cream" : "ah-track"} ref={trackRef} data-nav-ink={cream ? undefined : ""}>
        <section className="ah-hero" ref={heroRef} aria-label={copy.ariaLabel}>
          <canvas className="ah-canvas" ref={canvasRef} aria-hidden="true" />

          {cards.map((c, i) => (
            <div className="ah-card" key={c.city} ref={(el) => (cardRefs.current[i] = el)} aria-hidden="true">
              <span className="ah-card-k">{c.label}</span>
              <span className="ah-card-v">
                {c.before}
                <b>{c.gold}</b>
                {c.after}
              </span>
              <span className="ah-card-c">{c.caption}</span>
            </div>
          ))}

          {showNav && (
            <nav className="ah-nav" ref={navRef} aria-label={copy.navLabel}>
              <a className="ah-brand ah-in ah-d6" href="/" aria-label={copy.homeLabel}>
                <img src={wordmarkSrc} alt="Group ARGO" width="161" height="22" />
              </a>
              <ul className="ah-links ah-in ah-d6">
                {links.map((l) => (
                  <li key={l.label}>
                    <a href={l.href}>{l.label}</a>
                  </li>
                ))}
              </ul>
              <div className="ah-nav-right ah-in ah-d6">
                {bookHref && (
                  <a className="ah-btn-sm" href={bookHref}>
                    {copy.book}
                  </a>
                )}
                <button
                  ref={burgerRef}
                  className="ah-burger"
                  type="button"
                  aria-label={copy.openMenu}
                  aria-expanded={menuOpen}
                  onClick={() => setMenuOpen(true)}
                >
                  <span />
                  <span />
                </button>
              </div>
            </nav>
          )}

          <div className="ah-content" ref={contentRef}>
            <div className="ah-logo ah-in ah-d1">
              <div className="ah-logo-halo" aria-hidden="true" />
              <div className="ah-logo-inner" ref={logoRef}>
                <svg className="ah-mark" viewBox={ARGO_MARK_VIEWBOX} role="img" aria-label={copy.markLabel}>
                  <defs>
                    {/* polished-gold body: bright top, deep mid, warm bounce at the base */}
                    <linearGradient id={id("gold")} x1="0" y1="0" x2="0.3" y2="1">
                      {[0, 0.2, 0.42, 0.6, 0.8, 1].map((offset, i) => (
                        <stop key={offset} offset={offset} stopColor={markGold[i]} />
                      ))}
                    </linearGradient>
                    <linearGradient id={id("edge")} x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0" stopColor="#FFF8DC" />
                      <stop offset="0.5" stopColor="#D4AF37" stopOpacity="0.35" />
                      <stop offset="1" stopColor="#FFF2BF" />
                    </linearGradient>
                    <linearGradient id={id("shine")} x1="0" y1="0" x2="1" y2="0">
                      <stop offset="0" stopColor="#FFFFFF" stopOpacity="0" />
                      <stop offset="0.5" stopColor="#FFFFFF" stopOpacity="0.7" />
                      <stop offset="1" stopColor="#FFFFFF" stopOpacity="0" />
                    </linearGradient>
                    {/* bevel + specular highlight from an overhead point light, then a soft drop shadow */}
                    <filter id={id("metal")} x="-40%" y="-40%" width="180%" height="190%" colorInterpolationFilters="sRGB">
                      <feGaussianBlur in="SourceAlpha" stdDeviation="3.5" result="blur" />
                      <feSpecularLighting in="blur" surfaceScale="7" specularConstant="1.15" specularExponent="26" lightingColor="#FFF4D0" result="spec">
                        <fePointLight x="330" y="120" z="280" />
                      </feSpecularLighting>
                      <feComposite in="spec" in2="SourceAlpha" operator="in" result="specIn" />
                      <feComposite in="SourceGraphic" in2="specIn" operator="arithmetic" k1="0" k2="1" k3="1" k4="0" result="lit" />
                      <feDropShadow in="lit" dx="0" dy="24" stdDeviation="18" floodColor={cream ? "#5A4512" : "#000000"} floodOpacity={cream ? 0.28 : 0.7} />
                    </filter>
                    <path id={id("mark")} d={ARGO_MARK_PATH} />
                    <clipPath id={id("clip")}>
                      <use href={`#${id("mark")}`} />
                    </clipPath>
                  </defs>
                  <g filter={`url(#${id("metal")})`}>
                    <use href={`#${id("mark")}`} fill={`url(#${id("gold")})`} />
                    <use href={`#${id("mark")}`} fill="none" stroke={`url(#${id("edge")})`} strokeWidth="3" strokeLinejoin="round" />
                  </g>
                  {/* the light sweep, clipped to the mark */}
                  <g clipPath={`url(#${id("clip")})`}>
                    <rect className="ah-shine" x="150" y="200" width="110" height="420" fill={`url(#${id("shine")})`} />
                  </g>
                </svg>
              </div>
            </div>

            <span className="ah-pill ah-in ah-d2">{copy.pill}</span>

            <h1 className="ah-title ah-in ah-d3">
              {copy.title}
              <br />
              <em>{copy.titleAccent}</em>
            </h1>

            <p className="ah-lede ah-in ah-d4">
              {copy.lede}
            </p>

            <div className="ah-ctas ah-in ah-d5">
              {bookHref && (
                <a className="ah-btn ah-btn-gold" href={bookHref}>
                  {copy.book}
                </a>
              )}
              <a className="ah-btn ah-btn-glass" href={workHref}>
                {copy.work}
              </a>
            </div>
          </div>

          <div className="ah-foot" ref={footRef}>
            <p className="ah-label ah-in ah-d6">{copy.locations}</p>
            <div className="ah-scroll ah-in ah-d6" aria-hidden="true">
              <span className="ah-label">{copy.scroll}</span>
              <span className="ah-scroll-line">
                <i />
              </span>
            </div>
            <span />
          </div>
        </section>
      </div>

      {menuOpen && (
        <div className={cream ? "ah-menu ah-cream" : "ah-menu"} role="dialog" aria-modal="true" aria-label={copy.menuLabel}>
          <div className="ah-menu-head">
            <img src={wordmarkSrc} alt="Group ARGO" width="161" height="22" />
            <button ref={closeRef} className="ah-menu-close" type="button" aria-label={copy.closeMenu} onClick={() => setMenuOpen(false)}>
              ×
            </button>
          </div>
          <ul className="ah-menu-links">
            {links.map((l) => (
              <li key={l.label}>
                <a href={l.href} onClick={() => setMenuOpen(false)}>
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
          <div className="ah-menu-foot">
            <p className="ah-label">{copy.locations}</p>
            {bookHref && (
              <a className="ah-btn ah-btn-gold" href={bookHref} onClick={() => setMenuOpen(false)}>
                {copy.book}
              </a>
            )}
          </div>
        </div>
      )}
    </>
  );
}
