type JsonBodyResult =
  | { status: 'ok'; value: unknown }
  | { status: 'invalid' }
  | { status: 'too-large' }

const LOOPBACK_HOSTNAMES = new Set(['127.0.0.1', '::1', 'localhost'])

const normalizeOrigin = (value: string | undefined): string | null => {
  if (!value?.trim()) return null

  const candidate = value.includes('://') ? value : `https://${value}`
  try {
    return new URL(candidate).origin
  } catch {
    return null
  }
}

const getRequestOrigin = (request: Pick<Request, 'url'>): string | null => {
  try {
    return new URL(request.url).origin
  } catch {
    return null
  }
}

const isDevelopmentLoopbackPair = (origin: string, requestOrigin: string): boolean => {
  if (process.env.NODE_ENV === 'production') return false

  try {
    const source = new URL(origin)
    const target = new URL(requestOrigin)
    return LOOPBACK_HOSTNAMES.has(source.hostname) && LOOPBACK_HOSTNAMES.has(target.hostname)
  } catch {
    return false
  }
}

export const isTrustedBrowserRequest = (
  request: Pick<Request, 'headers' | 'url'>,
): boolean => {
  const fetchSite = request.headers.get('sec-fetch-site')?.trim().toLowerCase()
  if (fetchSite === 'cross-site') return false

  const origin = normalizeOrigin(request.headers.get('origin') ?? undefined)
  if (!origin) return request.headers.get('origin') === null

  const requestOrigin = getRequestOrigin(request)
  if (requestOrigin && (origin === requestOrigin || isDevelopmentLoopbackPair(origin, requestOrigin))) {
    return true
  }

  const configuredOrigins = [
    normalizeOrigin(process.env.SITE_URL),
    normalizeOrigin(process.env.NEXT_PUBLIC_SITE_URL),
    normalizeOrigin(process.env.VERCEL_PROJECT_PRODUCTION_URL),
  ]

  return configuredOrigins.includes(origin)
}

export const readBoundedJsonBody = async (
  request: Pick<Request, 'body'>,
  maxBytes: number,
): Promise<JsonBodyResult> => {
  const reader = request.body?.getReader()
  if (!reader || !Number.isSafeInteger(maxBytes) || maxBytes <= 0) {
    return { status: 'invalid' }
  }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      totalBytes += value.byteLength
      if (totalBytes > maxBytes) {
        await reader.cancel().catch(() => undefined)
        return { status: 'too-large' }
      }

      chunks.push(value)
    }

    const bodyBytes = new Uint8Array(totalBytes)
    let offset = 0
    for (const chunk of chunks) {
      bodyBytes.set(chunk, offset)
      offset += chunk.byteLength
    }

    const bodyText = new TextDecoder('utf-8', { fatal: true }).decode(bodyBytes)
    return { status: 'ok', value: JSON.parse(bodyText) }
  } catch {
    return { status: 'invalid' }
  } finally {
    reader.releaseLock()
  }
}

export type { JsonBodyResult }
