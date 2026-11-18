import { act, fireEvent, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playWhistle } from '../carnaval-sound'
import { stepConfetti } from '../confetti'
import { ConfettiCanvas } from '../confetti-canvas'

vi.mock('../carnaval-sound', () => ({ playWhistle: vi.fn(() => () => {}) }))
vi.mock('../confetti', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../confetti')>()
  return { ...actual, stepConfetti: vi.fn(actual.stepConfetti) }
})

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
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-color-theme')
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

it('keeps the confetti in place when a phone bar resizes the page', () => {
  const { ctx, setSize } = setup({ reduced: true })
  const heights = () => [
    ...ctx.arc.mock.calls.map((call) => call[1]),
    ...ctx.translate.mock.calls.map((call) => call[1]),
  ]
  const before = heights()
  expect(before.length).toBeGreaterThan(0)
  ctx.arc.mockClear()
  ctx.translate.mockClear()

  setSize(1280, 400)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(heights()).toEqual(before.map((y) => y / 2))
})

it('follows a finger or the pointer, and forgets it once it leaves', () => {
  const { frames } = setup()
  const pointer = () => {
    act(() => frames.flush())
    return vi.mocked(stepConfetti).mock.lastCall?.[4]
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

it('repaints the still sprinkle on a theme change, never on a scroll class', async () => {
  const { ctx } = setup({ reduced: true })
  const root = document.documentElement
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)

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
