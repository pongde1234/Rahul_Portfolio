import { useLayoutEffect, useRef, useState } from 'react'
import { ArrowRight, Sparkles } from 'lucide-react'
import '@faclon-labs/fds/fonts'
import '@faclon-labs/fds/styles.css'
import { Badge, Button, Card, CardBody, CardHeader, CardHeaderLeading, TextInput } from '@faclon-labs/fds'

// Hero banner for "Faclon design system", built from the real @faclon-labs/fds components and tokens (not a look-alike).
// It tells the system in three cards: 1 Tokens (color, type, spacing) -> 2 Components (built from the tokens)
// -> 3 Apps & dashboards (built from the components by people or by Bruce, our AI).
//
// The FDS components are drawn at their real size on a 1067 x 600 stage (the 16:9 stage of the other banners divided by 1.5),
// and the stage is scaled to cover whatever box the banner sits in (case-study header, works row, project card).
// Purely decorative: the stage is `inert` and hidden from screen readers, so nothing in it is focusable or clickable.
// The cards and their gaps are 912px wide on a 1067px stage, so all three stay fully visible even when the stage is
// cropped to the near-1.6:1 boxes of the works and project cards (about 960px of it is shown there).
//
// It is loaded on demand (see Cover.jsx): it brings the whole FDS stylesheet, which the rest of the site never needs.

const FULL = { w: 1067, h: 600 }
const CARD_W = 280
const GAP = 36 // between cards, holds the arrow
const TOP = 136 // the cards are about 305px tall, so this centres them above the footer label

const SWATCHES = ['brand', 'info', 'positive', 'notice', 'negative', 'neutral'].map((t) => `var(--background-${t}-default)`)
const SPACE = [4, 8, 12, 16, 24, 32]
const DEVICES = [
  { name: 'Boiler sensor 01', status: 'Online', color: 'Positive' },
  { name: 'Pump 14', status: 'Degraded', color: 'Notice' },
  { name: 'Chiller 07', status: 'Offline', color: 'Negative' },
  { name: 'Valve 03', status: 'Idle', color: 'Neutral' },
]

const label = { color: 'var(--text-neutral-subtle)' }
const group = { display: 'grid', gap: 'var(--spacing-8)' }

function Group({ name, children }) {
  return (
    <div style={group}>
      <div className="BodySmallMedium" style={label}>{name}</div>
      {children}
    </div>
  )
}

function Frame({ title, subtitle, children }) {
  return (
    <Card width={CARD_W} padding={16}>
      <CardHeader showDivider={false}>
        <CardHeaderLeading title={title} subtitle={subtitle} />
      </CardHeader>
      <CardBody>
        <div style={{ display: 'grid', gap: 'var(--spacing-16)' }}>{children}</div>
      </CardBody>
    </Card>
  )
}

function Arrow() {
  return (
    <div style={{ width: GAP, display: 'grid', placeItems: 'center', flex: 'none' }}>
      <span style={{ display: 'grid', placeItems: 'center', width: 'var(--spacing-28)', height: 'var(--spacing-28)', borderRadius: 'var(--radius-max)', background: 'var(--background-surface-intense)', border: 'var(--border-width-thin) solid var(--border-neutral-default)', color: 'var(--text-neutral-subtle)' }}>
        <ArrowRight size={14} />
      </span>
    </div>
  )
}

function TokensCard() {
  return (
    <Frame title="Tokens" subtitle="Color, type and spacing, defined once.">
      <Group name="Color">
        <div style={{ display: 'flex', gap: 'var(--spacing-6)' }}>
          {SWATCHES.map((c) => (
            <span key={c} style={{ width: 'var(--spacing-32)', height: 'var(--spacing-32)', borderRadius: 'var(--radius-s)', background: c, border: 'var(--border-width-thin) solid var(--border-neutral-default)' }} />
          ))}
        </div>
      </Group>
      <Group name="Type">
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-12)', color: 'var(--text-neutral-normal)' }}>
          <span className="HeadingXLargeSemibold">Aa</span>
          <span className="HeadingLargeSemibold">Aa</span>
          <span className="HeadingMediumSemibold">Aa</span>
          <span className="BodyMediumRegular">Aa</span>
        </div>
      </Group>
      <Group name="Space">
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-8)' }}>
          {SPACE.map((s) => (
            <span key={s} style={{ width: `var(--spacing-${s})`, height: `var(--spacing-${s})`, borderRadius: 'var(--radius-xs)', background: 'var(--background-brand-default)' }} />
          ))}
        </div>
      </Group>
    </Frame>
  )
}

