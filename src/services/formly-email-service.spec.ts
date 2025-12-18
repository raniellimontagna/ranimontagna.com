import { formlyEmailService } from './formly-email-service'

describe('FormlyEmailService', () => {
  describe('createMailtoFallback', () => {
    it('should create mailto link with encoded data', () => {
      const data = {
        name: 'John Doe',
        email: 'john@example.com',
        subject: 'Test Subject',
        message: 'Test message content',
      }

      const result = formlyEmailService.createMailtoFallback(data)

      expect(result).toContain('mailto:raniellimontagna@gmail.com')
      expect(result).toContain('subject=')
      expect(result).toContain('body=')
    })

    it('should encode special characters in subject', () => {
      const data = {
        name: 'Test',
        email: 'test@test.com',
        subject: 'Hello & Welcome!',
        message: 'Message',
      }

      const result = formlyEmailService.createMailtoFallback(data)

      expect(result).toContain(encodeURIComponent('Hello & Welcome!'))
    })
  })
})
