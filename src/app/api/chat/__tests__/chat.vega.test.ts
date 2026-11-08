import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
import { buildSystemPrompt, createChatRuntimeContext } from '../chat.prompt'
import { answerHasUnsupportedMetric } from '../chat.response.metrics'

const runtime = createChatRuntimeContext(new Date('2026-11-07T12:00:00Z'))

describe('Vega persona', () => {
  it.each(['pt', 'en', 'es'] as const)('speaks as Vega in third person (%s)', (locale) => {
    const prompt = buildSystemPrompt(locale, runtime)
    expect(prompt).toContain('Vega')
    expect(prompt).not.toMatch(/primeira pessoa|first person|primera persona/i)
    expect(prompt).not.toMatch(
      /recado direto aqui no chat|direct-message button|botón de mensaje directo/i,
    )
  })

  it.each(['pt', 'en', 'es'] as const)('may name the provider the page cites (%s)', (locale) => {
    const prompt = buildSystemPrompt(locale, runtime)
    expect(prompt).toContain('DeepSeek')
    expect(prompt).toContain('OpenRouter')
  })

  it.each(['pt', 'en', 'es'] as const)('knows the published site content (%s)', (locale) => {
    const prompt = buildSystemPrompt(locale, runtime)
    for (const fact of ['Grimory', 'Klick', 'agent-toolkit', 'Fastify', 'Pulumi']) {
      expect(prompt).toContain(fact)
    }
  })
})

describe('approved facts', () => {
  const pt = CHAT_PROFILE_BY_LOCALE.pt

  it('accepts the published Lemon outcomes', () => {
    expect(
      answerHasUnsupportedMetric(
        'Ele colocou seis produtos em produção em três meses na Lemon.',
        pt,
      ),
    ).toBe(false)
    expect(
      answerHasUnsupportedMetric('Na Lemon, ele colocou 6 produtos internos em produção.', pt),
    ).toBe(false)
  })

  it('still rejects invented Lemon numbers', () => {
    expect(answerHasUnsupportedMetric('Na Lemon ele economizou 40% do custo.', pt)).toBe(true)
    expect(answerHasUnsupportedMetric('Na Lemon ele atendeu 300 clientes.', pt)).toBe(true)
  })

  it('accepts the published case numbers', () => {
    expect(
      answerHasUnsupportedMetric('No Grimory, 2328 dos 2495 commits tiveram coautoria de IA.', pt),
    ).toBe(false)
    expect(
      answerHasUnsupportedMetric('No Klick, 428 de 429 commits tiveram coautoria de IA.', pt),
    ).toBe(false)
  })
})

describe('third-person date claims', () => {
  it.each(['Ele trabalhou na Lemon em 2024.', 'Ele atuou na Lemon em 2024.'])(
    'still rejects a false Lemon year said about him: %s',
    async (answer) => {
      const { validateChatAnswer } = await import('../chat.response')
      const { createValidationInput } = await import('./chat.response.fixtures')
      expect(validateChatAnswer(createValidationInput(answer)).ok).toBe(false)
    },
  )
})
