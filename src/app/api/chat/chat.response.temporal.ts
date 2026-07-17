import type { ChatRuntimeContext } from './chat.prompt'
import {
  type ChatExperience,
  type ChatValidationInput,
  clauseMentionsCompany,
  clauseSeparatesExperience,
  escapeRegExp,
  splitAssociationClauses,
} from './chat.response.shared'

const plausibleYearPattern = /\b(?:19|20)\d{2}\b/g

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

export type DateReference = {
  day: number | null
  index: number
  length: number
  month: number | null
  year: number
}

const monthTokenSource = Object.keys(monthNumberByToken)
  .sort((left, right) => right.length - left.length)
  .map(escapeRegExp)
  .join('|')

const normalizedYear = (value: string): number => {
  const year = Number(value)
  return value.length === 2 ? 2000 + year : year
}

export const extractDateReferences = (text: string): DateReference[] => {
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
    const explicitlyMentionedSet = new Set(explicitlyMentioned)
    if (
      !explicitlyMentioned.length ||
      falsePremises.some(
        (premise) => premise.experience && explicitlyMentionedSet.has(premise.experience),
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

export const answerHasCanonicalDateConflict = (
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

export const answerHasUnsupportedYear = (
  answer: string,
  visitorMessage: string,
  input: ChatValidationInput,
): boolean => {
  const allowedYears = new Set<string>([input.runtime.currentDate.slice(0, 4)])
  for (const experience of input.profile.experiences) {
    allowedYears.add(experience.startDate.slice(0, 4))
    if (experience.endDate) allowedYears.add(experience.endDate.slice(0, 4))
  }
  for (const claim of extractTemporalClaims(answer, input)) {
    if (
      claim.experience &&
      claim.kind === 'presence' &&
      !claim.negated &&
      !temporalClaimConflicts(claim, input.runtime)
    ) {
      allowedYears.add(String(claim.reference.year))
    }
  }
  for (const year of visitorMessage.match(plausibleYearPattern) ?? []) {
    allowedYears.add(year)
  }
  for (const year of answer.match(plausibleYearPattern) ?? []) {
    if (!allowedYears.has(year)) return true
  }
  return false
}
