import { act, render, screen } from '@testing-library/react'
import { FooterCountdown } from '../footer-countdown'

async function renderAt(date: Date, locale = 'pt', edition = 2027) {
  vi.setSystemTime(date)
  render(
    <>
      <footer>
        <p>
          © Ranielli Montagna
          <span data-season-slot="footer" />
        </p>
      </footer>
      <FooterCountdown locale={locale} edition={edition} />
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

it('counts down to day 256 in the footer', async () => {
  await renderAt(new Date(2027, 8, 9, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 4 dias para o dia 256',
  )
})

it('says one day on the eve, in English', async () => {
  await renderAt(new Date(2027, 8, 12, 12), 'en')
  expect(screen.getByText('1 day to day 256')).toBeInTheDocument()
})

it('celebrates on the day, in Spanish, on 12 September in a leap year', async () => {
  await renderAt(new Date(2028, 8, 12, 12), 'es', 2028)
  expect(screen.getByText('¡Feliz Día del Programador!')).toBeInTheDocument()
})

it('returns 0 the day after', async () => {
  await renderAt(new Date(2027, 8, 14, 12))
  expect(screen.getByText('return 0;')).toBeInTheDocument()
})
