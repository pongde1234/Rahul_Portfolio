import { useCallback, useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import Item from '../components/Item.jsx'
import Sticker from '../components/Stickers.jsx'
import SplitFlap from '../components/SplitFlap.jsx'
import HeroFigure from '../components/HeroFigure.jsx'
import ProjectCard from '../components/ProjectCard.jsx'
import ArrowLabel from '../components/ArrowLabel.jsx'
import { WorkSlide } from '../components/WorkPane.jsx'
import AboutSlide from '../components/AboutSlide.jsx'
import { AboutContent } from './About.jsx'
import useMedia from '../components/useMedia.js'
import { profile, education, strengths, hobbies, projects } from '../data/content.js'

const NOTE_COLORS = ['var(--coral)', 'var(--sky)', 'var(--butter)', 'var(--mint)', 'var(--blush)']
const SECTIONS = ['hello', 'work', 'about']
const SECTION_LABELS = { hello: 'Home', work: 'Work', about: 'About' }
const LAST = SECTIONS.length - 1

function useStoredNotes() {
  const [notes, setNotes] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem('desk-notes') || '[]')
    } catch {
      return []
    }
  })
  useEffect(() => {
    try {
      localStorage.setItem('desk-notes', JSON.stringify(notes))
    } catch {
      /* storage unavailable */
    }
  }, [notes])
  return [notes, setNotes]
}

// [name, left, top] — positions as % of the board
const STICKERS = [
  ['cactus', '6.5%', '6%'],
  ['sun', '55.5%', '2%'],
  ['rocket', '93%', '30%'],
  ['headphones', '15%', '66%'],
  ['camera', '55%', '64%'],
]

