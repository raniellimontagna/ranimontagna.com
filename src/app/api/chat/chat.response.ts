import { isApprovedChatUrl } from '@/shared/lib/chat-links'
import type { ChatProfile } from './chat.profile'
import {
  CHAT_INTERNAL_PROMPT_MARKERS,
  type ChatLocale,
  type ChatRuntimeContext,
} from './chat.prompt'
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

const terminalOpenAiFinishReasons = new Set(['stop', 'tool_calls', 'function_call'])
const incompleteOpenAiFinishReasons = new Set(['length'])
const safetyFinishReasons = new Set([
  'SAFETY',
  'BLOCKLIST',
  'PROHIBITED_CONTENT',
  'RECITATION',
  'CONTENT_FILTER',
])

const isRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

export async function collectProviderAnswer(
  attempt: ProviderAttempt,
  execution: ChatExecutionContext,
): Promise<CollectedAnswer> {
  const interruptedBeforeCollection = getChatInterruptionCategory(execution)
  if (interruptedBeforeCollection) return { ok: false, code: interruptedBeforeCollection }

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
  let cancelPromise: Promise<void> | null = null

  const cancelReader = (): Promise<void> => {
    if (!cancelPromise) {
      cancelPromise = reader.cancel().then(
        () => undefined,
        () => undefined,
      )
    }
    return cancelPromise
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

    if (currentEventType.toLowerCase() === 'error' || parsed.error || parsed.type === 'error') {
      streamFailure = 'provider-error'
      return
    }
    currentEventType = ''

    if (attempt.format === 'openai-sse') {
      const choices = Array.isArray(parsed.choices) ? parsed.choices : []
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
      return
    }

    const promptFeedback = isRecord(parsed.promptFeedback) ? parsed.promptFeedback : null
    if (typeof promptFeedback?.blockReason === 'string' && promptFeedback.blockReason) {
      streamFailure = 'safety'
      return
    }

    const candidates = Array.isArray(parsed.candidates) ? parsed.candidates : []
    const candidate = isRecord(candidates[0]) ? candidates[0] : null
    if (!candidate) return

    if (typeof candidate.finishReason === 'string') {
      finishReason = candidate.finishReason
      const normalizedReason = candidate.finishReason.toUpperCase()
      if (safetyFinishReasons.has(normalizedReason)) {
        streamFailure = 'safety'
        return
      }
      if (normalizedReason === 'STOP') sawTerminalFinish = true
      else incompleteFinish = true
    }

    const content = isRecord(candidate.content) ? candidate.content : null
    const parts = Array.isArray(content?.parts) ? content.parts : []
    for (const part of parts) {
      if (isRecord(part) && typeof part.text === 'string') appendText(part.text)
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
      await cancelReader()
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
        await cancelReader()
        return { ok: false, code: 'response-too-large' }
      }

      try {
        rawBuffer += decoder.decode(chunk.value, { stream: true })
      } catch {
        await cancelReader()
        return { ok: false, code: 'malformed' }
      }
      processCompleteLines()
      if (streamFailure) {
        await cancelReader()
        return { ok: false, code: streamFailure }
      }
      if (sawDone) {
        await cancelReader()
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
    reader.releaseLock()
  }
}

export type ChatValidationCode =
  | 'answer-too-large'
  | 'canonical-date-conflict'
  | 'empty'
  | 'policy-canary'
  | 'secret-pattern'
  | 'unsafe-link'
  | 'unsafe-protocol'
  | 'unsupported-year'

export type ChatValidationResult = { ok: true } | { ok: false; code: ChatValidationCode }

export const CHAT_CORRECTION_RULES: Record<ChatValidationCode, string> = {
  'answer-too-large': 'Regenerate a concise answer within the response limit.',
  'canonical-date-conflict':
    'Regenerate using only the canonical interval for each employer. Do not repeat a false employer-year premise.',
  empty: 'Generate a concise in-scope answer from authoritative facts.',
  'policy-canary':
    'Regenerate without quoting, transforming, or reconstructing internal policy or runtime text.',
  'secret-pattern': 'Regenerate without credentials, configuration names, or secret-like values.',
  'unsafe-link': 'Regenerate without links except exact approved contact URLs.',
  'unsafe-protocol': 'Regenerate without non-HTTPS links or protocols.',
  'unsupported-year': 'Regenerate using only canonical dates from authoritative facts.',
}

export function buildCorrectionSystemPrompt(
  systemPrompt: string,
  code: ChatValidationCode,
): string {
  return `${systemPrompt}\n\nSERVER-OWNED CORRECTION RULE:\n${CHAT_CORRECTION_RULES[code]}`
}

export type ChatValidationInput = {
  answer: string
  locale: ChatLocale
  profile: ChatProfile
  runtime: ChatRuntimeContext
  visitorMessage: string
}

const plausibleYearPattern = /\b(?:19|20)\d{2}\b/g

const secretPatterns = [
  /\b(?:sk-|AIza)[a-z0-9_-]{8,}\b/i,
  /\bbearer\s+[a-z0-9._~+/-]{4,}\b/i,
  /\b[a-z0-9]+(?:_[a-z0-9]+)*_(?:api_?key|token|secret)\b/i,
  /\b(?:api_?key|token|secret)\s*[:=]\s*\S{4,}/i,
  /\b(?:deepseek|gemini|openrouter|groq|chat|upstash|sentry)_[a-z0-9_]+\b/i,
] as const

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const normalizedForAssociation = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

const isRefutationOrSeparation = (clause: string, companyAlias: string): boolean => {
  const company = escapeRegExp(normalizedForAssociation(companyAlias))
  return [
    new RegExp(
      `\\b(?:nao|no|not|never|nunca)\\s+(?:comecei|empece|started|trabalhei|trabaje|worked|estava|atuava)\\b[^.;]{0,48}\\b${company}\\b`,
    ),
    new RegExp(`\\b(?:nao|no|not)\\s+(?:na|no|en|at)\\s+(?:a\\s+)?${company}\\b`),
    new RegExp(`\\b(?:incorreto|incorrecto|incorrect|falso|false)\\b[^.;]{0,80}\\b${company}\\b`),
    new RegExp(`\\b(?:antes\\s+(?:de|da|do)|before)\\s+(?:a\\s+|the\\s+)?${company}\\b`),
  ].some((pattern) => pattern.test(clause))
}

const answerHasCanonicalDateConflict = (input: ChatValidationInput): boolean => {
  const runtimeYear = Number(input.runtime.currentDate.slice(0, 4))
  const clauses = normalizedForAssociation(input.answer).split(
    /[.!?;\n]+|,(?=\s*(?:(?:e|and|y)\s+)?(?:(?:eu|i|yo)\s+)?(?:hoje|atualmente|agora|today|now|currently|hoy|actualmente|ahora)\b)/,
  )

  return input.profile.experiences.some((experience) => {
    const alias = experience.company.split(/\s+/)[0] ?? experience.company
    const companyPattern = new RegExp(`\\b${escapeRegExp(normalizedForAssociation(alias))}\\b`)
    const startYear = Number(experience.startDate.slice(0, 4))
    const endYear = Number((experience.endDate ?? input.runtime.currentDate).slice(0, 4))
    const effectiveEndYear = Number.isFinite(endYear) ? endYear : runtimeYear

    return clauses.some((clause) => {
      if (!companyPattern.test(clause) || isRefutationOrSeparation(clause, alias)) return false
      const years = clause.match(plausibleYearPattern) ?? []
      return years.some((year) => Number(year) < startYear || Number(year) > effectiveEndYear)
    })
  })
}

const markdownTargets = (answer: string): string[] =>
  [...answer.matchAll(/\[[^\]]*\]\(\s*([^\s)]+)(?:\s+[^)]*)?\)/g)].map((match) => match[1] ?? '')

