import {
  type ChatExecutionContext,
  getChatInterruptionCategory,
  type ProviderAttempt,
} from './chat.providers'

export const CHAT_MAX_ANSWER_CHARS = 4_000
export const CHAT_MAX_PROVIDER_BUFFER_BYTES = 64 * 1_024

export type ProviderCollectionFailureCode =
  | 'cancelled'
  | 'empty'
  | 'incomplete'
  | 'malformed'
  | 'provider-error'
  | 'response-too-large'
  | 'safety'
  | 'timeout'

export type CollectedAnswer =
  | { ok: true; text: string; finishReason: string | null }
  | { ok: false; code: ProviderCollectionFailureCode }

const terminalOpenAiFinishReasons = new Set(['stop'])
const incompleteOpenAiFinishReasons = new Set(['length'])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null
const hasOwn = (record: Record<string, unknown>, key: string): boolean => Object.hasOwn(record, key)

export async function collectProviderAnswer(
  attempt: ProviderAttempt,
  execution: ChatExecutionContext,
): Promise<CollectedAnswer> {
  const reader = attempt.response.body?.getReader()
  if (!reader) return { ok: false, code: 'incomplete' }
  const { signal } = execution

  const decoder = new TextDecoder('utf-8', { fatal: true })
  let rawBuffer = ''
  let rawBufferBytes = 0
  let text = ''
  let finishReason: string | null = null
  let sawDone = false
  let sawTerminalFinish = false
  let incompleteFinish = false
  let streamFailure: ProviderCollectionFailureCode | null = null
  let currentEventType = ''
  let cancelStarted = false

  const cancelReader = (): void => {
    if (cancelStarted) return
    cancelStarted = true
    try {
      void reader.cancel().catch(() => undefined)
    } catch {
      // Cancellation is best effort and upstream details must never escape.
    }
  }

  const interruptedBeforeCollection = getChatInterruptionCategory(execution)
  if (interruptedBeforeCollection) {
    cancelReader()
    try {
      reader.releaseLock()
    } catch {
      // A provider-owned reader must never block interruption handling.
    }
    return { ok: false, code: interruptedBeforeCollection }
  }

  const appendText = (next: string): void => {
    if (streamFailure || !next) return
    if (text.length + next.length > CHAT_MAX_ANSWER_CHARS) {
      streamFailure = 'response-too-large'
      return
    }
    text += next
  }

  const processPayload = (payload: string): void => {
    if (streamFailure || !payload) return
    if (payload === '[DONE]') {
      if (sawDone) {
        streamFailure = 'malformed'
        return
      }
      sawDone = true
      currentEventType = ''
      return
    }
    if (sawDone) {
      streamFailure = 'malformed'
      return
    }

    let parsed: unknown
    try {
      parsed = JSON.parse(payload)
    } catch {
      streamFailure = 'malformed'
      return
    }

    if (!isRecord(parsed)) {
      streamFailure = 'malformed'
      return
    }

    if (sawTerminalFinish) {
      streamFailure = 'malformed'
      return
    }

    if (currentEventType.toLowerCase() === 'error' || parsed.error || parsed.type === 'error') {
      streamFailure = 'provider-error'
      return
    }
    currentEventType = ''

    if (!hasOwn(parsed, 'choices') || !Array.isArray(parsed.choices)) {
      streamFailure = 'malformed'
      return
    }

    const choices = parsed.choices
    const choiceRecords = choices.filter(isRecord)
    if (choiceRecords.length !== choices.length) streamFailure = 'malformed'
    if (choiceRecords.length !== 1) incompleteFinish = true

    for (const record of choiceRecords) {
      if (hasOwn(record, 'delta') && !isRecord(record.delta)) incompleteFinish = true
      const recordDelta = isRecord(record.delta) ? record.delta : null
      if (
        recordDelta &&
        (hasOwn(recordDelta, 'tool_calls') ||
          hasOwn(recordDelta, 'function_call') ||
          recordDelta.role === 'tool')
      ) {
        incompleteFinish = true
      }
      if (
        recordDelta &&
        hasOwn(recordDelta, 'content') &&
        typeof recordDelta.content !== 'string'
      ) {
        incompleteFinish = true
      }

      if (hasOwn(record, 'message') && !isRecord(record.message)) streamFailure = 'malformed'
      const recordMessage = isRecord(record.message) ? record.message : null
      if (
        recordMessage &&
        (hasOwn(recordMessage, 'tool_calls') ||
          hasOwn(recordMessage, 'function_call') ||
          recordMessage.role === 'tool' ||
          (hasOwn(recordMessage, 'content') && typeof recordMessage.content !== 'string'))
      ) {
        incompleteFinish = true
      }

      if (
        hasOwn(record, 'finish_reason') &&
        record.finish_reason !== null &&
        typeof record.finish_reason !== 'string'
      ) {
        streamFailure = 'malformed'
        continue
      }
      if (typeof record.finish_reason !== 'string') continue
      const reason = record.finish_reason.toLowerCase()
      if (reason === 'content_filter') streamFailure = 'safety'
      else if (reason !== 'stop') incompleteFinish = true
    }
    const choice = isRecord(choices[0]) ? choices[0] : null
    if (!choice) return

    const delta = isRecord(choice.delta) ? choice.delta : null
    if (typeof delta?.content === 'string') appendText(delta.content)
    if (typeof choice.finish_reason === 'string') {
      finishReason = choice.finish_reason
      const normalizedReason = choice.finish_reason.toLowerCase()
      if (terminalOpenAiFinishReasons.has(normalizedReason)) {
        sawTerminalFinish = true
      } else if (incompleteOpenAiFinishReasons.has(normalizedReason)) {
        incompleteFinish = true
      } else if (normalizedReason === 'content_filter') {
        streamFailure = 'safety'
      } else {
        incompleteFinish = true
      }
    }
  }

  const processLine = (rawLine: string): void => {
    if (streamFailure) return
    const line = rawLine.endsWith('\r') ? rawLine.slice(0, -1) : rawLine
    if (!line) {
      currentEventType = ''
      return
    }
    if (line.startsWith(':')) return
    if (line.startsWith('event:')) {
      currentEventType = line.slice('event:'.length).trim()
      return
    }
    if (!line.startsWith('data:')) return
    processPayload(line.slice('data:'.length).trim())
  }

  const processCompleteLines = (): void => {
    let newlineIndex = rawBuffer.indexOf('\n')
    while (newlineIndex >= 0) {
      const line = rawBuffer.slice(0, newlineIndex)
      const removed = rawBuffer.slice(0, newlineIndex + 1)
      rawBuffer = rawBuffer.slice(newlineIndex + 1)
      rawBufferBytes -= new TextEncoder().encode(removed).byteLength
      processLine(line)
      if (streamFailure || sawDone) return
      newlineIndex = rawBuffer.indexOf('\n')
    }
  }

  const onAbort = (): void => {
    void cancelReader()
  }

  signal.addEventListener('abort', onAbort, { once: true })

  try {
    if (signal.aborted) {
      cancelReader()
      return { ok: false, code: getChatInterruptionCategory(execution) ?? 'cancelled' }
    }

    while (true) {
      let chunk: ReadableStreamReadResult<Uint8Array>
      try {
        chunk = await reader.read()
      } catch {
        if (signal.aborted) {
          return { ok: false, code: getChatInterruptionCategory(execution) ?? 'cancelled' }
        }
        return { ok: false, code: 'provider-error' }
      }

      if (signal.aborted) {
        return { ok: false, code: getChatInterruptionCategory(execution) ?? 'cancelled' }
      }
      if (chunk.done) break

      rawBufferBytes += chunk.value.byteLength
      if (rawBufferBytes > CHAT_MAX_PROVIDER_BUFFER_BYTES) {
        cancelReader()
        return { ok: false, code: 'response-too-large' }
      }

      try {
        rawBuffer += decoder.decode(chunk.value, { stream: true })
      } catch {
        cancelReader()
        return { ok: false, code: 'malformed' }
      }
      processCompleteLines()
      if (streamFailure) {
        cancelReader()
        return { ok: false, code: streamFailure }
      }
      if (sawDone) {
        cancelReader()
        rawBuffer = ''
        break
      }
    }

    try {
      rawBuffer += decoder.decode()
    } catch {
      return { ok: false, code: 'malformed' }
    }
    if (rawBuffer) processLine(rawBuffer)
    if (streamFailure) return { ok: false, code: streamFailure }
    if (incompleteFinish) return { ok: false, code: 'incomplete' }

    const completed = sawDone || sawTerminalFinish
    if (!completed) return { ok: false, code: 'incomplete' }
    if (!text.trim()) return { ok: false, code: 'empty' }
    return { ok: true, text, finishReason }
  } finally {
    signal.removeEventListener('abort', onAbort)
    try {
      reader.releaseLock()
    } catch {
      // Release is best effort for provider-owned streams.
    }
  }
}
