import { BASE_URL } from '../constants'
import { generatePersonJsonLd, generateWebsiteJsonLd } from '../jsonld'

describe('jsonld', () => {
  describe('generatePersonJsonLd', () => {
    it('generates valid JSON-LD with @context and @type', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld['@context']).toBe('https://schema.org')
      expect(jsonld['@type']).toBe('Person')
    })

    it('contains correct personal information', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.name).toBe('Ranielli Montagna')
      expect(jsonld.givenName).toBe('Ranielli')
      expect(jsonld.familyName).toBe('Montagna')
      expect(jsonld.alternateName).toContain('Rani Montagna')
    })

    it('includes correct URL and image', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.url).toBe(BASE_URL)
      expect(jsonld.image).toMatchObject({
        '@type': 'ImageObject',
        url: `${BASE_URL}/photo.webp`,
        width: 800,
        height: 800,
      })
    })

    it('includes social links', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.sameAs).toContain('https://github.com/RanielliMontagna')
      expect(jsonld.sameAs).toContain('https://linkedin.com/in/rannimontagna')
    })

    it('returns English jobTitle for "en" locale', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.jobTitle).toBe('Full Stack Developer')
    })

    it('returns Portuguese jobTitle for "pt" locale', () => {
      const jsonld = generatePersonJsonLd('pt')

      expect(jsonld.jobTitle).toBe('Desenvolvedor Full Stack')
    })

    it('returns Spanish jobTitle for "es" locale', () => {
      const jsonld = generatePersonJsonLd('es')

      expect(jsonld.jobTitle).toBe('Desarrollador Full Stack')
    })

    it('falls back to English for unknown locale', () => {
      const jsonld = generatePersonJsonLd('fr')

      expect(jsonld.jobTitle).toBe('Full Stack Developer')
      expect(jsonld.description).toContain('Full Stack Developer')
    })

    it('includes knowsAbout with technologies', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.knowsAbout).toContain('React')
      expect(jsonld.knowsAbout).toContain('Node.js')
      expect(jsonld.knowsAbout).toContain('TypeScript')
    })

    it('includes Brazilian nationality', () => {
      const jsonld = generatePersonJsonLd('en')

      expect(jsonld.nationality['@type']).toBe('Country')
      expect(jsonld.nationality.name).toBe('Brazil')
    })
  })

  describe('generateWebsiteJsonLd', () => {
    it('generates valid JSON-LD with @context and @type', () => {
      const jsonld = generateWebsiteJsonLd('en')

      expect(jsonld['@context']).toBe('https://schema.org')
      expect(jsonld['@type']).toBe('WebSite')
    })

    it('contains correct website information', () => {
      const jsonld = generateWebsiteJsonLd('en')

      expect(jsonld.name).toBe('Ranielli Montagna Portfolio')
      expect(jsonld.url).toBe(BASE_URL)
    })

    it('includes author', () => {
      const jsonld = generateWebsiteJsonLd('en')

      expect(jsonld.author['@type']).toBe('Person')
      expect(jsonld.author.name).toBe('Ranielli Montagna')
    })

    it('includes supported languages', () => {
      const jsonld = generateWebsiteJsonLd('en')

      expect(jsonld.inLanguage).toContain('en')
      expect(jsonld.inLanguage).toContain('pt')
      expect(jsonld.inLanguage).toContain('es')
    })

    it('description varies by locale', () => {
      const enJsonld = generateWebsiteJsonLd('en')
      const ptJsonld = generateWebsiteJsonLd('pt')

      expect(enJsonld.description).toContain('Portfolio')
      expect(ptJsonld.description).toContain('Portfolio')
      expect(enJsonld.description).not.toBe(ptJsonld.description)
    })
  })
})
