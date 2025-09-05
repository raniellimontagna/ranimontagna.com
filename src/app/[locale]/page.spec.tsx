import { expect, test } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { NextIntlClientProvider } from 'next-intl'

import Page from './page'
import pt from '../../../messages/pt.json'

test('Page', () => {
  render(<Page />, {
    wrapper: ({ children }) => (
      <NextIntlClientProvider locale="pt-BR" messages={pt}>
        {children}
      </NextIntlClientProvider>
    ),
  })

  waitFor(() => {
    expect(screen.getByText('Ranielli Montagna')).toBeDefined()
  })
})
