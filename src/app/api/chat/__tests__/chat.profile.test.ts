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

describe('chat professional profile', () => {
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
})
