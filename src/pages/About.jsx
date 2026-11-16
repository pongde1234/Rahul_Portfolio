import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import useEnter from '../components/useEnter.js'
import { profile, about, strengths } from '../data/content.js'

// The About page: a big headline, the intro and the ways to reach me on the left, and on the right a bill generator that prints a receipt
// listing what I do (work mode) or what I do off the clock (off-duty). Everything on the receipt comes from data/content.js (strengths, about.facts).

// "Football, trekking and swimming" -> ['Football', 'Trekking', 'Swimming']
const splitList = (text) =>
  text
    .replace(/ and /g, ', ')
    .split(',')
    .map((t) => t.trim())
    .filter(Boolean)
    .map((t) => t.charAt(0).toUpperCase() + t.slice(1))

// ['Football', 'Trekking', 'Swimming'] -> "football, trekking and swimming"
const sentence = (items) => {
  const l = items.map((t) => t.charAt(0).toLowerCase() + t.slice(1))
  return l.length > 1 ? `${l.slice(0, -1).join(', ')} and ${l.at(-1)}` : l[0] ?? ''
}

// a decorative barcode: the same bars every time
function Barcode() {
  const bars = useMemo(() => {
    let s = 7
    const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
    const out = []
    let x = 0
    while (x < 216) {
      const w = 1 + Math.floor(rnd() * 3)
      if (rnd() > 0.28) out.push([x, w])
      x += w + 1 + Math.floor(rnd() * 2)
    }
    return out
  }, [])
  return (
    <svg className="receipt__barcode" viewBox="0 0 216 36" preserveAspectRatio="none" aria-hidden="true">
      {bars.map(([x, w]) => (
        <rect key={x} x={x} y="0" width={w} height="36" />
      ))}
    </svg>
  )
}

// The bill generator: a slim slot, and the bill it prints, which slides smoothly out of the slot. Two things you can do:
//   - press work mode / off-duty (on the bill): the bill is pulled back in and a new one is printed
//   - take hold of any of its four corners: hovering a corner folds it in, as if a hand were pulling it, and if you keep hold the bill
//     tears off, swings away and falls, a torn stub stays in the slot, and a new bill is printed. Let go early and the corner springs
//     back. A click or a tap anywhere on the bill pulls it straight away, from the corner nearest to it (Enter on a corner does too).
const CORNERS = [
  { id: 'tl', label: 'top left', side: -1 },
  { id: 'tr', label: 'top right', side: 1 },
  { id: 'bl', label: 'bottom left', side: -1 },
  { id: 'br', label: 'bottom right', side: 1 },
]
const FOLD = 56 // how far (px) a corner folds in before the bill tears off
const SCRAPS = [0, 1, 2, 3, 4, 5, 6] // the bits of paper that fly off a tear

// The line the paper rips along (its top edge, where it meets the slot): a regular zigzag, one tooth every 14px or so.
// JAG is the height in px of each point, left to right; the stub left in the slot (billgen__stub in styles.css) has the same teeth.
const JAG = Array.from({ length: 45 }, (_, i) => (i % 2 ? 8 : 0))
// The clip that shows the rip: it has run in from the pulled side across `r` (0 to 1) of the bill. Torn paper has the jagged top;
// the part not yet torn is still joined to the slot (its top is cut well above the bill, so it is all there).
function ripPath(r, side) {
  if (r <= 0) return 'none'
  const n = JAG.length - 1
  const up = '-40px'
  const pts = []
  if (side > 0) {
    const xr = (1 - r) * 100 // the rip has reached this x (%), coming from the right
    pts.push(`-60px ${up}`, `${xr}% ${up}`)
    JAG.forEach((j, i) => {
      const x = (i * 100) / n
      if (x >= xr) pts.push(`${x}% ${j}px`)
    })
    pts.push(`calc(100% + 60px) ${JAG[n]}px`)
  } else {
    const xr = r * 100 // coming from the left
    pts.push(`-60px ${JAG[0]}px`)
    JAG.forEach((j, i) => {
      const x = (i * 100) / n
      if (x <= xr) pts.push(`${x}% ${j}px`)
    })
    pts.push(`${xr}% ${up}`, `calc(100% + 60px) ${up}`)
  }
  pts.push('calc(100% + 60px) calc(100% + 60px)', '-60px calc(100% + 60px)')
  return `polygon(${pts.join(', ')})`
}

