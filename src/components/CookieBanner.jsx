import { Link } from 'react-router-dom'
import { useLang } from '../context/LangContext'
import { setConsent } from '../lib/consent'

export default function CookieBanner({ showBanner, setShowBanner }) {
  const { t, lang } = useLang()

  const choose = (choice) => {
    // Saves the choice and tells the pixel (src/lib/tracking.js) straight away.
    setConsent(choice)
    setShowBanner(false)
  }

  if (!showBanner) return null

  const copy = lang === 'es'
    ? {
        title: 'Usamos cookies',
        // Lo que de verdad hay detrás: solo el Píxel de Meta (src/lib/tracking.js).
        body: 'Usamos el Píxel de Meta para medir qué anuncios nos traen visitas. No se activa nada hasta que aceptas. Más detalles en nuestra',
        accept: 'Aceptar',
        decline: 'Rechazar',
      }
    : {
        title: 'We use cookies',
        // What is really behind it: the Meta Pixel only (src/lib/tracking.js).
        body: 'We use the Meta Pixel to measure which ads bring people here. Nothing is set unless you accept. Learn more in our',
        accept: 'Accept',
        decline: 'Decline',
      }

  return (
    <div className="cookie-banner" role="dialog" aria-label={copy.title}>
      <div className="cookie-inner">
        <h2>{copy.title}</h2>
        <p>
          {copy.body}{' '}
          <Link to="/cookie-policy">{t.footer.cookies}</Link>.
        </p>
        <div className="cookie-actions">
          {/* Same style for both: declining is as easy and as visible as accepting. */}
          <button className="btn btn-ghost" type="button" onClick={() => choose('accepted')}>{copy.accept}</button>
          <button className="btn btn-ghost" type="button" onClick={() => choose('declined')}>{copy.decline}</button>
        </div>
      </div>
    </div>
  )
}
