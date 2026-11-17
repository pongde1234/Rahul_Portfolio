import { useEffect, useId, useRef, useState } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FLOWS } from './mockups/Mockups.jsx'
import HotspotImage from './HotspotImage.jsx'

const W = 880 // the flow screens are drawn on a fixed 880 x 540 canvas and scaled to the available width
const H = 540

// A clickable walkthrough of the new flow, drawn in code, plus the real design with clickable hotspots.
//   kind:  which flow ('mfa' | 'devices')
//   real:  path of the real design image (adds a "Real design" tab)
//   spots: [{ x, y, title, body }] hotspots drawn on the real design
export default function FlowDemo({ kind, real, spots, caption }) {
  const Flow = FLOWS[kind]
  const native = Boolean(Flow.native) // drawn at its real size, not as a scaled 880 x 540 canvas
  const bare = Boolean(Flow.bare) // draws its own screen: no box, background or border around it
  const [mode, setMode] = useState('flow')
  const tabId = useId()
  const reduce = useReducedMotion()
  const slide = reduce ? { duration: 0 } : { type: 'spring', stiffness: 520, damping: 40 }
  const [scale, setScale] = useState(0.8)
  const stage = useRef(null)

  useEffect(() => {
    const el = stage.current
    if (!el) return undefined
    const ro = new ResizeObserver(([e]) => setScale(e.contentRect.width / W))
    ro.observe(el)
    return () => ro.disconnect()
  }, [mode])

  const hint = mode === 'flow' ? 'Click through the flow to try it.' : spots?.length ? 'Click the numbered dots to see what each part does.' : 'Screenshot of the final design.'

  return (
    <figure className="ba">
      <div className="ba__tabs ba__tabs--slide" role="group" aria-label="View">
        <button type="button" className={mode === 'flow' ? 'on' : ''} aria-pressed={mode === 'flow'} onClick={() => setMode('flow')}>
          {mode === 'flow' && <motion.span layoutId={`${tabId}-tab`} className="ba__tabbg" transition={slide} />}
          <span className="ba__tablabel">Try the flow</span>
        </button>
        {real && (
          <button type="button" className={mode === 'real' ? 'on' : ''} aria-pressed={mode === 'real'} onClick={() => setMode('real')}>
            {mode === 'real' && <motion.span layoutId={`${tabId}-tab`} className="ba__tabbg" transition={slide} />}
            <span className="ba__tablabel">Real design</span>
          </button>
        )}
      </div>

      <p className="ba__help">{hint}</p>

      {mode === 'flow' && bare && <Flow />}

      {mode === 'flow' && native && !bare && (
        <div className="ba__stage ba__stage--native">
          <Flow />
        </div>
      )}

      {mode === 'flow' && !native && !bare && (
        <div className="ba__stage" ref={stage} style={{ height: H * scale }}>
          <div className="ba__layer">
            <div className="ba__canvas" style={{ transform: `scale(${scale})` }}>
              <Flow />
            </div>
          </div>
        </div>
      )}

      {mode === 'real' && real && (spots?.length ? (
        <HotspotImage src={real} alt="Screenshot of the final design" spots={spots} />
      ) : (
        <div className="ba__stage" style={{ height: H * scale }}>
          <img className="ba__real" src={real} alt="Screenshot of the final design" />
        </div>
      ))}

      {mode === 'flow' && (
        <figcaption>{caption ?? 'A simplified, coded recreation of the flow. It is a demo, so nothing is really uploaded or verified.'}</figcaption>
      )}
    </figure>
  )
}
