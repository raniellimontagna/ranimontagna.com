import { fireEvent, render, screen } from '@/tests/test-utils'
import { Hero2026 } from '../hero-2026'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue(
    Object.assign((key: string) => key, {
      raw: (key: string) => key,
      rich: (key: string) => key,
    }),
  ),
}))

vi.mock('../hero-portrait', () => ({
  // biome-ignore lint/performance/noImgElement: test double for the canvas portrait.
  HeroPortrait: ({ alt }: { alt: string }) => <img alt={alt} src="/photo.webp" />,
}))

describe('Hero2026', () => {
  it('server-renders the name, lead and both actions', async () => {
    render(await Hero2026())
    expect(screen.getByRole('heading', { level: 1, name: 'Ranielli Montagna' })).toBeInTheDocument()
    expect(screen.getByText('lead')).toBeVisible()
    expect(screen.getByRole('button', { name: 'ctaAltair' })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'ctaWork' })).toHaveAttribute('href', '#no-ar')
    expect(screen.getByAltText('portraitAlt')).toBeInTheDocument()
  })

  it('splits the name into aria-hidden letters for the CSS entrance', async () => {
    render(await Hero2026())
    expect(document.querySelectorAll('h1 [data-letter][aria-hidden="true"]')).toHaveLength(
      'RanielliMontagna'.length,
    )
  })

  it('the Altair action dispatches altair:open', async () => {
    const spy = vi.fn()
    window.addEventListener('altair:open', spy)
    render(await Hero2026())
    fireEvent.click(screen.getByRole('button', { name: 'ctaAltair' }))
    expect(spy).toHaveBeenCalledTimes(1)
    window.removeEventListener('altair:open', spy)
  })
})
