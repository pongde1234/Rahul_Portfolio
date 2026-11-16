import { useEffect, useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { profile } from '../data/content.js'

// "**rah**! + c**ool**" -> rah (bold) ! + c ool (bold)
function Hint({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))
}

export default function Nav() {
  const { pathname } = useLocation()

  // The home page is made of slides (hero / work / about / contact). While its work or about slide is showing,
  // the nav should say "Work" or "About", not "Home".
  const [slide, setSlide] = useState(0)
  useEffect(() => {
    const onSlide = (e) => setSlide(e.detail ?? 0)
    window.addEventListener('portfolio:slide', onSlide)
    return () => window.removeEventListener('portfolio:slide', onSlide)
  }, [])
  const onWorkSlide = pathname === '/' && slide === 1
  const onAboutSlide = pathname === '/' && slide === 2
  const cls = (isActive, forceOff = false, forceOn = false) =>
    `nav__link${(isActive && !forceOff) || forceOn ? ' active' : ''}`

  // Name -> home. Already on the home page (maybe on the work/contact slide)? Tell it to go back to the first slide.
  const goHome = (e) => {
    if (pathname === '/') {
      e.preventDefault()
      window.dispatchEvent(new Event('portfolio:home'))
    }
  }

  return (
    <header className="nav">
      <div className="nav__id">
        <Link to="/" className="nav__brand" onClick={goHome} aria-label={`${profile.name} — back to home`}>
          {[...profile.name].map((ch, i) => (
            <span key={i} className="roll" style={{ '--i': i }} aria-hidden="true">
              <span className="roll__in">
                <i>{ch}</i>
                <i>{ch}</i>
              </span>
            </span>
          ))}
        </Link>
        {profile.nameHint && (
          <span className="nav__hint" title={`How to say ${profile.name}`}>
            <Hint text={profile.nameHint} />
          </span>
        )}
      </div>
      <nav className="nav__pill" aria-label="Main">
        <NavLink to="/" end className={({ isActive }) => cls(isActive, onWorkSlide || onAboutSlide)}>
          Home
        </NavLink>
        <NavLink to="/works" className={({ isActive }) => cls(isActive, false, onWorkSlide)}>
          Work
        </NavLink>
        <NavLink to="/about" className={({ isActive }) => cls(isActive, false, onAboutSlide)}>
          About
        </NavLink>
        <a className="nav__link nav__resume" href={profile.resume} target="_blank" rel="noreferrer">
          Resume (PDF) ↗
        </a>
      </nav>
    </header>
  )
}
