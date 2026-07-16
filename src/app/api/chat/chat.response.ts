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

const terminalOpenAiFinishReasons = new Set(['stop'])
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

    if (attempt.format === 'openai-sse') {
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
      return
    }

    if (hasOwn(parsed, 'promptFeedback') && !isRecord(parsed.promptFeedback)) {
      streamFailure = 'malformed'
      return
    }
    const promptFeedback = isRecord(parsed.promptFeedback) ? parsed.promptFeedback : null
    if (typeof promptFeedback?.blockReason === 'string' && promptFeedback.blockReason) {
      streamFailure = 'safety'
      return
    }

    if (!hasOwn(parsed, 'candidates') || !Array.isArray(parsed.candidates)) {
      streamFailure = 'malformed'
      return
    }

    const candidates = parsed.candidates
    const candidateRecords = candidates.filter(isRecord)
    if (candidateRecords.length !== candidates.length) streamFailure = 'malformed'
    if (candidateRecords.length !== 1) incompleteFinish = true
    for (const record of candidateRecords) {
      if (
        hasOwn(record, 'finishReason') &&
        record.finishReason !== null &&
        typeof record.finishReason !== 'string'
      ) {
        streamFailure = 'malformed'
        continue
      }
      if (typeof record.finishReason !== 'string') continue
      const reason = record.finishReason.toUpperCase()
      if (safetyFinishReasons.has(reason)) streamFailure = 'safety'
      else if (reason !== 'STOP') incompleteFinish = true
    }
    if (
      candidateRecords.some((record) => {
        if (hasOwn(record, 'content') && !isRecord(record.content)) {
          streamFailure = 'malformed'
          return false
        }
        const recordContent = isRecord(record.content) ? record.content : null
        if (
          recordContent &&
          hasOwn(recordContent, 'parts') &&
          !Array.isArray(recordContent.parts)
        ) {
          return true
        }
        const recordParts = Array.isArray(recordContent?.parts) ? recordContent.parts : []
        return recordParts.some(
          (part) =>
            !isRecord(part) ||
            typeof part.text !== 'string' ||
            Object.keys(part).some((key) => key !== 'text' && key !== 'thoughtSignature') ||
            isRecord(part.functionCall) ||
            isRecord(part.functionResponse),
        )
      })
    ) {
      incompleteFinish = true
    }
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
      if (!isRecord(part)) continue
      if (typeof part.text === 'string') appendText(part.text)
      if (isRecord(part.functionCall) || isRecord(part.functionResponse)) incompleteFinish = true
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

export type ChatValidationCode =
  | 'answer-too-large'
  | 'canonical-date-conflict'
  | 'empty'
  | 'policy-canary'
  | 'secret-pattern'
  | 'unsafe-link'
  | 'unsafe-protocol'
  | 'unsupported-metric'
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
  'unsupported-metric':
    'Regenerate using only metrics explicitly present in the authoritative facts.',
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
const markdownFormattingPattern = /[*_`~]/g

const unicodeDecimalZeroes = [
  0x0030, 0x0660, 0x06f0, 0x07c0, 0x0966, 0x09e6, 0x0a66, 0x0ae6, 0x0b66, 0x0be6, 0x0c66, 0x0ce6,
  0x0d66, 0x0de6, 0x0e50, 0x0ed0, 0x0f20, 0x1040, 0x1090, 0x17e0, 0x1810, 0x1946, 0x19d0, 0x1a80,
  0x1a90, 0x1b50, 0x1bb0, 0x1c40, 0x1c50, 0xa620, 0xa8d0, 0xa900, 0xa9d0, 0xa9f0, 0xaa50, 0xabf0,
  0xff10, 0x104a0, 0x10d30, 0x11066, 0x110f0, 0x11136, 0x111d0, 0x112f0, 0x11450, 0x114d0, 0x11650,
  0x116c0, 0x11730, 0x118e0, 0x11950, 0x11c50, 0x11d50, 0x11da0, 0x11f50, 0x16a60, 0x16ac0, 0x16b50,
  0x1d7ce, 0x1d7d8, 0x1d7e2, 0x1d7ec, 0x1d7f6, 0x1e140, 0x1e2f0, 0x1e4f0, 0x1e950, 0x1fbf0,
] as const

const decimalDigitToAscii = (digit: string): string => {
  const codePoint = digit.codePointAt(0)
  if (codePoint === undefined) return digit
  const zero = unicodeDecimalZeroes.find(
    (candidate) => codePoint >= candidate && codePoint <= candidate + 9,
  )
  if (zero !== undefined) return String(codePoint - zero)
  return digit
}

const normalizeUnicodeText = (value: string): string =>
  value
    .normalize('NFKC')
    .replace(/\p{Cf}/gu, '')
    .replace(/\p{Nd}/gu, decimalDigitToAscii)
    .replace(/\u066c/g, ',')
    .replace(/\u066b/g, '.')
    .replace(/[\u2010-\u2015\u2212]/g, '-')
    .replace(/[\u039c\u03bc\u039f\u03bf\u0415\u0435\u041c\u043c\u041e\u043e]/g, (character) => {
      if (character === '\u039c' || character === '\u041c') return 'M'
      if (character === '\u03bc' || character === '\u043c') return 'm'
      if (character === '\u039f' || character === '\u041e') return 'O'
      if (character === '\u0415') return 'E'
      if (character === '\u0435') return 'e'
      return 'o'
    })

const flattenRenderedMarkdownLinks = (value: string): string =>
  value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

const normalizeSemanticText = (value: string): string =>
  flattenRenderedMarkdownLinks(normalizeUnicodeText(value)).replace(markdownFormattingPattern, '')

const metricNumberWordValues: Record<string, string> = {
  eight: '8',
  five: '5',
  four: '4',
  nine: '9',
  one: '1',
  seven: '7',
  six: '6',
  ten: '10',
  thirty: '30',
  three: '3',
  twelve: '12',
  twenty: '20',
  two: '2',
  cinco: '5',
  dois: '2',
  duas: '2',
  nueve: '9',
  oito: '8',
  once: '11',
  quatro: '4',
  seis: '6',
  sete: '7',
  siete: '7',
  trinta: '30',
  tres: '3',
  veinte: '20',
  vinte: '20',
  cuatro: '4',
  ocho: '8',
  nove: '9',
}
const metricNumberWordPattern = new RegExp(
  `\\b(${Object.keys(metricNumberWordValues).join('|')})\\b(?=\\s+(?:anos?|years?|lojas?|stores?|tiendas?|estoquistas?|clientes?|clients?|customers?|projetos?|projects?|proyectos?))`,
  'g',
)

const quantityScaleWordValues: Record<string, number> = {
  diez: 10,
  dez: 10,
  doce: 12,
  dois: 2,
  dos: 2,
  doze: 12,
  eight: 8,
  five: 5,
  four: 4,
  nine: 9,
  one: 1,
  once: 11,
  seven: 7,
  six: 6,
  ten: 10,
  thirty: 30,
  three: 3,
  twelve: 12,
  twenty: 20,
  two: 2,
  cinco: 5,
  cuatro: 4,
  nove: 9,
  nueve: 9,
  ocho: 8,
  oito: 8,
  quatro: 4,
  seis: 6,
  sete: 7,
  siete: 7,
  trinta: 30,
  tres: 3,
  veinte: 20,
  vinte: 20,
}
const quantityScaleWordPattern = new RegExp(
  `\\b(${Object.keys(quantityScaleWordValues).join('|')})(?:(?:\\s+(?:e|and|y)\\s+|[ -])(${Object.keys(quantityScaleWordValues).join('|')}))?\\s+(milhoes?|millions?|million|millones?|millon|mil|thousand)\\b`,
  'g',
)

const normalizedForAssociation = (value: string): string => {
  const normalized = normalizeSemanticText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\b(?:wasn['’]?t)\b/g, 'was not')
    .replace(/\b(?:didn['’]?t)\b/g, 'did not')
    .replace(/\b(?:hadn['’]?t)\b/g, 'had not')
    .replace(
      /\b(?:dois mil e vinte e quatro|two thousand(?: and)? twenty[ -]four|dos mil veinticuatro)\b/g,
      '2024',
    )
    .replace(
      /\b(?:dois mil e vinte e seis|two thousand(?: and)? twenty[ -]six|dos mil veintiseis)\b/g,
      '2026',
    )
    .replace(
      /\b(?:dois mil e vinte e tres|two thousand(?: and)? twenty[ -]three|dos mil veintitres)\b/g,
      '2023',
    )
    .replace(
      quantityScaleWordPattern,
      (_phrase, first: string, second: string | undefined, scale: string) => {
        const value =
          (quantityScaleWordValues[first] ?? 0) +
          (second ? (quantityScaleWordValues[second] ?? 0) : 0)
        return `${value} ${scale}`
      },
    )
    .replace(/\b(?:vinte milhoes|twenty million|veinte millones)\b/g, '20000000')
    .replace(/\b(?:dois milhoes|two million|dos millones)\b/g, '2000000')
    .replace(/\b(?:um milhao|one million|un millon)\b/g, '1000000')
    .replace(/\b(?:vinte mil|twenty thousand|veinte mil)\b/g, '20000')
    .replace(/\b(?:doze mil|twelve thousand|doce mil)\b/g, '12000')
    .replace(/\b(?:dez mil|ten thousand|diez mil)\b/g, '10000')
    .replace(/\b(?:mais de|more than|over|at least|pelo menos|mas de)\s+mil\b/g, 'mais de 1000')
    .replace(/\b(?:dois mil|two thousand|dos mil)\b/g, '2000')
    .replace(/(?<!\d\s)\b(?:one thousand|a thousand|un mil|mil|thousand)\b/g, '1000')
    .replace(/\b(?:milhares|thousands)\b/g, '2000+')
    .replace(/\b(?:quinhentos|five hundred|quinientos)\b/g, '500')
    .replace(/\b(?:quarenta e dois|forty[ -]two|cuarenta y dos)\b/g, '42')
    .replace(/\b(?:cinquenta|fifty|cincuenta)\b/g, '50')
    .replace(/\b(?:onze|eleven)\b/g, '11')
    .replace(metricNumberWordPattern, (word) => metricNumberWordValues[word] ?? word)
    .replace(/\b(?:dez(?!\s*[/.-]\s*\d{2,4}\b)|ten|diez)\b/g, '10')

  return normalized
    .replace(/\b([a-z]{3,12}(?:\s+\d{1,2})?),\s*((?:19|20)\d{2})\b/g, '$1 $2')
    .replace(/\s+/g, ' ')
}

const normalizedForMetricAssociation = (value: string): string =>
  value
    .split(/\r\n?|\n/)
    .map((line) => normalizedForAssociation(line))
    .join('\n')

const secretPatterns = [
  /\b(?:sk-|AIza)[a-z0-9_-]{4,}\b/i,
  /\bbearer\s+[a-z0-9._~+/-]{4,}\b/i,
  /\b[a-z0-9]+(?:_[a-z0-9]+)*_(?:api_?key|token|secret)\b/i,
  /\b(?:api_?key|token|secret)\s*[:=]\s*\S{4,}/i,
  /\b(?:deepseek|gemini|openrouter|groq|chat|upstash|sentry)_[a-z0-9_]+\b/i,
  /\b(?:deepseek|gemini|openrouter|groq)(?:api)?key\b/i,
] as const

const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

const decodePlausibleBase64 = (candidate: string): string | null => {
  const standard = candidate.replaceAll('-', '+').replaceAll('_', '/')
  const withoutPadding = standard.replace(/=+$/g, '')
  if (withoutPadding.length % 4 === 1) return null
  const padded = `${withoutPadding}${'='.repeat((4 - (withoutPadding.length % 4)) % 4)}`

  try {
    const binary = atob(padded)
    const roundTrip = btoa(binary).replace(/=+$/g, '')
    if (roundTrip !== withoutPadding) return null
    const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0))
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    return null
  }
}

const MAX_BASE64_DECODE_ATTEMPTS = 128
const MAX_BASE64_DECODED_NODES = 64
const MAX_BASE64_TOTAL_DECODED_BYTES = 64 * 1_024

type SecurityScanExpansion = { exhausted: boolean; variants: string[] }

const reconstructGroupedBase64 = (value: string): string =>
  value.replace(/[a-z0-9+/_=-]+(?:\s+[a-z0-9+/_=-]+)+/gi, (candidate) => {
    const compact = candidate.replace(/\s/g, '')
    return compact.length >= 12 ? compact : candidate
  })

const securitySources = (value: string): string[] => {
  const normalized = normalizeUnicodeText(value)
  const directSources = [
    normalized,
    normalized.replace(/[*`~]/g, ''),
    normalizeSemanticText(normalized),
  ]
  return directSources.flatMap((source) => {
    const withoutLineWrapping = source.replace(/[ \t]*\r?\n[ \t]*/g, '')
    return [
      source,
      withoutLineWrapping,
      reconstructGroupedBase64(source),
      reconstructGroupedBase64(withoutLineWrapping),
    ]
  })
}

