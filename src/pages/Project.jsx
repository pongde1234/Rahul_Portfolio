import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lightbulb, Lock } from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'
import ArrowLabel from '../components/ArrowLabel.jsx'
import Cover from '../components/Cover.jsx'
import CaseBlock from '../components/CaseBlocks.jsx'
import PrototypeFrame from '../components/PrototypeFrame.jsx'
import useMedia from '../components/useMedia.js'
import useEnter from '../components/useEnter.js'
import { usePageTransition } from '../components/PageTransition.jsx'
import { projects } from '../data/content.js'

const MotionLink = motion.create(Link)
const slugify = (t) => t.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

export default function Project() {
  const { slug } = useParams()
  const reduce = useReducedMotion()
  const idx = projects.findIndex((p) => p.slug === slug)
  const p = projects[idx]
  // the page's entrance: each part fades up in turn. When the page opens behind the curtain, the first part waits for the curtain to lift.
  const baseEnter = useEnter()
  const { open, active } = usePageTransition()
  const [behindCurtain] = useState(active)
  const wait = behindCurtain ? 0.6 : 0
  const enter = (delay, from) => baseEnter(wait + delay, from)
  enter.mask = (delay) => baseEnter.mask(wait + delay)

  // blocks (new) or the older simple `sections` list
  const blocks = useMemo(() => {
    if (!p) return []
    if (p.blocks) return p.blocks
    return (p.sections ?? []).map((s) => ({ type: 'text', heading: s.heading, body: s.body }))
  }, [p])

  // "on this page" index + which section is being read
  const toc = useMemo(
    () => blocks.filter((b) => b.heading).map((b) => ({ id: slugify(b.heading), label: b.heading })),
    [blocks],
  )
  const [current, setCurrent] = useState(toc[0]?.id)

  // editorial projects (`editorial: true`): the blocks are grouped into numbered sections. A block with a `heading` starts a section.
  const sections = useMemo(() => {
    if (!p?.editorial) return null
    const out = []
    blocks.forEach((b) => {
      if (b.heading || !out.length) out.push({ id: b.heading ? slugify(b.heading) : 'intro', num: null, blocks: [] })
      out.at(-1).blocks.push(b)
    })
    let n = 0
    out.forEach((s) => {
      if (s.id !== 'intro') s.num = (n += 1)
    })
    return out
  }, [p, blocks])

  useEffect(() => {
    setCurrent(toc[0]?.id)
    const els = toc.map((t) => document.getElementById(t.id)).filter(Boolean)
    if (!els.length) return undefined
    const io = new IntersectionObserver(
      (entries) => entries.forEach((e) => e.isIntersecting && setCurrent(e.target.id)),
      { rootMargin: '-30% 0px -60% 0px' },
    )
    els.forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [toc, slug])

  // the live prototype (if the project has one) and which of its screens is showing, so the timeline can follow it
  const frameRef = useRef(null)
  const phone = useMedia('(max-width: 640px)')
  const firstStep = p?.process?.[0]?.step ?? 'devices'
  const [protoStep, setProtoStep] = useState(firstStep)
  const prevStep = useRef(firstStep) // the step before this one, so the timeline's line can fill on from there
  useEffect(() => {
    prevStep.current = protoStep
  }, [protoStep])
  useEffect(() => {
    setProtoStep(firstStep)
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'proto:step') return
      setProtoStep(e.data.step)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [slug])

  if (!p) {
    return (
      <section className="section page wrap">
        <h1>That project isn't here</h1>
        <p>The link may be broken, or the project may have moved.</p>
        <Link to="/works"><ArrowLabel>View all projects →</ArrowLabel></Link>
      </section>
    )
  }

  const prev = projects[(idx - 1 + projects.length) % projects.length]
  const next = projects[(idx + 1) % projects.length]
  const glance = (p.glance ?? []).filter((g) => !['my role', 'timeline'].includes(g.label.toLowerCase()))
  const jump = (id) => document.getElementById(id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })

  // timeline under the banner: the project's steps, shown as plain labels (not clickable). A step can name the section
  // it belongs to (`to`, a heading), and the step you are reading is highlighted.
  const steps = (p.process ?? []).map((s) => (typeof s === 'string' ? { label: s } : s))
  const curIdx = toc.findIndex((t) => t.id === current)
  let activeStep = 0
  steps.forEach((s, i) => {
    const at = s.to ? toc.findIndex((t) => t.label === s.to) : -1
    if (at >= 0 && at <= curIdx) activeStep = i
  })
  const result = (p.glance ?? []).find((g) => g.label.toLowerCase() === 'result')

  // A project with a live prototype (`p.prototype`) shows it at the top of the right-hand column, beside the section stepper,
  // with the timeline and the problem / result cards directly under it. Other projects keep the banner above the title block.
  const hasPrototype = !!p.prototype
  // a wide prototype is a picture on a phone, so there is nothing for the timeline to control
  const stillOnly = hasPrototype && !!p.prototype.viewW && phone

  // Under a live prototype the timeline is its remote control: each step is a screen of the prototype. Clicking one shows that
  // screen, and the highlight follows whatever the prototype is showing (including when the visitor clicks inside it).
  // Under a banner it is plain labels, not clickable, following the section being read.
  const goStep = (step) => frameRef.current?.contentWindow?.postMessage({ type: 'proto:goto', step }, window.location.origin)
  const liveActive = steps.findIndex((s) => s.step === protoStep)
  const fromIdx = Math.max(0, steps.findIndex((s) => s.step === prevStep.current))
  const timeline = steps.length > 0 && (
    <nav className="cs__tl" aria-label={hasPrototype ? 'Prototype steps' : 'Project timeline'}>
      <div className="cs__tl-scroll">
        <div className="cs__tl-row">
          <ol className="cs__tl-steps" style={{ '--from': fromIdx }}>
            {steps.map((s, i) => {
              const on = hasPrototype ? i === liveActive : i === activeStep
              return (
                <li key={s.label} style={{ '--i': i }}>
                  {hasPrototype ? (
                    <button type="button" className={on ? 'on' : ''} aria-current={on ? 'step' : undefined} onClick={() => goStep(s.step)}>
                      <i>{String(i + 1).padStart(2, '0')}</i>
                      {s.label}
                    </button>
                  ) : (
                    <span className={on ? 'on' : ''} aria-current={on ? 'step' : undefined}>
                      <i>{String(i + 1).padStart(2, '0')}</i>
                      {s.label}
                    </span>
                  )}
                </li>
              )
            })}
          </ol>
          {result &&
            (hasPrototype ? (
              <button type="button" className={`cs__tl-end cs__tl-end--btn${protoStep === 'done' ? ' on' : ''}`} onClick={() => goStep('done')}>
                Done!
              </button>
            ) : (
              <span className="cs__tl-end">Done!</span>
            ))}
        </div>
      </div>
      {/* only where the chips really are clickable (they drive the prototype) */}
      {hasPrototype && (
        <p className="cs__tl-hint">
          <span className="cs__bulb"><Lightbulb aria-hidden="true" /></span>
          <span className="fine">Click a step to jump to it</span>
          <span className="touch">Tap a step to jump to it</span>
        </p>
      )}
    </nav>
  )

  // role and timeline are in the facts above, so the cards keep only the problem and the result
  const glanceCards = glance.length > 0 && (
    <div className="cs__glance" aria-label="At a glance" style={{ '--n': glance.length }}>
      {glance.map((g) => (
        <div key={g.label} className="cs__gcard">
          <span className="mono">{g.label}</span>
          {g.big && <b>{g.big}</b>}
          {g.text && <p>{g.text}</p>}
        </div>
      ))}
    </div>
  )

  return (
    <article className="cs">
      <header className="cs__head">
        <MotionLink to="/works" className="cs__back mono" {...enter(0, { x: -16 })}><ArrowLabel>← All projects</ArrowLabel></MotionLink>
        {/* the banner comes first, then the title block and the facts under it */}
        {!hasPrototype && (
          <motion.div className="cs__hero" style={{ '--c': p.color }} {...enter(0.05, { y: 40, scale: 0.97 })}>
            <Cover p={p} />
          </motion.div>
        )}

        <div className="cs__intro">
          <motion.p className="cs__eyebrow" {...enter(0.15)}>
            <i aria-hidden="true">{p.company.charAt(0)}</i>
            {p.eyebrow ?? p.company}
          </motion.p>
          <h1 className="cs-mask">
            <motion.span className="cs-mask__in" {...enter.mask(0.22)}>{p.headline ?? p.title}</motion.span>
          </h1>
          {p.subtitle && <motion.p className="cs__sub" {...enter(0.34)}>{p.subtitle}</motion.p>}
          <motion.p className="cs__lead" {...enter(0.46)}>{p.overview}</motion.p>
        </div>

        {/* four columns: each value is one or more short lines */}
        <motion.dl className="cs__meta" {...enter(0.56)}>
          {[
            ['Role', [p.role]],
            ['Duration', [p.timeline, p.year]],
            ['Team', [p.team, p.teamDetail]],
            ['Methods', [p.methods?.join(' · ')]],
          ]
            .map(([k, lines]) => [k, lines.filter(Boolean)])
            .filter(([, lines]) => lines.length)
            .map(([k, lines]) => (
              <div key={k}>
                <dt>{k}</dt>
                <dd>
                  {lines.map((l) => (
                    <span key={l}>{l}</span>
                  ))}
                </dd>
              </div>
            ))}
        </motion.dl>

        {!hasPrototype && timeline}
        {!hasPrototype && glanceCards}
      </header>

      <div className="cs__body">
        <motion.aside className="cs__toc" aria-label="On this page" {...enter(0.7, { x: -20 })}>
          <p className="mono">On this page</p>
          <ol>
            {toc.map((t, i) => (
              <li key={t.id}>
                {current === t.id && <motion.i layoutId="toc-mark" className="cs__toc-mark" transition={reduce ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 38 }} aria-hidden="true" />}
                <button className={current === t.id ? 'on' : ''} onClick={() => jump(t.id)}>
                  <span className="mono">{String(i + 1).padStart(2, '0')}</span>
                  {t.label}
                </button>
              </li>
            ))}
          </ol>
        </motion.aside>

        <div className="cs__content">
          {hasPrototype && (
            <motion.div className="cs__proto" {...enter(0.8, { y: 48, scale: 0.98 })}>
              <PrototypeFrame {...p.prototype} frameRef={frameRef} />
              {!stillOnly && timeline}
              {glanceCards}
            </motion.div>
          )}
          {sections
            ? sections.map((sec) => (
                <section key={sec.id} className="cs-sec">
                  {sec.blocks.map((b, i) => (
                    <CaseBlock
                      key={i}
                      block={b}
                      project={p}
                      sectionId={b.heading ? slugify(b.heading) : undefined}
                      sectionNum={b.heading ? sec.num : undefined}
                    />
                  ))}
                </section>
              ))
            : blocks.map((b, i) => (
                <CaseBlock key={i} block={b} project={p} sectionId={b.heading ? slugify(b.heading) : undefined} />
              ))}

          {/* the end of every case study: why the real design is shown so sparingly */}
          <aside className="cs__note">
            <Lock size={16} aria-hidden="true" />
            <p>
              Only a few screenshots of the real design are shown, to respect the non-disclosure agreement I signed with Faclon
              Labs. The prototype is rebuilt for this portfolio.
            </p>
          </aside>
        </div>
      </div>

      <nav className="cs__next" aria-label="More projects">
        {projects.length > 2 && (
          <Link to={`/works/${prev.slug}`} className="cs__nextlink" onClick={(e) => open(e, prev)}>
            <span className="mono"><ArrowLabel>← Previous project</ArrowLabel></span>
            <b>{prev.title}</b>
          </Link>
        )}
        <Link to={`/works/${next.slug}`} className={`cs__nextlink ${projects.length > 2 ? 'cs__nextlink--right' : 'cs__nextlink--solo'}`} onClick={(e) => open(e, next)}>
          <span className="mono"><ArrowLabel>Next project →</ArrowLabel></span>
          <b>{next.title}</b>
        </Link>
      </nav>
    </article>
  )
}
