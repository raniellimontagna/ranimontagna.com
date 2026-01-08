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
    render(
      <StaggerContainer staggerDelay={0.2}>
        <div>Delayed Stagger</div>
      </StaggerContainer>,
    )

    expect(screen.getByText('Delayed Stagger')).toBeInTheDocument()
  })

  it('accepts triggerOnce prop', () => {
    render(
      <StaggerContainer triggerOnce={false}>
        <div>Multiple Triggers</div>
      </StaggerContainer>,
    )

    expect(screen.getByText('Multiple Triggers')).toBeInTheDocument()
  })

  it('forwards additional props to motion.div', () => {
    const { container } = render(
      <StaggerContainer data-testid="stagger-test">
        <div>Props Test</div>
      </StaggerContainer>,
    )

    expect(container.firstChild).toHaveAttribute('data-testid', 'stagger-test')
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
