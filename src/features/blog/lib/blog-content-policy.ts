import { serialize } from 'next-mdx-remote/serialize'
import remarkGfm from 'remark-gfm'
import { z } from 'zod'
import type { PostMetadata } from './blog.types'

export const BLOG_CONTENT_POLICY_VERSION = 2

const ISO_DATE = /^\d{4}-\d{2}-\d{2}$/
const SAFE_RELATIVE_MEDIA = /^\/(?!\/)/
const FORBIDDEN_KEYS = new Set(['__proto__', 'prototype', 'constructor'])

const isRealIsoDate = (value: string): boolean => {
  if (!ISO_DATE.test(value)) return false
  const [year, month, day] = value.split('-').map(Number)
  const parsed = new Date(Date.UTC(year, month - 1, day))
  return (
    parsed.getUTCFullYear() === year &&
    parsed.getUTCMonth() === month - 1 &&
    parsed.getUTCDate() === day
  )
}

const isSafeMediaUrl = (value: string): boolean => {
  if (SAFE_RELATIVE_MEDIA.test(value)) return true

  try {
    return new URL(value).protocol === 'https:'
  } catch {
    return false
  }
}

const normalizeYamlDate = (value: unknown): unknown => {
  if (!(value instanceof Date) || Number.isNaN(value.getTime())) return value
  const iso = value.toISOString()
  return iso.endsWith('T00:00:00.000Z') ? iso.slice(0, 10) : value
}

const frontmatterSchema = z
  .object({
    title: z.string().trim().min(1).max(200),
    date: z.preprocess(normalizeYamlDate, z.string().refine(isRealIsoDate)),
    description: z.string().trim().min(1).max(600),
    tags: z.array(z.string().trim().min(1).max(40)).max(20).default([]),
    published: z.boolean(),
    coverImage: z.string().trim().refine(isSafeMediaUrl).optional(),
  })
  .strict()

class BlogContentPolicyError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlogContentPolicyError'
  }
}

export function validateBlogFrontmatter(value: unknown, filenameDate: string): PostMetadata {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new BlogContentPolicyError('Invalid blog frontmatter')
  }

  if (Object.keys(value).some((key) => FORBIDDEN_KEYS.has(key))) {
    throw new BlogContentPolicyError('Invalid blog frontmatter')
  }

  const candidate = { ...value } as Record<string, unknown>
  if (candidate.date === undefined) candidate.date = filenameDate
  const result = frontmatterSchema.safeParse(candidate)

  if (!result.success) {
    throw new BlogContentPolicyError('Invalid blog frontmatter')
  }

  return result.data
}

const isSafeLinkDestination = (destination: string): boolean => {
  const decoded = destination
    .replace(/&#x([\da-f]+);?/gi, (_match, value: string) =>
      String.fromCodePoint(Number.parseInt(value, 16)),
    )
    .replace(/&#(\d+);?/g, (_match, value: string) =>
      String.fromCodePoint(Number.parseInt(value, 10)),
    )
    .replace(/&colon;/gi, ':')
    .replace(/&(?:tab|newline);/gi, '')
  const normalized = Array.from(decoded.trim().replace(/^<|>$/g, ''))
    .filter((character) => {
      const codePoint = character.codePointAt(0) ?? 0
      return codePoint > 32 && codePoint !== 127
    })
    .join('')
  if (/^(?:\/|#|\.\/|\.\.\/)/.test(normalized)) return !normalized.startsWith('//')

  try {
    const protocol = new URL(normalized).protocol
    return protocol === 'https:' || protocol === 'mailto:'
  } catch {
    return false
  }
}

interface MarkdownAstNode {
  type?: string
  url?: unknown
  children?: MarkdownAstNode[]
}

const FORBIDDEN_AST_TYPES = new Set([
  'html',
  'mdxjsEsm',
  'mdxFlowExpression',
  'mdxTextExpression',
  'mdxJsxFlowElement',
  'mdxJsxTextElement',
])

/** A Remark plugin that keeps the same fail-closed policy at the compiler boundary. */
export function remarkBlogContentPolicy() {
  return (tree: MarkdownAstNode): void => {
    const visit = (node: MarkdownAstNode): void => {
      if (node.type && FORBIDDEN_AST_TYPES.has(node.type)) {
        throw new BlogContentPolicyError('Unsafe blog content')
      }
      if (
        node.type &&
        (node.type === 'link' || node.type === 'image' || node.type === 'definition') &&
        (typeof node.url !== 'string' || !isSafeLinkDestination(node.url))
      ) {
        throw new BlogContentPolicyError('Unsafe blog content')
      }
      node.children?.forEach(visit)
    }
    visit(tree)
  }
}

/** Parses and compiles untrusted MDX without evaluating it, enforcing the AST policy before cache. */
export async function validateBlogMarkdown(markdown: string): Promise<void> {
  if (typeof markdown !== 'string' || markdown.length > 500_000) {
    throw new BlogContentPolicyError('Unsafe blog content')
  }

  try {
    await serialize(markdown, {
      mdxOptions: {
        remarkPlugins: [remarkGfm, remarkBlogContentPolicy],
      },
    })
  } catch {
    throw new BlogContentPolicyError('Unsafe blog content')
  }
}
