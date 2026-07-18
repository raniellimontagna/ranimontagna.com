import { CHAT_PROFILE_BY_LOCALE, type ChatExperience, type ChatLocale } from '../chat.profile'

type CurrentExperienceWithPastOutcomes = {
  company: string
  current: true
  endDate: null
  location: string
  outcomes: [string]
  period: string
  role: string
  scope: string[]
  startDate: string
}

type PreviousExperienceWithCurrentScope = {
  company: string
  current: false
  endDate: string
  location: string
  outcomes: string[]
  period: string
  role: string
  scope: [string]
  startDate: string
}

const locales: Array<{
  locale: ChatLocale
  currentPeriod: string
  previousPeriod: string
}> = [
  { locale: 'pt', currentPeriod: 'Jul 2026 - Presente', previousPeriod: 'Out 2023 - Jun 2026' },
  { locale: 'en', currentPeriod: 'Jul 2026 - Present', previousPeriod: 'Oct 2023 - Jun 2026' },
  { locale: 'es', currentPeriod: 'Jul 2026 - Presente', previousPeriod: 'Oct 2023 - Jun 2026' },
]

const canonicalExperienceDates = [
  {
    company: 'Lemon Energia',
    current: true,
    endDate: null,
    startDate: '2026-07',
  },
  {
    company: 'Luizalabs',
    current: false,
    endDate: '2026-06',
    startDate: '2023-10',
  },
  {
    company: 'Smarten',
    current: false,
    endDate: '2023-09',
    startDate: '2022-05',
  },
  {
    company: 'SBSistemas',
    current: false,
    endDate: '2022-05',
    startDate: '2021-05',
  },
] as const

describe('chat professional profile', () => {
  it.each([
    ['pt', /PJ/i, /posso avaliar projetos/i],
    ['en', /contractor/i, /can evaluate projects/i],
    ['es', /contratista/i, /puedo evaluar proyectos/i],
  ] as const)('states the non-exclusive Lemon engagement and project openness in %s', (locale, engagementPattern, availabilityPattern) => {
    const { availability } = CHAT_PROFILE_BY_LOCALE[locale]

    expect(availability).toMatch(engagementPattern)
    expect(availability).toMatch(availabilityPattern)
  })

  it('rejects details that do not belong to the experience state', () => {
    expectTypeOf<CurrentExperienceWithPastOutcomes>().not.toMatchTypeOf<ChatExperience>()
    expectTypeOf<PreviousExperienceWithCurrentScope>().not.toMatchTypeOf<ChatExperience>()
  })

  it.each(locales)('separates current scope from verified outcomes in $locale', ({
    locale,
    currentPeriod,
    previousPeriod,
  }) => {
    const [lemon, luizalabs] = CHAT_PROFILE_BY_LOCALE[locale].experiences

    expect(lemon).toMatchObject({
      company: 'Lemon Energia',
      current: true,
      endDate: null,
      outcomes: [],
      period: currentPeriod,
      startDate: '2026-07',
    })
    expect(lemon.scope.length).toBeGreaterThan(0)
    expect(luizalabs).toMatchObject({
      company: 'Luizalabs',
      current: false,
      endDate: '2026-06',
      period: previousPeriod,
      scope: [],
      startDate: '2023-10',
    })
    expect(luizalabs.outcomes.length).toBeGreaterThan(0)
  })

  it.each(locales)('keeps every canonical experience date aligned in $locale', ({ locale }) => {
    expect(
      CHAT_PROFILE_BY_LOCALE[locale].experiences.map(
        ({ company, current, endDate, startDate }) => ({
          company,
          current,
          endDate,
          startDate,
        }),
      ),
    ).toEqual(canonicalExperienceDates)
  })
})