const expandSecurityScan = (value: string): SecurityScanExpansion => {
  const candidatePattern = /(?:^|[^a-z0-9+/_-])([a-z0-9+/_-]{12,}={0,2})(?=$|[^a-z0-9+/_=-])/gi
  const decoded = new Set<string>()
  const seenCandidates = new Set<string>()
  const seenSources = new Set<string>()
  const queue = [value]
  let decodeAttempts = 0
  let totalDecodedBytes = 0

  while (queue.length) {
    const valueToScan = queue.shift()
    if (valueToScan === undefined) break
    for (const source of securitySources(valueToScan)) {
      if (seenSources.has(source)) continue
      seenSources.add(source)
      for (const match of source.matchAll(candidatePattern)) {
        const candidate = match[1]
        if (!candidate || seenCandidates.has(candidate)) continue
        seenCandidates.add(candidate)
        decodeAttempts += 1
        if (decodeAttempts > MAX_BASE64_DECODE_ATTEMPTS) {
          return { exhausted: true, variants: [...seenSources] }
        }

        const decodedCandidate = decodePlausibleBase64(candidate)
        if (!decodedCandidate || decoded.has(decodedCandidate)) continue
        totalDecodedBytes += new TextEncoder().encode(decodedCandidate).byteLength
        if (
          totalDecodedBytes > MAX_BASE64_TOTAL_DECODED_BYTES ||
          decoded.size >= MAX_BASE64_DECODED_NODES
        ) {
          return { exhausted: true, variants: [...seenSources] }
        }
        decoded.add(decodedCandidate)
        queue.push(decodedCandidate)
      }
    }
  }

  return { exhausted: false, variants: [...seenSources] }
}

const containsInternalPolicy = (variants: string[]): boolean =>
  variants.some((variant) => {
    const comparable = variant.toLowerCase()
    return CHAT_INTERNAL_PROMPT_MARKERS.some((marker) =>
      comparable.includes(normalizeSemanticText(marker).toLowerCase()),
    )
  })

const containsSecretPattern = (variants: string[]): boolean =>
  variants.some((variant) => secretPatterns.some((pattern) => pattern.test(variant)))

type MarkdownDestination = { closed: boolean; value: string }

const markdownDestinations = (answer: string): MarkdownDestination[] => {
  const destinations: MarkdownDestination[] = []
  let searchFrom = 0
  let openerIndex = answer.indexOf('](', searchFrom)
  while (openerIndex >= 0) {
    const start = openerIndex + 2
    const end = answer.indexOf(')', start)
    destinations.push({
      closed: end >= 0,
      value: end < 0 ? answer.slice(start) : answer.slice(start, end),
    })
    if (end < 0) break
    searchFrom = end + 1
    openerIndex = answer.indexOf('](', searchFrom)
  }
  return destinations
}

const rawHttpsUrls = (answer: string): string[] =>
  [...answer.matchAll(/\bhttps:\/\/[^\s<>"']+/gi)].map((match) =>
    (match[0] ?? '').replace(/[)\].,!?;:]+$/g, ''),
  )

