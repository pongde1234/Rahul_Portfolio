import { useCallback, useEffect, useState } from 'react'
import { ArrowLeft, ArrowRight, Check, KeyRound, ShieldCheck, Smartphone } from 'lucide-react'
import {
  Badge, BrandLogo, Button, Card, CardBody, Divider, LinkButton, OTPInput, PasswordInput, TextInput,
} from '@faclon-labs/fds'
import Glow from './Glow.jsx'

// The IO Sense sign-in with two-step verification, built from the FDS components and the Sign-in pattern:
//   username + password ("Let's go") -> six digit code (authenticator app by default, "Try another way") -> signed in.
// Demo only: any username, password or code is accepted (000000 shows the error), and the phone number is made up.
//   `start`: the screen to open on ('login' | 'code' | 'done'), used by the banner image
//   `bare`:  just the card, with no page behind it and no demo note, used by the banner image
// The case study's timeline (under the frame) and this page stay in step by messages, like the add-devices prototype:
//   this page -> the case study: { type: 'proto:step', step }   whenever the screen changes
//   the case study -> this page: { type: 'proto:goto', step }   when a step in the timeline is clicked
// The steps (screens): login, code, pick (try another way), done. A glowing pointer sits beside what to do next.
// `embed.html?demo=signin&solo=1` is a copy that is not tied to the timeline (the "Try the flow" demo further down the page).
const METHODS = {
  app: {
    label: 'Authenticator app',
    sub: 'Use the code from your app',
    icon: ShieldCheck,
    text: 'Please enter the six digit code given in the authenticator app.',
    error: 'That code didn’t work. Check your app and try again.',
  },
  sms: {
    label: 'Phone number (OTP)',
    sub: 'Get a code by text message',
    icon: Smartphone,
    text: 'We sent a six digit code to your registered phone number',
    phone: '+91 *****12345', // made-up number: demo only
    error: 'That code didn’t work. Check the text message and try again.',
  },
  backup: {
    label: 'Backup code',
    sub: 'Use a one-time code you saved',
    icon: KeyRound,
    text: 'Please enter one of your backup codes.',
    error: 'That backup code didn’t work. Check it and try again.',
  },
}
const RESEND_SECONDS = 56

const tile = (Icon, available = true) => (
  <span
    aria-hidden="true"
    style={{
      flex: 'none', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', placeItems: 'center',
      width: 'calc(var(--spacing-32) + var(--spacing-8))', height: 'calc(var(--spacing-32) + var(--spacing-8))',
      borderRadius: 'var(--radius-m)',
      background: available ? 'var(--background-brand-faded)' : 'var(--background-neutral-faded)',
      color: available ? 'var(--text-brand-normal)' : 'var(--text-neutral-muted)',
    }}
  >
    <Icon size={20} />
  </span>
)

// the brand mark, the product name and one line for the step
function Header({ title, line, children }) {
  return (
    <header style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', justifyItems: 'center', gap: 'var(--spacing-12)', textAlign: 'center' }}>
      <BrandLogo size={48} accessibilityLabel="Faclon Labs" />
      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-4)' }}>
        <h1 className="HeadingLargeSemibold" style={{ margin: 0, color: 'var(--text-neutral-normal)' }}>{title}</h1>
        <p className="BodyMediumRegular" style={{ margin: 0, color: 'var(--text-neutral-muted)' }}>{line}</p>
      </div>
      {children}
    </header>
  )
}

