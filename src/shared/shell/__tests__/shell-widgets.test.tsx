import { useChat } from '@/shared/store/use-chat/use-chat'
import { captureIntersection, installFrameStub } from '@/tests/mocks/canvas'
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

describe('VegaLauncher keeps out of the way', () => {
  const originalObserver = window.IntersectionObserver
  let frames: ReturnType<typeof installFrameStub>

  const scrollTo = (y: number) => {
    Object.defineProperty(window, 'scrollY', { value: y, configurable: true })
    fireEvent.scroll(window)
    act(() => frames.flush())
  }

  beforeEach(() => {
    frames = installFrameStub()
    Object.defineProperty(document.documentElement, 'scrollHeight', {
      value: 5000,
      configurable: true,
    })
    Object.defineProperty(window, 'scrollY', { value: 0, configurable: true })
  })
  afterEach(() => {
    vi.restoreAllMocks()
    window.IntersectionObserver = originalObserver
  })

  it('hides going down past 120 px and comes back going up', () => {
    render(<VegaLauncher label="Falar com a Vega" />)
    const button = screen.getByRole('button', { name: 'Falar com a Vega' })
    expect(button).toHaveAttribute('data-hidden', 'false')
    scrollTo(100)
    expect(button).toHaveAttribute('data-hidden', 'false')
    scrollTo(400)
    expect(button).toHaveAttribute('data-hidden', 'true')
    scrollTo(300)
    expect(button).toHaveAttribute('data-hidden', 'false')
  })

  it('comes back at the end of the page', () => {
    render(<VegaLauncher label="Falar com a Vega" />)
    const button = screen.getByRole('button', { name: 'Falar com a Vega' })
    scrollTo(1000)
    expect(button).toHaveAttribute('data-hidden', 'true')
    scrollTo(4300)
    expect(button).toHaveAttribute('data-hidden', 'false')
  })

  it('stays hidden while the hero Vega button is on screen', () => {
    const io = captureIntersection()
    render(
      <>
        <button type="button" data-vega-cta>
          Pergunte
        </button>
        <VegaLauncher label="Falar com a Vega" />
      </>,
    )
    const button = screen.getByRole('button', { name: 'Falar com a Vega' })
    act(() => io.setVisible(true))
    expect(button).toHaveAttribute('data-hidden', 'true')
    act(() => io.setVisible(false))
    expect(button).toHaveAttribute('data-hidden', 'false')
  })

  it('shows itself while it has keyboard focus', () => {
    render(<VegaLauncher label="Falar com a Vega" />)
    const button = screen.getByRole('button', { name: 'Falar com a Vega' })
    scrollTo(1000)
    act(() => button.focus())
    expect(button).toHaveAttribute('data-hidden', 'false')
  })
})
