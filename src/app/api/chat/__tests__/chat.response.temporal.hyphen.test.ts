import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
import { createChatRuntimeContext } from '../chat.prompt'
import { validateChatAnswer } from '../chat.response'
import { extractDateReferences } from '../chat.response.temporal'

const runtime = createChatRuntimeContext()

const validate = (answer: string, locale: 'pt' | 'en' | 'es' = 'pt') =>
  validateChatAnswer({
    answer,
    locale,
    profile: CHAT_PROFILE_BY_LOCALE[locale],
    runtime,
    visitorMessage: 'me conte sobre sua experiencia profissional',
  })

describe('temporal validation with hyphenated role names', () => {
  it.each([
    ['pt', 'Fui Tech Lead Front-end na Smarten (2022 a 2023).'],
    ['pt', 'Fui Desenvolvedor Front-end na SBSistemas (2021 a 2022).'],
    ['pt', 'Na Smarten, como Tech Lead Front-end, atuei de 2022 a 2023.'],
    ['en', 'I was a Front-end Tech Lead at Smarten (2022 to 2023).'],
    ['es', 'Fui Tech Lead Front-end en Smarten (2022 a 2023).'],
  ] as const)(
    'accepts a canonical tenure described with a hyphenated role in %s',
    (locale, answer) => {
      expect(validate(answer, locale)).toEqual({ ok: true })
    },
  )

  it('still rejects a tenure that ends in the wrong year', () => {
    expect(validate('Saí da Smarten em 2021.')).toEqual({
      ok: false,
      code: 'canonical-date-conflict',
    })
  })

  it('reads month tokens regardless of capitalization', () => {
    expect(extractDateReferences('Set 2023')).toEqual([
      { day: null, index: 0, length: 8, month: 9, year: 2023 },
    ])
    expect(extractDateReferences('mai 2022')).toEqual([
      { day: null, index: 0, length: 8, month: 5, year: 2022 },
    ])
  })
})
