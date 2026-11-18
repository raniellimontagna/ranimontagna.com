import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { HUNT_SPOTS as GIFT_IDS } from '../../shared/hunt'
import { setSeasonSound } from '../../shared/season-sound'
import { Hunt } from '../hunt'
import { playBell } from '../natal-sound'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../natal-sound', async (importOriginal) => ({
  ...(await importOriginal<typeof import('../natal-sound')>()),
  playBell: vi.fn(() => () => {}),
}))

function Sections({ ids = GIFT_IDS }: { ids?: readonly string[] }) {
  return (
    <>
      {ids.map((id) => (
        <section key={id}>
          <span data-season-gift={id} />
        </section>
      ))}
    </>
  )
}

const gift = (id: string) =>
  document.querySelector(`[data-season-gift="${id}"] button`) as HTMLButtonElement

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2026, 11, 10, 12))
})

afterEach(() => {
  vi.useRealTimers()
  localStorage.clear()
  vi.mocked(track).mockClear()
  vi.mocked(playBell).mockClear()
})

async function renderHunt(onComplete = vi.fn()) {
  const view = render(
    <>
      <Sections />
      <Hunt locale="pt" onComplete={onComplete} onReopen={vi.fn()} />
    </>,
  )
  await act(async () => {})
  return { ...view, onComplete }
}

it('hides a gift in every slot, each a real button with its own name', async () => {
  await renderHunt()
  const names = GIFT_IDS.map((id) => gift(id).getAttribute('aria-label'))
  for (const name of names) expect(name).toMatch(/presente/i)
  expect(new Set(names).size).toBe(GIFT_IDS.length)
  expect(gift('atto')).toHaveAccessibleName('Abrir presente escondido (4 de 5)')
})

it('opens a gift, saves it and records it', async () => {
  await renderHunt()
  fireEvent.click(gift('ia'))
  expect(gift('ia')).toHaveAttribute('data-opened')
  expect(localStorage.getItem('season-gifts:natal-2026')).toBe('["ia"]')
  expect(track).toHaveBeenCalledWith('season-gift', { season: 'natal', gift: 'ia', found: 1 })
  expect(playBell).toHaveBeenCalled()
  expect(screen.getByText('1/5')).toBeInTheDocument()
})

it('does not count a gift twice', async () => {
  await renderHunt()
  fireEvent.click(gift('ia'))
  fireEvent.click(gift('ia'))
  expect(track).toHaveBeenCalledTimes(1)
})

it('calls the reward when the fifth gift opens, and records it once a year', async () => {
  const { onComplete } = await renderHunt()
  for (const id of GIFT_IDS) fireEvent.click(gift(id))
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-hunt-complete', { season: 'natal' })
  expect(localStorage.getItem('season-gifts-done:natal-2026')).toBe('1')
  expect(screen.getByRole('button', { name: /globo/i })).toBeInTheDocument()
})

it('keeps opened gifts opened across page changes', async () => {
  const onComplete = vi.fn()
  const { rerender } = render(
    <>
      <Sections />
      <Hunt locale="pt" onComplete={onComplete} onReopen={vi.fn()} />
    </>,
  )
  await act(async () => {})
  fireEvent.click(gift('ia'))

  rerender(<Hunt locale="pt" onComplete={onComplete} onReopen={vi.fn()} />)
  await act(async () => {})
  rerender(
    <>
      <Sections />
      <Hunt locale="pt" onComplete={onComplete} onReopen={vi.fn()} />
    </>,
  )
  await act(async () => {})
  expect(gift('ia')).toHaveAttribute('data-opened')
})

it('turns the Christmas sound on from the counter', async () => {
  await renderHunt()
  const sound = screen.getByRole('button', { name: /som/i })
  expect(sound).toHaveAttribute('aria-pressed', 'false')
  fireEvent.click(sound)
  expect(sound).toHaveAttribute('aria-pressed', 'true')
  setSeasonSound(false)
})
