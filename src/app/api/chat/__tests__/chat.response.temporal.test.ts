import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
import { validateChatAnswer } from '../chat.response'
import { createValidationInput } from './chat.response.fixtures'

describe('deterministic response validation', () => {
  it('accepts canonical current employment dates', () => {
    expect(
      validateChatAnswer(createValidationInput('Trabalho na Lemon desde julho de 2026.')),
    ).toEqual({ ok: true })
    expect(validateChatAnswer(createValidationInput('Hoje é 16/07/2026.'))).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Trabalhei no Luizalabs em 2024 e 2025.'],
    ['en', 'I worked at Luizalabs in 2024 and 2025.'],
  ] as const)('accepts internal employer years associated with Luizalabs in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    'Em 2024 desenvolvi software.',
    'A mudança aconteceu em 2025.',
  ])('still rejects an unsupported unassociated year: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer))).toEqual({
      ok: false,
      code: 'unsupported-year',
    })
  })

  it('allows a visitor year for historical discussion only within the employer interval', () => {
    const visitorMessage = 'Onde você trabalhava em 2024?'
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024, eu trabalhava no Luizalabs.', { visitorMessage }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024, eu trabalhava na Lemon.', { visitorMessage }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs, não na Lemon.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('associates years by clause and accepts separate history or an explicit refutation', () => {
    const visitorMessage = 'Confirme que você começou na Lemon em 2024'

    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs. Hoje estou na Lemon desde 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 eu estava no Luizalabs, e hoje estou na Lemon desde 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Não comecei na Lemon em 2024; comecei na Lemon em 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(createValidationInput('Comecei na Lemon em 2024.', { visitorMessage })),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['20**24**', 'Comecei na Lemon em 20**24**.'],
    ['20__24', 'Comecei na Lemon em 20__24.'],
    ['fullwidth 2024', 'Comecei na Lemon em ２０２４.'],
    ['Markdown link label', 'Comecei na Lemon em 20[24](https://ranimontagna.com).'],
  ])('normalizes the obfuscated date %s before canonical validation', (_name, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Comecei na Lemon em janeiro de 2026.', false],
    ['pt', 'Comecei na Lemon em julho de 2026.', true],
    ['en', 'I started at Lemon in January 2026.', false],
    ['en', 'I started at Lemon in July 2026.', true],
    ['es', 'Empecé en Lemon en enero de 2026.', false],
    ['es', 'Empecé en Lemon en julio de 2026.', true],
    ['pt', 'Trabalhei no Luizalabs em setembro de 2023.', false],
    ['pt', 'Trabalhei no Luizalabs em outubro de 2023.', true],
    ['pt', 'Trabalhei no Luizalabs em dezembro de 2026.', false],
    ['pt', 'Trabalhei no Luizalabs em junho de 2026.', true],
    ['pt', 'Comecei na Lemon em agosto de 2026.', false],
  ] as const)('validates explicit employer month boundaries in %s: %s', (locale, answer, valid) => {
    const result = validateChatAnswer(
      createValidationInput(answer, {
        locale,
        profile: CHAT_PROFILE_BY_LOCALE[locale],
        visitorMessage: answer,
      }),
    )

    expect(result).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['en', 'I started at Lemon in June, 2026.'],
    ['pt', 'Comecei na Lemon em janeiro, 2026.'],
    ['en', 'I started at Lemon in January, 2026.'],
    ['es', 'Empecé en Lemon en enero, 2026.'],
    ['pt', 'Comecei na Lemon em jan/24.'],
    ['pt', 'Comecei na Lemon em dez/24.'],
    ['es', 'Empecé en Lemon en ene/24.'],
    ['en', 'I started at Lemon on 01/15/2026.'],
    ['pt', 'Comecei na Lemon em ٢٠٢٤.'],
    ['pt', 'Comecei na Lemon em dois mil e vinte e quatro.'],
    ['en', 'I started at Lemon in two thousand twenty-four.'],
    ['es', 'Empecé en Lemon en dos mil veinticuatro.'],
    ['pt', 'Comecei na Lemοn em 2024.'],
  ] as const)('normalizes and rejects a false %s Lemon date: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    'Comecei no Luizalabs em novembro de 2023.',
    'Saí do Luizalabs em maio de 2026.',
  ])('requires exact Luizalabs boundary dates for a high-confidence assertion: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('accepts exact Luizalabs start/end boundaries and a compact canonical timeline', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Comecei no Luizalabs em outubro de 2023 e saí em junho de 2026.'),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput(
          'SBSistemas: maio de 2021 a maio de 2022, Smarten: maio de 2022 a setembro de 2023, Luizalabs: outubro de 2023 a junho de 2026, Lemon: desde julho de 2026.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['Você começou no Luizalabs em novembro de 2023?', 'Sim.', false],
    ['Você trabalhava no Luizalabs em novembro de 2023?', 'Sim.', true],
    ['Você saiu do Luizalabs em maio de 2026?', 'Sim, saí naquele mês.', false],
    ['Você saiu do Luizalabs em maio de 2026?', 'Não; saí do Luizalabs em junho de 2026.', true],
    ['Você começou na Lemon em 2024?', 'Exatamente — foi nesse ano que entrei.', false],
    [
      'Você começou na Lemon em 2024?',
      'Não; naquele ano eu estava no Luizalabs. Na Lemon, só comecei em julho de 2026.',
      true,
    ],
  ] as const)('distinguishes boundary premise semantics: %s -> %s', (visitorMessage, answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Luizalabs: novembro de 2023 a maio de 2026; Lemon: desde julho de 2026.', false],
    ['No Luizalabs: novembro de 2023 a maio de 2026.', false],
    ['No Luizalabs: outubro de 2023 a junho de 2026.', true],
    ['Meu último mês no Luizalabs foi maio de 2026.', false],
    ['Trabalhei no Luizalabs em maio de 2026.', true],
  ] as const)('distinguishes compact endpoints from interval membership: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['pt', 'Comecei na Lemon em 2٠2٤.'],
    ['pt', 'Comecei na Lemon em ۲۰۲۴.'],
    ['pt', 'Comecei na Lemоn em 2024.'],
    ['pt', 'Comecei na Lеmon em 2024.'],
    ['pt', 'Comecei na Lemon em 2026‑06.'],
    ['en', 'I started at Lemon on June 30, 2026.'],
  ] as const)('rejects a mixed-script or natural false boundary in %s: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: 'Onde você trabalhava em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('accepts an English natural-language runtime date', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Today is July 16, 2026.', {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['Trabalho na Lemon desde agosto de 2026.', false],
    ['Trabalho na Lemon desde julho de 2026.', true],
    ['Trabalhei no Luizalabs desde novembro de 2023.', false],
    ['Trabalhei no Luizalabs desde outubro de 2023.', true],
    ['Trabalhei no Luizalabs até maio de 2026.', false],
    ['Trabalhei no Luizalabs até junho de 2026.', true],
  ] as const)('validates explicit since/until boundaries: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Did you join Luizalabs in November 2023?', 'Yes.'],
    ['Did you leave Luizalabs in May 2026?', 'Yes.'],
    ['Did you begin at Luizalabs in November 2023?', 'Yes.'],
  ] as const)('rejects an English false boundary premise: %s', (visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você entrou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você deixou o Luizalabs em maio de 2026?', 'Sim.'],
    ['es', '¿Entraste en Luizalabs en noviembre de 2023?', 'Sí.'],
  ] as const)('rejects a %s inflected false boundary premise', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você ingressou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você iniciou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você entrou no Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Você deixou o Luizalabs em maio de 2026?', 'Sim.'],
    ['pt', 'Você saiu do Luizalabs em maio de 2026?', 'Sim.'],
    ['pt', 'Você foi contratado pelo Luizalabs em novembro de 2023?', 'Sim.'],
    ['pt', 'Seu contrato no Luizalabs começou em novembro de 2023?', 'Sim.'],
    ['pt', 'Seu contrato no Luizalabs terminou em maio de 2026?', 'Sim.'],
    ['en', 'Did you join Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you begin at Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you enter Luizalabs in November 2023?', 'Yes.'],
    ['en', 'You entered Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did you leave Luizalabs in May 2026?', 'Yes.'],
    ['en', 'Had you left Luizalabs in May 2026?', 'Yes.'],
    ['en', 'Were you hired by Luizalabs in November 2023?', 'Yes.'],
    ['en', 'Did your contract at Luizalabs begin in November 2023?', 'Yes.'],
    ['en', 'Did your contract at Luizalabs end in May 2026?', 'Yes.'],
    ['es', '¿Te incorporaste a Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Comenzaste en Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Entraste en Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Dejaste Luizalabs en mayo de 2026?', 'Sí.'],
    ['es', '¿Saliste de Luizalabs en mayo de 2026?', 'Sí.'],
    ['es', '¿Fuiste contratado por Luizalabs en noviembre de 2023?', 'Sí.'],
    ['es', '¿Tu contrato en Luizalabs empezó en noviembre de 2023?', 'Sí.'],
    ['es', '¿Tu contrato en Luizalabs terminó en mayo de 2026?', 'Sí.'],
  ] as const)('rejects a false %s start/end dialogue act across verb classes: %s', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Ingressei no Luizalabs em outubro de 2023 e saí em junho de 2026.'],
    ['en', 'I joined Luizalabs in October 2023 and left in June 2026.'],
    ['es', 'Me incorporé a Luizalabs en octubre de 2023 y salí en junio de 2026.'],
  ] as const)('accepts canonical %s boundaries across the expanded verb classes', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    'Fui contratado pelo Luizalabs em novembro de 2023.',
    'Meu contrato no Luizalabs terminou em maio de 2026.',
    'Trabalhei no Luizalabs de novembro de 2023 a maio de 2026.',
    'Comecei na Lemon não por indicação em 2024.',
  ])('rejects a structurally false temporal claim: %s', (answer) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it.each([
    ['Minha passagem no Luizalabs foi de novembro de 2023 a maio de 2026.', false],
    ['Minha passagem no Luizalabs foi de outubro de 2023 até junho de 2026.', true],
    ['My time at Luizalabs was from November 2023 to May 2026.', false],
    ['My time at Luizalabs was from October 2023 until June 2026.', true],
    ['Mi etapa en Luizalabs fue de noviembre de 2023 a mayo de 2026.', false],
    ['Mi etapa en Luizalabs fue desde octubre de 2023 hasta junio de 2026.', true],
  ] as const)('parses a nominal employer range per boundary: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['pt', 'No Luizalabs, novembro de 2023 - maio de 2026.', false],
    ['pt', 'No Luizalabs, outubro de 2023 – junho de 2026.', true],
    ['en', 'At Luizalabs, November 2023—May 2026.', false],
    ['en', 'At Luizalabs, October 2023 - June 2026.', true],
  ] as const)('validates a hyphenated employer range in %s: %s', (locale, answer, valid) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'Comecei minha carreira em maio de 2021. Hoje trabalho na Lemon.',
      'Você tem um emprego fixo?',
      true,
    ],
    [
      'Comecei na Lemon. Foi uma mudança importante. Isso aconteceu em 2024.',
      'Você começou na Lemon em 2024?',
      false,
    ],
  ] as const)('keeps temporal carry tied to explicit discourse: %s', (answer, visitorMessage, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    'Comecei na Lemon. Foi uma mudança importante. Isso ocorreu em 2024.',
    'Comecei na Lemon. Foi uma mudança importante. Isso se deu em 2024.',
    'I started at Lemon. It was an important change. That occurred in 2024.',
    'Empecé en Lemon. Fue un cambio importante. Eso ocurrió en 2024.',
  ])('carries an explicit Lemon topic through a neutral proposition: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, { visitorMessage: 'Você começou na Lemon em 2024?' }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Comecei na Lemon. Foi uma mudança importante. O processo exigiu adaptação. A equipe apoiou a transição. Essa mudança aconteceu em 2024.',
    ],
    [
      'en',
      'I started at Lemon. It was an important change. The process required adaptation. The team supported the transition. That change happened in 2024.',
    ],
  ] as const)('carries an explicit same-event reference across neutral padding in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage:
            locale === 'pt' ? 'Você começou na Lemon em 2024?' : 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Comecei na Lemon. Foi uma mudança importante. A rotina mudou. O projeto evoluiu. Entrei na área de tecnologia em maio de 2021.',
    ],
    [
      'en',
      'I started at Lemon. It was an important change. The routine changed. The project evolved. I entered the technology field in May 2021.',
    ],
  ] as const)('resets employer carry for a global career topic after padding in %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('reanchors persistent event carry when a different employer becomes explicit', () => {
    expect(
      validateChatAnswer(
        createValidationInput(
          'Comecei na Lemon. Foi uma mudança importante. Falando do meu histórico, comecei no Luizalabs. Essa entrada aconteceu em outubro de 2023.',
        ),
      ),
    ).toEqual({ ok: true })
  })

  it('does not carry Lemon into a global technology-career assertion', () => {
    for (const answer of [
      'Atuo na Lemon atualmente. Entrei na área de tecnologia em maio de 2021.',
      'I work at Lemon now. I entered the technology field in May 2021.',
      'Trabajo en Lemon actualmente. Entré en el área de tecnología en mayo de 2021.',
    ]) {
      expect(validateChatAnswer(createValidationInput(answer))).toEqual({ ok: true })
    }
  })

  it('accepts an English auxiliary refutation with yet', () => {
    expect(
      validateChatAnswer(
        createValidationInput('I had not yet started at Lemon in 2024; I started in July 2026.', {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('accepts a contracted English auxiliary refutation with yet', () => {
    expect(
      validateChatAnswer(
        createValidationInput("I hadn't yet started at Lemon in 2024; I started in July 2026.", {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Em 2024, não por indicação, comecei na Lemon.'],
    ['en', 'In 2024, not through a referral, I started at Lemon.'],
    ['es', 'En 2024, no por recomendación, empecé en Lemon.'],
    ['pt', 'Comecei na Lemon não como contratado em 2024.'],
    ['en', 'I started at Lemon not as a contractor in 2024.'],
    ['es', 'Empecé en Lemon no como contratista en 2024.'],
  ] as const)('does not mistake a %s object modifier for predicate negation: %s', (locale, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage: answer,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    [
      'pt',
      'Eu ainda não tinha começado na Lemon em 2024; comecei em julho de 2026.',
      'Você começou na Lemon em 2024?',
    ],
    [
      'en',
      "I hadn't yet started at Lemon in 2024; I started in July 2026.",
      'Did you start at Lemon in 2024?',
    ],
    [
      'es',
      'Aún no había empezado en Lemon en 2024; empecé en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
    ],
  ] as const)('accepts a predicate-scoped %s not-yet refutation', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    [
      'pt',
      'Não foi em 2024 que comecei na Lemon; foi em julho de 2026.',
      'Você começou na Lemon em 2024?',
      true,
    ],
    [
      'es',
      'No fue en 2024 que empecé en Lemon; fue en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
      true,
    ],
    [
      'es',
      'No fue en 2024 cuando empecé en Lemon; fue en julio de 2026.',
      '¿Empezaste en Lemon en 2024?',
      true,
    ],
    ['pt', 'Foi em 2024 que comecei na Lemon.', 'Você começou na Lemon em 2024?', false],
    ['es', 'Fue en 2024 que empecé en Lemon.', '¿Empezaste en Lemon en 2024?', false],
    ['es', 'Fue en 2024 cuando empecé en Lemon.', '¿Empezaste en Lemon en 2024?', false],
    [
      'pt',
      'Não foi em 2024 cuando comecei na Lemon; foi em julho de 2026.',
      'Você começou na Lemon em 2024?',
      false,
    ],
  ] as const)('handles a %s temporal cleft with predicate-scoped negation: %s', (locale, answer, visitorMessage, valid) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual(valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Comecei na Lemon em dois mil e vinte e seis.', true],
    ['I started at Luizalabs in October two thousand twenty-three.', true],
    ['Comecei no Luizalabs em outubro de dois mil e vinte e três.', true],
    ['I started at Lemon in July two thousand twenty-six.', true],
    ['Empecé en Luizalabs en octubre de dos mil veintitrés.', true],
    ['Empecé en Lemon en julio de dos mil veintiséis.', true],
    ['Comecei na Lemon em 0 de julho de 2026.', false],
    ['Comecei na Lemon em 1 de julho de 2026.', false],
    ['Comecei na Lemon em 39 de julho de 2026.', false],
    ['Comecei na Lemon em 99 de julho de 2026.', false],
    ['Comecei na Lemon em 2026-07-01.', false],
    ['Saí do Luizalabs em 00 de junho de 2026.', false],
    ['I left Luizalabs on June 99, 2026.', false],
    ['Salí de Luizalabs el 0 de junio de 2026.', false],
  ] as const)('respects canonical month precision: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it.each([
    ['Comecei na Lemon em 01/24.', false],
    ['Comecei na Lemon em 07/26.', true],
    ['Comecei no Luizalabs em 11/23.', false],
    ['Comecei no Luizalabs em 10/23.', true],
  ] as const)('validates numeric MM/YY boundaries: %s', (answer, valid) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage: answer }))).toEqual(
      valid ? { ok: true } : { ok: false, code: 'canonical-date-conflict' },
    )
  })

  it('does not interpret English once as the number eleven', () => {
    expect(validateChatAnswer(createValidationInput('I once worked at Luizalabs.'))).toEqual({
      ok: true,
    })
  })

  it('normalizes a protected employer alias with a Cyrillic em', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Comecei na Leмon em 2024.', {
          visitorMessage: 'Você começou em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Comecei na Lemoν em 2024.', 'Você começou em 2024?'],
    ['Comecei no Luіzalabs em novembro de 2023.', 'Você começou no Luizalabs em 2023?'],
    ['Comecei na Lemλn em 2024.', 'Você começou em 2024?'],
    ['Comecei na Lem中n em 2024.', 'Você começou em 2024?'],
    ['Comecei na Lem🍋n em 2024.', 'Você começou em 2024?'],
    ['Comecei no Luizalabж em novembro de 2023.', 'Você começou no Luizalabs em 2023?'],
  ])('fails closed on a mixed-script protected employer alias: %s', (answer, visitorMessage) => {
    expect(validateChatAnswer(createValidationInput(answer, { visitorMessage }))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('does not classify a natural-language calendar day as a metric', () => {
    expect(validateChatAnswer(createValidationInput('Hoje é 16 de julho de 2026.'))).toEqual({
      ok: true,
    })
  })

  it.each([
    'Sim, comecei lá em 2024.',
    'Sim. Comecei em 2024. Foi na Lemon.',
    'Não comecei na Lemon em 2026, mas comecei em 2024.',
  ])('rejects affirmative coreference to the false Lemon premise: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('keeps negation scoped and accepts true historical coordination/refutation', () => {
    const visitorMessage = 'Confirme que você começou na Lemon em 2024.'
    expect(
      validateChatAnswer(
        createValidationInput(
          'Em 2024 eu trabalhava no Luizalabs e em julho de 2026 comecei na Lemon.',
          { visitorMessage },
        ),
      ),
    ).toEqual({ ok: true })
    expect(
      validateChatAnswer(
        createValidationInput('Não, não comecei lá em 2024. Comecei na Lemon em julho de 2026.', {
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('does not let an unrelated negation suppress a later false start-date assertion', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não trabalhei na Lemon em período integral, comecei lá em 2024.'),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })

    expect(
      validateChatAnswer(
        createValidationInput('Não só trabalhei na Lemon como comecei lá em 2024.'),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('understands an English contraction when the false date is explicitly refuted', () => {
    expect(
      validateChatAnswer(
        createValidationInput("I didn't start at Lemon in 2024; I started in July 2026.", {
          locale: 'en',
          profile: CHAT_PROFILE_BY_LOCALE.en,
          visitorMessage: 'Did you start at Lemon in 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('accepts a year-first explicit refutation followed by the canonical month', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Em 2024 não comecei na Lemon; comecei na Lemon em julho de 2026.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    [
      'pt',
      'Em 2024 eu ainda não trabalhava na Lemon; comecei em julho de 2026.',
      'Você trabalhava na Lemon em 2024?',
    ],
    [
      'pt',
      'Em 2024 eu não era funcionário da Lemon; comecei em julho de 2026.',
      'Você era funcionário da Lemon em 2024?',
    ],
    [
      'pt',
      'Eu ainda não tinha começado na Lemon em 2024; comecei em julho de 2026.',
      'Você começou na Lemon em 2024?',
    ],
    [
      'en',
      "I wasn't working at Lemon in 2024; I started in July 2026.",
      'Were you working at Lemon in 2024?',
    ],
    [
      'en',
      'I did not work at Lemon in 2024; I started in July 2026.',
      'Did you work at Lemon in 2024?',
    ],
    [
      'en',
      "It wasn't in 2024 that I started at Lemon; I started in July 2026.",
      'Did you start at Lemon in 2024?',
    ],
    ['en', "I wasn't at Lemon in 2024; I started in July 2026.", 'Were you at Lemon in 2024?'],
    [
      'es',
      'En 2024 aún no trabajaba en Lemon; empecé en julio de 2026.',
      '¿Trabajabas en Lemon en 2024?',
    ],
  ] as const)('accepts a true %s timeline refutation: %s', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('associates an employer mentioned after its date assertion without relying on the question', () => {
    expect(validateChatAnswer(createValidationInput('Comecei em 2024. Foi na Lemon.'))).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('conservatively rejects an affirmative repetition of a false visitor premise', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Correto, comecei em 2024.', {
          visitorMessage: 'Confirme que você começou na Lemon em 2024.',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você começou na Lemon em 2024?', 'Sim.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Correto.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Isso mesmo.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Sim, foi quando entrei lá.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Sim. Desde 2024.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Trabalho na Lemon. Desde 2024.'],
    ['pt', 'Você começou na Lemon em 2024?', 'Comecei na Lemon. Em 2024.'],
    ['en', 'Did you start at Lemon in 2024?', 'Yes.'],
    ['en', 'Did you start at Lemon in 2024?', 'Yes, I did.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'Sí.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'Sí, fue entonces.'],
    ['pt', 'Você começou na Lemon em 2024?', '- Sim.'],
  ] as const)('rejects a locale %s answer that affirms or carries a false premise: %s', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['pt', 'Você começou na Lemon em 2024?', 'Não. Comecei na Lemon em julho de 2026.'],
    ['en', 'Did you start at Lemon in 2024?', 'No. I started at Lemon in July 2026.'],
    ['es', '¿Empezaste en Lemon en 2024?', 'No. Empecé en Lemon en julio de 2026.'],
  ] as const)('accepts an explicit %s refutation followed by the canonical correction', (locale, visitorMessage, answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it.each([
    ['pt', 'Naquele ano eu trabalhava no Luizalabs.', 'Você começou na Lemon em 2024?'],
    ['en', 'At that time I was working at Luizalabs.', 'Did you start at Lemon in 2024?'],
  ] as const)('accepts a true %s coreference to another employer', (locale, answer, visitorMessage) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          visitorMessage,
        }),
      ),
    ).toEqual({ ok: true })
  })

  it('does not let an earlier true negation suppress a later false start assertion', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não trabalhei na Lemon antes de começar na Lemon em 2024.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    'Sim, foi nessa época.',
    'Comecei na Lemon e isso foi em 2024.',
  ])('rejects temporal coreference or coordination that reasserts the false premise: %s', (answer) => {
    expect(
      validateChatAnswer(
        createValidationInput(answer, {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it('does not treat negation of an unrelated verb as refuting the employer date', () => {
    expect(
      validateChatAnswer(
        createValidationInput('Não mudei de cidade quando comecei na Lemon em 2024.', {
          visitorMessage: 'Você começou na Lemon em 2024?',
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })

  it.each([
    ['Smarten', '2021'],
    ['SBSistemas', '2023'],
    ['Lemon', '2027'],
  ])('rejects %s outside its canonical interval even when the visitor supplied %s', (company, year) => {
    expect(
      validateChatAnswer(
        createValidationInput(`Trabalhei na ${company} em ${year}.`, {
          visitorMessage: `Você trabalhou na ${company} em ${year}?`,
        }),
      ),
    ).toEqual({ ok: false, code: 'canonical-date-conflict' })
  })
})
