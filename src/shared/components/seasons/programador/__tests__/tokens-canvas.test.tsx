import { act, fireEvent, render } from '@testing-library/react'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playKey } from '../programador-sound'
import { burstTokens, stepTokens } from '../tokens'
import { tokensBus } from '../tokens-bus'
import { TokensCanvas } from '../tokens-canvas'

vi.mock('../programador-sound', () => ({ playKey: vi.fn(() => () => {}) }))
vi.mock('../tokens', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../tokens')>()
  return {
    ...actual,
    stepTokens: vi.fn(actual.stepTokens),
    burstTokens: vi.fn(actual.burstTokens),
  }
})

const originalMatchMedia = window.matchMedia

function setup({ reduced = false } = {}) {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': reduced })
  const canvas = mockCanvas2d({ width: 1280, height: 800 })
  const frames = installFrameStub()
  const view = render(
    <>
      <section>
        <p data-testid="text">Texto</p>
        <a href="/blog" data-testid="link">
          Blog
        </a>
      </section>
      <TokensCanvas />
    </>,
  )
  return { ...canvas, frames, unmount: view.unmount }
}

afterEach(() => {
  window.matchMedia = originalMatchMedia
  vi.mocked(playKey).mockClear()
  vi.mocked(burstTokens).mockClear()
  vi.mocked(stepTokens).mockClear()
  vi.restoreAllMocks()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  document.documentElement.className = ''
  document.documentElement.removeAttribute('data-color-theme')
})

it('is decoration only, writes code, and pauses with a hidden tab', () => {
  const { ctx, frames } = setup()
  const canvas = document.querySelector('[data-code-tokens]')
  expect(canvas).toHaveAttribute('aria-hidden', 'true')
  expect(canvas?.className).toContain('pointer-events-none')
  act(() => frames.flush())
  expect(ctx.fillText).toHaveBeenCalled()
  const drawn = ctx.clearRect.mock.calls.length
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush(3))
  expect(ctx.clearRect.mock.calls.length).toBe(drawn)
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => frames.flush())
  expect(ctx.clearRect.mock.calls.length).toBeGreaterThan(drawn)
})

it('stops at the next frame if the tab hides before the visibility event comes', () => {
  const { ctx, frames } = setup()
  act(() => frames.flush())
  const drawn = ctx.clearRect.mock.calls.length
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => frames.flush(3))
  expect(ctx.clearRect.mock.calls.length).toBe(drawn)
})

it('throws a handful from a click on empty space, never from a link or a selection', () => {
  const { frames } = setup()
  act(() => frames.flush())
  fireEvent.click(document.querySelector('[data-testid="link"]') as Element)
  expect(burstTokens).not.toHaveBeenCalled()

  const selection = vi.spyOn(window, 'getSelection')
  selection.mockReturnValue({ toString: () => 'Tex' } as Selection)
  fireEvent.click(document.querySelector('[data-testid="text"]') as Element)
  expect(burstTokens).not.toHaveBeenCalled()
  selection.mockRestore()

  fireEvent.click(document.querySelector('[data-testid="text"]') as Element, {
    clientX: 400,
    clientY: 300,
  })
  expect(burstTokens).toHaveBeenCalledWith(expect.any(Array), 400, 300, Math.random)
  expect(playKey).toHaveBeenCalledTimes(1)
})

it('throws from the name when asked, and stops listening once gone', () => {
  const { frames, unmount } = setup()
  act(() => frames.flush())
  act(() => tokensBus.burstAt(50, 60))
  expect(burstTokens).toHaveBeenLastCalledWith(expect.any(Array), 50, 60, Math.random)
  unmount()
  tokensBus.burstAt(70, 80)
  expect(burstTokens).toHaveBeenCalledTimes(1)
})

it('stands still with reduced motion: one drawing, no frames, nothing thrown', () => {
  const { ctx } = setup({ reduced: true })
  expect(ctx.clearRect).toHaveBeenCalledTimes(1)
  expect(window.requestAnimationFrame).not.toHaveBeenCalled()
  fireEvent.click(document.querySelector('[data-testid="text"]') as Element, {
    clientX: 400,
    clientY: 300,
  })
  act(() => tokensBus.burstAt(50, 60))
  expect(burstTokens).not.toHaveBeenCalled()
  expect(playKey).not.toHaveBeenCalled()
})

it('keeps each token where it was, in proportion, when only the height changes', () => {
  const { frames, setSize } = setup()
  act(() => frames.flush())
  const [first] = vi.mocked(stepTokens).mock.lastCall?.[0] ?? []
  const before = first.y
  setSize(1280, 400)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(first.y).toBeCloseTo(before / 2)
})

it('redraws the still tokens when the page resizes', () => {
  const { ctx, setSize } = setup({ reduced: true })
  setSize(1280, 400)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(ctx.clearRect).toHaveBeenCalledTimes(2)
  expect(ctx.clearRect).toHaveBeenLastCalledWith(0, 0, 1280, 400)
  setSize(390, 700)
  act(() => window.dispatchEvent(new Event('resize')))
  expect(ctx.clearRect).toHaveBeenLastCalledWith(0, 0, 390, 700)
})

it('slides away from a finger or the pointer, and forgets it once it leaves', () => {
  const { frames } = setup()
  const pointer = () => {
    act(() => frames.flush())
    return vi.mocked(stepTokens).mock.lastCall?.[4]
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

it('repaints the still tokens on a theme change, never on a scroll class', async () => {
  const { ctx } = setup({ reduced: true })
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
