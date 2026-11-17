import { useCallback, useEffect, useRef, useState } from 'react'
import '@faclon-labs/fds/fonts'
import '@faclon-labs/fds/styles.css'
import {
  Alert,
  Badge,
  Button,
  Card,
  CardBody,
  CardHeader,
  CardHeaderLeading,
  CardMetric,
  Chip,
  ChipGroup,
  Indicator,
  ProgressBar,
  Skeleton,
  Spinner,
  Table,
} from '@faclon-labs/fds'
import './fdsDemo.css'
import Glow from '../embed/Glow.jsx'

// "Try the flow" demo for the Faclon design system case study, built only from @faclon-labs/fds components.
//
// It shows the idea behind the project: the company AI does not draw pixels. It writes a small JSON tree of UI nodes
// (left), and the design system draws that tree with real FDS components (right). Because the AI can only name
// components that exist, whatever it builds looks like the rest of Faclon.
//
// It follows the GenUI pattern in the FDS index (P6): the app parses what arrived and draws it, every field of a node is
// coerced before it reaches a component (a node is never spread into one), a name FDS has nothing for renders nothing,
// and a generated button is ghost + neutral and only ASKS: the app decides what happens (here: it shows another answer).
// The `ai` family of FDS has no guard yet (index "Gaps"), so it is not used. Nothing is sent to a model: the answers
// are scripted and the data is made up.
//
// It has four stages, which the case study's timeline (under the frame) shows and can jump to: ask (nothing asked yet), write
// (the AI is writing the JSON, the screen is still being drawn), draw (the screen is drawn) and done. They stay in step by messages:
//   this page -> the case study: { type: 'proto:step', step }   whenever the stage changes
//   the case study -> this page: { type: 'proto:goto', step }   when a step in the timeline is clicked
// `embed.html?demo=fds&solo=1` is a copy that is not tied to the timeline (the "Try the flow" demo further down the page).

const AI_NAME = 'Bruce'

const ALERT_COLORS = ['Positive', 'Negative', 'Notice', 'Information', 'Neutral', 'Brand']
const INDICATOR_COLORS = ['Positive', 'Negative', 'Notice', 'Information', 'Neutral', 'Brand']
const BADGE_COLORS = ['Positive', 'Negative', 'Notice', 'Information', 'Neutral', 'Brand']

// what the AI "writes" for each question
const ANSWERS = {
  alerts: {
    label: 'Show all device alerts',
    nodes: [
      { component: 'HEADING', text: 'Device alerts' },
      { component: 'ALERT', color: 'Negative', title: '2 devices need attention', description: 'Boiler 02 stopped reporting and Pump 14 is running hot.' },
      {
        component: 'TABLE',
        title: 'Devices with alerts',
        columns: [
          { key: 'device', header: 'Device' },
          { key: 'plant', header: 'Plant' },
          { key: 'status', header: 'Status', badges: { Offline: 'Negative', Degraded: 'Notice', Online: 'Positive' } },
        ],
        rows: [
          { id: 'b02', device: 'Boiler 02', plant: 'Plant A', status: 'Offline' },
          { id: 'p14', device: 'Pump 14', plant: 'Plant B', status: 'Degraded' },
          { id: 'c07', device: 'Chiller 07', plant: 'Plant B', status: 'Online' },
        ],
      },
      { component: 'BUTTON', text: 'Show energy use this week', action: { type: 'CLICK', data: { message: 'energy' } } },
    ],
  },
  energy: {
    label: 'Energy use this week',
    nodes: [
      { component: 'HEADING', text: 'Energy use this week' },
      {
        component: 'GRID',
        columns: 3,
        children: [
          { component: 'CARD', title: 'Total energy', children: [{ component: 'METRIC', value: 12480, unit: 'kWh' }] },
          { component: 'CARD', title: 'Peak load', children: [{ component: 'METRIC', value: 842, unit: 'kW' }] },
          { component: 'CARD', title: 'Uptime', children: [{ component: 'METRIC', value: 98.2, unit: '%' }] },
        ],
      },
      { component: 'CARD', title: 'Weekly target', children: [{ component: 'PROGRESS', label: 'Target used', value: 78 }] },
      { component: 'BUTTON', text: 'Which plants are online?', action: { type: 'CLICK', data: { message: 'plants' } } },
    ],
  },
  plants: {
    label: 'Which plants are online?',
    nodes: [
      { component: 'HEADING', text: 'Plant status' },
      {
        component: 'GRID',
        columns: 3,
        children: [
          { component: 'CARD', title: 'Plant A', children: [{ component: 'INDICATOR', color: 'Positive', text: 'Online' }, { component: 'TEXT', text: '42 devices' }] },
          { component: 'CARD', title: 'Plant B', children: [{ component: 'INDICATOR', color: 'Notice', text: 'Degraded' }, { component: 'TEXT', text: '38 devices' }] },
          { component: 'CARD', title: 'Plant C', children: [{ component: 'INDICATOR', color: 'Negative', text: 'Offline' }, { component: 'TEXT', text: '27 devices' }] },
        ],
      },
      { component: 'BUTTON', text: 'Show all device alerts', action: { type: 'CLICK', data: { message: 'alerts' } } },
    ],
  },
}
const ORDER = ['alerts', 'energy', 'plants']

