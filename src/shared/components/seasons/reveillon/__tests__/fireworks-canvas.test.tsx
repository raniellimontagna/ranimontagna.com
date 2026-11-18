import { act, fireEvent, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { fireworksBus } from '../fireworks-bus'
import { FireworksCanvas } from '../fireworks-canvas'
import { playPop } from '../reveillon-sound'

vi.mock('../reveillon-sound', () => ({ playPop: vi.fn(() => () => {}) }))

const originalMatchMedia = window.matchMedia

function setup({ reduced = false } = {}) {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': reduced })
  const canvas = mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  render(
    <>
      <section>
        <p data-testid="text">Texto</p>
        <a href="/blog" data-testid="link">
          Blog
        </a>
      </section>
      <FireworksCanvas />
    </>,
  )
  return { ...canvas, frames }
}

beforeEach(() => {
  vi.useFakeTimers({
    toFake: ['setTimeout', 'clearTimeout', 'setInterval', 'clearInterval', 'performance'],
  })
})

afterEach(() => {
  vi.useRealTimers()
  window.matchMedia = originalMatchMedia
  vi.mocked(playPop).mockClear()
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

it('is decoration only', () => {
  setup()
  const canvas = document.querySelector('[data-fireworks]')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
})

it('launches a rocket where the visitor clicks empty space, never on a link', () => {
  const { frames } = setup()
  fireEvent.click(document.querySelector('[data-testid="link"]') as Element, {
    clientX: 10,
    clientY: 10,
  })
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()

  fireEvent.click(document.querySelector('[data-testid="text"]') as Element, {
    clientX: 400,
    clientY: 300,
  })
  expect(window.requestAnimationFrame).toHaveBeenCalled()
  // The rocket flies, bursts with a pop and the sky goes quiet again.
  act(() => frames.flush(90))
  expect(playPop).toHaveBeenCalledTimes(1)
  act(() => frames.flush(200))
  vi.mocked(window.requestAnimationFrame).mockClear()
  act(() => frames.flush(1))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('sends one up on its own every few seconds, and stops with a hidden tab', () => {
  setup()
  act(() => vi.advanceTimersByTime(8001))
  expect(window.requestAnimationFrame).toHaveBeenCalled()

  vi.mocked(window.requestAnimationFrame).mockClear()
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => vi.advanceTimersByTime(30_000))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('with reduced motion: nothing on its own, a click shows a still burst that goes', () => {
  const { ctx } = setup({ reduced: true })
  act(() => vi.advanceTimersByTime(30_000))
  expect(ctx.stroke).not.toHaveBeenCalled()

  fireEvent.click(document.querySelector('[data-testid="text"]') as Element, {
    clientX: 400,
    clientY: 300,
  })
  expect(ctx.stroke).toHaveBeenCalled()
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  ctx.clearRect.mockClear()
  act(() => vi.advanceTimersByTime(800))
  expect(ctx.clearRect).toHaveBeenCalled()
})

it('answers the rest of the layer: one rocket, or a finale', () => {
  const { ctx, frames } = setup()
  act(() => fireworksBus.launchAt(600, 200))
  expect(window.requestAnimationFrame).toHaveBeenCalled()

  act(() => fireworksBus.finale(1000))
  act(() => vi.advanceTimersByTime(600))
  act(() => frames.flush(1))
  // Several rockets in the air at once.
  const strokes = ctx.stroke.mock.calls.length
  expect(strokes).toBeGreaterThanOrEqual(3)
})

it('with reduced motion the finale is one still burst, never a flashing sky', () => {
  const { ctx } = setup({ reduced: true })
  act(() => fireworksBus.finale(8000))
  const strokes = ctx.stroke.mock.calls.length
  expect(strokes).toBeGreaterThan(0)
  act(() => vi.advanceTimersByTime(8000))
  expect(ctx.stroke.mock.calls.length).toBe(strokes)
})

it('with reduced motion a new burst replaces the last one', () => {
  const { ctx } = setup({ reduced: true })
  const text = document.querySelector('[data-testid="text"]') as Element
  fireEvent.click(text, { clientX: 400, clientY: 300 })
  const one = ctx.stroke.mock.calls.length
  ctx.stroke.mockClear()
  fireEvent.click(text, { clientX: 600, clientY: 200 })
  expect(ctx.stroke.mock.calls.length).toBe(one)
})
