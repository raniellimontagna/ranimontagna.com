import { act, fireEvent, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playWhistle } from '../carnaval-sound'
import { ConfettiCanvas } from '../confetti-canvas'

vi.mock('../carnaval-sound', () => ({ playWhistle: vi.fn(() => () => {}) }))

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
      <ConfettiCanvas />
    </>,
  )
  return { ...canvas, frames }
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.mocked(playWhistle).mockClear()
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

it('is decoration only', () => {
  setup()
  const canvas = document.querySelector('[data-confetti]')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
})

it('falls, pauses with a hidden tab and resumes', () => {
  const { ctx, frames } = setup()
  act(() => frames.flush())
  const drawn = ctx.clearRect.mock.calls.length
  expect(drawn).toBeGreaterThan(0)
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush(3))
  expect(ctx.clearRect.mock.calls.length).toBe(drawn)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush())
  expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(drawn)
})

it('throws a handful from a click on empty space, never from a link', () => {
  const { ctx, frames } = setup()
  act(() => frames.flush())
  const before = ctx.arc.mock.calls.length + ctx.fillRect.mock.calls.length
  fireEvent.click(document.querySelector('[data-testid="link"]') as Element)
  expect(playWhistle).not.toHaveBeenCalled()
  fireEvent.click(document.querySelector('[data-testid="text"]') as Element, {
    clientX: 400,
    clientY: 300,
  })
  expect(playWhistle).toHaveBeenCalledTimes(1)
  ctx.arc.mockClear()
  ctx.fillRect.mockClear()
  act(() => frames.flush())
  // The ambient pieces plus the 36 just thrown.
  expect(ctx.arc.mock.calls.length + ctx.fillRect.mock.calls.length).toBe(before + 36)
})

it('draws a still sprinkle once with reduced motion', () => {
  const { ctx } = setup({ reduced: true })
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})
