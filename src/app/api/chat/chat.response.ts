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

const normalizeUnicodeText = (value: string): string =>
  value.normalize('NFKC').replace(/\p{Cf}/gu, '')

const flattenRenderedMarkdownLinks = (value: string): string =>
  value.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

const normalizeSemanticText = (value: string): string =>
  flattenRenderedMarkdownLinks(normalizeUnicodeText(value)).replace(markdownFormattingPattern, '')

const normalizedForAssociation = (value: string): string =>
  normalizeSemanticText(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()

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

const decodedBase64Texts = (value: string): string[] => {
  const decoded = new Set<string>()
  const scanned = new Set<string>()
  let frontier = [value]
  const candidatePattern = /(?:^|[^a-z0-9+/_-])([a-z0-9+/_-]{12,}={0,2})(?=$|[^a-z0-9+/_=-])/gi
  for (let depth = 0; depth < 3 && frontier.length; depth += 1) {
    const nextFrontier: string[] = []
    for (const valueAtDepth of frontier) {
      const normalized = normalizeUnicodeText(valueAtDepth)
      const sources = new Set([
        normalized,
        normalized.replace(/[*`~]/g, ''),
        normalizeSemanticText(normalized),
      ])
      for (const source of sources) {
        if (scanned.has(source)) continue
        scanned.add(source)
        for (const match of source.matchAll(candidatePattern)) {
          const candidate = match[1]
          if (!candidate) continue
          const decodedCandidate = decodePlausibleBase64(candidate)
          if (!decodedCandidate || decoded.has(decodedCandidate)) continue
          decoded.add(decodedCandidate)
          nextFrontier.push(decodedCandidate)
          if (decoded.size >= 32) return [...decoded]
        }
      }
    }
    frontier = nextFrontier
  }
  return [...decoded]
}

const securityScanVariants = (value: string): string[] => {
  const values = [value, ...decodedBase64Texts(value)]
  return values.flatMap((candidate) => {
    const normalized = normalizeUnicodeText(candidate)
    return [normalized.replace(/[*`~]/g, ''), normalizeSemanticText(normalized)]
  })
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
  index: number
  length: number
  month: number | null
  year: number
}
type ChatExperience = ChatProfile['experiences'][number]
type CanonicalConflict = { experience: ChatExperience; reference: DateReference }

const extractDateReferences = (text: string): DateReference[] => {
  const references: DateReference[] = []
  const monthTokens = Object.keys(monthNumberByToken)
    .sort((left, right) => right.length - left.length)
    .map(escapeRegExp)
    .join('|')
  const namedMonthPattern = new RegExp(
    `\\b(${monthTokens})\\.?\\s*(?:(?:de|del|of)\\s*)?(?:[/.-]\\s*)?((?:19|20)\\d{2})\\b`,
    'g',
  )
  for (const match of text.matchAll(namedMonthPattern)) {
    const token = match[1]
    const year = Number(match[2])
    if (token && Number.isInteger(year)) {
      references.push({
        index: match.index ?? 0,
        length: match[0].length,
        month: monthNumberByToken[token] ?? null,
        year,
      })
    }
  }
  for (const match of text.matchAll(/\b((?:19|20)\d{2})[-/.](0?[1-9]|1[0-2])\b/g)) {
    references.push({
      index: match.index ?? 0,
      length: match[0].length,
      month: Number(match[2]),
      year: Number(match[1]),
    })
  }
  for (const match of text.matchAll(/\b(0?[1-9]|1[0-2])[-/.]((?:19|20)\d{2})\b/g)) {
    references.push({
      index: match.index ?? 0,
      length: match[0].length,
      month: Number(match[1]),
      year: Number(match[2]),
    })
  }
  for (const match of text.matchAll(plausibleYearPattern)) {
    const index = match.index ?? 0
    const belongsToPreciseDate = references.some(
      (reference) => index >= reference.index && index < reference.index + reference.length,
    )
    if (!belongsToPreciseDate) {
      references.push({ index, length: match[0].length, month: null, year: Number(match[0]) })
    }
  }
  return references.sort((left, right) => left.index - right.index)
}

const splitAssociationClauses = (text: string): string[] =>
  text
    .split(
      /[!?;\n]+|(?<!\d)\.+|\.+(?!\d)|\s*,?\s+(?:e|and|y|mas|but|pero)\s+|,\s*(?=(?:(?:eu|i|yo)\s+)?(?:(?:nao|no|not)\s+)?(?:comecei|empece|started|start|joined|entrei|trabalhei|trabaje|worked|estava|atuava|foi|was|fue)\b)|,(?=\s*(?:(?:eu|i|yo)\s+)?(?:hoje|atualmente|agora|today|now|currently|hoy|actualmente|ahora)\b)/,
    )
    .map((clause) => clause.trim())
    .filter(Boolean)

const companyAlias = (experience: ChatExperience): string =>
  experience.company.split(/\s+/)[0] ?? experience.company

const clauseMentionsCompany = (clause: string, experience: ChatExperience): boolean =>
  new RegExp(`\\b${escapeRegExp(normalizedForAssociation(companyAlias(experience)))}\\b`).test(
    clause,
  )

const clauseSeparatesExperience = (clause: string, experience: ChatExperience): boolean => {
  const company = escapeRegExp(normalizedForAssociation(companyAlias(experience)))
  return [
    new RegExp(`\\b(?:nao|no|not)\\s+(?:na|no|en|at)\\s+(?:a\\s+)?${company}\\b`),
    new RegExp(`\\b(?:incorreto|incorrecto|incorrect|falso|false)\\b[^.;]{0,80}\\b${company}\\b`),
    new RegExp(`\\b(?:antes\\s+(?:de|da|do)|before)\\s+(?:a\\s+|the\\s+)?${company}\\b`),
  ].some((pattern) => pattern.test(clause))
}

const employmentAssertionSource =
  '(?:comecei|empece|started|start|joined|entrei|trabalhei|trabaje|worked|estava|atuava|foi|fue|was)'

const clauseNegatesReference = (clause: string, reference: DateReference): boolean => {
  const assertionPattern = new RegExp(employmentAssertionSource, 'g')
  const assertions = [...clause.matchAll(assertionPattern)]
  const assertionsBeforeReference = assertions.filter(
    (assertion) => (assertion.index ?? 0) < reference.index,
  )
  const nearestAssertion = assertionsBeforeReference.at(-1)
  const priorAssertion = assertionsBeforeReference.at(-2)
  if (nearestAssertion) {
    const nearestIndex = nearestAssertion.index ?? 0
    const priorEnd = priorAssertion
      ? (priorAssertion.index ?? 0) + priorAssertion[0].length
      : Math.max(0, nearestIndex - 120)
    const beforeAssertion = clause.slice(priorEnd, nearestIndex)
    if (
      /\b(?:nao|no|not|never|nunca|didn['’]?t|did\s+not|wasn['’]?t|was\s+not)\b(?:[\s,]+(?:eu|i|yo|realmente|really|actually|definitivamente|definitely|simplesmente|simply|ever|de|fato))*[\s,]*$/.test(
        beforeAssertion,
      )
    ) {
      return true
    }

    const assertionEnd = nearestIndex + nearestAssertion[0].length
    const betweenAssertionAndReference = clause.slice(assertionEnd, reference.index)
    if (/\b(?:nao|no|not)\s+(?:(?:em|en|in)\s*)?$/.test(betweenAssertionAndReference)) {
      return true
    }
  } else {
    const beforeReference = clause.slice(Math.max(0, reference.index - 48), reference.index)
    if (
      /\b(?:nao|no|not|never|nunca)\s+(?:(?:em|en|in)\s*)?$/.test(beforeReference) ||
      /\b(?:incorreto|incorrecto|incorrect|errado|errada|wrong|falso|false)\b[^.;]{0,24}$/.test(
        beforeReference,
      )
    ) {
      return true
    }
  }

  const afterReference = clause.slice(
    reference.index + reference.length,
    reference.index + reference.length + 120,
  )
  const negatedAssertionAfterReference = new RegExp(
    `^[^.;]{0,48}\\b(?:nao|no|not|never|nunca|didn['’]?t|did\\s+not|wasn['’]?t|was\\s+not)\\b[^.;]{0,32}\\b${employmentAssertionSource}\\b`,
  )
  return (
    negatedAssertionAfterReference.test(afterReference) ||
    /^[^.;]{0,48}\b(?:incorreto|incorrecto|incorrect|errado|errada|wrong|falso|false)\b/.test(
      afterReference,
    )
  )
}

const associationIsNegated = (
  clause: string,
  reference: DateReference,
  experience: ChatExperience,
): boolean =>
  clauseSeparatesExperience(clause, experience) || clauseNegatesReference(clause, reference)

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

const conflictsForExplicitCompanies = (
  text: string,
  input: ChatValidationInput,
): CanonicalConflict[] => {
  const conflicts: CanonicalConflict[] = []
  for (const clause of splitAssociationClauses(text)) {
    const references = extractDateReferences(clause)
    for (const experience of input.profile.experiences) {
      if (!clauseMentionsCompany(clause, experience)) continue
      for (const reference of references) {
        if (
          referenceOutsideExperience(reference, experience, input.runtime) &&
          !associationIsNegated(clause, reference, experience)
        ) {
          conflicts.push({ experience, reference })
        }
      }
    }
  }
  return conflicts
}

const employmentAssertionPattern = new RegExp(`\\b${employmentAssertionSource}\\b`)
type PendingDateAssertion = { clause: string; references: DateReference[] }

const answerHasDirectCanonicalConflict = (text: string, input: ChatValidationInput): boolean => {
  let lastExperience: ChatExperience | null = null
  let pendingDateAssertion: PendingDateAssertion | null = null
  for (const clause of splitAssociationClauses(text)) {
    const experiences = input.profile.experiences.filter((experience) =>
      clauseMentionsCompany(clause, experience),
    )
    const references = extractDateReferences(clause)

    const pending = pendingDateAssertion
    if (pending && experiences.length === 1) {
      const experience = experiences[0]
      if (
        experience &&
        pending.references.some(
          (reference) =>
            referenceOutsideExperience(reference, experience, input.runtime) &&
            !associationIsNegated(pending.clause, reference, experience),
        )
      ) {
        return true
      }
      pendingDateAssertion = null
    }

    const associatedExperiences = experiences.length
      ? experiences
      : lastExperience && employmentAssertionPattern.test(clause)
        ? [lastExperience]
        : []

    for (const experience of associatedExperiences) {
      for (const reference of references) {
        if (
          referenceOutsideExperience(reference, experience, input.runtime) &&
          !associationIsNegated(clause, reference, experience)
        ) {
          return true
        }
      }
    }

    if (
      !experiences.length &&
      !associatedExperiences.length &&
      employmentAssertionPattern.test(clause)
    ) {
      const affirmativeReferences = references.filter(
        (reference) => !clauseNegatesReference(clause, reference),
      )
      pendingDateAssertion = affirmativeReferences.length
        ? { clause, references: affirmativeReferences }
        : null
    } else if (experiences.length || references.length) {
      pendingDateAssertion = null
    }
    if (experiences.length === 1) lastExperience = experiences[0] ?? null
  }
  return false
}

const answerAffirmsFalseVisitorPremise = (
  answer: string,
  visitorMessage: string,
  input: ChatValidationInput,
): boolean => {
  const falsePremises = conflictsForExplicitCompanies(visitorMessage, input)
  if (!falsePremises.length) return false

  const temporalCoreference =
    /\b(?:(?:nessa|naquela)\s+(?:epoca|data)|at\s+that\s+time|back\s+then|then|(?:esa|aquella)\s+epoca|en\s+ese\s+momento)\b/
  const affirmativeTemporalReference =
    temporalCoreference.test(answer) &&
    /\b(?:sim|yes|si|foi|fue|was|correto|correct|correcto)\b/.test(answer) &&
    !/\b(?:nao|not|never|nunca)\b|^no\b/.test(answer)
  if (affirmativeTemporalReference) {
    const explicitlyMentioned = input.profile.experiences.filter((experience) =>
      clauseMentionsCompany(answer, experience),
    )
    if (
      falsePremises.some(({ experience }) =>
        explicitlyMentioned.length ? explicitlyMentioned.includes(experience) : true,
      )
    ) {
      return true
    }
  }

  const clauses = splitAssociationClauses(answer)
  return falsePremises.some(({ experience: falseExperience, reference: falseReference }) =>
    clauses.some((clause) => {
      const matchingReferences = extractDateReferences(clause).filter(
        (answerReference) =>
          answerReference.year === falseReference.year &&
          (falseReference.month === null || answerReference.month === falseReference.month),
      )
      if (!matchingReferences.length) return false
      if (matchingReferences.every((reference) => clauseNegatesReference(clause, reference))) {
        return false
      }

      const explicitExperiences = input.profile.experiences.filter((experience) =>
        clauseMentionsCompany(clause, experience),
      )
      if (explicitExperiences.length) {
        if (
          explicitExperiences.some(
            (experience) =>
              experience === falseExperience && !clauseSeparatesExperience(clause, falseExperience),
          )
        ) {
          return true
        }
        return false
      }

      return (
        employmentAssertionPattern.test(clause) ||
        /\b(?:sim|yes|si|correto|correct|correcto|exato|exacto|exactly|la|there|alli|ahi)\b/.test(
          clause,
        )
      )
    }),
  )
}

const answerHasCanonicalDateConflict = (
  answer: string,
  visitorMessage: string,
  input: ChatValidationInput,
): boolean =>
  answerHasDirectCanonicalConflict(answer, input) ||
  answerAffirmsFalseVisitorPremise(answer, visitorMessage, input)

type MetricReference = { key: string }

const metricUnit = (value: string): string | null => {
  const unit = value.trim()
  const knownUnits: Array<[string, RegExp]> = [
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
  ]
  return knownUnits.find(([, pattern]) => pattern.test(unit))?.[0] ?? null
}

const extractMetrics = (text: string): MetricReference[] => {
  const references: MetricReference[] = []
  const pattern =
    /\b(\d{1,3}(?:(?:[.,]|\s)\d{3})+|\d+)\s*(?:(milhoes?|millions?|million|millones?|millon|mil|thousand)\s*)?(\+|%)?\s*(?:(?:de|of)\s+)?/g
  let match = pattern.exec(text)
  while (match) {
    const rawNumber = match[1] ?? ''
    const scale = match[2] ?? ''
    const suffix = match[3] ?? ''
    const remaining = text.slice(pattern.lastIndex)
    const followingWords = remaining.match(/^\s*([a-z]+(?:\s+[a-z]+)?)/)?.[1] ?? ''
    let unit = suffix === '%' ? 'percent' : metricUnit(followingWords)
    const grouped = /[.,\s]/.test(rawNumber)
    const scaleMultiplier = /^(?:milhao|milhoes|million|millions|millon|millones)$/.test(scale)
      ? 1_000_000
      : /^(?:mil|thousand)$/.test(scale)
        ? 1_000
        : 1
    const numericValue = Number(rawNumber.replace(/\D/g, '')) * scaleMultiplier
    const matchIndex = match.index ?? 0
    const adjacentToDateSeparator = /[-/.]/.test(
      `${text[matchIndex - 1] ?? ''}${text[matchIndex + match[0].trimEnd().length] ?? ''}`,
    )
    const plausibleYear =
      !grouped && !scale && !suffix && numericValue >= 1900 && numericValue <= 2099
    const identifierPrefix =
      /\b(?:ticket|id|codigo|code|status|porta|port|versao|version)\s*[:#-]?\s*$/
    const looksLikeIdentifier = identifierPrefix.test(
      text.slice(Math.max(0, matchIndex - 32), matchIndex),
    )
    if (!unit && !plausibleYear && !adjacentToDateSeparator && !looksLikeIdentifier) {
      unit = followingWords.split(/\s+/)[0] || (scale ? 'scaled-count' : 'count')
    }
    if (unit) {
      const qualifier = suffix === '+' ? 'plus' : suffix === '%' ? 'percent' : 'exact'
      references.push({ key: `${numericValue}|${qualifier}|${unit}` })
    }
    match = pattern.exec(text)
  }
  return references
}

const collectProfileStrings = (value: unknown, strings: string[] = []): string[] => {
  if (typeof value === 'string') strings.push(value)
  else if (Array.isArray(value)) {
    value.forEach((item) => {
      collectProfileStrings(item, strings)
    })
  } else if (value && typeof value === 'object') {
    Object.values(value).forEach((item) => {
      collectProfileStrings(item, strings)
    })
  }
  return strings
}

const metricKeysFrom = (value: unknown): Set<string> =>
  new Set(
    extractMetrics(normalizedForAssociation(collectProfileStrings(value).join(' '))).map(
      (metric) => metric.key,
    ),
  )

const answerHasUnsupportedMetric = (answer: string, profile: ChatProfile): boolean => {
  const globalAllowed = metricKeysFrom({ ...profile, experiences: [] })
  const allowedByExperience = new Map(
    profile.experiences.map((experience) => [experience, metricKeysFrom(experience)] as const),
  )
  const unscopedAllowed = new Set(globalAllowed)
  for (const allowed of allowedByExperience.values()) {
    for (const key of allowed) unscopedAllowed.add(key)
  }

  for (const clause of splitAssociationClauses(answer)) {
    const metrics = extractMetrics(clause)
    if (!metrics.length) continue
    const explicitExperiences = profile.experiences.filter((experience) =>
      clauseMentionsCompany(clause, experience),
    )
    for (const metric of metrics) {
      if (!explicitExperiences.length) {
        if (!unscopedAllowed.has(metric.key)) return true
        continue
      }
      if (
        explicitExperiences.some(
          (experience) => !allowedByExperience.get(experience)?.has(metric.key),
        )
      ) {
        return true
      }
    }
  }
  return false
}

export function validateChatAnswer(input: ChatValidationInput): ChatValidationResult {
  if (!input.answer.trim()) return { ok: false, code: 'empty' }
  if (input.answer.length > CHAT_MAX_ANSWER_CHARS) {
    return { ok: false, code: 'answer-too-large' }
  }

  const securityVariants = securityScanVariants(input.answer)
  if (containsInternalPolicy(securityVariants)) return { ok: false, code: 'policy-canary' }
  if (containsSecretPattern(securityVariants)) return { ok: false, code: 'secret-pattern' }

  const semanticAnswer = normalizedForAssociation(input.answer)
  const semanticVisitorMessage = normalizedForAssociation(input.visitorMessage)
  const unsafeUrl = classifyUnsafeUrl(input.answer, normalizeSemanticText(input.answer))
  if (unsafeUrl) return { ok: false, code: unsafeUrl }

  if (answerHasCanonicalDateConflict(semanticAnswer, semanticVisitorMessage, input)) {
    return { ok: false, code: 'canonical-date-conflict' }
  }

  const allowedYears = new Set<string>([input.runtime.currentDate.slice(0, 4)])
  for (const experience of input.profile.experiences) {
    allowedYears.add(experience.startDate.slice(0, 4))
    if (experience.endDate) allowedYears.add(experience.endDate.slice(0, 4))
  }
  for (const year of semanticVisitorMessage.match(plausibleYearPattern) ?? []) {
    allowedYears.add(year)
  }
  for (const year of semanticAnswer.match(plausibleYearPattern) ?? []) {
    if (!allowedYears.has(year)) return { ok: false, code: 'unsupported-year' }
  }

  if (answerHasUnsupportedMetric(semanticAnswer, input.profile)) {
    return { ok: false, code: 'unsupported-metric' }
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
