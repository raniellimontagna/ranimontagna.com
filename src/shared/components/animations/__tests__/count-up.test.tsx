import { render, screen } from '@/tests/test-utils'
import { CountUp } from '../count-up'

vi.mock('motion/react', () => ({
  motion: {
    span: vi.fn(() => null),
  },
  useInView: vi.fn(),
  useReducedMotion: vi.fn(),
  useSpring: vi.fn(),
  useTransform: vi.fn(),
}))

describe('CountUp', () => {
  it('renders the final value immediately', () => {
    const { container } = render(<CountUp value={15} suffix="+" className="stat-value" />)

    expect(screen.getByText('15+')).toHaveClass('stat-value')
    expect(container.firstChild).toHaveAttribute('data-gsap-count', 'true')
    expect(container.firstChild).toHaveAttribute('data-gsap-count-value', '15')
    expect(container.firstChild).toHaveAttribute('data-gsap-count-suffix', '+')
  })
})
