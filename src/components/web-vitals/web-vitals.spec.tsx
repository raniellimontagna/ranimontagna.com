import { render } from '@/tests/functions'
import { WebVitals } from './web-vitals'

describe('WebVitals', () => {
  it('should render null (no visible output)', () => {
    const { container } = render(<WebVitals />)

    expect(container.firstChild).toBeNull()
  })
})
