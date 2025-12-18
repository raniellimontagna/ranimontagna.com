import { getAlternateLanguages, getCanonicalUrl, getSEOData } from './seo'

describe('seo utilities', () => {
  describe('getSEOData', () => {
    it('should return English SEO data for en locale', () => {
      const data = getSEOData('en')

      expect(data.title).toContain('Full Stack Developer')
      expect(data.description).toContain('Portfolio')
    })

    it('should return Portuguese SEO data for pt locale', () => {
      const data = getSEOData('pt')

      expect(data.title).toContain('Desenvolvedor Full Stack')
    })

    it('should return Spanish SEO data for es locale', () => {
      const data = getSEOData('es')

      expect(data.title).toContain('Desarrollador Full Stack')
    })

    it('should fallback to English for unknown locale', () => {
      const data = getSEOData('unknown')

      expect(data.title).toContain('Full Stack Developer')
    })
  })

  describe('getAlternateLanguages', () => {
    it('should return all alternate languages', () => {
      const alternates = getAlternateLanguages()

      expect(alternates.en).toBe('https://ranimontagna.com/en')
      expect(alternates.pt).toBe('https://ranimontagna.com') // Default locale points to root
      expect(alternates.es).toBe('https://ranimontagna.com/es')
      expect(alternates['x-default']).toBe('https://ranimontagna.com')
    })
  })

  describe('getCanonicalUrl', () => {
    it('should return root URL for default locale (pt)', () => {
      const url = getCanonicalUrl('pt')

      expect(url).toBe('https://ranimontagna.com')
    })

    it('should return locale-specific URL for non-default locales', () => {
      expect(getCanonicalUrl('en')).toBe('https://ranimontagna.com/en')
      expect(getCanonicalUrl('es')).toBe('https://ranimontagna.com/es')
    })
  })
})
