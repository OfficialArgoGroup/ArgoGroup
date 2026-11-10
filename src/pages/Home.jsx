import ArgoHero from '../components/ArgoHero/ArgoHero'
import Services from '../components/Services'
import HowWeOperate from '../components/HowWeOperate'
import WhyArgo from '../components/WhyArgo'
import FAQ from '../components/FAQ'
import Contact from '../components/Contact'
import { useLang } from '../context/LangContext'

// Where each hero card sits on the globe; the words come from i18n
// (argoHero.cards, same order). city must be one of CITIES in globeScene.js;
// side: 1 = right gutter, -1 = left; hang: card position against its marker.
const CARD_PLACES = [
  { city: 'Barcelona', side: 1, hang: 'below' },
  { city: 'Miami', side: -1, hang: 'mid' },
  { city: 'London', side: 1, hang: 'above' }, // the 'worldwide, online' card,
]

export default function Home() {
  const { t } = useLang()
  const cards = CARD_PLACES.map((place, index) => ({ ...place, ...t.argoHero.cards[index] }))

  return (
    <main id="main">
      {/* The site's Navbar is the navigation here too (see App.jsx). The hero
          releases its scroll onto whatever follows it. No booking button in
          the hero: the form closes the page. */}
      <ArgoHero
        showNav={false}
        theme="cream"
        bookHref={null}
        workHref="/#services"
        copy={t.argoHero}
        cards={cards}
      />
      <Services />
      <HowWeOperate />
      <WhyArgo aboutLink />
      <FAQ />
      <Contact />
    </main>
  )
}
