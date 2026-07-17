import { CHAT_CONTACT_LINKS } from '@/shared/lib/chat-links'
import { FALLBACK_MESSAGES } from '../chat.constants'

describe('chat fallback messages', () => {
  it.each(
    Object.entries(FALLBACK_MESSAGES),
  )('uses only approved contact links in the %s fallback', (_locale, message) => {
    expect(message).toContain(`[LinkedIn](${CHAT_CONTACT_LINKS.linkedin})`)
    expect(message).toContain(`[GitHub](${CHAT_CONTACT_LINKS.github})`)
    expect(message).not.toContain('https://linkedin.com/in/rannimontagna')
  })
})
