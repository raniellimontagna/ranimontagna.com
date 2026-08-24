import { formatBlogDate } from '../blog-date'

describe('formatBlogDate', () => {
  it.each([
    ['en', 'August 23, 2026'],
    ['pt', '23 de agosto de 2026'],
    ['es', '23 de agosto de 2026'],
  ])('formats a UTC calendar date for %s', (locale, expected) => {
    expect(formatBlogDate('2026-08-23', locale)).toBe(expected)
  })

  it('falls back to English for an invalid locale', () => {
    expect(formatBlogDate('2026-08-23', 'not-a-locale')).toBe('August 23, 2026')
  })
})
