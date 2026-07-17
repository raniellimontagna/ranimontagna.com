import type { ChatProfile } from './chat.profile'
import {
  type ChatExperience,
  clauseMentionsCompany,
  clauseSeparatesExperience,
  companyAlias,
  escapeRegExp,
  normalizedForAssociation,
  splitAssociationClauses,
} from './chat.response.shared'
import { extractDateReferences } from './chat.response.temporal'

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

export const answerHasUnsupportedMetric = (answer: string, profile: ChatProfile): boolean => {
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
