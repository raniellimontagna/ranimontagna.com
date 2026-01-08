import { formlyEmailService } from './formly-email-service'

describe('FormlyEmailService', () => {
  const mockContactData = {
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'Test Subject',
    message: 'Test message content',
  }

  beforeEach(() => {
    vi.resetAllMocks()

    Object.defineProperty(window, 'location', {
      value: { href: 'https://ranimontagna.com' },
      writable: true,
    })

    Object.defineProperty(navigator, 'userAgent', {
      value: 'test-user-agent',
      writable: true,
    })
  })

  describe('sendContactEmail', () => {
    it('throws error when formId is not configured', async () => {
      await expect(formlyEmailService.sendContactEmail(mockContactData)).rejects.toThrow(/Form ID/)
    })

    it('constructs correct payload structure', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('mailto:')
      expect(mailto).toContain('subject=')
      expect(mailto).toContain('body=')
    })
  })

  describe('createMailtoFallback', () => {
    it('returns mailto link with recipient', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('mailto:raniellimontagna@gmail.com')
    })

    it('includes encoded subject', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('subject=Test%20Subject')
    })

    it('includes encoded body with name', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('Nome%3A%20John%20Doe')
    })

    it('includes encoded body with email', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('john%40example.com')
    })

    it('includes encoded body with message', () => {
      const mailto = formlyEmailService.createMailtoFallback(mockContactData)

      expect(mailto).toContain('Test%20message%20content')
    })

    it('works with special characters', () => {
      const dataWithSpecialChars = {
        ...mockContactData,
        message: 'Hello & goodbye! <script>',
        subject: 'Test & Special',
      }

      const mailto = formlyEmailService.createMailtoFallback(dataWithSpecialChars)

      expect(mailto).toContain('mailto:')
      expect(mailto).toContain('%26') // &
      expect(mailto).toContain('%3C') // <
    })
  })
})
