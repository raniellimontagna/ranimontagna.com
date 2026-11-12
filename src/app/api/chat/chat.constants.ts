import { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'

export const FALLBACK_MESSAGES: Record<string, string> = {
  pt: `Não consegui responder agora 😅 Enquanto isso, dá para falar com o Ranielli pelo [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) ou ver os projetos dele no [GitHub](${CHAT_CONTACT_LINKS.github}).`,
  en: `I couldn't answer right now 😅 Meanwhile, you can reach Ranielli on [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) or see his projects on [GitHub](${CHAT_CONTACT_LINKS.github}).`,
  es: `No pude responder ahora 😅 Mientras tanto, puedes hablar con Ranielli por [LinkedIn](${CHAT_CONTACT_LINKS.linkedin}) o ver sus proyectos en [GitHub](${CHAT_CONTACT_LINKS.github}).`,
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
