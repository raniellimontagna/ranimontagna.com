import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { installFrameStub, mockCanvas2d } from '@/tests/mocks/canvas'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { playSplash } from '../reveillon-sound'
import { WavesGame, withAlpha } from '../waves-game'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../reveillon-sound', () => ({ playSplash: vi.fn(() => () => {}) }))

const originalMatchMedia = window.matchMedia

function Page({
  onComplete = () => {},
  onReopen = () => {},
}: {
  onComplete?: () => void
  onReopen?: () => void
}) {
  return (
    <>
      <main>
        <div data-season-slot="play" />
      </main>
      <WavesGame locale="pt" edition={2026} onComplete={onComplete} onReopen={onReopen} />
    </>
  )
}

async function renderGame(props: { onComplete?: () => void; onReopen?: () => void } = {}) {
  render(<Page {...props} />)
  await act(async () => {})
}

const jumpButton = () => screen.getByRole('button', { name: 'Pular' })

beforeEach(() => {
  mockCanvas2d({ width: 800, height: 144 })
})

afterEach(() => {
  window.matchMedia = originalMatchMedia
  localStorage.clear()
  vi.mocked(track).mockClear()
  vi.mocked(playSplash).mockClear()
  vi.restoreAllMocks()
})

it('stages the game at the end of the home page, with a real Jump button', async () => {
  await renderGame()
  const game = document.querySelector('[data-season-slot="play"] [data-waves-game]')
  expect(game).toHaveAttribute('data-no-fireworks')
  expect(screen.getByRole('heading', { name: 'Pule as 7 ondas' })).toBeInTheDocument()
  expect(jumpButton()).toBeInTheDocument()
  expect(screen.getByText('0 de 7 ondas')).toBeInTheDocument()
})

it('with reduced motion, every jump clears a wave and names its wish', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  const onComplete = vi.fn()
  await renderGame({ onComplete })
  fireEvent.click(jumpButton())
  expect(screen.getByText('1 de 7 ondas')).toBeInTheDocument()
  expect(screen.getByRole('status')).toHaveTextContent('Onda 1 de 7: saúde')
  expect(playSplash).toHaveBeenCalledTimes(1)
  expect(localStorage.getItem('season-waves:reveillon-2026')).toBe('1')
  expect(track).toHaveBeenCalledWith('season-wave', { season: 'reveillon', found: 1 })

  for (let i = 0; i < 6; i++) fireEvent.click(jumpButton())
  expect(onComplete).toHaveBeenCalledTimes(1)
  expect(track).toHaveBeenCalledWith('season-hunt-complete', { season: 'reveillon' })
  expect(screen.getByRole('status')).toHaveTextContent('Você pulou as 7 ondas!')
  expect(screen.queryByRole('button', { name: 'Pular' })).toBeNull()
})

it('jumps on ArrowUp without scrolling the page, once per press', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  await renderGame()
  const event = new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true })
  act(() => {
    jumpButton().dispatchEvent(event)
  })
  expect(event.defaultPrevented).toBe(true)
  expect(screen.getByText('1 de 7 ondas')).toBeInTheDocument()
  // Holding the key repeats it: that is not seven jumps.
  const held = new KeyboardEvent('keydown', {
    key: 'ArrowUp',
    repeat: true,
    bubbles: true,
    cancelable: true,
  })
  act(() => {
    jumpButton().dispatchEvent(held)
  })
  expect(held.defaultPrevented).toBe(true)
  expect(screen.getByText('1 de 7 ondas')).toBeInTheDocument()
})

it('jumps on a tap on the sea, but a scroll that starts there is not a jump', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  await renderGame()
  const sea = document.querySelector('.reveillon-sea-stage') as HTMLElement
  fireEvent.pointerDown(sea)
  expect(screen.getByText('0 de 7 ondas')).toBeInTheDocument()
  fireEvent.click(sea)
  expect(screen.getByText('1 de 7 ondas')).toBeInTheDocument()
})

it('tells screen readers only the wishes already lit', async () => {
  mockMatchMedia({ '(prefers-reduced-motion: reduce)': true })
  localStorage.setItem('season-waves:reveillon-2026', '2')
  await renderGame()
  const list = screen.getByRole('list', { name: 'Seus pedidos' })
  const items = Array.from(list.querySelectorAll('li'))
  expect(items.filter((li) => li.getAttribute('aria-hidden') !== 'true')).toHaveLength(2)
  expect(items[0]).toHaveTextContent('saúde')
  expect(items[2]).toHaveAttribute('aria-hidden', 'true')
})

it('picks up where the visitor left off, and offers the card again once done', async () => {
  localStorage.setItem('season-waves:reveillon-2026', '7')
  const onReopen = vi.fn()
  await renderGame({ onReopen })
  fireEvent.click(screen.getByRole('button', { name: 'Ver seus pedidos' }))
  expect(onReopen).toHaveBeenCalled()
  expect(screen.getAllByText(/saúde|deploy sem susto/).length).toBeGreaterThan(0)
})

it('rolls the sea on screen, but keeps score only once the visitor jumps', async () => {
  mockMatchMedia({})
  const frames = installFrameStub()
  let clock = 0
  vi.spyOn(performance, 'now').mockImplementation(() => (clock += 16))
  await renderGame()
  expect(window.requestAnimationFrame).toHaveBeenCalled()
  act(() => frames.flush(400))
  expect(screen.getByRole('status')).toBeEmptyDOMElement()

  // Jumping at once lands long before the next wave arrives, which then gets away.
  fireEvent.click(jumpButton())
  act(() => frames.flush(400))
  expect(screen.getByRole('status')).toHaveTextContent('Essa passou. Vem outra!')
  expect(screen.getByText('0 de 7 ondas')).toBeInTheDocument()
})

it('adds alpha to token colours for the canvas, and leaves other colours alone', () => {
  expect(withAlpha('#d9e2ec', 0.25)).toBe('#d9e2ec40')
  expect(withAlpha('#d9e2ec', 0)).toBe('#d9e2ec00')
  expect(withAlpha('rgb(1 2 3)', 0.5)).toBe('rgb(1 2 3)')
})

it('reads the sea colours once, not on every frame', async () => {
  mockMatchMedia({})
  const frames = installFrameStub()
  await renderGame()
  const styles = vi.spyOn(window, 'getComputedStyle')
  act(() => frames.flush(10))
  expect(styles).not.toHaveBeenCalled()
})
