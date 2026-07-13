import { buildSystemPrompt } from './chat.prompt'

export const SYSTEM_PROMPT_PT = buildSystemPrompt('pt')
export const SYSTEM_PROMPT_EN = buildSystemPrompt('en')
export const SYSTEM_PROMPT_ES = buildSystemPrompt('es')

export const FALLBACK_MESSAGES: Record<string, string> = {
  pt: 'Estou temporariamente indisponível 😅 Mas você pode falar diretamente comigo pelo [LinkedIn](https://linkedin.com/in/rannimontagna) ou acessar meu [GitHub](https://github.com/RanielliMontagna) para ver meus projetos!',
  en: "I'm temporarily unavailable 😅 But you can reach me directly on [LinkedIn](https://linkedin.com/in/rannimontagna) or check out my [GitHub](https://github.com/RanielliMontagna) to see my projects!",
  es: 'Estoy temporalmente no disponible 😅 ¡Pero puedes contactarme directamente en [LinkedIn](https://linkedin.com/in/rannimontagna) o ver mis proyectos en [GitHub](https://github.com/RanielliMontagna)!',
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const

export const RATE_LIMIT_MAX = 20
export const RATE_LIMIT_WINDOW_MS = 60_000

const timeoutFromEnv = Number(process.env.CHAT_PROVIDER_TIMEOUT_MS)
export const CHAT_PROVIDER_TIMEOUT_MS =
  Number.isFinite(timeoutFromEnv) && timeoutFromEnv > 0 ? timeoutFromEnv : 12_000
