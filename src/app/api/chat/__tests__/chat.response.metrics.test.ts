import { CHAT_PROFILE_BY_LOCALE, type ChatProfile } from '../chat.profile'
import { validateChatAnswer } from '../chat.response'
import { createValidationInput } from './chat.response.fixtures'

describe('deterministic response validation', () => {
  it.each([
    'Entreguei energia para 10.000 clientes na Lemon.',
    'Entreguei energia para 10**.**000 clientes na Lemon.',
    'Entreguei energia para １０，０００ clientes na Lemon.',
    'Entreguei energia para 10 000 clientes na Lemon.',
  ])('rejects an unsupported normalized employer metric: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['pt', 'Entreguei energia para dez mil clientes na Lemon.'],
    ['en', 'I delivered energy to ten thousand customers at Lemon.'],
    ['es', 'Entregué energía a diez mil clientes en Lemon.'],
    ['pt', 'Impactei milhares de clientes na Lemon.'],
    ['pt', 'Impactei ١٠٬٠٠٠ clientes na Lemon.'],
  ] as const)('rejects a spelled or Unicode-scaled %s metric: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('rejects a simple unsupported metric with a non-canonical unit', () => {
    expect(validateChatAnswer(createValidationInput('Entreguei 42 projetos relevantes.'))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['ordered technology list', '1. React\n2. Node.js\n3. TypeScript'],
    ['canonical technology versions', 'React 19, Next.js 15, Node.js 22.'],
  ] as const)('ignores non-metric numbers in a %s', (_name, answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it.each([
    ['ordered list content', '1. React\n2. 500 projects\n3. TypeScript'],
    ['unit after a canonical technology', 'React 19 users.'],
    ['unit on the line after a canonical technology', 'React\n19 users.'],
    ['unknown unit on the line after a canonical technology', 'React\n42 widgets.'],
    ['non-contiguous list marker', '7. React'],
  ] as const)('does not mask a metric-like number in %s', (_name, answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Entreguei 500 projetos na Lemon.',
    'Reduzi 50% do tempo na Lemon.',
    'Impactei 2 milhões de clientes na Lemon.',
    'Na Lemon, contribuo para produtos usados em 1.000+ lojas.',
    'Tenho 10 anos na Lemon.',
  ])('rejects unsupported or employer-laundered metric claims: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Na Lemon. Impactei 1.000+ lojas.',
    'Impactei 1.000+ lojas. Isso foi na Lemon.',
    'Impactei 1.000+ lojas e isso foi na Lemon.',
    'Meu trabalho atual é na Lemon. Contribuo para produtos usados em 1.000+ lojas.',
    'Impactei 1.000+ lojas. Trabalho na Lemon.',
    'Contribuo para produtos usados em 1.000+ lojas e trabalho na Lemon.',
  ])('rejects a canonical metric laundered into Lemon across discourse: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'Tenho 5+ anos em software e 10 anos de trajetória profissional.',
    'Contribuí com operações em 1.000+ lojas e para 1.000+ estoquistas.',
    'Tenho 5 anos.',
    'Tenho mais de 5 anos.',
    '5+ anos.',
    'Contribuí para mais de 1.000 lojas no Luizalabs.',
  ])('preserves a canonical public metric: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it('allows a structural project count globally but not as a Lemon outcome', () => {
    expect(validateChatAnswer(createValidationInput('Tenho 3 projetos principais.'))).toEqual({
      ok: true,
    })
    expect(
      validateChatAnswer(createValidationInput('Na Lemon, entreguei 3 projetos principais.')),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    ['Na Lemon, tenho cinco anos ou mais em software.', false],
    ['Tenho dez anos de trajetória profissional.', true],
    ['Tenho onze anos de trajetória profissional.', false],
    ['No Luizalabs, contribuí para mais de mil lojas.', true],
    ['Na Lemon, contribuí para mais de mil lojas.', false],
    ['Reduzi cinquenta por cento do tempo na Lemon.', false],
    ['No Luizalabs, contribuí para mil lojas.', true],
    ['Na Lemon, contribuí para mil lojas.', false],
    ['Na Lemon, entreguei quinhentos projetos.', false],
    ['At Lemon, I delivered forty-two projects.', false],
    ['En Lemon, entregué quinientos proyectos.', false],
    ['Na Lemon, entreguei quatro projetos.', false],
    ['Tenho três projetos principais.', true],
    ['No Luizalabs, contribuí para 1k+ lojas.', true],
    ['Na Lemon, contribuí para 1k+ lojas.', false],
    ['Contribuí para vinte mil lojas no Luizalabs.', false],
    ['I contributed to twelve thousand stores at Luizalabs.', false],
    ['Impactei vinte milhões de clientes na Lemon.', false],
    ['Contratei 1.000 estoquistas no Luizalabs.', false],
    ['Contribuí para trinta mil lojas no Luizalabs.', false],
    ['I contributed to thirty thousand stores at Luizalabs.', false],
    ['Impactei trinta milhões de clientes na Lemon.', false],
    ['Demitimos 1.000 estoquistas no Luizalabs.', false],
    ['I managed 1,000 stock clerks at Luizalabs.', false],
  ] as const)('validates typed spelled metrics without employer laundering: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    ['pt', 'Contribuí para cento e vinte e três mil lojas no Luizalabs.'],
    ['en', 'I contributed to two hundred thirty-four thousand stores at Luizalabs.'],
    ['es', 'Contribuí a trescientas cuarenta y cinco mil tiendas en Luizalabs.'],
    ['pt', 'Impactei cento e vinte e três milhões de clientes na Lemon.'],
    ['en', 'I impacted hundreds of millions of customers at Lemon.'],
    ['es', 'Impacté miles de clientes en Lemon.'],
    ['pt', 'Impactei milhares de clientes na Lemon.'],
    ['en', 'I impacted millions of customers at Lemon.'],
    ['es', 'Impacté millones de clientes en Lemon.'],
  ] as const)('rejects a compositional or vague %s metric: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    'Contribuí para um mil lojas no Luizalabs.',
    'I contributed to one thousand stores at Luizalabs.',
    'Contribuí a productos usados en mil tiendas en Luizalabs.',
    'I supported operations across at least 1,000 stores at Luizalabs.',
    'Apoiei operações em 1.000+ lojas no Luizalabs.',
    'Trabajé en operaciones para 1.000 tiendas en Luizalabs.',
  ])('accepts an allowlisted canonical employer outcome: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it.each([
    'Demitimos 1.000 estoquistas no Luizalabs.',
    'I managed 1,000 stock clerks at Luizalabs.',
    'Supervisionei 1.000 estoquistas no Luizalabs.',
    'I audited 1,000 stock clerks at Luizalabs.',
    'Gestioné 1.000 almacenistas en Luizalabs.',
  ])('rejects a non-allowlisted employer metric predicate: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    ['Tenho 5+ anos em software.', true],
    ['Tenho mais de 5 anos em software.', true],
    ['Tenho 10 anos de trajetória profissional.', true],
    ['Tenho 10+ anos de trajetória profissional.', false],
    ['Tenho mais de 10 anos de trajetória profissional.', false],
    ['Contribuí para 1.000 lojas no Luizalabs.', true],
    ['Contribuí para 1.000+ lojas no Luizalabs.', true],
    ['I contributed to at least 1,000 stores at Luizalabs.', true],
    ['Contribuí para 1.001 lojas no Luizalabs.', false],
  ] as const)('matches only a canonical metric comparator: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    ['Tenho 3 projetos principais.', true],
    ['I have 3 main projects.', true],
    ['Tengo 3 proyectos principales.', true],
    ['Tenho 3 projetos principais na Lemon.', false],
    ['Tenho 5+ anos em software. Hoje trabalho na Lemon.', true],
  ] as const)('keeps global, structural, and employer metric scopes separate: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'unsupported-metric' },
    )
  })

  it.each([
    'Na Lemon. Esse foi um grande resultado. Contribuí para produtos usados em 1.000 lojas.',
    'At Lemon. That was a major result. I contributed to products used in 1,000 stores.',
    'En Lemon. Ese fue un gran resultado. Contribuí a productos usados en 1.000 tiendas.',
  ])('rejects reverse employer laundering through a bounded result bridge: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it('carries an unscoped outcome through the exact neutral padding until Lemon', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um resultado relevante. O projeto evoluiu. Isso aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('validates the same padded outcome against Luizalabs', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um resultado relevante. O projeto evoluiu. Isso aconteceu no Luizalabs.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('does not leave an explicitly attributed Luizalabs outcome pending for Lemon', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas no Luizalabs. Hoje trabalho na Lemon.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('keeps a pending outcome across an explicit topic-change marker', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Mudando de assunto, o projeto evoluiu. Esse resultado aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    'O ticket 1000 foi resolvido no Luizalabs.',
    'A versão 1.000 do aplicativo foi publicada.',
    'Hoje é 16 de julho de 2026.',
  ])('excludes a date or identifier span from metric validation: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
  })

  it('uses canonical structured metric facts instead of localized outcome prose', () => {
    const profile = {
      ...CHAT_PROFILE_BY_LOCALE.en,
      experiences: CHAT_PROFILE_BY_LOCALE.en.experiences.map((experience) => ({
        ...experience,
        outcomes: experience.current ? [] : ['Localized prose intentionally replaced.'],
      })),
    } as ChatProfile

    expect(
      validateChatAnswer(
        createValidationInput('I contributed to 1,000 stores at Luizalabs.', {
          locale: 'en',
          profile,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('rejects an employer metric laundered through one neutral proposition', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Impactei 1.000 lojas. Foi um grande resultado. Isso aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('rejects a canonical metric reattributed by an explicit result coreference', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Contribuí para produtos usados em 1.000 lojas. Foi um grande resultado. Esse resultado aconteceu na Lemon.',
        ),
      ),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it('classifies a year-shaped quantity as a metric before temporal validation', () => {
    expect(validateChatAnswer(createValidationInput('Atendi 2024 usuários na Lemon.'))).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })
})
