import { createContext, useCallback, useContext, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, useReducedMotion } from 'framer-motion'
import { projects } from '../data/content.js'

// The curtain that plays when a case study is opened.
//   1. a dark layer, then a layer in the project's own colour, sweep up over the page and show the project's title
//   2. the page underneath switches to the case study while it is covered
//   3. the curtain lifts away, and the case study's header and sections animate in (see Project.jsx)
// Links to a case study call `open(event, project)` from their onClick. Ctrl/Cmd/Shift clicks, middle clicks, and visitors who
// prefer reduced motion get the plain link instead.

const Ctx = createContext({ open: () => {} })
export const usePageTransition = () => useContext(Ctx)

const EASE = [0.76, 0, 0.24, 1]
const SWEEP = 0.62 // seconds for each layer to cross the screen
const HOLD = 520 // milliseconds the title stays on screen while the page changes underneath

export function PageTransitionProvider({ children }) {
  const navigate = useNavigate()
  const reduce = useReducedMotion()
  const [t, setT] = useState(null) // { project, phase: 'cover' | 'reveal' }
  const busy = useRef(false)
  const navigated = useRef(false)

  const open = useCallback(
    (e, project) => {
      if (reduce || busy.current) return
      if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return
      e.preventDefault()
      busy.current = true
      navigated.current = false
      setT({ project, phase: 'cover' })
    },
    [reduce],
  )

  // the colour layer is the last to arrive and the last to leave: its animations mark the two moments that matter
  const onColourDone = () => {
    if (!t) return
    if (t.phase === 'cover' && !navigated.current) {
      navigated.current = true
      navigate(`/works/${t.project.slug}`)
      window.scrollTo(0, 0)
      setTimeout(() => setT((x) => (x ? { ...x, phase: 'reveal' } : x)), HOLD)
    } else if (t.phase === 'reveal') {
      setT(null)
      busy.current = false
    }
  }

  const covering = t?.phase === 'cover'
  const p = t?.project
  const number = p ? String(projects.findIndex((x) => x.slug === p.slug) + 1).padStart(2, '0') : ''

  return (
    <Ctx.Provider value={{ open, active: Boolean(t) }}>
      {children}
      {t && (
        <div className="pt" aria-hidden="true">
          <motion.div
            className="pt__layer pt__layer--dark"
            initial={{ y: '100%' }}
            animate={{ y: covering ? '0%' : '-100%' }}
            transition={{ duration: SWEEP, ease: EASE, delay: covering ? 0 : 0.1 }}
          />
          <motion.div
            className="pt__layer"
            style={{ background: p.color }}
            initial={{ y: '100%' }}
            animate={{ y: covering ? '0%' : '-100%' }}
            transition={{ duration: SWEEP, ease: EASE, delay: covering ? 0.1 : 0 }}
            onAnimationComplete={onColourDone}
          >
            <motion.div
              className="pt__text"
              initial={{ opacity: 0, y: 36 }}
              animate={covering ? { opacity: 1, y: 0 } : { opacity: 0, y: -24 }}
              transition={{ duration: 0.5, ease: 'easeOut', delay: covering ? 0.45 : 0 }}
            >
              <span className="pt__label">Case study {number}</span>
              <span className="pt__title">{p.title}</span>
            </motion.div>
          </motion.div>
        </div>
      )}
    </Ctx.Provider>
  )
}
