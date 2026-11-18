import { act, render, screen } from '@testing-library/react'
import { useToday } from '../use-today'

function Probe() {
  return <output>{useToday().getDate()}</output>
}

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
})

afterEach(() => {
  vi.useRealTimers()
})

it('turns the day at local midnight while the page stays open', async () => {
  vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 30))
  render(<Probe />)
  expect(screen.getByRole('status')).toHaveTextContent('31')
  await act(async () => {
    vi.advanceTimersByTime(31_000)
  })
  expect(screen.getByRole('status')).toHaveTextContent('1')
})
