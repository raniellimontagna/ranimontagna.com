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

      expect(alternates.en).toContain('/en')
      expect(alternates.pt).toContain('/pt')
      expect(alternates['x-default']).toBeDefined()
    })
  })

  describe('getCanonicalUrl', () => {
    it('should return canonical URL for locale', () => {
      const url = getCanonicalUrl('pt')

      expect(url).toBe('https://ranimontagna.com/pt')
    })
  })
})
