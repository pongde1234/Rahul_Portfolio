import { useState } from 'react'

// A real design screenshot with numbered dots. Click a dot (or Prev / Next) to read the design decision behind that spot.
//   spots: [{ x, y, title, body }]   x / y are percentages of the image (0-100)
export default function HotspotImage({ src, alt, spots }) {
  const [i, setI] = useState(0)
  const cur = spots[i]
  const go = (d) => setI((n) => (n + d + spots.length) % spots.length)

  return (
    <div className="hs">
      <div className="hs__img">
        <img src={src} alt={alt} />
        {spots.map((s, k) => (
          <button
            key={s.title}
            type="button"
            className={`hs__dot ${k === i ? 'on' : ''}`}
            style={{ left: `${s.x}%`, top: `${s.y}%` }}
            aria-label={`${k + 1}. ${s.title}`}
            aria-pressed={k === i}
            onClick={() => setI(k)}
          >
            {k + 1}
          </button>
        ))}
      </div>

      <div className="hs__panel" aria-live="polite">
        <span className="hs__num">{i + 1}</span>
        <div>
          <h4>{cur.title}</h4>
          <p>{cur.body}</p>
        </div>
        <div className="hs__nav">
          <button type="button" onClick={() => go(-1)} aria-label="Previous point">←</button>
          <span className="mono">{i + 1} / {spots.length}</span>
          <button type="button" onClick={() => go(1)} aria-label="Next point">→</button>
        </div>
      </div>
    </div>
  )
}
