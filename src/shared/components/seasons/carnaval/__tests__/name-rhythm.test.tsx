import { act, fireEvent, render } from '@testing-library/react'
import { captureIntersection } from '@/tests/mocks/canvas'
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

it('dances to samba, then frevo and marchinha on each click, and cleans up', async () => {
  const { unmount } = render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-ritmo', 'samba')
  expect(title).toHaveAttribute('data-no-fireworks')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'frevo')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'marchinha')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-ritmo', 'samba')
  expect(playWhistle).toHaveBeenCalledTimes(3)

  unmount()
  expect(title).not.toHaveAttribute('data-ritmo')
  expect(title).not.toHaveAttribute('data-no-fireworks')
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
