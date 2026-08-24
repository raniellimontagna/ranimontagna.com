import { render, screen } from '@/tests/test-utils'
import NotFoundPage from '../not-found'

describe('localized catch-all not-found page', () => {
  it('provides the target required by the locale layout skip link', () => {
    render(<NotFoundPage />)

    expect(screen.getByRole('main')).toHaveAttribute('id', 'main-content')
    expect(document.querySelector('#main-content')).toBe(screen.getByRole('main'))
  })
})
