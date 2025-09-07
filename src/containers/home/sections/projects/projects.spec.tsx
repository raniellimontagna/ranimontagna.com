import { render } from '@/tests/functions'

import { Projects } from './projects'

describe('Projects', () => {
  it('should render the Projects component', () => {
    const { container } = render(<Projects />)

    expect(container).toBeDefined()
  })
})
