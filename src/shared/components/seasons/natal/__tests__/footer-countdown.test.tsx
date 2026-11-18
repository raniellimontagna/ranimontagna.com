import { act, render, screen } from '@testing-library/react'
import { FooterCountdown } from '../footer-countdown'

function Footer() {
  return (
    <footer>
      <p>
        © 2026 Ranielli Montagna
        <span data-season-slot="footer" />
      </p>
    </footer>
  )
}

async function renderOn(month: number, day: number, locale = 'pt') {
  vi.setSystemTime(new Date(2026, month - 1, day, 12))
  render(
    <>
      <Footer />
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

it('counts the days in the footer', async () => {
  await renderOn(12, 16)
  const slot = document.querySelector('[data-season-slot="footer"]')
  expect(slot).toHaveTextContent('Faltam 9 dias para o Natal')
})

it('says one day, then the day itself', async () => {
  await renderOn(12, 24)
  expect(screen.getByText('Falta 1 dia para o Natal')).toBeInTheDocument()
})

it('wishes a merry Christmas on the 25th, in each language', async () => {
  await renderOn(12, 25, 'en')
  expect(screen.getByText('Merry Christmas')).toBeInTheDocument()
})

it('turns the page at midnight while the page stays open', async () => {
  vi.setSystemTime(new Date(2026, 11, 24, 23, 59, 30))
  render(
    <>
      <Footer />
      <FooterCountdown locale="pt" />
    </>,
  )
  await act(async () => {})
  expect(screen.getByText('Falta 1 dia para o Natal')).toBeInTheDocument()
  await act(async () => {
    vi.advanceTimersByTime(31_000)
  })
  expect(screen.getByText('Feliz Natal')).toBeInTheDocument()
})
