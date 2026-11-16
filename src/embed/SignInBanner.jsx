import SignInFlow from './SignInFlow.jsx'

// The picture for the "Two-step verification" banner: three screens of the FDS sign-in side by side
// (sign in -> enter the code -> signed in). A screenshot of this page is the banner image (see components/art/MfaStill.jsx).
export default function SignInBanner() {
  return (
    <div
      style={{
        height: '100%', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center',
        gap: 'var(--spacing-24)', padding: 'var(--spacing-24)', background: 'var(--background-surface-moderate)',
      }}
    >
      <div style={{ width: 'calc(var(--spacing-64) * 6)' }}><SignInFlow bare start="login" /></div>
      <div style={{ width: 'calc(var(--spacing-64) * 6)' }}><SignInFlow bare start="code" /></div>
      <div style={{ width: 'calc(var(--spacing-64) * 6)' }}><SignInFlow bare start="done" /></div>
    </div>
  )
}
