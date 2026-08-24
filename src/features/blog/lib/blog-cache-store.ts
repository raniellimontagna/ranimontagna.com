import type { BlogCacheStore, CacheEnvelope } from './blog.types'

interface UpstashConfig {
  url: string
  token: string
}

interface UpstashPipelineResult {
  result?: unknown
  error?: string
}

const BLOG_CACHE_PREFIX = 'blog-cache'
const UPSTASH_PIPELINE_PATH = '/pipeline'
const RENEW_LOCK_SCRIPT =
  "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('PEXPIRE', KEYS[1], ARGV[2]) end return 0"
const RELEASE_LOCK_SCRIPT =
  "if redis.call('GET', KEYS[1]) == ARGV[1] then return redis.call('DEL', KEYS[1]) end return 0"
const SET_IF_LOCK_OWNED_SCRIPT =
  "if redis.call('GET', KEYS[1]) == ARGV[1] then redis.call('SET', KEYS[2], ARGV[2], 'EX', ARGV[3]); return 1 end return 0"
const GET_OR_INITIALIZE_NAMESPACE_SCRIPT =
  "local current = redis.call('GET', KEYS[1]); if current then return current end; redis.call('SET', KEYS[1], '1'); return '1'"
const BUMP_NAMESPACE_SCRIPT =
  "local current = redis.call('GET', KEYS[1]); if not current then redis.call('SET', KEYS[1], '2'); return 2 end; return redis.call('INCR', KEYS[1])"

let storeInstance: BlogCacheStore | null = null

const logCacheWarning = (message: string, error?: unknown): void => {
  if (error) {
    console.warn(`${BLOG_CACHE_PREFIX} ${message}`, error)
    return
  }

  console.warn(`${BLOG_CACHE_PREFIX} ${message}`)
}

const getUpstashConfig = (): UpstashConfig | null => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) {
    return null
  }

  return { url, token }
}

const isCacheEnvelope = <T>(value: unknown): value is CacheEnvelope<T> => {
  if (!value || typeof value !== 'object') return false

  const maybeEnvelope = value as CacheEnvelope<T>
  return (
    'value' in maybeEnvelope &&
    typeof maybeEnvelope.freshUntil === 'number' &&
    typeof maybeEnvelope.staleUntil === 'number' &&
    typeof maybeEnvelope.cachedAt === 'number' &&
    typeof maybeEnvelope.version === 'number'
  )
}

const parsePipelineResult = (entry: UpstashPipelineResult, label: string): unknown => {
  if (entry.error) {
    throw new Error(`${label} failed: ${entry.error}`)
  }

  return entry.result ?? null
}

const normalizeLockTtlMs = (ttlMs: number): number => Math.max(1, Math.ceil(ttlMs))
const normalizeCacheTtlSeconds = (ttlSeconds: number): number => Math.max(1, Math.ceil(ttlSeconds))

