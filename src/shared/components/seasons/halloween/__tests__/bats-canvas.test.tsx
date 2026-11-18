import { act, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { batsBus } from '../bats-bus'
import { BatsCanvas } from '../bats-canvas'

const originalMatchMedia = window.matchMedia

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

function setup(reduced = false) {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': reduced })
  const canvas = mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  const view = render(<BatsCanvas />)
  return { ...canvas, frames, view }
}

it('is decoration only and quiet until a flight comes', () => {
  const { view } = setup()
  const canvas = view.container.querySelector('canvas')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  act(() => vi.advanceTimersByTime(25_001))
  expect(window.requestAnimationFrame).toHaveBeenCalled()
})

it('sends a bat out of the name on request, and stops when the sky is empty', () => {
  let clock = 0
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 16))
  const { ctx, frames } = setup()
  act(() => batsBus.flyFrom(200, 300))
  act(() => frames.flush(2))
  expect(ctx.fill).toHaveBeenCalled()
  act(() => frames.flush(800))
  vi.mocked(window.requestAnimationFrame).mockClear()
  act(() => frames.flush(1))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('never flies with reduced motion', () => {
  setup(true)
  act(() => vi.advanceTimersByTime(60_000))
  act(() => batsBus.flyFrom(200, 300))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('waits while the tab is hidden', () => {
  setup()
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => vi.advanceTimersByTime(60_000))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})
