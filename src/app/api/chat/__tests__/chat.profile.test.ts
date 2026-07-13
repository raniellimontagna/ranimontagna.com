import { CHAT_PROFILE_BY_LOCALE, type ChatLocale } from '../chat.profile'

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
  it.each(locales)('separates current scope from verified outcomes in $locale', ({
    locale,
    currentPeriod,
    previousPeriod,
  }) => {
    const [lemon, luizalabs] = CHAT_PROFILE_BY_LOCALE[locale].experiences

    expect(lemon).toMatchObject({
      company: 'Lemon Energia',
      current: true,
      outcomes: [],
      period: currentPeriod,
    })
    expect(lemon.scope.length).toBeGreaterThan(0)
    expect(luizalabs).toMatchObject({
      company: 'Luizalabs',
      current: false,
      period: previousPeriod,
      scope: [],
    })
    expect(luizalabs.outcomes.length).toBeGreaterThan(0)
  })
})
