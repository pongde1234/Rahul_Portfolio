import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight } from 'lucide-react'
import Cover from './Cover.jsx'
import HeroFigure from './HeroFigure.jsx'
import useMedia from './useMedia.js'
import { usePageTransition } from './PageTransition.jsx'
import { profile, projects } from '../data/content.js'

// "I make **data** easy" -> I make <b>data</b> easy
const keywordOf = (text) => text?.match(/\*\*(.+?)\*\*/)?.[1] ?? null

const rich = (text) => text.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part))

// Tile above a project title: always there with its background, showing just the bold keyword.
// On hover / focus it grows into the whole question.
function Bubble({ text, open }) {
  const reduce = useReducedMotion()
  return (
    <div className="wk__pillwrap">
      <motion.span
        layout={!reduce}
        className={`wk__pill ${open ? 'wk__pill--open' : ''}`}
        style={{ borderTopLeftRadius: 6, borderTopRightRadius: 6, borderBottomRightRadius: 6, borderBottomLeftRadius: 0 }}
        transition={{ layout: { duration: 0.32, ease: [0.2, 0.8, 0.2, 1] } }}
      >
        {/* a new key replays the CSS fade (.wk__pill-text in styles.css) whenever the text swaps between the keyword and the question */}
        <span key={open ? 'full' : 'short'} className="wk__pill-text">
          {open ? rich(text) : <b>{keywordOf(text)}</b>}
        </span>
      </motion.span>
    </div>
  )
}

