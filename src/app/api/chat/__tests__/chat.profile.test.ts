import { CHAT_PROFILE_BY_LOCALE, type ChatExperience, type ChatLocale } from '../chat.profile'

// Since round 2 the current job may carry published, verified results.
type CurrentExperienceWithOutcomes = {
  company: string
  current: true
  endDate: null
  location: string
  outcomes: string[]
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
    ['pt', /PJ/i, /avalia conforme/i],
    ['en', /contractor/i, /evaluates depending/i],
    ['es', /contratista/i, /evalúa según/i],
  ] as const)(
    'states the non-exclusive Lemon engagement, Atto routing and project openness in %s',
    (locale, engagementPattern, availabilityPattern) => {
      const { availability, venture } = CHAT_PROFILE_BY_LOCALE[locale]

      expect(availability).toMatch(engagementPattern)
      expect(availability).toMatch(availabilityPattern)
      expect(availability).toContain('Atto')
      expect(venture.name).toBe('Atto')
      expect(venture.fronts).toHaveLength(4)
      expect(venture.routing).toContain('attodev.com.br')
    },
  )

  it('allows published results on the current job but no scope on past jobs', () => {
    expectTypeOf<CurrentExperienceWithOutcomes>().toMatchTypeOf<ChatExperience>()
    expectTypeOf<PreviousExperienceWithCurrentScope>().not.toMatchTypeOf<ChatExperience>()
  })

  it.each(locales)(
    'separates current scope from verified outcomes in $locale',
    ({ locale, currentPeriod, previousPeriod }) => {
      const [lemon, luizalabs] = CHAT_PROFILE_BY_LOCALE[locale].experiences

      expect(lemon).toMatchObject({
        company: 'Lemon Energia',
        current: true,
        endDate: null,
        period: currentPeriod,
        startDate: '2026-07',
      })
      // The published Lemon results (trajectory, round 2) are verified outcomes now.
      expect(lemon.outcomes).toHaveLength(4)
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
    },
  )

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

  it.each(['pt', 'en', 'es'] as const)(
    'tells Vega about the Go back end, the tools and Black Friday at Luizalabs in %s',
    (locale) => {
      const luizalabs = CHAT_PROFILE_BY_LOCALE[locale].experiences[1]
      const text = luizalabs.outcomes.join(' ')
      for (const tool of ['Go', 'GCP', 'RabbitMQ', 'SonarQube', 'Grafana', 'Black Friday']) {
        expect(text).toContain(tool)
      }
    },
  )
})
