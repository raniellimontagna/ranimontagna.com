import { locales, routing } from './routing'

describe('i18n routing', () => {
  describe('locales', () => {
    it('contains Portuguese locale', () => {
      const pt = locales.find((l) => l.code === 'pt')

      expect(pt).toBeDefined()
      expect(pt?.name).toBe('Português (BR)')
    })

    it('contains English locale', () => {
      const en = locales.find((l) => l.code === 'en')

      expect(en).toBeDefined()
      expect(en?.name).toBe('English (US)')
    })

    it('contains Spanish locale', () => {
      const es = locales.find((l) => l.code === 'es')

      expect(es).toBeDefined()
      expect(es?.name).toBe('Español (ES)')
    })

    it('has exactly 3 locales', () => {
      expect(locales).toHaveLength(3)
    })

    it('each locale has code and name', () => {
      for (const locale of locales) {
        expect(locale.code).toBeDefined()
        expect(locale.name).toBeDefined()
        expect(typeof locale.code).toBe('string')
        expect(typeof locale.name).toBe('string')
      }
    })
  })

  describe('routing config', () => {
    it('has locales array from locales config', () => {
      expect(routing.locales).toBeDefined()
      expect(Array.isArray(routing.locales)).toBe(true)
    })

    it('has Portuguese as default locale', () => {
      expect(routing.defaultLocale).toBe('pt')
    })

    it('locales contain only codes', () => {
      expect(routing.locales).toContain('pt')
      expect(routing.locales).toContain('en')
      expect(routing.locales).toContain('es')
    })
  })
})
