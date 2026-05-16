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
  async delete(_key: string): Promise<void> {},
  async acquireLock(_key: string, _ttlMs: number): Promise<boolean> {
    return false
  },
  async releaseLock(_key: string): Promise<void> {},
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
        ['SET', key, JSON.stringify(envelope), 'EX', Math.max(1, ttlSeconds)],
      ])
    } catch (error) {
      logCacheWarning(`cache write failed for key=${key}`, error)
    }
  },
  async delete(key: string): Promise<void> {
    try {
      await callUpstashPipeline(config, [['DEL', key]])
    } catch (error) {
      logCacheWarning(`cache delete failed for key=${key}`, error)
    }
  },
  async acquireLock(key: string, ttlMs: number): Promise<boolean> {
    try {
      const [entry] = await callUpstashPipeline(config, [['SET', key, '1', 'PX', ttlMs, 'NX']])
      return parsePipelineResult(entry, 'SET lock') === 'OK'
    } catch (error) {
      logCacheWarning(`lock acquire failed for key=${key}`, error)
      return false
    }
  },
  async releaseLock(key: string): Promise<void> {
    try {
      await callUpstashPipeline(config, [['DEL', key]])
    } catch (error) {
      logCacheWarning(`lock release failed for key=${key}`, error)
    }
  },
  async getNamespaceVersion(scope: string): Promise<string> {
    const namespaceKey = `${BLOG_CACHE_PREFIX}:namespace:${scope}`

    try {
      const [entry] = await callUpstashPipeline(config, [['GET', namespaceKey]])
      const result = parsePipelineResult(entry, 'GET namespace')
      return typeof result === 'string' && result.length > 0 ? result : '1'
    } catch (error) {
      logCacheWarning(`namespace read failed for scope=${scope}`, error)
      return '1'
    }
  },
  async bumpNamespaceVersion(scope: string): Promise<string> {
    const namespaceKey = `${BLOG_CACHE_PREFIX}:namespace:${scope}`

    try {
      const [entry] = await callUpstashPipeline(config, [['INCR', namespaceKey]])
      const result = Number(parsePipelineResult(entry, 'INCR namespace'))
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
