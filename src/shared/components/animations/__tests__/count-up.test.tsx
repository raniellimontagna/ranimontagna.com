import { forwardRef } from 'react'
import { act, render, screen } from '@/tests/test-utils'
import { CountUp } from '../count-up'

let mockIsInView = true
let mockPrefersReducedMotion = false
const mockSpringSet = vi.fn()
const mockUseSpring = vi.fn()
const mockUseTransform = vi.fn()

vi.mock('motion/react', () => ({
  motion: {
    span: forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement>>(
      ({ children, className, ...props }, ref) => (
        <span ref={ref} className={className} {...props}>
          {children}
        </span>
      ),
    ),
  },
  useInView: () => mockIsInView,
  useReducedMotion: () => mockPrefersReducedMotion,
  useSpring: (...args: unknown[]) => mockUseSpring(...args),
  useTransform: (...args: unknown[]) => mockUseTransform(...args),
}))

describe('CountUp', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    mockIsInView = true
    mockPrefersReducedMotion = false
    mockSpringSet.mockReset()
    mockUseSpring.mockReset()
    mockUseTransform.mockReset()
    mockUseSpring.mockReturnValue({ set: mockSpringSet })
    mockUseTransform.mockImplementation((_spring: unknown, formatter: (latest: number) => string) =>
      formatter(0),
    )
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps the initial display and does not start counting before entering the viewport', () => {
    mockIsInView = false

    render(<CountUp value={15} suffix="+" />)

    expect(screen.getByText('00+')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(mockSpringSet).not.toHaveBeenCalled()
  })

  it('waits for the configured delay before updating the spring value', () => {
    render(<CountUp value={42} delay={0.2} />)

    expect(mockUseSpring).toHaveBeenCalledWith(0, {
      stiffness: 50,
      damping: 30,
      duration: 1.6,
    })

    act(() => {
      vi.advanceTimersByTime(199)
    })

    expect(mockSpringSet).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1)
    })

    expect(mockSpringSet).toHaveBeenCalledWith(42)
  })

  it('removes animation delay and spring duration when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<CountUp value={7} delay={0.4} duration={2} />)

    expect(mockUseSpring).toHaveBeenCalledWith(0, {
      stiffness: 50,
      damping: 30,
      duration: 0,
    })

    act(() => {
      vi.runAllTimers()
    })

    expect(mockSpringSet).toHaveBeenCalledWith(7)
  })
})
