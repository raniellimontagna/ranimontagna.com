import { act, fireEvent, render, screen } from '@testing-library/react'
import { ArraiaCard } from '../arraia-card'
import { playForro } from '../junina-sound'

vi.mock('../junina-sound', () => ({ playForro: vi.fn(() => () => {}) }))

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

it('opens as a modal card with the five prizes and a forró phrase', () => {
  render(<ArraiaCard open onClose={() => {}} locale="pt" />)
  expect(screen.getByRole('dialog', { name: 'Arraiá do Ranielli' }).tagName).toBe('DIALOG')
  expect(screen.getAllByRole('listitem')).toHaveLength(5)
  expect(playForro).toHaveBeenCalledTimes(1)
})

it('closes on Esc and the close button, and copies the text with the link', async () => {
  const onClose = vi.fn()
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<ArraiaCard open onClose={onClose} locale="en" />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Share' }))
  })
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('all 5 fish'))
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(onClose).toHaveBeenCalledTimes(2)
})
