import { act, render, screen } from '@/tests/test-utils'
import { GoogleAnalytics } from '../google-analytics'

// Mock next/script
vi.mock('next/script', () => ({
  default: ({ src, children, id }: { src?: string; children?: React.ReactNode; id?: string }) => (
    <div data-testid="next-script" data-src={src} id={id}>
      {children}
    </div>
  ),
}))

describe('GoogleAnalytics Component', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('initially does not render scripts', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />)
    expect(screen.queryByTestId('next-script')).not.toBeInTheDocument()
  })

  it('renders scripts after timeout', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    const scripts = screen.getAllByTestId('next-script')
    expect(scripts).toHaveLength(2)
    expect(scripts[0]).toHaveAttribute(
      'data-src',
      'https://www.googletagmanager.com/gtag/js?id=G-TEST',
    )
  })

  it('renders scripts after user interaction (scroll)', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />)
    expect(screen.queryByTestId('next-script')).not.toBeInTheDocument()

    act(() => {
      window.dispatchEvent(new Event('scroll'))
    })

    expect(screen.getAllByTestId('next-script')).toHaveLength(2)
  })

  it('renders scripts after user interaction (click)', () => {
    render(<GoogleAnalytics GA_MEASUREMENT_ID="G-TEST" />)

    act(() => {
      window.dispatchEvent(new Event('click'))
    })

    expect(screen.getAllByTestId('next-script')).toHaveLength(2)
  })
})
