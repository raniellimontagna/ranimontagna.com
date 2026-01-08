import type { ContactFormData } from '../formly-email-service'
import { createMailtoFallback, sendContactEmail } from '../formly-email-service'

describe('formly-email-service', () => {
  const mockContactData: ContactFormData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test message content',
  }

  beforeEach(() => {
    // Mock global objects
    global.navigator = { userAgent: 'Test User Agent' } as Navigator
    global.window = { location: { href: 'https://test.com' } } as Window & typeof globalThis

    // Mock environment variable
    vi.stubEnv('NEXT_PUBLIC_FORMLY_FORM_ID', 'test-form-id')

    vi.clearAllMocks()
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  describe('sendContactEmail', () => {
    it('sends email successfully with JSON response', async () => {
      const mockResponse = {
        success: true,
        message: 'Email sent successfully',
        id: 'email-123',
      }

      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        type: 'basic',
        json: async () => mockResponse,
      })

      const result = await sendContactEmail(mockContactData)

      expect(result).toEqual(mockResponse)
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
    })

    it('handles opaque redirect response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        type: 'opaqueredirect',
      })

      const result = await sendContactEmail(mockContactData)

      expect(result).toEqual({
        success: true,
        message: 'Email enviado com sucesso!',
      })
    })

    it('handles successful response with invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        type: 'basic',
        json: async () => {
          throw new Error('Invalid JSON')
        },
      })

      const result = await sendContactEmail(mockContactData)

      expect(result).toEqual({
        success: true,
        message: 'Email enviado com sucesso!',
      })
    })

    it('handles API error response with success: false', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        type: 'basic',
        json: async () => ({
          success: false,
          message: 'API Error',
        }),
      })

      await expect(sendContactEmail(mockContactData)).rejects.toThrow('API Error')
    })

    it('handles API error response with success: false and no message', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
        type: 'basic',
        json: async () => ({
          success: false,
        }),
      })

      await expect(sendContactEmail(mockContactData)).rejects.toThrow(
        'Erro desconhecido ao enviar email',
      )
    })

    it('handles HTTP error response', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      await expect(sendContactEmail(mockContactData)).rejects.toThrow(
        'HTTP 500: Internal Server Error',
      )
    })

    it('throws error when form ID is not provided', async () => {
      vi.unstubAllEnvs()
      vi.stubEnv('NEXT_PUBLIC_FORMLY_FORM_ID', '')

      global.fetch = vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        text: async () => 'Internal Server Error',
      })

      await expect(sendContactEmail(mockContactData)).rejects.toThrow('HTTP 500')
    })

    it('includes correct payload data', async () => {
      interface CapturedPayload {
        access_key: string
        name: string
        email: string
        subject: string
        message: string
        source: string
        userAgent: string
        url: string
        timestamp: string
      }

      let capturedPayload: CapturedPayload | undefined

      global.fetch = vi.fn().mockImplementation(async (_url, options) => {
        capturedPayload = JSON.parse((options as RequestInit).body as string)
        return {
          ok: true,
          type: 'opaqueredirect',
        }
      })

      await sendContactEmail(mockContactData)

      expect(capturedPayload).toBeDefined()
      expect(capturedPayload).toMatchObject({
        access_key: 'test-form-id',
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
        source: 'Portfolio Website - Ranimontagna.com',
        userAgent: 'Test User Agent',
        url: 'https://test.com',
      })
      expect(capturedPayload?.timestamp).toBeDefined()
    })
  })

  describe('createMailtoFallback', () => {
    it('creates correct mailto link', () => {
      const result = createMailtoFallback(mockContactData)

      expect(result).toContain('mailto:raniellimontagna@gmail.com')
      expect(result).toContain('subject=Test%20Subject')
      expect(result).toContain('Nome%3A%20John%20Doe')
      expect(result).toContain('Email%3A%20john%40example.com')
      expect(result).toContain('Mensagem%3A')
      expect(result).toContain('Test%20message%20content')
    })

    it('handles special characters in data', () => {
      const specialData: ContactFormData = {
        name: 'João & Maria',
        email: 'test+tag@example.com',
        subject: 'Test: Special & Characters!',
        message: 'Line 1\nLine 2\n\nLine 3',
      }

      const result = createMailtoFallback(specialData)

      expect(result).toContain('mailto:raniellimontagna@gmail.com')
      expect(result).toContain('subject=Test%3A%20Special%20%26%20Characters!')
      expect(result).toContain('Jo%C3%A3o%20%26%20Maria')
    })
  })
})
