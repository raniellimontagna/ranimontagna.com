import { fireEvent, render, screen } from '@/tests/test-utils'
import { Input, Textarea } from '../input'

describe('Input Component', () => {
  it('renders correctly with label', () => {
    render(<Input label="Username" name="username" />)

    // Use regex to match parts of the label as it includes a decorative span
    expect(screen.getByLabelText(/Username/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /username/i })).toBeInTheDocument()
  })

  it('displays error message', () => {
    render(<Input label="Email" error="Invalid email" />)

    expect(screen.getByText('Invalid email')).toBeInTheDocument()
    // Input should usually have aria-invalid or some indicator, but checking class might be brittle
    // Checking if the error text exists is good enough for now
  })

  it('handles changes', () => {
    const handleChange = vi.fn()
    render(<Input label="Name" onChange={handleChange} />)

    // Explicitly select input by role instead of label which is tricky
    const input = screen.getByRole('textbox')
    fireEvent.change(input, { target: { value: 'John' } })

    expect(handleChange).toHaveBeenCalled()
  })

  it('handles focus/blur states (visual check via classes mostly, but event firing)', () => {
    const handleFocus = vi.fn()
    const handleBlur = vi.fn()
    render(<Input label="Focus Test" onFocus={handleFocus} onBlur={handleBlur} />)

    const input = screen.getByRole('textbox')
    fireEvent.focus(input)
    expect(handleFocus).toHaveBeenCalled()

    fireEvent.blur(input)
    expect(handleBlur).toHaveBeenCalled()
  })
})

describe('Textarea Component', () => {
  it('renders correctly with label', () => {
    render(<Textarea label="Message" name="message" />)

    expect(screen.getByLabelText(/Message/)).toBeInTheDocument()
    expect(screen.getByRole('textbox', { name: /message/i })).toBeInTheDocument()
    expect(screen.getByRole('textbox').tagName).toBe('TEXTAREA')
  })

  it('displays error message', () => {
    render(<Textarea label="Bio" error="Too short" />)
    expect(screen.getByText('Too short')).toBeInTheDocument()
  })
})
