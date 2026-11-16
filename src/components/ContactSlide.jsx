import { motion, useReducedMotion } from 'framer-motion'
import { profile } from '../data/content.js'

// Dark panel that slides up over the work slide.
export default function ContactSlide({ section, at = 2 }) {
  const reduce = useReducedMotion()
  const on = section >= at
  return (
    // data-color-scheme="dark": this panel uses the Faclon design system's dark colours, whatever the rest of the page is
    <section className="slide slide--contact" data-color-scheme="dark" aria-hidden={!on}>
      <motion.div
        className="contact__bg"
        initial={{ y: '100%' }}
        animate={{ y: on ? '0%' : '100%' }}
        transition={reduce ? { duration: 0.01 } : { duration: 0.75, ease: [0.65, 0, 0.35, 1] }}
      />
      <motion.div
        className="contact__body"
        initial={{ opacity: 0, y: 50 }}
        animate={on ? { opacity: 1, y: 0 } : { opacity: 0, y: 50 }}
        transition={reduce ? { duration: 0.01 } : { duration: 0.6, ease: 'easeOut', delay: on ? 0.3 : 0 }}
        style={{ pointerEvents: on ? 'auto' : 'none' }}
      >
        <p className="eyebrow">Contact</p>
        <h2>Let's work together.</h2>
        <p className="contact__lead">Email me about a role or a project.</p>
        <a className="btn btn--accent" href={`mailto:${profile.email}`} tabIndex={on ? 0 : -1}>Email {profile.email}</a>
        <div className="socials">
          {profile.socials.map((s) => (
            <a key={s.label} href={s.url} target="_blank" rel="noreferrer" tabIndex={on ? 0 : -1}>{s.label} ↗</a>
          ))}
        </div>
        <p className="contact__foot">© {new Date().getFullYear()} {profile.name} · Made with coffee &amp; React</p>
      </motion.div>
    </section>
  )
}
