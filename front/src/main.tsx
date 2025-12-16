import { StrictMode, useEffect } from 'react'
import './i18n'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

const READDY_WIDGET_URL = 'https://readdy.ai/api/public/assistant/widget?projectId=69c4dfdf-a8e5-432c-8d98-28d64036048a'
const SHOULD_LOAD_READDY = import.meta.env.VITE_ENABLE_READDY_WIDGET === 'true'

const loadReaddyWidget = () => {
  if (typeof window === 'undefined' || !SHOULD_LOAD_READDY) {
    return
  }

  const isVerifyRoute = window.location.pathname.startsWith('/verify-email')
  if (isVerifyRoute) {
    return
  }

  const alreadyInjected = document.querySelector('script[data-readdy-widget="true"]')
  if (alreadyInjected) {
    return
  }

  const script = document.createElement('script')
  script.src = READDY_WIDGET_URL
  script.defer = true
  script.dataset.readdyWidget = 'true'
  script.setAttribute('data-readdy-route-exclude', '/verify-email')
  document.body.appendChild(script)
}

// Load Readdy widget after React has mounted (if enabled)
const AppWithWidget = () => {
  useEffect(() => {
    if (!SHOULD_LOAD_READDY) {
      return
    }
    // Small delay to ensure React has fully mounted before injecting the widget
    const timeout = window.setTimeout(loadReaddyWidget, 100)
    return () => window.clearTimeout(timeout)
  }, [])

  return <App />
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppWithWidget />
  </StrictMode>,
)
