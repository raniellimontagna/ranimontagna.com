import { expect, test } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import Page from '../app/page'

test('Page', () => {
  render(<Page />)

  waitFor(() => {
    expect(screen.getByText('Ranielli Montagna')).toBeDefined()
  })
})
