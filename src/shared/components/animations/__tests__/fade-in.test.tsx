import { render, screen } from '@/tests/test-utils'
import { FadeIn } from '../fade-in'

// Mock framer-motion
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
      <div className={className} {...props}>
        {children}
      </div>
    ),
  },
  useInView: () => true,
}))

describe('FadeIn Component', () => {
  it('renders children correctly', () => {
    render(
      <FadeIn>
        <div>Test Content</div>
      </FadeIn>,
    )

    expect(screen.getByText('Test Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <FadeIn className="custom-class">
        <div>Test</div>
      </FadeIn>,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('handles direction="up" (default)', () => {
    render(
      <FadeIn direction="up">
        <div>Up Direction</div>
      </FadeIn>,
    )

    expect(screen.getByText('Up Direction')).toBeInTheDocument()
  })

  it('handles direction="down"', () => {
    render(
      <FadeIn direction="down">
        <div>Down Direction</div>
      </FadeIn>,
    )

    expect(screen.getByText('Down Direction')).toBeInTheDocument()
  })

  it('handles direction="left"', () => {
    render(
      <FadeIn direction="left">
        <div>Left Direction</div>
      </FadeIn>,
    )

    expect(screen.getByText('Left Direction')).toBeInTheDocument()
  })

  it('handles direction="right"', () => {
    render(
      <FadeIn direction="right">
        <div>Right Direction</div>
      </FadeIn>,
    )

    expect(screen.getByText('Right Direction')).toBeInTheDocument()
  })

  it('handles direction="none"', () => {
    render(
      <FadeIn direction="none">
        <div>No Direction</div>
      </FadeIn>,
    )

    expect(screen.getByText('No Direction')).toBeInTheDocument()
  })

  it('accepts custom delay and duration', () => {
    render(
      <FadeIn delay={0.5} duration={1.2}>
        <div>Custom Timing</div>
      </FadeIn>,
    )

    expect(screen.getByText('Custom Timing')).toBeInTheDocument()
  })

  it('accepts custom distance', () => {
    render(
      <FadeIn distance={50}>
        <div>Custom Distance</div>
      </FadeIn>,
    )

    expect(screen.getByText('Custom Distance')).toBeInTheDocument()
  })

  it('accepts triggerOnce prop', () => {
    render(
      <FadeIn triggerOnce={false}>
        <div>Trigger Multiple</div>
      </FadeIn>,
    )

    expect(screen.getByText('Trigger Multiple')).toBeInTheDocument()
  })

  it('forwards additional props to motion.div', () => {
    const { container } = render(
      <FadeIn data-testid="fade-in-test">
        <div>Props Test</div>
      </FadeIn>,
    )

    expect(container.firstChild).toHaveAttribute('data-testid', 'fade-in-test')
  })
})
