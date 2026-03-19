import { render } from '@/tests/test-utils'
import { ReadingProgressBar } from '../reading-progress-bar'

// Mock motion/react
vi.mock('motion/react', () => ({
  motion: {
    div: ({ children, className, style, ...props }: Record<string, unknown>) => (
      <div className={className as string} style={style as Record<string, unknown>} {...props}>
        {children as React.ReactNode}
      </div>
    ),
  },
  useScroll: () => ({ scrollYProgress: { get: () => 0 } }),
  useSpring: (value: unknown) => value,
  useReducedMotion: () => false,
}))

describe('ReadingProgressBar Component', () => {
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
})
