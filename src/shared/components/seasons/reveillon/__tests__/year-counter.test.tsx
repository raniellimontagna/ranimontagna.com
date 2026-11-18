import { act, fireEvent, render } from '@testing-library/react'
import { fireworksBus } from '../fireworks-bus'
import { splitYears, YearCounter } from '../year-counter'

function Hero({ edition, turned }: { edition: number; turned: boolean }) {
  return (
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span>Montagna</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <YearCounter edition={edition} turned={turned} />
    </>
  )
}

const counter = () => document.querySelector('[data-year-counter]')

afterEach(() => {
  vi.restoreAllMocks()
})

it('shows the year beside the name and rolls into the next at the virada', async () => {
  const { rerender } = render(<Hero edition={2026} turned={false} />)
  await act(async () => {})
  expect(counter()?.closest('[data-season-slot="hero-lights"]')).not.toBeNull()
  expect(counter()).toHaveTextContent('20267')
  expect(counter()).not.toHaveAttribute('data-turned')

  rerender(<Hero edition={2026} turned />)
  expect(counter()).toHaveAttribute('data-turned')
})

it('sends a firework up from the name when it is clicked, and only that one', async () => {
  const launch = vi.spyOn(fireworksBus, 'launchAt')
  const { unmount } = render(<Hero edition={2026} turned={false} />)
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-no-fireworks')
  fireEvent.click(title, { clientX: 120, clientY: 300 })
  expect(launch).toHaveBeenCalledWith(expect.any(Number), expect.any(Number), { x: 120, y: 300 })

  unmount()
  expect(title).not.toHaveAttribute('data-no-fireworks')
})

it.each([
  [2026, 2027, { shared: '202', before: '6', after: '7' }],
  [2029, 2030, { shared: '20', before: '29', after: '30' }],
  [2099, 2100, { shared: '2', before: '099', after: '100' }],
])('rolls only the digits that change: %i → %i', (from, to, expected) => {
  expect(splitYears(from, to)).toEqual(expected)
})
