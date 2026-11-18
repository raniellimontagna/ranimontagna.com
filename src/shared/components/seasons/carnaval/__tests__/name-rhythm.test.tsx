import { act, fireEvent, render } from '@testing-library/react'
import { captureIntersection } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playWhistle } from '../carnaval-sound'
import { NameRhythm } from '../name-rhythm'

vi.mock('../carnaval-sound', () => ({ playWhistle: vi.fn(() => () => {}) }))

function Hero() {
  return (
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span>Montagna</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <NameRhythm />
    </>
  )
}

const originalMatchMedia = window.matchMedia

beforeEach(() => {
  mockMatchMedia({})
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

it('dances to samba, then frevo and marchinha on each click, and cleans up', async () => {
  const { unmount } = render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-ritmo', 'samba')
  expect(title).toHaveAttribute('data-no-season-click')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'frevo')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'marchinha')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'samba')
  expect(playWhistle).toHaveBeenCalledTimes(3)
  vi.mocked(playWhistle).mockClear()

  unmount()
  expect(title).not.toHaveAttribute('data-ritmo')
  expect(title).not.toHaveAttribute('data-no-season-click')
})

it('rests the dance while the name is off screen', async () => {
  const view = captureIntersection()
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  act(() => view.setVisible(false))
  expect(title).toHaveAttribute('data-season-idle')
  act(() => view.setVisible(true))
  expect(title).not.toHaveAttribute('data-season-idle')
})

it('stays still with reduced motion: no rhythm, nothing to click', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).not.toHaveAttribute('data-ritmo')
  fireEvent.click(title)
  expect(playWhistle).not.toHaveBeenCalled()
})
