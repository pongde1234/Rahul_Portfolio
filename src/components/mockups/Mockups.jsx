import { useMemo, useState } from 'react'
import EmbedFrame from '../EmbedFrame.jsx'

// ---------------------------------------------------------------------------
// Coded UI mock-ups used by the before / after block (see components/BeforeAfter.jsx).
// Every mock is drawn on a fixed 880 x 540 canvas and scaled to fit, so sizes below are plain px.
// They are simplified recreations, not screenshots.
// ---------------------------------------------------------------------------

function Pin({ n, x, y, children, right }) {
  return (
    <span className={`ui-pin ${right ? 'ui-pin--right' : ''}`} style={{ left: x, top: y }}>
      <i>{n}</i>
      {children}
    </span>
  )
}

function Rail({ active = 1 }) {
  return (
    <div className="ui-rail" aria-hidden="true">
      <u className="ui-logo" />
      {[0, 1, 2, 3, 4, 5, 6].map((i) => (
        <i key={i} className={i === active ? 'on' : ''} />
      ))}
    </div>
  )
}

/* =========================  ONBOARDING AT SCALE  ========================= */

function DevicesBefore() {
  const rows = [
    ['FKEM_K11', 'Flow meter 11', 'Flow', 'Plant A'],
    ['FKEM_K12', 'Flow meter 12', 'Flow', 'Plant A'],
    ['FKEM_K14', 'Flow meter 14', 'Flow', 'Plant B'],
    ['FKEM_K16', 'Flow meter 16', 'Flow', 'Plant B'],
  ]
  return (
    <div className="ui ui--app">
      <Rail active={1} />
      <div className="ui-main">
        <div className="ui-top">
          <b>Devices</b>
          <span>/ Add device</span>
        </div>
        <div className="ui-body">
          <h4 className="ui-h">Add device</h4>
          <div className="ui-form">
            <div className="ui-field"><span>Device ID</span><div className="ui-input">FKEM_K17</div></div>
            <div className="ui-field"><span>Device name</span><div className="ui-input">Flow meter 17</div></div>
            <div className="ui-field"><span>Device type</span><div className="ui-input ui-input--sel">Select…</div></div>
            <div className="ui-field"><span>Location</span><div className="ui-input ui-input--ph">Location</div></div>
            <div className="ui-btn ui-btn--dark">Add device</div>
          </div>
          <div className="ui-banner ui-banner--err">Something went wrong. Please try again.</div>
          <div className="ui-table ui-table--4">
            <div className="ui-tr ui-tr--head"><span>Device ID</span><span>Name</span><span>Type</span><span>Location</span></div>
            {rows.map((r) => (
              <div key={r[0]} className="ui-tr">{r.map((c) => <span key={c}>{c}</span>)}</div>
            ))}
          </div>
          <p className="ui-hint">835 devices in total. To add more, fill the form again.</p>
        </div>
      </div>
      <Pin n="1" x={588} y={92}>One device at a time</Pin>
      <Pin n="2" x={500} y={236}>Vague error, no way to fix it</Pin>
      <Pin n="3" x={496} y={452}>No status or confirmation</Pin>
    </div>
  )
}

function DevicesAfter() {
  const rows = [
    ['FKEM_K11', 'FKEM_K11', 'ok'],
    ['FKEM_K12', 'FKEM_K12', 'ok'],
    ['FKEM_K14', 'FKEM_K14', 'ok'],
    ['FKEM_K15', 'FKEM_K15', 'err', 'Device ID not found'],
    ['FKEM_K17', 'FKEM_K17', 'ok'],
    ['FKEM_K20', '', 'err', 'Device name is missing'],
    ['FKEM_K21', 'FKEM_K21', 'ok'],
  ]
  return (
    <div className="ui ui--app">
      <Rail active={1} />
      <div className="ui-main">
        <div className="ui-top">
          <b>Devices</b>
          <span>/ Bulk upload / Preview</span>
        </div>
        <div className="ui-body">
          <div className="ui-file">
            <div className="ui-file__ico">XLSX</div>
            <div className="ui-file__txt">
              <b>Bulk Upload Template.xlsx</b>
              <span>250 devices found</span>
            </div>
            <span className="ui-chip ui-chip--ok">96 valid</span>
            <span className="ui-chip ui-chip--err">4 need attention</span>
            <div className="ui-file__btns">
              <div className="ui-btn">Re-upload</div>
              <div className="ui-btn">Cancel</div>
              <div className="ui-btn ui-btn--accent ui-btn--off">Confirm upload</div>
            </div>
          </div>
          <div className="ui-progress"><i style={{ width: '96%' }} /></div>
          <div className="ui-table ui-table--3">
            <div className="ui-tr ui-tr--head"><span>Device ID</span><span>Device name</span><span>Status</span></div>
            {rows.map(([id, name, st, msg]) => (
              <div key={id} className={`ui-tr ${st === 'err' ? 'ui-tr--err' : ''}`}>
                <span>{id}</span>
                <span>{name || <em>missing</em>}</span>
                <span className={`ui-status ui-status--${st}`}>{st === 'ok' ? '✓ Ready' : `⚠ ${msg}`}</span>
              </div>
            ))}
          </div>
          <div className="ui-bar">
            <span>Fix 4 errors to continue</span>
            <div className="ui-btn ui-btn--ghost">Show only errors</div>
          </div>
        </div>
      </div>
      <Pin n="1" x={360} y={74}>Upload a whole spreadsheet</Pin>
      <Pin n="2" x={500} y={272} right>Errors flagged on the exact row</Pin>
      <Pin n="3" x={520} y={436}>Status at a glance</Pin>
    </div>
  )
}

