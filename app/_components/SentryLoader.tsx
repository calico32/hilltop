'use client'

import * as Sentry from '@sentry/react'
import { useEffect } from 'react'

declare global {
  interface Window {
    sentryReady: boolean
  }
}

export default function SentryLoader(): JSX.Element {
  useEffect(() => {
    if (window.sentryReady) return
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      integrations: [
        new Sentry.BrowserTracing({
          // Set 'tracePropagationTargets' to control for which URLs distributed tracing should be enabled
          tracePropagationTargets: ['localhost', /^https:\/\/yourserver\.io\/api/],
        }),
        new Sentry.Replay(),
      ],
      environment: process.env.NODE_ENV,
      // Performance Monitoring
      tracesSampleRate: 1.0, // Capture 100% of the transactions, reduce in production!
      // Session Replay
      replaysSessionSampleRate: 0.1, // This sets the sample rate at 10%. You may want to change it to 100% while in development and then sample at a lower rate in production.
      replaysOnErrorSampleRate: 1.0, // If you're not already sampling the entire session, change the sample rate to 100% when sampling sessions where errors occur.
    })
    window.sentryReady = true
  }, [])

  return <></>
}
