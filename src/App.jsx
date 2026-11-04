import { useState, useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import Navbar from './components/Navbar'
import SEO from './components/SEO'
import ScrollToTop from './components/ScrollToTop'
import ScrollProgress from './components/ScrollProgress'
import Footer from './components/Footer'
import WhatsAppButton from './components/WhatsAppButton'
import CookieBanner from './components/CookieBanner'
import { useLang } from './context/LangContext'
import Home from './pages/Home'
import About from './pages/About'
import ContactPage from './pages/ContactPage'
import ThankYou from './pages/ThankYou'
import PrivacyPolicy from './pages/PrivacyPolicy'
import CookiePolicy from './pages/CookiePolicy'
import TermsOfService from './pages/TermsOfService'
import { getConsent } from './lib/consent'
import { startSiteTracking, trackPageView } from './lib/tracking'

export function AppLayout({ showBanner, setShowBanner }) {
  const location = useLocation()
  const { lang } = useLang()
  const isThankYou = location.pathname === '/thank-you'

  // A PageView per route. The first load also goes through here; the module
  // keeps the same path from counting twice (StrictMode runs effects twice).
  useEffect(() => {
    trackPageView()
  }, [location.pathname])

  return (
    <div className="min-h-screen">
      <SEO />
      <ScrollToTop />
      <a className="skip-link" href="#main">
        {lang === 'es' ? 'Ir al contenido' : 'Skip to content'}
      </a>
      <ScrollProgress />
      {!isThankYou && <Navbar />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/thank-you" element={<ThankYou />} />
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/cookie-policy" element={<CookiePolicy />} />
        <Route path="/terms-of-service" element={<TermsOfService />} />
      </Routes>
      <Footer setShowBanner={setShowBanner} />
      <WhatsAppButton />
      <CookieBanner showBanner={showBanner} setShowBanner={setShowBanner} />
    </div>
  )
}

export default function App() {
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    // Read after hydration so the first render matches the prerendered HTML.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!getConsent()) setShowBanner(true)
    return startSiteTracking()
  }, [])

  return (
    <BrowserRouter>
      <AppLayout showBanner={showBanner} setShowBanner={setShowBanner} />
    </BrowserRouter>
  )
}