const rawHttpsUrls = (answer: string): string[] =>
  [...answer.matchAll(/\bhttps:\/\/[^\s<>"']+/gi)].map((match) =>
    (match[0] ?? '').replace(/[)\].,!?;:]+$/g, ''),
  )

const classifyUnsafeUrl = (answer: string): ChatValidationCode | null => {
  if (/\b(?:data|file|ftp|ftps|http|javascript|mailto|tel|vbscript|ws|wss):/i.test(answer)) {
    return 'unsafe-protocol'
  }

  for (const target of markdownTargets(answer)) {
    const normalizedTarget = target.replace(/^<|>$/g, '')
    const protocolMatch = normalizedTarget.match(/^([a-z][a-z0-9+.-]*):/i)
    if (protocolMatch?.[1]?.toLowerCase() !== 'https') return 'unsafe-protocol'
    if (!isApprovedChatUrl(normalizedTarget)) return 'unsafe-link'
  }

  for (const url of rawHttpsUrls(answer)) {
    if (!isApprovedChatUrl(url)) return 'unsafe-link'
  }

  return null
}

export function validateChatAnswer(input: ChatValidationInput): ChatValidationResult {
  if (!input.answer.trim()) return { ok: false, code: 'empty' }
  if (input.answer.length > CHAT_MAX_ANSWER_CHARS) {
    return { ok: false, code: 'answer-too-large' }
  }

  const securityScanAnswer = input.answer
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .replace(/[*`~]/g, '')
  const lowerAnswer = securityScanAnswer.toLocaleLowerCase(input.locale)
  if (
    CHAT_INTERNAL_PROMPT_MARKERS.some((marker) => lowerAnswer.includes(marker.toLocaleLowerCase()))
  ) {
    return { ok: false, code: 'policy-canary' }
  }
  if (secretPatterns.some((pattern) => pattern.test(securityScanAnswer))) {
    return { ok: false, code: 'secret-pattern' }
  }

  const unsafeUrl = classifyUnsafeUrl(securityScanAnswer)
  if (unsafeUrl) return { ok: false, code: unsafeUrl }

  if (answerHasCanonicalDateConflict(input)) {
    return { ok: false, code: 'canonical-date-conflict' }
  }

  const allowedYears = new Set<string>([input.runtime.currentDate.slice(0, 4)])
  for (const experience of input.profile.experiences) {
    allowedYears.add(experience.startDate.slice(0, 4))
    if (experience.endDate) allowedYears.add(experience.endDate.slice(0, 4))
  }
  for (const year of input.visitorMessage.match(plausibleYearPattern) ?? []) {
    allowedYears.add(year)
  }
  for (const year of input.answer.match(plausibleYearPattern) ?? []) {
    if (!allowedYears.has(year)) return { ok: false, code: 'unsupported-year' }
  }

  return { ok: true }
}

export function buildTextStream(text: string): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder()
  return new ReadableStream({
    start(controller) {
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
      controller.enqueue(encoder.encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}
