import { useLayoutEffect, useRef, useState } from 'react'
import useMedia from './useMedia.js'

// A prototype page (embed.html, see src/embed/main.jsx) shown in a frame inside a case study's "Try the flow" demo. It is a copy
// that is not tied to the timeline above the case study's live prototype (`solo`).
//   demo:    which prototype ('devices' | 'signin' | 'fds')
//   viewW/H: the size the prototype is laid out at. A wide one is scaled down to the width of the column; a narrow one is drawn at
//            its real size, at the height given.
const BASE = `${import.meta.env.BASE_URL}embed.html`
const SRC = { devices: `${BASE}?solo=1`, signin: `${BASE}?demo=signin&solo=1`, fds: `${BASE}?demo=fds&solo=1` }
// what a phone shows instead of a wide demo (the sign-in demo is narrow and stays live)
const STILL = { devices: 'images/devices/prototype-still.png', fds: 'images/fds/prototype-still.webp' }
const OPEN = { devices: BASE, fds: `${BASE}?demo=fds` }

export default function EmbedFrame({ demo, viewW, viewH, title }) {
  const root = useRef(null)
  const [w, setW] = useState(viewW ?? 600)

  useLayoutEffect(() => {
    const el = root.current
    const fit = () => setW(el.clientWidth)
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const scaled = Boolean(viewW)
  const scale = scaled ? w / viewW : 1
  const narrow = useMedia('(max-width: 640px)')
  const still = scaled && narrow && STILL[demo]
  if (still) {
    return (
      <div ref={root} className="embedframe embedframe--still">
        <a href={OPEN[demo]} target="_blank" rel="noreferrer" aria-label="Open the demo full screen">
          <img src={`${import.meta.env.BASE_URL}${still}`} alt="" draggable="false" />
        </a>
        <p className="protocard__note">This demo is built for a bigger screen. Tap the picture to try it full screen.</p>
      </div>
    )
  }
  return (
    <div ref={root} className="embedframe" style={{ height: scaled ? viewH * scale : viewH }}>
      <iframe
        title={title}
        src={SRC[demo]}
        loading="lazy"
        style={scaled ? { width: viewW, height: viewH, transform: `scale(${scale})`, transformOrigin: '0 0' } : { width: '100%', height: '100%' }}
      />
    </div>
  )
}
