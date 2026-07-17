import * as Sentry from '@sentry/nextjs'
import type { ChatProviderId, ProviderFailureCategory } from './chat.providers'
import type { ChatValidationCode, ProviderCollectionFailureCode } from './chat.response'

export type ChatTelemetryFailureCategory =
  | ProviderFailureCategory
  | ProviderCollectionFailureCode
  | 'validation'

type ChatTelemetryCommon = {
  answerLength: number
  durationMs: number
  failureCategory: ChatTelemetryFailureCategory | null
  fallbackActivated: boolean
  finishReason: string | null
  firstByteMs: number | null
  traceId: string
  validationCode: ChatValidationCode | null
}

type ChatProviderAttemptTelemetryEvent = ChatTelemetryCommon & {
  kind: 'provider-attempt'
  model: string
  provider: ChatProviderId
  result: 'success' | 'provider-failure' | 'validation-failure'
}

type ChatSafeFallbackTelemetryEvent = ChatTelemetryCommon & {
  kind: 'safe-fallback'
  result: 'safe-fallback'
}

export type ChatTelemetryEvent = ChatProviderAttemptTelemetryEvent | ChatSafeFallbackTelemetryEvent

const commonExtra = (event: ChatTelemetryEvent) => ({
  answerLength: event.answerLength,
  durationMs: event.durationMs,
  failureCategory: event.failureCategory,
  fallbackActivated: event.fallbackActivated,
  finishReason: event.finishReason,
  firstByteMs: event.firstByteMs,
  traceId: event.traceId,
  validationCode: event.validationCode,
})

export function recordChatAttempt(event: ChatTelemetryEvent): void {
  try {
    Sentry.withIsolationScope((isolationScope) => {
      isolationScope.clear()

      Sentry.withScope((currentScope) => {
        currentScope.clear()

        if (event.kind === 'provider-attempt') {
          Sentry.captureEvent({
            extra: commonExtra(event),
            level: event.result === 'success' ? 'info' : 'warning',
            message: 'chat-provider-attempt',
            tags: {
              feature: 'chatbot',
              kind: event.kind,
              model: event.model,
              provider: event.provider,
              result: event.result,
            },
          })
          return
        }

        Sentry.captureEvent({
          extra: commonExtra(event),
          level: 'warning',
          message: 'chat-safe-fallback',
          tags: {
            feature: 'chatbot',
            kind: event.kind,
            result: event.result,
          },
        })
      })
    })
  } catch {
    // Telemetry is best effort and must never alter the chat response.
  }
}