// Two panes: the left side stays put and its statement changes with the project in view;
// only the right side scrolls. Used by the home "work" slide and by the /works page.
//   forward: pass wheel events from the left side to the right side (the /works page needs this;
//            the home page's slide controller already does it).
export default function WorkPane({ forward = false, headingLevel = 1 }) {
  const Title = `h${headingLevel}` // the Work page's own heading is an h1; inside the home page's Work slide it is an h2
  const reduce = useReducedMotion()
  const { open } = usePageTransition()
  const locked = useMedia('(min-width: 900px)')
  const scroller = useRef(null)
  const rows = useRef([])
  const [active, setActive] = useState(-1) // -1 = intro, otherwise index of the project in view
  const [hover, setHover] = useState(null) // row under the pointer / keyboard focus (overrides scroll for the left word)

  // which project sits at the reading line (about 40% down the scroll area)?
  useEffect(() => {
    if (!locked) {
      setActive(-1)
      return undefined
    }
    const el = scroller.current
    let raf = 0
    const calc = () => {
      raf = 0
      const line = el.getBoundingClientRect().top + el.clientHeight * 0.4
      let a = -1
      rows.current.forEach((r, i) => {
        if (r && r.getBoundingClientRect().top <= line) a = i
      })
      // at the very bottom the last project is always the current one, even if it never reaches the line
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 2) a = projects.length - 1
      setActive(a)
    }
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(calc)
    }
    el.addEventListener('scroll', onScroll, { passive: true })
    calc()
    return () => {
      el.removeEventListener('scroll', onScroll)
      if (raf) cancelAnimationFrame(raf)
    }
  }, [locked])

  const forwardWheel = (e) => {
    if (forward && locked && scroller.current) scroller.current.scrollBy({ top: e.deltaY })
  }

  // the heading's last word follows the bold keyword of the project in view
  const keyword = hover == null ? null : keywordOf(projects[hover].hmw)
  const count = active < 0 ? null : `${String(active + 1).padStart(2, '0')} / ${String(projects.length).padStart(2, '0')}`

  return (
    <div className="wk__grid">
      {/* left: fixed. The statement changes with the project in view. */}
      <aside className="wk__side" onWheel={forwardWheel}>
        <div>
          <Title>
            I design with care for <b>{keyword ? "people's" : 'people'}</b>
            <AnimatePresence mode="wait" initial={false}>
              {keyword && (
                <motion.i
                  key={keyword}
                  className="wk__kw"
                  initial={reduce ? false : { opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={reduce ? { opacity: 0 } : { opacity: 0, y: -16 }}
                  transition={{ duration: 0.26, ease: 'easeOut' }}
                >
                  {keyword}
                </motion.i>
              )}
            </AnimatePresence>
          </Title>
          {count && <p className="wk__count mono">{count}</p>}
        </div>
        <div className="wk__figure">{profile.photo ? <img src={profile.photo} alt={profile.name} /> : <HeroFigure />}</div>
      </aside>

      {/* right: the only scrolling part */}
      <div className="wk__main" ref={scroller}>
        <h2 className="wk__lead">
          I start with the problem, then design the <b>system</b> around it.
        </h2>
        <p className="wk__intro">
          Since 2022 at {projects[0]?.company ?? 'Faclon Labs'}, I've grown from design intern to senior product designer. I turn complex
          workflows into products people trust: I interview users, set clear goals, test early and hand off to developers.
        </p>

        <div className="wk__head">
          <span>Work</span>
          <span>{projects.length} {projects.length === 1 ? 'project' : 'projects'}</span>
        </div>

        <ul className="wk__list">
          {projects.map((p, i) => (
            <motion.li
              key={p.slug}
              ref={(el) => {
                rows.current[i] = el
              }}
              className="wk__row"
              onPointerEnter={(e) => e.pointerType === 'mouse' && setHover(i)}
              onPointerLeave={() => setHover(null)}
              onFocus={() => setHover(i)}
              onBlur={() => setHover(null)}
              initial={reduce ? false : { opacity: 0, y: 48 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, root: scroller, margin: '-40px' }}
              transition={{ duration: 0.65, ease: [0.2, 0.7, 0.2, 1] }}
            >
              <Link to={`/works/${p.slug}`} className="wk__link" onClick={(e) => open(e, p)}>
                <div className="wk__img" style={{ '--c': p.color }}>
                  <Cover p={p} />
                </div>

                <div className="wk__meta">
                  <Bubble text={p.hmw} open={!locked || hover === i} />
                  <h3>
                    {p.title}
                    <ArrowRight className="wk__go" size={18} strokeWidth={2.25} aria-hidden="true" />
                  </h3>

                  <div className="wk__co">
                    <i>{p.company.charAt(0)}</i>
                    <div>
                      <b>{p.company}</b>
                      <small>{p.year}</small>
                    </div>
                  </div>
                  <p className="wk__role">
                    {p.role} · {p.timeline}
                  </p>
                  <div className="wk__tags">
                    {p.tags.map((t) => (
                      <span key={t}>{t}</span>
                    ))}
                  </div>
                </div>
              </Link>
            </motion.li>
          ))}
        </ul>
      </div>
    </div>
  )
}

// The home page's work slide: the pane rises in from below when you arrive, and drifts up when you leave.
export function WorkSlide({ section }) {
  const reduce = useReducedMotion()
  const state = section < 1 ? 'below' : section === 1 ? 'in' : 'above'
  const target = {
    below: { opacity: 0, y: '28vh' },
    in: { opacity: 1, y: 0 },
    above: { opacity: 0, y: '-14vh' },
  }[state]

  return (
    <motion.section
      id="work"
      className="slide slide--work"
      aria-hidden={section !== 1}
      initial={{ opacity: 0, y: '28vh' }}
      animate={target}
      // comes in while the home items are still leaving (a small delay, not a wait), and leaves on a balanced curve
      transition={
        reduce
          ? { duration: 0.01 }
          : state === 'in'
            ? { duration: 0.95, ease: [0.22, 0.8, 0.2, 1], delay: 0.15 }
            : { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
      }
      style={{ pointerEvents: state === 'in' ? 'auto' : 'none' }}
    >
      <WorkPane headingLevel={2} />
    </motion.section>
  )
}
