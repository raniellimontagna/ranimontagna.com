import { render, screen } from '@/tests/test-utils'
import { RevealText } from '../reveal-text'

describe('RevealText', () => {
  it('marks text segments for progressive GSAP reveal', () => {
    const { container } = render(<RevealText text="Hello World" delay={0.2} stagger={0.08} />)

    expect(screen.getByText('Hello')).toHaveAttribute('data-gsap-text-segment', 'true')
    expect(screen.getByText('World')).toHaveAttribute('data-gsap-text-segment', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-text', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-delay', '0.2')
    expect(container.firstChild).toHaveAttribute('data-gsap-stagger-delay', '0.08')
  })
})