const classifyUnsafeUrl = (answer: string, semanticAnswer: string): ChatValidationCode | null => {
  const nonHttpsProtocol = /\b(?:data|file|ftp|ftps|http|javascript|mailto|tel|vbscript|ws|wss):/i
  if (nonHttpsProtocol.test(semanticAnswer)) return 'unsafe-protocol'

  for (const { closed, value: destination } of markdownDestinations(answer)) {
    if (!closed) return 'unsafe-link'
    if (!destination || /[\s\p{Cc}\p{Cf}]/u.test(destination)) return 'unsafe-link'
    const semanticDestination = normalizeSemanticText(destination).replace(/^<|>$/g, '')
    const protocol = semanticDestination.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase()
    if (protocol !== 'https') return 'unsafe-protocol'
    if (!isApprovedChatUrl(destination)) return 'unsafe-link'
  }

  for (const url of rawHttpsUrls(answer)) {
    if (!isApprovedChatUrl(url)) return 'unsafe-link'
  }
  for (const url of rawHttpsUrls(semanticAnswer)) {
    if (!isApprovedChatUrl(url) || !answer.includes(url)) return 'unsafe-link'
  }

  return null
}

const monthNumberByToken: Record<string, number> = {
  jan: 1,
  janeiro: 1,
  january: 1,
  ene: 1,
  enero: 1,
  fev: 2,
  fevereiro: 2,
  feb: 2,
  february: 2,
  febrero: 2,
  mar: 3,
  marco: 3,
  march: 3,
  marzo: 3,
  abr: 4,
  abril: 4,
  apr: 4,
  april: 4,
  mai: 5,
  maio: 5,
  may: 5,
  mayo: 5,
  jun: 6,
  junho: 6,
  june: 6,
  junio: 6,
  jul: 7,
  julho: 7,
  july: 7,
  julio: 7,
  ago: 8,
  agosto: 8,
  aug: 8,
  august: 8,
  set: 9,
  setembro: 9,
  sep: 9,
  sept: 9,
  september: 9,
  septiembre: 9,
  setiembre: 9,
  out: 10,
  outubro: 10,
  oct: 10,
  october: 10,
  octubre: 10,
  nov: 11,
  novembro: 11,
  november: 11,
  noviembre: 11,
  dez: 12,
  dezembro: 12,
  dec: 12,
  december: 12,
  dic: 12,
  diciembre: 12,
}

type DateReference = {
  day: number | null
  index: number
  length: number
  month: number | null
  year: number
}
type ChatExperience = ChatProfile['experiences'][number]

const monthTokenSource = Object.keys(monthNumberByToken)
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')

const normalizedYear = (value: string): number => {
  const year = Number(value)
  return value.length === 2 ? 2000 + year : year
}

const extractDateReferences = (text: string): DateReference[] => {
  const references: DateReference[] = []

  const add = (
    match: RegExpMatchArray,
    month: number | null,
    year: number,
    day: number | null = null,
  ): void => {
    const index = match.index ?? 0
    const length = match[0].length
    if (
      !Number.isInteger(year) ||
      references.some(
        (reference) =>
          index < reference.index + reference.length && reference.index < index + length,
      )
    ) {
      return
    }
    references.push({ day, index, length, month, year })
  }

  const patterns: Array<{
    day?: number
    month: number | ((match: RegExpMatchArray) => number)
    pattern: RegExp
    year: number
  }> = [
    {
      day: 1,
      month: (match) => monthNumberByToken[match[2] ?? ''] ?? 0,
      pattern: new RegExp(
        `\\b(\\d{1,2})\\s+(?:(?:de|del|of)\\s+)?(${monthTokenSource})\\.?\\s+(?:(?:de|del|of)\\s+)?((?:19|20)\\d{2})\\b`,
        'g',
      ),
      year: 3,
    },
    {
      day: 2,
      month: (match) => monthNumberByToken[match[1] ?? ''] ?? 0,
      pattern: new RegExp(
        `\\b(${monthTokenSource})\\.?\\s+(\\d{1,2})(?:st|nd|rd|th)?\\s+((?:19|20)\\d{2})\\b`,
        'g',
      ),
      year: 3,
    },
    {
      month: (match) => monthNumberByToken[match[1] ?? ''] ?? 0,
      pattern: new RegExp(
        `\\b(${monthTokenSource})\\.?\\s*(?:(?:de|del|of)\\s+)?((?:19|20)\\d{2})\\b`,
        'g',
      ),
      year: 2,
    },
    {
      month: (match) => monthNumberByToken[match[1] ?? ''] ?? 0,
      pattern: new RegExp(
        `\\b(${monthTokenSource})\\.?\\s*[/.-]\\s*(\\d{2}|(?:19|20)\\d{2})\\b`,
        'g',
      ),
      year: 2,
    },
    {
      day: 2,
      month: 1,
      pattern: /\b(0?[1-9]|1[0-2])[-/.](\d{1,2})[-/.]((?:19|20)\d{2})\b/g,
      year: 3,
    },
    {
      day: 3,
      month: 2,
      pattern: /\b((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])[-/.](\d{1,2})\b/g,
      year: 1,
    },
    {
      month: 2,
      pattern: /\b((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])\b/g,
      year: 1,
    },
    {
      month: 1,
      pattern: /\b(0?[1-9]|1[0-2])[-/.](\d{2}|(?:19|20)\d{2})\b/g,
      year: 2,
    },
  ]

  for (const definition of patterns) {
    for (const match of text.matchAll(definition.pattern)) {
      const month =
        typeof definition.month === 'function'
          ? definition.month(match)
          : Number(match[definition.month])
      const year = normalizedYear(match[definition.year] ?? '')
      const day = definition.day ? Number(match[definition.day]) : null
      if (month >= 1 && month <= 12) add(match, month, year, day)
    }
  }

  for (const match of text.matchAll(plausibleYearPattern)) {
    const index = match.index ?? 0
    const followedByMetricSyntax =
      /^\+|^\s*(?:anos?|years?|lojas?|stores?|tiendas?|estoquistas?|stock\s+clerks?|clientes?|clients?|customers?|usuarios?|users?|projetos?|projects?|proyectos?|equipes?|teams?|pessoas?|people|produtos?|products?)\b/.test(
        text.slice(index + match[0].length),
      )
    const belongsToPreciseDate = references.some(
      (reference) => index >= reference.index && index < reference.index + reference.length,
    )
    if (!belongsToPreciseDate && !followedByMetricSyntax) {
      references.push({
        day: null,
        index,
        length: match[0].length,
        month: null,
        year: Number(match[0]),
      })
    }
  }
  return references.sort((left, right) => left.index - right.index)
}

const splitAssociationClauses = (text: string): string[] =>
  text
    .split(
      /[!?;\n]+|(?<!\d)\.+|\.+(?!\d)|,(?!\d|\s*(?:(?:nao|no)\s+(?:por|como)|not\s+(?:through|as)))|\s+(?:e|and|y|mas|but|pero)\s+/,
    )
    .map((clause) => clause.trim())
    .filter(Boolean)

const companyAlias = (experience: ChatExperience): string =>
  experience.company.split(/\s+/)[0] ?? experience.company

const clauseContainsWildcardedAlias = (clause: string, alias: string): boolean => {
  const wildcardedAlias = [...alias]
    .map((character) => `(?:${escapeRegExp(character)}|[^\\x00-\\x7f])`)
    .join('')
  const aliasPattern = new RegExp(`(?<![\\p{L}\\p{N}])(${wildcardedAlias})(?![\\p{L}\\p{N}])`, 'gu')
  return [...clause.matchAll(aliasPattern)].some((match) =>
    [...(match[1] ?? '')].some((character) => (character.codePointAt(0) ?? 0) > 0x7f),
  )
}

const clauseMentionsCompany = (clause: string, experience: ChatExperience): boolean => {
  const alias = normalizedForAssociation(companyAlias(experience))
  if (new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(clause)) return true
  return clauseContainsWildcardedAlias(clause, alias)
}

const clauseSeparatesExperience = (clause: string, experience: ChatExperience): boolean => {
  const company = escapeRegExp(normalizedForAssociation(companyAlias(experience)))
  return [
    new RegExp(`\\b(?:nao|no|not)\\s+(?:na|no|en|at)\\s+(?:a\\s+)?${company}\\b`),
    new RegExp(`\\b(?:incorreto|incorrecto|incorrect|falso|false)\\b[^.;]{0,80}\\b${company}\\b`),
    new RegExp(`\\b(?:antes\\s+(?:de|da|do)|before)\\s+(?:a\\s+|the\\s+)?${company}\\b`),
  ].some((pattern) => pattern.test(clause))
}

type AssertionKind = 'end' | 'presence' | 'start'
type EmploymentAssertion = {
  index: number
  kind: AssertionKind
  length: number
  text: string
}

