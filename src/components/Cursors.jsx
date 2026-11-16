import { useEffect, useState } from 'react'
import { motion, useMotionValue, useReducedMotion, useSpring } from 'framer-motion'
import useMedia from './useMedia.js'
import { profile } from '../data/content.js'

// What the visitor is pointing at -> label on their cursor tag (null = hide the tag).
const labelFor = (t) => {
  const me = profile.name // your name is the default tag, like a Figma collaborator cursor
  if (!(t instanceof Element)) return me
  if (t.closest('.wcard')) return null // the big "View" bubble handles project cards
  if (t.closest('.wk__link')) return 'View'
  if (t.closest('textarea')) return 'Type'
  if (t.closest('a,button,.cta')) return 'Click'
  if (t.closest('.item')) return me
  return me
}

// Over these the normal pointer comes back (the same list is in styles.css, "single custom cursor"): the custom arrow steps aside
// and only the tag stays, a little further off so it clears the pointer.
const NATIVE = "a[href], button:not(:disabled), summary, select, label[for], [role='button'], [role='tab'], input, textarea, .cta, .receipt--ready"

// ONE custom cursor (replaces the normal pointer except over links, buttons and fields): indigo arrow + a tag that follows it.
// Desktop mouse only; off for touch / reduced motion.
export default function Cursors() {
  const fine = useMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)')
  const reduce = useReducedMotion()
  const on = fine && !reduce

  const mx = useMotionValue(-100)
  const my = useMotionValue(-100)
  const sx = useSpring(mx, { stiffness: 520, damping: 42 })
  const sy = useSpring(my, { stiffness: 520, damping: 42 })

  const [label, setLabel] = useState(profile.name)
  const [visible, setVisible] = useState(false)
  const [native, setNative] = useState(false) // the normal pointer is showing (over a link, button or field)

  useEffect(() => {
    if (!on) return undefined
    const root = document.documentElement
    root.classList.add('custom-cursor') // hides the normal pointer so there is only one

    const onMove = (e) => {
      if (e.pointerType && e.pointerType !== 'mouse') return
      mx.set(e.clientX)
      my.set(e.clientY)
      setVisible(true)
      setLabel(labelFor(e.target))
      setNative(e.target instanceof Element && !!e.target.closest(NATIVE))
    }
    const onLeave = () => setVisible(false)

    window.addEventListener('pointermove', onMove, { passive: true })
    root.addEventListener('pointerleave', onLeave)
    return () => {
      window.removeEventListener('pointermove', onMove)
      root.removeEventListener('pointerleave', onLeave)
      root.classList.remove('custom-cursor')
    }
  }, [on, mx, my])

  if (!on) return null
  return (
    <>
      {/* arrow: exactly on the pointer */}
      <motion.div className="cursor" style={{ x: mx, y: my, opacity: visible && !native ? 1 : 0 }} aria-hidden="true">
        <svg className="cursor__arrow" width="20" height="22" viewBox="0 0 20 22">
          <path d="M3 2l14 8-6.4 1.9L7.5 18.5z" style={{ fill: 'var(--accent)' }} stroke="#fff" strokeWidth="1.6" strokeLinejoin="round" />
        </svg>
      </motion.div>

      {/* tag: follows with a tiny lag */}
      <motion.div className="cursor" style={{ x: sx, y: sy }} animate={{ opacity: visible && label ? 1 : 0 }} transition={{ duration: 0.15 }} aria-hidden="true">
        {label && (
          <motion.span key={label} className={`cursor__tag${native ? ' cursor__tag--native' : ''}`} initial={{ scale: 0.7, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 26 }}>
            {label}
          </motion.span>
        )}
      </motion.div>
    </>
  )
}
