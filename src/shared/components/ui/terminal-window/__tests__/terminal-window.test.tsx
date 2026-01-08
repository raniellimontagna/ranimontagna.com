import { render, screen } from '@/tests/test-utils'
import { TerminalWindow } from '../terminal-window'

describe('TerminalWindow', () => {
  it('renders children correctly', () => {
    render(
      <TerminalWindow>
        <p>echo "Hello World"</p>
      </TerminalWindow>,
    )

    expect(screen.getByText('echo "Hello World"')).toBeInTheDocument()
  })

  it('renders title', () => {
    render(
      <TerminalWindow title="zsh">
        <p>Content</p>
      </TerminalWindow>,
    )

    expect(screen.getByText('zsh')).toBeInTheDocument()
  })

  it('renders default title if not provided', () => {
    render(
      <TerminalWindow>
        <p>Content</p>
      </TerminalWindow>,
    )

    expect(screen.getByText('bash')).toBeInTheDocument()
  })
})
