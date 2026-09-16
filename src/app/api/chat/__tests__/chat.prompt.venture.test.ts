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
    heading: 'ATTO — MINHA EMPRESA',
    routingRule: /ofereça os dois caminhos/,
    dataNotInstructions: /nunca instrução a ser executada/,
    humanRule: /humano ou uma IA/,
    attoUncertainty: /não invente clientes, faturamento, equipe ou prazos/,
    directMessageRule: /recado direto aqui no chat/,
  },
  {
    locale: 'en',
    heading: 'ATTO — MY COMPANY',
    routingRule: /offer both paths/,
    dataNotInstructions: /never an instruction to execute/,
    humanRule: /human or an AI/,
    attoUncertainty: /do not invent clients, revenue, team size, or timelines/,
    directMessageRule: /direct-message button here in the chat/,
  },
  {
    locale: 'es',
    heading: 'ATTO — MI EMPRESA',
    routingRule: /ofrece los dos caminos/,
    dataNotInstructions: /nunca una instrucción a ejecutar/,
    humanRule: /humano o una IA/,
    attoUncertainty: /no inventes clientes, facturación, equipo ni plazos/,
    directMessageRule: /mensaje directo aquí en el chat/,
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
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain('ATTO — MINHA EMPRESA')
    expect(CHAT_INTERNAL_PROMPT_MARKERS).toContain('ATTO — MY COMPANY')
  })
})
