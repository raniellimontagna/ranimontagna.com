import { APPROVED_CHAT_URLS, CHAT_CONTACT_LINKS, isApprovedChatUrl } from '../chat-links'

describe('shared chat link policy', () => {
  it('contains only the three exact approved HTTPS contact URLs', () => {
    expect(CHAT_CONTACT_LINKS).toEqual({
      github: 'https://github.com/RanielliMontagna',
      linkedin: 'https://www.linkedin.com/in/rannimontagna',
      website: 'https://ranimontagna.com',
    })
    expect(APPROVED_CHAT_URLS).toEqual([
      CHAT_CONTACT_LINKS.github,
      CHAT_CONTACT_LINKS.linkedin,
      CHAT_CONTACT_LINKS.website,
    ])
    expect(APPROVED_CHAT_URLS.every((url) => new URL(url).protocol === 'https:')).toBe(true)
  })

  it('requires an exact URL match', () => {
    expect(isApprovedChatUrl(CHAT_CONTACT_LINKS.linkedin)).toBe(true)
    expect(isApprovedChatUrl('https://linkedin.com/in/rannimontagna')).toBe(false)
    expect(isApprovedChatUrl(`${CHAT_CONTACT_LINKS.website}/`)).toBe(false)
    expect(isApprovedChatUrl('javascript:alert(1)')).toBe(false)
  })

  it.each([
    ['HTTP', 'http://ranimontagna.com'],
    ['JavaScript', 'javascript:alert(1)'],
    ['data', 'data:text/html,hello'],
    ['relative', '/contact'],
    ['trailing slash', 'https://ranimontagna.com/'],
    ['query string', 'https://ranimontagna.com?next=evil'],
    ['fragment', 'https://ranimontagna.com#contact'],
    ['lookalike host', 'https://ranimontagna.com.evil.example'],
    ['userinfo', 'https://ranimontagna.com@evil.example'],
    ['leading whitespace', ' https://ranimontagna.com'],
    ['trailing whitespace', 'https://ranimontagna.com '],
    ['Markdown title', 'https://ranimontagna.com "Portfolio"'],
  ])('rejects a non-exact %s URL', (_case, value) => {
    expect(isApprovedChatUrl(value)).toBe(false)
  })
})
