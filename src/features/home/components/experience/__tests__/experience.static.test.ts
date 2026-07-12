import type { useTranslations } from 'next-intl'
import { experiences } from '../experience.static'

const t = Object.assign(
  (key: string) =>
    (
      ({
        'jobs.lemon.company': 'Lemon Energia',
        'jobs.luizalabs.company': 'Luizalabs',
      }) as Record<string, string>
    )[key] ?? key,
  { raw: (key: string) => [key] },
) as ReturnType<typeof useTranslations>

describe('experiences', () => {
  it('keeps Lemon current and first, followed by Luizalabs', () => {
    const items = experiences(t)

    expect(items[0]).toMatchObject({
      company: 'Lemon Energia',
      logo: '/companies/lemon-logo-green.png',
      current: true,
    })
    expect(items[1]).toMatchObject({ company: 'Luizalabs', current: false })
  })
})
