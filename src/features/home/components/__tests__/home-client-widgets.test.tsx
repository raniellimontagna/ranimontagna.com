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
    expect(avatar).toHaveAttribute('src', '/images/avatar-112.webp')
    expect(screen.queryByText('R')).not.toBeInTheDocument()
  })

  it('does not clip the chat online indicator', () => {
    render(<HomeClientWidgets />)

    const launcher = screen.getByRole('button', { name: 'fabTooltip' })

    expect(launcher).not.toHaveClass('overflow-hidden')
  })

  it('loads only the command menu when the command shortcut is requested', async () => {
    render(<HomeClientWidgets />)

    expect(screen.queryByTestId('command-menu')).not.toBeInTheDocument()
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    })

    expect(await screen.findByTestId('command-menu')).toBeInTheDocument()
    expect(screen.queryByTestId('chat-widget')).not.toBeInTheDocument()
    expect(useCommandMenu.getState().isOpen).toBe(true)
  })

  it('loads only chat when the launcher is requested', async () => {
    render(<HomeClientWidgets />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'fabTooltip' }))
    })

    expect(await screen.findByTestId('chat-widget')).toBeInTheDocument()
    expect(screen.queryByTestId('command-menu')).not.toBeInTheDocument()
    expect(useChat.getState().isOpen).toBe(true)
  })
})
