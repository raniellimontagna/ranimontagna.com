import { render, screen, waitFor } from '@/tests/test-utils'
import { Home } from '../home'

describe('Home Feature', () => {
  it('renders correctly with hero content', async () => {
    render(<Home heroContent={<div data-testid="hero">Hero Content</div>} />)

    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()

    await waitFor(() => {
      expect(screen.getByTestId('about')).toBeInTheDocument()
    })

    await waitFor(() => {
      expect(screen.getByTestId('skills')).toBeInTheDocument()
    })
  })
})
