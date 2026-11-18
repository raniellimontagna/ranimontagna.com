import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { HUNT_SPOTS } from '../../shared/hunt'
import { EggHunt } from '../egg-hunt'
import { playPloc } from '../pascoa-sound'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../pascoa-sound', () => ({ playPloc: vi.fn(() => () => {}) }))

function Page({ onComplete = () => {}, onReopen = () => {} }) {
  return (
    <>
      {HUNT_SPOTS.map((id) => (
        <section key={id}>
          <span data-season-gift={id} />
        </section>
      ))}
      <EggHunt locale="pt" edition={2027} onComplete={onComplete} onReopen={onReopen} />
    </>
  )
}

const egg = (id: string) =>
  document.querySelector(`[data-season-gift="${id}"] button`) as HTMLButtonElement

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

it('hides a painted egg in every spot, each a button with its own name', async () => {
  render(<Page />)
  await act(async () => {})
  const names = HUNT_SPOTS.map((id) => egg(id).getAttribute('aria-label'))
  expect(new Set(names).size).toBe(5)
  expect(egg('atto')).toHaveAccessibleName('Ovo escondido (4 de 5)')
})

it('finds an egg once, saves it under Easter and knocks', async () => {
  render(<Page />)
  await act(async () => {})
  fireEvent.click(egg('ia'))
  fireEvent.click(egg('ia'))
  expect(egg('ia')).toHaveAttribute('data-found')
  expect(egg('ia')).toHaveAccessibleName('Ovo encontrado (1 de 5)')
  expect(localStorage.getItem('season-gifts:pascoa-2027')).toBe('["ia"]')
  expect(track).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-gift', { season: 'pascoa', gift: 'ia', found: 1 })
  expect(playPloc).toHaveBeenCalledTimes(1)
  expect(screen.getByText('1/5')).toBeInTheDocument()
})

it('opens the chocolate egg at the fifth, and again from the corner', async () => {
  const onComplete = vi.fn()
  const onReopen = vi.fn()
  render(<Page onComplete={onComplete} onReopen={onReopen} />)
  await act(async () => {})
  for (const id of HUNT_SPOTS) fireEvent.click(egg(id))
  expect(onComplete).toHaveBeenCalledTimes(1)
  fireEvent.click(screen.getByRole('button', { name: 'Abrir o ovo de chocolate' }))
  expect(onReopen).toHaveBeenCalled()
})
