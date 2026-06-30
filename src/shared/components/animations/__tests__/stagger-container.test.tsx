import { render, screen } from '@/tests/test-utils'
import { StaggerContainer, StaggerItem } from '../stagger-container'

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
  useReducedMotion: () => false,
}))

describe('StaggerContainer Component', () => {
  it('renders children correctly', () => {
    render(
      <StaggerContainer>
        <div>Child 1</div>
        <div>Child 2</div>
      </StaggerContainer>,
    )

    expect(screen.getByText('Child 1')).toBeInTheDocument()
    expect(screen.getByText('Child 2')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StaggerContainer className="custom-stagger">
        <div>Test</div>
      </StaggerContainer>,
    )

    expect(container.firstChild).toHaveClass('custom-stagger')
  })

  it('accepts custom staggerDelay', () => {
    const { container } = render(
      <StaggerContainer staggerDelay={0.2}>
        <div>Delayed Stagger</div>
      </StaggerContainer>,
    )

    expect(screen.getByText('Delayed Stagger')).toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('data-gsap-stagger', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-stagger-delay', '0.2')
  })

  it('accepts triggerOnce prop', () => {
    const { container } = render(
      <StaggerContainer triggerOnce={false}>
        <div>Multiple Triggers</div>
      </StaggerContainer>,
    )

    expect(screen.getByText('Multiple Triggers')).toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('data-gsap-once', 'false')
  })

  it('forwards additional props to motion.div', () => {
    const { container } = render(
      <StaggerContainer data-testid="stagger-test">
        <div>Props Test</div>
      </StaggerContainer>,
    )

    expect(container.firstChild).toHaveAttribute('data-testid', 'stagger-test')
  })

  it('marks items for staggered progressive animation', () => {
    const { container } = render(
      <StaggerItem className="custom-item">
        <div>Marked Item</div>
      </StaggerItem>,
    )

    expect(screen.getByText('Marked Item')).toBeInTheDocument()
    expect(container.firstChild).toHaveAttribute('data-gsap-stagger-item', 'true')
  })
})

describe('StaggerItem Component', () => {
  it('renders children correctly', () => {
    render(
      <StaggerItem>
        <div>Item Content</div>
      </StaggerItem>,
    )

    expect(screen.getByText('Item Content')).toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <StaggerItem className="custom-item">
        <div>Test</div>
      </StaggerItem>,
    )

    expect(container.firstChild).toHaveClass('custom-item')
  })

  it('forwards additional props to motion.div', () => {
    const { container } = render(
      <StaggerItem data-testid="item-test">
        <div>Props Test</div>
      </StaggerItem>,
    )

    expect(container.firstChild).toHaveAttribute('data-testid', 'item-test')
  })
})