const assertionSources: Array<[AssertionKind, string]> = [
  [
    'end',
    '(?:meu\\s+)?ultimo\\s+mes|last\\s+month|sai|saiu|sair|deixei|deixou|deixaste|dejaste|encerrei|encerrou|leave|leaves|left|end|ended|terminou|terminei|terminaste|termino|sali|saliste|salio',
  ],
  [
    'start',
    'comecei|comecou|comecar|comecado|comecaste|entrei|entrou|entrar|ingressei|ingressou|iniciei|iniciou|iniciar|contratado|contratada|contracted|hire|hired|start|started|begin|began|begun|join|joined|enter|entered|empece|empezaste|empezo|empezado|comence|comenzaste|comenzo|incorporei|incorpore|incorporaste|incorporou|incorporo|entraste|entro',
  ],
  [
    'presence',
    'era\\s+funcionario|was\\s+not\\s+at|was\\s+at|trabalho|trabalhava|trabalhei|atuava|estava|working|worked|work|trabajaba|trabaje|estaba',
  ],
]

const extractEmploymentAssertions = (clause: string): EmploymentAssertion[] => {
  const assertions: EmploymentAssertion[] = []
  for (const [kind, source] of assertionSources) {
    for (const match of clause.matchAll(new RegExp(`\\b(?:${source})\\b`, 'g'))) {
      assertions.push({
        index: match.index ?? 0,
        kind,
        length: match[0].length,
        text: match[0],
      })
    }
  }
  return assertions.sort((left, right) => left.index - right.index)
}

const nearestAssertion = (
  reference: DateReference,
  assertions: EmploymentAssertion[],
): EmploymentAssertion | null => {
  let nearest: EmploymentAssertion | null = null
  let nearestDistance = Number.POSITIVE_INFINITY
  for (const assertion of assertions) {
    const assertionEnd = assertion.index + assertion.length
    const referenceEnd = reference.index + reference.length
    const distance =
      assertionEnd <= reference.index
        ? reference.index - assertionEnd
        : referenceEnd <= assertion.index
          ? assertion.index - referenceEnd
          : 0
    if (
      distance < nearestDistance ||
      (distance === nearestDistance && assertion.index > (nearest?.index ?? -1))
    ) {
      nearest = assertion
      nearestDistance = distance
    }
  }
  return nearest
}

const explicitBoundaryKind = (clause: string, reference: DateReference): AssertionKind | null => {
  const beforeReference = clause.slice(0, reference.index)
  if (/\b(?:a|ate|to|until|hasta)\s*$/.test(beforeReference)) return 'end'
  if (/\b(?:de|desde|since|from)\s*$/.test(beforeReference)) return 'start'
  return null
}

const temporalFragmentIsNegated = (clause: string, reference: DateReference): boolean =>
  /\b(?:nao|no|not|never|nunca)(?:\s+(?:em|en|in))?\s*$/.test(clause.slice(0, reference.index))

const assertionNegatesReference = (
  clause: string,
  assertion: EmploymentAssertion,
  reference: DateReference,
  assertions: EmploymentAssertion[],
): boolean => {
  if (/\b(?:nao|not|never|nunca)\b/.test(assertion.text)) return true
  const assertionIndex = assertions.indexOf(assertion)
  const priorAssertion = assertions[assertionIndex - 1]
  const prefixStart = priorAssertion ? priorAssertion.index + priorAssertion.length : 0
  const beforeAssertion = clause.slice(prefixStart, assertion.index)
  if (
    !/\b(?:nao\s+so|not\s+only|no\s+solo)\b/.test(beforeAssertion) &&
    /(?:^|[\s,:])(?:nao|no|not|never|nunca)(?:\s+(?:eu|i|yo|ainda|aun|ever|yet|realmente|really|tinha|had|habia|did|was|era))*\s*$/.test(
      beforeAssertion,
    )
  ) {
    return true
  }

  if (assertion.index < reference.index) {
    const between = clause.slice(assertion.index + assertion.length, reference.index)
    if (
      /\b(?:nao|not|never|nunca)\s+(?:(?:em|en|in)\s*)?$/.test(between) ||
      /\bno\s+(?:en|durante)\s*$/.test(between)
    ) {
      return true
    }
  } else {
    const beforeReference = clause.slice(Math.max(0, reference.index - 48), reference.index)
    const between = clause.slice(reference.index + reference.length, assertion.index)
    const spanishCleft = /\bno\s+fue\s+en\s*$/.test(beforeReference)
    const hasCleftNegation =
      spanishCleft || /\b(?:(?:it\s+)?was\s+not\s+in|nao\s+foi\s+em)\s*$/.test(beforeReference)
    const hasCleftConnector = spanishCleft
      ? /^\s*(?:(?:que|cuando)\s+)?(?:yo\s+)?\s*$/.test(between)
      : /^\s*(?:que\s+|that\s+)?(?:eu\s+|i\s+|yo\s+)?\s*$/.test(between)
    if (hasCleftNegation && hasCleftConnector) {
      return true
    }
  }

  return false
}

const dateSerial = (date: string): number => {
  const [year, month] = date.split('-').map(Number)
  return year * 12 + month
}

const referenceOutsideExperience = (
  reference: DateReference,
  experience: ChatExperience,
  runtime: ChatRuntimeContext,
): boolean => {
  const startYear = Number(experience.startDate.slice(0, 4))
  const endDate = experience.endDate ?? runtime.currentDate.slice(0, 7)
  const endYear = Number(endDate.slice(0, 4))
  if (reference.month === null) return reference.year < startYear || reference.year > endYear
  const referenceSerial = reference.year * 12 + reference.month
  return referenceSerial < dateSerial(experience.startDate) || referenceSerial > dateSerial(endDate)
}

type TemporalClaim = {
  experience: ChatExperience | null
  kind: AssertionKind
  negated: boolean
  reference: DateReference
}

const boundaryMatchesReference = (reference: DateReference, boundary: string): boolean => {
  const [year, month] = boundary.split('-').map(Number)
  return reference.year === year && (reference.month === null || reference.month === month)
}

const temporalClaimConflicts = (claim: TemporalClaim, runtime: ChatRuntimeContext): boolean => {
  if (!claim.experience || claim.negated) return false
  if (claim.reference.day !== null) return true
  if (claim.kind === 'start') {
    return !boundaryMatchesReference(claim.reference, claim.experience.startDate)
  }
  if (claim.kind === 'end') {
    if (!claim.experience.endDate) return true
    return !boundaryMatchesReference(claim.reference, claim.experience.endDate)
  }
  return referenceOutsideExperience(claim.reference, claim.experience, runtime)
}

const resolvesPendingEmployer = (clause: string): boolean =>
  /\b(?:foi|fue|was)\s+(?:(?:na|no|at|en)\s+)?/.test(clause)

const carriesTemporalTopic = (clause: string): boolean =>
  /\b(?:(?:isso|isto|eso|esto|that|it)|(?:essa|esta|aquela|esse|este|aquele)\s+(?:mudanca|transicao|entrada|saida|contratacao|evento|movimento)|(?:this|that|the)\s+(?:change|transition|entry|departure|hiring|event|move)|(?:ese|esa|este|esta|aquel|aquella)\s+(?:cambio|transicion|entrada|salida|contratacion|evento|movimiento))\b[^.;]{0,48}\b(?:aconteceu|ocorreu|se\s+deu|happened|occurred|took\s+place|ocurrio|sucedio|tuvo\s+lugar|foi|fue|was)\b/.test(
    clause,
  )

const isGlobalCareerClaim = (clause: string): boolean =>
  /\b(?:minha\s+(?:carreira|trajetoria)|my\s+(?:career|trajectory)|mi\s+(?:carrera|trayectoria)|(?:area|campo|field|setor|sector|industry)(?:\s+de|\s+of|\s+in|\s+en)?\s+(?:tecnologia|technology|software)|(?:tecnologia|technology|software)\s+(?:area|campo|field|setor|sector|industry))\b/.test(
    clause,
  )

