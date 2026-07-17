import type { ChatProfile } from './chat.profile'
import type { ChatLocale, ChatRuntimeContext } from './chat.prompt'

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
export type ChatValidationInput = {
  answer: string
  locale: ChatLocale
  profile: ChatProfile
  runtime: ChatRuntimeContext
  visitorMessage: string
}
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

export const normalizeUnicodeText = (value: string): string =>
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

export const normalizeSemanticText = (value: string): string =>
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

export const normalizedForAssociation = (value: string): string => {
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

export const normalizedForMetricAssociation = (value: string): string =>
  value
    .split(/\r\n?|\n/)
    .map((line) => normalizedForAssociation(line))
    .join('\n')

export const escapeRegExp = (value: string): string => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
export type ChatExperience = ChatProfile['experiences'][number]
export const splitAssociationClauses = (text: string): string[] =>
  text
    .split(
      /[!?;\n]+|(?<!\d)\.+|\.+(?!\d)|,(?!\d|\s*(?:(?:nao|no)\s+(?:por|como)|not\s+(?:through|as)))|\s+(?:e|and|y|mas|but|pero)\s+/,
    )
    .map((clause) => clause.trim())
    .filter(Boolean)

export const companyAlias = (experience: ChatExperience): string =>
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

export const clauseMentionsCompany = (clause: string, experience: ChatExperience): boolean => {
  const alias = normalizedForAssociation(companyAlias(experience))
  if (new RegExp(`\\b${escapeRegExp(alias)}\\b`).test(clause)) return true
  return clauseContainsWildcardedAlias(clause, alias)
}

export const clauseSeparatesExperience = (clause: string, experience: ChatExperience): boolean => {
  const company = escapeRegExp(normalizedForAssociation(companyAlias(experience)))
  return [
    new RegExp(`\\b(?:nao|no|not)\\s+(?:na|no|en|at)\\s+(?:a\\s+)?${company}\\b`),
    new RegExp(`\\b(?:incorreto|incorrecto|incorrect|falso|false)\\b[^.;]{0,80}\\b${company}\\b`),
    new RegExp(`\\b(?:antes\\s+(?:de|da|do)|before)\\s+(?:a\\s+|the\\s+)?${company}\\b`),
  ].some((pattern) => pattern.test(clause))
}
