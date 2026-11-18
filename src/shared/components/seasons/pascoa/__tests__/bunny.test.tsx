import { act, fireEvent, render } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { Bunny } from '../bunny'

const originalMatchMedia = window.matchMedia
const strip = () => document.querySelector('[data-bunny]')

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout', 'Date'] })
})

afterEach(() => {
  vi.useRealTimers()
  window.matchMedia = originalMatchMedia
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
})

it('crosses now and then as decoration, and goes when its strip ends', () => {
  mockMatchMedia({})
  render(<Bunny />)
  expect(strip()).toBeNull()
  act(() => vi.advanceTimersByTime(40_001))
  expect(strip()).toHaveAttribute('aria-hidden', 'true')
  expect(strip()?.querySelectorAll('.pascoa-footprint')).toHaveLength(12)

  // A footprint's end is not the strip's.
  fireEvent.animationEnd(strip()?.querySelector('.pascoa-footprint') as Element)
  expect(strip()).not.toBeNull()
  fireEvent.animationEnd(strip() as Element)
  expect(strip()).toBeNull()

  act(() => vi.advanceTimersByTime(40_001))
  expect(strip()).not.toBeNull()
})

it('never comes with reduced motion', () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  render(<Bunny />)
  act(() => vi.advanceTimersByTime(120_000))
  expect(strip()).toBeNull()
})

it('waits while the tab is hidden', () => {
  mockMatchMedia({})
  render(<Bunny />)
  Object.defineProperty(document, 'hidden', { configurable: true, value: true })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => vi.advanceTimersByTime(120_000))
  expect(strip()).toBeNull()
  Object.defineProperty(document, 'hidden', { configurable: true, value: false })
  act(() => document.dispatchEvent(new Event('visibilitychange')))
  act(() => vi.advanceTimersByTime(40_001))
  expect(strip()).not.toBeNull()
})
