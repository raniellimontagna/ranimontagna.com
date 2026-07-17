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
import { type ChatTelemetryFailureCategory, recordChatAttempt } from './chat.telemetry'
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
  | {
      kind: 'fallback'
      failureCategory: ChatTelemetryFailureCategory
      validationCode: ChatValidationCode | null
    }
  | { kind: 'cancelled' }

const chainableCollectionFailures = new Set([
  'empty',
  'incomplete',
  'malformed',
  'provider-error',
] as const)

const fallbackState = (
  failureCategory: ChatTelemetryFailureCategory,
  validationCode: ChatValidationCode | null = null,
): ChatRouteState => ({ kind: 'fallback', failureCategory, validationCode })

const elapsedSince = (startedAt: number): number => Math.max(0, Date.now() - startedAt)

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
    const traceId = crypto.randomUUID()
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
        recordChatAttempt({
          answerLength: staticFallback.length,
          durationMs: elapsedSince(execution.startedAt),
          failureCategory: state.failureCategory,
          fallbackActivated: true,
          finishReason: null,
          firstByteMs: null,
          kind: 'safe-fallback',
          result: 'safe-fallback',
          traceId,
          validationCode: state.validationCode,
        })
        return new Response(buildTextStream(staticFallback), { headers: SSE_HEADERS })
      }

      if (state.kind === 'answer') {
        const interrupted = getChatInterruptionCategory(execution)
        if (interrupted === 'cancelled') {
          state = { kind: 'cancelled' }
          continue
        }
        if (interrupted === 'timeout') {
          state = fallbackState('timeout')
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
          state = fallbackState('timeout')
          continue
        }

        const attemptStartedAt = Date.now()
        const correctionResult = await adapters.callDeepSeek({
          execution,
          systemPrompt: buildCorrectionSystemPrompt(systemPrompt, state.code),
          userContent,
        })
        if (!correctionResult.ok) {
          recordChatAttempt({
            answerLength: 0,
            durationMs: elapsedSince(attemptStartedAt),
            failureCategory: correctionResult.category,
            fallbackActivated: correctionResult.category !== 'cancelled',
            finishReason: null,
            firstByteMs: correctionResult.firstByteMs,
            kind: 'provider-attempt',
            model: correctionResult.model,
            provider: correctionResult.provider,
            result: 'provider-failure',
            traceId,
            validationCode: null,
          })
          state =
            correctionResult.category === 'cancelled'
              ? { kind: 'cancelled' }
              : fallbackState(correctionResult.category)
          continue
        }

        const correctionAnswer = await collectProviderAnswer(correctionResult.attempt, execution)
        if (!correctionAnswer.ok) {
          recordChatAttempt({
            answerLength: 0,
            durationMs: elapsedSince(attemptStartedAt),
            failureCategory: correctionAnswer.code,
            fallbackActivated: correctionAnswer.code !== 'cancelled',
            finishReason: null,
            firstByteMs: correctionResult.attempt.firstByteMs,
            kind: 'provider-attempt',
            model: correctionResult.attempt.model,
            provider: correctionResult.attempt.provider,
            result: 'provider-failure',
            traceId,
            validationCode: null,
          })
          state =
            correctionAnswer.code === 'cancelled'
              ? { kind: 'cancelled' }
              : fallbackState(correctionAnswer.code)
          continue
        }

        const correctionValidation = validateChatAnswer(validationInput(correctionAnswer.text))
        if (correctionValidation.ok) {
          recordChatAttempt({
            answerLength: correctionAnswer.text.length,
            durationMs: elapsedSince(attemptStartedAt),
            failureCategory: null,
            fallbackActivated: false,
            finishReason: correctionAnswer.finishReason,
            firstByteMs: correctionResult.attempt.firstByteMs,
            kind: 'provider-attempt',
            model: correctionResult.attempt.model,
            provider: correctionResult.attempt.provider,
            result: 'success',
            traceId,
            validationCode: null,
          })
          state = { kind: 'answer', text: correctionAnswer.text }
        } else {
          recordChatAttempt({
            answerLength: correctionAnswer.text.length,
            durationMs: elapsedSince(attemptStartedAt),
            failureCategory: 'validation',
            fallbackActivated: true,
            finishReason: correctionAnswer.finishReason,
            firstByteMs: correctionResult.attempt.firstByteMs,
            kind: 'provider-attempt',
            model: correctionResult.attempt.model,
            provider: correctionResult.attempt.provider,
            result: 'validation-failure',
            traceId,
            validationCode: correctionValidation.code,
          })
          state = fallbackState('validation', correctionValidation.code)
        }
        continue
      }

      const interrupted = getChatInterruptionCategory(execution)
      if (interrupted === 'cancelled') {
        state = { kind: 'cancelled' }
        continue
      }
      if (interrupted === 'timeout' || state.index >= providers.length) {
        state = fallbackState(interrupted === 'timeout' ? 'timeout' : 'upstream')
        continue
      }

      const provider = providers[state.index]
      const attemptStartedAt = Date.now()
      const result = await provider({ execution, systemPrompt, userContent })
      if (!result.ok) {
        recordChatAttempt({
          answerLength: 0,
          durationMs: elapsedSince(attemptStartedAt),
          failureCategory: result.category,
          fallbackActivated: result.category !== 'cancelled',
          finishReason: null,
          firstByteMs: result.firstByteMs,
          kind: 'provider-attempt',
          model: result.model,
          provider: result.provider,
          result: 'provider-failure',
          traceId,
          validationCode: null,
        })
        if (result.category === 'cancelled') {
          state = { kind: 'cancelled' }
        } else if (result.category === 'timeout' || !result.chainable) {
          state = fallbackState(result.category)
        } else if (state.index + 1 >= providers.length) {
          state = fallbackState(result.category)
        } else {
          state = { kind: 'provider', index: state.index + 1 }
        }
        continue
      }

      const collected = await collectProviderAnswer(result.attempt, execution)
      if (!collected.ok) {
        const goesToCorrection = collected.code === 'response-too-large'
        recordChatAttempt({
          answerLength: 0,
          durationMs: elapsedSince(attemptStartedAt),
          failureCategory: collected.code,
          fallbackActivated: collected.code !== 'cancelled' && !goesToCorrection,
          finishReason: null,
          firstByteMs: result.attempt.firstByteMs,
          kind: 'provider-attempt',
          model: result.attempt.model,
          provider: result.attempt.provider,
          result: 'provider-failure',
          traceId,
          validationCode: goesToCorrection ? 'answer-too-large' : null,
        })
        if (collected.code === 'cancelled') {
          state = { kind: 'cancelled' }
        } else if (collected.code === 'timeout' || collected.code === 'safety') {
          state = fallbackState(collected.code)
        } else if (collected.code === 'response-too-large') {
          state = { kind: 'correction', code: 'answer-too-large' }
        } else if (chainableCollectionFailures.has(collected.code)) {
          state =
            state.index + 1 >= providers.length
              ? fallbackState(collected.code)
              : { kind: 'provider', index: state.index + 1 }
        } else {
          state = fallbackState(collected.code)
        }
        continue
      }

      const validation = validateChatAnswer(validationInput(collected.text))
      if (validation.ok) {
        recordChatAttempt({
          answerLength: collected.text.length,
          durationMs: elapsedSince(attemptStartedAt),
          failureCategory: null,
          fallbackActivated: false,
          finishReason: collected.finishReason,
          firstByteMs: result.attempt.firstByteMs,
          kind: 'provider-attempt',
          model: result.attempt.model,
          provider: result.attempt.provider,
          result: 'success',
          traceId,
          validationCode: null,
        })
        state = { kind: 'answer', text: collected.text }
      } else {
        recordChatAttempt({
          answerLength: collected.text.length,
          durationMs: elapsedSince(attemptStartedAt),
          failureCategory: 'validation',
          fallbackActivated: false,
          finishReason: collected.finishReason,
          firstByteMs: result.attempt.firstByteMs,
          kind: 'provider-attempt',
          model: result.attempt.model,
          provider: result.attempt.provider,
          result: 'validation-failure',
          traceId,
          validationCode: validation.code,
        })
        state = { kind: 'correction', code: validation.code }
      }
    }
  } catch {
    return Response.json({ error: 'Internal server error' }, { status: 500 })
  }
}
