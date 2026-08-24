import * as Sentry from '@sentry/nextjs'

const getTracesSampleRate = (): number => {
  const configured = process.env.SENTRY_TRACES_SAMPLE_RATE?.trim()
  if (!configured) return process.env.NODE_ENV === 'production' ? 0.1 : 1

  const parsed = Number(configured)
  if (!Number.isFinite(parsed)) return process.env.NODE_ENV === 'production' ? 0.1 : 1

  return Math.min(1, Math.max(0, parsed))
}

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: getTracesSampleRate(),
      debug: false,
    })
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      tracesSampleRate: getTracesSampleRate(),
      debug: false,
    })
  }
}

export const onRequestError = Sentry.captureRequestError
