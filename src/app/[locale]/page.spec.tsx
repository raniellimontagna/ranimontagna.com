import { render, screen, waitFor } from '@/tests/functions'

import Page from './page'

test('Page', () => {
  render(<Page />)

  waitFor(() => {
    expect(screen.getByText('Ranielli Montagna')).toBeDefined()
  })
})
