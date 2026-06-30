import { render, screen } from '@/tests/test-utils'
import { Home } from '../home'

describe('Home Feature', () => {
  it('renders correctly with hero content', async () => {
    render(
      <Home
        headerContent={<div data-testid="home-header">Header</div>}
        heroContent={<div data-testid="hero">Hero Content</div>}
      />,
    )

    expect(screen.getByTestId('home-header')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByRole('main')).toBeInTheDocument()
    expect(screen.queryByTestId('about')).not.toBeInTheDocument()
  })
})
