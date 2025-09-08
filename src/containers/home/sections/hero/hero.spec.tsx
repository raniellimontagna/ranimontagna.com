import { fireEvent, render } from '@/tests/functions'

import { Hero } from './hero'

window.HTMLElement.prototype.scrollIntoView = vi.fn()

describe('Hero', () => {
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
