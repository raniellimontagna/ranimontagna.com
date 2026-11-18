import { act, render, screen } from '@testing-library/react'
import { fireworksBus } from '../fireworks-bus'
import { playAuldLangSyne } from '../reveillon-sound'
import { Virada } from '../virada'

vi.mock('../reveillon-sound', () => ({ playAuldLangSyne: vi.fn(() => () => {}) }))

const setHidden = (hidden: boolean) => {
  Object.defineProperty(document, 'hidden', { configurable: true, value: hidden })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
}

let finale: ReturnType<typeof vi.spyOn>

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date', 'setTimeout', 'clearTimeout'] })
  finale = vi.spyOn(fireworksBus, 'finale').mockImplementation(() => {})
  window.history.replaceState(null, '', '/')
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
  vi.mocked(playAuldLangSyne).mockClear()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

it('counts the last ten seconds, then fireworks and the greeting, once', () => {
  vi.setSystemTime(new Date(2026, 11, 31, 23, 58, 0))
  const onTurn = vi.fn()
  render(<Virada locale="pt" edition={2026} onTurn={onTurn} />)
  expect(document.querySelector('[data-virada-count]')).toBeNull()

  act(() => vi.advanceTimersByTime(110_000))
  expect(document.querySelector('[data-virada-count]')).toHaveTextContent('10')
  act(() => vi.advanceTimersByTime(5000))
  expect(document.querySelector('[data-virada-count]')).toHaveTextContent('5')

  act(() => vi.advanceTimersByTime(5000))
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(finale).toHaveBeenCalledTimes(1)
  expect(playAuldLangSyne).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('status')).toHaveTextContent('Feliz 2027!')
  expect(document.querySelector('[data-virada-greeting]')).toBeInTheDocument()

  act(() => vi.advanceTimersByTime(6000))
  expect(document.querySelector('[data-virada-greeting]')).toBeNull()
  act(() => vi.advanceTimersByTime(60_000))
  expect(onTurn).toHaveBeenCalledTimes(1)
})

it('turns once even when the timer fires late, and celebrates a hidden tab on return', () => {
  vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 0))
  const onTurn = vi.fn()
  render(<Virada locale="pt" edition={2026} onTurn={onTurn} />)
  setHidden(true)
  // The browser throttled the tab: the clock is past midnight when the timer runs.
  vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 40))
  act(() => vi.advanceTimersByTime(60_000))
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(finale).not.toHaveBeenCalled()

  setHidden(false)
  expect(finale).toHaveBeenCalledTimes(1)
  expect(onTurn).toHaveBeenCalledTimes(1)
})

it('skips the party for a visitor back long after midnight', () => {
  vi.setSystemTime(new Date(2026, 11, 31, 23, 59, 0))
  render(<Virada locale="pt" edition={2026} onTurn={() => {}} />)
  setHidden(true)
  vi.setSystemTime(new Date(2027, 0, 1, 0, 0, 30))
  act(() => vi.advanceTimersByTime(60_000))
  vi.setSystemTime(new Date(2027, 0, 1, 9, 0))
  setHidden(false)
  expect(finale).not.toHaveBeenCalled()
})

it('does nothing for a visit after midnight', () => {
  vi.setSystemTime(new Date(2027, 0, 2, 12))
  const onTurn = vi.fn()
  render(<Virada locale="pt" edition={2026} onTurn={onTurn} />)
  act(() => vi.advanceTimersByTime(120_000))
  expect(onTurn).not.toHaveBeenCalled()
  expect(finale).not.toHaveBeenCalled()
})

it('can be previewed: ?virada=15 brings midnight 15 seconds away', () => {
  vi.setSystemTime(new Date(2026, 10, 18, 12))
  window.history.replaceState(null, '', '/?epoca=reveillon&virada=15')
  const onTurn = vi.fn()
  render(<Virada locale="en" edition={2026} onTurn={onTurn} />)
  act(() => vi.advanceTimersByTime(15_000))
  expect(onTurn).toHaveBeenCalledTimes(1)
  expect(screen.getByRole('status')).toHaveTextContent('Happy 2027!')
})
