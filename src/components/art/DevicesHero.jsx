// Hero banner for "Onboarding at Scale": the bulk-upload flow told as three cascading cards
// (1 Upload, 2 Review, 3 Done), in the same quiet flat style as the Security banner.
// The only numbers are the real ones from the case study: 250 devices in 8 min (100 devices used to take 20).
// 1600 x 900 artboard; content sits in the middle so it survives the Works-row and header crops.
// Everything inside each card is centred on the card's vertical axis (x = CW / 2).

// Colours are FDS values (an SVG attribute cannot read a CSS variable): brand-500 #1364f1, neutral text #050505 / #292f32 / #616d75, border #dee1e3,
// surface #eef0f1, positive #15803d, negative #dc2626, sapphire-50 / 100 for the ground. Nothing is heavier than medium (500).
const NAVY = '#1364f1'
const INK = '#050505'
const BODY = '#292f32'
const MUTED = '#616d75'
const FIELD = '#eef0f1'
const EDGE = '#dee1e3'
const GREEN = '#15803d'
const RED = '#dc2626'
const FONT = "'DM Sans Variable', 'DM Sans', system-ui, sans-serif"
const HEAD = FONT // the step titles and the big "8 min"
const MONO = "'DM Mono', ui-monospace, monospace"

const CW = 560
const CH = 520
const CX = CW / 2

function Card({ x, y, step, title, children }) {
  return (
    <g transform={`translate(${x} ${y})`}>
      <rect width={CW} height={CH} rx="6" fill="#fff" stroke={EDGE} filter="url(#dv-shadow)" />
      <circle cx={CX} cy="46" r="21" fill={NAVY} />
      <text x={CX} y="54" fontFamily={FONT} fontSize="22" fontWeight="500" fill="#fff" textAnchor="middle">{step}</text>
      <text x={CX} y="88" fontFamily={MONO} fontSize="14" fill={MUTED} letterSpacing="1.8" textAnchor="middle">STEP {step} OF 3</text>
      <text x={CX} y="124" fontFamily={HEAD} fontSize="31" fontWeight="500" fill={INK} letterSpacing="-0.6" textAnchor="middle">{title}</text>
      {children}
    </g>
  )
}

const ROWS = [
  ['FKEM_K11', 'ok', 'Ready'],
  ['FKEM_K15', 'err', 'Device ID not found'],
  ['FKEM_K17', 'ok', 'Ready'],
  ['FKEM_K20', 'err', 'Device name is missing'],
]

