import { render } from '@/tests/functions'
import { GoogleAnalytics } from './google-analytics'

describe('GoogleAnalytics', () => {
  it('should render with GA_MEASUREMENT_ID', () => {
    const { container } = render(<GoogleAnalytics GA_MEASUREMENT_ID="G-XXXXXXXXXX" />)

    expect(container).toBeDefined()
  })
})
