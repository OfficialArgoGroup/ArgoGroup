import { useLocation, useNavigate } from 'react-router-dom'

/**
 * Link to a section of the homepage from anywhere on the site.
 *
 * On `/` it scrolls smoothly without touching the router. From another route it
 * navigates to `/#<id>`; Home reads the hash on mount and scrolls there, so the
 * link works the same either way and the URL stays shareable.
 *
 * With `local`, a page that has its own section with that id scrolls to it
 * instead (the service pages' contact form, so the lead keeps its service).
 */
export default function AnchorLink({ id, className, children, onNavigate, local = false, ...rest }) {
  const { pathname } = useLocation()
  const navigate = useNavigate()

  const handleClick = (event) => {
    onNavigate?.()

    const here = pathname === '/' || (local && document.getElementById(id))
    if (!here) {
      event.preventDefault()
      navigate(`/#${id}`)
      return
    }

    const target = document.getElementById(id)
    if (!target) return

    event.preventDefault()
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    target.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' })
    window.history.replaceState(null, '', `#${id}`)
  }

  return (
    <a href={`/#${id}`} className={className} onClick={handleClick} {...rest}>
      {children}
    </a>
  )
}
