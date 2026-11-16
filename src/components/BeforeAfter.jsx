import { useEffect, useRef, useState } from 'react'
import { MOCKS } from './mockups/Mockups.jsx'

const W = 880 // the mock-ups are drawn on a fixed 880 x 540 canvas and scaled to the available width
const H = 540

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v))

// Before / after comparison of two coded UIs.
//   kind:    which pair of mock-ups ('devices' | 'mfa')
//   real:    optional path of the real design image (adds a "Real design" tab)
//   changes: [{ from, to }] shown under the stage as numbered before -> after cards
export default function BeforeAfter({ kind, real, caption, changes = [] }) {
  const { Before, After } = MOCKS[kind]
  const [mode, setMode] = useState('compare')
  const [pos, setPos] = useState(50) // % of the width where the "after" layer begins
  const [dragging, setDragging] = useState(false)
  const [scale, setScale] = useState(0.8)
  const stage = useRef(null)

  useEffect(() => {
    const el = stage.current
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const move = (clientX) => {
    const r = stage.current.getBoundingClientRect()
    setPos(clamp(((clientX - r.left) / r.width) * 100, 3, 97))
  }
  const onDown = (e) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    setDragging(true)
    setMode('compare')
  }
  const onKey = (e) => {
    if (e.key === 'ArrowLeft') setPos((p) => clamp(p - 4, 3, 97))
    if (e.key === 'ArrowRight') setPos((p) => clamp(p + 4, 3, 97))
  }

  const afterClip = mode === 'before' ? 'inset(0 0 0 100%)' : mode === 'after' ? 'inset(0 0 0 0)' : `inset(0 0 0 ${pos}%)`
  const tabs = [
    ['before', 'Before'],
    ['compare', 'Compare'],
    ['after', 'After'],
    ...(real ? [['real', 'Final design']] : []),
  ]

  return (
    <figure className="ba">
      <div className="ba__tabs" role="group" aria-label="View">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" className={mode === id ? 'on' : ''} aria-pressed={mode === id} onClick={() => setMode(id)}>
            {label}
          </button>
        ))}
        <span className="ba__hint mono">{mode === 'compare' ? 'Drag the handle to compare' : mode === 'real' ? 'Screenshot of the final design' : ''}</span>
      </div>

      <div className="ba__stage" ref={stage} style={{ height: H * scale }}>
        {mode !== 'real' && (
          <>
            <div className="ba__layer" aria-hidden={mode === 'after'} inert={mode === 'after' ? '' : undefined}>
              <div className="ba__canvas" style={{ transform: `scale(${scale})` }}>
                <Before />
              </div>
            </div>
            <div className={`ba__layer ba__layer--after ${dragging ? 'is-dragging' : ''}`} style={{ clipPath: afterClip }} aria-hidden={mode === 'before'} inert={mode === 'before' ? '' : undefined}>
              <div className="ba__canvas" style={{ transform: `scale(${scale})` }}>
                <After />
              </div>
            </div>

            <span className="ba__tag ba__tag--before" style={{ opacity: mode === 'after' ? 0 : 1 }}>Before</span>
            <span className="ba__tag ba__tag--after" style={{ opacity: mode === 'before' ? 0 : 1 }}>After</span>

            {mode === 'compare' && (
              <div
                className="ba__handle"
                style={{ left: `${pos}%` }}
                role="slider"
                tabIndex={0}
                aria-label="Move the divider between before and after"
                aria-valuemin={3}
                aria-valuemax={97}
                aria-valuenow={Math.round(pos)}
                onPointerDown={onDown}
                onPointerMove={(e) => dragging && move(e.clientX)}
                onPointerUp={() => setDragging(false)}
                onPointerCancel={() => setDragging(false)}
                onKeyDown={onKey}
              >
                <i aria-hidden="true">⇆</i>
              </div>
            )}
          </>
        )}

        {mode === 'real' && real && <img className="ba__real" src={real} alt="Screenshot of the final design" />}
      </div>

      <figcaption>
        {caption ??
          'The “before” illustrates the problems found in research. The “after” is a simplified recreation of the final design. Both are coded for this page.'}
      </figcaption>

      {changes.length > 0 && (
        <ol className="ba__changes">
          {changes.map((c, i) => (
            <li key={c.to}>
              <span className="mono">{String(i + 1).padStart(2, '0')}</span>
              <s>{c.from}</s>
              <b>{c.to}</b>
            </li>
          ))}
        </ol>
      )}
    </figure>
  )
}