const BILL = {
  hidden: { y: '-100%', x: 0, rotate: 0 },
  // one smooth slide out of the slot: quick at first, settling gently into place
  print: {
    y: '0%',
    x: 0,
    rotate: 1.2,
    transition: { y: { duration: 1.9, ease: [0.22, 0.7, 0.2, 1], delay: 0.15 }, rotate: { duration: 1.2, ease: 'easeOut' } },
  },
  // torn off at a corner, in three beats (the rip itself is drawn by ripPath, in step with this):
  //   1. tension: the paper is pulled taut and shivers, still joined to the slot
  //   2. the rip: the pulled corner is dragged down and out while the far top corner stays joined, so the bill pivots on it and a
  //      jagged gap opens along the top, wider and wider, as the tear runs across (about half a second, slow enough to see)
  //   3. free: the last of the paper lets go with a snap, and the bill swings out and falls
  // Pulled by a top corner the hand is right at the tear, so it pivots a little less than when it is pulled by the bottom (a longer lever).
  tear: ({ side, top }) => ({
    x: [0, 1 * side, -1 * side, 2 * side, 6 * side, 10 * side, 64 * side],
    y: [0, 3, 2, 5, 10, 16, 640],
    rotate: top ? [1.2, 2 * side, 1.4 * side, 3 * side, 11 * side, 13 * side, 40 * side] : [1.2, 2.2 * side, 1.4 * side, 3.5 * side, 14 * side, 16 * side, 44 * side],
    transition: { duration: 2, times: [0, 0.04, 0.08, 0.12, 0.34, 0.4, 1], ease: ['easeOut', 'easeInOut', 'easeIn', [0.35, 0, 0.6, 1], 'easeOut', [0.55, 0, 1, 0.6]] },
  }),
  // pulled back in (a new bill is coming), or already gone (it was torn off)
  exit: ({ kind }) => (kind === 'tear' ? { opacity: 0, transition: { duration: 0 } } : { y: '-100%', transition: { duration: 0.45, ease: [0.5, 0, 0.8, 0.4] } }),
}