const extractTemporalClaims = (text: string, input: ChatValidationInput): TemporalClaim[] => {
  const claims: TemporalClaim[] = []
  const clauses = splitAssociationClauses(text)
  let lastExperience: { experience: ChatExperience; segment: number } | null = null
  let pendingContext: {
    experience: ChatExperience
    kind: AssertionKind
    negated: boolean
    segment: number
  } | null = null
  let pendingUnscoped: Array<TemporalClaim & { requiresResolver: boolean; segment: number }> = []

  clauses.forEach((clause, segment) => {
    const explicitExperiences = input.profile.experiences.filter(
      (experience) =>
        clauseMentionsCompany(clause, experience) && !clauseSeparatesExperience(clause, experience),
    )
    const explicitExperience =
      explicitExperiences.length === 1 ? (explicitExperiences[0] ?? null) : null
    const references = extractDateReferences(clause)
    const assertions = extractEmploymentAssertions(clause)
    const globalCareerClaim = isGlobalCareerClaim(clause)

    if (
      pendingContext &&
      (globalCareerClaim ||
        (explicitExperience !== null && explicitExperience !== pendingContext.experience))
    ) {
      pendingContext = null
    }

    if (explicitExperience && pendingUnscoped.length) {
      for (const pending of pendingUnscoped) {
        if (
          segment - pending.segment === 1 &&
          (!pending.requiresResolver || resolvesPendingEmployer(clause))
        ) {
          claims.push({ ...pending, experience: explicitExperience })
        }
      }
      pendingUnscoped = []
    } else if (pendingUnscoped.some((pending) => segment - pending.segment > 1)) {
      pendingUnscoped = []
    }

    const carriedExperience =
      !explicitExperience &&
      !globalCareerClaim &&
      lastExperience &&
      segment - lastExperience.segment === 1
        ? lastExperience.experience
        : null
    const contextDistance = pendingContext
      ? segment - pendingContext.segment
      : Number.POSITIVE_INFINITY
    const context =
      pendingContext &&
      (carriesTemporalTopic(clause) ||
        (contextDistance === 1 && references.length > 0 && assertions.length === 0))
        ? pendingContext
        : null
    const associatedExperience = explicitExperience ?? context?.experience ?? carriedExperience

    if (references.length) {
      if (assertions.length) {
        for (const reference of references) {
          const assertion = nearestAssertion(reference, assertions)
          if (!assertion) continue
          const claim: TemporalClaim = {
            experience: associatedExperience,
            kind: explicitBoundaryKind(clause, reference) ?? assertion.kind,
            negated: assertionNegatesReference(clause, assertion, reference, assertions),
            reference,
          }
          claims.push(claim)
          if (!associatedExperience) {
            pendingUnscoped.push({ ...claim, requiresResolver: true, segment })
          }
        }
      } else {
        const timeline = explicitExperience && references.length >= 2 && clause.includes(':')
        const hyphenatedRange =
          associatedExperience !== null &&
          references.length === 2 &&
          /^\s*-\s*$/.test(
            clause.slice(
              (references[0]?.index ?? 0) + (references[0]?.length ?? 0),
              references[1]?.index ?? 0,
            ),
          )
        const inferredKind: AssertionKind = /\b(?:desde|since)\b/.test(clause)
          ? 'start'
          : /\b(?:ate|until|hasta)\b/.test(clause)
            ? 'end'
            : /\b(?:ultimo\s+mes|last\s+month)\b/.test(clause)
              ? 'end'
              : (context?.kind ?? 'presence')
        references.forEach((reference, referenceIndex) => {
          const kind: AssertionKind =
            explicitBoundaryKind(clause, reference) ??
            (timeline || hyphenatedRange ? (referenceIndex === 0 ? 'start' : 'end') : inferredKind)
          const negated = context?.negated ?? temporalFragmentIsNegated(clause, reference)
          const claim: TemporalClaim = {
            experience: associatedExperience,
            kind,
            negated,
            reference,
          }
          claims.push(claim)
          if (!associatedExperience) {
            pendingUnscoped.push({ ...claim, requiresResolver: false, segment })
          }
        })
      }
      pendingContext = null
    } else if (explicitExperience && assertions.length) {
      const assertion = assertions.at(-1)
      if (assertion) {
        pendingContext = {
          experience: explicitExperience,
          kind: assertion.kind,
          negated: assertionNegatesReference(
            clause,
            assertion,
            { day: null, index: clause.length, length: 0, month: null, year: 0 },
            assertions,
          ),
          segment,
        }
      }
    }

    if (explicitExperience) lastExperience = { experience: explicitExperience, segment }
  })

  return claims
}

const sameTemporalReference = (left: DateReference, right: DateReference): boolean =>
  left.year === right.year &&
  (left.month === null || right.month === null || left.month === right.month)

const answerAffirmsFalseVisitorPremise = (
  answer: string,
  visitorMessage: string,
  input: ChatValidationInput,
): boolean => {
  const falsePremises = extractTemporalClaims(visitorMessage, input).filter((claim) =>
    temporalClaimConflicts(claim, input.runtime),
  )
  if (!falsePremises.length) return false

  const dialogueLead = answer.trim().replace(/^[^\p{L}\p{N}]+/u, '')
  const startsWithAffirmation =
    /^(?:sim|yes|si|correto|correct|correcto|isso\s+mesmo|exato|exacto|exatamente|exactly)\b/.test(
      dialogueLead,
    )
  if (startsWithAffirmation) return true

  const temporalCoreference =
    /\b(?:(?:nesse|neste|naquele|nessa|nesta|naquela)\s+(?:ano|mes|epoca|data)|at\s+that\s+time|back\s+then|then|(?:ese|esa|aquel|aquella)\s+(?:ano|mes|epoca)|en\s+ese\s+momento|foi\s+quando|fue\s+entonces)\b/
  if (
    temporalCoreference.test(answer) &&
    !/^(?:nao|no)\b|\b(?:not|never|nunca)\b/.test(dialogueLead)
  ) {
    const explicitlyMentioned = input.profile.experiences.filter(
      (experience) =>
        clauseMentionsCompany(answer, experience) && !clauseSeparatesExperience(answer, experience),
    )
    if (
      !explicitlyMentioned.length ||
      falsePremises.some(
        (premise) => premise.experience && explicitlyMentioned.includes(premise.experience),
      )
    ) {
      return true
    }
  }

  const answerClaims = extractTemporalClaims(answer, input)
  return answerClaims.some(
    (claim) =>
      !claim.negated &&
      falsePremises.some(
        (premise) =>
          claim.kind === premise.kind &&
          sameTemporalReference(claim.reference, premise.reference) &&
          (!claim.experience || claim.experience === premise.experience),
      ),
  )
}

const answerHasCanonicalDateConflict = (
  answer: string,
  visitorMessage: string,
  input: ChatValidationInput,
): boolean => {
  const claims = extractTemporalClaims(answer, input)
  return (
    claims.some((claim) => temporalClaimConflicts(claim, input.runtime)) ||
    answerAffirmsFalseVisitorPremise(answer, visitorMessage, input)
  )
}

type MetricComparator = 'at-least' | 'exact' | 'percent'
type MetricKind = 'career' | 'outcome' | 'software' | 'structural'
type CanonicalOutcomePredicate = 'contribution' | 'operations' | 'support' | 'usage'
type MetricReference = {
  comparator: MetricComparator
  index: number
  kind: MetricKind
  length: number
  outcomePredicate: CanonicalOutcomePredicate | null
  unit: string
  value: number
}

const metricUnitDefinitions: Array<[string, RegExp]> = [
  ['years', /^(?:anos?|years?)/],
  ['stores', /^(?:lojas?|stores?|tiendas?)/],
  ['stock-clerks', /^(?:estoquistas?|stock\s+clerks?|almacenistas?)/],
  ['clients', /^(?:clientes?|clients?|customers?|consumidores?|consumers?)/],
  ['users', /^(?:usuarios?|users?)/],
  ['projects', /^(?:projetos?|projects?|proyectos?)/],
  ['teams', /^(?:equipes?|teams?|equipos?)/],
  ['people', /^(?:pessoas?|people|personas?|developers?|desenvolvedores?)/],
  ['products', /^(?:produtos?|products?|productos?)/],
  ['applications', /^(?:apps?|aplicacoes?|applications?|aplicaciones?)/],
  ['integrations', /^(?:integracoes?|integrations?|integraciones?)/],
  ['apis', /^(?:apis?)/],
  ['companies', /^(?:empresas?|companies|companias?)/],
  ['downloads', /^(?:downloads?)/],
  ['countries', /^(?:paises?|countries)/],
  ['deliveries', /^(?:entregas?|deliveries?)/],
  ['requests', /^(?:requisicoes?|requests?|solicitudes?)/],
  ['records', /^(?:registros?|records?)/],
  ['months', /^(?:meses?|months?)/],
  ['days', /^(?:dias?|days?)/],
  ['hours', /^(?:horas?|hours?)/],
  ['percent', /^(?:percent|por\s+cento|por\s+ciento)/],
]

