import { useEffect, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { AboutContent } from '../pages/About.jsx'
import { profile } from '../data/content.js'

// The home page's About slide (between Work and Contact): the same content as the About page, in a column that scrolls inside the slide.
// It is built the first time the slide is reached, so its entrance animation and the bill printing play on arrival.
export default function AboutSlide({ section, at }) {
  const reduce = useReducedMotion()
  const [seen, setSeen] = useState(false)
  useEffect(() => {
    if (section >= at) setSeen(true)
  }, [section, at])

  const state = section < at ? 'below' : section === at ? 'in' : 'above'
  const target = {
    below: { opacity: 0, y: '28vh' },
    in: { opacity: 1, y: 0 },
    above: { opacity: 0, y: '-14vh' },
  }[state]

  return (
    <motion.section
      id="about"
      className="slide slide--about"
      aria-hidden={section !== at}
      initial={{ opacity: 0, y: '28vh' }}
      animate={target}
      transition={
        reduce
          ? { duration: 0.01 }
          : state === 'in'
            ? { duration: 0.95, ease: [0.22, 0.8, 0.2, 1], delay: 0.15 }
            : { duration: 0.75, ease: [0.4, 0, 0.2, 1] }
      }
      style={{ pointerEvents: state === 'in' ? 'auto' : 'none' }}
    >
      <div className="about__scroll">
        {seen && <AboutContent headingLevel={2} />}
        {seen && <p className="contact__foot about__foot">© {new Date().getFullYear()} {profile.name} · Made with coffee &amp; React</p>}
      </div>
    </motion.section>
  )
}
