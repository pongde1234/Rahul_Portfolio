// A link label whose arrow (↗ ↘ → at the end, ← at the start) is its own piece, so it can nudge when the link is hovered
// (the .arrow styles in styles.css). Pass the label as one string: <ArrowLabel>Resume (PDF) ↗</ArrowLabel>
const DIR = { '↗': 'ne', '↘': 'se', '→': 'e', '←': 'w' }

export default function ArrowLabel({ children }) {
  const t = String(children)
  const end = t.match(/^([\s\S]*?)\s*([↗↘→])$/)
  if (end) {
    return (
      <>
        {end[1]}{' '}
        <span className="arrow" data-dir={DIR[end[2]]} aria-hidden="true">{end[2]}</span>
      </>
    )
  }
  const start = t.match(/^(←)\s*([\s\S]*)$/)
  if (start) {
    return (
      <>
        <span className="arrow" data-dir="w" aria-hidden="true">{start[1]}</span> {start[2]}
      </>
    )
  }
  return <>{t}</>
}
