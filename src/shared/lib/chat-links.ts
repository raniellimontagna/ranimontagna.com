export const CHAT_CONTACT_LINKS = {
  github: 'https://github.com/RanielliMontagna',
  linkedin: 'https://www.linkedin.com/in/rannimontagna',
  website: 'https://ranimontagna.com',
} as const

export const APPROVED_CHAT_URLS = [
  CHAT_CONTACT_LINKS.github,
  CHAT_CONTACT_LINKS.linkedin,
  CHAT_CONTACT_LINKS.website,
] as const

const APPROVED_CHAT_URL_SET: ReadonlySet<string> = new Set(APPROVED_CHAT_URLS)

export function isApprovedChatUrl(value: string): value is (typeof APPROVED_CHAT_URLS)[number] {
  return APPROVED_CHAT_URL_SET.has(value)
}
