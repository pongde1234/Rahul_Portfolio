import { useLayoutEffect, useRef, useState } from 'react'
import useMedia from './useMedia.js'

// A live prototype shown on a grey card: a title and a line about it, an Open button (opens the prototype full size in a new
// tab), and the prototype itself, which is its own page (embed.html, see src/embed/main.jsx).
//   demo:    which prototype ('devices' | 'signin' | 'fds')
//   viewW/H: the size the prototype is laid out at. A wide one (the add-devices app) is scaled down to the width of the card, so
//            the FDS AppShell inside it keeps its full desktop layout. Without viewW it is drawn at its real size, viewH tall.
const BASE = `${import.meta.env.BASE_URL}embed.html`
const SRC = { devices: BASE, signin: `${BASE}?demo=signin`, fds: `${BASE}?demo=fds` }
// what a phone shows instead of a wide prototype (the sign-in prototype is narrow and stays live)
const STILL = { devices: 'images/devices/prototype-still.png', fds: 'images/fds/prototype-still.webp' }

export default function PrototypeFrame({ demo = 'devices', viewW, viewH = 640, heading, blurb, title, frameRef }) {
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
  const src = SRC[demo]
  const narrow = useMedia('(max-width: 640px)')
  const still = scaled && narrow && STILL[demo] // a wide prototype on a phone: a picture and an Open button
  return (
    <section className="protocard" aria-label={heading}>
      <div className="protocard__head">
        <div>
          <h3>{heading}</h3>
          <p>{blurb}</p>
        </div>
        <a className="protocard__open" href={src} target="_blank" rel="noreferrer">
          Open
        </a>
      </div>
      <div ref={root} className={`proto${still ? ' proto--still' : ''}`} style={still ? undefined : { height: scaled ? viewH * scale : viewH }}>
        {still ? (
          <a href={src} target="_blank" rel="noreferrer" aria-label={`Open the ${heading.toLowerCase()} full screen`}>
            <img src={`${import.meta.env.BASE_URL}${still}`} alt="" draggable="false" />
          </a>
        ) : (
          <iframe
            ref={frameRef}
            title={title}
            src={src}
            loading="lazy"
            style={scaled ? { width: viewW, height: viewH, transform: `scale(${scale})`, transformOrigin: '0 0' } : { width: '100%', height: '100%' }}
          />
        )}
      </div>
      {still && <p className="protocard__note">This prototype is built for a bigger screen. Tap Open to try it full screen.</p>}
    </section>
  )
}
