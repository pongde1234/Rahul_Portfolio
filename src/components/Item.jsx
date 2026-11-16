import { motion, useDragControls, useReducedMotion } from 'framer-motion'
import useMedia from './useMedia.js'

const num = (v) => parseFloat(v) || 0

// A draggable item on the desk. On small screens it flows in a column.
// `handle`: drag only from a grip bar (so text inside can be selected/edited).
// `away`: fly off-screen (used when the page scrolls on to the next slide).
export default function Item({ children, l, t, w, r = 0, boardRef, delay = 0, className = '', onDelete, handle = false, away = false }) {
  const desktop = useMedia('(min-width: 1000px)')
  const controls = useDragControls()
  const reduce = useReducedMotion()

  // direction to fly: outward from the centre of the board, and up
  const cx = num(l) + num(w) / 2 - 50
  const fly = { x: cx * 22, y: -760 + num(t) * 3, rotate: cx * 0.9 }

  return (
    <motion.div
      className={`item ${className} ${away ? 'item--away' : ''}`}
      style={{ '--l': l, '--t': t, '--w': w, '--r': `${r}deg` }}
      drag={desktop && !away}
      dragControls={controls}
      dragListener={!handle}
      dragConstraints={boardRef}
      dragMomentum={false}
      dragElastic={0.08}
      whileDrag={{ scale: 1.04, zIndex: 60, cursor: 'grabbing' }}
      initial={{ opacity: 0, y: 24 }}
      animate={
        away
          ? { opacity: 0, x: fly.x, y: fly.y, rotate: fly.rotate, scale: 0.92 }
          : { opacity: 1, x: 0, y: 0, rotate: 0, scale: 1 }
      }
      transition={
        reduce
          ? { duration: 0.01 }
          : away
            ? { duration: 0.6, ease: [0.45, 0, 0.25, 1], delay: delay * 0.2 } // balanced ease: no slow start, no sudden snap
            : { duration: 0.6, ease: [0.2, 0.8, 0.2, 1], delay: delay * 0.6 + 0.05 }
      }
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
