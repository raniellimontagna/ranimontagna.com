import { createHash } from 'node:crypto'

export interface RateLimitOptions {
  identifier: string
  keyPrefix: string
  max: number
  windowMs: number
}

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  source: 'memory' | 'upstash'
}

interface UpstashConfig {
  url: string
  token: string
}

type UpstashResult = {
  result?: number | string | null
  error?: string
}

const RATE_LIMIT_UPSTASH_PATH = '/pipeline'
const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const getUpstashConfig = (): UpstashConfig | null => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) {
    return null
  }

  return { url, token }
}

const sanitizeForwardedIp = (value: string | null): string | null => {
  if (!value) {
    return null
  }

  const firstIp = value.split(',')[0]?.trim()
  if (!firstIp || firstIp.toLowerCase() === 'unknown') {
    return null
  }

  return firstIp
}

const createAnonymousFingerprint = (headers: Headers): string => {
  const userAgent = headers.get('user-agent')?.trim() || 'unknown'
  const acceptLanguage = headers.get('accept-language')?.trim() || 'unknown'
  const host = headers.get('host')?.trim() || 'unknown'

  return createHash('sha256')
    .update(`${userAgent}|${acceptLanguage}|${host}`)
    .digest('hex')
    .slice(0, 24)
}

export const getRateLimitIdentifier = (headers: Headers): string => {
  const candidates = [
    headers.get('cf-connecting-ip'),
    headers.get('x-forwarded-for'),
    headers.get('x-real-ip'),
    headers.get('true-client-ip'),
  ]

  for (const candidate of candidates) {
    const ip = sanitizeForwardedIp(candidate)
    if (ip) {
      return `ip:${ip}`
    }
  }

  return `anon:${createAnonymousFingerprint(headers)}`
}

const parseUpstashResult = (entry: UpstashResult, label: string): number => {
  if (entry.error) {
    throw new Error(`Upstash ${label} failed: ${entry.error}`)
  }

  const value = Number(entry.result)
  if (!Number.isFinite(value)) {
    throw new Error(`Upstash ${label} returned an invalid result`)
  }

  return value
}

const callUpstashPipeline = async (
  config: UpstashConfig,
  commands: Array<Array<string | number>>,
): Promise<UpstashResult[]> => {
  const response = await fetch(`${config.url}${RATE_LIMIT_UPSTASH_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`Upstash pipeline request failed with HTTP ${response.status}: ${errorBody}`)
  }

  const payload = (await response.json()) as UpstashResult[]
  if (!Array.isArray(payload)) {
    throw new Error('Upstash pipeline response is not an array')
  }

  return payload
}

const checkUpstashRateLimit = async (
  options: RateLimitOptions,
  config: UpstashConfig,
): Promise<RateLimitResult> => {
  const key = `${options.keyPrefix}:${options.identifier}`
  const now = Date.now()

  const [incrementResult, ttlResult] = await callUpstashPipeline(config, [
    ['INCR', key],
    ['PTTL', key],
  ])

  const count = parseUpstashResult(incrementResult, 'INCR')
  let ttl = parseUpstashResult(ttlResult, 'PTTL')

  if (ttl < 0) {
    const [expireResult] = await callUpstashPipeline(config, [['PEXPIRE', key, options.windowMs]])
    parseUpstashResult(expireResult, 'PEXPIRE')
    ttl = options.windowMs
  }

  return {
    allowed: count <= options.max,
    remaining: Math.max(0, options.max - count),
    resetAt: now + ttl,
    source: 'upstash',
  }
}

const checkMemoryRateLimit = (options: RateLimitOptions): RateLimitResult => {
  const key = `${options.keyPrefix}:${options.identifier}`
  const now = Date.now()
  const entry = rateLimitMap.get(key)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + options.windowMs
    rateLimitMap.set(key, { count: 1, resetAt })

    return {
      allowed: true,
      remaining: options.max - 1,
      resetAt,
      source: 'memory',
    }
  }

  entry.count++

  return {
    allowed: entry.count <= options.max,
    remaining: Math.max(0, options.max - entry.count),
    resetAt: entry.resetAt,
    source: 'memory',
  }
}

export const checkRateLimit = async (options: RateLimitOptions): Promise<RateLimitResult> => {
  const upstashConfig = getUpstashConfig()

  if (upstashConfig) {
    try {
      return await checkUpstashRateLimit(options, upstashConfig)
    } catch (error) {
      console.error('Persistent rate limit failed, falling back to memory storage:', error)
    }
  }

  return checkMemoryRateLimit(options)
}

export const resetRateLimitStateForTests = (): void => {
  rateLimitMap.clear()
}
