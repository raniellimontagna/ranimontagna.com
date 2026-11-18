import { act, fireEvent, render, screen } from '@testing-library/react'
import { EasterCard } from '../easter-card'
import { playChimes } from '../pascoa-sound'

vi.mock('../pascoa-sound', () => ({ playChimes: vi.fn(() => () => {}) }))

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

it('opens as a modal with the chocolate egg and the card, chiming', () => {
  render(<EasterCard open onClose={() => {}} locale="pt" />)
  expect(screen.getByRole('dialog', { name: 'Feliz Páscoa!' }).tagName).toBe('DIALOG')
  expect(screen.getByRole('img', { name: /ovo de chocolate aberto/i })).toBeInTheDocument()
  expect(playChimes).toHaveBeenCalledTimes(1)
})

it('closes on Esc and on the close button', () => {
  const onClose = vi.fn()
  render(<EasterCard open onClose={onClose} locale="es" />)
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  expect(cancel.defaultPrevented).toBe(true)
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
  expect(onClose).toHaveBeenCalledTimes(2)
})

it('copies the link when there is no share sheet', async () => {
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<EasterCard open onClose={() => {}} locale="pt" />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Compartilhar' }))
  })
  expect(screen.getByText('Link copiado')).toBeInTheDocument()
})

it('renders nothing while closed', () => {
  render(<EasterCard open={false} onClose={() => {}} locale="pt" />)
  expect(screen.queryByRole('dialog')).toBeNull()
})
