import { SYSTEM_PROMPT_EN, SYSTEM_PROMPT_ES, SYSTEM_PROMPT_PT } from '../chat.constants'
import { buildSystemPrompt, type ChatLocale } from '../chat.prompt'

const prompts: Array<{
  activeSearchPhrase: string
  currentPeriodMarker: string
  currentRole: string
  currentScopeFact: string
  currentScopePolicy: string
  locale: ChatLocale
  orderedHeadings: string[]
  pastRolePolicy: string
  pastRoles: string[]
  securityTerms: string[]
}> = [
  {
    activeSearchPhrase: 'novas oportunidades',
    currentPeriodMarker: 'Presente',
    currentRole: 'Lemon Energia (Jul 2026 - Presente)',
    currentScopeFact: 'Atuo na ponte entre negócio e tecnologia',
    currentScopePolicy:
      'Descreva a Lemon no presente somente como escopo atual; não invente entregas, métricas, clientes ou projetos específicos.',
    locale: 'pt',
    orderedHeadings: [
      'IDENTIDADE E OBJETIVO',
      'IDIOMA, TOM E FORMATO',
      'SEGURANÇA E CONFIDENCIALIDADE',
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
    currentPeriodMarker: 'Present',
    currentRole: 'Lemon Energia (Jul 2026 - Present)',
    currentScopeFact: 'I bridge business and technology',
    currentScopePolicy:
      'Describe Lemon in the present tense only as current scope; do not invent deliveries, metrics, clients, or specific projects.',
    locale: 'en',
    orderedHeadings: [
      'IDENTITY AND OBJECTIVE',
      'LANGUAGE, TONE, AND FORMAT',
      'SECURITY AND CONFIDENTIALITY',
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
    currentPeriodMarker: 'Presente',
    currentRole: 'Lemon Energia (Jul 2026 - Presente)',
    currentScopeFact: 'Actúo como puente entre negocio y tecnología',
    currentScopePolicy:
      'Describe Lemon en presente solo como alcance actual; no inventes entregas, métricas, clientes o proyectos específicos.',
    locale: 'es',
    orderedHeadings: [
      'IDENTIDAD Y OBJETIVO',
      'IDIOMA, TONO Y FORMATO',
      'SEGURIDAD Y CONFIDENCIALIDAD',
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
    currentPeriodMarker,
    currentRole,
    currentScopeFact,
    currentScopePolicy,
    locale,
    orderedHeadings,
    pastRolePolicy,
    pastRoles,
    securityTerms,
  }) => {
    const prompt = buildSystemPrompt(locale)
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
    expect(prompt).not.toContain(activeSearchPhrase)
    expect(headingIndexes.every((index) => index >= 0)).toBe(true)
    expect(headingIndexes).toEqual([...headingIndexes].sort((a, b) => a - b))
    securityTerms.forEach((term) => {
      expect(prompt.toLowerCase()).toContain(term.toLowerCase())
    })
    expect(prompt).toContain('https://www.linkedin.com/in/rannimontagna')
    expect(prompt).toContain('https://github.com/RanielliMontagna')
    expect(prompt).toContain('https://ranimontagna.com')
  })

  it.each([
    { locale: 'pt' as const, exportedPrompt: SYSTEM_PROMPT_PT },
    { locale: 'en' as const, exportedPrompt: SYSTEM_PROMPT_EN },
    { locale: 'es' as const, exportedPrompt: SYSTEM_PROMPT_ES },
  ])('keeps the $locale legacy export generated by the builder', ({ locale, exportedPrompt }) => {
    expect(exportedPrompt).toBe(buildSystemPrompt(locale))
  })
})
