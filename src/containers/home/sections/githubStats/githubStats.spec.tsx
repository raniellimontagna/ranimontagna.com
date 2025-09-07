import { render } from '@/tests/functions'

import { GithubStats } from './githubStats'

describe('GithubStats', () => {
  it('should render the GithubStats component', () => {
    const { container } = render(<GithubStats />)

    expect(container).toBeDefined()
  })
})
