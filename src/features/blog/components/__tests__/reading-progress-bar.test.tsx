import { render } from '@/tests/test-utils'
import { ReadingProgressBar } from '../reading-progress-bar'

let mockScrollProgress = 0.4
let mockPrefersReducedMotion = false
const mockMotionDiv = vi.fn(
  ({
    children,
    className,
    style,
    ...props
  }: Record<string, unknown> & { children?: React.ReactNode }) => (
    <div className={className as string} data-has-style={style ? 'yes' : 'no'} {...props}>
      {children}
    </div>
  ),
)

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: (props: Record<string, unknown>) => mockMotionDiv(props),
  },
  useScroll: () => ({ scrollYProgress: { get: () => mockScrollProgress } }),
  useSpring: (value: unknown) => value,
  useReducedMotion: () => mockPrefersReducedMotion,
}))

describe('ReadingProgressBar Component', () => {
  beforeEach(() => {
    mockScrollProgress = 0.4
    mockPrefersReducedMotion = false
    mockMotionDiv.mockClear()
  })

  it('renders the progress bar container', () => {
    render(<ReadingProgressBar />)
    const container = document.querySelector('.z-60')
    expect(container).toBeInTheDocument()
  })

  it('renders the progress indicator', () => {
    render(<ReadingProgressBar />)
    const bar = document.querySelector('.bg-linear-to-r')
    expect(bar).toBeInTheDocument()
  })

  it('does not render when progress is at the start', () => {
    mockScrollProgress = 0
    const { container } = render(<ReadingProgressBar />)
    expect(container.firstChild).toBeNull()
  })

  it('disables animated scaling when reduced motion is enabled', () => {
    mockPrefersReducedMotion = true

    render(<ReadingProgressBar />)

    expect(mockMotionDiv).toHaveBeenCalledTimes(1)
    expect(mockMotionDiv.mock.calls[0]?.[0]).toMatchObject({
      style: undefined,
    })
  })
})
