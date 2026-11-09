import { create } from 'zustand'
import { sanitizeCards } from '@/shared/vega/vega-card'
import type { ChatMessage, ChatState } from './use-chat.types'

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

/** The error code Vega shows in its own words: the server's rate limit (429). */
export const RATE_LIMIT_ERROR = 'rate-limit'

// The answer being streamed, so "Nova conversa" (or a newer question) can stop it.
let inFlight: AbortController | null = null

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

    inFlight?.abort()
    const controller = new AbortController()
    inFlight = controller

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
        signal: controller.signal,
      })

      if (response.status === 429) throw new Error(RATE_LIMIT_ERROR)
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
        if (controller.signal.aborted) return
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          if (parsed.text) {
            // Text and the typing flag land together, so the answer mounts already typing.
            set((state) => ({
              messages: state.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, content: m.content + parsed.text } : m,
              ),
              typingId: state.isOpen ? assistantMessage.id : state.typingId,
            }))
          }
          if (parsed.fallback === true) {
            set((state) => ({
              failedQuestion: content,
              typingId: state.typingId === assistantMessage.id ? null : state.typingId,
              messages: state.messages.map((m) =>
                m.id === assistantMessage.id ? { ...m, fallback: true } : m,
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
    } catch (error) {
      // Stopped on purpose (new conversation or a newer question): nothing to report.
      if (controller.signal.aborted) return
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      set((state) => ({
        error: errorMessage,
        failedQuestion: content,
        messages: state.messages.filter((m) => m.id !== assistantMessage.id),
      }))
    } finally {
      if (inFlight === controller) {
        inFlight = null
        set({ isLoading: false })
      }
    }
  },

  retry: async (locale) => {
    const question = get().failedQuestion
    if (!question) return
    // The failed question (and the fallback under it) are still on screen; drop
    // them so the resend shows the question once.
    set((state) => {
      const messages = [...state.messages]
      if (messages.at(-1)?.fallback) messages.pop()
      const last = messages.at(-1)
      if (last?.role === 'user' && last.content === question) messages.pop()
      return { messages, failedQuestion: null }
    })
    await get().sendMessage(question, locale)
  },

  finishTyping: () => set({ typingId: null }),

  clearMessages: () => {
    inFlight?.abort()
    inFlight = null
    set({ messages: [], error: null, failedQuestion: null, typingId: null, isLoading: false })
  },
}))
