import { act, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { SparksCanvas } from '../sparks-canvas'

const originalMatchMedia = window.matchMedia

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

it('is decoration only, rises, and pauses with a hidden tab', () => {
  mockMatchMedia({})
  const { ctx } = mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  const { container } = render(<SparksCanvas />)
  const canvas = container.querySelector('canvas')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
  act(() => frames.flush())
  const drawn = ctx.clearRect.mock.calls.length
  expect(drawn).toBeGreaterThan(0)
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush(3))
  expect(ctx.clearRect.mock.calls.length).toBe(drawn)
})

it('draws a still glow once with reduced motion', () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  const { ctx } = mockCanvas2d({ width: 1280, height: 800 })
  installFrameStub()
  render(<SparksCanvas />)
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})
