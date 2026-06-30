import { render, screen } from '@/tests/test-utils'
import { MagneticHover } from '../magnetic-hover'

vi.mock('motion/react', () => ({
  motion: {
    div: vi.fn(() => null),
  },
  useMotionValue: vi.fn(),
  useReducedMotion: vi.fn(),
  useSpring: vi.fn(),
}))

describe('MagneticHover', () => {
  it('renders children inside a static wrapper', () => {
    const { container } = render(
      <MagneticHover className="magnetic-shell" strength={20}>
        Magnetic
      </MagneticHover>,
    )

    expect(screen.getByText('Magnetic')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('magnetic-shell')
    expect(container.firstChild).toHaveAttribute('data-gsap-magnetic', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-strength', '20')
  })
})
