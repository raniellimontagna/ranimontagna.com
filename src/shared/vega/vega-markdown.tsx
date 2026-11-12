import type { ReactNode } from 'react'
import { isApprovedChatUrl } from '@/shared/lib/chat-links'

const LINK_CLASS_NAME =
  'underline underline-offset-2 decoration-accent/60 transition-colors hover:text-accent'

/** Bold and approved links only; any other link keeps just its label. */
export function renderVegaMarkdown(content: string): ReactNode[] {
  const nodes: ReactNode[] = []
  const tokenPattern = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g
  let cursor = 0

  for (const match of content.matchAll(tokenPattern)) {
    const token = match[0]
    const offset = match.index
    if (offset > cursor) nodes.push(content.slice(cursor, offset))

    const label = match[2]
    const target = match[3]
    if (label !== undefined && target !== undefined) {
      nodes.push(
        isApprovedChatUrl(target) ? (
          <a
            key={`link-${offset}`}
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            className={LINK_CLASS_NAME}
          >
            {label}
          </a>
        ) : (
          label
        ),
      )
    } else {
      nodes.push(<strong key={`strong-${offset}`}>{token.slice(2, -2)}</strong>)
    }
    cursor = offset + token.length
  }

  if (cursor < content.length) nodes.push(content.slice(cursor))
  return nodes
}
