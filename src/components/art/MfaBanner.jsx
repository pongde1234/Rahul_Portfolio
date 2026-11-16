import { useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Check, Download } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { InputOTP, InputOTPGroup, InputOTPSeparator, InputOTPSlot } from '@/components/ui/input-otp'
import { cn } from '@/lib/utils'

// Hero banner for "Security without friction", built from shadcn/ui components (Card, Badge, Button, InputOTP):
// the three-step setup told as three cascading cards (1 Scan, 2 Enter your code, 3 You're protected).
// It is HTML on a fixed stage that is scaled to cover whatever box it sits in (works row, project card,
// case-study header). Purely decorative: nothing in it is focusable or clickable, and everything inside
// each card is centred.
//
// Sizes: the stage is 1600 x 900 and the case-study header shows it at about 0.69, so every text is at least
// 20px here (about 12px on screen). In the small works and project cards the same three cards are shown
// scaled down, as a thumbnail of the banner.
//
// Rhythm inside every card (stage px): 40 padding on all four sides, header (progress + label, 12, title, 12,
// description), 28, content. Cards hug their content, so top and bottom padding are exactly 40 in every card, and
// headers are top-aligned so the three titles sit on one line across the cards. Content that can span the card
// (code boxes, Verify, chips, footer buttons) fills the 400px inside the padding, so the sides measure 40 too.
// The cards overlap by 16px, which leaves 24px of air between a card's content and the next card.

const FULL = { w: 1600, h: 900 }
const CARD_W = 480
const STEP_X = 464 // card width minus the 16px overlap
const STEP_Y = 119
const TOP = 66 // top of the first card; the cascade is about 770px tall on the 900px stage
const CODES = ['4F7K-92QD', 'M3XA-81LP', 'T9ZB-46HC', 'W2RN-70VE', 'J8DU-35GS', 'C6YP-19KA']
const GREEN = '#15803d'

// same look as the sign-in flow: the site's font and the FDS brand blue as shadcn's primary (FDS values, not CSS variables)
const THEME = {
  '--primary': '#1364f1',
  '--ring': '#1364f1',
  '--accent': '#f5f9ff',
  '--accent-foreground': '#0e54cd',
  '--input': '#afb6bb',
  '--muted-foreground': '#616d75',
  fontFamily: 'var(--font-body)',
}

// decorative QR-like pattern (not a real code)
function Qr() {
  const n = 25
  const cells = useMemo(() => {
    let s = 17
    const rnd = () => ((s = (s * 1664525 + 1013904223) % 4294967296) / 4294967296)
    const finder = (x, y) => (x < 8 && y < 8) || (x >= n - 8 && y < 8) || (x < 8 && y >= n - 8)
    const out = []
    for (let y = 0; y < n; y += 1) for (let x = 0; x < n; x += 1) if (!finder(x, y) && rnd() > 0.5) out.push([x, y])
    return out
  }, [])
  const Finder = ({ x, y }) => (
    <g transform={`translate(${x} ${y})`}>
      <rect width="7" height="7" fill="#050505" />
      <rect x="1" y="1" width="5" height="5" fill="#fff" />
      <rect x="2" y="2" width="3" height="3" fill="#050505" />
    </g>
  )
  return (
    <svg viewBox={`0 0 ${n} ${n}`} className="size-[192px]" shapeRendering="crispEdges" aria-hidden="true">
      <rect width={n} height={n} fill="#fff" />
      {cells.map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="1" height="1" fill="#050505" />)}
      <Finder x={0} y={0} />
      <Finder x={n - 7} y={0} />
      <Finder x={0} y={n - 7} />
    </svg>
  )
}

// three-bar progress + "STEP n OF 3" (the last step turns green with a check)
function Progress({ step }) {
  const done = step === 3
  return (
    <div className="grid justify-items-center gap-3">
      <div className="flex gap-2">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn('h-1.5 w-12 rounded-full', n > step && 'bg-border', n <= step && !done && 'bg-primary')} style={n <= step && done ? { background: GREEN } : undefined} />
        ))}
      </div>
      <span className="flex items-center gap-2 font-mono text-[20px] leading-6 tracking-[0.12em]" style={{ color: done ? GREEN : 'var(--muted-foreground)' }}>
        {done && <Check className="size-5" strokeWidth={3} />} STEP {step} OF 3
      </span>
    </div>
  )
}

