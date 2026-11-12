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

const commonAttributes = (event: ChatTelemetryEvent) => ({
  answerLength: event.answerLength,
  durationMs: event.durationMs,
  failureCategory: event.failureCategory,
  fallbackActivated: event.fallbackActivated,
  finishReason: event.finishReason,
  firstByteMs: event.firstByteMs,
  traceId: event.traceId,
  validationCode: event.validationCode,
})

type LogAttributeValue = string | number | boolean

// Flat primitive log attributes. Empty fields are left out: Sentry would send
// null as the string "null" and undefined as an empty string.
const toLogAttributes = (
  fields: Record<string, LogAttributeValue | null | undefined>,
): Record<string, LogAttributeValue> =>
  Object.fromEntries(
    Object.entries(fields).filter(
      (entry): entry is [string, LogAttributeValue] => entry[1] !== null && entry[1] !== undefined,
    ),
  )

// Fresh scopes keep request data (user, headers, body) out of chat telemetry.
// The current scope needs the client, otherwise the log is dropped.
const createDetachedScope = (): Sentry.Scope => {
  const scope = new Sentry.Scope()
  scope.setClient(Sentry.getClient())
  return scope
}

// Sentry logs, not issues: one per provider attempt and one for the safe fallback.
export function recordChatAttempt(event: ChatTelemetryEvent): void {
  try {
    Sentry.withIsolationScope(new Sentry.Scope(), () => {
      Sentry.withScope(createDetachedScope(), () => {
        if (event.kind === 'provider-attempt') {
          const attributes = toLogAttributes({
            feature: 'chatbot',
            kind: event.kind,
            model: event.model,
            provider: event.provider,
            result: event.result,
            ...commonAttributes(event),
          })

          if (event.result === 'success') {
            Sentry.logger.info('chat-provider-attempt', attributes)
          } else {
            Sentry.logger.warn('chat-provider-attempt', attributes)
          }
          return
        }

        Sentry.logger.warn(
          'chat-safe-fallback',
          toLogAttributes({
            feature: 'chatbot',
            kind: event.kind,
            result: event.result,
            ...commonAttributes(event),
          }),
        )
      })
    })
  } catch {
    // Telemetry is best effort and must never alter the chat response.
  }
}
