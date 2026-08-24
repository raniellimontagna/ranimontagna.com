import { render, screen } from '@/tests/test-utils'
import { Home } from '../home'

describe('Home Feature', () => {
  it('server-renders every semantic section before interaction', () => {
    render(
      <Home
        headerContent={<div data-testid="home-header">Header</div>}
        heroContent={<div data-testid="hero">Hero Content</div>}
      />,
    )

    expect(screen.getByTestId('home-header')).toBeInTheDocument()
    expect(screen.getByTestId('hero')).toBeInTheDocument()
    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(screen.getByTestId('about')).toBeInTheDocument()
    expect(screen.getByTestId('skills')).toBeInTheDocument()
    expect(document.querySelector('#experience')).toBeInTheDocument()
    expect(document.querySelector('#projects')).toBeInTheDocument()
    expect(document.querySelector('#services')).toBeInTheDocument()
    expect(document.querySelector('#contact')).toBeInTheDocument()
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()

    for (const sectionId of ['about', 'experience', 'projects', 'services', 'contact']) {
      expect(document.querySelector(`#${sectionId} h2`)).toBeInTheDocument()
    }
  })
})
