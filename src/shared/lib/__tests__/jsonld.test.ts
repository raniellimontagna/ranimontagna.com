import { BASE_URL } from '../constants'
import {
  generateBlogJsonLd,
  generateBlogPostingJsonLd,
  generatePersonJsonLd,
  generateWebsiteJsonLd,
  serializeJsonLd,
} from '../jsonld'

describe('jsonld', () => {
  describe('serializeJsonLd', () => {
    it('preserves data while escaping markup that could close the script element', () => {
      const value = { description: '</script><script>alert("xss")</script>' }
      const serialized = serializeJsonLd(value)

      expect(serialized).not.toContain('<')
      expect(serialized).toContain('\\u003c/script>')
      expect(JSON.parse(serialized)).toEqual(value)
    })
  })

  describe('blog structured data', () => {
    it('builds a localized Blog entity with live post summaries', () => {
      const jsonld = generateBlogJsonLd({
        locale: 'es',
        name: 'Ideas',
        description: 'Artículos',
        posts: [
          {
            slug: 'hola',
            title: 'Hola',
            description: 'Primer artículo',
            date: '2026-08-23',
            tags: ['web'],
          },
        ],
      })

      expect(jsonld).toMatchObject({
        '@type': 'Blog',
        '@id': `${BASE_URL}/es/blog#blog`,
        inLanguage: 'es',
      })
      expect(jsonld.blogPost).toHaveLength(1)
      expect(jsonld.blogPost[0]?.url).toBe(`${BASE_URL}/es/blog/hola`)
    })

    it('builds the canonical BlogPosting entity formerly owned by the head file', () => {
      const jsonld = generateBlogPostingJsonLd({
        locale: 'pt',
        slug: 'post',
        title: 'Post',
        description: 'Descrição',
        date: '2026-08-23',
        imageUrl: `${BASE_URL}/post.webp`,
        tags: ['next'],
      })

      expect(jsonld).toMatchObject({
        '@type': 'BlogPosting',
        '@id': `${BASE_URL}/blog/post#blogposting`,
        image: [`${BASE_URL}/post.webp`],
        inLanguage: 'pt',
      })
    })
  })

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

      expect(jsonld.jobTitle).toBe('Full Stack Software Engineer')
    })

    it('returns Portuguese jobTitle for "pt" locale', () => {
      const jsonld = generatePersonJsonLd('pt')

      expect(jsonld.jobTitle).toBe('Engenheiro de Software Full Stack')
    })

    it('returns Spanish jobTitle for "es" locale', () => {
      const jsonld = generatePersonJsonLd('es')

      expect(jsonld.jobTitle).toBe('Ingeniero de Software Full Stack')
    })

    it('falls back to English for unknown locale', () => {
      const jsonld = generatePersonJsonLd('fr')

      expect(jsonld.jobTitle).toBe('Full Stack Software Engineer')
      expect(jsonld.description).toContain('Full Stack Software Engineer')
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

  describe('blog structured data', () => {
    it('serializes JSON-LD without allowing a script breakout', () => {
      const marker = '</script><script>marker()</script>'
      const serialized = serializeJsonLd({ marker })

      expect(serialized).not.toContain('<')
      expect(JSON.parse(serialized)).toEqual({ marker })
    })

    it('generates localized Blog and BlogPosting documents', () => {
      const blog = generateBlogJsonLd({
        url: `${BASE_URL}/en/blog`,
        locale: 'en',
        name: 'Thinking Aloud',
        description: 'Articles',
        posts: [
          {
            slug: 'safe-post',
            title: 'Safe Post',
            description: 'A post',
            date: '2026-08-23',
            tags: ['security'],
          },
        ],
      })
      const posting = generateBlogPostingJsonLd({
        url: `${BASE_URL}/en/blog/safe-post`,
        blogUrl: `${BASE_URL}/en/blog`,
        locale: 'en',
        title: 'Safe Post',
        description: 'A post',
        date: '2026-08-23',
        image: `${BASE_URL}/images/blog-fallback.webp`,
        tags: ['security'],
      })

      expect(blog).toMatchObject({ '@type': 'Blog', inLanguage: 'en' })
      expect(blog.blogPost[0]).toMatchObject({ '@type': 'BlogPosting', headline: 'Safe Post' })
      expect(posting).toMatchObject({
        '@type': 'BlogPosting',
        headline: 'Safe Post',
        datePublished: '2026-08-23',
      })
      expect(posting.breadcrumb.itemListElement).toHaveLength(3)
    })
  })
})
