import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import useEnter from '../components/useEnter.js'
import usePastTop from '../components/usePastTop.js'
import ArrowLabel from '../components/ArrowLabel.jsx'
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

// The bill generator: a slim slot, and the bill it prints, which slides smoothly out of the slot. Things you can do:
//   - press work mode / off-duty (on the bill): the bill is pulled back in and a new one is printed
//   - hover one of its two top corners: the corner curls in, as if a hand were reaching for it, and uncurls when the pointer leaves.
//   - press that corner and pull down: the bill follows your hand and the paper stretches taut. Let go early and it springs back.
//     Pull far enough and it gives: the rip runs across the top in a flash with a tearing sound, the bill comes free, flutters down,
//     a torn stub stays in the slot, and a new bill is printed.
//   - or just click or tap the bill (or press Enter on a corner): the same tear, without having to pull.
const CORNERS = [
  { id: 'tl', label: 'top left', side: -1 },
  { id: 'tr', label: 'top right', side: 1 },
]
const FOLD = 56 // how far (px) a corner folds in before the bill tears off
const SCRAPS = [0, 1, 2, 3, 4, 5, 6] // the bits of paper that fly off a tear
const TENSION = 0.55 // `pull` goes from 0 to this while the paper is stretched taut, then on to 1 as it rips
const REACH = 110 // how far (px) you have to pull a corner before the paper gives
const TILT = 11 // how far (degrees) the bill pivots, on its far top corner, by the time it has torn

