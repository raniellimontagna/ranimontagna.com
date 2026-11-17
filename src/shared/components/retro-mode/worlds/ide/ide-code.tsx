import type { ReactNode } from 'react'
import { Link } from '@/shared/config/i18n/navigation'

const TOKEN =
  /\[([^\]]+)\]\(([^)\s]+)\)|(\/\/.*$)|("(?:[^"\\]|\\.)*")|\b(export|const|default|import|from|as|type|return|function)\b|\b(\d+)\b|(?<=^\s+)([A-Za-z]\w*)(?=:)/g

function isLink(value: string) {
  return value.startsWith('/') || value.startsWith('https://') || value.startsWith('mailto:')
}

function Target({ href, children }: { href: string; children: ReactNode }) {
  if (href.startsWith('/'))
    return (
      <Link href={href} prefetch={false} className="ide-link">
        {children}
      </Link>
    )
  return (
    <a
      href={href}
      className="ide-link"
      {...(href.startsWith('https://') ? { target: '_blank', rel: 'noreferrer' } : {})}
    >
      {children}
    </a>
  )
}

/**
 * Just enough highlighting for Markdown, JSON and TypeScript: headings, links,
 * strings, keys, keywords, comments and numbers. Paths and URLs are real links.
 */
export function CodeLine({ text }: { text: string }) {
  if (/^#{1,6} /.test(text)) return <span className="tok-heading">{text}</span>
  if (text.startsWith('> ')) return <span className="tok-quote">{text}</span>
  if (text === '---') return <span className="tok-keyword">{text}</span>

  const parts: ReactNode[] = []
  let last = 0
  for (const match of text.matchAll(TOKEN)) {
    const index = match.index ?? 0
    if (index > last) parts.push(text.slice(last, index))
    const [whole, linkText, linkHref, comment, string, keyword, number, property] = match
    const key = `${index}-${whole}`
    if (linkText && linkHref) {
      parts.push(
        <span key={key} className="tok-md-link">
          [<Target href={linkHref}>{linkText}</Target>]
          <span className="tok-muted">({linkHref})</span>
        </span>,
      )
    } else if (comment) {
      parts.push(
        <span key={key} className="tok-comment">
          {comment}
        </span>,
      )
    } else if (string) {
      const inner = string.slice(1, -1)
      const isKey = text[index + string.length] === ':'
      parts.push(
        <span key={key} className={isKey ? 'tok-key' : 'tok-string'}>
          {isLink(inner) ? (
            <>
              "<Target href={inner}>{inner}</Target>"
            </>
          ) : (
            string
          )}
        </span>,
      )
    } else if (keyword) {
      parts.push(
        <span key={key} className="tok-keyword">
          {keyword}
        </span>,
      )
    } else if (property) {
      parts.push(
        <span key={key} className="tok-key">
          {property}
        </span>,
      )
    } else if (number) {
      parts.push(
        <span key={key} className="tok-number">
          {number}
        </span>,
      )
    }
    last = index + whole.length
  }
  if (last < text.length) parts.push(text.slice(last))
  return <>{parts}</>
}
