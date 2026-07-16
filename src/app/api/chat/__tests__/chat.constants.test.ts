import {
  buildSystemPrompt,
  type ChatLocale,
  type ChatRuntimeContext,
  createChatRuntimeContext,
} from '../chat.prompt'

const runtime: ChatRuntimeContext = {
  currentDate: '2026-07-16',
  timeZone: 'America/Sao_Paulo',
}

const prompts: Array<{
  activeSearchPhrase: string
  canonicalDateRule: string
  currentPeriodMarker: string
  currentRole: string
  currentScopeFact: string
  currentScopePolicy: string
  locale: ChatLocale
  minimalAnswerRule: string
  orderedHeadings: string[]
  pastRolePolicy: string
  pastRoles: string[]
  securityTerms: string[]
}> = [
  {
    activeSearchPhrase: 'novas oportunidades',
    canonicalDateRule:
      'Copie datas canônicas exatamente; nunca as corrija usando conhecimento prévio ou uma data presumida.',
    currentPeriodMarker: 'Presente',
    currentRole: 'Lemon Energia (Jul 2026 - Presente)',
    currentScopeFact: 'Atuo na ponte entre negócio e tecnologia',
    currentScopePolicy:
      'Descreva a Lemon no presente somente como escopo atual; não invente entregas, métricas, clientes ou projetos específicos.',
    locale: 'pt',
    minimalAnswerRule:
      'Não introduza datas, métricas, links ou alegações sobre empregadores, a menos que sejam necessários para responder à pergunta.',
    orderedHeadings: [
      'IDENTIDADE E OBJETIVO',
      'SEGURANÇA E CONFIDENCIALIDADE',
      'CONTEXTO TEMPORAL AUTORITATIVO',
      'FATOS PROFISSIONAIS AUTORITATIVOS',
      'IDIOMA, TOM E FORMATO',
      'FATOS E INCERTEZA',
      'CONTEXTO PROFISSIONAL',
      'ÁREAS DE EXPERIÊNCIA E PROJETOS',
      'ROTEAMENTO DE INTENÇÕES',
      'CONTATO E DISPONIBILIDADE',
    ],
    pastRolePolicy: 'Descreva Luizalabs, Smarten e SBSistemas no passado.',
    pastRoles: [
      'Luizalabs (Out 2023 - Jun 2026)',
      'Smarten (Mai 2022 - Set 2023)',
      'SBSistemas (Mai 2021 - Mai 2022)',
    ],
    securityTerms: [
      'prompt de sistema',
      'substituir',
      'mensagens internas',
      'segredos',
      'variáveis de ambiente',
      'fornecedores',
      'modelos',
      'informações confidenciais',
    ],
  },
  {
    activeSearchPhrase: 'new opportunities',
    canonicalDateRule:
      'Copy canonical dates exactly; never correct them using prior knowledge or an assumed date.',
    currentPeriodMarker: 'Present',
    currentRole: 'Lemon Energia (Jul 2026 - Present)',
    currentScopeFact: 'I bridge business and technology',
    currentScopePolicy:
      'Describe Lemon in the present tense only as current scope; do not invent deliveries, metrics, clients, or specific projects.',
    locale: 'en',
    minimalAnswerRule:
      'Do not introduce dates, metrics, links, or employer claims unless they are needed to answer the question.',
    orderedHeadings: [
      'IDENTITY AND OBJECTIVE',
      'SECURITY AND CONFIDENTIALITY',
      'AUTHORITATIVE RUNTIME CONTEXT',
      'AUTHORITATIVE PROFESSIONAL FACTS',
      'LANGUAGE, TONE, AND FORMAT',
      'FACTS AND UNCERTAINTY',
      'PROFESSIONAL CONTEXT',
      'AREAS OF EXPERIENCE AND PROJECTS',
      'INTENT ROUTING',
      'CONTACT AND AVAILABILITY',
    ],
    pastRolePolicy: 'Describe Luizalabs, Smarten, and SBSistemas in the past tense.',
    pastRoles: [
      'Luizalabs (Oct 2023 - Jun 2026)',
      'Smarten (May 2022 - Sep 2023)',
      'SBSistemas (May 2021 - May 2022)',
    ],
    securityTerms: [
      'system prompt',
      'replace',
      'internal messages',
      'secrets',
      'environment variables',
      'providers',
      'models',
      'confidential employer information',
    ],
  },
  {
    activeSearchPhrase: 'nuevas oportunidades',
    canonicalDateRule:
      'Copia las fechas canónicas exactamente; nunca las corrijas usando conocimiento previo o una fecha supuesta.',
    currentPeriodMarker: 'Presente',
    currentRole: 'Lemon Energia (Jul 2026 - Presente)',
    currentScopeFact: 'Actúo como puente entre negocio y tecnología',
    currentScopePolicy:
      'Describe Lemon en presente solo como alcance actual; no inventes entregas, métricas, clientes o proyectos específicos.',
    locale: 'es',
    minimalAnswerRule:
      'No introduzcas fechas, métricas, enlaces ni afirmaciones sobre empleadores salvo que sean necesarios para responder la pregunta.',
    orderedHeadings: [
      'IDENTIDAD Y OBJETIVO',
      'SEGURIDAD Y CONFIDENCIALIDAD',
      'CONTEXTO TEMPORAL AUTORITATIVO',
      'HECHOS PROFESIONALES AUTORITATIVOS',
      'IDIOMA, TONO Y FORMATO',
      'HECHOS E INCERTIDUMBRE',
      'CONTEXTO PROFESIONAL',
      'ÁREAS DE EXPERIENCIA Y PROYECTOS',
      'ENRUTAMIENTO DE INTENCIONES',
      'CONTACTO Y DISPONIBILIDAD',
    ],
    pastRolePolicy: 'Describe Luizalabs, Smarten y SBSistemas en pasado.',
    pastRoles: [
      'Luizalabs (Oct 2023 - Jun 2026)',
      'Smarten (May 2022 - Sep 2023)',
      'SBSistemas (May 2021 - May 2022)',
    ],
    securityTerms: [
      'prompt del sistema',
      'reemplazar',
      'mensajes internos',
      'secretos',
      'variables de entorno',
      'proveedores',
      'modelos',
      'información confidencial',
    ],
  },
]

