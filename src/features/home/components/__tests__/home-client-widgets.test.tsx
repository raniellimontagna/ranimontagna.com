import { useChat } from '@/shared/store/use-chat/use-chat'
import { useCommandMenu } from '@/shared/store/use-command-menu/use-command-menu'
import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { HomeClientWidgets } from '../home-client-widgets'

const TestCommandMenu = () => <div role="dialog" aria-label="Command palette" />
const TestChatWidget = () => <div role="dialog" aria-label="Chat widget" />

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
    const loadCommandMenu = vi.fn().mockResolvedValue(TestCommandMenu)
    const loadChatWidget = vi.fn().mockResolvedValue(TestChatWidget)

    render(<HomeClientWidgets loadCommandMenu={loadCommandMenu} loadChatWidget={loadChatWidget} />)

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

    await act(async () => {
      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    })

    expect(await screen.findByRole('dialog', { name: 'Command palette' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Chat widget' })).not.toBeInTheDocument()
    expect(loadCommandMenu).toHaveBeenCalledTimes(1)
    expect(loadChatWidget).not.toHaveBeenCalled()
    expect(useCommandMenu.getState().isOpen).toBe(true)
  })

  it('loads only chat when the launcher is requested', async () => {
    const loadCommandMenu = vi.fn().mockResolvedValue(TestCommandMenu)
    const loadChatWidget = vi.fn().mockResolvedValue(TestChatWidget)

    render(<HomeClientWidgets loadCommandMenu={loadCommandMenu} loadChatWidget={loadChatWidget} />)

    await act(async () => {
      fireEvent.click(screen.getByRole('button', { name: 'fabTooltip' }))
    })

    expect(await screen.findByRole('dialog', { name: 'Chat widget' })).toBeInTheDocument()
    expect(screen.queryByRole('dialog', { name: 'Command palette' })).not.toBeInTheDocument()
    expect(loadChatWidget).toHaveBeenCalledTimes(1)
    expect(loadCommandMenu).not.toHaveBeenCalled()
    expect(useChat.getState().isOpen).toBe(true)
  })
})
