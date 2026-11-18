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

it('counts down in the footer', async () => {
  await renderAt(new Date(2027, 0, 30, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 7 dias para o Carnaval',
  )
})

it('says one day, the days themselves and Ash Wednesday', async () => {
  await renderAt(new Date(2027, 1, 5, 12))
  expect(screen.getByText('Falta 1 dia para o Carnaval')).toBeInTheDocument()
})

it('celebrates during Carnival, in each language', async () => {
  await renderAt(new Date(2027, 1, 8, 12), 'en')
  expect(screen.getByText("It's Carnival!")).toBeInTheDocument()
})

it('goes back to work on Ash Wednesday', async () => {
  await renderAt(new Date(2027, 1, 10, 12))
  expect(screen.getByText('Quarta-feira de Cinzas: de volta ao código')).toBeInTheDocument()
})
