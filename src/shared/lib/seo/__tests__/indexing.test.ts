import { isIndexingDisabled, robotsMetadata, withNoindexHeader } from '../indexing'

describe('indexing', () => {
  it('is disabled only when SITE_NOINDEX is "1"', () => {
    expect(isIndexingDisabled({ SITE_NOINDEX: '1' })).toBe(true)
    expect(isIndexingDisabled({ SITE_NOINDEX: '0' })).toBe(false)
    expect(isIndexingDisabled({})).toBe(false)
  })

  it('returns noindex robots when disabled and the production robots otherwise', () => {
    expect(robotsMetadata(true)).toEqual({
      index: false,
      follow: false,
      googleBot: { index: false, follow: false },
    })
    expect(robotsMetadata(false)).toMatchObject({
      index: true,
      follow: true,
      googleBot: { index: true, 'max-image-preview': 'large' },
    })
  })

  it('adds X-Robots-Tag only when disabled', () => {
    expect(withNoindexHeader(new Response(), true).headers.get('x-robots-tag')).toBe(
      'noindex, nofollow',
    )
    expect(withNoindexHeader(new Response(), false).headers.get('x-robots-tag')).toBeNull()
  })
})
