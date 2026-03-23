import { forwardRef } from 'react'
import { render, screen } from '@/tests/test-utils'
import { SectionTransition } from '../section-transition'

let mockPrefersReducedMotion = false
const mockUseScroll = vi.fn()
const mockUseTransform = vi.fn()
const mockMotionProps = vi.fn()
const mockScrollYProgress = { current: 'scroll-progress' }

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & { style?: Record<string, unknown> }
    >(({ children, className, style, ...props }, ref) => {
      mockMotionProps({ className, style, ...props })
      return (
        <div ref={ref} className={className} data-testid="motion-section" {...props}>
          {children}
        </div>
      )
    }),
  },
  useReducedMotion: () => mockPrefersReducedMotion,
  useScroll: (options: unknown) => mockUseScroll(options),
  useTransform: (...args: unknown[]) => mockUseTransform(...args),
}))

describe('SectionTransition', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = false
    mockUseScroll.mockReset()
    mockUseTransform.mockReset()
    mockMotionProps.mockClear()
    mockUseScroll.mockReturnValue({ scrollYProgress: mockScrollYProgress })
    mockUseTransform.mockReturnValueOnce('opacity-transform').mockReturnValueOnce('y-transform')
  })

  it('renders a plain container when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    const { container } = render(
      <SectionTransition className="section-shell">
        <div>Reduced Motion</div>
      </SectionTransition>,
    )

    expect(screen.getByText('Reduced Motion')).toBeInTheDocument()
    expect(container.firstChild).toHaveClass('section-shell')
    expect(mockMotionProps).not.toHaveBeenCalled()
  })

  it('binds scroll transforms to the animated wrapper when motion is enabled', () => {
    render(
      <SectionTransition className="animated-section">
        <div>Animated Section</div>
      </SectionTransition>,
    )

    expect(mockUseScroll).toHaveBeenCalledWith({
      target: expect.objectContaining({ current: expect.any(HTMLDivElement) }),
      offset: ['start end', 'end start'],
    })
    expect(mockUseTransform).toHaveBeenNthCalledWith(
      1,
      mockScrollYProgress,
      [0, 0.15, 0.85, 1],
      [0, 1, 1, 0],
    )
    expect(mockUseTransform).toHaveBeenNthCalledWith(
      2,
      mockScrollYProgress,
      [0, 0.15, 0.85, 1],
      [40, 0, 0, -20],
    )
    expect(mockMotionProps).toHaveBeenCalledWith({
      className: 'animated-section',
      style: {
        opacity: 'opacity-transform',
        y: 'y-transform',
        willChange: 'transform, opacity',
      },
    })
  })
})
