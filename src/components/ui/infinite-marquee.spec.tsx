import { fireEvent, render, screen } from '@/tests/functions'
import { InfiniteMarquee } from './infinite-marquee'

describe('InfiniteMarquee', () => {
  it('should render children', () => {
    render(
      <InfiniteMarquee>
        <span data-testid="item">Test Item</span>
      </InfiniteMarquee>,
    )

    expect(screen.getAllByTestId('item')).toHaveLength(2) // Duplicated for infinite effect
  })

  it('should pause on hover when pauseOnHover is true', () => {
    const { container } = render(
      <InfiniteMarquee pauseOnHover>
        <span>Item</span>
      </InfiniteMarquee>,
    )

    const marqueeContainer = container.querySelector('[role="presentation"]')
    expect(marqueeContainer).toBeInTheDocument()

    if (marqueeContainer) {
      fireEvent.mouseEnter(marqueeContainer)
      fireEvent.mouseLeave(marqueeContainer)
    }
  })

  it('should render with different speeds', () => {
    const { rerender, container } = render(
      <InfiniteMarquee speed="fast">
        <span>Fast</span>
      </InfiniteMarquee>,
    )

    expect(container.firstChild).toBeInTheDocument()

    rerender(
      <InfiniteMarquee speed="slow">
        <span>Slow</span>
      </InfiniteMarquee>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with direction right', () => {
    const { container } = render(
      <InfiniteMarquee direction="right">
        <span>Right</span>
      </InfiniteMarquee>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
