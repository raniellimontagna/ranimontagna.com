import { act, fireEvent, render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { ReveillonLayer } from '../reveillon-layer'

vi.mock('../fireworks-canvas', () => ({ FireworksCanvas: () => <canvas data-testid="sky" /> }))
vi.mock('../footer-countdown', () => ({
  FooterCountdown: ({ edition }: { edition: number }) => <p>countdown {edition}</p>,
}))
vi.mock('../year-counter', () => ({
  YearCounter: ({ turned }: { turned: boolean }) => <p>{turned ? 'turned' : 'waiting'}</p>,
}))
vi.mock('../virada', () => ({
  Virada: ({ onTurn }: { onTurn: () => void }) => (
    <button type="button" onClick={onTurn}>
      midnight
    </button>
  ),
}))
vi.mock('../waves-game', () => ({
  WavesGame: ({ onComplete, onReopen }: { onComplete: () => void; onReopen: () => void }) => (
    <>
      <button type="button" onClick={onComplete}>
        seventh wave
      </button>
      <button type="button" onClick={onReopen}>
        again
      </button>
    </>
  ),
}))
vi.mock('../wishes-card', () => ({
  WishesCard: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={onClose}>
          close
        </button>
      </div>
    ) : null,
}))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
})

afterEach(() => {
  vi.useRealTimers()
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the sky, the countdown and the year for the season edition', () => {
  vi.setSystemTime(new Date(2026, 11, 28, 12))
  useSeason.setState({ active: 'reveillon', current: 'reveillon', edition: 2026 })
  render(<ReveillonLayer locale="pt" />)
  expect(screen.getByTestId('sky')).toBeInTheDocument()
  expect(screen.getByText('countdown 2026')).toBeInTheDocument()
  expect(screen.getByText('waiting')).toBeInTheDocument()

  act(() => fireEvent.click(screen.getByRole('button', { name: 'midnight' })))
  expect(screen.getByText('turned')).toBeInTheDocument()
})

it('starts already turned on New Year days', () => {
  vi.setSystemTime(new Date(2027, 0, 3, 12))
  useSeason.setState({ active: 'reveillon', current: 'reveillon', edition: 2026 })
  render(<ReveillonLayer locale="pt" />)
  expect(screen.getByText('turned')).toBeInTheDocument()
})

it('opens the card at the seventh wave and again on request', () => {
  vi.setSystemTime(new Date(2026, 11, 28, 12))
  useSeason.setState({ active: 'reveillon', current: 'reveillon', edition: null })
  render(<ReveillonLayer locale="pt" />)
  fireEvent.click(screen.getByRole('button', { name: 'seventh wave' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'again' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
