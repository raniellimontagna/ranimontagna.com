import { ChatWidget } from '@/shared/components/ui/chat-widget/chat-widget'
import { useChat } from '@/shared/store/use-chat/use-chat'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { HomeClientWidgets } from '../home-client-widgets'

vi.mock('@/shared/components/animations/progressive-gsap-animations', () => ({
  ProgressiveGsapAnimations: () => null,
}))

describe('HomeClientWidgets chat focus integration', () => {
  beforeEach(() => {
    useChat.setState({ isOpen: false })
  })

  it('restores focus to the stable launcher after the lazy dialog closes', async () => {
    const loadChatWidget = vi.fn().mockResolvedValue(ChatWidget)

    render(<HomeClientWidgets loadChatWidget={loadChatWidget} />)

    const lazyLauncher = screen.getByRole('button', { name: 'fabTooltip' })
    expect(lazyLauncher).toHaveAttribute('data-chat-launcher')

    await act(async () => {
      fireEvent.click(lazyLauncher)
    })

    expect(await screen.findByRole('dialog', { name: 'title' })).toBeInTheDocument()
    expect(loadChatWidget).toHaveBeenCalledTimes(1)
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    await waitFor(() => {
      const restoredLauncher = screen.getByRole('button', { name: 'fabTooltip' })
      expect(restoredLauncher).toHaveAttribute('data-chat-launcher')
      expect(restoredLauncher).toHaveFocus()
    })
  })
})