/* =========================  SECURITY WITHOUT FRICTION  ========================= */

function LoginBefore() {
  return (
    <div className="ui ui--center">
      <div className="ui-login">
        <div className="ui-brand">IO Sense</div>
        <h4>Sign in</h4>
        <div className="ui-field"><span>Email</span><div className="ui-input">rahul@company.com</div></div>
        <div className="ui-field"><span>Password</span><div className="ui-input">••••••••••</div></div>
        <div className="ui-btn ui-btn--dark ui-btn--block">Sign in</div>
        <p className="ui-link">Forgot password?</p>
      </div>
    </div>
  )
}

// small deterministic QR-looking pattern (decorative, not a real code)
function Qr() {
  const n = 25
  const cells = useMemo(() => {
    let s = 11
    const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
    const finder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
    const out = []
    for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) if (!finder(x, y) && rnd() > 0.52) out.push([x, y])
    return out
  }, [])
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#16181d" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#16181d" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="ui-qr" shapeRendering="crispEdges" aria-hidden="true">
      <rect width={n} height={n} fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#16181d" />)}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  )
}

function MfaAfter() {
  // QR code, then a code the visitor can actually type (any 6 digits work: it is a demo)
  const [code, setCode] = useState('')
  const done = code.length === 6
  return (
    <div className="ui ui--center">
      <div className="ui-setup">
        <div className="ui-setup__head">
          <b>Set up two-step verification</b>
        </div>
        <div className="ui-setup__body">
          <Qr />
          <div className="ui-setup__side">
            {!done ? (
              <>
                <h5>Scan the QR code</h5>
                <p>Use Google or Microsoft Authenticator, then enter the 6-digit code it shows.</p>
                <div className="ui-codewrap">
                  <div className="ui-code">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={code[i] ? 'on' : i === code.length ? 'cursor' : ''}>
                        {code[i] ?? ''}
                      </div>
                    ))}
                  </div>
                  <input
                    className="ui-hidden"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    aria-label="Type the 6-digit code"
                  />
                </div>
                <p className="ui-sub">Try it: click the boxes and type any 6 digits.</p>
              </>
            ) : (
              <div className="ui-done">
                <div className="ui-done__ico" aria-hidden="true">✓</div>
                <h5>Verified</h5>
                <p>Two-step verification is now on for your account.</p>
                <button type="button" className="ui-reset" onClick={() => setCode('')}>
                  Start over
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export const MOCKS = {
  devices: { Before: DevicesBefore, After: DevicesAfter },
  mfa: { Before: LoginBefore, After: MfaAfter },
}

// The sign-in, add-devices and design system demos are built from the Faclon design system and run in their own frame (embed.html),
// because the design system's own app frame and pop-ups fill a whole window.
function SignInFlow() {
  return <EmbedFrame demo="signin" viewH={620} title="Interactive demo: signing in with two-step verification" />
}
SignInFlow.native = true
SignInFlow.bare = true // the frame draws the screen itself: no grey box, border or shadow around it
function BulkUploadFlow() {
  return <EmbedFrame demo="devices" viewW={1100} viewH={640} title="Interactive demo: adding devices in bulk" />
}
BulkUploadFlow.native = true
BulkUploadFlow.bare = true

function FdsDemoFlow() {
  return <EmbedFrame demo="fds" viewW={960} viewH={780} title="Interactive demo: Bruce writes a screen and the design system draws it" />
}
FdsDemoFlow.native = true
FdsDemoFlow.bare = true

export const FLOWS = { mfa: SignInFlow, devices: BulkUploadFlow, fds: FdsDemoFlow }
