import type { ContactFormInput } from '@/shared/lib/contact-form'
import { createMailtoFallback, sendContactEmail } from '../formly-email-service'

describe('formly-email-service', () => {
  const mockContactData: ContactFormInput = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test message content',
  }

  beforeEach(() => {
    vi.clearAllMocks()
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
        '/api/contact',
        expect.objectContaining({
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
        }),
      )
    })

    it('handles successful response with invalid JSON', async () => {
      global.fetch = vi.fn().mockResolvedValue({
        ok: true,
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
        json: async () => ({
          message: 'Internal Server Error',
        }),
        text: async () => 'Internal Server Error',
      })

      await expect(sendContactEmail(mockContactData)).rejects.toThrow(
        'HTTP 500: Internal Server Error',
      )
    })

    it('includes correct payload data', async () => {
      interface CapturedPayload {
        name: string
        email: string
        subject: string
        message: string
        website?: string
      }

      let capturedPayload: CapturedPayload | undefined

      global.fetch = vi.fn().mockImplementation(async (_url, options) => {
        capturedPayload = JSON.parse((options as RequestInit).body as string)
        return {
          ok: true,
          json: async () => ({ success: true, message: 'ok' }),
        }
      })

      await sendContactEmail(mockContactData)

      expect(capturedPayload).toBeDefined()
      expect(capturedPayload).toMatchObject({
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
        website: '',
      })
    })
  })

  describe('createMailtoFallback', () => {
    it('creates correct mailto link', () => {
      const result = createMailtoFallback(mockContactData)

      expect(result).toContain('mailto:contato@ranimontagna.com')
      expect(result).toContain('subject=Test%20Subject')
      expect(result).toContain('Nome%3A%20John%20Doe')
      expect(result).toContain('Email%3A%20john%40example.com')
      expect(result).toContain('Mensagem%3A')
      expect(result).toContain('Test%20message%20content')
    })

    it('handles special characters in data', () => {
      const specialData: ContactFormInput = {
        name: 'João & Maria',
        email: 'test+tag@example.com',
        subject: 'Test: Special & Characters!',
        message: 'Line 1\nLine 2\n\nLine 3',
      }

      const result = createMailtoFallback(specialData)

      expect(result).toContain('mailto:contato@ranimontagna.com')
      expect(result).toContain('subject=Test%3A%20Special%20%26%20Characters!')
      expect(result).toContain('Jo%C3%A3o%20%26%20Maria')
    })
  })
})
