import { act, fireEvent, render, screen } from '@testing-library/react'
import { track } from '@/shared/lib/analytics/track'
import { blockStorage } from '@/tests/mocks/storage'
import { getProgramadorCopy } from '../programador-copy'
import { playHit, playKey } from '../programador-sound'
import { ReviewGame } from '../review-game'

vi.mock('@/shared/lib/analytics/track', () => ({ track: vi.fn() }))
vi.mock('../programador-sound', () => ({
  playHit: vi.fn(() => () => {}),
  playKey: vi.fn(() => () => {}),
}))

const PRS = getProgramadorCopy('pt').prs

async function renderGame({ onComplete = () => {}, onReopen = () => {} } = {}) {
  const view = render(
    <>
      <main>
        <div data-season-slot="play" />
      </main>
      <ReviewGame locale="pt" edition={2027} onComplete={onComplete} onReopen={onReopen} />
    </>,
  )
  await act(async () => {})
  return view
}

const lines = () => screen.queryAllByRole('button', { name: /^Linha \d+(, ok|, bug)?: / })
const bugLine = (pr: number) => lines()[PRS[pr].bug]
const cleanLine = (pr: number) => lines()[PRS[pr].bug === 0 ? 1 : 0]

afterEach(() => {
  localStorage.clear()
  vi.clearAllMocks()
})

it('shows the first PR, every line a real button named by its number and code', async () => {
  await renderGame()
  expect(document.querySelector('[data-season-slot="play"] [data-review]')).toHaveAttribute(
    'data-no-season-click',
  )
  expect(screen.getByRole('heading', { name: 'PR 1 de 5: Pega o último item' })).toBeVisible()
  expect(lines()).toHaveLength(PRS[0].lines.length)
  expect(
    screen.getByRole('button', { name: 'Linha 2: return items[items.length]' }),
  ).toBeInTheDocument()
  expect(screen.getByText('0 de 5 PRs revisados')).toBeInTheDocument()
})

it('says a clean line is fine and lets the visitor try again', async () => {
  await renderGame()
  fireEvent.click(cleanLine(0))
  expect(screen.getByRole('status')).toHaveTextContent('A linha 1 está ok. Procure o bug.')
  expect(cleanLine(0)).toHaveAttribute('data-state', 'ok')
  expect(cleanLine(0)).toHaveAccessibleName('Linha 1, ok: function last(items) {')
  expect(playKey).toHaveBeenCalledTimes(1)
  expect(screen.queryByRole('button', { name: 'Próximo PR' })).toBeNull()
  expect(localStorage.getItem('season-review:programador-2027')).toBeNull()
})

it('finds the bug: explains it, saves, records, chimes and moves focus to the next PR', async () => {
  await renderGame()
  bugLine(0).focus()
  fireEvent.click(bugLine(0))
  expect(screen.getByRole('status')).toHaveTextContent('Bug achado na linha 2.')
  expect(screen.getByText(PRS[0].why)).toBeInTheDocument()
  expect(bugLine(0)).toHaveAttribute('data-state', 'bug')
  expect(bugLine(0)).toHaveAccessibleName('Linha 2, bug: return items[items.length]')
  expect(screen.getByText('1 de 5 PRs revisados')).toBeInTheDocument()
  expect(localStorage.getItem('season-review:programador-2027')).toBe('1')
  expect(track).toHaveBeenCalledWith('season-gift', {
    season: 'programador',
    gift: 'pr-1',
    found: 1,
  })
  expect(playHit).toHaveBeenCalledTimes(1)
  const next = screen.getByRole('button', { name: 'Próximo PR' })
  expect(next).toHaveFocus()
  expect(next).toHaveAccessibleDescription(PRS[0].why)

  // Lines wait once the bug is found: another click changes nothing.
  fireEvent.click(cleanLine(0))
  expect(track).toHaveBeenCalledTimes(1)
  expect(cleanLine(0)).not.toHaveAttribute('data-state')
  expect(screen.getByRole('status')).toHaveTextContent('Bug achado na linha 2.')

  fireEvent.click(next)
  expect(screen.getByRole('heading', { name: 'PR 2 de 5: Só admin edita' })).toBeVisible()
  expect(lines()[0]).toHaveFocus()
  expect(screen.getByRole('status')).toHaveTextContent('PR 2 de 5: Só admin edita')
})