function BillGenerator({ outside }) {
  const reduce = useReducedMotion()
  const [mode, setMode] = useState('work') // 'work' | 'off'
  const [n, setN] = useState(0) // which bill: it changes each time one is printed
  const [phase, setPhase] = useState(reduce ? 'ready' : 'printing') // 'printing' | 'ready' | 'tearing'
  const [exitKind, setExitKind] = useState('retract') // how the bill on show leaves: 'retract' (pulled in) or 'tear'
  const [stub, setStub] = useState(false) // the torn end left hanging from the slot
  const [folding, setFolding] = useState(null) // the corner being folded in, if any
  const [from, setFrom] = useState('br') // the corner the last bill was torn from
  const work = mode === 'work'
  const items = work ? strengths : splitList(outside)

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const fold = useMotionValue(0) // how far the held corner is folded in, in px
  const foldPx = useTransform(fold, (v) => `${v}px`)
  const grip = useRef(null)
  const rip = useMotionValue(0) // how far the tear has run across the top of the bill (0 to 1)
  const sideRef = useRef(1)
  const ripClip = useTransform(rip, (r) => ripPath(r, sideRef.current))

  // A hover takes hold only if the pointer has moved since the bill finished printing: a pointer resting on a corner while the next
  // bill prints does not start pulling it.
  const moved = useRef(false)
  useEffect(() => {
    const onMove = () => {
      moved.current = true
    }
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => window.removeEventListener('pointermove', onMove)
  }, [])

  const tearOff = (c) => {
    if (phaseRef.current !== 'ready') return
    setFrom(c)
    if (reduce) {
      setExitKind('tear')
      setN((x) => x + 1)
      return
    }
    sideRef.current = CORNERS.find((k) => k.id === c)?.side ?? 1
    rip.set(0)
    setStub(true)
    setFolding(c)
    setPhase('tearing')
    // the rip starts once the paper has been pulled taut, and runs across in about half a second
    animate(rip, 1, { duration: 0.46, delay: 0.2, ease: [0.35, 0, 0.7, 1] })
  }
  // hover: the corner folds in over about three quarters of a second; keep hold and the bill tears off
  const grab = (c) => {
    if (reduce || phaseRef.current !== 'ready' || !moved.current) return
    grip.current?.stop()
    setFolding(c)
    grip.current = animate(fold, FOLD, { duration: 0.75, ease: [0.4, 0, 0.9, 0.5], onComplete: () => tearOff(c) })
  }
  // let go early: the corner springs back
  const release = () => {
    if (phaseRef.current !== 'ready') return
    grip.current?.stop()
    grip.current = animate(fold, 0, { duration: 0.3, ease: 'easeOut', onComplete: () => setFolding(null) })
  }
  // click, tap or Enter: a quick pull
  const pull = (c) => {
    if (phaseRef.current !== 'ready') return
    if (reduce) return tearOff(c)
    grip.current?.stop()
    setFolding(c)
    grip.current = animate(fold, FOLD, { duration: 0.22, ease: 'easeIn', onComplete: () => tearOff(c) })
  }

  // a click anywhere on the bill (not on its buttons) tears it off, from the corner nearest the click
  const clickBill = (e) => {
    if (e.target.closest('.receipt__switch, .receipt__corner')) return
    const r = e.currentTarget.getBoundingClientRect()
    const v = e.clientY < r.top + r.height / 2 ? 't' : 'b'
    const h = e.clientX < r.left + r.width / 2 ? 'l' : 'r'
    pull(v + h)
  }

  const choose = (m) => {
    if (m === mode || phase === 'tearing') return
    grip.current?.stop()
    fold.set(0)
    rip.set(0)
    setFolding(null)
    setExitKind('retract')
    setStub(false)
    setMode(m)
    if (!reduce) setPhase('printing')
    setN((x) => x + 1)
  }
  const onBillDone = (def) => {
    if (def === 'print') {
      setPhase('ready')
      setStub(false)
      moved.current = false // from now on, only a pointer that moves can take hold of it
    } else if (def === 'tear') {
      setExitKind('tear')
      fold.set(0)
      rip.set(0)
      setFolding(null)
      setPhase('printing')
      setN((x) => x + 1)
    }
  }

  const side = CORNERS.find((c) => c.id === from)?.side ?? 1
  const custom = { kind: exitKind, side, top: from.startsWith('t') }

  return (
    <aside className="billgen" aria-label={`${profile.name}’s café: the bill generator`}>
      <div className="billgen__bar" aria-hidden="true" />

      <div className="billgen__out" aria-live="polite">
        {stub && <span className="billgen__stub" aria-hidden="true" />}
        {/* little scraps of paper that fly off the rip as it runs across */}
        {phase === 'tearing' &&
          SCRAPS.map((k) => (
            <motion.i
              key={`${n}-${k}`}
              className="billgen__scrap"
              style={{ left: `${side > 0 ? 96 - k * 11 : 4 + k * 11}%` }}
              initial={{ opacity: 0, y: 4, x: 0, rotate: 0 }}
              animate={{ opacity: [0, 1, 1, 0], y: [4, 14 + (k % 3) * 8, 46 + k * 9, 110 + k * 12], x: [0, 6 * side, (k % 2 ? 14 : -10) * side, (k % 2 ? 30 : -18) * side], rotate: [0, 90 * side, 200 * side, 330 * side] }}
              transition={{ duration: 0.9, delay: 0.24 + k * 0.05, ease: 'easeOut', times: [0, 0.15, 0.6, 1] }}
              aria-hidden="true"
            />
          ))}
        <AnimatePresence mode="wait" initial custom={custom}>
          <motion.div
            key={`${mode}-${n}`}
            className={`receipt${phase === 'tearing' ? ' receipt--torn' : ''}${phase === 'ready' ? ' receipt--ready' : ''}`}
            onClick={clickBill}
            style={{ '--fold': foldPx, clipPath: ripClip, transformOrigin: phase === 'tearing' ? (side > 0 ? '0% 0%' : '100% 0%') : '50% 0%' }}
            custom={custom}
            variants={reduce ? undefined : BILL}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? { y: 0, rotate: 1.2 } : phase === 'tearing' ? 'tear' : 'print'}
            exit={reduce ? { opacity: 0 } : 'exit'}
            onAnimationComplete={reduce ? undefined : onBillDone}
          >
            <div className="receipt__paper" data-fold={folding ?? undefined}>
              <p className="receipt__brand">{profile.name.toUpperCase()}’S CAFÉ</p>
              <p className="receipt__sub">est. 2022 · order #{String(n + 1).padStart(2, '0')}</p>
              <div className="receipt__switch" role="group" aria-label="Choose what to print">
                <button type="button" className={work ? 'on' : ''} aria-pressed={work} onClick={() => choose('work')}>work mode</button>
                <button type="button" className={work ? '' : 'on'} aria-pressed={!work} onClick={() => choose('off')}>off-duty</button>
              </div>
              <div className="receipt__rule" />
              <p className="receipt__title">
                {work ? 'Turning complex workflows into products that feel simple.' : `Off the clock: ${sentence(items)}.`}
              </p>
              <div className="receipt__rule" />
              <ul className="receipt__items">
                {items.map((t) => (
                  <li key={t}>
                    <span>{t}</span>
                    <i aria-hidden="true" />
                    <b>x1</b>
                  </li>
                ))}
                {work && (
                  <li className="receipt__total">
                    <span>TOTAL · Faclon Labs</span>
                    <i aria-hidden="true" />
                    <b>since 2022</b>
                  </li>
                )}
              </ul>
              <div className="receipt__rule" />
              <p className="receipt__thanks">thank you · come again ☺</p>
              <Barcode />
            </div>

            {/* the corner that is folded in: the flap is the part of the paper turned over */}
            {folding && (
              <span className={`receipt__flap receipt__flap--${folding}`} aria-hidden="true">
                <i />
              </span>
            )}

            {/* the four corners you can take hold of */}
            {CORNERS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`receipt__corner receipt__corner--${c.id}`}
                aria-label={`Tear off the bill from the ${c.label} corner`}
                tabIndex={c.id === 'br' ? 0 : -1}
                disabled={phase !== 'ready'}
                onPointerEnter={() => grab(c.id)}
                onPointerLeave={release}
                onClick={(e) => {
                  e.stopPropagation()
                  pull(c.id)
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className={`billgen__hint${phase === 'ready' ? ' billgen__hint--on' : ''}`} aria-hidden="true"><span className="fine">Hover a corner or click the bill to tear it off.</span><span className="touch">Tap the bill to tear it off.</span></p>
    </aside>
  )
}

// The About content, shared by the About page (headingLevel 1) and the home page's About slide (headingLevel 2).
export function AboutContent({ headingLevel = 1 }) {
  const Title = `h${headingLevel}`
  const enter = useEnter()
  const outside = about.facts.find(([k]) => k === 'Outside work')?.[1] ?? ''

  return (
    <section className="section page about">
      <div className="wrap about__grid">
        <div className="about__text">
          <motion.p className="mono small" {...enter(0)}>About</motion.p>
          <Title className="about__title">
            <span className="cs-mask">
              <motion.span className="cs-mask__in" {...enter.mask(0.1)}>
                I design with care for <b>people</b>.
              </motion.span>
            </span>
          </Title>
          <motion.p className="about__lead" {...enter(0.3)}>{about.intro}</motion.p>
          <motion.a className="about__mail" href={`mailto:${profile.email}`} {...enter(0.4)}>
            {profile.email} <span aria-hidden="true">↗</span>
          </motion.a>
          <motion.p className="about__links" {...enter(0.5)}>
            <a href={profile.resume} target="_blank" rel="noreferrer">Resume (PDF) ↗</a>
            {profile.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer">{s.label} ↗</a>
            ))}
          </motion.p>
        </div>

        <BillGenerator outside={outside} />
      </div>

      <div className="wrap about__more">
        <motion.dl className="about__facts" {...enter(0.6)}>
          {about.facts.map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </motion.dl>
        <motion.div {...enter(0.7)}>
          <h2 className="about__h2">What I’m good at</h2>
          <div className="chips chips--solid">
            {strengths.map((s) => <em key={s}>{s}</em>)}
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default function About() {
  return <AboutContent headingLevel={1} />
}
