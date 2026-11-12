'use client'

import { useEffect } from 'react'
import type { ChatMessage } from '@/shared/store/use-chat/use-chat.types'
import { useTypewriter } from './use-typewriter'
import { VegaCardView } from './vega-card-view'
import { renderVegaMarkdown } from './vega-markdown'

type VegaMessageProps = {
  message: ChatMessage
  typing: boolean
  cardCta: string
  onTyped: () => void
  onOpenCard: () => void
}

export function VegaMessage({ message, typing, cardCta, onTyped, onOpenCard }: VegaMessageProps) {
  const { text: shown, done } = useTypewriter(message.content, typing)

  useEffect(() => {
    if (typing && done) onTyped()
  }, [typing, done, onTyped])

  if (message.role === 'user') {
    return (
      <p className="max-w-[80%] self-end rounded-[14px_14px_4px_14px] border border-line bg-surface px-3.5 py-2 text-sm text-foreground">
        {message.content}
      </p>
    )
  }

  return (
    <div
      aria-busy={typing && !done ? true : undefined}
      className="flex flex-col gap-3 text-[15px] leading-relaxed text-foreground"
    >
      <p className="whitespace-pre-wrap">{renderVegaMarkdown(shown)}</p>
      {done && message.cards?.length ? (
        <div className="grid gap-2 sm:grid-cols-2">
          {message.cards.map((card) => (
            <VegaCardView key={card.id} card={card} cta={cardCta} onOpen={onOpenCard} />
          ))}
        </div>
      ) : null}
    </div>
  )
}
