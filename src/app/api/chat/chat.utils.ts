import { createHash } from 'node:crypto'
import {
  CHAT_PROVIDER_TIMEOUT_MS,
  FALLBACK_MESSAGES,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
} from './chat.constants'
import type { GeminiContent, OpenRouterMessage, ParsedRequest } from './chat.schema'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()
const RATE_LIMIT_KEY_PREFIX = 'chat:rate-limit'
const RATE_LIMIT_UPSTASH_PATH = '/pipeline'

type RateLimitSource = 'memory' | 'upstash'

export interface RateLimitResult {
  allowed: boolean
  remaining: number
  resetAt: number
  source: RateLimitSource
}

interface UpstashConfig {
  url: string
  token: string
}

type UpstashResult = {
  result?: number | string | null
  error?: string
}

const getUpstashConfig = (): UpstashConfig | null => {
  const url = process.env.UPSTASH_REDIS_REST_URL?.trim()
  const token = process.env.UPSTASH_REDIS_REST_TOKEN?.trim()

  if (!url || !token) {
    return null
  }

  return { url, token }
}

const getRateLimitStoragePrefix = (): string => {
  const prefix = process.env.CHAT_RATE_LIMIT_PREFIX?.trim()
  return prefix || RATE_LIMIT_KEY_PREFIX
}

const getRateLimitKey = (identifier: string): string => {
  return `${getRateLimitStoragePrefix()}:${identifier}`
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
  identifier: string,
  config: UpstashConfig,
): Promise<RateLimitResult> => {
  const key = getRateLimitKey(identifier)
  const now = Date.now()

  const [incrementResult, ttlResult] = await callUpstashPipeline(config, [
    ['INCR', key],
    ['PTTL', key],
  ])

  const count = parseUpstashResult(incrementResult, 'INCR')
  let ttl = parseUpstashResult(ttlResult, 'PTTL')

  if (ttl < 0) {
    const [expireResult] = await callUpstashPipeline(config, [
      ['PEXPIRE', key, RATE_LIMIT_WINDOW_MS],
    ])
    parseUpstashResult(expireResult, 'PEXPIRE')
    ttl = RATE_LIMIT_WINDOW_MS
  }

  return {
    allowed: count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - count),
    resetAt: now + ttl,
    source: 'upstash',
  }
}

const checkMemoryRateLimit = (identifier: string): RateLimitResult => {
  const now = Date.now()
  const entry = rateLimitMap.get(identifier)

  if (!entry || now > entry.resetAt) {
    const resetAt = now + RATE_LIMIT_WINDOW_MS
    rateLimitMap.set(identifier, { count: 1, resetAt })

    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt,
      source: 'memory',
    }
  }

  entry.count++

  return {
    allowed: entry.count <= RATE_LIMIT_MAX,
    remaining: Math.max(0, RATE_LIMIT_MAX - entry.count),
    resetAt: entry.resetAt,
    source: 'memory',
  }
}

const hasTimeoutCode = (value: unknown): boolean => {
  if (!value || typeof value !== 'object') return false

  const maybeCode = (value as { code?: unknown }).code
  if (
    typeof maybeCode === 'string' &&
    ['ETIMEDOUT', 'UND_ERR_CONNECT_TIMEOUT', 'ECONNABORTED'].includes(maybeCode)
  ) {
    return true
  }

  const maybeErrors = (value as { errors?: unknown }).errors
  if (Array.isArray(maybeErrors) && maybeErrors.some((error) => hasTimeoutCode(error))) {
    return true
  }

  const maybeCause = (value as { cause?: unknown }).cause
  return hasTimeoutCode(maybeCause)
}

const isTimeoutError = (error: unknown): boolean => {
  if (!(error instanceof Error)) return false

  if (error.name === 'AbortError') return true
  if (/timeout|timed out|etimedout/i.test(error.message)) return true

  return hasTimeoutCode(error)
}

const fetchWithTimeout = async (url: string, init: RequestInit): Promise<Response> => {
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), CHAT_PROVIDER_TIMEOUT_MS)

  try {
    return await fetch(url, { ...init, signal: controller.signal })
  } finally {
    clearTimeout(timeoutId)
  }
}

export const checkRateLimit = async (identifier: string): Promise<RateLimitResult> => {
  const upstashConfig = getUpstashConfig()

  if (upstashConfig) {
    try {
      return await checkUpstashRateLimit(identifier, upstashConfig)
    } catch (error) {
      console.error('Persistent chat rate limit failed, falling back to memory storage:', error)
    }
  }

  return checkMemoryRateLimit(identifier)
}

export const resetRateLimitStateForTests = (): void => {
  rateLimitMap.clear()
}

export const callGemini = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const contents: GeminiContent[] = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Gemini API error:', errorBody)
      return null
    }

    return response
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn(`Gemini request timed out after ${CHAT_PROVIDER_TIMEOUT_MS}ms`)
      return null
    }

    console.error('Gemini call failed:', error)
    return null
  }
}

export const callOpenRouter = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  try {
    const openRouterModels = [
      process.env.OPENROUTER_MODEL_PRIMARY ?? 'google/gemma-3-4b-it:free',
      process.env.OPENROUTER_MODEL_FALLBACK ?? 'openrouter/auto',
    ]

    const promptAsUserContext = [
      'Use these instructions as your operating policy for this conversation:',
      systemPrompt,
    ].join('\n\n')

    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'user', content: promptAsUserContext },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    for (const model of openRouterModels) {
      try {
        const response = await fetchWithTimeout('https://openrouter.ai/api/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${apiKey}`,
            'HTTP-Referer': 'https://ranimontagna.com',
            'X-Title': 'Rani Digital',
          },
          body: JSON.stringify({
            model,
            messages: openRouterMessages,
            stream: true,
            max_tokens: 1024,
            temperature: 0.7,
          }),
        })

        if (response.ok) {
          return response
        }

        const errorBody = await response.text()
        console.error(`OpenRouter API error (${model}):`, errorBody)
      } catch (error) {
        if (isTimeoutError(error)) {
          console.warn(
            `OpenRouter request timed out after ${CHAT_PROVIDER_TIMEOUT_MS}ms (${model})`,
          )
          continue
        }

        console.error(`OpenRouter call failed (${model}):`, error)
      }
    }

    return null
  } catch (error) {
    console.error('OpenRouter call failed:', error)
    return null
  }
}

export const callGroq = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  try {
    const model = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant'

    const groqMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    const response = await fetchWithTimeout('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Groq API error (${model}):`, errorBody)
      return null
    }

    return response
  } catch (error) {
    if (isTimeoutError(error)) {
      console.warn(`Groq request timed out after ${CHAT_PROVIDER_TIMEOUT_MS}ms`)
      return null
    }

    console.error('Groq call failed:', error)
    return null
  }
}

export const buildGeminiStream = (response: Response): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (buffer.trim()) {
              processLine(buffer)
            }
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            processLine(line)
          }
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

export const buildOpenRouterStream = (response: Response): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.choices?.[0]?.delta?.content
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          // Skip malformed JSON chunks
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (buffer.trim()) {
              processLine(buffer)
            }
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) {
            processLine(line)
          }
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

export const buildFallbackStream = (locale: string): ReadableStream => {
  const message = FALLBACK_MESSAGES[locale] ?? FALLBACK_MESSAGES.pt

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: message })}\n\n`))
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}
