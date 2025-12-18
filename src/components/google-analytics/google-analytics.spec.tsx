import { act } from '@testing-library/react'
import { fireEvent, render } from '@/tests/functions'
import { GoogleAnalytics } from './google-analytics'

describe('GoogleAnalytics', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should not render GA scripts initially', () => {
    const { container } = render(<GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />)
    expect(container.querySelector('script')).toBeNull()
  })

  it('should render GA scripts after user interaction', async () => {
    const { container } = render(<GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />)

    await act(async () => {
      fireEvent.scroll(window)
    })

    expect(container).toBeDefined()
  })

  it('should render GA scripts after timeout', async () => {
    const { container } = render(<GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />)

    await act(async () => {
      vi.advanceTimersByTime(5000)
    })

    expect(container).toBeDefined()
  })
})