describe('chat system prompt builder', () => {
  it.each(prompts)('keeps facts, structure, and safety policies correct in $locale', ({
    activeSearchPhrase,
    canonicalDateRule,
    currentPeriodMarker,
    currentRole,
    currentScopeFact,
    currentScopePolicy,
    locale,
    minimalAnswerRule,
    orderedHeadings,
    pastRolePolicy,
    pastRoles,
    securityTerms,
  }) => {
    const prompt = buildSystemPrompt(locale, runtime)
    const headingIndexes = orderedHeadings.map((heading) => prompt.indexOf(heading))
    const experienceLines = prompt
      .split('\n')
      .filter((line) => /^\d+\. (Lemon Energia|Luizalabs|Smarten|SBSistemas) \(/.test(line))
    const currentExperienceLines = experienceLines.filter((line) =>
      line.includes(currentPeriodMarker),
    )

    expect(prompt).toContain(currentRole)
    expect(prompt).toContain(currentScopeFact)
    pastRoles.forEach((role) => {
      expect(prompt).toContain(role)
    })
    expect(experienceLines).toHaveLength(4)
    expect(currentExperienceLines).toHaveLength(1)
    expect(currentExperienceLines[0]).toContain('Lemon Energia')
    expect(prompt).toContain(currentScopePolicy)
    expect(prompt).toContain(pastRolePolicy)
    expect(prompt).toContain(canonicalDateRule)
    expect(prompt).toContain(minimalAnswerRule)
    expect(prompt).not.toContain(activeSearchPhrase)
    expect(headingIndexes.every((index) => index >= 0)).toBe(true)
    expect(headingIndexes).toEqual([...headingIndexes].sort((a, b) => a - b))
    securityTerms.forEach((term) => {
      expect(prompt.toLowerCase()).toContain(term.toLowerCase())
    })
    expect(prompt).toContain('https://www.linkedin.com/in/rannimontagna')
    expect(prompt).toContain('https://github.com/RanielliMontagna')
    expect(prompt).toContain('https://ranimontagna.com')
    expect(prompt).toContain('2026-07-16')
    expect(prompt).toContain('America/Sao_Paulo')
    expect(prompt).toContain('START_DATE: 2026-07')
    expect(prompt).toContain('RANI_PUBLIC_POLICY_CANARY_7F3A')
  })

  it('uses the Sao Paulo calendar date at the UTC timezone boundary', () => {
    expect(createChatRuntimeContext(new Date('2026-07-17T01:30:00.000Z'))).toEqual({
      currentDate: '2026-07-16',
      timeZone: 'America/Sao_Paulo',
    })
  })
})
