import { Suspense } from 'react'
import DevicesHero from './art/DevicesHero.jsx'
import MfaBanner from './art/MfaBanner.jsx'
// the design system thumbnail is a picture of its banner (art/DesignSystemBanner.jsx), so these pages do not carry the design system's stylesheet
import DesignSystemStill from './art/DesignSystemStill.jsx'

// coded hero artwork a project can choose with `art: 'mfa'` (see data/content.js)
// 'mfa' is three cascading step cards (scan, enter code, protected). The older alternates were removed in the clean-up.
const ART = { devices: DevicesHero, 'design-system': DesignSystemStill, mfa: MfaBanner }

// Project cover: real image if provided, otherwise a drawn UI mock placeholder.
function Mock({ type }) {
  if (type === 'phone')
    return (
      <div className="mock mock--phone">
        <div className="m-phone">
          <i className="m-pill" />
          <b className="m-card m-card--big" />
          <b className="m-card" />
          <b className="m-card" />
        </div>
      </div>
    )
  if (type === 'chat')
    return (
      <div className="mock mock--win">
        <div className="m-bar"><i /><i /><i /></div>
        <div className="m-chat">
          <b className="m-bubble" />
          <b className="m-bubble m-bubble--me" />
          <b className="m-bubble m-bubble--ai" />
        </div>
      </div>
    )
  if (type === 'system')
    return (
      <div className="mock mock--win">
        <div className="m-bar"><i /><i /><i /></div>
        <div className="m-tiles">
          {Array.from({ length: 6 }).map((_, i) => <b key={i} className={`m-tile m-tile--${i % 3}`} />)}
        </div>
      </div>
    )
  return (
    <div className="mock mock--win">
      <div className="m-bar"><i /><i /><i /></div>
      <div className="m-dash">
        <div className="m-stats"><b /><b /><b /></div>
        <div className="m-bars">
          {[40, 65, 50, 85, 60, 95, 75].map((h, i) => <i key={i} style={{ height: `${h}%` }} />)}
        </div>
      </div>
    </div>
  )
}

// `interactive`: the case-study header passes it, so a banner that can be clicked through (the devices flow) is live there
// and a still, inert frame everywhere else (work list, home). The other banners ignore it.
export default function Cover({ p, interactive = false }) {
  const Art = p.art && ART[p.art]
  if (Art) {
    return (
      <Suspense fallback={<div className="art" style={{ background: p.art === 'devices' ? 'linear-gradient(135deg, var(--global-sapphire-50), var(--global-sapphire-100))' : 'linear-gradient(135deg, var(--global-orchid-50), var(--global-orchid-100))' }} />}>
        <Art interactive={interactive} />
      </Suspense>
    )
  }
  if (p.cover) return <img src={p.cover} alt={p.title} loading="lazy" decoding="async" />
  return <Mock type={p.mock} />
}
