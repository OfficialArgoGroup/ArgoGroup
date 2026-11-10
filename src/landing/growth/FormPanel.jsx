import { useEffect, useLayoutEffect, useRef, useState } from 'react'
import { useCopy } from './copy.js'
import LeadForm from './LeadForm.jsx'
import { DOCKED_FORM } from '../shared/useFormPanel.js'

// useLayoutEffect warns during server rendering; nothing here runs there.
const useClientLayoutEffect = typeof window === 'undefined' ? useEffect : useLayoutEffect

/**
 * The card's gold frame, drawn once around it on arrival (growth.css,
 * .card-frame). Sized to the card's inside in pixels, so the line traces it
 * exactly without making the card scroll, and kept in step when the card
 * grows (an error message, a narrower screen).
 * Client only: it appears after hydration, which is when it should play.
 */
function CardFrame({ cardRef }) {
  const [size, setSize] = useState(null)

  useEffect(() => {
    const card = cardRef.current
    if (!card || !('ResizeObserver' in window)) return undefined
    const observer = new ResizeObserver(() => setSize({ width: card.clientWidth, height: card.clientHeight }))
    observer.observe(card)
    return () => observer.disconnect()
  }, [cardRef])

  if (!size) return null
  return (
    <svg className="card-frame" width={size.width} height={size.height} viewBox={`0 0 ${size.width} ${size.height}`} aria-hidden="true" focusable="false">
      <rect x="0.75" y="0.75" width={size.width - 1.5} height={size.height - 1.5} rx="3" pathLength="1" />
    </svg>
  )
}

/**
 * The one form on the page.
 *
 * - Wide screens: docked in the right-hand column and sticky, so it stays on
 *   screen for the whole page (see .form-slot in growth.css).
 * - Phones and tablets: in the flow straight after the hero. The sticky bar
 *   and the last CTA open the same form as a bottom sheet; the slot keeps its
 *   height while it is out, so the page under the sheet does not move.
 */
export default function FormPanel({ sheetOpen, onClose, children }) {
  const { chrome, form } = useCopy()
  const slotRef = useRef(null)
  const stageRef = useRef(null)
  const cardRef = useRef(null)
  const returnFocus = useRef(null)
  const [holdHeight, setHoldHeight] = useState(null)

  useClientLayoutEffect(() => {
    if (!sheetOpen) {
      setHoldHeight(null)
      return undefined
    }
    // Keep the slot's height before the card leaves the flow.
    setHoldHeight(slotRef.current?.offsetHeight || null)
    returnFocus.current = document.activeElement
    document.documentElement.classList.add('sheet-open')
    requestAnimationFrame(() => cardRef.current?.querySelector('#f-name')?.focus({ preventScroll: true }))

    const onKey = (event) => { if (event.key === 'Escape') onClose() }
    // Rotating to a wide screen docks the form again.
    const wide = window.matchMedia(DOCKED_FORM)
    const onWide = () => { if (wide.matches) onClose() }
    document.addEventListener('keydown', onKey)
    wide.addEventListener('change', onWide)
    return () => {
      document.documentElement.classList.remove('sheet-open')
      document.removeEventListener('keydown', onKey)
      wide.removeEventListener('change', onWide)
      returnFocus.current?.focus?.({ preventScroll: true })
    }
  }, [sheetOpen, onClose])

  // Wide screens only: the docked card leans a few degrees towards the cursor.
  const tilt = (event) => {
    const stage = stageRef.current
    if (!stage || sheetOpen || !window.matchMedia(DOCKED_FORM).matches || !document.documentElement.classList.contains('motion')) return
    const rect = stage.getBoundingClientRect()
    const dx = (event.clientX - rect.left) / rect.width - 0.5
    const dy = (event.clientY - rect.top) / rect.height - 0.5
    stage.style.setProperty('--ry', `${(dx * 7).toFixed(2)}deg`)
    stage.style.setProperty('--rx', `${(-dy * 7).toFixed(2)}deg`)
  }
  const untilt = () => {
    stageRef.current?.style.setProperty('--ry', '0deg')
    stageRef.current?.style.setProperty('--rx', '0deg')
  }

  return (
    <aside id="form" ref={slotRef} className="form-slot" aria-labelledby="form-title" style={holdHeight ? { height: holdHeight } : undefined}>
      {sheetOpen && <div className="sheet-backdrop" onClick={onClose} aria-hidden="true" />}
      {/* Anything the page puts above the card (phones: the hero's points). */}
      {children}
      {/* Wide screens: a screen-tall sticky box that centres the card (css .form-sticky). */}
      <div className="form-sticky">
      <div ref={stageRef} className="form-stage" onPointerMove={tilt} onPointerLeave={untilt}>
      <div
        ref={cardRef}
        className="form-card"
        data-sheet={sheetOpen ? 'true' : undefined}
        role={sheetOpen ? 'dialog' : undefined}
        aria-modal={sheetOpen ? 'true' : undefined}
        aria-labelledby={sheetOpen ? 'form-title' : undefined}
      >
        <CardFrame cardRef={cardRef} />
        {sheetOpen && (
          <button type="button" className="sheet-close linklike" onClick={onClose}>{chrome.added.close}</button>
        )}
        <h2 id="form-title" className="form-title">{form.title}</h2>
        <p className="form-sub">{form.sub}</p>
        <LeadForm />
      </div>
      </div>
      </div>
    </aside>
  )
}
