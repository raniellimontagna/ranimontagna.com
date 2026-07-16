import type { NextRequest } from 'next/server'
import {
  FALLBACK_MESSAGES,
  RATE_LIMIT_MAX,
  RATE_LIMIT_WINDOW_MS,
  SSE_HEADERS,
} from './chat.constants'
import { CHAT_PROFILE_BY_LOCALE } from './chat.profile'
import {
  buildSystemPrompt,
  buildUntrustedUserContent,
  createChatRuntimeContext,
} from './chat.prompt'
import {
  createChatExecutionContext,
  createChatProviderAdapters,
  createChatProviderConfig,
  getChatInterruptionCategory,
  type ProviderAdapter,
} from './chat.providers'
import {
  buildCorrectionSystemPrompt,
  buildTextStream,
  type ChatValidationCode,
  collectProviderAnswer,
  validateChatAnswer,
} from './chat.response'
import { requestSchema } from './chat.schema'
import { checkRateLimit, getRateLimitIdentifier } from './chat.utils'

const MAX_REQUEST_BODY_BYTES = 8 * 1024

type BoundedJsonResult =
  | { status: 'ok'; value: unknown }
  | { status: 'invalid' }
  | { status: 'too-large' }

type ChatRouteState =
  | { kind: 'provider'; index: number }
  | { kind: 'correction'; code: ChatValidationCode }
  | { kind: 'answer'; text: string }
  | { kind: 'fallback' }
  | { kind: 'cancelled' }

const chainableCollectionFailures = new Set([
  'empty',
  'incomplete',
  'malformed',
  'provider-error',
] as const)

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

    const providerConfig = createChatProviderConfig(process.env)
    const execution = createChatExecutionContext(request.signal, providerConfig.totalDeadlineMs)
    const adapters = createChatProviderAdapters(providerConfig, {
      environment: process.env,
      fetch: globalThis.fetch,
    })
    const providers = [
      adapters.callDeepSeek,
      adapters.callGemini,
      adapters.callOpenRouter,
      adapters.callGroq,
    ] satisfies readonly ProviderAdapter[]

    const validationInput = (answer: string) => ({
      answer,
      locale,
      profile: CHAT_PROFILE_BY_LOCALE[locale],
      runtime,
      visitorMessage: message,
    })
    const staticFallback = FALLBACK_MESSAGES[locale] ?? FALLBACK_MESSAGES.pt
    let state: ChatRouteState = { kind: 'provider', index: 0 }

    while (true) {
      if (state.kind === 'cancelled') return new Response(null, { status: 499 })

      if (state.kind === 'fallback') {
        if (getChatInterruptionCategory(execution) === 'cancelled') {
          return new Response(null, { status: 499 })
        }
        return new Response(buildTextStream(staticFallback), { headers: SSE_HEADERS })
      }

      if (state.kind === 'answer') {
        const interrupted = getChatInterruptionCategory(execution)
        if (interrupted === 'cancelled') {
          state = { kind: 'cancelled' }
          continue
        }
        if (interrupted === 'timeout') {
          state = { kind: 'fallback' }
          continue
        }
        return new Response(buildTextStream(state.text), { headers: SSE_HEADERS })
      }

      if (state.kind === 'correction') {
        const interrupted = getChatInterruptionCategory(execution)
        if (interrupted === 'cancelled') {
          state = { kind: 'cancelled' }
          continue
        }
        if (interrupted === 'timeout') {
          state = { kind: 'fallback' }
          continue
        }

        const correctionResult = await adapters.callDeepSeek({
          execution,
          systemPrompt: buildCorrectionSystemPrompt(systemPrompt, state.code),
          userContent,
        })
        if (!correctionResult.ok) {
          state =
            correctionResult.category === 'cancelled' ? { kind: 'cancelled' } : { kind: 'fallback' }
          continue
        }

        const correctionAnswer = await collectProviderAnswer(correctionResult.attempt, execution)
        if (!correctionAnswer.ok) {
          state =
            correctionAnswer.code === 'cancelled' ? { kind: 'cancelled' } : { kind: 'fallback' }
          continue
        }

        const correctionValidation = validateChatAnswer(validationInput(correctionAnswer.text))
        state = correctionValidation.ok
          ? { kind: 'answer', text: correctionAnswer.text }
          : { kind: 'fallback' }
        continue
      }

      const interrupted = getChatInterruptionCategory(execution)
      if (interrupted === 'cancelled') {
        state = { kind: 'cancelled' }
        continue
      }
      if (interrupted === 'timeout' || state.index >= providers.length) {
        state = { kind: 'fallback' }
        continue
      }

      const provider = providers[state.index]
      const result = await provider({ execution, systemPrompt, userContent })
      if (!result.ok) {
        if (result.category === 'cancelled') {
          state = { kind: 'cancelled' }
        } else if (result.category === 'timeout' || !result.chainable) {
          state = { kind: 'fallback' }
        } else {
          state = { kind: 'provider', index: state.index + 1 }
        }
        continue
      }

      const collected = await collectProviderAnswer(result.attempt, execution)
      if (!collected.ok) {
        if (collected.code === 'cancelled') {
          state = { kind: 'cancelled' }
        } else if (collected.code === 'timeout' || collected.code === 'safety') {
          state = { kind: 'fallback' }
        } else if (collected.code === 'response-too-large') {
          state = { kind: 'correction', code: 'answer-too-large' }
        } else if (chainableCollectionFailures.has(collected.code)) {
          state = { kind: 'provider', index: state.index + 1 }
        } else {
          state = { kind: 'fallback' }
        }
        continue
      }

      const validation = validateChatAnswer(validationInput(collected.text))
      state = validation.ok
        ? { kind: 'answer', text: collected.text }
        : { kind: 'correction', code: validation.code }
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
