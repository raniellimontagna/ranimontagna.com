import type { VegaCard } from '@/shared/vega/vega-card'

export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  /** Site cards the server attached to this answer. */
  cards?: VegaCard[]
}

export type ChatState = {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  /** The question that failed, so "try again" can resend it. */
  failedQuestion: string | null
  /** The answer still being typed out on screen; cleared when Vega closes. */
  typingId: string | null
  setOpen: (open: boolean) => void
  toggle: () => void
  sendMessage: (content: string, locale: string) => Promise<void>
  retry: (locale: string) => Promise<void>
  finishTyping: () => void
  clearMessages: () => void
}