const metricUnit = (value: string): string | null => {
  const unit = value.trim().replace(/^(?:main|principais?|principales?)\s+/, '')
  return metricUnitDefinitions.find(([, pattern]) => pattern.test(unit))?.[0] ?? null
}

const metricNumberValues: Record<string, number> = {
  zero: 0,
  cero: 0,
  um: 1,
  uma: 1,
  un: 1,
  una: 1,
  one: 1,
  dois: 2,
  duas: 2,
  dos: 2,
  two: 2,
  tres: 3,
  three: 3,
  quatro: 4,
  cuatro: 4,
  four: 4,
  cinco: 5,
  five: 5,
  seis: 6,
  six: 6,
  siete: 7,
  sete: 7,
  seven: 7,
  oito: 8,
  ocho: 8,
  eight: 8,
  nove: 9,
  nueve: 9,
  nine: 9,
  dez: 10,
  diez: 10,
  ten: 10,
  onze: 11,
  once: 11,
  eleven: 11,
  doze: 12,
  doce: 12,
  twelve: 12,
  treze: 13,
  thirteen: 13,
  catorce: 14,
  quatorze: 14,
  fourteen: 14,
  quinze: 15,
  quince: 15,
  fifteen: 15,
  dezesseis: 16,
  dieciseis: 16,
  sixteen: 16,
  dezessete: 17,
  diecisiete: 17,
  seventeen: 17,
  dezoito: 18,
  dieciocho: 18,
  eighteen: 18,
  dezenove: 19,
  diecinueve: 19,
  nineteen: 19,
  vinte: 20,
  veinte: 20,
  twenty: 20,
  veintiuno: 21,
  veintidos: 22,
  veintitres: 23,
  veinticuatro: 24,
  veinticinco: 25,
  veintiseis: 26,
  veintisiete: 27,
  veintiocho: 28,
  veintinueve: 29,
  trinta: 30,
  treinta: 30,
  thirty: 30,
  quarenta: 40,
  cuarenta: 40,
  forty: 40,
  cinquenta: 50,
  cincuenta: 50,
  fifty: 50,
  sessenta: 60,
  sesenta: 60,
  sixty: 60,
  setenta: 70,
  seventy: 70,
  oitenta: 80,
  ochenta: 80,
  eighty: 80,
  noventa: 90,
  ninety: 90,
}

const metricHundredValues: Record<string, number> = {
  cem: 100,
  cento: 100,
  cien: 100,
  ciento: 100,
  duzentos: 200,
  duzentas: 200,
  doscientos: 200,
  doscientas: 200,
  trezentos: 300,
  trezentas: 300,
  trescientos: 300,
  trescientas: 300,
  quatrocentos: 400,
  quatrocentas: 400,
  cuatrocientos: 400,
  cuatrocientas: 400,
  quinhentos: 500,
  quinhentas: 500,
  quinientos: 500,
  quinientas: 500,
  seiscentos: 600,
  seiscentas: 600,
  seiscientos: 600,
  seiscientas: 600,
  setecentos: 700,
  setecentas: 700,
  setecientos: 700,
  setecientas: 700,
  oitocentos: 800,
  oitocentas: 800,
  ochocientos: 800,
  ochocientas: 800,
  novecentos: 900,
  novecentas: 900,
  novecientos: 900,
  novecientas: 900,
}

const thousandScaleTokens = new Set(['mil', 'thousand', 'thousands', 'milhares', 'miles'])
const millionScaleTokens = new Set([
  'milhao',
  'milhoes',
  'million',
  'millions',
  'millon',
  'millones',
])
const pluralVagueScaleTokens = new Set([
  'milhares',
  'miles',
  'thousands',
  'milhoes',
  'millions',
  'millones',
])
const metricNumberConnectors = new Set(['e', 'and', 'y', 'de', 'of'])

type ParsedMetricNumber = { vague: boolean; value: number }

const parseMetricNumberPhrase = (phrase: string): ParsedMetricNumber | null => {
  const tokens = phrase.split(/[\s-]+/).filter(Boolean)
  let group = 0
  let total = 0
  let vague = false
  let sawNumber = false
  let previousWasDigits = false

  for (const token of tokens) {
    if (metricNumberConnectors.has(token)) {
      previousWasDigits = false
      continue
    }
    if (/^\d+$/.test(token)) {
      if (previousWasDigits) return null
      const numericToken = Number(token)
      group = numericToken >= 1_000 && group === 1 ? numericToken : group + numericToken
      sawNumber = true
      previousWasDigits = true
      continue
    }
    previousWasDigits = false
    const directValue = metricNumberValues[token]
    if (directValue !== undefined) {
      group += directValue
      sawNumber = true
      continue
    }
    const hundredValue = metricHundredValues[token]
    if (hundredValue !== undefined) {
      group += hundredValue
      sawNumber = true
      continue
    }
    if (token === 'hundred' || token === 'hundreds') {
      group = (group || (token === 'hundreds' ? 2 : 1)) * 100
      vague ||= token === 'hundreds'
      sawNumber = true
      continue
    }
    const scale = thousandScaleTokens.has(token)
      ? 1_000
      : millionScaleTokens.has(token)
        ? 1_000_000
        : null
    if (scale) {
      const standaloneVague = group === 0 && pluralVagueScaleTokens.has(token)
      total += (group || (standaloneVague ? 2 : 1)) * scale
      vague ||= standaloneVague
      group = 0
      sawNumber = true
      continue
    }
    return null
  }

  const value = total + group
  return sawNumber && Number.isSafeInteger(value) && value >= 0 ? { vague, value } : null
}

const metricUnitTokenSource =
  'anos?|years?|lojas?|stores?|tiendas?|estoquistas?|stock\\s+clerks?|almacenistas?|clientes?|clients?|customers?|consumidores?|consumers?|usuarios?|users?|projetos?|projects?|proyectos?|equipes?|teams?|equipos?|pessoas?|people|personas?|developers?|desenvolvedores?|produtos?|products?|productos?|apps?|aplicacoes?|applications?|aplicaciones?|integracoes?|integrations?|integraciones?|apis?|empresas?|companies|companias?|downloads?|paises?|countries|entregas?|deliveries?|requisicoes?|requests?|solicitudes?|registros?|records?|meses?|months?|dias?|days?|horas?|hours?|percent|por\\s+cento|por\\s+ciento'

const maskOrderedListMarkers = (text: string): string => {
  let expectedMarker = 1
  return text
    .split('\n')
    .map((line) => {
      const marker = line.match(/^(\s*)(\d+)(?:[.)])(?=\s+\S)/)
      if (!marker) {
        expectedMarker = 1
        return line
      }

      const markerNumber = Number(marker[2])
      if (markerNumber !== expectedMarker) {
        expectedMarker = 1
        return line
      }

      expectedMarker += 1
      const markerStart = marker[1]?.length ?? 0
      const markerLength = marker[2]?.length ?? 0
      return `${line.slice(0, markerStart)}${' '.repeat(markerLength)}${line.slice(markerStart + markerLength)}`
    })
    .join('\n')
}

const canonicalTechnologyAliases = (profile: ChatProfile): string[] =>
  [
    ...profile.projects.flatMap((project) => project.technologies),
    ...profile.technicalAreas.flatMap((area) => area.items),
  ]
    .map(normalizedForAssociation)
    .filter(Boolean)
    .filter((technology, index, technologies) => technologies.indexOf(technology) === index)
    .sort((left, right) => right.length - left.length)

