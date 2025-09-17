import { render } from '@/tests/functions'

import { Services } from './services'

describe('Services', () => {
  it('should render the Services component', () => {
    const { container } = render(<Services />)

    expect(container).toBeDefined()
  })
})
