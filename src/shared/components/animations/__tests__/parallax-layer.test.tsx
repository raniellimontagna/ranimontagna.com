import { forwardRef } from 'react'
import { render, screen } from '@/tests/test-utils'
import { ParallaxLayer } from '../parallax-layer'

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
        <div ref={ref} className={className} data-testid="parallax-layer" {...props}>
          {children}
        </div>
      )
    }),
  },
  useReducedMotion: () => mockPrefersReducedMotion,
  useScroll: (options: unknown) => mockUseScroll(options),
  useTransform: (...args: unknown[]) => mockUseTransform(...args),
}))

describe('ParallaxLayer', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = false
    mockUseScroll.mockReset()
    mockUseTransform.mockReset()
    mockMotionProps.mockClear()
    mockUseScroll.mockReturnValue({ scrollYProgress: mockScrollYProgress })
    mockUseTransform.mockReturnValue('movement-transform')
  })

  it('adds relative positioning when the className does not define one', () => {
    render(<ParallaxLayer className="z-10">Layer</ParallaxLayer>)

    expect(screen.getByText('Layer')).toBeInTheDocument()
    expect(mockMotionProps).toHaveBeenCalledWith({
      className: 'relative z-10',
      style: {
        y: 'movement-transform',
        willChange: 'transform',
      },
    })
    expect(mockUseTransform).toHaveBeenCalledWith(mockScrollYProgress, [0, 1], [-36, 36])
  })

  it('supports horizontal movement and preserves explicit positioned classes', () => {
    render(
      <ParallaxLayer className="absolute top-0" axis="x" offset={48}>
        Horizontal Layer
      </ParallaxLayer>,
    )

    expect(mockMotionProps).toHaveBeenCalledWith({
      className: 'absolute top-0',
      style: {
        x: 'movement-transform',
        willChange: 'transform',
      },
    })
    expect(mockUseTransform).toHaveBeenCalledWith(mockScrollYProgress, [0, 1], [-48, 48])
  })

  it('disables parallax styles when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<ParallaxLayer>Static Layer</ParallaxLayer>)

    expect(mockMotionProps).toHaveBeenCalledWith({
      className: 'relative',
      style: undefined,
    })
  })
})
