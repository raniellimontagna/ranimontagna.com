import { act, fireEvent, render, screen } from '@testing-library/react'
import { playAuldLangSyne } from '../reveillon-sound'
import { WishesCard } from '../wishes-card'

vi.mock('../reveillon-sound', () => ({ playAuldLangSyne: vi.fn(() => () => {}) }))

const showModal = vi.fn(function (this: HTMLDialogElement) {
  this.setAttribute('open', '')
})
const close = vi.fn(function (this: HTMLDialogElement) {
  this.removeAttribute('open')
})

beforeEach(() => {
  Object.assign(HTMLDialogElement.prototype, { showModal, close })
})

afterEach(() => {
  vi.clearAllMocks()
  Reflect.deleteProperty(navigator, 'share')
  Reflect.deleteProperty(navigator, 'clipboard')
})

it('opens as a modal card with the seven wishes for the coming year', () => {
  render(<WishesCard open onClose={() => {}} locale="pt" edition={2026} />)
  const dialog = screen.getByRole('dialog', { name: 'Feliz 2027!' })
  expect(dialog.tagName).toBe('DIALOG')
  expect(showModal).toHaveBeenCalled()
  expect(screen.getAllByRole('listitem')).toHaveLength(7)
  expect(playAuldLangSyne).toHaveBeenCalledTimes(1)
})

it('closes on Esc or the close button', () => {
  const onClose = vi.fn()
  render(<WishesCard open onClose={onClose} locale="en" edition={2026} />)
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  expect(cancel.defaultPrevented).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Close' }))
  expect(onClose).toHaveBeenCalledTimes(2)
})

it('copies the link when there is no share sheet', async () => {
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<WishesCard open onClose={() => {}} locale="pt" edition={2026} />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
  })
  expect(writeText).toHaveBeenCalled()
  expect(screen.getByText('Link copiado')).toBeInTheDocument()
})

it('renders nothing while closed', () => {
  render(<WishesCard open={false} onClose={() => {}} locale="pt" edition={2026} />)
  expect(screen.queryByRole('dialog')).toBeNull()
})
