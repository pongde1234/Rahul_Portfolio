import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { profile } from '../data/content.js'
import ArrowLabel from './ArrowLabel.jsx'

// "**rah**! + c**ool**" -> rah (bold) ! + c ool (bold)
function Hint({ text }) {
  return text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))
}

// One link's inside: the sliding highlights (shared between the links through layoutId) and the label.
function Pill({ id, hover, on, label, spring }) {
  return (
    <>
      {hover === id && <motion.span layoutId="nav-hover" className="nav__bg nav__bg--hover" transition={spring} />}
      {on && <motion.span layoutId="nav-active" className="nav__bg nav__bg--active" transition={spring} />}
      <span className={`nav__label${on ? ' nav__label--on' : ''}`}>{label}</span>
    </>
  )
}

export default function Nav() {
  const { pathname } = useLocation()
  const [hover, setHover] = useState(null)
  const reduce = useReducedMotion()
  const spring = reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 42 }

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
      <nav className="nav__pill" aria-label="Main" onMouseLeave={() => setHover(null)}>
        {/* two highlights that slide from link to link: a pale one under the pointer and the dark one under the page you are on */}
        <NavLink to="/" end className="nav__link" onMouseEnter={() => setHover('home')}>
          {({ isActive }) => <Pill id="home" hover={hover} on={(isActive && !(onWorkSlide || onAboutSlide)) || false} label="Home" spring={spring} />}
        </NavLink>
        <NavLink to="/works" className="nav__link" onMouseEnter={() => setHover('work')}>
          {({ isActive }) => <Pill id="work" hover={hover} on={isActive || onWorkSlide} label="Work" spring={spring} />}
        </NavLink>
        <NavLink to="/about" className="nav__link" onMouseEnter={() => setHover('about')}>
          {({ isActive }) => <Pill id="about" hover={hover} on={isActive || onAboutSlide} label="About" spring={spring} />}
        </NavLink>
        <a className="nav__link nav__resume" href={profile.resume} target="_blank" rel="noreferrer" onMouseEnter={() => setHover('resume')}>
          {hover === 'resume' && <motion.span layoutId="nav-hover" className="nav__bg nav__bg--hover" transition={spring} />}
          <span className="nav__label"><ArrowLabel>Resume (PDF) ↗</ArrowLabel></span>
        </a>
      </nav>
    </header>
  )
}
