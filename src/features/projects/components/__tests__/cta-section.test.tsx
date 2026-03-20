import { forwardRef } from 'react'
import { render, screen } from '@/tests/test-utils'
import { CTASection } from '../cta-section'

let mockPrefersReducedMotion = false
let mockIsInView = false
const mockMotionProps = vi.fn()

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & { style?: Record<string, unknown> }
    >(({ children, className, ...props }, ref) => {
      mockMotionProps({ className, ...props })
      return (
        <div ref={ref} className={className} data-testid="cta-motion" {...props}>
          {children}
        </div>
      )
    }),
  },
  useInView: () => mockIsInView,
  useReducedMotion: () => mockPrefersReducedMotion,
}))

describe('CTASection', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = false
    mockIsInView = false
    mockMotionProps.mockClear()
  })

  it('keeps the CTA hidden until it enters the viewport', () => {
    render(<CTASection />)

    expect(screen.getByText('cta.title')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /cta.button/i })).toHaveAttribute(
      'href',
      'https://github.com/raniellimontagna',
    )
    expect(mockMotionProps).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: { opacity: 0, y: 24, filter: 'blur(12px)' },
        animate: undefined,
        transition: {
          duration: 0.8,
          ease: [0.19, 1, 0.22, 1],
        },
      }),
    )
  })

  it('animates the CTA in when it becomes visible', () => {
    mockIsInView = true

    render(<CTASection />)

    expect(mockMotionProps).toHaveBeenCalledWith(
      expect.objectContaining({
        animate: { opacity: 1, y: 0, filter: 'blur(0px)' },
        transition: {
          duration: 0.8,
          ease: [0.19, 1, 0.22, 1],
        },
      }),
    )
  })

  it('renders the CTA statically when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<CTASection />)

    expect(mockMotionProps).toHaveBeenCalledWith(
      expect.objectContaining({
        initial: { opacity: 1 },
        animate: { opacity: 1 },
        transition: {
          duration: 0,
          ease: [0.19, 1, 0.22, 1],
        },
      }),
    )
  })
})
