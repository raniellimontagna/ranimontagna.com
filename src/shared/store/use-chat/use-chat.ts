import { create } from 'zustand'
import { sanitizeCards } from '@/shared/vega/vega-card'
import type { ChatMessage, ChatState } from './use-chat.types'

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const useChat = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,
  failedQuestion: null,
  typingId: null,

  setOpen: (open) => set(open ? { isOpen: true } : { isOpen: false, typingId: null }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (content, locale) => {
    const previousQuestions = get()
      .messages.filter((message) => message.role === 'user')
      .slice(-5)
      .map((message) => message.content)

    const userMessage: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    }

    const assistantMessage: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    }

    set((state) => ({
      messages: [...state.messages, userMessage, assistantMessage],
      isLoading: true,
      error: null,
      failedQuestion: null,
    }))

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ locale, message: content, previousQuestions }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error ?? `HTTP ${response.status}`)
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        throw new Error('No response stream')
      }

      let buffer = ''

      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          if (parsed.text) {
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: m.content + parsed.text } : m,
              ),
            }))
          }
          if (parsed.cards) {
            const cards = sanitizeCards(parsed.cards)
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, cards } : m,
              ),
            }))
          }
        } catch {
          // Skip malformed chunks
        }
      }

      while (true) {
        const { done, value } = await reader.read()
        if (done) {
          if (buffer.trim()) {
            processLine(buffer)
          }
          break
        }

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split(/\r?\n/)
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          processLine(line)
        }
      }

      reader.releaseLock()
      set((state) => ({ typingId: state.isOpen ? assistantMessage.id : null }))
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      set((state) => ({
        error: errorMessage,
        failedQuestion: content,
        messages: state.messages.filter((m) => m.id !== assistantMessage.id),
      }))
    } finally {
      set({ isLoading: false })
    }
  },

  retry: async (locale) => {
    const question = get().failedQuestion
    if (!question) return
    // The failed question is still on screen; drop it so the resend shows it once.
    set((state) => {
      const last = state.messages.at(-1)
      const keep =
        last?.role === 'user' && last.content === question
          ? state.messages.slice(0, -1)
          : state.messages
      return { messages: keep }
    })
    await get().sendMessage(question, locale)
  },

  finishTyping: () => set({ typingId: null }),

  clearMessages: () => set({ messages: [], error: null, failedQuestion: null, typingId: null }),
}))
