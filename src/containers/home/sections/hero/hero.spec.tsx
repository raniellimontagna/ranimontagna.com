// @vitest-environment jsdom
import { fireEvent, render } from '@/tests/functions'

import { Hero } from './hero'

describe('Hero', () => {
  beforeAll(() => {
    Object.defineProperty(window.HTMLElement.prototype, 'scrollIntoView', {
      writable: true,
      value: vi.fn(),
    })
  })

  it('should render the Hero component', () => {
    const { container } = render(<Hero />)

    expect(container).toBeDefined()
  })

  it('should render the scroll down indicator without about section', () => {
    const { getByTestId } = render(<Hero />)

    const scrollDownIndicator = getByTestId('scroll-down-indicator')

    fireEvent.click(scrollDownIndicator)

    expect(scrollDownIndicator).toBeDefined()
  })

  it('should render the scroll down indicator with about section', () => {
    const { getByTestId } = render(
      <>
        <section id="about">About Section</section>
        <Hero />
      </>,
    )

    const scrollDownIndicator = getByTestId('scroll-down-indicator')

    fireEvent.click(scrollDownIndicator)

    expect(scrollDownIndicator).toBeDefined()
  })
})
