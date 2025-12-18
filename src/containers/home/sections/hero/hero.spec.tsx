// @vitest-environment jsdom

// Mock next-intl/server - must be before imports
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() =>
    Promise.resolve(
      Object.assign(
        (key: string) => {
          const translations: Record<string, string> = {
            name: 'Ranielli Montagna',
            greeting: 'Full Stack Developer',
            'passion.part1': 'I have experience in developing web and mobile applications',
            'passion.highlight': 'creating exceptional digital experiences',
            'passion.part2': 'with a focus on quality and performance.',
            description: 'I have experience in developing web and mobile applications',
          }
          return translations[key] || key
        },
        {
          raw: (key: string) => {
            if (key === 'skills.list') {
              return ['React', 'TypeScript', 'Node.js']
            }
            return key
          },
        },
      ),
    ),
  ),
}))

import { fireEvent, render, waitFor } from '@/tests/functions'
import { Hero } from './hero'

describe('Hero', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('should render the Hero component', async () => {
    const HeroResolved = await Hero()
    const { container } = render(HeroResolved)

    expect(container).toBeDefined()
  })

  it('should render the scroll down indicator without about section', async () => {
    const HeroResolved = await Hero()
    const { getByTestId } = render(HeroResolved)

    await waitFor(() => {
      const scrollDownIndicator = getByTestId('scroll-down-indicator')
      fireEvent.click(scrollDownIndicator)
      expect(scrollDownIndicator).toBeDefined()
    })
  })

  it('should render the scroll down indicator with about section', async () => {
    const HeroResolved = await Hero()
    const { getByTestId } = render(
      <>
        <section id="about">About Section</section>
        {HeroResolved}
      </>,
    )

    await waitFor(() => {
      const scrollDownIndicator = getByTestId('scroll-down-indicator')
      fireEvent.click(scrollDownIndicator)
      expect(scrollDownIndicator).toBeDefined()
    })
  })
})
