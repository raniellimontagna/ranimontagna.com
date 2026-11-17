import { act, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { SnowCanvas } from '../snow-canvas'

const originalMatchMedia = window.matchMedia

function setup() {
  const canvas = mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  return { ...canvas, frames }
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
})

it('draws still snow once when motion is reduced', () => {
  const { ctx } = setup()
  render(<SnowCanvas />)
  expect(ctx.arc).toHaveBeenCalled()
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('is decoration only', () => {
  setup()
  const { container } = render(<SnowCanvas />)
  const canvas = container.querySelector('canvas')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
})

it('animates, pauses with a hidden tab and resumes', () => {
  mockMatchMedia({})
  const { ctx, frames } = setup()
  render(<SnowCanvas />)
  expect(window.requestAnimationFrame).toHaveBeenCalled()

  frames.flush()
  const drawn = ctx.arc.mock.calls.length
  expect(drawn).toBeGreaterThan(0)

  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  frames.flush(3)
  expect(ctx.arc.mock.calls.length).toBe(drawn)

  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  frames.flush()
  expect(ctx.arc.mock.calls.length).toBeGreaterThan(drawn)
})

it('re-reads the snow color when the theme changes', async () => {
  mockMatchMedia({})
  const { ctx, frames } = setup()
  document.documentElement.style.setProperty('--foreground', '#000000')
  render(<SnowCanvas />)
  frames.flush()
  expect(ctx.fillStyle).toBe('#000000')

  document.documentElement.style.setProperty('--foreground', '#ffffff')
  await act(async () => {
    document.documentElement.classList.toggle('dark')
  })
  frames.flush()
  expect(ctx.fillStyle).toBe('#ffffff')
  document.documentElement.style.removeProperty('--foreground')
})

it('stops and cleans up when removed', () => {
  mockMatchMedia({})
  setup()
  const removeListener = vi.spyOn(window, 'removeEventListener')
  const { unmount } = render(<SnowCanvas />)
  unmount()
  expect(window.cancelAnimationFrame).toHaveBeenCalled()
  expect(removeListener).toHaveBeenCalledWith('pointermove', expect.any(Function))
})
