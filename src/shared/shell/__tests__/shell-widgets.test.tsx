import { useChat } from '@/shared/store/use-chat/use-chat'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { ShellWidgets } from '../shell-widgets'
import { VegaLauncher } from '../vega-launcher'

describe('Vega entry points', () => {
  beforeEach(() => useChat.setState({ isOpen: false }))

  it('the launcher and ⌘K both dispatch vega:open', () => {
    const spy = vi.fn()
    window.addEventListener('vega:open', spy)
    render(<VegaLauncher label="Falar com a Vega" />)
    render(<ShellWidgets loadVega={vi.fn().mockResolvedValue(() => null)} />)
    fireEvent.click(screen.getByRole('button', { name: 'Falar com a Vega' }))
    fireEvent.keyDown(document, { key: 'k', metaKey: true })
    fireEvent.keyDown(document, { key: 'k', ctrlKey: true })
    expect(spy).toHaveBeenCalledTimes(3)
    window.removeEventListener('vega:open', spy)
  })

  it('opens Vega when vega:open fires', async () => {
    const loadVega = vi.fn().mockResolvedValue(() => null)
    render(<ShellWidgets loadVega={loadVega} />)
    act(() => {
      window.dispatchEvent(new Event('vega:open'))
    })
    await waitFor(() => expect(loadVega).toHaveBeenCalledTimes(1))
    expect(useChat.getState().isOpen).toBe(true)
  })

  it('the launcher shows the Vega mark and is where focus returns', () => {
    render(<VegaLauncher label="Falar com a Vega" />)
    const button = screen.getByRole('button', { name: 'Falar com a Vega' })
    expect(button).toHaveAttribute('data-chat-launcher')
    expect(button.querySelector('canvas')).not.toBeNull()
  })
})
