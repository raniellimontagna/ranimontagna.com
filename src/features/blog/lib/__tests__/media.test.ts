import { BLOG_DEFAULT_IMAGE_URL, resolveBlogImageUrl, resolveBlogMediaUrl } from '../media'

const originalBlogMediaUrl = process.env.NEXT_PUBLIC_BLOG_MEDIA_URL

describe('blog media helpers', () => {
  afterEach(() => {
    if (originalBlogMediaUrl === undefined) {
      delete process.env.NEXT_PUBLIC_BLOG_MEDIA_URL
      return
    }

    process.env.NEXT_PUBLIC_BLOG_MEDIA_URL = originalBlogMediaUrl
  })

  it('returns the default image when cover image is missing', () => {
    expect(resolveBlogImageUrl()).toBe(BLOG_DEFAULT_IMAGE_URL)
  })

  it('preserves absolute cover image urls', () => {
    expect(resolveBlogImageUrl('https://example.com/cover.png')).toBe(
      'https://example.com/cover.png',
    )
  })

  it('converts relative cover image paths to absolute urls', () => {
    expect(resolveBlogImageUrl('/blog/cover.png')).toBe('https://ranimontagna.com/blog/cover.png')
  })

  it('uses the configured blog media base url for SEO image urls', () => {
    process.env.NEXT_PUBLIC_BLOG_MEDIA_URL = 'https://media.ranimontagna.com/'

    expect(resolveBlogImageUrl('/blog/cover.png')).toBe(
      'https://media.ranimontagna.com/blog/cover.png',
    )
  })

  it('keeps rendered relative media paths local when no media base is configured', () => {
    expect(resolveBlogMediaUrl('blog/cover.png')).toBe('/blog/cover.png')
  })

  it('uses the configured blog media base url for rendered media paths', () => {
    process.env.NEXT_PUBLIC_BLOG_MEDIA_URL = 'https://media.ranimontagna.com/assets/'

    expect(resolveBlogMediaUrl('/blog/cover.png')).toBe(
      'https://media.ranimontagna.com/assets/blog/cover.png',
    )
  })
})