// a node is untrusted input: read and coerce each field, never spread it
const str = (v, fallback = '') => (typeof v === 'string' ? v : fallback)
const num = (v, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) ? v : fallback)
const pick = (v, allowed, fallback) => (allowed.includes(v) ? v : fallback)
const list = (v) => (Array.isArray(v) ? v : [])
const fmt = (n) => n.toLocaleString('en-IN')

function Nodes({ nodes, onAsk }) {
  return list(nodes).map((n, i) => <Node key={i} node={n} onAsk={onAsk} />)
}

function Node({ node, onAsk }) {
  if (!node || typeof node !== 'object') return null
  switch (node.component) {
    case 'HEADING':
      return <h4 className="BodyLargeSemibold fdsd__heading">{str(node.text)}</h4>

    case 'TEXT':
      return <div className="BodySmallRegular fdsd__text">{str(node.text)}</div>

    case 'ALERT':
      return (
        <Alert
          color={pick(node.color, ALERT_COLORS, 'Neutral')}
          title={str(node.title) || undefined}
          description={str(node.description, ' ')}
          isDismissible={false}
          isFullWidth
        />
      )

    case 'INDICATOR':
      return <Indicator color={pick(node.color, INDICATOR_COLORS, 'Neutral')} size="Small">{str(node.text)}</Indicator>

    case 'BADGE':
      return <Badge label={str(node.text, ' ')} color={pick(node.color, BADGE_COLORS, 'Neutral')} />

    case 'METRIC':
      return <CardMetric value={fmt(num(node.value))} unit={str(node.unit) || undefined} />

    case 'PROGRESS':
      return <ProgressBar type="meter" label={str(node.label, 'Progress')} value={Math.min(100, Math.max(0, num(node.value)))} />

    case 'CARD':
      return (
        <Card>
          <CardHeader showDivider={false}>
            <CardHeaderLeading title={str(node.title, ' ')} />
          </CardHeader>
          <CardBody>
            <div className="fdsd__grid">
              <Nodes nodes={node.children} onAsk={onAsk} />
            </div>
          </CardBody>
        </Card>
      )

    case 'GRID': {
      const cols = Math.min(4, Math.max(1, Math.round(num(node.columns, 1))))
      return (
        <div className="fdsd__grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
          <Nodes nodes={node.children} onAsk={onAsk} />
        </div>
      )
    }

    case 'TABLE': {
      const columns = list(node.columns).map((c, ci) => {
        const key = str(c && c.key)
        const badges = c && typeof c.badges === 'object' && c.badges ? c.badges : null
        return {
          key,
          header: str(c && c.header, key),
          isRowHeader: ci === 0,
          emphasis: ci === 0 ? 'normal' : undefined,
          cell: badges ? (row) => <Badge label={str(row[key], ' ')} color={pick(badges[row[key]], BADGE_COLORS, 'Neutral')} /> : undefined,
        }
      })
      const data = list(node.rows).filter((r) => r && typeof r === 'object')
      return <Table accessibilityLabel={str(node.title) || columns.map((c) => c.header).join(', ')} data={data} columns={columns} getRowId={(r) => String(r.id)} />
    }

    case 'BUTTON': {
      // the model only asks (a ghost, neutral button); the app decides what a click does
      const ask = node.action && node.action.type === 'CLICK' && node.action.data ? str(node.action.data.message) : ''
      return (
        <div className="fdsd__action">
          <Button variant="ghost" tone="neutral" size="sm" label={str(node.text, 'Continue')} onClick={() => ask && onAsk(ask)} />
        </div>
      )
    }

    default:
      return null // a name FDS has nothing for renders nothing
  }
}

