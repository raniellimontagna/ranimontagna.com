import { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'

export const FALLBACK_MESSAGES: Record<string, string> = {
  pt: `Estou temporariamente indisponível 😅 Mas você pode falar diretamente comigo pelo [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) ou acessar meu [GitHub](${CHAT_CONTACT_LINKS.github}) para ver meus projetos!`,
  en: `I'm temporarily unavailable 😅 But you can reach me directly on [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) or check out my [GitHub](${CHAT_CONTACT_LINKS.github}) to see my projects!`,
  es: `Estoy temporalmente no disponible 😅 ¡Pero puedes contactarme directamente en [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) o ver mis proyectos en [GitHub](${CHAT_CONTACT_LINKS.github})!`,
}

export const SSE_HEADERS = {
  'Content-Type': 'text/event-stream',
  'Cache-Control': 'no-cache',
  Connection: 'keep-alive',
} as const

export const RATE_LIMIT_MAX = 20
export const RATE_LIMIT_WINDOW_MS = 60_000
export const CHAT_DEFAULT_TOTAL_DEADLINE_MS = 12_000
export const CHAT_MAX_TOTAL_DEADLINE_MS = 60_000
