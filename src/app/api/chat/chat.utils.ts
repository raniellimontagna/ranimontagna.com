import {
  checkRateLimit,
  getRateLimitIdentifier,
  type RateLimitResult,
  resetRateLimitStateForTests,
} from '@/shared/lib/rate-limit'
import { FALLBACK_MESSAGES } from './chat.constants'

export type { RateLimitResult }
export { checkRateLimit, getRateLimitIdentifier, resetRateLimitStateForTests }

export const buildGeminiStream = (response: Response): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          // Legacy passthrough remains until Task 4 introduces buffered validation.
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (buffer.trim()) processLine(buffer)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) processLine(line)
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

export const buildOpenRouterStream = (response: Response): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      const encoder = new TextEncoder()

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      const processLine = (rawLine: string): void => {
        const line = rawLine.trim()
        if (!line.startsWith('data:')) return

        const jsonStr = line.slice(5).trim()
        if (!jsonStr || jsonStr === '[DONE]') return

        try {
          const parsed = JSON.parse(jsonStr)
          const text = parsed?.choices?.[0]?.delta?.content
          if (text) {
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`))
          }
        } catch {
          // Legacy passthrough remains until Task 4 introduces buffered validation.
        }
      }

      try {
        while (true) {
          const { done, value } = await reader.read()
          if (done) {
            if (buffer.trim()) processLine(buffer)
            break
          }

          buffer += decoder.decode(value, { stream: true })
          const lines = buffer.split(/\r?\n/)
          buffer = lines.pop() ?? ''

          for (const line of lines) processLine(line)
        }
      } finally {
        controller.enqueue(encoder.encode('data: [DONE]\n\n'))
        controller.close()
        reader.releaseLock()
      }
    },
  })
}

export const buildFallbackStream = (locale: string): ReadableStream => {
  const message = FALLBACK_MESSAGES[locale] ?? FALLBACK_MESSAGES.pt

  return new ReadableStream({
    start(controller) {
      controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify({ text: message })}\n\n`))
      controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
      controller.close()
    },
  })
}
