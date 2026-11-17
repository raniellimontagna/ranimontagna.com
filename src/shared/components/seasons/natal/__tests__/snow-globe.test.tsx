import { act, fireEvent, render, screen } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playJingle, setSeasonSound } from '../season-sound'
import { SnowGlobe } from '../snow-globe'

const stopJingle = vi.fn()
vi.mock('../season-sound', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../season-sound')>()),
  playJingle: vi.fn(() => stopJingle),
}))

const originalMatchMedia = window.matchMedia

function Harness({ onClose = vi.fn() }: { onClose?: () => void }) {
  return (
    <>
      <button type="button">trigger</button>
      <SnowGlobe open locale="pt" onClose={onClose} />
    </>
  )
}

beforeEach(() => {
  mockCanvas2d({ width: 320, height: 380 })
})

afterEach(() => {
  setSeasonSound(false)
  vi.mocked(playJingle).mockClear()
  stopJingle.mockClear()
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'share')
})

it('opens as a dialog with the holiday card and focus inside', () => {
  installFrameStub()
  render(<Harness />)
  const dialog = screen.getByRole('dialog', { name: /boas festas/i })
  expect(dialog).toContainElement(document.activeElement as HTMLElement)
  expect(screen.getByRole('img', { name: /globo de neve/i })).toBeInTheDocument()
})

it('closes on Escape and gives focus back', () => {
  installFrameStub()
  const trigger = document.createElement('button')
  document.body.appendChild(trigger)
  trigger.focus()
  const onClose = vi.fn()
  const { rerender } = render(<SnowGlobe open locale="pt" onClose={onClose} />)
  fireEvent.keyDown(document, { key: 'Escape' })
  expect(onClose).toHaveBeenCalled()
  rerender(<SnowGlobe open={false} locale="pt" onClose={onClose} />)
  expect(trigger).toHaveFocus()
  trigger.remove()
})

it('keeps Tab inside the dialog', () => {
  installFrameStub()
  render(<Harness />)
  const buttons = screen.getByRole('dialog').querySelectorAll('button')
  const last = buttons[buttons.length - 1]
  last.focus()
  fireEvent.keyDown(document, { key: 'Tab' })
  expect(buttons[0]).toHaveFocus()
})

it('shakes the globe into motion', () => {
  mockMatchMedia({})
  const frames = installFrameStub()
  render(<Harness />)
  vi.mocked(window.requestAnimationFrame).mockClear()
  fireEvent.click(screen.getByRole('button', { name: /^sacudir$/i }))
  expect(window.requestAnimationFrame).toHaveBeenCalled()
  act(() => frames.flush(2))
})

it('still shakes, without animation, when motion is reduced', () => {
  installFrameStub()
  render(<Harness />)
  vi.mocked(window.requestAnimationFrame).mockClear()
  fireEvent.click(screen.getByRole('button', { name: /^sacudir$/i }))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('copies the link when the browser cannot share', async () => {
  installFrameStub()
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<Harness />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /compartilhar/i }))
  })
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining(window.location.origin))
  expect(screen.getByText(/link copiado/i)).toBeInTheDocument()
})

it('uses the share sheet when there is one', async () => {
  installFrameStub()
  const share = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'share', { configurable: true, value: share })
  render(<Harness />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: /compartilhar/i }))
  })
  expect(share).toHaveBeenCalledWith(expect.objectContaining({ url: expect.any(String) }))
})

it('has its own Christmas sound switch and jingles when shaken with sound on', () => {
  installFrameStub()
  const { unmount } = render(<Harness />)
  const sound = screen.getByRole('button', { name: /som de natal/i })
  expect(sound).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(screen.getByRole('button', { name: /^sacudir$/i }))
  expect(playJingle).not.toHaveBeenCalled()

  fireEvent.click(sound)
  expect(sound).toHaveAttribute('aria-pressed', 'true')
  fireEvent.click(screen.getByRole('button', { name: /^sacudir$/i }))
  expect(playJingle).toHaveBeenCalled()
  unmount()
  expect(stopJingle).toHaveBeenCalled()
})

it('offers to shake the phone only on touch screens', () => {
  installFrameStub()
  Object.defineProperty(window, 'DeviceMotionEvent', { configurable: true, value: class {} })
  mockMatchMedia({ '(pointer: coarse)': false })
  const { unmount } = render(<Harness />)
  expect(screen.queryByRole('button', { name: /sacudir o celular/i })).toBeNull()
  unmount()

  mockMatchMedia({ '(pointer: coarse)': true })
  render(<Harness />)
  expect(screen.getByRole('button', { name: /sacudir o celular/i })).toBeInTheDocument()
  Reflect.deleteProperty(window, 'DeviceMotionEvent')
})
