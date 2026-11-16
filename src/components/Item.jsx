import { useLayoutEffect, useRef, useState } from 'react'
import { motion, useDragControls, useReducedMotion } from 'framer-motion'
import useMedia from './useMedia.js'

const num = (v) => parseFloat(v) || 0

// A draggable item on the desk. On small screens it flows in a column.
// `handle`: drag only from a grip bar (so text inside can be selected/edited).
// `away`: fly off-screen (used when the page scrolls on to the next slide).
// `center`: sit in the middle of the screen, bigger (the opening intro); when it turns false the item travels to its place on the board.
export default function Item({ children, l, t, w, r = 0, boardRef, delay = 0, className = '', onDelete, handle = false, away = false, center = false }) {
  const desktop = useMedia('(min-width: 1000px)')
  const controls = useDragControls()
  const reduce = useReducedMotion()
  const ref = useRef(null)
  const [off, setOff] = useState(null) // how far the item has to move from its place to the middle of the screen
  const travelled = useRef(false)
  if (center) travelled.current = true

  useLayoutEffect(() => {
    if (!center || off) return
    const el = ref.current
    const board = el.offsetParent.getBoundingClientRect()
    setOff({
      x: window.innerWidth / 2 - board.left - (el.offsetLeft + el.offsetWidth / 2),
      y: window.innerHeight / 2 - board.top - (el.offsetTop + el.offsetHeight / 2),
    })
  }, [center, off])

  // direction to fly: outward from the centre of the board, and up
  const cx = num(l) + num(w) / 2 - 50
  const fly = { x: cx * 22, y: -760 + num(t) * 3, rotate: cx * 0.9 }

  return (
    <motion.div
      ref={ref}
      className={`item ${className} ${away ? 'item--away' : ''}`}
      style={{ '--l': l, '--t': t, '--w': w, '--r': `${r}deg` }}
      drag={desktop && !away && !center}
      dragControls={controls}
      dragListener={!handle}
      dragConstraints={boardRef}
      dragMomentum={false}
      dragElastic={0.08}
      whileDrag={{ scale: 1.04, zIndex: 60, cursor: 'grabbing' }}
      initial={center ? { opacity: 0, scale: 1.3 } : { opacity: 0, y: 24 }}
      animate={
        away
          ? { opacity: 0, x: fly.x, y: fly.y, rotate: fly.rotate, scale: 0.92 }
          : center
            ? off
              ? { opacity: 1, x: off.x, y: off.y, rotate: 0, scale: 1.55 }
              : { opacity: 0, scale: 1.3 }
            : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={
        reduce
          ? { duration: 0.01 }
          : center
            ? { duration: 0.7, ease: [0.2, 0.8, 0.2, 1], delay: 0.1 }
            : away
              ? { duration: 0.6, ease: [0.45, 0, 0.25, 1], delay: delay * 0.2 } // balanced ease: no slow start, no sudden snap
              : travelled.current
                ? { duration: 1.05, ease: [0.65, 0, 0.2, 1] } // from the middle of the screen to its place
                : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: delay * 0.6 + 0.05 }
      }
      onAnimationComplete={() => {
        if (!center) travelled.current = false // arrived: later moves use the usual timings
      }}
    >
      {handle && desktop && (
        <div className="item__grip" onPointerDown={(e) => controls.start(e)} title="Drag to move" aria-hidden="true" />
      )}
      {onDelete && (
        <button className="item__x" onClick={onDelete} aria-label="Remove sticky note">
          <svg viewBox="0 0 12 12" width="12" height="12" aria-hidden="true"><path d="M1.5 1.5l9 9M10.5 1.5l-9 9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" /></svg>
        </button>
      )}
      {children}
    </motion.div>
  )
}
