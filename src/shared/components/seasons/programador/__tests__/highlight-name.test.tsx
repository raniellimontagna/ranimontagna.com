import { act, fireEvent, render } from '@testing-library/react'
import { captureIntersection } from '@/tests/mocks/canvas'
import { HighlightName } from '../highlight-name'
import { playKey } from '../programador-sound'
import { tokensBus } from '../tokens-bus'

vi.mock('../programador-sound', () => ({ playKey: vi.fn(() => () => {}) }))

function Hero() {
  return (
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span>Montagna</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <HighlightName />
    </>
  )
}

afterEach(() => {
  vi.mocked(playKey).mockClear()
  vi.restoreAllMocks()
})

it('puts a caret after the last letter of the name', async () => {
  vi.spyOn(HTMLElement.prototype, 'getBoundingClientRect').mockImplementation(function (
    this: HTMLElement,
  ) {
    const rects: Record<string, DOMRect> = {
      H1: { left: 100, top: 200, right: 700, bottom: 400, width: 600, height: 200 } as DOMRect,
      Montagna: { left: 100, top: 300, right: 540, bottom: 390, width: 440, height: 90 } as DOMRect,
    }
    return rects[this.tagName] ?? rects[this.textContent ?? ''] ?? ({} as DOMRect)
  })
  render(<Hero />)
  await act(async () => {})
  const caret = document.querySelector<HTMLElement>('[data-season-slot="hero-lights"] [data-caret]')
  expect(caret).not.toBeNull()
  expect(caret?.style.left).toBe('440px')
  expect(caret?.style.top).toBe('100px')
  expect(caret?.style.height).toBe('90px')
})

it('switches the colour scheme on each click and throws tokens from there', async () => {
  const burst = vi.spyOn(tokensBus, 'burstAt')
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-no-season-click')
  expect(title).toHaveAttribute('data-scheme', '0')
  fireEvent.click(title, { clientX: 120, clientY: 260 })
  expect(title).toHaveAttribute('data-scheme', '1')
  expect(burst).toHaveBeenCalledWith(120, 260)
  expect(playKey).toHaveBeenCalledTimes(1)
  fireEvent.click(title, { clientX: 120, clientY: 260 })
  fireEvent.click(title, { clientX: 120, clientY: 260 })
  expect(title).toHaveAttribute('data-scheme', '0')
})

it('leaves a double click (selecting the name) at one change', async () => {
  const burst = vi.spyOn(tokensBus, 'burstAt')
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  fireEvent.click(title, { clientX: 120, clientY: 260, detail: 1 })
  fireEvent.click(title, { clientX: 120, clientY: 260, detail: 2 })
  expect(title).toHaveAttribute('data-scheme', '1')
  expect(burst).toHaveBeenCalledTimes(1)
  vi.spyOn(window, 'getSelection').mockReturnValue({ toString: () => 'Ranielli' } as Selection)
  fireEvent.click(title, { clientX: 120, clientY: 260, detail: 1 })
  expect(title).toHaveAttribute('data-scheme', '1')
  expect(playKey).toHaveBeenCalledTimes(1)
})

it('throws from the middle of the name when the click has no point (keyboard)', async () => {
  const burst = vi.spyOn(tokensBus, 'burstAt')
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  vi.spyOn(title, 'getBoundingClientRect').mockReturnValue({
    left: 100,
    top: 200,
    width: 600,
  } as DOMRect)
  fireEvent.click(title)
  expect(burst).toHaveBeenCalledWith(400, 200)
})

it('rests off screen and cleans up after itself', async () => {
  const view = captureIntersection()
  const { unmount } = render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  act(() => view.setVisible(false))
  expect(title).toHaveAttribute('data-season-idle')
  unmount()
  expect(title).not.toHaveAttribute('data-season-idle')
  expect(title).not.toHaveAttribute('data-no-season-click')
  expect(title).not.toHaveAttribute('data-scheme')
})