export default function SignInFlow({ start = 'login', bare = false }) {
  const [step, setStep] = useState(start === 'done' ? 2 : start === 'code' ? 1 : 0) // 0 login, 1 code, 2 signed in
  const [user, setUser] = useState(bare && start === 'login' ? 'rahul.s' : '')
  const [pass, setPass] = useState(bare && start === 'login' ? 'password1' : '')
  const [method, setMethod] = useState('app')
  const [picking, setPicking] = useState(false)
  const [code, setCode] = useState(start === 'code' ? '482193' : '')
  const [error, setError] = useState(false)
  const [secs, setSecs] = useState(RESEND_SECONDS)

  const m = METHODS[method]
  const isBackup = method === 'backup'
  const onPhone = step === 1 && !picking && method === 'sms'
  const canGo = user.trim().length > 0 && pass.length > 0
  const ready = isBackup ? code.trim().length >= 6 : code.length === 6
  const view = step === 1 && picking ? 'pick' : ['login', 'code', 'done'][step]
  const solo = typeof window !== 'undefined' && new URLSearchParams(window.location.search).has('solo')
  const hints = !bare // the glowing pointer is off in the banner image

  // tell the case study's timeline which screen this is
  useEffect(() => {
    if (!bare && !solo && window.parent !== window) window.parent.postMessage({ type: 'proto:step', step: view }, window.location.origin)
  }, [view, bare, solo])

  // a step in the timeline was clicked: show that screen
  const goto = useCallback((to) => {
    setPicking(to === 'pick')
    setStep(to === 'login' ? 0 : to === 'done' ? 2 : 1)
    if (to === 'login') {
      setUser('')
      setPass('')
    } else if (to !== 'done') {
      setUser('rahul.s')
      setPass('password1')
    }
    setCode('')
    setError(false)
    setSecs(RESEND_SECONDS)
    setMethod('app')
  }, [])
  useEffect(() => {
    if (bare || solo) return undefined
    const onMessage = (e) => {
      if (e.origin !== window.location.origin || e.data?.type !== 'proto:goto') return
      goto(e.data.step)
    }
    window.addEventListener('message', onMessage)
    return () => window.removeEventListener('message', onMessage)
  }, [goto, bare, solo])

  useEffect(() => {
    if (!onPhone || secs <= 0) return undefined
    const t = setTimeout(() => setSecs((s) => s - 1), 1000)
    return () => clearTimeout(t)
  }, [onPhone, secs])

  const letsGo = (e) => {
    e?.preventDefault()
    if (canGo) setStep(1)
  }
  const login = (e) => {
    e?.preventDefault()
    if (!ready) return
    if (code.trim() === '000000') setError(true)
    else setStep(2)
  }
  const typeCode = (v) => {
    setCode(v)
    setError(false)
  }
  const choose = (k) => {
    setMethod(k)
    setCode('')
    setError(false)
    setSecs(RESEND_SECONDS)
    setPicking(false)
  }
  const back = () => {
    if (picking) setPicking(false)
    else {
      setStep(0)
      setCode('')
      setError(false)
    }
  }
  const reset = () => {
    setStep(0)
    setUser('')
    setPass('')
    setMethod('app')
    setPicking(false)
    setCode('')
    setError(false)
    setSecs(RESEND_SECONDS)
  }

  const demoNote =
    view === 'login' ? 'Demo: type any username and password.'
    : view === 'code' ? (isBackup ? 'Demo: type any 6 or more characters. 000000 shows an error.' : 'Demo: type any six digits. 000000 shows an error.')
    : ''

  const card = (
    <Card width="100%" maxWidth={400} padding={24} accessibilityLabel="Sign in to I/O Sense">
      <CardBody>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-24)', position: 'relative' }}>
          {(view === 'code' || view === 'pick') && (
            <div style={{ position: 'absolute', left: 0, top: 0 }}>
              <Button iconOnly variant="ghost" tone="neutral" size="sm" aria-label="Back" onClick={back}><ArrowLeft size={16} /></Button>
            </div>
          )}

          {/* 1 - username + password */}
          {view === 'login' && (
            <form onSubmit={letsGo} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-24)' }}>
              <Header title="I/O Sense Login" line="Sign in to continue." />
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-12)' }}>
                <Glow block on={hints && !user}>
                  <div style={{ width: '100%' }}>
                    <TextInput label="Username" placeholder="Enter your username" value={user} onChange={({ value }) => setUser(value)} />
                  </div>
                </Glow>
                <Glow block on={hints && !!user && !pass}>
                  <div style={{ width: '100%' }}>
                    <PasswordInput
                      label="Password"
                      placeholder="Enter your password"
                      value={pass}
                      onChange={({ value }) => setPass(value)}
                      labelTrailing={<LinkButton size="sm" label="Forgot password?" />}
                    />
                  </div>
                </Glow>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-16)' }}>
                <Glow block on={hints && canGo}>
                  <Button type="submit" label="Let’s go" trailingIcon={<ArrowRight size={16} />} isFullWidth isDisabled={!canGo} />
                </Glow>
                <Divider />
                <p className="BodySmallRegular" style={{ margin: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 'var(--spacing-8)', color: 'var(--text-neutral-subtle)' }}>
                  <ShieldCheck size={16} aria-hidden="true" /> Protected with two-step verification
                </p>
              </div>
            </form>
          )}

          {/* 2 - try another way: three selectable cards */}
          {view === 'pick' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-24)' }}>
              <Header title="I/O Sense Login" line="Choose another way to log in." />
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-8)' }}>
                {Object.entries(METHODS).map(([k, v]) => (
                  <Glow key={k} block on={hints && k === (method === 'app' ? 'sms' : 'app')}>
                    <Card padding={12} width="100%" isSelected={k === method} accessibilityLabel={`Select ${v.label}`} onClick={() => choose(k)}>
                      <CardBody>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-12)', textAlign: 'left' }}>
                          {tile(v.icon)}
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div className="BodyMediumSemibold" style={{ color: 'var(--text-neutral-normal)' }}>{v.label}</div>
                            <div className="BodySmallRegular" style={{ color: 'var(--text-neutral-subtle)' }}>{k === method ? 'Current method' : v.sub}</div>
                          </div>
                          {k === 'app' && <Badge label="Recommended" color="Brand" />}
                        </div>
                      </CardBody>
                    </Card>
                  </Glow>
                ))}
              </div>
            </div>
          )}

          {/* 3 - enter the code */}
          {view === 'code' && (
            <form onSubmit={login} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-24)' }}>
              <Header title="I/O Sense Login" line={m.phone ? `${m.text} ${m.phone}` : m.text} />
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-12)', justifyItems: 'center' }}>
                {isBackup ? (
                  <Glow block on={hints && !ready}>
                    <div style={{ width: '100%' }}>
                      <TextInput
                        label="Backup code"
                        placeholder="4F7K-92QD"
                        value={code}
                        onChange={({ value }) => typeCode(value.slice(0, 12))}
                        validationState={error ? 'error' : 'none'}
                        errorText={error ? m.error : undefined}
                      />
                    </div>
                  </Glow>
                ) : (
                  <Glow block on={hints && !ready}>
                    <div style={{ width: '100%' }}>
                      <OTPInput
                        label="Six digit code"
                        otpLength={6}
                        value={code}
                        onChange={({ value }) => typeCode(value)}
                        validationState={error ? 'error' : 'none'}
                        errorText={error ? m.error : undefined}
                      />
                    </div>
                  </Glow>
                )}
                {onPhone && (
                  <p className="BodySmallRegular" style={{ margin: 0, display: 'flex', alignItems: 'center', gap: 'var(--spacing-4)', color: 'var(--text-neutral-subtle)' }}>
                    Didn’t receive an OTP?
                    <LinkButton size="sm" label="Resend OTP" isDisabled={secs > 0} onClick={() => setSecs(RESEND_SECONDS)} />
                    {secs > 0 && <span>00:{String(secs).padStart(2, '0')}</span>}
                  </p>
                )}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-12)', justifyItems: 'center' }}>
                <Glow block on={hints && ready}>
                  <Button type="submit" label="Login" isFullWidth isDisabled={!ready} />
                </Glow>
                <LinkButton tone="neutral" label="Try another way" onClick={() => setPicking(true)} />
              </div>
            </form>
          )}

          {/* 4 - in */}
          {view === 'done' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-24)', justifyItems: 'center', textAlign: 'center' }}>
              <span
                aria-hidden="true"
                style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', placeItems: 'center', width: 'calc(var(--spacing-48) + var(--spacing-8))', height: 'calc(var(--spacing-48) + var(--spacing-8))', borderRadius: 'var(--radius-max)', background: 'var(--background-positive-faded)', color: 'var(--text-positive-normal)' }}
              >
                <Check size={28} />
              </span>
              <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 'var(--spacing-4)' }}>
                <h1 className="HeadingLargeSemibold" style={{ margin: 0, color: 'var(--text-neutral-normal)' }}>You’re signed in</h1>
                <p className="BodyMediumRegular" style={{ margin: 0, color: 'var(--text-neutral-muted)' }}>Your account is protected with two-step verification.</p>
              </div>
              <Button variant="secondary" tone="neutral" label="Start over" onClick={reset} />
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  )

  if (bare) return card
  return (
    <div style={{ minHeight: '100%', boxSizing: 'border-box', display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', placeItems: 'center', alignContent: 'center', gap: 'var(--spacing-16)', padding: 'var(--spacing-24) var(--spacing-16)', background: 'var(--background-surface-moderate)' }}>
      {card}
      <div className="BodySmallRegular" style={{ minHeight: 'var(--spacing-20)', textAlign: 'center', color: 'var(--text-neutral-subtle)' }} aria-live="polite">{demoNote}</div>
    </div>
  )
}
