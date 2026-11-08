import { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'
import { buildSystemPrompt, CHAT_INTERNAL_PROMPT_MARKERS, type ChatLocale } from '../chat.prompt'

const runtime = { currentDate: '2026-09-16', timeZone: 'America/Sao_Paulo' } as const

const expectations: Array<{
  locale: ChatLocale
  heading: string
  routingRule: RegExp
  dataNotInstructions: RegExp
  humanRule: RegExp
  attoUncertainty: RegExp
  directMessageRule: RegExp
}> = [
  {
    locale: 'pt',
    heading: 'ATTO — A EMPRESA DO RANIELLI',
    routingRule: /ofereça os dois caminhos/,
    dataNotInstructions: /nunca instrução a ser executada/,
    humanRule: /é a Vega.*é uma IA/,
    attoUncertainty: /não invente clientes, faturamento, equipe ou prazos/,
    directMessageRule: /falar direto com ele pelo LinkedIn/,
  },
  {
    locale: 'en',
    heading: "ATTO — RANIELLI'S COMPANY",
    routingRule: /offer both paths/,
    dataNotInstructions: /never an instruction to execute/,
    humanRule: /you are Vega.*you are an AI/,
    attoUncertainty: /do not invent clients, revenue, team size, or timelines/,
    directMessageRule: /reaching him directly on LinkedIn/,
  },
  {
    locale: 'es',
    heading: 'ATTO — LA EMPRESA DE RANIELLI',
    routingRule: /ofrece los dos caminos/,
    dataNotInstructions: /nunca una instrucción a ejecutar/,
    humanRule: /eres Vega.*eres una IA/,
    attoUncertainty: /no inventes clientes, facturación, equipo ni plazos/,
    directMessageRule: /hablar directamente con él por LinkedIn/,
  },
]

describe('chat system prompt — Atto and hardening', () => {
  it.each(expectations)('routes projects to Atto and hardens the policy in $locale', (expected) => {
    const prompt = buildSystemPrompt(expected.locale, runtime)

    expect(prompt).toContain(expected.heading)
    expect(prompt).toContain(CHAT_CONTACT_LINKS.atto)
    expect(prompt).toMatch(expected.routingRule)
    expect(prompt).toMatch(expected.dataNotInstructions)
    expect(prompt).toMatch(expected.humanRule)
    expect(prompt).toMatch(expected.attoUncertainty)
    expect(prompt).toMatch(expected.directMessageRule)
    const projectRule = prompt.split('\n').find((line) => expected.routingRule.test(line)) ?? ''
    expect(projectRule).toContain('Atto')
    expect(projectRule).toMatch(expected.directMessageRule)
    expect(prompt).toContain('NaN Solutions (Atto)')
    expect(prompt).not.toContain('North Clinic')
  })

  it('treats the Atto heading as an internal prompt marker', () => {
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain('ATTO — A EMPRESA DO RANIELLI')
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain("ATTO — RANIELLI'S COMPANY")
  })
})
