import { resetRateLimitStateForTests } from '@/shared/lib/rate-limit'
import { POST } from '../route'

const createRequest = (
  body: Record<string, unknown>,
  headers: HeadersInit = {
    'content-type': 'application/json',
    'x-forwarded-for': '203.0.113.20',
    'user-agent': 'vitest',
  },
) =>
  new Request('http://localhost/api/contact', {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

describe('contact route', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
    vi.unstubAllEnvs()
    vi.stubEnv('FORMLY_FORM_ID', 'server-form-id')
    resetRateLimitStateForTests()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    resetRateLimitStateForTests()
  })

  it('returns success-like response when honeypot is filled', async () => {
    global.fetch = vi.fn()

    const response = await POST(
      createRequest({
        name: 'Bot',
        email: 'bot@example.com',
        subject: 'Spam message',
        message: 'Spam content here',
        website: 'https://spam.test',
      }) as never,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Email enviado com sucesso!',
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('rejects invalid payloads', async () => {
    const response = await POST(
      createRequest({
        name: 'A',
        email: 'invalid-email',
        subject: 'Oi',
        message: 'curta',
        website: '',
      }) as never,
    )

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toMatchObject({
      success: false,
      message: 'Dados invalidos.',
    })
  })

  it('rate limits repeated requests from the same identifier', async () => {
    vi.stubEnv('CONTACT_RATE_LIMIT_MAX', '1')
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 'contact-1' }),
    })

    const body = {
      name: 'John Doe',
      email: 'john@example.com',
      subject: 'Test Subject',
      message: 'A valid message with enough length.',
      website: '',
    }

    const firstResponse = await POST(createRequest(body) as never)
    const secondResponse = await POST(createRequest(body) as never)

    expect(firstResponse.status).toBe(200)
    expect(secondResponse.status).toBe(429)
    await expect(secondResponse.json()).resolves.toMatchObject({
      success: false,
    })
  })

  it('returns 500 when the contact service is not configured', async () => {
    vi.unstubAllEnvs()

    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'A valid message with enough length.',
        website: '',
      }) as never,
    )

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Servico de contato indisponivel.',
    })
  })

  it('submits to Formly through the server endpoint', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ success: true, id: 'contact-1', message: 'ok' }),
    })

    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'A valid message with enough length.',
        website: '',
      }) as never,
    )

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledWith(
      'https://formly.email/submit',
      expect.objectContaining({
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
      }),
    )
    await expect(response.json()).resolves.toMatchObject({
      success: true,
      id: 'contact-1',
    })
  })

  it('treats Formly redirect responses as success', async () => {
    global.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 302,
      type: 'basic',
      json: async () => ({}),
      text: async () => '',
    })

    const response = await POST(
      createRequest({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'A valid message with enough length.',
        website: '',
      }) as never,
    )

    expect(response.status).toBe(200)
    await expect(response.json()).resolves.toEqual({
      success: true,
      message: 'Email enviado com sucesso!',
    })
  })
})
