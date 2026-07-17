import { isApprovedChatUrl } from '@/shared/lib/chat-links'

const CHAT_LINK_CLASS_NAME =
  'underline underline-offset-2 decoration-accent-ice/50 transition-colors hover:text-accent-ice'

export function renderChatMarkdown(content: string): React.ReactNode[] {
  const nodes: React.ReactNode[] = []
  const tokenPattern = /(\*\*[^*]+\*\*|\[([^\]]+)\]\(([^)]+)\))/g
  let cursor = 0

  for (const match of content.matchAll(tokenPattern)) {
    const token = match[0]
    const offset = match.index

    if (offset > cursor) {
      nodes.push(content.slice(cursor, offset))
    }

    const label = match[2]
    const target = match[3]

    if (label !== undefined && target !== undefined) {
      if (isApprovedChatUrl(target)) {
        nodes.push(
          <a
            key={`link-${offset}`}
            href={target}
            target="_blank"
            rel="noopener noreferrer"
            className={CHAT_LINK_CLASS_NAME}
          >
            {label}
          </a>,
        )
      } else {
        nodes.push(label)
      }
    } else {
      nodes.push(<strong key={`strong-${offset}`}>{token.slice(2, -2)}</strong>)
    }

    cursor = offset + token.length
  }

  if (cursor < content.length) {
    nodes.push(content.slice(cursor))
  }

  return nodes
}
