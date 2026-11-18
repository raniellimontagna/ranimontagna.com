import { render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { CarnavalLayer } from '../carnaval-layer'

vi.mock('../confetti-canvas', () => ({ ConfettiCanvas: () => <canvas data-testid="confetti" /> }))
vi.mock('../name-rhythm', () => ({ NameRhythm: () => <p>rhythm</p> }))
vi.mock('../footer-countdown', () => ({
  FooterCountdown: ({ edition }: { edition: number }) => <p>countdown {edition}</p>,
}))
vi.mock('../bloco-game', () => ({
  BlocoGame: ({ edition, locale }: { edition: number; locale: string }) => (
    <p>
      bloco {edition} {locale}
    </p>
  ),
}))

afterEach(() => {
  vi.useRealTimers()
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the confetti, the dance, the countdown and the game for the edition', () => {
  useSeason.setState({ active: 'carnaval', current: 'carnaval', edition: 2027 })
  render(<CarnavalLayer locale="es" />)
  expect(screen.getByTestId('confetti')).toBeInTheDocument()
  expect(screen.getByText('rhythm')).toBeInTheDocument()
  expect(screen.getByText('countdown 2027')).toBeInTheDocument()
  expect(screen.getByText('bloco 2027 es')).toBeInTheDocument()
})

it('works out the edition when the store has none yet', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 10, 18, 12))
  render(<CarnavalLayer locale="pt" />)
  expect(screen.getByText('countdown 2027')).toBeInTheDocument()
})
