import { CHAT_PROFILE_BY_LOCALE } from '../chat.profile'
import type { ChatRuntimeContext } from '../chat.prompt'
import type { validateChatAnswer } from '../chat.response'

const runtime: ChatRuntimeContext = {
  currentDate: '2026-07-16',
  timeZone: 'America/Sao_Paulo',
}

export const createValidationInput = (
  answer: string,
  overrides: Partial<Parameters<typeof validateChatAnswer>[0]> = {},
): Parameters<typeof validateChatAnswer>[0] => ({
  answer,
  locale: 'pt',
  profile: CHAT_PROFILE_BY_LOCALE.pt,
  runtime,
  visitorMessage: 'Você tem um emprego fixo?',
  ...overrides,
})
