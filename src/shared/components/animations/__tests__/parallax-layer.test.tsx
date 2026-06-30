import { render, screen } from '@/tests/test-utils'
import { ParallaxLayer } from '../parallax-layer'

vi.mock('motion/react', () => ({
  motion: {
    div: vi.fn(() => null),
  },
  useReducedMotion: vi.fn(),
  useScroll: vi.fn(),
  useTransform: vi.fn(),
}))

describe('ParallaxLayer', () => {
  it('adds relative positioning when the className does not define one', () => {
    const { container } = render(<ParallaxLayer className="z-10">Layer</ParallaxLayer>)

    expect(screen.getByText('Layer')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('relative', 'z-10')
  })

  it('supports horizontal movement and preserves explicit positioned classes', () => {
    const { container } = render(
      <ParallaxLayer className="absolute top-0" axis="x" offset={48}>
        Horizontal Layer
      </ParallaxLayer>,
    )

    expect(screen.getByText('Horizontal Layer')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('absolute', 'top-0')
    expect(container.firstChild).toHaveAttribute('data-gsap-parallax', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-axis', 'x')
    expect(container.firstChild).toHaveAttribute('data-gsap-offset', '48')
  })
})
