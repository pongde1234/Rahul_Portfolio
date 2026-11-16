import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
// the Faclon design system: its colour, type and spacing tokens, and its two fonts, for every page.
// The fonts are imported here directly (they are what '@faclon-labs/fds/fonts' loads): through the package the dev server drops them.
import '@fontsource-variable/inter'
import '@fontsource-variable/jetbrains-mono'
import '@faclon-labs/fds/styles.css'
import './shadcn.css'
import './styles.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </React.StrictMode>,
)