// The tearing sound, made on the spot (no audio file): a burst of filtered noise that rises in pitch with a ragged volume, like fibres
// letting go one after another, then a short snap as the paper comes free. It plays only from a click or a press, so browsers allow it.
const VOLUME = 0.07 // how loud the tear is (0 to 1): kept very quiet, a soft rip and not a startle
let audioCtx
function playTear() {
  try {
    const AC = window.AudioContext || window.webkitAudioContext
    if (!AC) return
    audioCtx = audioCtx || new AC()
    const ctx = audioCtx
    if (ctx.state === 'suspended') ctx.resume()
    const t0 = ctx.currentTime
    const dur = 0.24
    const noise = (seconds) => {
      const len = Math.max(1, Math.floor(ctx.sampleRate * seconds))
      const buf = ctx.createBuffer(1, len, ctx.sampleRate)
      const d = buf.getChannelData(0)
      for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1
      const src = ctx.createBufferSource()
      src.buffer = buf
      return src
    }
    // the rip
    const rip = noise(dur + 0.05)
    const band = ctx.createBiquadFilter()
    band.type = 'bandpass'
    band.Q.value = 0.8
    band.frequency.setValueAtTime(1300, t0)
    band.frequency.exponentialRampToValueAtTime(4300, t0 + dur)
    const high = ctx.createBiquadFilter()
    high.type = 'highpass'
    high.frequency.value = 650
    const g = ctx.createGain()
    const steps = 48
    const curve = new Float32Array(steps)
    for (let i = 0; i < steps; i++) {
      const k = i / (steps - 1)
      curve[i] = Math.sin(Math.PI * Math.min(k * 1.12, 1)) ** 0.7 * (0.3 + Math.random() * 0.7) * VOLUME
    }
    g.gain.setValueCurveAtTime(curve, t0, dur)
    rip.connect(band).connect(high).connect(g).connect(ctx.destination)
    rip.start(t0)
    rip.stop(t0 + dur + 0.05)
    // the snap
    const snap = noise(0.05)
    const sh = ctx.createBiquadFilter()
    sh.type = 'highpass'
    sh.frequency.value = 2600
    const sg = ctx.createGain()
    sg.gain.setValueAtTime(0.0001, t0 + dur - 0.02)
    sg.gain.exponentialRampToValueAtTime(VOLUME * 0.9, t0 + dur)
    sg.gain.exponentialRampToValueAtTime(0.0001, t0 + dur + 0.045)
    snap.connect(sh).connect(sg).connect(ctx.destination)
    snap.start(t0 + dur - 0.02)
    snap.stop(t0 + dur + 0.06)
  } catch {
    /* no audio: the tear is silent */
  }
}

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
  const [from, setFrom] = useState('tr') // the corner the last bill was torn from
  const work = mode === 'work'
  const items = work ? strengths : splitList(outside)

  const phaseRef = useRef(phase)
  phaseRef.current = phase
  const fold = useMotionValue(0) // how far the held corner is folded in, in px
  const foldPx = useTransform(fold, (v) => `${v}px`)
  const grip = useRef(null)

  // The pull. `pull` runs 0 -> TENSION while the paper is held and stretched (it follows the hand), then TENSION -> 1 in a flash as it
  // rips. The bill pivots on its far top corner by TILT x pull, and the jagged tear opens in step with it. After that it is free: fx, fy
  // and fr are its flight, a flutter down.
  const pull = useMotionValue(0)
  const fx = useMotionValue(0)
  const fy = useMotionValue(0)
  const fr = useMotionValue(0)
  const sideRef = useRef(1)
  const halfW = useRef(150)
  const pullAnim = useRef(null)
  const drag = useRef(null) // the corner being pulled by hand: { c, x0, y0, t }
  const billEl = useRef(null)
  const rad = (p) => (sideRef.current * TILT * p * Math.PI) / 180
  const ripClip = useTransform(pull, (p) => ripPath(Math.min(Math.max((p - TENSION) / (1 - TENSION), 0), 1), sideRef.current))
  const pullRotate = useTransform([pull, fr], ([p, f]) => sideRef.current * TILT * p + f)
  // pivoting on the far top corner, not on the middle: the shift that keeps that corner where it is
  const pullX = useTransform([pull, fx], ([p, f]) => -sideRef.current * halfW.current * (1 - Math.cos(rad(p))) + f)
  const pullY = useTransform([pull, fy], ([p, f]) => sideRef.current * halfW.current * Math.sin(rad(p)) + f)
  const resetPull = () => {
    pullAnim.current?.stop()
    pull.set(0)
    fx.set(0)
    fy.set(0)
    fr.set(0)
  }

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

  const aim = (c) => {
    sideRef.current = CORNERS.find((k) => k.id === c)?.side ?? 1
    halfW.current = (billEl.current?.offsetWidth ?? 300) / 2
  }

  // the bill is free: it drops straight down, no sideways sway (fx and fr stay at 0)
  const fly = () => {
    animate(fy,[0, 14, 110, 380, 780], { duration: 1.8, times: [0, 0.1, 0.38, 0.7, 1], ease: 'linear' }).then(finishTear)
  }
  const finishTear = () => {
    setExitKind('tear')
    fold.set(0)
    setFolding(null)
    setPhase('printing')
    setN((x) => x + 1) // the old bill leaves at once; resetPull runs when it has gone (onExitComplete)
  }
  // the paper gives: the rip runs across in a flash, with the sound, and the bill comes free
  const commit = (c) => {
    if (phaseRef.current !== 'ready') return
    setFrom(c)
    if (reduce) {
      setExitKind('tear')
      setN((x) => x + 1)
      return
    }
    aim(c)
    setStub(true)
    setFolding(c)
    setPhase('tearing')
    playTear()
    navigator.vibrate?.(18)
    pullAnim.current = animate(pull, 1, { duration: 0.2, ease: [0.55, 0, 0.9, 0.55] })
    pullAnim.current.then(fly)
  }

  // hover: the corner curls in, and stays curled while the pointer is on it. Hovering never tears the bill.
  const grab = (c) => {
    if (reduce || phaseRef.current !== 'ready' || !moved.current || drag.current) return
    grip.current?.stop()
    setFolding(c)
    grip.current = animate(fold, FOLD, { duration: 0.5, ease: [0.3, 0.7, 0.3, 1] })
  }
  // the pointer leaves: the corner uncurls
  const release = () => {
    if (phaseRef.current !== 'ready' || drag.current) return
    grip.current?.stop()
    grip.current = animate(fold, 0, { duration: 0.3, ease: 'easeOut', onComplete: () => setFolding(null) })
  }
  // click, tap or Enter: the same tear, without pulling: the paper tightens for a beat, then gives
  const quickTear = (c) => {
    if (phaseRef.current !== 'ready' || drag.current) return
    if (reduce) return commit(c)
    aim(c)
    grip.current?.stop()
    pullAnim.current?.stop()
    setFolding(c)
    grip.current = animate(fold, FOLD, { duration: 0.2, ease: 'easeOut' })
    pullAnim.current = animate(pull, [pull.get(), 0.2, 0.46, TENSION], { duration: 0.34, times: [0, 0.4, 0.75, 1], ease: 'easeOut' })
    pullAnim.current.then(() => commit(c))
  }

  // press a top corner and pull down: the bill follows the hand, held taut. Pull far enough and the paper gives.
  const onCornerDown = (e, c) => {
    if (phaseRef.current !== 'ready' || reduce) return
    e.currentTarget.setPointerCapture?.(e.pointerId)
    aim(c)
    grip.current?.stop()
    pullAnim.current?.stop()
    moved.current = true
    setFolding(c)
    grip.current = animate(fold, FOLD, { duration: 0.2, ease: 'easeOut' })
    drag.current = { c, x0: e.clientX, y0: e.clientY, t: 0 }
  }
  const onCornerMove = (e) => {
    const d = drag.current
    if (!d) return
    const s = sideRef.current
    const len = Math.hypot(0.6 * s, 1)
    const along = ((e.clientX - d.x0) * 0.6 * s + (e.clientY - d.y0)) / len // down and a little outward
    const t = Math.min(Math.max(along / REACH, 0), 1)
    d.t = Math.max(d.t, t)
    pull.set(TENSION * t)
    if (t >= 1) {
      drag.current = null
      commit(d.c)
    }
  }
  const onCornerUp = (e, cancelled) => {
    const d = drag.current
    if (!d) return
    drag.current = null
    e.currentTarget.releasePointerCapture?.(e.pointerId)
    if (!cancelled && d.t < 0.06) return quickTear(d.c) // hardly moved: it was a click
    // let go before it gave: the paper springs back
    pullAnim.current = animate(pull, 0, { type: 'spring', stiffness: 240, damping: 13 })
  }

  // a click anywhere on the bill (not on its buttons) tears it off, from the top corner nearest the click
  const clickBill = (e) => {
    if (e.target.closest('.receipt__switch, .receipt__corner')) return
    const r = e.currentTarget.getBoundingClientRect()
    quickTear(e.clientX < r.left + r.width / 2 ? 'tl' : 'tr') // the bill only comes away from its top corners
  }

  const choose = (m) => {
    if (m === mode || phase === 'tearing') return
    grip.current?.stop()
    fold.set(0)
    resetPull()
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
    }
  }

  const side = CORNERS.find((c) => c.id === from)?.side ?? 1
  const custom = { kind: exitKind, side }

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
              transition={{ duration: 0.9, delay: 0.04 + k * 0.03, ease: 'easeOut', times: [0, 0.15, 0.6, 1] }}
              aria-hidden="true"
            />
          ))}
        <AnimatePresence mode="wait" initial custom={custom} onExitComplete={resetPull}>
          <motion.div
            key={`${mode}-${n}`}
            className={`receipt${phase === 'tearing' ? ' receipt--torn' : ''}${phase === 'ready' ? ' receipt--ready' : ''}`}
            onClick={clickBill}
            style={{ '--fold': foldPx }}
            custom={custom}
            variants={reduce ? undefined : BILL}
            initial={reduce ? false : 'hidden'}
            animate={reduce ? { y: 0, rotate: 1.2 } : 'print'}
            exit={reduce ? { opacity: 0 } : 'exit'}
            onAnimationComplete={reduce ? undefined : onBillDone}
          >
            {/* the paper, in a wrapper that moves with the pull (it pivots, tears and flies); the corners below stay under the hand */}
            <motion.div ref={billEl} className="receipt__pull" style={{ x: pullX, y: pullY, rotate: pullRotate, clipPath: ripClip }}>
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
            </motion.div>

            {/* the two top corners you can take hold of: hover curls one, press and pull tears */}
            {CORNERS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`receipt__corner receipt__corner--${c.id}`}
                aria-label={`Tear off the bill from the ${c.label} corner`}
                tabIndex={c.id === 'tr' ? 0 : -1}
                disabled={phase !== 'ready'}
                onPointerEnter={() => grab(c.id)}
                onPointerLeave={release}
                onPointerDown={(e) => onCornerDown(e, c.id)}
                onPointerMove={onCornerMove}
                onPointerUp={(e) => onCornerUp(e, false)}
                onPointerCancel={(e) => onCornerUp(e, true)}
                onClick={(e) => {
                  e.stopPropagation()
                  if (e.detail === 0) quickTear(c.id) // Enter or Space on the focused corner (a pointer press is handled above)
                }}
              />
            ))}
          </motion.div>
        </AnimatePresence>
      </div>
      <p className={`billgen__hint${phase === 'ready' ? ' billgen__hint--on' : ''}`} aria-hidden="true"><span className="fine">Hover a top corner, then pull it down to tear. Or just click the bill.</span><span className="touch">Pull a top corner down to tear it. Or just tap the bill.</span></p>
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
            {profile.email} <span className="arrow" data-dir="ne" aria-hidden="true">↗</span>
          </motion.a>
          <motion.p className="about__links" {...enter(0.5)}>
            <a href={profile.resume} target="_blank" rel="noreferrer"><ArrowLabel>Resume (PDF) ↗</ArrowLabel></a>
            {profile.socials.map((s) => (
              <a key={s.label} href={s.url} target="_blank" rel="noreferrer"><ArrowLabel>{`${s.label} ↗`}</ArrowLabel></a>
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

      {/* the closing call to action (it used to be a slide of its own on the home page) */}
      <div className="wrap about__reach">
        <motion.section className="about__contact" aria-label="Contact" {...enter(0.8)}>
          <h2>Let’s work together.</h2>
          <p className="contact__lead">Email me about a role or a project.</p>
          <a className="btn btn--accent" href={`mailto:${profile.email}`}>Email me</a>
          {/* the address as plain text too, for visitors with no mail app: one click selects it all */}
          <p className="about__address">{profile.email}</p>
        </motion.section>
      </div>
    </section>
  )
}

// The /about page. Scrolling up past its top goes back to Work (and from there to Home), so a visitor who came here from the home page's
// "About me" link can scroll back the same way the home page's slides do.
export default function About() {
  const navigate = useNavigate()
  usePastTop({ onGo: () => navigate('/works') })
  return <AboutContent headingLevel={1} />
}
