import type { ChatMessage, ChatState } from '@/shared/store/use-chat/use-chat.types'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { ChatWidget } from '../chat-widget'

type MockChatState = Pick<
  ChatState,
  | 'clearMessages'
  | 'error'
  | 'isLoading'
  | 'isOpen'
  | 'messages'
  | 'sendMessage'
  | 'setOpen'
  | 'toggle'
>

const mocks = vi.hoisted(() => ({
  useChat: vi.fn(),
  useLocale: vi.fn(),
  useTranslations: vi.fn(),
}))

vi.mock('next-intl', () => ({
  useLocale: () => mocks.useLocale(),
  useTranslations: () => mocks.useTranslations(),
}))

vi.mock('@/shared/store/use-chat/use-chat', () => ({
  useChat: () => mocks.useChat(),
}))

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
  }) => (
    // biome-ignore lint/performance/noImgElement: Mock component
    <img alt={alt} {...props} />
  ),
}))

vi.mock('framer-motion', async () => {
  const React = await import('react')

  type MotionProps<T extends keyof React.JSX.IntrinsicElements> =
    React.ComponentPropsWithoutRef<T> & Record<string, unknown>

  const createMotionComponent = <T extends keyof React.JSX.IntrinsicElements>(tag: T) =>
    React.forwardRef<HTMLElement, MotionProps<T>>(
      (
        {
          animate: _animate,
          children,
          exit: _exit,
          initial: _initial,
          transition: _transition,
          viewport: _viewport,
          whileHover: _whileHover,
          whileInView: _whileInView,
          whileTap: _whileTap,
          ...props
        },
        ref,
      ) => React.createElement(tag, { ...props, ref }, children),
    )

  return {
    AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    motion: {
      button: createMotionComponent('button'),
      div: createMotionComponent('div'),
      span: createMotionComponent('span'),
    },
  }
})

const createMessage = (overrides: Partial<ChatMessage>): ChatMessage => ({
  content: 'Mensagem',
  id: 'message-1',
  role: 'assistant',
  timestamp: Date.now(),
  ...overrides,
})

const createChatState = (overrides: Partial<MockChatState> = {}): MockChatState => ({
  clearMessages: vi.fn(),
  error: null,
  isLoading: false,
  isOpen: false,
  messages: [],
  sendMessage: vi.fn().mockResolvedValue(undefined),
  setOpen: vi.fn(),
  toggle: vi.fn(),
  ...overrides,
})

describe('ChatWidget', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    mocks.useLocale.mockReturnValue('pt')
    mocks.useTranslations.mockReturnValue((key: string) => key)
    mocks.useChat.mockReturnValue(createChatState())
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders the FAB when closed and toggles the widget', () => {
    const chatState = createChatState()
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const fabButton = screen.getByRole('button', { name: 'fabTooltip' })
    expect(fabButton).toBeInTheDocument()

    fireEvent.click(fabButton)

    expect(chatState.toggle).toHaveBeenCalledTimes(1)
  })

  it('renders the welcome state, focuses the input and sends suggestion prompts', () => {
    vi.useFakeTimers()
    const chatState = createChatState({ isOpen: true })
    const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    expect(screen.getByRole('dialog', { name: 'title' })).toBeInTheDocument()
    expect(screen.getByText('welcome')).toBeInTheDocument()
    expect(screen.getByText('welcomeSubtitle')).toBeInTheDocument()
    expect(screen.getByText('betaNotice')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'suggestions.skills' }))

    expect(chatState.sendMessage).toHaveBeenCalledWith('suggestions.skills', 'pt')
    expect(scrollSpy).toHaveBeenCalledWith({ behavior: 'smooth' })

    act(() => {
      vi.advanceTimersByTime(300)
    })

    expect(screen.getByLabelText('placeholder')).toHaveFocus()
  })

  it('renders message history, markdown links, clear action and error state', () => {
    const chatState = createChatState({
      error: 'network-error',
      isOpen: true,
      messages: [
        createMessage({ content: 'Pergunta do usuario', id: 'user-1', role: 'user' }),
        createMessage({
          content: 'Resposta com **destaque** e [portfólio](https://example.com)',
          id: 'assistant-1',
        }),
      ],
    })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    expect(screen.getByText('Pergunta do usuario')).toBeInTheDocument()
    expect(screen.getByText('destaque')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'portfólio' })).toHaveAttribute(
      'href',
      'https://example.com',
    )
    expect(screen.getByText('error')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'clear' }))
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(chatState.clearMessages).toHaveBeenCalledTimes(1)
    expect(chatState.setOpen).toHaveBeenCalledWith(false)
  })

  it('sends trimmed input on click and on Enter, but ignores Shift+Enter', async () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const input = screen.getByLabelText('placeholder')
    const sendButton = screen.getByRole('button', { name: 'send' })

    fireEvent.change(input, { target: { value: '  Ola widget  ' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(chatState.sendMessage).toHaveBeenCalledWith('Ola widget', 'pt')
    })
    expect(input).toHaveValue('')

    fireEvent.change(input, { target: { value: 'Nao enviar' } })
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true })
    expect(chatState.sendMessage).toHaveBeenCalledTimes(1)

    fireEvent.change(input, { target: { value: 'Enviar com enter' } })
    fireEvent.keyDown(input, { key: 'Enter' })

    await waitFor(() => {
      expect(chatState.sendMessage).toHaveBeenCalledWith('Enviar com enter', 'pt')
    })
    expect(chatState.sendMessage).toHaveBeenCalledTimes(2)
  })

  it('does not send blank input and keeps the send button disabled while loading', () => {
    const chatState = createChatState({ isLoading: true, isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const input = screen.getByLabelText('placeholder')
    const sendButton = screen.getByRole('button', { name: 'send' })

    expect(input).toBeDisabled()
    expect(sendButton).toBeDisabled()

    fireEvent.click(sendButton)
    expect(chatState.sendMessage).not.toHaveBeenCalled()
  })

  it('does not send whitespace-only input when idle', () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const input = screen.getByLabelText('placeholder')
    const sendButton = screen.getByRole('button', { name: 'send' })

    fireEvent.change(input, { target: { value: '   ' } })

    expect(sendButton).toBeDisabled()
    fireEvent.click(sendButton)
    expect(chatState.sendMessage).not.toHaveBeenCalled()
  })

  it('closes from overlay, outside click and Escape key', () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    const { container } = render(<ChatWidget />)

    const overlay = container.querySelector('.sm\\:hidden')
    expect(overlay).toBeTruthy()

    fireEvent.click(overlay as Element)
    fireEvent.mouseDown(document.body)
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(chatState.setOpen).toHaveBeenCalledTimes(3)
    expect(chatState.setOpen).toHaveBeenNthCalledWith(1, false)
    expect(chatState.setOpen).toHaveBeenNthCalledWith(2, false)
    expect(chatState.setOpen).toHaveBeenNthCalledWith(3, false)
  })

  it('keeps the widget open when the click happens inside the panel', () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    fireEvent.mouseDown(screen.getByRole('dialog', { name: 'title' }))

    expect(chatState.setOpen).not.toHaveBeenCalled()
  })

  it('shows the typing indicator while the assistant response is pending', () => {
    const chatState = createChatState({
      isLoading: true,
      isOpen: true,
      messages: [
        createMessage({ content: 'Pergunta', id: 'user-2', role: 'user' }),
        createMessage({ content: '', id: 'assistant-2' }),
      ],
    })
    mocks.useChat.mockReturnValue(chatState)

    const { container } = render(<ChatWidget />)

    expect(container.querySelectorAll('[class*="bg-slate-400"]').length).toBe(3)
  })
})
