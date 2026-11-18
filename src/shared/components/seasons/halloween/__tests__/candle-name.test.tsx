import { act, fireEvent, render } from '@testing-library/react'
import { captureIntersection } from '@/tests/mocks/canvas'
import { batsBus } from '../bats-bus'
import { CandleName } from '../candle-name'
import { playCackle } from '../halloween-sound'

vi.mock('../halloween-sound', () => ({ playCackle: vi.fn(() => () => {}) }))

function Hero() {
  return (
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span>Montagna</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <CandleName />
    </>
  )
}

afterEach(() => {
  vi.restoreAllMocks()
})

it('hangs a cobweb by the name and lets a bat out of it on a click', async () => {
  const fly = vi.spyOn(batsBus, 'flyFrom')
  render(<Hero />)
  await act(async () => {})
  expect(document.querySelector('[data-season-slot="hero-lights"] [data-cobweb]')).not.toBeNull()
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-no-season-click')
  fireEvent.click(title, { clientX: 120, clientY: 260 })
  expect(fly).toHaveBeenCalledWith(120, 260)
  expect(playCackle).toHaveBeenCalledTimes(1)
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
})
