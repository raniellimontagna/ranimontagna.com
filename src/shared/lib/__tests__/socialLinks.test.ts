import {
  contactMethods,
  getResumeByLocale,
  getSocialLinksAsArray,
  socialLinks,
} from '../social-links'

describe('socialLinks', () => {
  describe('socialLinks object', () => {
    it('contains github link', () => {
      expect(socialLinks.github.name).toBe('GitHub')
      expect(socialLinks.github.href).toContain('github.com')
      expect(socialLinks.github.external).toBe(true)
    })

    it('contains linkedin link', () => {
      expect(socialLinks.linkedin.name).toBe('LinkedIn')
      expect(socialLinks.linkedin.href).toContain('linkedin.com')
      expect(socialLinks.linkedin.external).toBe(true)
    })

    it('contains email link', () => {
      expect(socialLinks.email.name).toBe('Email')
      expect(socialLinks.email.href).toContain('mailto:')
      expect(socialLinks.email.external).toBe(false)
    })

    it('all links have icon components', () => {
      expect(socialLinks.github.icon).toBeDefined()
      expect(socialLinks.linkedin.icon).toBeDefined()
      expect(socialLinks.email.icon).toBeDefined()
    })

    it('all links have ariaLabel for accessibility', () => {
      expect(socialLinks.github.ariaLabel).toBeDefined()
      expect(socialLinks.linkedin.ariaLabel).toBeDefined()
      expect(socialLinks.email.ariaLabel).toBeDefined()
    })
  })

  describe('contactMethods', () => {
    it('contains whatsapp link', () => {
      expect(contactMethods.whatsapp.name).toBe('WhatsApp')
      expect(contactMethods.whatsapp.href).toContain('wa.me')
      expect(contactMethods.whatsapp.external).toBe(true)
    })
  })

  describe('getResumeByLocale', () => {
    it('returns correct resume for "en" locale', () => {
      const resume = getResumeByLocale('en')

      expect(resume.name).toBe('Resume')
      expect(resume.href).toBe('/cv/en.pdf')
      expect(resume.locale).toBe('en')
    })

    it('returns correct resume for "pt" locale', () => {
      const resume = getResumeByLocale('pt')

      expect(resume.name).toBe('Currículo')
      expect(resume.href).toBe('/cv/pt.pdf')
      expect(resume.locale).toBe('pt')
    })

    it('returns correct resume for "es" locale', () => {
      const resume = getResumeByLocale('es')

      expect(resume.name).toBe('Currículum')
      expect(resume.href).toBe('/cv/es.pdf')
      expect(resume.locale).toBe('es')
    })

    it('falls back to English for unknown locale', () => {
      // @ts-expect-error Testing invalid locale
      const resume = getResumeByLocale('fr')

      expect(resume.name).toBe('Resume')
    })
  })

  describe('getSocialLinksAsArray', () => {
    it('returns an array', () => {
      const links = getSocialLinksAsArray()

      expect(Array.isArray(links)).toBe(true)
    })

    it('each item has an id property', () => {
      const links = getSocialLinksAsArray()

      for (const link of links) {
        expect(link.id).toBeDefined()
        expect(typeof link.id).toBe('string')
      }
    })

    it('contains all social links', () => {
      const links = getSocialLinksAsArray()
      const ids = links.map((l) => l.id)

      expect(ids).toContain('github')
      expect(ids).toContain('linkedin')
      expect(ids).toContain('email')
    })

    it('preserves original properties', () => {
      const links = getSocialLinksAsArray()
      const github = links.find((l) => l.id === 'github')

      expect(github?.name).toBe('GitHub')
      expect(github?.href).toContain('github.com')
    })
  })
})
