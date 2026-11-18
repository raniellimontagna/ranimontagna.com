import { fireEvent, render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { HalloweenLayer } from '../halloween-layer'

vi.mock('../bats-canvas', () => ({ BatsCanvas: () => <p>bats</p> }))
vi.mock('../candle-name', () => ({ CandleName: () => <p>candle</p> }))
vi.mock('../footer-countdown', () => ({ FooterCountdown: () => <p>countdown</p> }))
vi.mock('../bug-hunt', () => ({
  BugHunt: ({ onComplete, edition }: { onComplete: () => void; edition: number }) => (
    <button type="button" onClick={onComplete}>
      fifth bug {edition}
    </button>
  ),
}))
vi.mock('../report-card', () => ({
  ReportCard: ({ open }: { open: boolean }) => (open ? <div role="dialog" /> : null),
}))

afterEach(() => {
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the bats, the candlelit name, the countdown and the hunt, and the report', () => {
  useSeason.setState({ active: 'halloween', current: 'halloween', edition: 2027 })
  render(<HalloweenLayer locale="pt" />)
  expect(screen.getByText('bats')).toBeInTheDocument()
  expect(screen.getByText('candle')).toBeInTheDocument()
  expect(screen.getByText('countdown')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'fifth bug 2027' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
