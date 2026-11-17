import React from 'react'
import ReactDOM from 'react-dom/client'
import { HashRouter } from 'react-router-dom'
import App from './App.jsx'
// The portfolio's fonts: Outfit for the big headlines, DM Sans for text and buttons, DM Mono for the small labels.
// (The prototype pages, src/embed, keep the product's own fonts.) They are set in styles.css, "portfolio fonts".
import '@fontsource-variable/dm-sans'
import '@fontsource-variable/outfit'
import '@fontsource/dm-mono/400.css'
import '@fontsource/dm-mono/500.css'
// the Faclon design system's colour, type-size and spacing tokens (its fonts are replaced by the ones above)
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
