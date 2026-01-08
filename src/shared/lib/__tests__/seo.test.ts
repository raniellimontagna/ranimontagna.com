import { BASE_URL } from '../constants'
import { getAlternateLanguages, getCanonicalUrl, getSEOData } from '../seo'

describe('seo', () => {
  describe('getSEOData', () => {
    it('returns English data for "en" locale', () => {
      const data = getSEOData('en')

      expect(data.title).toContain('Full Stack Developer')
      expect(data.description).toContain('Portfolio')
      expect(data.keywords).toContain('react')
    })

    it('returns Portuguese data for "pt" locale', () => {
      const data = getSEOData('pt')

      expect(data.title).toContain('Desenvolvedor Full Stack')
      expect(data.description).toContain('Portfolio')
    })

    it('returns Spanish data for "es" locale', () => {
      const data = getSEOData('es')

      expect(data.title).toContain('Desarrollador Full Stack')
    })

    it('falls back to English for unknown locale', () => {
      const data = getSEOData('fr')

      expect(data.title).toContain('Full Stack Developer')
    })

    it('contains all required fields', () => {
      const data = getSEOData('en')

      expect(data).toHaveProperty('title')
      expect(data).toHaveProperty('description')
      expect(data).toHaveProperty('keywords')
      expect(data).toHaveProperty('ogTitle')
      expect(data).toHaveProperty('ogDescription')
      expect(data).toHaveProperty('twitterTitle')
      expect(data).toHaveProperty('twitterDescription')
    })
  })

  describe('getAlternateLanguages', () => {
    it('returns alternates for all locales', () => {
      const alternates = getAlternateLanguages()

      expect(alternates).toHaveProperty('pt')
      expect(alternates).toHaveProperty('en')
      expect(alternates).toHaveProperty('es')
      expect(alternates).toHaveProperty('x-default')
    })

    it('default locale points to root', () => {
      const alternates = getAlternateLanguages()

      // pt is the default locale
      expect(alternates.pt).toBe(BASE_URL)
    })

    it('other locales include path', () => {
      const alternates = getAlternateLanguages()

      expect(alternates.en).toBe(`${BASE_URL}/en`)
      expect(alternates.es).toBe(`${BASE_URL}/es`)
    })

    it('x-default points to BASE_URL', () => {
      const alternates = getAlternateLanguages()

      expect(alternates['x-default']).toBe(BASE_URL)
    })
  })

  describe('getCanonicalUrl', () => {
    it('default locale returns BASE_URL', () => {
      expect(getCanonicalUrl('pt')).toBe(BASE_URL)
    })

    it('other locales include path', () => {
      expect(getCanonicalUrl('en')).toBe(`${BASE_URL}/en`)
      expect(getCanonicalUrl('es')).toBe(`${BASE_URL}/es`)
    })
  })
})
