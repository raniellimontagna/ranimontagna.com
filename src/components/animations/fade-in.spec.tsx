import { render, screen } from '@/tests/functions'
import { FadeIn } from './fade-in'

describe('FadeIn', () => {
  it('should render children', () => {
    render(
      <FadeIn>
        <div data-testid="child">Test content</div>
      </FadeIn>,
    )

    expect(screen.getByTestId('child')).toBeInTheDocument()
    expect(screen.getByText('Test content')).toBeInTheDocument()
  })

  it('should render with direction up (default)', () => {
    const { container } = render(
      <FadeIn direction="up">
        <div>Content</div>
      </FadeIn>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with direction down', () => {
    const { container } = render(
      <FadeIn direction="down">
        <div>Content</div>
      </FadeIn>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with direction left', () => {
    const { container } = render(
      <FadeIn direction="left">
        <div>Content</div>
      </FadeIn>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with direction right', () => {
    const { container } = render(
      <FadeIn direction="right">
        <div>Content</div>
      </FadeIn>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })

  it('should render with direction none', () => {
    const { container } = render(
      <FadeIn direction="none">
        <div>Content</div>
      </FadeIn>,
    )

    expect(container.firstChild).toBeInTheDocument()
  })
})