function ComponentsCard() {
  return (
    <Frame title="Components" subtitle="Built from the tokens, in Figma and in code.">
      <Group name="Button">
        <div style={{ display: 'flex', gap: 'var(--spacing-8)' }}>
          <Button label="Save" />
          <Button variant="secondary" tone="neutral" label="Cancel" />
          <Button variant="ghost" tone="neutral" label="Skip" />
        </div>
      </Group>
      <Group name="Input">
        <TextInput label="Device name" value="Boiler sensor 01" isReadOnly onChange={() => {}} />
      </Group>
      <Group name="Badge">
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--spacing-8)' }}>
          <Badge label="Online" color="Positive" />
          <Badge label="Degraded" color="Notice" />
          <Badge label="Offline" color="Negative" />
          <Badge label="Idle" color="Neutral" />
        </div>
      </Group>
    </Frame>
  )
}

function AppsCard() {
  return (
    <Frame title="Apps & dashboards" subtitle="Built by people, or by Bruce, our AI.">
      {/* what a user asks the AI for, and the kind of screen it builds from the same blocks */}
      <TextInput accessibilityLabel="Ask Bruce" leadingIcon={Sparkles} value="Show all device alerts" isReadOnly onChange={() => {}} />
      <div style={{ border: 'var(--border-width-thin) solid var(--border-neutral-default)', borderRadius: 'var(--radius-m)', background: 'var(--background-surface-intense)' }}>
        {DEVICES.map((d, i) => (
          <div
            key={d.name}
            className="BodyMediumRegular"
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 'var(--spacing-8)', padding: 'var(--spacing-8) var(--spacing-12)', color: 'var(--text-neutral-normal)', borderTop: i ? 'var(--border-width-thin) solid var(--border-neutral-default)' : 'none' }}
          >
            <span>{d.name}</span>
            <Badge label={d.status} color={d.color} />
          </div>
        ))}
      </div>
    </Frame>
  )
}

export default function DesignSystemBanner() {
  const root = useRef(null)
  const [box, setBox] = useState({ w: 800, h: 450 })

  useLayoutEffect(() => {
    const el = root.current
    const fit = () => setBox({ w: el.clientWidth, h: el.clientHeight })
    fit()
    const ro = new ResizeObserver(fit)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  // cover: the stage fills the box, and is centred
  const scale = Math.max(box.w / FULL.w, box.h / FULL.h)
  const x0 = (FULL.w - (3 * CARD_W + 2 * GAP)) / 2

  return (
    <div
      ref={root}
      className="art pointer-events-none relative select-none overflow-hidden"
      style={{ position: 'relative', overflow: 'hidden', background: 'linear-gradient(135deg, var(--global-orchid-50), var(--global-orchid-100))' }}
      role="img"
      aria-label="The Faclon design system in three layers: tokens for color, type and spacing, components built from them, and apps and dashboards built from the components by people or by Bruce, our AI"
    >
      <div
        aria-hidden="true"
        inert=""
        style={{ position: 'absolute', left: '50%', top: '50%', width: FULL.w, height: FULL.h, transform: `translate(-50%, -50%) scale(${scale})`, transformOrigin: 'center' }}
      >
        {/* thin curved lines */}
        <svg style={{ position: 'absolute', inset: 0 }} width={FULL.w} height={FULL.h} viewBox={`0 0 ${FULL.w} ${FULL.h}`} fill="none" stroke="#30196b" strokeWidth="1.6" strokeLinecap="round">
          <path d="M-14 167 C 80 27, 253 -7, 413 -33" />
          <path d="M-14 533 C 153 453, 313 493, 460 620" />
          <path d="M780 -33 C 953 60, 1060 213, 1093 360" />
          <path d="M840 640 C 907 580, 993 557, 1093 560" />
        </svg>

        <div style={{ position: 'absolute', left: x0, top: TOP, display: 'flex', alignItems: 'stretch' }}>
          <TokensCard />
          <Arrow />
          <ComponentsCard />
          <Arrow />
          <AppsCard />
        </div>

        <span className="CodeSmallRegular" style={{ position: 'absolute', left: x0, top: 560, letterSpacing: '0.14em', color: 'var(--text-neutral-subtle)' }}>
          FACLON DESIGN SYSTEM · FACLON LABS
        </span>
      </div>
    </div>
  )
}
