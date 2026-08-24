import { render, screen } from '@/tests/test-utils'
import { ContactForm } from '../contactForm'
import type { useContactForm } from '../useContatoForm'

// Mock the hook
const mockRegister = vi.fn()
const mockHandleSubmit = vi.fn((fn) => fn)
const mockOnSubmit = vi.fn()
const mockT = Object.assign(
  vi.fn((key: string) => key),
  {
    rich: vi.fn((key: string) => key),
    markup: vi.fn((key: string) => key),
    raw: vi.fn((key: string) => key),
    has: vi.fn(() => true),
  },
)

vi.mock('../useContatoForm', () => ({
  useContactForm: vi.fn(),
}))

const { useContactForm: mockUseContactForm } = await import('../useContatoForm')

describe('ContactForm Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mockRegister.mockImplementation((name: string) => ({ name }))
    // biome-ignore lint/suspicious/noExplicitAny: Mock implementation
    mockHandleSubmit.mockImplementation((fn) => (e: any) => {
      e?.preventDefault()
      return fn()
    })
  })

  const defaultHookReturn: ReturnType<typeof useContactForm> = {
    // biome-ignore lint/suspicious/noExplicitAny: Translator type from next-intl has complex generics
    t: mockT as any,
    register: mockRegister,
    handleSubmit: mockHandleSubmit,
    errors: {},
    isSubmitting: false,
    submitStatus: 'idle',
    onSubmit: mockOnSubmit,
  }

  it('renders all form fields', () => {
    vi.mocked(mockUseContactForm).mockReturnValue(defaultHookReturn)

    render(<ContactForm />)

    expect(screen.getByTestId('contact-form')).toBeInTheDocument()
    expect(mockRegister).toHaveBeenCalledWith('name')
    expect(mockRegister).toHaveBeenCalledWith('email')
    expect(mockRegister).toHaveBeenCalledWith('subject')
    expect(mockRegister).toHaveBeenCalledWith('message')
    expect(mockRegister).toHaveBeenCalledWith('website')
    expect(screen.getByRole('textbox', { name: 'name.label' })).toHaveAttribute(
      'autocomplete',
      'name',
    )
    expect(screen.getByRole('textbox', { name: 'email.label' })).toHaveAttribute(
      'autocomplete',
      'email',
    )
  })

  it('displays submit button in idle state', () => {
    vi.mocked(mockUseContactForm).mockReturnValue(defaultHookReturn)

    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /send/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).not.toBeDisabled()
  })

  it('displays submit button in submitting state', () => {
    vi.mocked(mockUseContactForm).mockReturnValue({
      ...defaultHookReturn,
      isSubmitting: true,
    })

    render(<ContactForm />)

    const submitButton = screen.getByRole('button', { name: /sending/i })
    expect(submitButton).toBeInTheDocument()
    expect(submitButton).toBeDisabled()
  })

  it('displays success message when status is success', () => {
    vi.mocked(mockUseContactForm).mockReturnValue({
      ...defaultHookReturn,
      submitStatus: 'success',
    })

    render(<ContactForm />)

    const status = screen.getByRole('status')
    expect(status).toHaveTextContent('successTitle')
    expect(status).toHaveTextContent('success')
    expect(screen.queryByRole('alert')).not.toBeInTheDocument()
  })

  it('displays error message when status is error', () => {
    vi.mocked(mockUseContactForm).mockReturnValue({
      ...defaultHookReturn,
      submitStatus: 'error',
    })

    render(<ContactForm />)

    const alert = screen.getByRole('alert')
    expect(alert).toHaveTextContent('errorTitle')
    expect(alert).toHaveTextContent('error')
    expect(screen.queryByRole('status')).not.toBeInTheDocument()
  })

  it('displays validation errors', () => {
    vi.mocked(mockUseContactForm).mockReturnValue({
      ...defaultHookReturn,
      errors: {
        name: { type: 'required' },
        email: { type: 'email' },
      },
    })

    render(<ContactForm />)

    expect(mockT).toHaveBeenCalledWith('validation.name')
    expect(mockT).toHaveBeenCalledWith('validation.email')
    expect(screen.getByRole('textbox', { name: 'name.label' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByRole('textbox', { name: 'name.label' })).toHaveAttribute(
      'aria-describedby',
      'name-error',
    )
  })
})
