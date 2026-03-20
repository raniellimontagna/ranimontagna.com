import { forwardRef } from 'react'
import { fireEvent, render, screen } from '@/tests/test-utils'
import { MagneticHover } from '../magnetic-hover'

let mockPrefersReducedMotion = false
let motionValueCallIndex = 0
const mockXSet = vi.fn()
const mockYSet = vi.fn()
const mockMotionProps = vi.fn()

vi.mock('motion/react', () => ({
  motion: {
    div: forwardRef<
      HTMLDivElement,
      React.HTMLAttributes<HTMLDivElement> & { style?: Record<string, unknown> }
    >(({ children, className, style, ...props }, ref) => {
      mockMotionProps({ className, style, ...props })
      return (
        <div ref={ref} className={className} data-testid="magnetic-hover" {...props}>
          {children}
        </div>
      )
    }),
  },
  useReducedMotion: () => mockPrefersReducedMotion,
  useMotionValue: () => {
    const value = motionValueCallIndex === 0 ? { set: mockXSet } : { set: mockYSet }
    motionValueCallIndex += 1
    return value
  },
  useSpring: (value: unknown) => value,
}))

describe('MagneticHover', () => {
  beforeEach(() => {
    mockPrefersReducedMotion = false
    motionValueCallIndex = 0
    mockXSet.mockReset()
    mockYSet.mockReset()
    mockMotionProps.mockClear()
  })

  it('applies animated transform style when motion is enabled', () => {
    render(<MagneticHover className="magnetic-shell">Magnetic</MagneticHover>)

    expect(mockMotionProps).toHaveBeenCalledWith(
      expect.objectContaining({
        className: 'magnetic-shell',
        style: {
          x: { set: mockXSet },
          y: { set: mockYSet },
          willChange: 'transform',
        },
      }),
    )
  })

  it('updates both motion values based on pointer position and resets on leave', () => {
    render(
      <MagneticHover strength={20}>
        <span>Hover Target</span>
      </MagneticHover>,
    )

    const wrapper = screen.getByTestId('magnetic-hover')
    vi.spyOn(wrapper, 'getBoundingClientRect').mockReturnValue({
      width: 100,
      height: 100,
      top: 0,
      left: 0,
      bottom: 100,
      right: 100,
      x: 0,
      y: 0,
      toJSON: () => ({}),
    })

    fireEvent.mouseMove(wrapper, { clientX: 100, clientY: 0 })

    expect(mockXSet).toHaveBeenCalledWith(10)
    expect(mockYSet).toHaveBeenCalledWith(-10)

    fireEvent.mouseLeave(wrapper)

    expect(mockXSet).toHaveBeenLastCalledWith(0)
    expect(mockYSet).toHaveBeenLastCalledWith(0)
  })

  it('skips magnetic movement when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<MagneticHover>Reduced Motion</MagneticHover>)

    const wrapper = screen.getByTestId('magnetic-hover')
    fireEvent.mouseMove(wrapper, { clientX: 100, clientY: 100 })

    expect(mockMotionProps).toHaveBeenCalledWith(
      expect.objectContaining({
        className: undefined,
        style: undefined,
      }),
    )
    expect(mockXSet).not.toHaveBeenCalled()
    expect(mockYSet).not.toHaveBeenCalled()
  })
})
