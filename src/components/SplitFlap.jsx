import { useEffect, useRef, useState } from 'react'

const COLS = 15
const ROWS = 2
const POOL = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

// "LINE ONE|LINE TWO" -> 30 chars (2 rows x 15 cols)
const layout = (phrase) =>
  phrase
    .split('|')
    .slice(0, ROWS)
    .map((s) => s.toUpperCase().padEnd(COLS, ' ').slice(0, COLS))
    .join('')
    .padEnd(COLS * ROWS, ' ')
    .split('')

export default function SplitFlap({ phrases }) {
  const [cells, setCells] = useState(() => layout(phrases[0]).map(() => ' '))
  const cur = useRef(layout(phrases[0]).map(() => ' '))

  useEffect(() => {
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const timers = []
    let idx = 0

    const set = (i, ch) => {
      cur.current[i] = ch
      setCells((c) => {
        const n = [...c]
        n[i] = ch
        return n
      })
    }

    const run = () => {
      const target = layout(phrases[idx % phrases.length])
      target.forEach((ch, i) => {
        if (reduce) return set(i, ch)
        if (cur.current[i] === ch) return
        const delay = i * 32
        const flips = 3 + (i % 4)
        for (let f = 0; f < flips; f++) {
          timers.push(setTimeout(() => set(i, POOL[Math.floor(Math.random() * POOL.length)]), delay + f * 55))
        }
        timers.push(setTimeout(() => set(i, ch), delay + flips * 55))
      })
      idx++
      timers.push(setTimeout(run, 4500))
    }
    run()
    return () => timers.forEach(clearTimeout)
  }, [phrases])

  return (
    <div className="flap" role="img" aria-label={phrases.map((p) => p.replace('|', ' ')).join(', ')}>
      {cells.map((ch, i) => (
        <span key={i} className="flap__cell" aria-hidden="true">
          <span key={ch + i} className="flap__ch">{ch}</span>
        </span>
      ))}
    </div>
  )
}
