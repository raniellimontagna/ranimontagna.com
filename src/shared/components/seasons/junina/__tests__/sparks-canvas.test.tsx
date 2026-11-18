import { act, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { stepSparks } from '../sparks'
import { SparksCanvas } from '../sparks-canvas'

vi.mock('../sparks', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../sparks')>()
  return { ...actual, stepSparks: vi.fn(actual.stepSparks) }
})

const originalMatchMedia = window.matchMedia

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-color-theme')
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
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush())
  expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(drawn)
})

it('draws a still glow once with reduced motion', () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  const { ctx } = mockCanvas2d({ width: 1280, height: 800 })
  installFrameStub()
  render(<SparksCanvas />)
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
})

it('redraws the still glow when the page resizes', () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  const { ctx, setSize } = mockCanvas2d({ width: 1280, height: 800 })
  installFrameStub()
  render(<SparksCanvas />)
  setSize(390, 700)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(ctx.clearRect).toHaveBeenCalledTimes(2)
  expect(ctx.clearRect).toHaveBeenLastCalledWith(0, 0, 390, 700)
})

it('slides away from a finger or the pointer, and forgets it once it leaves', () => {
  mockMatchMedia({})
  mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  render(<SparksCanvas />)
  const pointer = () => {
    act(() => frames.flush())
    return vi.mocked(stepSparks).mock.lastCall?.[4]
  }
  const touch = (touches: { clientX: number; clientY: number }[]) => {
    const event = new Event('touchmove')
    Object.defineProperty(event, 'touches', { value: touches })
    window.dispatchEvent(event)
  }

  touch([{ clientX: 10, clientY: 20 }])
  expect(pointer()).toEqual({ x: 10, y: 20 })
  touch([])
  expect(pointer()).toEqual({ x: 10, y: 20 })
  window.dispatchEvent(new Event('touchend'))
  expect(pointer()).toBeNull()

  window.dispatchEvent(new MouseEvent('pointermove', { clientX: 5, clientY: 6 }))
  expect(pointer()).toEqual({ x: 5, y: 6 })
  window.dispatchEvent(new MouseEvent('pointerout', { relatedTarget: document.body }))
  expect(pointer()).toEqual({ x: 5, y: 6 })
  window.dispatchEvent(new MouseEvent('pointerout'))
  expect(pointer()).toBeNull()
})

it('repaints the still glow on a theme change, never on a scroll class', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  const { ctx } = mockCanvas2d({ width: 1280, height: 800 })
  installFrameStub()
  render(<SparksCanvas />)
  const root = document.documentElement

  root.classList.add('lenis-scrolling')
  await act(async () => {})
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)

  root.classList.add('dark')
  await act(async () => {})
  expect(ctx.clearRect).toHaveBeenCalledTimes(2)

  root.setAttribute('data-color-theme', 'violet')
  await act(async () => {})
  expect(ctx.clearRect).toHaveBeenCalledTimes(3)
})