// the shape of the answer while it is being drawn: composed from Skeletons, as the Skeleton guard asks
function Waiting() {
  return (
    <>
      <Spinner size="Medium" label={`${AI_NAME} is building your screen`} />
      <Skeleton width="40%" height="var(--spacing-24)" />
      <Skeleton width="100%" height="var(--spacing-56)" />
      <Skeleton width="100%" height="var(--spacing-64)" />
    </>
  )
}

export default function FdsDemo() {
  const solo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('solo')
  const [asked, setAsked] = useState(null) // what the person picked (null: nothing yet): the JSON follows at once
  const [shown, setShown] = useState(null) // what is drawn: it follows after a short wait
  const [busy, setBusy] = useState(false)
  const [finished, setFinished] = useState(false)
  const timer = useRef(null)

  useEffect(() => () => clearTimeout(timer.current), [])

  const stage = !asked ? 'ask' : busy ? 'write' : finished ? 'done' : 'draw'

  const ask = (id) => {
    if (!ANSWERS[id]) return
    setFinished(false)
    setAsked(id)
    setBusy(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      setShown(id)
      setBusy(false)
    }, 900)
  }

  // The stand-alone copy ("Try the flow") plays the first question by itself, so the two panes are never empty and a visitor sees the idea
  // before touching anything. The copy under the case study's timeline does not: its first stage is "nothing asked yet".
  useEffect(() => {
    if (!solo) return undefined
    const t = setTimeout(() => ask(ORDER[0]), 700)
    return () => clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [solo])

  // tell the case study's timeline which stage this is
  useEffect(() => {
    if (!solo && window.parent !== window) window.parent.postMessage({ type: 'proto:step', step: stage }, window.location.origin)
  }, [stage, solo])

  // a step in the timeline was clicked: show that stage (it stays there: nothing moves on by itself)
  const goto = useCallback((to) => {
    clearTimeout(timer.current)
    const id = ORDER[0]
    setAsked(to === 'ask' ? null : id)
    setShown(to === 'draw' || to === 'done' ? id : null)
    setBusy(to === 'write')
    setFinished(to === 'done')
  }, [])
  useEffect(() => {
    if (solo) return undefined
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'proto:goto') return
      goto(e.data.step)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [goto, solo])

  return (
    <div className="fdsd">
      {/* the hint dot sits on the next question to try (the first one before anything is asked), and there is no second pointer: the visitor already has a cursor */}
      <ChipGroup label={`Ask ${AI_NAME}`} size="Medium" selectionType="single" value={asked ?? ''} onChange={({ values }) => values[0] && ask(values[0])}>
        {ORDER.map((id, i) => (
          <Glow key={id} pointer={false} on={(stage === 'ask' || stage === 'draw') && id === ORDER[asked ? (ORDER.indexOf(asked) + 1) % ORDER.length : 0]}>
            <Chip value={id}>{ANSWERS[id].label}</Chip>
          </Glow>
        ))}
      </ChipGroup>

      <div className="fdsd__panes">
        <section className="fdsd__pane" aria-label={`What ${AI_NAME} writes`}>
          <div className="BodyMediumSemibold fdsd__label">1 · {AI_NAME} writes the screen as JSON</div>
          <div className="fdsd__codewrap">
            {asked ? (
              <pre className="CodeSmallRegular fdsd__code" tabIndex={0} aria-label={`The JSON that ${AI_NAME} wrote`}>{JSON.stringify(ANSWERS[asked].nodes, null, 2)}</pre>
            ) : (
              <p className="BodyMediumRegular fdsd__empty">Pick a question. {AI_NAME} answers by writing the screen as JSON.</p>
            )}
          </div>
        </section>

        <section className="fdsd__pane" aria-label="What the design system draws">
          <div className="BodyMediumSemibold fdsd__label">2 · The design system draws it</div>
          <div className="fdsd__screen" aria-live="polite" aria-busy={busy}>
            {stage === 'done' && (
              <Alert
                isFullWidth
                isDismissible={false}
                color="Positive"
                title="Built from the same parts"
                description={`${AI_NAME} used the parts a designer would use, so the screen looks like the rest of Faclon.`}
              />
            )}
            {busy ? <Waiting /> : shown ? <Nodes nodes={ANSWERS[shown].nodes} onAsk={ask} /> : <p className="BodyMediumRegular fdsd__empty">The screen appears here, drawn from the design system's own parts.</p>}
          </div>
        </section>
      </div>
    </div>
  )
}
