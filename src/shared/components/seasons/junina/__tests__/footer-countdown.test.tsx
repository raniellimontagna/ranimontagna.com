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
      <FooterCountdown locale={locale} />
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

it('counts down to São João in the footer', async () => {
  await renderAt(new Date(2027, 5, 10, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 14 dias para o São João',
  )
})

it('cheers on the day, in Spanish too', async () => {
  await renderAt(new Date(2027, 5, 24, 12), 'es')
  expect(screen.getByText('¡Viva San Juan!')).toBeInTheDocument()
})

it('keeps the arraiá going to the end of the month', async () => {
  await renderAt(new Date(2027, 5, 27, 12))
  expect(screen.getByText('Arraiá até o fim do mês')).toBeInTheDocument()
})
