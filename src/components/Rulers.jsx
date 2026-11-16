import { useEffect, useRef, useState } from 'react'
import useMedia from './useMedia.js'

// Figma-style rulers along the top and left edges.
// A marker follows the pointer; hovering an element highlights its extent on both rulers.
export default function Rulers() {
  const on = useMedia('(hover: hover) and (pointer: fine) and (min-width: 900px)')
  const [size, setSize] = useState({ w: window.innerWidth, h: window.innerHeight })
  const markX = useRef(null)
  const markY = useRef(null)
  const rangeX = useRef(null)
  const rangeY = useRef(null)

  useEffect(() => {
    if (!on) return undefined
    const onResize = () => setSize({ w: window.innerWidth, h: window.innerHeight })
    const onMove = (e) => {
      if (markX.current) markX.current.style.transform = `translateX(${e.clientX}px)`
      if (markY.current) markY.current.style.transform = `translateY(${e.clientY}px)`
      const el = e.target instanceof Element ? e.target.closest('.item, .wcard, .cta, .polaroid') : null
      if (el && rangeX.current && rangeY.current) {
        const r = el.getBoundingClientRect()
        rangeX.current.style.cssText = `display:block;left:${r.left}px;width:${r.width}px`
        rangeY.current.style.cssText = `display:block;top:${r.top}px;height:${r.height}px`
      } else {
        if (rangeX.current) rangeX.current.style.display = 'none'
        if (rangeY.current) rangeY.current.style.display = 'none'
      }
    }
    window.addEventListener('resize', onResize)
    window.addEventListener('pointermove', onMove, { passive: true })
    return () => {
      window.removeEventListener('resize', onResize)
      window.removeEventListener('pointermove', onMove)
    }
  }, [on])

  if (!on) return null

  const xs = Array.from({ length: Math.ceil(size.w / 100) }, (_, i) => i * 100)
  const ys = Array.from({ length: Math.ceil(size.h / 100) }, (_, i) => i * 100)

  return (
    <div className="rulers" aria-hidden="true">
      <div className="ruler ruler--top">
        <i ref={rangeX} className="ruler__range" />
        {xs.map((n) => (
          <span key={n} style={{ left: n + 4 }}>{n}</span>
        ))}
        <i ref={markX} className="ruler__mark" />
      </div>
      <div className="ruler ruler--left">
        <i ref={rangeY} className="ruler__range" />
        {ys.map((n) => (
          <span key={n} style={{ top: n + 4 }}>{n}</span>
        ))}
        <i ref={markY} className="ruler__mark" />
      </div>
      <div className="ruler__corner" />
    </div>
  )
}
