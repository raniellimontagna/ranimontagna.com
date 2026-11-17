import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { NatalLayer } from '../natal-layer'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../snow-canvas', () => ({ SnowCanvas: () => null }))
vi.mock('../name-lights', () => ({ NameLights: () => null }))
vi.mock('../footer-countdown', () => ({ FooterCountdown: () => null }))
vi.mock('../hunt', () => ({
  Hunt: ({ onComplete, onReopen }: { onComplete: () => void; onReopen: () => void }) => (
    <>
      <button type="button" onClick={onComplete}>
        complete
      </button>
      <button type="button" onClick={onReopen}>
        reopen
      </button>
    </>
  ),
}))
vi.mock('../snow-globe', () => ({
  SnowGlobe: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
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
  vi.setSystemTime(new Date(2026, 11, 10, 12))
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.mocked(track).mockClear()
})

it('opens the globe when the hunt ends and records it once a year', async () => {
  render(<NatalLayer locale="pt" />)
  await act(async () => {})
  fireEvent.click(screen.getByText('complete'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(track).toHaveBeenCalledWith('season-hunt-complete', { season: 'natal' })

  fireEvent.click(screen.getByText('close'))
  expect(screen.queryByRole('dialog')).toBeNull()

  fireEvent.click(screen.getByText('reopen'))
  fireEvent.click(screen.getByText('complete'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  expect(track).toHaveBeenCalledTimes(1)
})