it('starts each PR with clean marks', async () => {
  await renderGame()
  fireEvent.click(lines()[0])
  expect(lines()[0]).toHaveAttribute('data-state', 'ok')
  fireEvent.click(bugLine(0))
  fireEvent.click(screen.getByRole('button', { name: 'Próximo PR' }))
  expect(lines()[0]).not.toHaveAttribute('data-state')
})

it('opens the approval at the fifth bug, from the approval button, and records it once', async () => {
  const onComplete = vi.fn()
  const onReopen = vi.fn()
  await renderGame({ onComplete, onReopen })
  for (let pr = 0; pr < 5; pr++) {
    fireEvent.click(bugLine(pr))
    if (pr < 4) fireEvent.click(screen.getByRole('button', { name: 'Próximo PR' }))
  }
  const approve = screen.getByRole('button', { name: 'Ver aprovação' })
  expect(approve).toHaveFocus()
  expect(onComplete).toHaveBeenCalledTimes(1)
  const completions = vi
    .mocked(track)
    .mock.calls.filter(([name]) => name === 'season-hunt-complete')
  expect(completions).toEqual([['season-hunt-complete', { season: 'programador' }]])
  fireEvent.click(approve)
  expect(onReopen).toHaveBeenCalledTimes(1)
})

it('picks up where the visitor left off in the same edition', async () => {
  localStorage.setItem('season-review:programador-2027', '3')
  await renderGame()
  expect(screen.getByRole('heading', { name: 'PR 4 de 5: Maior nota' })).toBeVisible()
  expect(screen.getByText('3 de 5 PRs revisados')).toBeInTheDocument()
})

it('offers the approval again after a finished review', async () => {
  const onReopen = vi.fn()
  localStorage.setItem('season-review:programador-2027', '5')
  await renderGame({ onReopen })
  expect(lines()).toHaveLength(0)
  expect(screen.getByText('5 de 5 PRs revisados')).toBeInTheDocument()
  expect(screen.getByText('Os 5 PRs estão revisados. Bom trabalho!')).toBeInTheDocument()
  expect(screen.queryByText(/toque nela/)).toBeNull()
  fireEvent.click(screen.getByRole('button', { name: 'Ver aprovação' }))
  expect(onReopen).toHaveBeenCalledTimes(1)
})

it('names each line it checks, so a second clean line is announced too', async () => {
  await renderGame()
  fireEvent.click(lines()[0])
  expect(screen.getByRole('status')).toHaveTextContent('A linha 1 está ok.')
  fireEvent.click(lines()[2])
  expect(screen.getByRole('status')).toHaveTextContent('A linha 3 está ok.')
})

it('never moves back the progress another tab saved, nor counts its PRs again', async () => {
  await renderGame()
  // Meanwhile, the visitor finished the review in another tab.
  localStorage.setItem('season-review:programador-2027', '5')
  fireEvent.click(bugLine(0))
  expect(localStorage.getItem('season-review:programador-2027')).toBe('5')
  expect(track).not.toHaveBeenCalledWith('season-gift', expect.anything())
  expect(screen.getByRole('status')).toHaveTextContent('Bug achado na linha 2.')
})

it('plays from the first PR with blocked or corrupt storage', async () => {
  localStorage.setItem('season-review:programador-2027', '{"pr":3}')
  await renderGame()
  expect(screen.getByRole('heading', { name: 'PR 1 de 5: Pega o último item' })).toBeVisible()
})

it('still plays, for this visit, without storage', async () => {
  blockStorage()
  await renderGame()
  fireEvent.click(bugLine(0))
  expect(screen.getByText('1 de 5 PRs revisados')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'Próximo PR' }))
  expect(screen.getByRole('heading', { name: 'PR 2 de 5: Só admin edita' })).toBeVisible()
})
