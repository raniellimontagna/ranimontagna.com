import { BASE_URL } from '@/shared/lib/constants'

export const BLOG_DEFAULT_IMAGE_PATH = '/images/blog-fallback.webp'
export const BLOG_DEFAULT_IMAGE_URL = `${BASE_URL}${BLOG_DEFAULT_IMAGE_PATH}`

const APPROVED_BLOG_MEDIA_HOSTS = new Set([
  'images.unsplash.com',
  'media.ranimontagna.com',
  'cdn.ranimontagna.com',
])

function parseApprovedAbsoluteUrl(value: string): URL | null {
  try {
    const url = new URL(value)
    return url.protocol === 'https:' && APPROVED_BLOG_MEDIA_HOSTS.has(url.hostname) ? url : null
  } catch {
    return null
  }
}

function normalizeBaseUrl(value?: string): string | null {
  const trimmed = value?.trim()
  return trimmed ? trimmed.replace(/\/+$/, '') : null
}

function normalizeRelativePath(value: string): string {
  return value.startsWith('/') ? value : `/${value}`
}

function isSafeRelativePath(value: string): boolean {
  const normalized = value.trim()
  return (
    normalized.length > 0 &&
    !normalized.startsWith('//') &&
    !normalized.includes('\\') &&
    !/^[a-z][a-z\d+.-]*:/i.test(normalized)
  )
}

function joinUrl(baseUrl: string, path: string): string {
  return `${baseUrl}${normalizeRelativePath(path)}`
}

function getBlogMediaBaseUrl(): string | null {
  return normalizeBaseUrl(process.env.NEXT_PUBLIC_BLOG_MEDIA_URL)
}

export function resolveBlogMediaUrl(src?: string | null): string | undefined {
  const value = src?.trim()
  if (!value) {
    return undefined
  }

  if (/^[a-z][a-z\d+.-]*:/i.test(value)) {
    return parseApprovedAbsoluteUrl(value)?.toString()
  }

  if (!isSafeRelativePath(value)) return undefined

  const mediaBaseUrl = getBlogMediaBaseUrl()
  const candidate = mediaBaseUrl ? joinUrl(mediaBaseUrl, value) : normalizeRelativePath(value)
  if (mediaBaseUrl && !parseApprovedAbsoluteUrl(candidate)) return undefined
  return candidate
}

export function resolveBlogImageUrl(src?: string | null): string {
  const resolved = resolveBlogMediaUrl(src)
  if (!resolved) return BLOG_DEFAULT_IMAGE_URL
  return resolved.startsWith('/') ? joinUrl(BASE_URL, resolved) : resolved
}
