import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { ChatContactForm } from '../chat-contact-form'

const sendContactEmail = vi.hoisted(() => vi.fn())

vi.mock('@/shared/services/formly-email-service', () => ({ sendContactEmail }))

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string, values?: Record<string, string>) =>
      values ? `${key}:${Object.values(values).join(',')}` : key
    return t
  },
}))

const fill = (label: string, value: string) => {
  fireEvent.change(screen.getByPlaceholderText(label), { target: { value } })
}

describe('ChatContactForm', () => {
  beforeEach(() => {
    sendContactEmail.mockReset()
    sendContactEmail.mockResolvedValue({ success: true })
  })

  it('prefills the message with the last visitor question', () => {
    render(<ChatContactForm draft="quero um app de pedidos" onCancel={vi.fn()} />)

    expect(screen.getByPlaceholderText('message')).toHaveValue('quero um app de pedidos')
  })

  it('blocks submission until the payload is valid', async () => {
    render(<ChatContactForm onCancel={vi.fn()} />)

    fill('name', 'A')
    fill('email', 'not-an-email')
    fill('message', 'short')
    fireEvent.submit(screen.getByTestId('chat-contact-form'))

    expect(await screen.findByRole('alert')).toHaveTextContent('invalid')
    expect(sendContactEmail).not.toHaveBeenCalled()
  })

  it('sends a valid message through the contact API and confirms it', async () => {
    render(<ChatContactForm onCancel={vi.fn()} />)

    fill('name', 'Maria Andrade')
    fill('email', 'maria@empresa.com.br')
    fill('message', 'Preciso de um app de pedidos integrado ao WhatsApp.')
    fireEvent.submit(screen.getByTestId('chat-contact-form'))

    await waitFor(() => expect(sendContactEmail).toHaveBeenCalledTimes(1))
    expect(sendContactEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        email: 'maria@empresa.com.br',
        name: 'Maria Andrade',
        subject: 'subject:Maria Andrade',
        website: '',
      }),
    )
    expect(await screen.findByTestId('chat-contact-success')).toBeInTheDocument()
  })

  it('keeps the form open and warns when the provider fails', async () => {
    sendContactEmail.mockRejectedValueOnce(new Error('nope'))
    render(<ChatContactForm onCancel={vi.fn()} />)

    fill('name', 'Maria Andrade')
    fill('email', 'maria@empresa.com.br')
    fill('message', 'Preciso de um app de pedidos integrado ao WhatsApp.')
    fireEvent.submit(screen.getByTestId('chat-contact-form'))

    expect(await screen.findByRole('alert')).toHaveTextContent('error')
    expect(screen.getByTestId('chat-contact-form')).toBeInTheDocument()
  })
})
