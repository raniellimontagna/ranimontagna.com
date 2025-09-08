import { render } from '@/tests/functions'

import { Contact } from './contact'

describe('Contact', () => {
  it('should render the Contact component', () => {
    const { container } = render(<Contact />)

    expect(container).toBeDefined()
  })
})
