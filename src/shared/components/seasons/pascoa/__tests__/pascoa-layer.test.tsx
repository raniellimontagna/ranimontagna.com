import { fireEvent, render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { PascoaLayer } from '../pascoa-layer'

vi.mock('../bunny', () => ({ Bunny: () => <p>bunny</p> }))
vi.mock('../egg-paint', () => ({ EggPaint: () => <p>paint</p> }))
vi.mock('../footer-countdown', () => ({
  FooterCountdown: ({ edition }: { edition: number }) => <p>countdown {edition}</p>,
}))
vi.mock('../egg-hunt', () => ({
  EggHunt: ({ onComplete, onReopen }: { onComplete: () => void; onReopen: () => void }) => (
    <>
      <button type="button" onClick={onComplete}>
        fifth egg
      </button>
      <button type="button" onClick={onReopen}>
        again
      </button>
    </>
  ),
}))
vi.mock('../easter-card', () => ({
  EasterCard: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={onClose}>
          close
        </button>
      </div>
    ) : null,
}))

afterEach(() => {
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the bunny, the paint, the countdown and the hunt, and the egg at the end', () => {
  useSeason.setState({ active: 'pascoa', current: 'pascoa', edition: 2027 })
  render(<PascoaLayer locale="pt" />)
  expect(screen.getByText('bunny')).toBeInTheDocument()
  expect(screen.getByText('paint')).toBeInTheDocument()
  expect(screen.getByText('countdown 2027')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'fifth egg' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'again' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
