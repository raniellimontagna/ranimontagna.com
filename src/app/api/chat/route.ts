import * as Sentry from '@sentry/nextjs'
import type { NextRequest } from 'next/server'
import {
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  SSE_HEADERS,
  SYSTEM_PROMPT_EN,
  SYSTEM_PROMPT_ES,
  SYSTEM_PROMPT_PT,
} from './chat.constants'
import { requestSchema } from './chat.schema'
import {
  buildFallbackStream,
  buildGeminiStream,
  buildOpenRouterStream,
  callGemini,
  callGroq,
  callOpenRouter,
  checkRateLimit,
  getRateLimitIdentifier,
} from './chat.utils'

const getSystemPrompt = (locale: string): string => {
  switch (locale) {
    case 'en':
      return SYSTEM_PROMPT_EN
    case 'es':
      return SYSTEM_PROMPT_ES
    default:
      return SYSTEM_PROMPT_PT
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

    const body = await request.json()
    const parsed = requestSchema.safeParse(body)

    if (!parsed.success) {
      return Response.json(
        { error: 'Invalid request', details: parsed.error.flatten() },
        { status: 400 },
      )
    }

    const { messages, locale } = parsed.data
    const systemPrompt = getSystemPrompt(locale)

    // Provider chain: Gemini → OpenRouter → Groq → Graceful fallback
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
