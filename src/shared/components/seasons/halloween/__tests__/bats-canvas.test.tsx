import { act, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { stepBats } from '../bats'
import { batsBus } from '../bats-bus'
import { BatsCanvas } from '../bats-canvas'

vi.mock('../bats', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../bats')>()
  return { ...actual, stepBats: vi.fn(actual.stepBats) }
})

const originalMatchMedia = window.matchMedia

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
  window.matchMedia = originalMatchMedia
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-color-theme')
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

it('waits while the tab is hidden, and plans the next flight on return', () => {
  const { frames } = setup()
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => vi.advanceTimersByTime(60_000))
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()

  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  // The empty sky settles in a frame; the next flight comes from the new schedule.
  act(() => frames.flush())
  vi.mocked(window.requestAnimationFrame).mockClear()
  act(() => vi.advanceTimersByTime(35_001))
  expect(window.requestAnimationFrame).toHaveBeenCalled()
})

it('veers from a finger or the pointer, and forgets it once it leaves', () => {
  let clock = 0
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 16))
  const { frames } = setup()
  act(() => batsBus.flyFrom(200, 300))
  const pointer = () => {
    act(() => frames.flush())
    return vi.mocked(stepBats).mock.lastCall?.[4]
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

it('takes the new bat colour on a theme change, never on a scroll class', async () => {
  let clock = 0
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 16))
  let bat = '#111111'
  vi.spyOn(window, 'getComputedStyle').mockImplementation(
    () => ({ getPropertyValue: () => bat }) as unknown as CSSStyleDeclaration,
  )
  const { ctx, frames } = setup()
  const root = document.documentElement
  act(() => batsBus.flyFrom(200, 300))
  act(() => frames.flush())
  expect(ctx.fillStyle).toBe('#111111')

  bat = '#222222'
  root.classList.add('lenis-scrolling')
  await act(async () => {})
  act(() => frames.flush())
  expect(ctx.fillStyle).toBe('#111111')

  root.classList.add('dark')
  await act(async () => {})
  act(() => frames.flush())
  expect(ctx.fillStyle).toBe('#222222')

  bat = '#333333'
  root.setAttribute('data-color-theme', 'violet')
  await act(async () => {})
  act(() => frames.flush())
  expect(ctx.fillStyle).toBe('#333333')
})
