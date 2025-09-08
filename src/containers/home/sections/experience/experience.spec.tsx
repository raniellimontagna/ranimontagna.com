import { render } from '@/tests/functions'

import { Experience } from './experience'

describe('Experience', () => {
  it('should render the Experience component', () => {
    const { container } = render(<Experience />)

    expect(container).toBeDefined()
  })
})
