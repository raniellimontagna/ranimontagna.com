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

const validContactBody = {
  name: 'John Doe',
  email: 'john@example.com',
  subject: 'Test Subject',
  message: 'A valid message with enough length.',
  website: '',
}

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

  it.each([302, 307])(
    'rejects a %s Formly redirect instead of reporting success',
    async (status) => {
      global.fetch = vi.fn().mockResolvedValue(new Response(null, { status }))

      const response = await POST(createRequest(validContactBody) as never)

      expect(response.status).toBe(500)
      await expect(response.json()).resolves.toEqual({
        success: false,
        message: 'Nao foi possivel enviar a mensagem.',
      })
    },
  )

  it.each([
    ['malformed JSON', new Response('not-json', { status: 200 })],
    ['negative confirmation', new Response(JSON.stringify({ success: false }), { status: 200 })],
    ['empty confirmation', new Response(null, { status: 200 })],
  ])('rejects an ok response with %s', async (_label, providerResponse) => {
    global.fetch = vi.fn().mockResolvedValue(providerResponse)

    const response = await POST(createRequest(validContactBody) as never)

    expect(response.status).toBe(500)
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Nao foi possivel enviar a mensagem.',
    })
  })

  it.each(['AbortError', 'TimeoutError'])(
    'adds a finite provider deadline and classifies %s as a timeout',
    async (errorName) => {
      const timeoutSignal = new AbortController().signal
      const timeoutSpy = vi.spyOn(AbortSignal, 'timeout').mockReturnValue(timeoutSignal)
      const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
      global.fetch = vi.fn().mockRejectedValue(new DOMException('provider timed out', errorName))

      const response = await POST(createRequest(validContactBody) as never)

      expect(response.status).toBe(500)
      expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Number))
      expect(timeoutSpy.mock.calls[0]?.[0]).toBeLessThanOrEqual(10_000)
      expect(global.fetch).toHaveBeenCalledWith(
        'https://formly.email/submit',
        expect.objectContaining({ signal: timeoutSignal }),
      )
      await expect(response.json()).resolves.toEqual({
        success: false,
        message: 'Nao foi possivel enviar a mensagem.',
      })
      expect(consoleError).toHaveBeenCalledWith(
        'Contact API failure',
        expect.objectContaining({ category: 'timeout' }),
      )
    },
  )

  it('does not log or return a marker from a rejected provider payload', async () => {
    const marker = 'FORMLY_PRIVATE_MARKER'
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: false, message: marker }), { status: 200 }),
      )

    const response = await POST(createRequest(validContactBody) as never)
    const responseBody = await response.text()

    expect(response.status).toBe(500)
    expect(responseBody).not.toContain(marker)
    expect(JSON.stringify(consoleError.mock.calls)).not.toContain(marker)
    expect(consoleError).toHaveBeenCalledWith(
      'Contact API failure',
      expect.objectContaining({
        category: expect.any(String),
        traceId: expect.any(String),
      }),
    )
  })

  it('rejects explicit cross-site browser requests before provider submission', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, id: 'contact-1' }), { status: 200 }),
      )
    const request = createRequest(validContactBody, {
      'content-type': 'application/json',
      origin: 'https://attacker.example',
      'sec-fetch-site': 'cross-site',
      'user-agent': 'vitest',
    })

    const response = await POST(request as never)

    expect(response.status).toBe(403)
    await expect(response.json()).resolves.toEqual({ success: false, message: 'Forbidden' })
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('accepts a browser request whose origin matches the request URL', async () => {
    global.fetch = vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ success: true, id: 'contact-1' }), { status: 200 }),
      )
    const request = createRequest(validContactBody, {
      'content-type': 'application/json',
      origin: 'http://localhost',
      'sec-fetch-site': 'same-origin',
      'user-agent': 'vitest',
    })

    const response = await POST(request as never)

    expect(response.status).toBe(200)
    expect(global.fetch).toHaveBeenCalledOnce()
  })

  it('returns 413 and cancels a contact body above 16 KiB', async () => {
    const cancel = vi.fn()
    const body = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(16 * 1024 + 1))
      },
      cancel,
    })
    const request = {
      body,
      headers: new Headers(),
      url: 'http://localhost/api/contact',
    }

    const response = await POST(request as never)

    expect(response.status).toBe(413)
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Request body too large',
    })
    expect(cancel).toHaveBeenCalledOnce()
    expect(global.fetch).not.toHaveBeenCalled()
  })

  it('returns a generic 400 for invalid UTF-8 JSON', async () => {
    const request = new Request('http://localhost/api/contact', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: new Uint8Array([0x7b, 0x22, 0x78, 0x22, 0x3a, 0x22, 0xc3, 0x28, 0x22, 0x7d]),
    })

    const response = await POST(request as never)

    expect(response.status).toBe(400)
    await expect(response.json()).resolves.toEqual({
      success: false,
      message: 'Requisicao invalida.',
    })
    expect(global.fetch).not.toHaveBeenCalled()
  })
})
