import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { captureIntersection } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playAccordion } from '../junina-sound'
import { PescariaGame } from '../pescaria-game'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../junina-sound', () => ({ playAccordion: vi.fn(() => () => {}) }))

const originalMatchMedia = window.matchMedia

async function renderGame({ onComplete = () => {}, onReopen = () => {} } = {}) {
  render(
    <>
      <main>
        <div data-season-slot="play" />
      </main>
      <PescariaGame locale="pt" edition={2027} onComplete={onComplete} onReopen={onReopen} />
    </>,
  )
  await act(async () => {})
}

const fish = () => screen.queryAllByRole('button', { name: /Peixinho \d de 5/ })

beforeEach(() => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
  localStorage.clear()
  vi.clearAllMocks()
  vi.useRealTimers()
})

it('swims five fish in the pond, each a real button with its own name', async () => {
  await renderGame()
  expect(document.querySelector('[data-season-slot="play"] [data-pescaria]')).toHaveAttribute(
    'data-no-season-click',
  )
  expect(fish()).toHaveLength(5)
  expect(screen.getByRole('button', { name: 'Peixinho 3 de 5' })).toBeInTheDocument()
})

it('hooks a fish once: the prize, the sound, the record and the save', async () => {
  await renderGame()
  fireEvent.click(screen.getByRole('button', { name: 'Peixinho 1 de 5' }))
  expect(fish()).toHaveLength(4)
  expect(screen.getByRole('status')).toHaveTextContent('Fisgou! Prenda: Grimory')
  expect(screen.getByRole('list', { name: 'Suas prendas' })).toHaveTextContent('Grimory')
  expect(screen.getByText('1 de 5 fisgados')).toBeInTheDocument()
  expect(playAccordion).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-gift', { season: 'junina', gift: 'Grimory', found: 1 })
  expect(localStorage.getItem('season-pesca:junina-2027')).toBe('[0]')
})

it('opens the card at the fifth catch, from the prizes button, and records it once', async () => {
  const onComplete = vi.fn(() => {
    expect(screen.getByRole('button', { name: 'Ver suas prendas' })).toHaveFocus()
  })
  await renderGame({ onComplete })
  for (let n = 1; n <= 5; n++) {
    fireEvent.click(screen.getByRole('button', { name: `Peixinho ${n} de 5` }))
  }
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(fish()).toHaveLength(0)
  expect(vi.mocked(track).mock.calls.filter(([event]) => event === 'season-hunt-complete')).toEqual(
    [['season-hunt-complete', { season: 'junina' }]],
  )
})

it('keeps each fish on its own side when another is caught', async () => {
  await renderGame()
  expect(document.querySelector('[data-fish="1"]')).toHaveAttribute('data-side', 'right')
  fireEvent.click(screen.getByRole('button', { name: 'Peixinho 1 de 5' }))
  expect(document.querySelector('[data-fish="1"]')).toHaveAttribute('data-side', 'right')
  expect(document.querySelector('[data-fish="2"]')).toHaveAttribute('data-side', 'left')
})

it('moves keyboard focus to the next fish after a catch', async () => {
  await renderGame()
  const first = screen.getByRole('button', { name: 'Peixinho 1 de 5' })
  first.focus()
  fireEvent.click(first)
  expect(screen.getByRole('button', { name: 'Peixinho 2 de 5' })).toHaveFocus()
})

it('has a switch that stops all the fish', async () => {
  await renderGame()
  const stop = screen.getByRole('button', { name: 'Parar os peixinhos' })
  expect(stop).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(stop)
  expect(stop).toHaveAttribute('aria-pressed', 'true')
  expect(document.querySelector('[data-pescaria]')).toHaveAttribute('data-stopped')
})

it('picks up the catch saved in this edition', async () => {
  localStorage.setItem('season-pesca:junina-2027', '[1,3]')
  await renderGame()
  expect(fish()).toHaveLength(3)
  expect(screen.getByText('2 de 5 fisgados')).toBeInTheDocument()
})

it('lets each hooked fish leap out before it lands, even two at once', async () => {
  mockMatchMedia({})
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  await renderGame()
  fireEvent.click(screen.getByRole('button', { name: 'Peixinho 2 de 5' }))
  act(() => vi.advanceTimersByTime(300))
  fireEvent.click(screen.getByRole('button', { name: 'Peixinho 4 de 5' }))
  expect(document.querySelector('[data-fish="1"]')).toHaveAttribute('data-leaping')
  expect(document.querySelector('[data-fish="3"]')).toHaveAttribute('data-leaping')
  expect(document.querySelector('[data-fish="3"]')).toHaveAttribute('aria-disabled', 'true')
  act(() => vi.advanceTimersByTime(400))
  expect(document.querySelector('[data-fish="1"]')).toBeNull()
  expect(document.querySelector('[data-fish="3"]')).toHaveAttribute('data-leaping')
  act(() => vi.advanceTimersByTime(300))
  expect(document.querySelector('[data-fish="3"]')).toBeNull()
  expect(screen.getByText('2 de 5 fisgados')).toBeInTheDocument()
})

it('rests the fish while the pond is off screen', async () => {
  const original = window.IntersectionObserver
  const view = captureIntersection()
  await renderGame()
  const pond = document.querySelector('[data-pescaria]')
  act(() => view.setVisible(false))
  expect(pond).toHaveAttribute('data-season-idle')
  act(() => view.setVisible(true))
  expect(pond).not.toHaveAttribute('data-season-idle')
  window.IntersectionObserver = original
})
