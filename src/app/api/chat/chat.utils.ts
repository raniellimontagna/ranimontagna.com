import * as Sentry from '@sentry/nextjs'
import { FALLBACK_MESSAGES, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS } from './chat.constants'
import type { GeminiContent, OpenRouterMessage, ParsedRequest } from './chat.schema'

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

export const checkRateLimit = (ip: string): boolean => {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return true
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return false
  }

  entry.count++
  return true
}

export const callGemini = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) return null

  try {
    const contents: GeminiContent[] = messages.map((msg) => ({
      role: msg.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: msg.content }],
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:streamGenerateContent?alt=sse&key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: systemPrompt }] },
          contents,
          generationConfig: {
            temperature: 0.7,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: 'HARM_CATEGORY_HARASSMENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_HATE_SPEECH', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
            { category: 'HARM_CATEGORY_DANGEROUS_CONTENT', threshold: 'BLOCK_MEDIUM_AND_ABOVE' },
          ],
        }),
      },
    )

    if (!response.ok) {
      const errorBody = await response.text()
      console.error('Gemini API error:', errorBody)
      Sentry.captureMessage('Gemini API returned non-OK response', {
        level: 'warning',
        tags: { feature: 'chatbot', provider: 'gemini' },
        extra: { status: response.status, statusText: response.statusText, errorBody },
      })
      return null
    }

    return response
  } catch (error) {
    console.error('Gemini call failed:', error)
    Sentry.captureException(error, {
      tags: { feature: 'chatbot', provider: 'gemini' },
    })
    return null
  }
}

export const callOpenRouter = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.OPENROUTER_API_KEY
  if (!apiKey) return null

  try {
    const openRouterModels = [
      process.env.OPENROUTER_MODEL_PRIMARY ?? 'google/gemma-3-4b-it:free',
      process.env.OPENROUTER_MODEL_FALLBACK ?? 'openrouter/auto',
    ]

    const promptAsUserContext = [
      'Use these instructions as your operating policy for this conversation:',
      systemPrompt,
    ].join('\n\n')

    const openRouterMessages: OpenRouterMessage[] = [
      { role: 'user', content: promptAsUserContext },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    for (const model of openRouterModels) {
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': 'https://ranimontagna.com',
          'X-Title': 'Rani Digital',
        },
        body: JSON.stringify({
          model,
          messages: openRouterMessages,
          stream: true,
          max_tokens: 1024,
          temperature: 0.7,
        }),
      })

      if (response.ok) {
        if (model !== openRouterModels[0]) {
          Sentry.captureMessage('OpenRouter fallback model was used', {
            level: 'info',
            tags: { feature: 'chatbot', provider: 'openrouter' },
            extra: { model },
          })
        }

        return response
      }

      const errorBody = await response.text()
      console.error(`OpenRouter API error (${model}):`, errorBody)
      Sentry.captureMessage('OpenRouter API returned non-OK response', {
        level: 'warning',
        tags: { feature: 'chatbot', provider: 'openrouter' },
        extra: { model, status: response.status, statusText: response.statusText, errorBody },
      })
    }

    return null
  } catch (error) {
    console.error('OpenRouter call failed:', error)
    Sentry.captureException(error, {
      tags: { feature: 'chatbot', provider: 'openrouter' },
    })
    return null
  }
}

export const callGroq = async (
  systemPrompt: string,
  messages: ParsedRequest['messages'],
): Promise<Response | null> => {
  const apiKey = process.env.GROQ_API_KEY
  if (!apiKey) return null

  try {
    const model = process.env.GROQ_MODEL ?? 'llama-3.1-8b-instant'

    const groqMessages: OpenRouterMessage[] = [
      { role: 'system', content: systemPrompt },
      ...messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: groqMessages,
        stream: true,
        max_tokens: 1024,
        temperature: 0.7,
      }),
    })

    if (!response.ok) {
      const errorBody = await response.text()
      console.error(`Groq API error (${model}):`, errorBody)
      Sentry.captureMessage('Groq API returned non-OK response', {
        level: 'warning',
        tags: { feature: 'chatbot', provider: 'groq' },
        extra: { model, status: response.status, statusText: response.statusText, errorBody },
      })
      return null
    }

    return response
  } catch (error) {
    console.error('Groq call failed:', error)
    Sentry.captureException(error, {
      tags: { feature: 'chatbot', provider: 'groq' },
    })
    return null
  }
}

export const buildGeminiStream = (response: Response): ReadableStream => {
  return new ReadableStream({
    async start(controller) {
      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      try {
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
              const text = parsed?.candidates?.[0]?.content?.parts?.[0]?.text
              if (text) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`),
                )
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      } finally {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
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

      if (!reader) {
        controller.close()
        return
      }

      let buffer = ''

      try {
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
              const text = parsed?.choices?.[0]?.delta?.content
              if (text) {
                controller.enqueue(
                  new TextEncoder().encode(`data: ${JSON.stringify({ text })}\n\n`),
                )
              }
            } catch {
              // Skip malformed JSON chunks
            }
          }
        }
      } finally {
        controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'))
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
