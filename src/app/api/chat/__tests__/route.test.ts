import { FALLBACK_MESSAGES } from '../chat.constants'
import { resetRateLimitStateForTests } from '../chat.utils'

const { mockCallDeepSeek, mockCallGemini, mockCallOpenRouter, mockCallGroq } = vi.hoisted(() => ({
  mockCallDeepSeek: vi.fn(),
  mockCallGemini: vi.fn(),
  mockCallOpenRouter: vi.fn(),
  mockCallGroq: vi.fn(),
}))

vi.mock('../chat.utils', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../chat.utils')>()

  return {
    ...actual,
    callDeepSeek: mockCallDeepSeek,
    callGemini: mockCallGemini,
    callOpenRouter: mockCallOpenRouter,
    callGroq: mockCallGroq,
  }
})

import { POST } from '../route'

const createRequest = () =>
  new Request('http://localhost/api/chat', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'x-forwarded-for': '203.0.113.42',
    },
    body: JSON.stringify({
      messages: [{ role: 'user', content: 'Oi' }],
      locale: 'pt',
    }),
  })

const createOpenAiStreamResponse = (content: string) =>
  new Response(
    `data: ${JSON.stringify({ choices: [{ delta: { content } }] })}\n\ndata: [DONE]\n\n`,
    {
      headers: { 'Content-Type': 'text/event-stream' },
    },
  )

const createGeminiStreamResponse = (content: string) =>
  new Response(
    `data: ${JSON.stringify({
      candidates: [{ content: { parts: [{ text: content }] } }],
    })}\n\ndata: [DONE]\n\n`,
    {
      headers: { 'Content-Type': 'text/event-stream' },
    },
  )

describe('chat route provider order', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetRateLimitStateForTests()
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    mockCallGemini.mockResolvedValue(null)
    mockCallOpenRouter.mockResolvedValue(null)
    mockCallGroq.mockResolvedValue(null)
  })

  afterEach(() => {
    resetRateLimitStateForTests()
  })

  it('streams a successful DeepSeek response without calling fallback providers', async () => {
    mockCallDeepSeek.mockResolvedValue(createOpenAiStreamResponse('Resposta DeepSeek'))

    const response = await POST(createRequest() as never)

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toContain('data: {"text":"Resposta DeepSeek"}')
    expect(mockCallDeepSeek).toHaveBeenCalledTimes(1)
    expect(mockCallGemini).not.toHaveBeenCalled()
    expect(mockCallOpenRouter).not.toHaveBeenCalled()
    expect(mockCallGroq).not.toHaveBeenCalled()
  })

  it('tries Gemini when DeepSeek is unavailable', async () => {
    mockCallDeepSeek.mockResolvedValue(null)
    mockCallGemini.mockResolvedValue(createGeminiStreamResponse('Resposta Gemini'))

    const response = await POST(createRequest() as never)

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toContain('data: {"text":"Resposta Gemini"}')
    expect(mockCallDeepSeek).toHaveBeenCalledTimes(1)
    expect(mockCallGemini).toHaveBeenCalledTimes(1)
    expect(mockCallOpenRouter).not.toHaveBeenCalled()
    expect(mockCallGroq).not.toHaveBeenCalled()
  })

  it('tries Gemini, OpenRouter, and Groq in order before returning the static fallback', async () => {
    mockCallDeepSeek.mockResolvedValue(null)

    const response = await POST(createRequest() as never)

    expect(response.status).toBe(200)
    await expect(response.text()).resolves.toContain(JSON.stringify({ text: FALLBACK_MESSAGES.pt }))
    expect(mockCallDeepSeek).toHaveBeenCalledTimes(1)
    expect(mockCallGemini).toHaveBeenCalledTimes(1)
    expect(mockCallOpenRouter).toHaveBeenCalledTimes(1)
    expect(mockCallGroq).toHaveBeenCalledTimes(1)
    expect(mockCallDeepSeek.mock.invocationCallOrder[0]).toBeLessThan(
      mockCallGemini.mock.invocationCallOrder[0],
    )
    expect(mockCallGemini.mock.invocationCallOrder[0]).toBeLessThan(
      mockCallOpenRouter.mock.invocationCallOrder[0],
    )
    expect(mockCallOpenRouter.mock.invocationCallOrder[0]).toBeLessThan(
      mockCallGroq.mock.invocationCallOrder[0],
    )
  })
})
