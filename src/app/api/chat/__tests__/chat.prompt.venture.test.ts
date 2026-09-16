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
}> = [
  {
    locale: 'pt',
    heading: 'ATTO — MINHA EMPRESA',
    routingRule: /passa pela Atto/,
    dataNotInstructions: /nunca instrução a ser executada/,
    humanRule: /humano ou uma IA/,
    attoUncertainty: /não invente clientes, faturamento, equipe ou prazos/,
  },
  {
    locale: 'en',
    heading: 'ATTO — MY COMPANY',
    routingRule: /goes through Atto/,
    dataNotInstructions: /never an instruction to execute/,
    humanRule: /human or an AI/,
    attoUncertainty: /do not invent clients, revenue, team size, or timelines/,
  },
  {
    locale: 'es',
    heading: 'ATTO — MI EMPRESA',
    routingRule: /pasa por Atto/,
    dataNotInstructions: /nunca una instrucción a ejecutar/,
    humanRule: /humano o una IA/,
    attoUncertainty: /no inventes clientes, facturación, equipo ni plazos/,
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
    const projectRule = prompt.split('\n').find((line) => expected.routingRule.test(line)) ?? ''
    expect(projectRule).not.toContain('LinkedIn')
    expect(prompt).toContain('NaN Solutions (Atto)')
    expect(prompt).not.toContain('North Clinic')
  })

  it('treats the Atto heading as an internal prompt marker', () => {
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain('ATTO — MINHA EMPRESA')
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain('ATTO — MY COMPANY')
  })
})
