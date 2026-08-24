import { render, screen } from '@/tests/test-utils'
import { RevealText } from '../reveal-text'

describe('RevealText', () => {
  it('keeps the accessible text alternative without an invalid aria-label on a generic wrapper', () => {
    const { container } = render(<RevealText text="Accessible text" />)
    const root = container.firstElementChild

    expect(root).not.toHaveAttribute('aria-label')
    expect(root?.querySelector('.sr-only')).toHaveTextContent('Accessible text')
    expect(root?.querySelector('[data-gsap-text-segment="true"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })

  it('marks text segments for progressive GSAP reveal', () => {
    const { container } = render(<RevealText text="Hello World" delay={0.2} stagger={0.08} />)

    expect(screen.getByText('Hello')).toHaveAttribute('data-gsap-text-segment', 'true')
    expect(screen.getByText('World')).toHaveAttribute('data-gsap-text-segment', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-text', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-delay', '0.2')
    expect(container.firstChild).toHaveAttribute('data-gsap-stagger-delay', '0.08')
  })

  it('renders the requested semantic element', () => {
    render(<RevealText as="h2" text="Accessible heading" />)

    expect(screen.getByRole('heading', { level: 2, name: 'Accessible heading' })).toBeInTheDocument()
  })
})
