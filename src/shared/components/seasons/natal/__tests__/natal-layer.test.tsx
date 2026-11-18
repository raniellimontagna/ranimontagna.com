import { act, fireEvent, render, screen } from '@testing-library/react'
import { NatalLayer } from '../natal-layer'

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
})

it('opens the globe when the hunt ends, and again on request', async () => {
  render(<NatalLayer locale="pt" />)
  await act(async () => {})
  fireEvent.click(screen.getByText('complete'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()

  fireEvent.click(screen.getByText('close'))
  expect(screen.queryByRole('dialog')).toBeNull()

  fireEvent.click(screen.getByText('reopen'))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
})
