import type { Metadata } from 'next'

type Env = Record<string, string | undefined>

/** Preview deployments set SITE_NOINDEX=1 so search engines never index them. */
export function isIndexingDisabled(env: Env = process.env): boolean {
  return env.SITE_NOINDEX === '1'
}

export function robotsMetadata(disabled: boolean): Metadata['robots'] {
  if (disabled) {
    return { index: false, follow: false, googleBot: { index: false, follow: false } }
  }

  return {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  }
}

export function withNoindexHeader<T extends Response>(response: T, disabled: boolean): T {
  if (disabled) response.headers.set('X-Robots-Tag', 'noindex, nofollow')
  return response
}
