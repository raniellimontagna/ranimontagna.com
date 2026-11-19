import { fireEvent, render, screen } from '@testing-library/react'
import { useSeason } from '@/shared/store/use-season/use-season'
import { ProgramadorLayer } from '../programador-layer'

vi.mock('../tokens-canvas', () => ({ TokensCanvas: () => <p>tokens</p> }))
vi.mock('../highlight-name', () => ({ HighlightName: () => <p>name</p> }))
vi.mock('../footer-countdown', () => ({
  FooterCountdown: ({ edition }: { edition: number }) => <p>countdown {edition}</p>,
}))
vi.mock('../review-game', () => ({
  ReviewGame: ({ onComplete, edition }: { onComplete: () => void; edition: number }) => (
    <button type="button" onClick={onComplete}>
      fifth bug {edition}
    </button>
  ),
}))
vi.mock('../lgtm-card', () => ({
  LgtmCard: ({ open, onClose }: { open: boolean; onClose: () => void }) =>
    open ? (
      <div role="dialog">
        <button type="button" onClick={onClose}>
          close
        </button>
      </div>
    ) : null,
}))

afterEach(() => {
  useSeason.setState({ active: null, current: null, edition: null })
})

it('brings the tokens, the name, the countdown and the review, and the approval', () => {
  useSeason.setState({ active: 'programador', current: 'programador', edition: 2027 })
  render(<ProgramadorLayer locale="pt" />)
  expect(screen.getByText('tokens')).toBeInTheDocument()
  expect(screen.getByText('name')).toBeInTheDocument()
  expect(screen.getByText('countdown 2027')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'fifth bug 2027' }))
  expect(screen.getByRole('dialog')).toBeInTheDocument()
  fireEvent.click(screen.getByRole('button', { name: 'close' }))
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('works out the edition when the store has none (a preview before init)', () => {
  vi.useFakeTimers({ toFake: ['Date'] })
  vi.setSystemTime(new Date(2028, 8, 10, 12))
  render(<ProgramadorLayer locale="pt" />)
  expect(screen.getByText('countdown 2028')).toBeInTheDocument()
  vi.useRealTimers()
})
