import { act, render, screen } from '@testing-library/react'
import { FooterCountdown } from '../footer-countdown'

async function renderAt(date: Date, locale = 'pt') {
  vi.setSystemTime(date)
  render(
    <>
      <footer>
        <p>
          © Ranielli Montagna
          <span data-season-slot="footer" />
        </p>
      </footer>
      <FooterCountdown locale={locale} edition={2027} />
    </>,
  )
  await act(async () => {})
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

it('counts down to Halloween in the footer', async () => {
  await renderAt(new Date(2027, 9, 24, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 7 dias para o Halloween',
  )
})

it('wishes a happy Halloween on the night, in English', async () => {
  await renderAt(new Date(2027, 9, 31, 12), 'en')
  expect(screen.getByText('Happy Halloween')).toBeInTheDocument()
})

it('says goodbye on All Saints Day', async () => {
  await renderAt(new Date(2027, 10, 1, 12))
  expect(screen.getByText('Até o ano que vem. Buu!')).toBeInTheDocument()
})
