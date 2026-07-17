import { isApprovedChatUrl } from '@/shared/lib/chat-links'
import { CHAT_INTERNAL_PROMPT_MARKERS } from './chat.prompt'
import {
  type ChatValidationCode,
  normalizeSemanticText,
  normalizeUnicodeText,
} from './chat.response.shared'

const secretPatterns = [
  /\b(?:sk-|AIza)[a-z0-9_-]{4,}\b/i,
  /\bbearer\s+[a-z0-9._~+/-]{4,}\b/i,
  /\b[a-z0-9]+(?:_[a-z0-9]+)*_(?:api_?key|token|secret)\b/i,
  /\b(?:api_?key|token|secret)\s*[:=]\s*\S{4,}/i,
  /\b(?:deepseek|gemini|openrouter|groq|chat|upstash|sentry)_[a-z0-9_]+\b/i,
  /\b(?:deepseek|gemini|openrouter|groq)(?:api)?key\b/i,
] as const

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

export const expandSecurityScan = (value: string): SecurityScanExpansion => {
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

export const containsInternalPolicy = (variants: string[]): boolean =>
  variants.some((variant) => {
    const comparable = variant.toLowerCase()
    return CHAT_INTERNAL_PROMPT_MARKERS.some((marker) =>
      comparable.includes(normalizeSemanticText(marker).toLowerCase()),
    )
  })

export const containsSecretPattern = (variants: string[]): boolean =>
  variants.some((variant) => secretPatterns.some((pattern) => pattern.test(variant)))

type MarkdownDestination = {
  closed: boolean
  syntaxEnd: number
  syntaxStart: number
  value: string
}

const markdownDestinations = (answer: string): MarkdownDestination[] => {
  const destinations: MarkdownDestination[] = []
  let searchFrom = 0
  let openerIndex = answer.indexOf('](', searchFrom)
  while (openerIndex >= 0) {
    const start = openerIndex + 2
    const end = answer.indexOf(')', start)
    destinations.push({
      closed: end >= 0,
      syntaxEnd: end < 0 ? answer.length : end + 1,
      syntaxStart: openerIndex,
      value: end < 0 ? answer.slice(start) : answer.slice(start, end),
    })
    if (end < 0) break
    searchFrom = end + 1
    openerIndex = answer.indexOf('](', searchFrom)
  }
  return destinations
}

const maskMarkdownDestinationSyntax = (
  answer: string,
  destinations: MarkdownDestination[],
): string => {
  const parts: string[] = []
  let cursor = 0
  for (const destination of destinations) {
    parts.push(answer.slice(cursor, destination.syntaxStart))
    parts.push(' '.repeat(destination.syntaxEnd - destination.syntaxStart))
    cursor = destination.syntaxEnd
  }
  parts.push(answer.slice(cursor))
  return parts.join('')
}

const rawHttpsUrls = (answer: string): string[] =>
  [...answer.matchAll(/\bhttps:\/\/[^\s<>"']+/gi)].map((match) =>
    (match[0] ?? '').replace(/[)\].,!?;:]+$/g, ''),
  )

export const classifyUnsafeUrl = (
  answer: string,
  semanticAnswer: string,
): ChatValidationCode | null => {
  const nonHttpsProtocol = /\b(?:data|file|ftp|ftps|http|javascript|mailto|tel|vbscript|ws|wss):/i
  if (nonHttpsProtocol.test(semanticAnswer)) return 'unsafe-protocol'

  const destinations = markdownDestinations(answer)
  for (const { closed, value: destination } of destinations) {
    if (!closed) return 'unsafe-link'
    if (!destination || /[\s\p{Cc}\p{Cf}]/u.test(destination)) return 'unsafe-link'
    const semanticDestination = normalizeSemanticText(destination).replace(/^<|>$/g, '')
    const protocol = semanticDestination.match(/^([a-z][a-z0-9+.-]*):/i)?.[1]?.toLowerCase()
    if (protocol !== 'https') return 'unsafe-protocol'
    if (!isApprovedChatUrl(destination)) return 'unsafe-link'
  }

  const literalSurface = maskMarkdownDestinationSyntax(answer, destinations)
  const literalHttpsUrls = rawHttpsUrls(literalSurface)
  const literalHttpsUrlCounts = new Map<string, number>()
  for (const url of literalHttpsUrls) {
    if (!isApprovedChatUrl(url)) return 'unsafe-link'
    literalHttpsUrlCounts.set(url, (literalHttpsUrlCounts.get(url) ?? 0) + 1)
  }
  for (const url of rawHttpsUrls(semanticAnswer)) {
    if (!isApprovedChatUrl(url)) return 'unsafe-link'
    const literalCount = literalHttpsUrlCounts.get(url) ?? 0
    if (literalCount === 0) return 'unsafe-link'
    if (literalCount === 1) literalHttpsUrlCounts.delete(url)
    else literalHttpsUrlCounts.set(url, literalCount - 1)
  }

  return null
}
