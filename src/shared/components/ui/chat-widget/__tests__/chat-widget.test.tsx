import { useState } from 'react'
import type { ChatMessage, ChatState } from '@/shared/store/use-chat/use-chat.types'
import { act, fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import enMessages from '../../../../../../messages/en.json'
import esMessages from '../../../../../../messages/es.json'
import ptMessages from '../../../../../../messages/pt.json'
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
      ) => React.createElement(tag, { ...props, ref }, children as React.ReactNode),
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

  it('renders the FAB when closed and opens the widget through the dialog trigger', () => {
    const chatState = createChatState()
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const fabButton = screen.getByRole('button', { name: 'fabTooltip' })
    expect(fabButton).toBeInTheDocument()
    expect(fabButton).toHaveAttribute('data-chat-launcher')

    fireEvent.click(fabButton)

    expect(chatState.setOpen).toHaveBeenCalledWith(true)
  })

  it('renders the welcome state, focuses the input and sends suggestion prompts', () => {
    vi.useFakeTimers()
    const chatState = createChatState({ isOpen: true })
    const scrollSpy = vi.spyOn(HTMLElement.prototype, 'scrollIntoView')
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    const dialog = screen.getByRole('dialog', { name: 'title' })
    expect(dialog).toBeInTheDocument()
    expect(dialog).toHaveAttribute('aria-describedby')
    expect(screen.getByText('welcome')).toBeInTheDocument()
    expect(screen.getByText('welcomeSubtitle')).toBeInTheDocument()
    expect(screen.getByText('betaNotice')).toBeInTheDocument()
    expect(screen.getByAltText('Rani')).toHaveAttribute('src', '/images/avatar-112.webp')

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
          content:
            'Resposta com **destaque** e [portfólio](https://www.linkedin.com/in/rannimontagna)',
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
      'https://www.linkedin.com/in/rannimontagna',
    )
    expect(screen.getByText('error')).toBeInTheDocument()
    expect(screen.getByRole('log', { name: 'messagesLabel' })).toBeInTheDocument()
    expect(screen.getAllByRole('alert')).toHaveLength(1)

    fireEvent.click(screen.getByRole('button', { name: 'clear' }))
    fireEvent.click(screen.getByRole('button', { name: 'close' }))

    expect(chatState.clearMessages).toHaveBeenCalledTimes(1)
    expect(chatState.setOpen).toHaveBeenCalledWith(false)
  })

  it('keeps a rejected Markdown link label visible without creating an anchor', () => {
    const chatState = createChatState({
      isOpen: true,
      messages: [
        createMessage({
          content: 'Não abra [este destino](javascript:alert(1)).',
          id: 'assistant-unsafe-link',
        }),
      ],
    })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    expect(screen.getByText(/este destino/)).toBeVisible()
    expect(screen.queryByRole('link', { name: 'este destino' })).not.toBeInTheDocument()
  })

  it.each([
    {
      copy: ptMessages.chat.betaNotice,
      expected:
        'IA pode errar e usar provedores de fallback. Não envie dados pessoais, confidenciais ou sensíveis.',
      locale: 'pt',
    },
    {
      copy: enMessages.chat.betaNotice,
      expected:
        'AI can make mistakes and use fallback providers. Do not send personal, confidential, or sensitive data.',
      locale: 'en',
    },
    {
      copy: esMessages.chat.betaNotice,
      expected:
        'La IA puede equivocarse y usar proveedores de respaldo. No envíes datos personales, confidenciales ni sensibles.',
      locale: 'es',
    },
  ])('shows the $locale privacy notice before any submission', ({ copy, expected, locale }) => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)
    mocks.useLocale.mockReturnValue(locale)
    mocks.useTranslations.mockReturnValue((key: string) => (key === 'betaNotice' ? copy : key))

    render(<ChatWidget />)

    expect(screen.getByText(expected)).toBeVisible()
    expect(screen.getByRole('textbox', { name: 'placeholder' })).toBeVisible()
    expect(chatState.sendMessage).not.toHaveBeenCalled()
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

  it('closes from an outside press and Escape key', () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(<ChatWidget />)

    fireEvent.click(screen.getByTestId('chat-overlay'))
    expect(chatState.setOpen).toHaveBeenCalledWith(false)

    vi.mocked(chatState.setOpen).mockClear()
    fireEvent.keyDown(document, { key: 'Escape' })

    expect(chatState.setOpen).toHaveBeenCalledWith(false)
  })

  it('makes background controls unavailable while the modal is open', () => {
    const chatState = createChatState({ isOpen: true })
    mocks.useChat.mockReturnValue(chatState)

    render(
      <div>
        <button type="button">Outside action</button>
        <ChatWidget />
      </div>,
    )

    const outside = screen.getByRole('button', { name: 'Outside action', hidden: true })
    expect(outside.closest('[aria-hidden="true"]')).toBeInTheDocument()
    expect(screen.getByRole('dialog', { name: 'title' })).toBeInTheDocument()
  })

  it('restores focus to the launcher after Escape closes the dialog', async () => {
    mocks.useChat.mockImplementation(() => {
      const [isOpen, setOpen] = useState(false)
      return createChatState({ isOpen, setOpen })
    })

    render(<ChatWidget />)

    const launcher = screen.getByRole('button', { name: 'fabTooltip' })
    fireEvent.click(launcher)

    await waitFor(() => {
      expect(screen.getByRole('dialog', { name: 'title' })).toBeInTheDocument()
      expect(screen.getByRole('textbox', { name: 'placeholder' })).toHaveFocus()
    })

    fireEvent.keyDown(document, { key: 'Escape' })

    await waitFor(() => {
      expect(screen.queryByRole('dialog', { name: 'title' })).not.toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'fabTooltip' })).toHaveFocus()
    })
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

    render(<ChatWidget />)

    expect(document.querySelectorAll('[class*="bg-slate-400"]').length).toBe(3)
  })

  it('announces a completed assistant response once without announcing partial tokens', async () => {
    const userMessage = createMessage({ content: 'Pergunta', id: 'user-complete', role: 'user' })
    const chatState = createChatState({
      isLoading: true,
      isOpen: true,
      messages: [userMessage, createMessage({ content: '', id: 'assistant-complete' })],
    })
    mocks.useChat.mockReturnValue(chatState)

    const { rerender } = render(<ChatWidget />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    chatState.messages = [
      userMessage,
      createMessage({ content: 'Resposta parcial', id: 'assistant-complete' }),
    ]
    rerender(<ChatWidget />)
    expect(screen.queryByRole('status')).not.toBeInTheDocument()

    chatState.isLoading = false
    chatState.messages = [
      userMessage,
      createMessage({ content: 'Resposta completa', id: 'assistant-complete' }),
    ]
    rerender(<ChatWidget />)

    await waitFor(() => {
      expect(screen.getByRole('status')).toHaveTextContent('Resposta completa')
    })
    expect(screen.getAllByRole('status')).toHaveLength(1)
  })
})
