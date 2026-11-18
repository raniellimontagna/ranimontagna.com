import { act, render, screen } from '@testing-library/react'
import { FooterCountdown } from '../footer-countdown'

function Page({ locale = 'pt' }: { locale?: string }) {
  return (
    <>
      <footer>
        <p>
          © Ranielli Montagna
          <span data-season-slot="footer" />
        </p>
      </footer>
      <FooterCountdown locale={locale} edition={2026} />
    </>
  )
}

async function renderAt(date: Date, locale?: string) {
  vi.setSystemTime(date)
  render(<Page locale={locale} />)
  await act(async () => {})
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

it('counts the days to the new year in the footer', async () => {
  await renderAt(new Date(2026, 11, 28, 12))
  expect(document.querySelector('[data-season-slot="footer"]')).toHaveTextContent(
    'Faltam 4 dias para 2027',
  )
})

it('counts hours and minutes on the 31st, minute by minute, then wishes a happy new year', async () => {
  await renderAt(new Date(2026, 11, 31, 23, 58, 30))
  expect(screen.getByText('Faltam 2 min para 2027')).toBeInTheDocument()
  await act(async () => {
    vi.advanceTimersByTime(30_000)
  })
  expect(screen.getByText('Faltam 1 min para 2027')).toBeInTheDocument()
  await act(async () => {
    vi.advanceTimersByTime(60_000)
  })
  expect(screen.getByText('Feliz 2027')).toBeInTheDocument()
})

it('speaks each language, with hours when there are some', async () => {
  await renderAt(new Date(2026, 11, 31, 19, 48), 'en')
  expect(screen.getByText('4 h 12 min to 2027')).toBeInTheDocument()
})
