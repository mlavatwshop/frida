import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'

// Pull in Web Awesome's design tokens + base styles up front so every custom element renders correctly.
import '@awesome.me/webawesome/dist/styles/themes/default.css'
import '@awesome.me/webawesome/dist/styles/webawesome.css'

// Register only the components we're actually using to keep the bundle lean.
import '@awesome.me/webawesome/dist/components/badge/badge.js'
import '@awesome.me/webawesome/dist/components/button/button.js'
import '@awesome.me/webawesome/dist/components/card/card.js'
import '@awesome.me/webawesome/dist/components/divider/divider.js'
import '@awesome.me/webawesome/dist/components/icon/icon.js'
import '@awesome.me/webawesome/dist/components/progress-ring/progress-ring.js'
import '@awesome.me/webawesome/dist/components/spinner/spinner.js'

import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
