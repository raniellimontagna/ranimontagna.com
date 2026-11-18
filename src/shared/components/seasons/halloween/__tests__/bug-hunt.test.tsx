import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { HUNT_SPOTS } from '../../shared/hunt'
import { BugHunt } from '../bug-hunt'
import { playSquash } from '../halloween-sound'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../halloween-sound', () => ({ playSquash: vi.fn(() => () => {}) }))

function Page({ onComplete = () => {}, onReopen = () => {} }) {
  return (
    <>
      {HUNT_SPOTS.map((id) => (
        <section key={id}>
          <span data-season-gift={id} />
        </section>
      ))}
      <BugHunt locale="pt" edition={2027} onComplete={onComplete} onReopen={onReopen} />
    </>
  )
}

const bug = (id: string) =>
  document.querySelector(`[data-season-gift="${id}"] button`) as HTMLButtonElement

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

it('hides a bug in every spot, each a button with its own name', async () => {
  render(<Page />)
  await act(async () => {})
  expect(new Set(HUNT_SPOTS.map((id) => bug(id).getAttribute('aria-label'))).size).toBe(5)
  expect(bug('trajetoria')).toHaveAccessibleName('Bug escondido (3 de 5)')
})

it('squashes a bug once: fixed, saved under Halloween, crunched and recorded', async () => {
  render(<Page />)
  await act(async () => {})
  fireEvent.click(bug('no-ar'))
  fireEvent.click(bug('no-ar'))
  expect(bug('no-ar')).toHaveAttribute('data-fixed')
  expect(bug('no-ar')).toHaveAccessibleName('Bug corrigido (2 de 5)')
  expect(localStorage.getItem('season-gifts:halloween-2027')).toBe('["no-ar"]')
  expect(playSquash).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-gift', {
    season: 'halloween',
    gift: 'no-ar',
    found: 1,
  })
  expect(screen.getByText('1/5')).toBeInTheDocument()
})

it('opens the report at the fifth, records it once, and reopens it from the corner', async () => {
  const onComplete = vi.fn()
  const onReopen = vi.fn()
  render(<Page onComplete={onComplete} onReopen={onReopen} />)
  await act(async () => {})
  for (const id of HUNT_SPOTS) fireEvent.click(bug(id))
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(vi.mocked(track).mock.calls.filter(([event]) => event === 'season-hunt-complete')).toEqual(
    [['season-hunt-complete', { season: 'halloween' }]],
  )
  fireEvent.click(screen.getByRole('button', { name: 'Ver o relatório' }))
  expect(onReopen).toHaveBeenCalled()
})

it('keeps squashed bugs squashed after a reload', async () => {
  localStorage.setItem('season-gifts:halloween-2027', '["ia","atto"]')
  render(<Page />)
  await act(async () => {})
  expect(bug('ia')).toHaveAttribute('data-fixed')
  expect(screen.getByText('2/5')).toBeInTheDocument()
})

it('does not record the finished hunt again in the same edition', async () => {
  localStorage.setItem('season-gifts-done:halloween-2027', '1')
  localStorage.setItem('season-gifts:halloween-2027', '["ia","no-ar","trajetoria","atto"]')
  render(<Page />)
  await act(async () => {})
  fireEvent.click(bug('contato'))
  expect(
    vi.mocked(track).mock.calls.filter(([event]) => event === 'season-hunt-complete'),
  ).toHaveLength(0)
})

it('plays the squash only on the bug just squashed, not on bugs fixed before', async () => {
  localStorage.setItem('season-gifts:halloween-2027', '["ia"]')
  render(<Page />)
  await act(async () => {})
  expect(bug('ia')).not.toHaveAttribute('data-just-fixed')
  fireEvent.click(bug('atto'))
  expect(bug('atto')).toHaveAttribute('data-just-fixed')
  expect(bug('ia')).not.toHaveAttribute('data-just-fixed')
})
