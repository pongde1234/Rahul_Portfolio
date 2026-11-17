import { useCallback, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import WorkPane from '../components/WorkPane.jsx'
import useMedia from '../components/useMedia.js'
import usePastTop from '../components/usePastTop.js'
import { usePageTransition } from '../components/PageTransition.jsx'

// /works: same two-pane layout as the home work slide. On desktop the page itself is locked
// (left side fixed, only the right side scrolls).
//
// Scrolling on past the end of the list goes to the About page. It takes a fresh gesture: the scroll that
// brings the list to its end (and the trackpad inertia after it) never carries straight on, so nobody lands on
// About by accident. Works with the wheel, a swipe up and the keyboard.
//
// Scrolling up past the top of the list goes Home (the same rule, in components/usePastTop.js; the About page goes back to here).
export default function Works() {
  const locked = useMedia('(min-width: 900px)')
  const navigate = useNavigate()
  const { active: curtain } = usePageTransition() // a case study is opening: leave the scroll alone
  const curtainRef = useRef(false)
  curtainRef.current = curtain

  const listColumn = useCallback(() => (locked ? document.querySelector('.wk__main') : null), [locked])
  usePastTop({ getScroller: listColumn, onGo: () => navigate('/'), enabled: !curtain })

  useEffect(() => {
    document.documentElement.classList.toggle('is-paged', locked)
    document.body.classList.toggle('is-paged', locked)
    return () => {
      document.documentElement.classList.remove('is-paged')
      document.body.classList.remove('is-paged')
    }
  }, [locked])

  useEffect(() => {
    // what scrolls: the right-hand column on desktop, the whole page on a phone or tablet
    const column = () => (locked ? document.querySelector('.wk__main') : null)
    const pos = () => column()?.scrollTop ?? window.scrollY
    const atEnd = () => {
      const col = column()
      if (col) return col.scrollTop + col.clientHeight >= col.scrollHeight - 2
      return window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2
    }
    const go = () => {
      if (!curtainRef.current) navigate('/about')
    }

    let lastEvent = 0
    let acc = 0
    let needQuiet = true // true until the list has been scrolled and a new gesture has begun at its end
    let lastPos = pos() // where the list was when we last looked

    // Where the list sits is kept up to date from its own scroll events (they do not bubble, so listen in the capture phase).
    const onScroll = () => {
      lastPos = pos()
    }

    // The browser may already have scrolled the list when this runs, so "at the end" alone is not enough: if the list
    // moved during this very event, the gesture belonged to the list.
    const onWheel = (e) => {
      const now = performance.now()
      const gap = now - lastEvent
      lastEvent = now
      const p = pos()
      const moved = Math.abs(p - lastPos) > 0.5
      lastPos = p
      if (e.deltaY <= 0) {
        acc = 0
        return
      }
      if (moved || !atEnd()) {
        needQuiet = true // this scroll belongs to the list
        acc = 0
        return
      }
      if (needQuiet) {
        if (gap < 250) return // inertia, or a wheel still turning: wait for a real pause
        needQuiet = false
      }
      if (gap > 120) acc = 0
      acc += e.deltaY
      if (acc >= 40) {
        acc = 0
        go()
      }
    }

    let touchY = null
    let touchAtEnd = false
    const onTouchStart = (e) => {
      touchY = e.touches[0].clientY
      touchAtEnd = atEnd() // the swipe has to start at the end, not carry on from the list
    }
    const onTouchEnd = (e) => {
      if (touchY == null) return
      const dy = touchY - e.changedTouches[0].clientY
      touchY = null
      if (touchAtEnd && dy > 70 && atEnd()) go()
    }

    const onKey = (e) => {
      if (e.repeat || /^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) return
      const down = ['ArrowDown', 'PageDown', 'End'].includes(e.key) || (e.key === ' ' && !/^(BUTTON|A)$/.test(e.target.tagName))
      if (down && atEnd()) {
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
  }, [locked, navigate])

  return (
    <section className="wk">
      <WorkPane forward />
    </section>
  )
}
