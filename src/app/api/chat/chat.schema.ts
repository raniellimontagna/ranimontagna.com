import { z } from 'zod'

export const messageSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(2000),
})

export const requestSchema = z.object({
  messages: z.array(messageSchema).min(1).max(50),
  locale: z.enum(['pt', 'en', 'es']).default('pt'),
})

export type ParsedRequest = z.infer<typeof requestSchema>

export type GeminiContent = {
  role: 'user' | 'model'
  parts: Array<{ text: string }>
}

export type OpenRouterMessage = {
  role: 'system' | 'user' | 'assistant'
  content: string
}
