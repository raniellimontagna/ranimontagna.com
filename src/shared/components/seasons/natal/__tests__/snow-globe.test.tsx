import { act, fireEvent, render, screen } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playJingle, setSeasonSound } from '../season-sound'
import { SnowGlobe } from '../snow-globe'

const { stopSmoothScroll, startSmoothScroll } = vi.hoisted(() => ({
  stopSmoothScroll: vi.fn(),
  startSmoothScroll: vi.fn(),
}))
vi.mock('@/shared/components/motion', async (importOriginal) => ({
  ...(await importOriginal<typeof import('@/shared/components/motion')>()),
  stopSmoothScroll,
  startSmoothScroll,
}))

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

// Like the browser's dialog focusing steps: open, then focus the first focusable control.
const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
  this.querySelector<HTMLElement>('button')?.focus()
})
const closeDialog = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open')
})
let canvas: ReturnType<typeof mockCanvas2d>

beforeEach(() => {
  canvas = mockCanvas2d({ width: 320, height: 380 })
  // jsdom has no showModal/close; the browser gives inert, focus and Esc for free.
  Object.assign(HTMLDialogElement.prototype, { showModal, close: closeDialog })
  HTMLElement.prototype.setPointerCapture = vi.fn()
})

afterEach(() => {
  showModal.mockClear()
  closeDialog.mockClear()
  stopSmoothScroll.mockClear()
  startSmoothScroll.mockClear()
  vi.useRealTimers()
  setSeasonSound(false)
  vi.mocked(playJingle).mockClear()
  stopJingle.mockClear()
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'share')
})

it('opens as a native modal dialog with the holiday card and focus on Shake', () => {
  installFrameStub()
  render(<Harness />)
  const dialog = screen.getByRole('dialog', { name: /boas festas/i })
  expect(dialog.tagName).toBe('DIALOG')
  expect(showModal).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('button', { name: /^sacudir$/i })).toHaveFocus()
  expect(screen.getByRole('img', { name: /globo de neve/i })).toBeInTheDocument()
})

it('pauses the smooth scroll behind it and resumes it on close', () => {
  installFrameStub()
  const { unmount } = render(<Harness />)
  expect(stopSmoothScroll).toHaveBeenCalled()
  unmount()
  expect(closeDialog).toHaveBeenCalled()
  expect(startSmoothScroll).toHaveBeenCalled()
})

it('closes on the browser close request (Esc or back gesture)', () => {
  installFrameStub()
  const onClose = vi.fn()
  render(<Harness onClose={onClose} />)
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  expect(onClose).toHaveBeenCalled()
  expect(cancel.defaultPrevented).toBe(true)
})

it('lets go of a drag that ends outside the window', () => {
  mockMatchMedia({})
  installFrameStub()
  render(<Harness />)
  const globe = screen.getByRole('img', { name: /globo de neve/i })
  fireEvent.pointerDown(globe, { pointerId: 1, clientX: 10, clientY: 10 })
  expect(globe.setPointerCapture).toHaveBeenCalledWith(1)
  fireEvent.pointerCancel(globe, { pointerId: 1 })
  vi.mocked(window.requestAnimationFrame).mockClear()
  fireEvent.pointerMove(globe, { pointerId: 1, clientX: 200, clientY: 200 })
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('never starts listening to the phone after the globe has closed', async () => {
  installFrameStub()
  mockMatchMedia({ '(pointer: coarse)': true })
  let grant: (value: 'granted') => void = () => {}
  const requestPermission = vi.fn(() => new Promise<'granted'>((resolve) => (grant = resolve)))
  Object.defineProperty(window, 'DeviceMotionEvent', {
    configurable: true,
    value: Object.assign(class {}, { requestPermission }),
  })
  const add = vi.spyOn(window, 'addEventListener')
  const { unmount } = render(<Harness />)
  fireEvent.click(screen.getByRole('button', { name: /sacudir o celular/i }))
  unmount()
  await act(async () => grant('granted'))
  expect(add).not.toHaveBeenCalledWith('devicemotion', expect.any(Function))
  Reflect.deleteProperty(window, 'DeviceMotionEvent')
})

it('redraws at the new size when the window resizes', () => {
  installFrameStub()
  render(<Harness />)
  const globe = screen.getByRole('img', { name: /globo de neve/i }) as HTMLCanvasElement
  canvas.setSize(260, 300)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(globe.width).toBe(260 * Math.min(window.devicePixelRatio || 1, 2))
})

it('wishes for the year that is coming', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2027, 11, 10, 12))
  installFrameStub()
  render(<Harness />)
  expect(screen.getByText(/2028/)).toBeInTheDocument()
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