// shared card frame: top-aligned header (progress, title, description), content centred in the space that is left
function Step({ x, y, step, title, description, children, footer }) {
  return (
    <Card className="absolute justify-start gap-0 py-10 text-center shadow-[0_24px_44px_-18px_rgba(22,24,29,0.28)]" style={{ left: x, top: y, width: CARD_W }}>
      <CardHeader className="justify-items-center gap-3 px-10 pb-7">
        <Progress step={step} />
        <CardTitle className="text-[32px] font-medium leading-[1.2] tracking-tight">{title}</CardTitle>
        <CardDescription className="text-[22px] leading-[1.45] text-[#292f32]">{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid justify-items-center gap-5 px-10">{children}</CardContent>
      {footer && <CardFooter className="gap-3 px-10 pt-6">{footer}</CardFooter>}
    </Card>
  )
}

// a Button that is only decorative: rendered as a span so nothing is focusable inside the banner's link
const Deco = ({ children, className, ...props }) => (
  <Button asChild className={className} {...props}>
    <span>{children}</span>
  </Button>
)

function ScanCard({ x, y }) {
  return (
    <Step x={x} y={y} step={1} title="Scan the QR code" description={<>Open Google or Microsoft<br />Authenticator and scan.</>}>
      <div className="rounded-md border-2 bg-white p-2.5">
        <Qr />
      </div>
      <div className="grid gap-1">
        <span className="text-[20px] leading-6 text-muted-foreground">Can’t scan? Enter this key</span>
        <span className="font-mono text-[20px] font-medium leading-6 tracking-wide text-foreground">JBSW Y3DP EHPK 3PXP</span>
      </div>
    </Step>
  )
}

function CodeCard({ x, y }) {
  // six square boxes (56px) fill the 400px inside the padding: 6 x 56 + 4 x 8 (inside groups) + 2 x 8 + 16 (dash) + 16
  const slot = 'size-14 rounded-md border bg-white text-[30px] font-medium shadow-xs first:rounded-md first:border-l last:rounded-md'
  return (
    <Step x={x} y={y} step={2} title="Enter your code" description={<>Type the 6-digit code from<br />your authenticator app.</>}>
      {/* the code and its timer belong together (12px apart); the button is 20px below them */}
      <div className="grid justify-items-center gap-3">
        <InputOTP disabled maxLength={6} value="482193" containerClassName="justify-center has-disabled:opacity-100" tabIndex={-1}>
          <InputOTPGroup className="gap-2">
            {[0, 1, 2].map((i) => <InputOTPSlot key={i} index={i} className={slot} />)}
          </InputOTPGroup>
          <InputOTPSeparator className="text-muted-foreground [&_svg]:size-4" />
          <InputOTPGroup className="gap-2">
            {[3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} className={slot} />)}
          </InputOTPGroup>
        </InputOTP>
        <span className="text-[20px] leading-6 text-muted-foreground tabular-nums">Code refreshes in 00:14</span>
      </div>
      <Deco className="h-14 w-full text-[22px] font-medium">Verify</Deco>
      <span className="text-[20px] leading-6 text-primary underline underline-offset-4">Use another method</span>
    </Step>
  )
}

function ProtectedCard({ x, y }) {
  return (
    <Step
      x={x}
      y={y}
      step={3}
      title="You’re protected"
      description={<>Save your backup codes. Each works<br />once if you lose your phone.</>}
      footer={
        <>
          <Deco variant="outline" className="h-14 flex-1 gap-2 text-[20px] font-medium">
            <Download className="size-5" /> Download
          </Deco>
          <Deco className="h-14 flex-1 text-[20px] font-medium">Done</Deco>
        </>
      }
    >
      <div className="grid w-full grid-cols-2 gap-3">
        {CODES.map((c) => (
          <Badge key={c} variant="secondary" className="h-11 w-full rounded-md border bg-muted font-mono text-[20px] font-medium tracking-wider text-foreground">
            {c}
          </Badge>
        ))}
      </div>
    </Step>
  )
}

export default function MfaBanner() {
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

  // the cascade is centred on the stage as a group
  const x0 = (FULL.w - (CARD_W + 2 * STEP_X)) / 2
  const y0 = TOP

  return (
    <div
      ref={root}
      className="art sh pointer-events-none relative select-none overflow-hidden bg-gradient-to-br from-[#f0fdf4] to-[#dcfce7]"
      style={THEME}
      role="img"
      aria-label="Two-step verification in three steps: scan a QR code, enter the 6-digit code, then save your backup codes"
    >
      <div className="absolute left-1/2 top-1/2" style={{ width: FULL.w, height: FULL.h, transform: `translate(-50%, -50%) scale(${scale})` }} aria-hidden="true">
        {/* thin curved lines */}
        <svg className="absolute inset-0" width={FULL.w} height={FULL.h} viewBox={`0 0 ${FULL.w} ${FULL.h}`} fill="none" stroke="#166534" strokeWidth="2.4" strokeLinecap="round">
          <path d="M-20 270 C 110 50, 380 -10, 620 -50" />
          <path d="M-20 780 C 230 650, 470 720, 690 920" />
          <path d="M1170 -50 C 1430 90, 1590 320, 1640 540" />
          <path d="M1260 960 C 1360 870, 1490 835, 1640 840" />
        </svg>

        {/* the cascade: 119px down and 464px across per card (16px overlap) */}
        <ScanCard x={x0} y={y0} />
        <CodeCard x={x0 + STEP_X} y={y0 + STEP_Y} />
        <ProtectedCard x={x0 + 2 * STEP_X} y={y0 + 2 * STEP_Y} />

        <span className="absolute font-mono text-[20px] tracking-[0.14em] text-muted-foreground" style={{ left: x0, top: 848 }}>
          IO SENSE · FACLON LABS
        </span>
      </div>
    </div>
  )
}
