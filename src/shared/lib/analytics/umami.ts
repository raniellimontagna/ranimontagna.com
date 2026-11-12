/**
 * Umami, self-hosted on the personal Dokploy (analytics.ranimontagna.com): cookieless page
 * analytics, so no consent banner. The website id is public by design (it ships in the HTML).
 */
const UMAMI_ORIGIN = 'https://analytics.ranimontagna.com'
export const UMAMI_SCRIPT_SRC = `${UMAMI_ORIGIN}/script.js`

const DEFAULT_WEBSITE_ID = '09b5f34d-4053-43c5-9a7c-849f08d43b73'

/** Only these hosts report, so local runs and previews never count as visits. */
export const UMAMI_DOMAINS = 'ranimontagna.com,www.ranimontagna.com'

type Env = Record<string, string | undefined>

/** The website id to report to, or null when analytics is off for this deployment. */
export function getUmamiWebsiteId(env: Env, indexingDisabled: boolean): string | null {
  if (indexingDisabled) return null
  const configured = env.NEXT_PUBLIC_UMAMI_WEBSITE_ID?.trim()
  if (configured === 'off') return null
  return configured || DEFAULT_WEBSITE_ID
}
