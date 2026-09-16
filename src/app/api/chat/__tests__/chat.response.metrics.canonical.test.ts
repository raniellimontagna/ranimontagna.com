import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
import { createChatRuntimeContext } from '../chat.prompt'
import { validateChatAnswer } from '../chat.response'

const runtime = createChatRuntimeContext()

const validate = (answer: string) =>
  validateChatAnswer({
    answer,
    locale: 'pt',
    profile: CHAT_PROFILE_BY_LOCALE.pt,
    runtime,
    visitorMessage: 'me conte sobre sua experiencia',
  })

describe('metric validation against canonical facts', () => {
  it.each([
    // Frase canônica do perfil: as conjunções separam o verbo da métrica.
    'No Luizalabs, contribuí para produtos usados em estoque e logística em 1.000+ lojas e por 1.000+ estoquistas.',
    'No Luizalabs, contribuí para produtos usados em 1.000+ lojas.',
    'Na Smarten, liderei uma equipe de desenvolvimento frontend.',
    'Tenho 5+ anos em software e 10 anos de trajetória profissional.',
  ])('accepts a metric that restates an authoritative fact: %s', (answer) => {
    expect(validate(answer)).toEqual({ ok: true })
  })

  it('accepts the current number of portfolio projects and rejects a stale one', () => {
    const total = CHAT_PROFILE_BY_LOCALE.pt.projects.length

    expect(validate(`Tenho ${total} projetos no portfólio.`)).toEqual({ ok: true })
    expect(validate(`Tenho ${total + 1} projetos no portfólio.`)).toEqual({
      ok: false,
      code: 'unsupported-metric',
    })
  })

  it.each([
    'No Luizalabs, contribuí para produtos usados em 5.000 lojas.',
    'No Luizalabs, contribuí para produtos e atendi 5.000 clientes.',
    'Na Smarten, liderei 4 equipes.',
    'Aumentei a receita do Luizalabs em 300%.',
    'Atendi 1.000+ lojas na Smarten.',
  ])('still rejects an invented metric: %s', (answer) => {
    expect(validate(answer)).toEqual({ ok: false, code: 'unsupported-metric' })
  })

  it.each([
    ['pt', 'Sobre como funciona um projeto: a gente fecha escopo, prazo e preço antes.'],
    ['pt', 'Se quiser conversar sobre um projeto, fale com a Atto.'],
    ['es', 'Si quieres hablar de un proyecto, escribe a Atto.'],
  ] as const)(
    'treats an indefinite article as an article, not a count, in %s: %s',
    (locale, answer) => {
      expect(
        validateChatAnswer({
          answer,
          locale,
          profile: CHAT_PROFILE_BY_LOCALE[locale],
          runtime,
          visitorMessage: 'o que é a atto',
        }),
      ).toEqual({ ok: true })
    },
  )

  it.each([
    ['pt', 'Entreguei dois projetos na Lemon.'],
    ['pt', 'Liderei duas equipes na Smarten.'],
    ['en', 'I delivered one project at Lemon.'],
  ] as const)('still treats a spelled quantity as a metric in %s: %s', (locale, answer) => {
    expect(
      validateChatAnswer({
        answer,
        locale,
        profile: CHAT_PROFILE_BY_LOCALE[locale],
        runtime,
        visitorMessage: 'o que é a atto',
      }),
    ).toEqual({ ok: false, code: 'unsupported-metric' })
  })
})
