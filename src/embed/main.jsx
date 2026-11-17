import React from 'react'
import ReactDOM from 'react-dom/client'
// the same three fonts as the portfolio (see styles.css, "portfolio fonts"; embed.css sets them on the design system's tokens)
import '@fontsource-variable/outfit'
import '@fontsource-variable/dm-sans'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
import '@faclon-labs/fds/styles.css'
import './embed.css'
import { ThemeProvider } from '@faclon-labs/fds'
import DevicesFlow from './DevicesFlow.jsx'
import SignInFlow from './SignInFlow.jsx'
import SignInBanner from './SignInBanner.jsx'
import FdsDemo from '../components/FdsDemo.jsx'

// The prototypes' own page, shown inside frames in the case studies (components/PrototypeFrame.jsx, components/EmbedFrame.jsx).
// Each is a separate page view so the real FDS AppShell and Modal, which fill the whole window, have a window of their own to fill.
//   embed.html                      the add-devices prototype (the "Adding many devices" case study)
//   embed.html?demo=signin          the sign-in with two-step verification (the "Two-step verification" case study)
//   embed.html?demo=fds             Bruce writes a screen and the design system draws it (the "Faclon design system" case study)
//   embed.html?demo=signin-banner   three sign-in screens side by side (a banner image)
// Add `&solo=1` (or `?solo=1`) for a copy that is not tied to the timeline above the frame.
const demo = new URLSearchParams(window.location.search).get('demo')

function FdsPage() {
  return (
    <div style={{ minHeight: '100%', background: 'var(--background-surface-subtle)' }}>
      <FdsDemo />
    </div>
  )
}

const Page = demo === 'signin' ? SignInFlow : demo === 'signin-banner' ? SignInBanner : demo === 'fds' ? FdsPage : DevicesFlow

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ThemeProvider defaultPreference="light">
      <Page />
    </ThemeProvider>
  </React.StrictMode>,
)
