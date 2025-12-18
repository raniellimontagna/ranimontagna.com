import { render, screen } from '@/tests/functions'
import { StaggerContainer, StaggerItem } from './stagger-container'

describe('StaggerContainer', () => {
  it('should render children', () => {
    render(
      <StaggerContainer>
        <div data-testid="child">Child content</div>
      </StaggerContainer>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    const { container } = render(
      <StaggerContainer className="custom-class">
        <div>Content</div>
      </StaggerContainer>,
    )

    expect(container.firstChild).toHaveClass('custom-class')
  })

  it('should render with custom staggerDelay', () => {
    const { container } = render(
      <StaggerContainer staggerDelay={0.2}>
        <div>Content</div>
      </StaggerContainer>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})

describe('StaggerItem', () => {
  it('should render children', () => {
    render(
      <StaggerItem>
        <span data-testid="item">Item content</span>
      </StaggerItem>,
    )

    expect(screen.getByTestId('item')).toBeInTheDocument()
  })

  it('should render with custom className', () => {
    const { container } = render(
      <StaggerItem className="item-class">
        <div>Content</div>
      </StaggerItem>,
    )

    expect(container.firstChild).toHaveClass('item-class')
  })
})
