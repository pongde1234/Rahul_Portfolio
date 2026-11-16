import { MousePointer2 } from 'lucide-react'

// The prototype's hint: a soft glowing ring and a small pointer next to the thing to click. It sits over the control without
// blocking it (the click goes straight through to the control). Nothing is drawn when `on` is false.
export default function Glow({ on, block = false, children }) {
  return (
    <span className={`glow${block ? ' glow--block' : ''}${on ? ' glow--on' : ''}`}>
      {children}
      {on && <MousePointer2 className="glow__cursor" size={22} aria-hidden="true" />}
    </span>
  )
}
