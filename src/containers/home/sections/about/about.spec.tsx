import { render } from '@/tests/functions'

import { About } from './about'

describe('About', () => {
  it('should render the About component', () => {
    const { container } = render(<About />)

    expect(container).toBeDefined()
  })
})
