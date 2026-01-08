import { fireEvent, render, screen } from '@/tests/test-utils'
import { InfiniteMarquee } from '../infinite-marquee'

describe('InfiniteMarquee', () => {
  it('renders children twice for infinite effect', () => {
    // We pass a text content, it should appear twice
    render(
      <InfiniteMarquee>
        <span>Item</span>
      </InfiniteMarquee>,
    )

    // Should be 2 elements with text "Item"
    const items = screen.getAllByText('Item')
    expect(items).toHaveLength(2)
  })

  it('applies correct animation duration based on speed', () => {
    const { container } = render(
      <InfiniteMarquee speed="fast">
        <span>Item</span>
      </InfiniteMarquee>,
    )

    // Found div with animation style
    // The div with style is the inner wrapper
    const innerWrapper = container.querySelector('div[style*="animation"]')
    expect(innerWrapper).toHaveStyle({
      // 20s for fast
      animation: 'marquee-scroll 20s linear infinite',
    })
  })

  it('pauses on hover', () => {
    const { container } = render(
      <InfiniteMarquee pauseOnHover={true}>
        <span>Item</span>
      </InfiniteMarquee>,
    )

    const outerWrapper = container.querySelector('div[role="presentation"]')
    const innerWrapper = container.querySelector('div[style*="animation"]')

    if (!outerWrapper) throw new Error('Outer wrapper not found')
    if (!innerWrapper) throw new Error('Inner wrapper not found')

    fireEvent.mouseEnter(outerWrapper)
    expect(innerWrapper).toHaveStyle({
      animationPlayState: 'paused',
    })

    fireEvent.mouseLeave(outerWrapper)
    expect(innerWrapper).toHaveStyle({
      animationPlayState: 'running',
    })
  })

  it('respects direction prop', () => {
    const { container } = render(
      <InfiniteMarquee direction="right">
        <span>Item</span>
      </InfiniteMarquee>,
    )

    const innerWrapper = container.querySelector('div[style*="animation"]')
    expect(innerWrapper).toHaveStyle({
      animationDirection: 'reverse',
    })
  })
})
