import { BASE_URL } from '@/shared/lib/constants'

export const BLOG_DEFAULT_IMAGE_PATH = '/og-image.png'
export const BLOG_DEFAULT_IMAGE_URL = `${BASE_URL}${BLOG_DEFAULT_IMAGE_PATH}`

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

export function resolveBlogImageUrl(src?: string | null): string {
  if (!src) {
    return BLOG_DEFAULT_IMAGE_URL
  }

  if (isAbsoluteUrl(src)) {
    return src
  }

  return src.startsWith('/') ? `${BASE_URL}${src}` : `${BASE_URL}/${src}`
}
