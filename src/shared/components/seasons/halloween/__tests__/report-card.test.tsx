import { act, fireEvent, render, screen } from '@testing-library/react'
import { playCackle } from '../halloween-sound'
import { ReportCard } from '../report-card'

vi.mock('../halloween-sound', () => ({ playCackle: vi.fn(() => () => {}) }))

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

it('opens as a modal build report with zero bugs, cackling', () => {
  render(<ReportCard open onClose={() => {}} locale="pt" />)
  expect(screen.getByRole('dialog', { name: 'Zero bugs em produção' }).tagName).toBe('DIALOG')
  expect(screen.getAllByRole('listitem')).toHaveLength(3)
  expect(playCackle).toHaveBeenCalledTimes(1)
})

it('shares the text with the link and closes on Esc and the button', async () => {
  const onClose = vi.fn()
  const writeText = vi.fn(() => Promise.resolve())
  Object.defineProperty(navigator, 'clipboard', { configurable: true, value: { writeText } })
  render(<ReportCard open onClose={onClose} locale="es" />)
  await act(async () => {
    fireEvent.click(screen.getByRole('button', { name: 'Compartir' }))
  })
  expect(writeText).toHaveBeenCalledWith(expect.stringContaining('Cero bugs'))
  expect(screen.getByRole('status')).toHaveTextContent('Enlace copiado')
  const cancel = new Event('cancel', { cancelable: true })
  fireEvent(screen.getByRole('dialog'), cancel)
  fireEvent.click(screen.getByRole('button', { name: 'Cerrar' }))
  expect(onClose).toHaveBeenCalledTimes(2)
})
