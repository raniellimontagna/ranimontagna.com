import { fireEvent, render, screen } from '@/tests/test-utils'
import { Input, Textarea } from '../input'

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Username" id="username" />)
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Username/ })).toHaveAttribute('id', 'username')
  })

  it('renders with placeholder', () => {
    // Needs id for label association if testing by label, but here asking for placeholder text.
    // However, best practice to provide id.
    render(<Input label="Email" id="email" placeholder="Enter email" />)
    expect(screen.getByPlaceholderText('Enter email')).toBeInTheDocument()
  })

  it('shows error message', () => {
    render(
      <Input
        label="Password"
        id="password"
        error="Too short"
        helpText="Use at least eight characters"
        aria-describedby="password-requirements"
      />,
    )
    const error = screen.getByText('Too short')
    const help = screen.getByText('Use at least eight characters')
    expect(error).toHaveAttribute('id', 'password-error')
    expect(help).toHaveAttribute('id', 'password-help')
    const input = screen.getByLabelText(/Password/)
    expect(input).toHaveClass('border-red-300')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute(
      'aria-describedby',
      'password-requirements password-help password-error',
    )
  })

  it('handles focus/blur events', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(<Input label="Search" id="search" onFocus={onFocus} onBlur={onBlur} />)

    const input = screen.getByLabelText(/Search/)

    fireEvent.focus(input)
    expect(onFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(onBlur).toHaveBeenCalled()
  })
})

describe('Textarea Component', () => {
  it('renders correctly with label', () => {
    render(<Textarea label="Message" id="msg" />)
    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /Message/ })).toHaveAttribute('id', 'msg')
  })

  it('shows error state', () => {
    render(<Textarea label="Notes" id="notes" error="Required field" />)
    expect(screen.getByText('Required field')).toHaveAttribute('id', 'notes-error')
    const area = screen.getByLabelText(/Notes/)
    expect(area).toHaveClass('border-red-300')
    expect(area).toHaveAttribute('aria-invalid', 'true')
    expect(area).toHaveAttribute('aria-describedby', 'notes-error')
  })

  it('handles focus/blur events', () => {
    const onFocus = vi.fn()
    const onBlur = vi.fn()
    render(<Textarea label="Description" id="desc" onFocus={onFocus} onBlur={onBlur} />)

    const textarea = screen.getByLabelText(/Description/)

    fireEvent.focus(textarea)
    expect(onFocus).toHaveBeenCalled()

    fireEvent.blur(textarea)
    expect(onBlur).toHaveBeenCalled()
  })
})
