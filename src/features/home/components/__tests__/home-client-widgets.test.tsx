import { useChat } from '@/shared/store/use-chat/use-chat'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'
import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { HomeClientWidgets } from '../home-client-widgets'

vi.mock('@/shared/components/ui/command-menu/command-menu', () => ({
  CommandMenu: () => <div data-testid="command-menu" />,
}))

vi.mock('@/shared/components/ui/chat-widget/chat-widget', () => ({
  ChatWidget: () => <div data-testid="chat-widget" />,
}))

describe('HomeClientWidgets', () => {
  beforeEach(() => {
    useCommandMenu.setState({ isOpen: false })
    useChat.setState({ isOpen: false })
  })

  it('shows the chat avatar before the chat widget bundle is loaded', () => {
    render(<HomeClientWidgets />)

    const launcher = screen.getByRole('button', { name: 'fabTooltip' })
    const avatar = screen.getByAltText('Rani')

    expect(launcher).toContainElement(avatar)
    expect(avatar).toHaveAttribute('src', '/images/avatar.webp')
    expect(screen.queryByText('R')).not.toBeInTheDocument()
  })

  it('does not clip the chat online indicator', () => {
    render(<HomeClientWidgets />)

    const launcher = screen.getByRole('button', { name: 'fabTooltip' })

    expect(launcher).not.toHaveClass('overflow-hidden')
  })

  it('defers heavy widgets until the command menu is requested', async () => {
    render(<HomeClientWidgets />)

    expect(screen.queryByTestId('command-menu')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    })

    expect(await screen.findByTestId('command-menu')).toBeInTheDocument()
    expect(screen.getByTestId('chat-widget')).toBeInTheDocument()
    expect(useCommandMenu.getState().isOpen).toBe(true)
  })
})
