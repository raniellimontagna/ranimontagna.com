import { act, fireEvent, render } from '@testing-library/react'
import { captureIntersection } from '@/tests/mocks/canvas'
import { Bunting } from '../bunting'
import { playAccordion } from '../junina-sound'

vi.mock('../junina-sound', () => ({ playAccordion: vi.fn(() => () => {}) }))

function Hero() {
  return (
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span>Montagna</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <Bunting />
    </>
  )
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

it('hangs coloured flags over the name, inside the hero slot', async () => {
  render(<Hero />)
  await act(async () => {})
  const flags = document.querySelectorAll('[data-season-slot="hero-lights"] [data-flag]')
  expect(flags.length).toBeGreaterThanOrEqual(7)
  expect(flags[0]).toHaveAttribute('data-color', 'red')
  expect(flags[1]).toHaveAttribute('data-color', 'yellow')
})

it('blows a gust on a click on the name, which calms down', async () => {
  render(<Hero />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-no-season-click')
  fireEvent.click(title)
  expect(document.querySelector('[data-bunting]')).toHaveAttribute('data-gust')
  expect(playAccordion).toHaveBeenCalledTimes(1)
  act(() => vi.advanceTimersByTime(2700))
  expect(document.querySelector('[data-bunting]')).not.toHaveAttribute('data-gust')
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