const maskCanonicalTechnologyVersions = (text: string, profile: ChatProfile): string => {
  const technologySource = canonicalTechnologyAliases(profile).map(escapeRegExp).join('|')
  if (!technologySource) return text

  const versionPattern = new RegExp(
    `(?<![\\p{L}\\p{N}])(?:${technologySource})(?![\\p{L}\\p{N}])[ \\t]+(?:v(?:ersion)?[ \\t]*)?(\\d+(?:\\.\\d+){0,3})(?![\\p{L}\\p{N}])`,
    'gu',
  )
  return text.replace(versionPattern, (match, version: string, offset: number) => {
    const versionOffset = match.lastIndexOf(version)
    const suffix = text.slice(offset + versionOffset + version.length)
    const followingWords = suffix.match(/^\s*(?:\+|%)?\s*([a-z]+(?:\s+[a-z]+){0,3})/)?.[1] ?? ''
    if (metricUnit(followingWords)) return match
    return `${match.slice(0, versionOffset)}${' '.repeat(version.length)}${match.slice(versionOffset + version.length)}`
  })
}

const maskNonMetricNumbers = (text: string, profile: ChatProfile): string =>
  maskCanonicalTechnologyVersions(maskOrderedListMarkers(text), profile)

const metricNumberAtomSource = [
  ...Object.keys(metricNumberValues),
  ...Object.keys(metricHundredValues),
  'hundred',
  'hundreds',
  ...thousandScaleTokens,
  ...millionScaleTokens,
]
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')

const compositionalMetricNumberPattern = new RegExp(
  `\\b((?:${metricNumberAtomSource}|\\d+)(?:(?:\\s+|-)(?:${metricNumberAtomSource}|\\d+|e|and|y|de|of)){0,12})\\b(?=\\s*(?:\\+|%)?\\s*(?:(?:de|of)\\s+)?(?:(?:main|principais?|principales?)\\s+)?(?:${metricUnitTokenSource})\\b)`,
  'g',
)

const normalizeCompositionalMetricNumbers = (text: string): string =>
  text.replace(compositionalMetricNumberPattern, (phrase) => {
    if (/^\d+$/.test(phrase)) return phrase
    const parsed = parseMetricNumberPhrase(phrase)
    if (!parsed) return phrase
    return `${parsed.value}${parsed.vague ? '+' : ''}`
  })

const spansOverlap = (
  leftIndex: number,
  leftLength: number,
  rightIndex: number,
  rightLength: number,
): boolean => leftIndex < rightIndex + rightLength && rightIndex < leftIndex + leftLength

const metricKind = (clause: string, unit: string, value: number): MetricKind => {
  if (unit === 'years') {
    if (/\b(?:software|tecnologia|technology|desenvolvimento|development)\b/.test(clause)) {
      return 'software'
    }
    if (/\b(?:trajetoria|carreira|career|profissional|professional|trayectoria)\b/.test(clause)) {
      return 'career'
    }
    return value === 10 ? 'career' : 'software'
  }
  if (unit === 'projects' && /\b(?:tenho|possuo|i\s+have|have|tengo|cuento\s+con)\b/.test(clause)) {
    return 'structural'
  }
  return 'outcome'
}

const canonicalOutcomePredicate = (clause: string): CanonicalOutcomePredicate | null => {
  if (
    /\b(?:contribui|contribuo|contribuir|contribute|contributes|contributed|contributing)\b/.test(
      clause,
    )
  ) {
    return 'contribution'
  }
  if (
    /\b(?:apoiei|apoio|apoiar|support|supports|supported|supporting|apoye|apoyo|respald[eo])\b/.test(
      clause,
    )
  ) {
    return 'support'
  }
  if (/\b(?:productos?|products?|produtos?)\s+(?:usados?|used|utilizados?)\b/.test(clause)) {
    return 'usage'
  }
  if (
    /\b(?:atuei|atuava|trabalhei|trabalho|worked|work|trabaje|trabajaba|operei|operated)\b[^.;]{0,64}\b(?:operacoes|operations|operaciones)\b/.test(
      clause,
    )
  ) {
    return 'operations'
  }
  return null
}

