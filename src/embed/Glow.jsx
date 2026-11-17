import { MousePointer2 } from 'lucide-react'

// The prototype's hint: a soft glowing ring and a small pointer next to the thing to click. It sits over the control without
// blocking it (the click goes straight through to the control). Nothing is drawn when `on` is false.
// `pointer={false}` leaves out the little pointer (only the dot is shown).
export default function Glow({ on, block = false, pointer = true, children }) {
  return (
    <span className={`glow${block ? ' glow--block' : ''}${on ? ' glow--on' : ''}`}>
      {children}
      {on && pointer && <MousePointer2 className="glow__cursor" size={22} aria-hidden="true" />}
    </span>
  )
}