// Slide controller: wheel / swipe / keys move between slides (desktop only).
function usePager(enabled) {
  const [section, setSection] = useState(0)
  const ref = useRef(0)

  const goTo = useCallback((n) => {
    const next = Math.max(0, Math.min(LAST, n))
    if (next === ref.current) return false
    ref.current = next
    setSection(next)
    return true
  }, [])

  useEffect(() => {
    if (!enabled) {
      ref.current = 0
      setSection(0)
      return undefined
    }
    let lockUntil = 0
    let lastEvent = 0
    let acc = 0
    let touchY = null

    let needQuiet = false
    let lastDir = 0 // which way the last wheel event went
    let over = 0 // how far the wheel has been pushed past the end of a scrolling list
    let lastInner = 0 // when a list last used a wheel event

    // the work slide has its own scrolling column: scroll it first, change slides only at its top/bottom.
    // Wheel notches, keys and swipes all glide to their target (a short ease each frame) instead of jumping a whole
    // step at once, so a mouse wheel scrolls as smoothly as a trackpad does.
    let glideTarget = 0
    let glideRaf = 0
    const stopGlide = () => {
      if (glideRaf) cancelAnimationFrame(glideRaf)
      glideRaf = 0
    }
    const glide = (sc) => {
      const diff = glideTarget - sc.scrollTop
      if (Math.abs(diff) < 0.5) {
        sc.scrollTop = glideTarget
        glideRaf = 0
        return
      }
      sc.scrollTop += diff * 0.13 // a soft tail: wheel notches blend into one glide
      glideRaf = requestAnimationFrame(() => glide(sc))
    }
    const innerScroll = (dy) => {
      // the work slide (1) and the about slide (2) each have a column that scrolls inside the slide
      if (ref.current !== 1 && ref.current !== 2) {
        stopGlide()
        return false
      }
      const sc = document.querySelector(ref.current === 1 ? '.slide--work .wk__main' : '.slide--about .about__scroll')
      if (!sc) return false
      const max = sc.scrollHeight - sc.clientHeight
      const pos = glideRaf ? glideTarget : sc.scrollTop // where the scroll is heading, if it is still gliding
      const can = dy > 0 ? pos < max - 2 : pos > 0
      if (!can) return false
      glideTarget = Math.max(0, Math.min(max, pos + dy))
      if (!glideRaf) glideRaf = requestAnimationFrame(() => glide(sc))
      return true
    }

    const step = (dir) => {
      const now = performance.now()
      if (now < lockUntil) return
      if (goTo(ref.current + dir)) {
        stopGlide()
        lockUntil = now + 1000
        needQuiet = true
      }
    }

    const onWheel = (e) => {
      if (e.target.closest?.('textarea')) return // let notes scroll/type normally
      e.preventDefault()
      const now = performance.now()
      const gap = now - lastEvent
      lastEvent = now
      const dir = e.deltaY > 0 ? 1 : -1
      if (dir !== lastDir) {
        // turning round is a new gesture: it must never wait for the old one's momentum to die
        acc = 0
        over = 0
        needQuiet = false
      }
      lastDir = dir
      if (now < lockUntil) return // transition running
      if (innerScroll(e.deltaY)) {
        over = 0
        acc = 0
        lastInner = now
        return
      }
      // The work and about slides have a list that scrolls inside them. Once it is at its end (or its top), keep pushing the same
      // way and the next (or previous) slide follows, in the same scroll: no pause and fresh gesture needed. A short wait right
      // after the list ends lets a trackpad's momentum die out first, so it does not fly through a whole slide.
      if (ref.current === 1 || ref.current === 2) {
        if (now - lastInner < 250) return
        if (gap > 180) over = 0
        over += Math.abs(e.deltaY)
        if (over >= 160) {
          over = 0
          step(dir)
        }
        return
      }
      if (needQuiet) {
        // trackpad inertia and a steadily turning mouse wheel keep firing events: wait for a real pause before
        // accepting a new gesture, so scrolling down the list never carries straight on into the next slide
        if (gap < 250) return
        needQuiet = false
      }
      if (gap > 120) acc = 0
      acc += e.deltaY
      if (Math.abs(acc) >= 24) {
        const dir = acc > 0 ? 1 : -1
        acc = 0
        step(dir)
      }
    }
    const onKey = (e) => {
      if (/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      if (['ArrowDown', 'PageDown'].includes(e.key) || (e.key === ' ' && !/^(BUTTON|A)$/.test(e.target.tagName))) {
        e.preventDefault()
        if (!innerScroll(e.key === 'ArrowDown' ? 180 : 520)) step(1)
      } else if (['ArrowUp', 'PageUp'].includes(e.key)) {
        e.preventDefault()
        if (!innerScroll(e.key === 'ArrowUp' ? -180 : -520)) step(-1)
      } else if (e.key === 'Home') goTo(0)
      else if (e.key === 'End') goTo(LAST)
    }
    const onTouchStart = (e) => { touchY = e.touches[0].clientY }
    const onTouchEnd = (e) => {
      if (touchY == null || e.target.closest?.('textarea')) return
      const dy = touchY - e.changedTouches[0].clientY
      touchY = null
      if (Math.abs(dy) > 50 && !innerScroll(dy)) step(dy > 0 ? 1 : -1)
    }

    window.addEventListener('wheel', onWheel, { passive: false })
    window.addEventListener('keydown', onKey)
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    return () => {
      stopGlide()
      window.removeEventListener('wheel', onWheel)
      window.removeEventListener('keydown', onKey)
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
    }
  }, [enabled, goTo])

  return [section, goTo]
}

// Borderless text area that looks like writing straight on the note.
// Dragging starts from the note itself, not from the text (so you can select text).
function NoteField({ value, onChange, autoFocus }) {
  const ref = useRef(null)
  useEffect(() => {
    const el = ref.current
    const stop = (e) => e.stopPropagation()
    el.addEventListener('pointerdown', stop)
    return () => el.removeEventListener('pointerdown', stop)
  }, [])
  return (
    <textarea
      ref={ref}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      autoFocus={autoFocus}
      maxLength={140}
      placeholder="Write a note (140 characters max)"
      aria-label="Sticky note"
      spellCheck={false}
    />
  )
}

function PagerDots({ section, goTo }) {
  return (
    <nav className="dots" aria-label="Sections">
      {SECTIONS.map((id, i) => (
        <button key={id} className={section === i ? 'on' : ''} onClick={() => goTo(i)} aria-label={`Go to ${SECTION_LABELS[id]}`} aria-current={section === i}>
          <span>{SECTION_LABELS[id]}</span>
        </button>
      ))}
    </nav>
  )
}

export default function Home() {
  const heroRef = useRef(null)
  const paged = useMedia('(min-width: 1000px)')

  // The opening intro (desktop, once per visit): the name card sits alone in the middle of the screen while its letters flip and spell the
  // name; then the title fades in, the rest of the site opens, and the card travels to its place on the board.
  //   'center' -> 'title' -> 'open' -> 'done'. A click or key press skips ahead.
  const [intro, setIntro] = useState(() => {
    try {
      if (sessionStorage.getItem('intro-seen')) return 'done'
    } catch {
      /* storage unavailable */
    }
    const is = (q) => window.matchMedia(q).matches
    return is('(prefers-reduced-motion: reduce)') || !is('(min-width: 1000px)') ? 'done' : 'center'
  })
  const [playIntro] = useState(intro !== 'done')
  const ready = intro === 'open' || intro === 'done' // the rest of the site is showing
  useEffect(() => {
    if (intro === 'done') {
      try {
        sessionStorage.setItem('intro-seen', '1')
      } catch {
        /* storage unavailable */
      }
      return undefined
    }
    const next = { center: ['title', 1900], title: ['open', 1300], open: ['done', 1500] }[intro]
    const t = setTimeout(() => setIntro(next[0]), next[1])
    const skip = () => setIntro((p) => (p === 'center' || p === 'title' ? 'open' : 'done'))
    window.addEventListener('pointerdown', skip)
    window.addEventListener('keydown', skip)
    return () => {
      clearTimeout(t)
      window.removeEventListener('pointerdown', skip)
      window.removeEventListener('keydown', skip)
    }
  }, [intro])
  // while the card is alone on the screen, the nav and the rulers wait (styles.css, body.intro-on)
  useEffect(() => {
    document.body.classList.toggle('intro-on', intro === 'center' || intro === 'title')
    return () => document.body.classList.remove('intro-on')
  }, [intro])

  const [section, goTo] = usePager(paged && intro === 'done')
  // tell the nav which slide is showing (it highlights "Works" while the work slide is up)
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('portfolio:slide', { detail: paged ? section : 0 }))
    return () => window.dispatchEvent(new CustomEvent('portfolio:slide', { detail: 0 }))
  }, [paged, section])

  // the name in the nav asks us to jump back to the first slide
  useEffect(() => {
    const toStart = () => (paged ? goTo(0) : window.scrollTo({ top: 0, behavior: 'smooth' }))
    window.addEventListener('portfolio:home', toStart)
    return () => window.removeEventListener('portfolio:home', toStart)
  }, [paged, goTo])

  const [notes, setNotes] = useStoredNotes()
  const [focusId, setFocusId] = useState(null)
  const away = paged && section > 0

  // lock page scroll + dark nav text while the dark contact slide is showing
  useEffect(() => {
    document.body.classList.toggle('is-paged', paged)
    document.documentElement.classList.toggle('is-paged', paged)
    return () => {
      document.body.classList.remove('is-paged')
      document.documentElement.classList.remove('is-paged')
    }
  }, [paged])

  // Drops a blank sticky note on the desk; the visitor types straight into it.
  const addNote = () => {
    const id = Date.now()
    setNotes([
      ...notes,
      {
        id,
        text: '',
        color: NOTE_COLORS[Math.floor(Math.random() * NOTE_COLORS.length)],
        l: `${30 + Math.random() * 30}%`,
        t: `${42 + Math.random() * 16}%`,
        r: Math.round((Math.random() * 8 - 4) * 10) / 10,
      },
    ])
    setFocusId(id)
  }
  const editNote = (id, text) => setNotes(notes.map((n) => (n.id === id ? { ...n, text } : n)))

  const seeWork = (e) => {
    e.preventDefault()
    if (paged) goTo(1)
    else document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' })
  }

  const hero = (
    <section id="hello" className={`hero ${paged ? 'slide slide--hero' : ''}`} ref={heroRef} aria-hidden={paged && section !== 0}>
      <div className="board">
        {/* split-flap board */}
        <Item l="67%" t="2.4%" w="32.7%" r={1.1} boardRef={heroRef} away={away} className="flapcard" delay={0.15} center={intro === 'center' || intro === 'title'}>
          <p className={`flapcard__title${intro === 'center' ? ' flapcard__title--wait' : ''}`}>
            {profile.name} — {profile.role}
          </p>
          <SplitFlap phrases={profile.flapPhrases} lead={playIntro ? profile.flapIntro : undefined} />
        </Item>


        {ready && (
          <>
        {/* experience & education */}
        <Item l="0%" t="25.7%" w="26.5%" r={-1} boardRef={heroRef} away={away} className="note note--stone" delay={0.1}>
          <p className="note__label">Experience & education</p>
          <ul className="stack">
            {education.map((e) => (
              <li key={e.title}>
                <strong>{e.title}</strong>
                <span>{e.place}</span>
              </li>
            ))}
          </ul>
          <div className="links">
            <Link to="/about"><ArrowLabel>About me →</ArrowLabel></Link>
            <a href={profile.resume} target="_blank" rel="noreferrer"><ArrowLabel>Resume (PDF) ↗</ArrowLabel></a>
          </div>
        </Item>

        {/* headline */}
        <Item l="22%" t="0%" w="31%" r={0.3} boardRef={heroRef} away={away} className="note note--paper note--hero" delay={0.05}>
          <p className="note__label mono">{profile.hello}</p>
          <h1>
            {profile.headline.map((line) => (
              <span key={line}>{line}</span>
            ))}
          </h1>
          <p className="mono tags">{profile.tags.join(', ')}</p>
          <HeroFigure />
        </Item>

        {/* polaroid */}
        <Item l="50.5%" t="18%" w="20.5%" r={1.2} boardRef={heroRef} away={away} className="polaroid" delay={0.2}>
          <div className="polaroid__img">
            {profile.photo ? <img src={profile.photo} alt={profile.name} /> : <span>Photo coming soon</span>}
          </div>
          <p className="polaroid__cap mono">{profile.photoCaption}</p>
        </Item>

        {/* strengths */}
        <Item l="72.5%" t="39%" w="25%" r={1} boardRef={heroRef} away={away} className="note note--sand" delay={0.3}>
          <p className="note__label">What I'm good at</p>
          <div className="chips">
            {strengths.map((s) => (
              <em key={s}>{s}</em>
            ))}
          </div>
        </Item>

        {/* stickers */}
        {STICKERS.map(([name, l, t], i) => (
          <Item key={name} l={l} t={t} w="7.4%" r={(i % 2 ? 1 : -1) * (4 + i * 2)} boardRef={heroRef} away={away} delay={0.4 + i * 0.07} className="stickerwrap">
            <Sticker name={hobbies.includes(name) ? name : 'star'} />
          </Item>
        ))}

        {/* visitor notes */}
        {notes.map((n) => (
          <Item key={n.id} l={n.l} t={n.t} w="19%" r={n.r} boardRef={heroRef} away={away} className="usernote-wrap" onDelete={() => setNotes(notes.filter((x) => x.id !== n.id))}>
            <div className="usernote" style={{ background: n.color }}>
              <NoteField value={n.text} onChange={(v) => editNote(n.id, v)} autoFocus={n.id === focusId} />
            </div>
          </Item>
        ))}

        <a href="#work" className={`cta ${away ? 'cta--away' : ''}`} onClick={seeWork} tabIndex={away ? -1 : 0}>
          <b><ArrowLabel>View my work ↘</ArrowLabel></b>
        </a>
          </>
        )}
      </div>

      {ready && (
        <div className={`addnote ${away ? 'addnote--away' : ''}`}>
          <button className="linkbtn" onClick={addNote} tabIndex={away ? -1 : 0}>+ Add a sticky note</button>
        </div>
      )}
    </section>
  )

  // ---- desktop: full-screen slides ----
  if (paged) {
    return (
      <div className="stage">
        {ready && <PagerDots section={section} goTo={goTo} />}
        {hero}
        <WorkSlide section={section} />
        <AboutSlide section={section} at={2} />
      </div>
    )
  }

  // ---- phones / small screens: normal scrolling page ----
  return (
    <>
      {hero}
      <section id="work" className="section">
        <div className="wrap">
          <p className="eyebrow">Work</p>
          <h2>Selected projects</h2>
          <div className="projects-grid">
            {projects.map((p, i) => (
              <ProjectCard key={p.slug} p={p} i={i} />
            ))}
          </div>
          <p className="center"><Link className="btn" to="/works"><ArrowLabel>All projects →</ArrowLabel></Link></p>
        </div>
      </section>

      <section id="about" className="about-stack">
        <AboutContent headingLevel={2} />
      </section>
    </>
  )
}
