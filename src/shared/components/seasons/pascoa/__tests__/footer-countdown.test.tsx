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

it('counts down to Easter in the footer', async () => {
  await renderAt(new Date(2027, 2, 21, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 7 dias para a Páscoa',
  )
})

it('says one day, then wishes a happy Easter, in each language', async () => {
  await renderAt(new Date(2027, 2, 27, 12))
  expect(screen.getByText('Falta 1 dia para a Páscoa')).toBeInTheDocument()
})

it('wishes a happy Easter on the day, in English', async () => {
  await renderAt(new Date(2027, 2, 28, 12), 'en')
  expect(screen.getByText('Happy Easter')).toBeInTheDocument()
})