export default function DevicesHero() {
  return (
    <svg className="art" viewBox="0 0 1600 900" preserveAspectRatio="xMidYMid slice" role="img" aria-label="Bulk device upload in three steps: upload a spreadsheet, fix errors in the preview, then confirm. Uploading 250 devices now takes 8 minutes. 100 devices used to take 20.">
      <defs>
        <linearGradient id="dv-ground" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#e7f7fd" />
          <stop offset="1" stopColor="#ccebfa" />
        </linearGradient>
        <filter id="dv-shadow" x="-12%" y="-12%" width="124%" height="134%">
          <feDropShadow dx="0" dy="1" stdDeviation="1.2" floodColor="#050505" floodOpacity="0.08" result="a" />
          <feDropShadow in="SourceGraphic" dx="0" dy="24" stdDeviation="22" floodColor="#050505" floodOpacity="0.15" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="a" />
          </feMerge>
        </filter>
      </defs>

      {/* ground + thin curved lines */}
      <rect width="1600" height="900" fill="url(#dv-ground)" />
      <g fill="none" stroke="#005b85" strokeWidth="2.4" strokeLinecap="round">
        <path d="M-20 270 C 110 50, 380 -10, 620 -50" />
        <path d="M-20 780 C 230 650, 470 720, 690 920" />
        <path d="M1170 -50 C 1430 90, 1590 320, 1640 540" />
        <path d="M1260 960 C 1360 870, 1490 835, 1640 840" />
      </g>

      {/* 1 - upload */}
      <Card x={130} y={71} step="1" title="Upload a spreadsheet">
        <text fontFamily={FONT} fontSize="20" fill={BODY} textAnchor="middle">
          <tspan x={CX} y="170">Drop in your device list from</tspan>
          <tspan x={CX} y="197">Excel or Google Sheets.</tspan>
        </text>
        <rect x="120" y="220" width="320" height="214" rx="6" fill={FIELD} stroke="#c8cdd0" strokeWidth="2" strokeDasharray="7 7" />
        <rect x="254" y="238" width="52" height="52" rx="6" fill="#f0fdf4" />
        <text x={CX} y="271" fontFamily={FONT} fontSize="17" fontWeight="500" fill={GREEN} textAnchor="middle">XLSX</text>
        <text x={CX} y="322" fontFamily={FONT} fontSize="19" fontWeight="500" fill={INK} textAnchor="middle">Bulk Upload Template.xlsx</text>
        <text x={CX} y="348" fontFamily={FONT} fontSize="17" fill={MUTED} textAnchor="middle">250 devices found</text>
        <rect x="148" y="364" width="264" height="10" rx="5" fill="#dee1e3" />
        <rect x="148" y="364" width="264" height="10" rx="5" fill={GREEN} />
        <text x={CX} y="406" fontFamily={FONT} fontSize="16" fontWeight="500" fill={GREEN} textAnchor="middle">✓ Read in one go</text>
        <text x={CX} y="478" fontFamily={FONT} fontSize="17" fill={MUTED} textAnchor="middle">No more adding devices one by one.</text>
      </Card>

      {/* 2 - review */}
      <Card x={520} y={190} step="2" title="Fix errors first">
        <text fontFamily={FONT} fontSize="20" fill={BODY} textAnchor="middle">
          <tspan x={CX} y="170">Every row shows its status, so</tspan>
          <tspan x={CX} y="197">errors are fixed before upload.</tspan>
        </text>
        <rect x="115" y="220" width="330" height="36" rx="6" fill={FIELD} />
        <text x="131" y="244" fontFamily={FONT} fontSize="14.5" fontWeight="500" fill={MUTED}>Device ID</text>
        <text x="265" y="244" fontFamily={FONT} fontSize="14.5" fontWeight="500" fill={MUTED}>Status</text>
        {ROWS.map(([id, st, msg], i) => (
          <g key={id} transform={`translate(115 ${262 + i * 44})`}>
            <rect width="330" height="40" rx="6" fill={st === 'err' ? '#fef2f2' : '#fff'} stroke={st === 'err' ? '#fecaca' : EDGE} />
            <text x="16" y="26" fontFamily={MONO} fontSize="15" fontWeight="500" fill={INK}>{id}</text>
            <text x="150" y="26" fontFamily={FONT} fontSize="15.5" fontWeight="500" fill={st === 'err' ? RED : GREEN}>{st === 'err' ? '⚠ ' : '✓ '}{msg}</text>
          </g>
        ))}
        <g transform="translate(145 452)">
          <rect width="96" height="32" rx="6" fill="#f0fdf4" />
          <circle cx="18" cy="16" r="5" fill={GREEN} />
          <text x="31" y="21.5" fontFamily={FONT} fontSize="15" fontWeight="500" fill={GREEN}>Ready</text>
          <rect x="108" width="162" height="32" rx="6" fill="#fee2e2" />
          <circle cx="126" cy="16" r="5" fill={RED} />
          <text x="139" y="21.5" fontFamily={FONT} fontSize="15" fontWeight="500" fill={RED}>Needs attention</text>
        </g>
      </Card>

      {/* 3 - done */}
      <Card x={910} y={309} step="3" title="Confirm and done">
        <g transform="translate(209 144)">
          <rect width="142" height="42" rx="6" fill="#f0fdf4" />
          <circle cx="24" cy="21" r="11" fill={GREEN} />
          <path d="M19 21l4 4 7-8" fill="none" stroke="#fff" strokeWidth="2.8" strokeLinecap="round" strokeLinejoin="round" />
          <text x="44" y="27" fontFamily={FONT} fontSize="17" fontWeight="500" fill={GREEN}>Uploaded</text>
        </g>
        <text x={CX} y="272" fontFamily={HEAD} fontSize="84" fontWeight="500" fill={INK} letterSpacing="-3" textAnchor="middle">8 min</text>
        <text fontFamily={FONT} fontSize="20" fill={BODY} textAnchor="middle">
          <tspan x={CX} y="312">for 250 devices,</tspan>
          <tspan x={CX} y="339">where 100 used to take 20.</tspan>
        </text>

        <text x="36" y="390" fontFamily={FONT} fontSize="16" fontWeight="500" fill={MUTED}>Before · 100 devices</text>
        <text x="524" y="390" fontFamily={FONT} fontSize="16" fontWeight="500" fill={MUTED} textAnchor="end">20 min</text>
        <rect x="36" y="400" width="488" height="14" rx="6" fill="#dee1e3" />
        <text x="36" y="446" fontFamily={FONT} fontSize="16" fontWeight="500" fill={INK}>After · 250 devices</text>
        <text x="524" y="446" fontFamily={FONT} fontSize="16" fontWeight="500" fill={INK} textAnchor="end">8 min</text>
        <rect x="36" y="456" width="488" height="14" rx="6" fill="#eef0f1" />
        <rect x="36" y="456" width="195" height="14" rx="6" fill={NAVY} />
      </Card>

      {/* credit */}
      <text x="130" y="846" fontFamily={MONO} fontSize="14" fill={MUTED} letterSpacing="2.2" opacity="0.9">IO SENSE · FACLON LABS</text>
    </svg>
  )
}
