import { isIndexingDisabled } from '../seo/indexing'

type Env = Record<string, string | undefined>

export type SentryBuildInfo = { environment: string; release: string }

const pad = (value: number) => String(value).padStart(2, '0')

/** UTC time as yyyyMMddHHmm, e.g. 202611121430. */
function buildStamp(date: Date): string {
  return [
    date.getUTCFullYear(),
    pad(date.getUTCMonth() + 1),
    pad(date.getUTCDate()),
    pad(date.getUTCHours()),
    pad(date.getUTCMinutes()),
  ].join('')
}

/**
 * The Sentry environment and release of a build. next.config.ts computes them
 * once and hands them to every runtime as NEXT_PUBLIC_SENTRY_ENVIRONMENT and
 * NEXT_PUBLIC_SENTRY_RELEASE. SENTRY_ENVIRONMENT and SENTRY_RELEASE override
 * the defaults; preview builds (SITE_NOINDEX=1) report as `preview`.
 */
export function getSentryBuildInfo(env: Env, version: string, builtAt: Date): SentryBuildInfo {
  const environment =
    env.SENTRY_ENVIRONMENT?.trim() || (isIndexingDisabled(env) ? 'preview' : 'production')
  const release = env.SENTRY_RELEASE?.trim() || `ranimontagna@${version}+${buildStamp(builtAt)}`

  return { environment, release }
}
