import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { locales } from '@/i18n/routing'
import sitemap from './sitemap'

vi.mock('@/i18n/routing', () => ({ locales: [] }))

// Mock getAllPosts to return empty array
vi.mock('@/lib/blog', () => ({
  getAllPosts: vi.fn(async () => []),
}))

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

  it('should generate a sitemap with localized routes', async () => {
    mockLocales.push({ code: 'en', name: 'English' }, { code: 'pt-BR', name: 'Português' })

    const result = await sitemap()

    expect(result).toHaveLength(4) // 2 locales + 2 blog pages
    expect(result).toEqual(
      expect.arrayContaining([
        {
          url: `${baseUrl}/en`,
          lastModified: fixedDate,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/en/blog`,
          lastModified: fixedDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
        {
          url: `${baseUrl}/pt-BR`,
          lastModified: fixedDate,
          changeFrequency: 'monthly',
          priority: 0.9,
        },
        {
          url: `${baseUrl}/pt-BR/blog`,
          lastModified: fixedDate,
          changeFrequency: 'weekly',
          priority: 0.8,
        },
      ]),
    )
  })

  it('should return empty array when there are no locales', async () => {
    mockLocales.splice(0, mockLocales.length)

    const result = await sitemap()

    expect(result).toHaveLength(0)
    expect(result).toEqual([])
  })

  it('should handle a single locale correctly', async () => {
    mockLocales.push({ code: 'es', name: 'Español' })

    const result = await sitemap()

    expect(result).toHaveLength(2) // 1 locale + 1 blog page
    expect(result).toContainEqual({
      url: `${baseUrl}/es`,
      lastModified: fixedDate,
      changeFrequency: 'monthly',
      priority: 0.9,
    })
    expect(result).toContainEqual({
      url: `${baseUrl}/es/blog`,
      lastModified: fixedDate,
      changeFrequency: 'weekly',
      priority: 0.8,
    })
  })
})
