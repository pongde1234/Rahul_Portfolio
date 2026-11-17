import { useEffect, useRef } from 'react'

// Scrolling UP past the top of a page goes to the page before it (About -> Work -> Home).
//
// The mirror of the "scroll on past the end" rule in pages/Works.jsx, with the same care:
//  - it takes a fresh gesture. The scroll that brings the page back to its top, and the trackpad inertia after it, never carry
//    straight on, so nobody is thrown a page too far by one flick;
//  - the same goes for arriving: a flick that brought you here is still "turning" when the page opens, so the first
//    quarter-second after arriving is ignored (otherwise one flick would run About -> Work -> Home);
//  - works with the wheel, a swipe down and the keyboard.
//
// getScroller: returns the element that scrolls (e.g. the Work list column), or null when the whole page scrolls.
// onGo: called once when the gesture is a real "go back". enabled: turn the whole thing off (e.g. while a page transition runs).
const WHOLE_PAGE = () => null // one stable function, so the effect below is not set up again on every render

export default function usePastTop({ getScroller = WHOLE_PAGE, onGo, enabled = true }) {
  const goRef = useRef(onGo)
  goRef.current = onGo
  const enabledRef = useRef(enabled)
  enabledRef.current = enabled

  useEffect(() => {
    const pos = () => getScroller()?.scrollTop ?? window.scrollY
    const atTop = () => pos() <= 2
    const go = () => {
      if (enabledRef.current) goRef.current?.()
    }

    let lastEvent = performance.now() // arriving counts as "the wheel was just moving"
    let acc = 0
    let needQuiet = true
    let lastPos = pos()

    const onScroll = () => {
      lastPos = pos()
    }

    const onWheel = (e) => {
      const now = performance.now()
      const gap = now - lastEvent
      lastEvent = now
      const p = pos()
      const moved = Math.abs(p - lastPos) > 0.5
      lastPos = p
      if (e.deltaY >= 0) {
        acc = 0
        return
      }
      if (moved || !atTop()) {
        needQuiet = true // this scroll belongs to the page
        acc = 0
        return
      }
      if (needQuiet) {
        if (gap < 250) return // inertia, or a wheel still turning: wait for a real pause
        needQuiet = false
      }
      if (gap > 120) acc = 0
      acc += -e.deltaY
      if (acc >= 40) {
        acc = 0
        go()
      }
    }

    let touchY = null
    let touchAtTop = false
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY
      touchAtTop = atTop() // the swipe has to start at the top, not carry on from scrolling the page
    }
    const onTouchEnd = (e) => {
      if (touchY == null) return
      const dy = e.changedTouches[0].clientY - touchY // finger moved down = scrolling up
      touchY = null
      if (touchAtTop && dy > 70 && atTop()) go()
    }

    const onKey = (e) => {
      if (e.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      if (['ArrowUp', 'PageUp', 'Home'].includes(e.key) && atTop()) {
        e.preventDefault()
        go()
      }
    }

    window.addEventListener('scroll', onScroll, { passive: true, capture: true })
    window.addEventListener('wheel', onWheel, { passive: true, capture: true })
    window.addEventListener('touchstart', onTouchStart, { passive: true })
    window.addEventListener('touchend', onTouchEnd, { passive: true })
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('scroll', onScroll, { capture: true })
      window.removeEventListener('wheel', onWheel, { capture: true })
      window.removeEventListener('touchstart', onTouchStart)
      window.removeEventListener('touchend', onTouchEnd)
      window.removeEventListener('keydown', onKey)
    }
  }, [getScroller])
}