const callUpstashPipeline = async (
  config: UpstashConfig,
  commands: Array<Array<string | number>>,
): Promise<UpstashPipelineResult[]> => {
  const response = await fetch(`${config.url}${UPSTASH_PIPELINE_PATH}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(commands),
  })

  if (!response.ok) {
    const errorBody = await response.text()
    throw new Error(`pipeline HTTP ${response.status}: ${errorBody}`)
  }

  const payload = (await response.json()) as UpstashPipelineResult[]
  if (!Array.isArray(payload)) {
    throw new Error('pipeline response is not an array')
  }

  return payload
}

const createNoopBlogCacheStore = (): BlogCacheStore => ({
  supportsLocks: false,
  async get<T>(_key: string): Promise<CacheEnvelope<T> | null> {
    return null
  },
  async set<T>(_key: string, _envelope: CacheEnvelope<T>, _ttlSeconds: number): Promise<void> {},
  async setIfLockOwned<T>(
    _lockKey: string,
    _token: string,
    _key: string,
    _envelope: CacheEnvelope<T>,
    _ttlSeconds: number,
  ): Promise<boolean> {
    return false
  },
  async delete(_key: string): Promise<void> {},
  async acquireLock(_key: string, _ttlMs: number): Promise<string | null> {
    return null
  },
  async renewLock(_key: string, _token: string, _ttlMs: number): Promise<boolean> {
    return false
  },
  async releaseLock(_key: string, _token: string): Promise<boolean> {
    return false
  },
  async getNamespaceVersion(_scope: string): Promise<string> {
    return '1'
  },
  async bumpNamespaceVersion(_scope: string): Promise<string> {
    return '1'
  },
})

const createRedisBlogCacheStore = (config: UpstashConfig): BlogCacheStore => ({
  supportsLocks: true,
  async get<T>(key: string): Promise<CacheEnvelope<T> | null> {
    try {
      const [entry] = await callUpstashPipeline(config, [['GET', key]])
      const rawValue = parsePipelineResult(entry, 'GET')
      if (typeof rawValue !== 'string' || rawValue.length === 0) {
        return null
      }

      const parsedValue = JSON.parse(rawValue) as unknown
      if (!isCacheEnvelope<T>(parsedValue)) {
        logCacheWarning(`invalid cache envelope for key=${key}`)
        return null
      }

      return parsedValue
    } catch (error) {
      logCacheWarning(`cache read failed for key=${key}`, error)
      return null
    }
  },
  async set<T>(key: string, envelope: CacheEnvelope<T>, ttlSeconds: number): Promise<void> {
    try {
      await callUpstashPipeline(config, [
        ['SET', key, JSON.stringify(envelope), 'EX', normalizeCacheTtlSeconds(ttlSeconds)],
      ])
    } catch (error) {
      logCacheWarning(`cache write failed for key=${key}`, error)
    }
  },
  async setIfLockOwned<T>(
    lockKey: string,
    token: string,
    key: string,
    envelope: CacheEnvelope<T>,
    ttlSeconds: number,
  ): Promise<boolean> {
    try {
      const [entry] = await callUpstashPipeline(config, [
        [
          'EVAL',
          SET_IF_LOCK_OWNED_SCRIPT,
          2,
          lockKey,
          key,
          token,
          JSON.stringify(envelope),
          normalizeCacheTtlSeconds(ttlSeconds),
        ],
      ])
      return Number(parsePipelineResult(entry, 'EVAL fenced cache write')) === 1
    } catch (error) {
      logCacheWarning(`fenced cache write failed for key=${key}`, error)
      return false
    }
  },
  async delete(key: string): Promise<void> {
    try {
      await callUpstashPipeline(config, [['DEL', key]])
    } catch (error) {
      logCacheWarning(`cache delete failed for key=${key}`, error)
    }
  },
  async acquireLock(key: string, ttlMs: number): Promise<string | null> {
    const token = globalThis.crypto.randomUUID()
    try {
      const [entry] = await callUpstashPipeline(config, [
        ['SET', key, token, 'PX', normalizeLockTtlMs(ttlMs), 'NX'],
      ])
      return parsePipelineResult(entry, 'SET lock') === 'OK' ? token : null
    } catch (error) {
      logCacheWarning(`lock acquire failed for key=${key}`, error)
      return null
    }
  },
  async renewLock(key: string, token: string, ttlMs: number): Promise<boolean> {
    try {
      const [entry] = await callUpstashPipeline(config, [
        ['EVAL', RENEW_LOCK_SCRIPT, 1, key, token, normalizeLockTtlMs(ttlMs)],
      ])
      return Number(parsePipelineResult(entry, 'EVAL renew lock')) === 1
    } catch (error) {
      logCacheWarning(`lock renew failed for key=${key}`, error)
      return false
    }
  },
  async releaseLock(key: string, token: string): Promise<boolean> {
    try {
      const [entry] = await callUpstashPipeline(config, [
        ['EVAL', RELEASE_LOCK_SCRIPT, 1, key, token],
      ])
      return Number(parsePipelineResult(entry, 'EVAL release lock')) === 1
    } catch (error) {
      logCacheWarning(`lock release failed for key=${key}`, error)
      return false
    }
  },
  async getNamespaceVersion(scope: string): Promise<string> {
    const namespaceKey = `${BLOG_CACHE_PREFIX}:namespace:${scope}`

    try {
      const [entry] = await callUpstashPipeline(config, [
        ['EVAL', GET_OR_INITIALIZE_NAMESPACE_SCRIPT, 1, namespaceKey],
      ])
      const result = parsePipelineResult(entry, 'EVAL get namespace')
      return typeof result === 'string' && result.length > 0 ? result : '1'
    } catch (error) {
      logCacheWarning(`namespace read failed for scope=${scope}`, error)
      return '1'
    }
  },
  async bumpNamespaceVersion(scope: string): Promise<string> {
    const namespaceKey = `${BLOG_CACHE_PREFIX}:namespace:${scope}`

    try {
      const [entry] = await callUpstashPipeline(config, [
        ['EVAL', BUMP_NAMESPACE_SCRIPT, 1, namespaceKey],
      ])
      const result = Number(parsePipelineResult(entry, 'EVAL bump namespace'))
      return Number.isFinite(result) ? String(result) : '1'
    } catch (error) {
      logCacheWarning(`namespace bump failed for scope=${scope}`, error)
      return '1'
    }
  },
})

export const createBlogCacheStore = (): BlogCacheStore => {
  if (storeInstance) {
    return storeInstance
  }

  const config = getUpstashConfig()
  storeInstance = config ? createRedisBlogCacheStore(config) : createNoopBlogCacheStore()
  return storeInstance
}

export const resetBlogCacheStateForTests = (): void => {
  storeInstance = null
}
