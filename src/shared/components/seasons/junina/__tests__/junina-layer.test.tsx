import { fireEvent, render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { JuninaLayer } from '../junina-layer'

vi.mock('../sparks-canvas', () => ({ SparksCanvas: () => <p>sparks</p> }))
vi.mock('../bunting', () => ({ Bunting: () => <p>bunting</p> }))
vi.mock('../footer-countdown', () => ({ FooterCountdown: () => <p>countdown</p> }))
vi.mock('../pescaria-game', () => ({
  PescariaGame: ({ onComplete, edition }: { onComplete: () => void; edition: number }) => (
    <button type="button" onClick={onComplete}>
      fifth fish {edition}
    </button>
  ),
}))
vi.mock('../arraia-card', () => ({
  ArraiaCard: ({ open }: { open: boolean }) => (open ? <div role="dialog" /> : null),
}))

afterEach(() => {
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the sparks, the bunting, the countdown and the game, and the card at the end', () => {
  useSeason.setState({ active: 'junina', current: 'junina', edition: 2027 })
  render(<JuninaLayer locale="pt" />)
  expect(screen.getByText('sparks')).toBeInTheDocument()
  expect(screen.getByText('bunting')).toBeInTheDocument()
  expect(screen.getByText('countdown')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'fifth fish 2027' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
