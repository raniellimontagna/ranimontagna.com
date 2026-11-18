import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
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

it('opens the card at the fifth catch and keeps the catch after a reload', async () => {
  const onComplete = vi.fn()
  await renderGame({ onComplete })
  for (let n = 1; n <= 5; n++)
    fireEvent.click(screen.getByRole('button', { name: `Peixinho ${n} de 5` }))
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(fish()).toHaveLength(0)
  expect(screen.getByRole('button', { name: 'Ver suas prendas' })).toBeInTheDocument()
})

it('picks up the catch saved in this edition', async () => {
  localStorage.setItem('season-pesca:junina-2027', '[1,3]')
  await renderGame()
  expect(fish()).toHaveLength(3)
  expect(screen.getByText('2 de 5 fisgados')).toBeInTheDocument()
})

it('lets a hooked fish leap out before it lands in the prizes', async () => {
  mockMatchMedia({})
  vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] })
  await renderGame()
  fireEvent.click(screen.getByRole('button', { name: 'Peixinho 2 de 5' }))
  expect(document.querySelector('[data-fish="1"]')).toHaveAttribute('data-leaping')
  act(() => vi.advanceTimersByTime(700))
  expect(document.querySelector('[data-fish="1"]')).toBeNull()
  expect(screen.getByText('1 de 5 fisgados')).toBeInTheDocument()
})
