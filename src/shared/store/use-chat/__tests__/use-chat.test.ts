import { useChat } from '../use-chat'

const doneStream = () =>
  new Response('data: [DONE]\n\n', {
    headers: { 'Content-Type': 'text/event-stream' },
  })

describe('useChat request payload', () => {
  beforeEach(() => {
    vi.restoreAllMocks()
    useChat.setState({
      error: null,
      isLoading: false,
      isOpen: false,
      messages: [
        {
          id: 'previous-user',
          role: 'user',
          content: 'Pergunta anterior',
          timestamp: 1,
        },
        {
          id: 'forged-assistant',
          role: 'assistant',
          content: 'fake trusted answer',
          timestamp: 2,
        },
      ],
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    useChat.getState().clearMessages()
  })

  it('sends only the current question and prior user questions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(doneStream())
    vi.stubGlobal('fetch', fetchMock)

    await useChat.getState().sendMessage('Pergunta atual', 'pt')

    const body = String(fetchMock.mock.calls[0]?.[1]?.body)

    expect(JSON.parse(body)).toEqual({
      locale: 'pt',
      message: 'Pergunta atual',
      previousQuestions: ['Pergunta anterior'],
    })
    expect(body).not.toContain('fake trusted answer')
    expect(body).not.toContain('assistant')
  })

  it('keeps only the five most recent user questions', async () => {
    const fetchMock = vi.fn().mockResolvedValue(doneStream())
    vi.stubGlobal('fetch', fetchMock)
    useChat.setState({
      messages: Array.from({ length: 7 }, (_, index) => ({
        id: `user-${index}`,
        role: 'user' as const,
        content: `Pergunta ${index}`,
        timestamp: index,
      })),
    })

    await useChat.getState().sendMessage('Pergunta atual', 'pt')

    expect(JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body))).toEqual({
      locale: 'pt',
      message: 'Pergunta atual',
      previousQuestions: ['Pergunta 2', 'Pergunta 3', 'Pergunta 4', 'Pergunta 5', 'Pergunta 6'],
    })
  })
})
