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

describe('numbers published in the site facts', () => {
  const pt = CHAT_PROFILE_BY_LOCALE.pt

  it.each([
    'O Grimory é uma mesa de D&D 5e em português.',
    'O site tem mais de 1.000 testes, escritos antes do código.',
    'O Klick cobre os 13 eventos da WCA.',
    'O agent-toolkit instala as mesmas skills em 5 agentes.',
    'A Vega usa 2 provedores.',
    'Dos 2.495 commits do projeto, 2.328 tiveram coautoria de IA, todos revisados por ele.',
  ])('accepts: %s', (answer) => {
    expect(answerHasUnsupportedMetric(answer, pt)).toBe(false)
  })

  it.each([
    'O site tem 5.000 testes.',
    'O Klick cobre 40 eventos da WCA.',
    'Dos 2.495 commits, 2.329 tiveram coautoria de IA.',
  ])('still rejects invented numbers: %s', (answer) => {
    expect(answerHasUnsupportedMetric(answer, pt)).toBe(true)
  })

  it('site facts carry no page paths that could become unapproved links', () => {
    for (const locale of ['pt', 'en', 'es'] as const) {
      for (const fact of CHAT_PROFILE_BY_LOCALE[locale].siteFacts) {
        expect(fact).not.toMatch(/\/projects\/|https?:\/\//)
      }
    }
  })
})

describe('numbers and links guidance', () => {
  it.each([
    ['pt', /sem arredondar/, /não escreva links para páginas deste site/i],
    ['en', /without rounding/, /do not write links to pages of this site/i],
    ['es', /sin redondear/, /no escribas enlaces a páginas de este sitio/i],
  ] as const)(
    'tells Vega to copy numbers exactly and not link site pages (%s)',
    (locale, numbers, links) => {
      const prompt = buildSystemPrompt(locale, runtime)
      expect(prompt).toMatch(numbers)
      expect(prompt).toMatch(links)
    },
  )

  it('correction rules repeat the exact-number and no-site-link guidance', async () => {
    const { buildCorrectionSystemPrompt } = await import('../chat.response')
    expect(buildCorrectionSystemPrompt('base', 'unsupported-metric')).toMatch(
      /no rounding|without rounding/i,
    )
    expect(buildCorrectionSystemPrompt('base', 'unsafe-link')).toMatch(/pages of this site/i)
  })
})

describe('dimension notation is not a metric', () => {
  const pt = CHAT_PROFILE_BY_LOCALE.pt
  it.each([
    'Funciona para 3x3, 4x4, 2x2 e os outros eventos oficiais.',
    'Ele cobre todos os 13 eventos oficiais da WCA, do 2x2 ao 7x7.',
  ])('accepts: %s', (answer) => {
    expect(answerHasUnsupportedMetric(answer, pt)).toBe(false)
  })
})
