import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { BlocoGame } from '../bloco-game'
import { playBatucada } from '../carnaval-sound'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../carnaval-sound', () => ({ playBatucada: vi.fn(() => () => {}) }))

async function renderGame(edition = 2027) {
  const view = render(
    <>
      <main>
        <div data-season-slot="play" />
      </main>
      <BlocoGame locale="pt" edition={edition} />
    </>,
  )
  await act(async () => {})
  return view
}

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
  vi.restoreAllMocks()
  Reflect.deleteProperty(navigator, 'clipboard')
})

it('invites the visitor with an empty banner', async () => {
  await renderGame()
  const game = document.querySelector('[data-season-slot="play"] [data-bloco-game]')
  expect(game).toHaveAttribute('data-no-fireworks')
  expect(screen.getByRole('heading', { name: 'Batize seu bloco' })).toBeInTheDocument()
  expect(screen.getByText('?')).toBeInTheDocument()
  expect(screen.queryByRole('button', { name: 'Compartilhar' })).toBeNull()
})

it('draws a name, sews it on the banner, announces and keeps it', async () => {
  vi.spyOn(Math, 'random').mockReturnValue(0)
  await renderGame()
  fireEvent.click(screen.getByRole('button', { name: 'Sortear nome' }))
  expect(screen.getAllByText('Unidos do Merge Conflict').length).toBeGreaterThan(0)
  expect(screen.getByRole('status')).toHaveTextContent('Seu bloco: Unidos do Merge Conflict')
  expect(localStorage.getItem('season-bloco:carnaval-2027')).toBe('0')
  expect(playBatucada).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-bloco', { season: 'carnaval', found: 0 })

  // Another draw never repeats the banner.
  fireEvent.click(screen.getByRole('button', { name: 'Sortear outro' }))
  expect(localStorage.getItem('season-bloco:carnaval-2027')).not.toBe('0')
})

it('shows the saved name after a reload', async () => {
  localStorage.setItem('season-bloco:carnaval-2027', '1')
  await renderGame()
  expect(screen.getAllByText('Bloco Deploy na Sexta').length).toBeGreaterThan(0)
})

it('copies the link to share the bloco', async () => {
  localStorage.setItem('season-bloco:carnaval-2027', '1')
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  await renderGame()
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
  })
  expect(writeText).toHaveBeenCalled()
  expect(screen.getByText('Link copiado')).toBeInTheDocument()
})
