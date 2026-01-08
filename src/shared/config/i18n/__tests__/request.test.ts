import requestConfig from '../request'

// Mock next-intl/server
vi.mock('next-intl/server', () => ({
  getRequestConfig: vi.fn((callback) => callback),
}))

// Mock next-intl
vi.mock('next-intl', () => ({
  hasLocale: (locales: string[], locale: string) => locales.includes(locale),
}))

// Mock dynamic import for messages
vi.mock('../../../../../messages/en.json', () => ({
  default: { welcome: 'Hello' },
}))

vi.mock('../../../../../messages/pt.json', () => ({
  default: { welcome: 'Olá' },
}))

describe('i18n request config', () => {
  const getConfig = requestConfig as unknown as (params: {
    requestLocale: Promise<string | undefined>
  }) => Promise<{ locale: string; messages: unknown }>

  it('uses requested locale if valid', async () => {
    const config = await getConfig({ requestLocale: Promise.resolve('en') })
    expect(config.locale).toBe('en')
    expect(config.messages).toEqual({ welcome: 'Hello' })
  })

  it('uses requested locale if valid (pt)', async () => {
    const config = await getConfig({ requestLocale: Promise.resolve('pt') })
    expect(config.locale).toBe('pt')
    expect(config.messages).toEqual({ welcome: 'Olá' })
  })

  it('falls back to default locale if requested locale is invalid', async () => {
    const config = await getConfig({ requestLocale: Promise.resolve('fr') })
    // Default is pt
    expect(config.locale).toBe('pt')
    expect(config.messages).toEqual({ welcome: 'Olá' })
  })

  it('falls back to default locale if requested locale is undefined', async () => {
    const config = await getConfig({ requestLocale: Promise.resolve(undefined) })
    expect(config.locale).toBe('pt')
    expect(config.messages).toEqual({ welcome: 'Olá' })
  })
})
