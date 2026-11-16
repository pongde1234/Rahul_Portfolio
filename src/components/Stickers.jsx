// Original soft doodle stickers: rounded shapes, pastel fills, ink outline.
// Parts have class names (st-*) so CSS can animate them (waving arms, spinning rays, flickering flame...).
const base = {
  viewBox: '0 0 80 80',
  fill: 'none',
  stroke: '#1d2433',
  strokeWidth: 2.4,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
}

const C = { coral: '#ff9a85', sky: '#a9d3f7', butter: '#fbe08a', mint: '#bfe8d4', blush: '#ffb8a8', white: '#fff', ink: '#1d2433' }

const rays = Array.from({ length: 8 }, (_, i) => i * 45)

const art = {
  cactus: (
    <g>
      <g className="st-armL">
        <rect x="11" y="22" width="11" height="24" rx="5.5" fill={C.mint} />
        <rect x="14" y="38" width="20" height="11" rx="5.5" fill={C.mint} />
      </g>
      <g className="st-armR">
        <rect x="58" y="16" width="11" height="26" rx="5.5" fill={C.mint} />
        <rect x="46" y="34" width="20" height="11" rx="5.5" fill={C.mint} />
      </g>
      <rect x="26" y="10" width="28" height="50" rx="14" fill={C.mint} />
      <path d="M24 58h32l-3 12a5 5 0 0 1-5 4H32a5 5 0 0 1-5-4z" fill={C.coral} />
      <g className="st-blink">
        <path d="M35 36h.1M45 36h.1" />
      </g>
      <path d="M37 42q3 3 6 0" />
      <g className="st-flower">
        <circle cx="40" cy="10" r="4" fill={C.butter} />
      </g>
    </g>
  ),
  sun: (
    <g>
      <g className="st-rays">
        {rays.map((a) => (
          <path key={a} d="M40 8v8" transform={`rotate(${a} 40 40)`} />
        ))}
      </g>
      <g className="st-sunface">
        <circle cx="40" cy="40" r="18" fill={C.butter} />
        <path d="M33 36h.1M47 36h.1M34 44q6 6 12 0" />
      </g>
    </g>
  ),
  rocket: (
    <g className="st-rocket">
      <path d="M31 44l-12 14 14-2zM49 44l12 14-14-2z" fill={C.coral} />
      <path d="M40 8c13 9 15 26 10 42H30C25 34 27 17 40 8z" fill={C.white} />
      <circle cx="40" cy="30" r="6" fill={C.sky} />
      <g className="st-flame">
        <path d="M34 54q6 18 12 0z" fill={C.butter} />
      </g>
    </g>
  ),
  headphones: (
    <g>
      <path d="M15 46V40a25 25 0 0 1 50 0v6" />
      <rect className="st-cup st-cupL" x="9" y="42" width="15" height="26" rx="7.5" fill={C.sky} />
      <rect className="st-cup st-cupR" x="56" y="42" width="15" height="26" rx="7.5" fill={C.sky} />
      <path d="M30 70q10 6 20 0" strokeWidth="1.8" />
      <g className="st-note st-note1">
        <circle cx="66" cy="20" r="2.6" fill={C.ink} />
        <path d="M68.6 20V10l5 1.6" />
      </g>
      <g className="st-note st-note2">
        <circle cx="10" cy="30" r="2.2" fill={C.ink} />
        <path d="M12.2 30V21l4 1.3" />
      </g>
    </g>
  ),
  camera: (
    <g>
      <rect x="27" y="14" width="26" height="14" rx="6" fill={C.white} />
      <rect x="8" y="22" width="64" height="44" rx="12" fill={C.blush} />
      <circle cx="40" cy="44" r="14" fill={C.white} />
      <g className="st-lens">
        <circle cx="40" cy="44" r="7" fill={C.sky} />
      </g>
      <g className="st-flashrays">
        <path d="M61 25v-4M67 28l3-3M55 28l-3-3" strokeWidth="1.8" />
      </g>
      <g className="st-flash">
        <circle cx="61" cy="32" r="3" fill={C.butter} />
      </g>
    </g>
  ),
  star: (
    <g>
      <path d="M40 10l8 18 20 2-15 13 5 20-18-10-18 10 5-20L12 30l20-2z" fill={C.butter} />
    </g>
  ),
}

export default function Sticker({ name }) {
  return (
    <div className={`sticker sticker--${name}`} aria-hidden="true">
      <svg {...base} width="100%" height="100%">
        {art[name] ?? art.star}
      </svg>
    </div>
  )
}
