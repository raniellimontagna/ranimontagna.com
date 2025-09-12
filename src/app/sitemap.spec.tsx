import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import sitemap from './sitemap'
import { locales } from '@/i18n/routing'

vi.mock('@/i18n/routing', () => ({ locales: [] }))

const mockLocales = vi.mocked(locales)

describe('sitemap', () => {
  const baseUrl = 'https://ranimontagna.com'
  const fixedDate = new Date('2025-09-12T12:00:00.000Z')

  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(fixedDate)
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.clearAllMocks()
  })

  it('should generate a sitemap with a root URL and localized routes', () => {
    mockLocales.push({ code: 'en', name: 'English' }, { code: 'pt-BR', name: 'Português' })

    const result = sitemap()

    expect(result).toHaveLength(3)
    expect(result).toEqual(
      expect.arrayContaining([
        {
          url: baseUrl,
          lastModified: fixedDate,
          changeFrequency: 'monthly',
          priority: 1,
        },
        {
          url: `${baseUrl}/en`,
          lastModified: fixedDate,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/pt-BR`,
          lastModified: fixedDate,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
      ]),
    )
  })

  it('should only generate the root URL when there are no locales', () => {
    mockLocales.splice(0, mockLocales.length)

    const result = sitemap()

    expect(result).toHaveLength(1)
    expect(result).toEqual([
      {
        url: baseUrl,
        lastModified: fixedDate,
        changeFrequency: 'monthly',
        priority: 1,
      },
    ])
  })

  it('should handle a single locale correctly', () => {
    mockLocales.push({ code: 'es', name: 'Español' })

    const result = sitemap()

    expect(result).toHaveLength(2)
    expect(result).toContainEqual({
      url: `${baseUrl}/es`,
      lastModified: fixedDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
    expect(result).toContainEqual({
      url: baseUrl,
      lastModified: fixedDate,
      changeFrequency: 'monthly',
      priority: 1,
    })
  })
})
