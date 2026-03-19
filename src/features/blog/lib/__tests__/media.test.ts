import { BLOG_DEFAULT_IMAGE_URL, resolveBlogImageUrl } from '../media'

describe('blog media helpers', () => {
  it('returns the default image when cover image is missing', () => {
    expect(resolveBlogImageUrl()).toBe(BLOG_DEFAULT_IMAGE_URL)
  })

  it('preserves absolute cover image urls', () => {
    expect(resolveBlogImageUrl('https://example.com/cover.png')).toBe(
      'https://example.com/cover.png',
    )
  })

  it('converts relative cover image paths to absolute urls', () => {
    expect(resolveBlogImageUrl('/blog/cover.png')).toBe(
      'https://ranimontagna.com/blog/cover.png',
    )
  })
})
