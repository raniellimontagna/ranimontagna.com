import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'
import { RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS, SSE_HEADERS } from './chat.constants'
import {
  buildSystemPrompt,
  buildUntrustedUserContent,
  createChatRuntimeContext,
} from './chat.prompt'
import { requestSchema } from './chat.schema'
import {
  buildFallbackStream,
  buildGeminiStream,
  buildOpenRouterStream,
  callDeepSeek,
  callGemini,
  callGroq,
  callOpenRouter,
  checkRateLimit,
  getRateLimitIdentifier,
} from './chat.utils'

const MAX_REQUEST_BODY_BYTES = 8 * 1024

type BoundedJsonResult =
  | { status: 'ok'; value: unknown }
  | { status: 'invalid' }
  | { status: 'too-large' }

async function readBoundedJsonBody(request: NextRequest): Promise<BoundedJsonResult> {
  const reader = request.body?.getReader()
  if (!reader) return { status: 'invalid' }

  const chunks: Uint8Array[] = []
  let totalBytes = 0

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      if (totalBytes + value.byteLength > MAX_REQUEST_BODY_BYTES) {
        await reader.cancel().catch(() => undefined)
        return { status: 'too-large' }
      }

      chunks.push(value)
      totalBytes += value.byteLength
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

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const rateLimitIdentifier = getRateLimitIdentifier(request.headers)
    const rateLimit = await checkRateLimit({
      identifier: rateLimitIdentifier,
      keyPrefix: process.env.CHAT_RATE_LIMIT_PREFIX?.trim() || 'chat:rate-limit',
      max: RATE_LIMIT_MAX,
      windowMs: RATE_LIMIT_WINDOW_MS,
    })

    if (!rateLimit.allowed) {
      const retryAfterSeconds = Math.max(1, Math.ceil((rateLimit.resetAt - Date.now()) / 1000))

      return Response.json(
        {
          error: 'Rate limit exceeded. Try again in a minute.',
          retryAfterSeconds,
        },
        {
          status: 429,
          headers: {
            'Retry-After': retryAfterSeconds.toString(),
            'X-RateLimit-Limit': RATE_LIMIT_MAX.toString(),
            'X-RateLimit-Remaining': rateLimit.remaining.toString(),
            'X-RateLimit-Reset': rateLimit.resetAt.toString(),
            'X-RateLimit-Source': rateLimit.source,
          },
        },
      )
    }

    const bodyResult = await readBoundedJsonBody(request)
    if (bodyResult.status === 'too-large') {
      return Response.json({ error: 'Request body too large' }, { status: 413 })
    }

    if (bodyResult.status === 'invalid') {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const parsed = requestSchema.safeParse(bodyResult.value)

    if (!parsed.success) {
      return Response.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { locale, message, previousQuestions } = parsed.data
    const runtime = createChatRuntimeContext()
    const systemPrompt = buildSystemPrompt(locale, runtime)
    const userContent = buildUntrustedUserContent(message, previousQuestions)
    const messages = [{ role: 'user' as const, content: userContent }]

    // Provider chain: DeepSeek → Gemini → OpenRouter → Groq → Graceful fallback
    const deepSeekResponse = await callDeepSeek(systemPrompt, messages)
    if (deepSeekResponse) {
      return new Response(buildOpenRouterStream(deepSeekResponse), { headers: SSE_HEADERS })
    }

    console.warn('DeepSeek unavailable, trying Gemini...')
    const geminiResponse = await callGemini(systemPrompt, messages)
    if (geminiResponse) {
      return new Response(buildGeminiStream(geminiResponse), { headers: SSE_HEADERS })
    }

    console.warn('Gemini unavailable, trying OpenRouter...')
    const openRouterResponse = await callOpenRouter(systemPrompt, messages)
    if (openRouterResponse) {
      return new Response(buildOpenRouterStream(openRouterResponse), { headers: SSE_HEADERS })
    }

    console.warn('OpenRouter unavailable, trying Groq...')
    const groqResponse = await callGroq(systemPrompt, messages)
    if (groqResponse) {
      return new Response(buildOpenRouterStream(groqResponse), { headers: SSE_HEADERS })
    }

    console.warn('All providers unavailable, returning fallback message')
    Sentry.captureMessage('Chat API fallback triggered: all providers unavailable', {
      level: 'warning',
      tags: { feature: 'chatbot' },
      extra: {
        locale,
        hasDeepSeekApiKey: Boolean(process.env.DEEPSEEK_API_KEY),
        hasGeminiApiKey: Boolean(process.env.GEMINI_API_KEY),
        hasOpenRouterApiKey: Boolean(process.env.OPENROUTER_API_KEY),
        hasGroqApiKey: Boolean(process.env.GROQ_API_KEY),
      },
    })
    return new Response(buildFallbackStream(locale), { headers: SSE_HEADERS })
  } catch (error) {
    console.error('Chat API error:', error)
    return Response.json(
      {
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 },
    )
  }
}
