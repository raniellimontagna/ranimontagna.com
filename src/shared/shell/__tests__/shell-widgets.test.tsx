import { useChat } from '@/shared/store/use-chat/use-chat'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { AltairLauncher } from '../altair-launcher'
import { ShellWidgets } from '../shell-widgets'

describe('Altair entry points', () => {
  beforeEach(() => useChat.setState({ isOpen: false }))

  it('the star and ⌘K both dispatch altair:open', () => {
    const spy = vi.fn()
    window.addEventListener('altair:open', spy)
    render(<AltairLauncher label="Pergunte ao Altair" />)
    render(<ShellWidgets loadChatWidget={vi.fn().mockResolvedValue(() => null)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Pergunte ao Altair' }))
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(spy).toHaveBeenCalledTimes(3)
    window.removeEventListener('altair:open', spy)
  })

  it('opens the chat when altair:open fires', async () => {
    const loadChatWidget = vi.fn().mockResolvedValue(() => null)
    render(<ShellWidgets loadChatWidget={loadChatWidget} />)
    act(() => {
      window.dispatchEvent(new Event('altair:open'))
    })
    await waitFor(() => expect(loadChatWidget).toHaveBeenCalledTimes(1))
    expect(useChat.getState().isOpen).toBe(true)
  })

  it('the star is where focus returns after the chat closes', () => {
    render(<AltairLauncher label="Pergunte ao Altair" />)
    expect(screen.getByRole('button', { name: 'Pergunte ao Altair' })).toHaveAttribute(
      'data-chat-launcher',
    )
  })
})