const extractMetrics = (text: string): MetricReference[] => {
  const references: MetricReference[] = []
  const metricText = normalizeCompositionalMetricNumbers(text)
  const dates = extractDateReferences(metricText)
  const pattern =
    /\b(?:(mais de|more than|over|at least|pelo menos|mas de|al menos)\s+)?(\d{1,3}(?:(?:[.,]|\s)\d{3})+|\d+)\s*(?:(milhoes?|millions?|million|millones?|millon|mil|thousands?|k|m)\b\s*)?(\+|%)?\s*(?:(?:de|of)\s+)?/g
  let match = pattern.exec(metricText)
  while (match) {
    const prefix = match[1] ?? ''
    const rawNumber = match[2] ?? ''
    const scale = match[3] ?? ''
    const suffix = match[4] ?? ''
    const matchIndex = match.index ?? 0
    const matchLength = match[0].length
    if (dates.some((date) => spansOverlap(matchIndex, matchLength, date.index, date.length))) {
      match = pattern.exec(metricText)
      continue
    }

    const remaining = metricText.slice(pattern.lastIndex)
    const followingWords = remaining.match(/^\s*([a-z]+(?:\s+[a-z]+){0,3})/)?.[1] ?? ''
    let unit = suffix === '%' ? 'percent' : metricUnit(followingWords)
    const grouped = /[.,\s]/.test(rawNumber)
    const scaleMultiplier = /^(?:milhao|milhoes|million|millions|millon|millones|m)$/.test(scale)
      ? 1_000_000
      : /^(?:mil|thousands?|k)$/.test(scale)
        ? 1_000
        : 1
    const numericValue = Number(rawNumber.replace(/\D/g, '')) * scaleMultiplier
    const adjacentToDateSeparator = /[-/.]/.test(
      `${metricText[matchIndex - 1] ?? ''}${metricText[matchIndex + match[0].trimEnd().length] ?? ''}`,
    )
    const plausibleYear =
      !grouped && !scale && !suffix && numericValue >= 1900 && numericValue <= 2099
    const identifierPrefix =
      /\b(?:ticket|id|codigo|code|status|porta|port|versao|version)\s*[:#-]?\s*$/
    const looksLikeIdentifier = identifierPrefix.test(
      metricText.slice(Math.max(0, matchIndex - 32), matchIndex),
    )
    if (looksLikeIdentifier) {
      match = pattern.exec(metricText)
      continue
    }
    if (!unit && !plausibleYear && !adjacentToDateSeparator) {
      unit = followingWords.split(/\s+/)[0] || (scale ? 'scaled-count' : 'count')
    }
    if (unit) {
      const trailingAtLeast = /^\s*(?:anos?|years?)\s+(?:ou\s+mais|or\s+more|o\s+mas)\b/.test(
        remaining,
      )
      const comparator: MetricComparator =
        suffix === '%'
          ? 'percent'
          : suffix === '+' || prefix || trailingAtLeast
            ? 'at-least'
            : 'exact'
      references.push({
        comparator,
        index: matchIndex,
        kind: metricKind(metricText, unit, numericValue),
        length: matchLength,
        outcomePredicate: canonicalOutcomePredicate(metricText),
        unit,
        value: numericValue,
      })
    }
    match = pattern.exec(metricText)
  }
  return references
}

type CanonicalMetricScope = 'employer' | 'global' | 'structural'
type CanonicalMetricFact = {
  comparator: Exclude<MetricComparator, 'percent'>
  companyAlias?: string
  kind: MetricKind
  requiresOutcomePredicate: boolean
  scope: CanonicalMetricScope
  unit: string
  value: number
}

const CANONICAL_METRIC_FACTS = [
  {
    comparator: 'at-least',
    kind: 'software',
    requiresOutcomePredicate: false,
    scope: 'global',
    unit: 'years',
    value: 5,
  },
  {
    comparator: 'exact',
    kind: 'career',
    requiresOutcomePredicate: false,
    scope: 'global',
    unit: 'years',
    value: 10,
  },
  {
    comparator: 'exact',
    kind: 'structural',
    requiresOutcomePredicate: false,
    scope: 'structural',
    unit: 'projects',
    value: 3,
  },
  {
    comparator: 'at-least',
    companyAlias: 'luizalabs',
    kind: 'outcome',
    requiresOutcomePredicate: true,
    scope: 'employer',
    unit: 'stores',
    value: 1_000,
  },
  {
    comparator: 'at-least',
    companyAlias: 'luizalabs',
    kind: 'outcome',
    requiresOutcomePredicate: true,
    scope: 'employer',
    unit: 'stock-clerks',
    value: 1_000,
  },
] as const satisfies readonly CanonicalMetricFact[]

const metricComparatorMatchesFact = (
  metric: MetricReference,
  fact: CanonicalMetricFact,
): boolean => {
  if (metric.comparator === 'percent') return false
  if (fact.comparator === 'exact') return metric.comparator === 'exact'
  return metric.comparator === 'exact' || metric.comparator === 'at-least'
}

const metricMatchesFact = (metric: MetricReference, fact: CanonicalMetricFact): boolean =>
  metric.kind === fact.kind &&
  metric.unit === fact.unit &&
  metric.value === fact.value &&
  metricComparatorMatchesFact(metric, fact) &&
  (!fact.requiresOutcomePredicate || metric.outcomePredicate !== null)

const metricAllowedUnscoped = (metric: MetricReference): boolean =>
  CANONICAL_METRIC_FACTS.some((fact) => metricMatchesFact(metric, fact))

const metricAllowedForExperience = (
  metric: MetricReference,
  experience: ChatExperience,
): boolean => {
  const alias = normalizedForAssociation(companyAlias(experience))
  return CANONICAL_METRIC_FACTS.some(
    (fact) =>
      fact.scope === 'employer' && fact.companyAlias === alias && metricMatchesFact(metric, fact),
  )
}

const bareCompanyContext = (clause: string, experience: ChatExperience): boolean => {
  const company = escapeRegExp(normalizedForAssociation(companyAlias(experience)))
  return new RegExp(`^(?:(?:na|no|at|en)\\s+(?:a\\s+)?)?${company}$`).test(clause.trim())
}

const metricResultBridge = (clause: string): boolean =>
  /\b(?:isso|isto|esse|essa|este|esta|resultado|impacto|this|that|result|outcome|impact|eso|ese|esa)\b[^.;]{0,64}\b(?:aconteceu|ocorreu|se\s+deu|happened|occurred|foi|fue|was)\b/.test(
    clause,
  ) || /\b(?:foi|fue|was)\b[^.;]{0,48}\b(?:resultado|result|outcome|impacto|impact)\b/.test(clause)

const metricScopeCarriesAcross = (
  clauses: string[],
  metricClauseIndex: number,
  companyClauseIndex: number,
): boolean => {
  const distance = Math.abs(metricClauseIndex - companyClauseIndex)
  if (distance === 1) return true
  if (distance !== 2) return false
  const first = Math.min(metricClauseIndex, companyClauseIndex)
  const last = Math.max(metricClauseIndex, companyClauseIndex)
  return clauses.slice(first, last + 1).some(metricResultBridge)
}

const answerHasUnsupportedMetric = (answer: string, profile: ChatProfile): boolean => {
  const clauses = splitAssociationClauses(maskNonMetricNumbers(answer, profile))
  const companiesByClause = clauses.map((clause) =>
    profile.experiences.filter(
      (experience) =>
        clauseMentionsCompany(clause, experience) && !clauseSeparatesExperience(clause, experience),
    ),
  )
  const predicatesByClause = clauses.map(canonicalOutcomePredicate)
  let pendingOutcomeMetric: { clauseIndex: number; metric: MetricReference } | null = null

  for (const [clauseIndex, clause] of clauses.entries()) {
    const metrics = extractMetrics(clause).map((extractedMetric) => {
      const inheritedPredicate =
        !extractedMetric.outcomePredicate && /^(?:a|para|for|to)\b/.test(clause) && clauseIndex > 0
          ? (predicatesByClause[clauseIndex - 1] ?? null)
          : null
      return inheritedPredicate
        ? { ...extractedMetric, outcomePredicate: inheritedPredicate }
        : extractedMetric
    })
    const hasNewOutcome = metrics.some((metric) => metric.kind === 'outcome')
    if (hasNewOutcome) pendingOutcomeMetric = null

    const clauseExperiences = companiesByClause[clauseIndex] ?? []
    if (
      !hasNewOutcome &&
      pendingOutcomeMetric &&
      clauseExperiences.length &&
      (clauseIndex - pendingOutcomeMetric.clauseIndex === 1 || metricResultBridge(clause))
    ) {
      const pendingMetric = pendingOutcomeMetric.metric
      if (
        clauseExperiences.some(
          (experience) => !metricAllowedForExperience(pendingMetric, experience),
        )
      ) {
        return true
      }
      pendingOutcomeMetric = null
    }

    for (const metric of metrics) {
      let scopedExperiences = companiesByClause[clauseIndex] ?? []
      if (!scopedExperiences.length) {
        const carried = [clauseIndex - 1, clauseIndex - 2]
          .filter((index) => index >= 0 && index < clauses.length)
          .flatMap((index) => {
            const experiences = companiesByClause[index] ?? []
            if (experiences.length !== 1) return []
            const experience = experiences[0]
            if (!experience) return []
            const distance = Math.abs(index - clauseIndex)
            const bareContext =
              distance === 1 && bareCompanyContext(clauses[index] ?? '', experience)
            if (
              (metric.kind === 'outcome' &&
                metricScopeCarriesAcross(clauses, clauseIndex, index)) ||
              bareContext
            ) {
              return [experience]
            }
            return []
          })
        scopedExperiences = [...new Set(carried)]
      }
      if (!scopedExperiences.length && metric.kind !== 'outcome') {
        const nextClauseIndex = clauseIndex + 1
        const nextExperiences = companiesByClause[nextClauseIndex] ?? []
        const nextExperience = nextExperiences.length === 1 ? nextExperiences[0] : null
        if (nextExperience && bareCompanyContext(clauses[nextClauseIndex] ?? '', nextExperience)) {
          scopedExperiences = [nextExperience]
        }
      }

      if (scopedExperiences.length) {
        if (
          scopedExperiences.some((experience) => !metricAllowedForExperience(metric, experience))
        ) {
          return true
        }
        if (metric.kind === 'outcome') pendingOutcomeMetric = null
        continue
      }

      if (!metricAllowedUnscoped(metric)) return true
      if (metric.kind === 'outcome') pendingOutcomeMetric = { clauseIndex, metric }
    }
  }
  return false
}

export function validateChatAnswer(input: ChatValidationInput): ChatValidationResult {
  if (!input.answer.trim()) return { ok: false, code: 'empty' }
  if (input.answer.length > CHAT_MAX_ANSWER_CHARS) {
    return { ok: false, code: 'answer-too-large' }
  }

  const securityExpansion = expandSecurityScan(input.answer)
  if (securityExpansion.exhausted) return { ok: false, code: 'policy-canary' }
  if (containsInternalPolicy(securityExpansion.variants)) {
    return { ok: false, code: 'policy-canary' }
  }
  if (containsSecretPattern(securityExpansion.variants)) {
    return { ok: false, code: 'secret-pattern' }
  }

  const semanticAnswer = normalizedForAssociation(input.answer)
  const metricAnswer = normalizedForMetricAssociation(input.answer)
  const semanticVisitorMessage = normalizedForAssociation(input.visitorMessage)
  const unsafeUrl = classifyUnsafeUrl(input.answer, normalizeSemanticText(input.answer))
  if (unsafeUrl) return { ok: false, code: unsafeUrl }

  if (answerHasUnsupportedMetric(metricAnswer, input.profile)) {
    return { ok: false, code: 'unsupported-metric' }
  }

  if (answerHasCanonicalDateConflict(semanticAnswer, semanticVisitorMessage, input)) {
    return { ok: false, code: 'canonical-date-conflict' }
  }

  const allowedYears = new Set<string>([input.runtime.currentDate.slice(0, 4)])
  for (const experience of input.profile.experiences) {
    allowedYears.add(experience.startDate.slice(0, 4))
    if (experience.endDate) allowedYears.add(experience.endDate.slice(0, 4))
  }
  for (const claim of extractTemporalClaims(semanticAnswer, input)) {
    if (
      claim.experience &&
      claim.kind === 'presence' &&
      !claim.negated &&
      !temporalClaimConflicts(claim, input.runtime)
    ) {
      allowedYears.add(String(claim.reference.year))
    }
  }
  for (const year of semanticVisitorMessage.match(plausibleYearPattern) ?? []) {
    allowedYears.add(year)
  }
  for (const year of semanticAnswer.match(plausibleYearPattern) ?? []) {
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
