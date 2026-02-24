export type ChatMessage = {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: number
}

export type ChatState = {
  isOpen: boolean
  messages: ChatMessage[]
  isLoading: boolean
  error: string | null
  setOpen: (open: boolean) => void
  toggle: () => void
  sendMessage: (content: string, locale: string) => Promise<void>
  clearMessages: () => void
}
