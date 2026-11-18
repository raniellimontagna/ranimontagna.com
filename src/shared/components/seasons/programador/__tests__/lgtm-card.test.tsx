import { act, fireEvent, render, screen } from '@testing-library/react'
import { LgtmCard } from '../lgtm-card'
import { playBuild } from '../programador-sound'

vi.mock('../programador-sound', () => ({ playBuild: vi.fn(() => () => {}) }))

beforeEach(() => {
  Object.assign(HTMLDialogElement.prototype, {
    showModal: vi.fn(function (this: HTMLDialogElement) {
      this.setAttribute('open', '')
    }),
    close: vi.fn(function (this: HTMLDialogElement) {
      this.removeAttribute('open')
    }),
  })
})

afterEach(() => {
  vi.clearAllMocks()
  Reflect.deleteProperty(navigator, 'clipboard')
})

it('opens as a modal card with the five fixes and the build arpeggio', () => {
  render(<LgtmCard open onClose={() => {}} locale="pt" />)
  expect(screen.getByRole('dialog', { name: 'LGTM: aprovado no code review' }).tagName).toBe(
    'DIALOG',
  )
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
  expect(screen.getByText('sort((a, b) => a - b)')).toBeInTheDocument()
  expect(playBuild).toHaveBeenCalledTimes(1)
})

it('stays closed until asked', () => {
  render(<LgtmCard open={false} onClose={() => {}} locale="pt" />)
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(playBuild).not.toHaveBeenCalled()
})

it('closes on Esc and the close button, and copies the text with the link', async () => {
  const onClose = vi.fn()
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<LgtmCard open onClose={onClose} locale="en" />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  })
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('all 5 bugs'))
  expect(screen.getByText('Link copied')).toBeInTheDocument()
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(onClose).toHaveBeenCalledTimes(2)
})
