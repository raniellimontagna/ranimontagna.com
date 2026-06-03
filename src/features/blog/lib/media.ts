import { BASE_URL } from '@/shared/lib/constants'

export const BLOG_DEFAULT_IMAGE_PATH = '/og-image.png'
export const BLOG_DEFAULT_IMAGE_URL = `${BASE_URL}${BLOG_DEFAULT_IMAGE_PATH}`

function isAbsoluteUrl(value: string): boolean {
  return /^https?:\/\//i.test(value)
}

function normalizeBaseUrl(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : null
}

function normalizeRelativePath(value: string): string {
  return value.startsWith('/') ? value : `/${value}`
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${normalizeRelativePath(path)}`
}

function getBlogMediaBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_BLOG_MEDIA_URL)
}

export function resolveBlogMediaUrl(src?: string | null): string | undefined {
  if (!src) {
    return undefined
  }

  if (isAbsoluteUrl(src)) {
    return src
  }

  const mediaBaseUrl = getBlogMediaBaseUrl()
  return mediaBaseUrl ? joinUrl(mediaBaseUrl, src) : normalizeRelativePath(src)
}

export function resolveBlogImageUrl(src?: string | null): string {
  if (!src) {
    return BLOG_DEFAULT_IMAGE_URL
  }

  if (isAbsoluteUrl(src)) {
    return src
  }

  return joinUrl(getBlogMediaBaseUrl() ?? BASE_URL, src)
}
