import type * as SentryTypes from '@sentry/nextjs'

type SentryClient = typeof SentryTypes
type RouterTransitionStart = typeof SentryTypes.captureRouterTransitionStart

const SENTRY_DSN = process.env.NEXT_PUBLIC_SENTRY_DSN

let sentryClientPromise: Promise<SentryClient> | undefined

function parseSampleRate(value: string | undefined, fallback: number) {
  if (!value) return fallback

  const parsed = Number(value)

  if (!Number.isFinite(parsed)) {
    return fallback
  }

  return Math.min(1, Math.max(0, parsed))
}

function getSentryClient() {
  if (!SENTRY_DSN) {
    return undefined
  }

  sentryClientPromise ??= import('@sentry/nextjs').then((Sentry) => {
    const replaySessionSampleRate = parseSampleRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAY_SESSION_SAMPLE_RATE,
      0,
    )
    const replaysOnErrorSampleRate = parseSampleRate(
      process.env.NEXT_PUBLIC_SENTRY_REPLAY_ERROR_SAMPLE_RATE,
      0,
    )
    const replayEnabled = replaySessionSampleRate > 0 || replaysOnErrorSampleRate > 0

    Sentry.init({
      dsn: SENTRY_DSN,
      tracesSampleRate: parseSampleRate(process.env.NEXT_PUBLIC_SENTRY_TRACES_SAMPLE_RATE, 0.1),
      debug: false,
      ...(replayEnabled
        ? {
            integrations: [
              Sentry.replayIntegration({
                maskAllText: true,
                blockAllMedia: true,
              }),
            ],
            replaysOnErrorSampleRate,
            replaysSessionSampleRate: replaySessionSampleRate,
          }
        : {}),
    })

    return Sentry
  })

  return sentryClientPromise
}

function scheduleSentryInit() {
  if (!SENTRY_DSN || typeof window === 'undefined') {
    return
  }

  const start = () => {
    void getSentryClient()
  }

  if ('requestIdleCallback' in window) {
    window.requestIdleCallback(start, { timeout: 5000 })
    return
  }

  globalThis.setTimeout(start, 5000)
}

scheduleSentryInit()

export const onRouterTransitionStart = ((...args: Parameters<RouterTransitionStart>) => {
  void getSentryClient()?.then((Sentry) => {
    Sentry.captureRouterTransitionStart(...args)
  })
}) as RouterTransitionStart
