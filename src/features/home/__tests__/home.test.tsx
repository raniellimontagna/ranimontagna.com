import { render, screen } from '@/tests/test-utils'
import { Home } from '../home'

describe('Home Feature', () => {
  it('server-renders every semantic section before interaction', () => {
    render(<Home heroContent={<div data-testid="hero">Hero Content</div>} />)

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
  it('places the intro between the hero and the current sections', () => {
    render(
      <Home
        heroContent={<div data-testid="hero">Hero Content</div>}
        introContent={<div data-testid="intro">Intro</div>}
      />,
    )

    const hero = screen.getByTestId('hero')
    const intro = screen.getByTestId('intro')
    const about = screen.getByTestId('about')
    expect(hero.compareDocumentPosition(intro) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
    expect(intro.compareDocumentPosition(about) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy()
  })
})
