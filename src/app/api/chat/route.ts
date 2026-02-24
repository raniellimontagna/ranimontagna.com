import type { NextRequest } from 'next/server'
import { SSE_HEADERS, SYSTEM_PROMPT_EN, SYSTEM_PROMPT_ES, SYSTEM_PROMPT_PT } from './chat.constants'
import { requestSchema } from './chat.schema'
import {
  buildFallbackStream,
  buildGeminiStream,
  buildOpenRouterStream,
  callGemini,
  callOpenRouter,
  checkRateLimit,
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
    const ip =
      request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? 'unknown'

    if (!checkRateLimit(ip)) {
      return Response.json(
        { error: 'Rate limit exceeded. Try again in a minute.' },
        { status: 429 },
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

    // Provider chain: Gemini → OpenRouter → Graceful fallback
    const geminiResponse = await callGemini(systemPrompt, messages)
    if (geminiResponse) {
      return new Response(buildGeminiStream(geminiResponse), { headers: SSE_HEADERS })
    }

    console.warn('Gemini unavailable, trying OpenRouter...')
    const openRouterResponse = await callOpenRouter(systemPrompt, messages)
    if (openRouterResponse) {
      return new Response(buildOpenRouterStream(openRouterResponse), { headers: SSE_HEADERS })
    }

    console.warn('All providers unavailable, returning fallback message')
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
