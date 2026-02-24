import { create } from 'zustand'
import type { ChatMessage, ChatState } from './use-chat.types'

const generateId = (): string => `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

export const useChat = create<ChatState>((set, get) => ({
  isOpen: false,
  messages: [],
  isLoading: false,
  error: null,

  setOpen: (open) => set({ isOpen: open }),
  toggle: () => set((state) => ({ isOpen: !state.isOpen })),

  sendMessage: async (content, locale) => {
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
    }))

    try {
      const allMessages = get().messages
      const apiMessages = allMessages
        .filter((m) => m.content.length > 0)
        .map((m) => ({ role: m.role, content: m.content }))

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages, locale }),
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

      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n')
        buffer = lines.pop() ?? ''

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue
          const jsonStr = line.slice(6).trim()
          if (!jsonStr || jsonStr === '[DONE]') continue

          try {
            const parsed = JSON.parse(jsonStr)
            if (parsed.text) {
              set((state) => ({
                messages: state.messages.map((m) =>
                  m.id === assistantMessage.id ? { ...m, content: m.content + parsed.text } : m,
                ),
              }))
            }
          } catch {
            // Skip malformed chunks
          }
        }
      }

      reader.releaseLock()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'

      set((state) => ({
        error: errorMessage,
        messages: state.messages.filter((m) => m.id !== assistantMessage.id),
      }))
    } finally {
      set({ isLoading: false })
    }
  },

  clearMessages: () => set({ messages: [], error: null }),
}))
