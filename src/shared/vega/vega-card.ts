/** Site cards Vega shows under an answer. Shared by the server and the client. */
export type VegaCardKind = 'case' | 'section' | 'page' | 'post'

export type VegaCard = {
  id: string
  kind: VegaCardKind
  /** Locale-less path; the client's next-intl Link adds the locale prefix. */
  href: string
  title: string
  summary: string
  image: string | null
}

const KINDS: ReadonlySet<string> = new Set(['case', 'section', 'page', 'post'])
const CARD_HREF =
  /^\/(?:projects(?:\/(?:klick|grimory))?|blog(?:\/[a-z0-9-]+)?|#(?:trajetoria|ia|atto|escrita))$/

/** Only internal paths from the closed list: no protocol, no other host. */
export function isAllowedCardHref(href: string): boolean {
  return CARD_HREF.test(href)
}

/** Keeps only well-formed cards with a known kind and an allowed href. */
export function sanitizeCards(value: unknown): VegaCard[] {
  if (!Array.isArray(value)) return []
  return value.filter((card): card is VegaCard => {
    if (!card || typeof card !== 'object') return false
    const c = card as Record<string, unknown>
    return (
      typeof c.id === 'string' &&
      typeof c.kind === 'string' &&
      KINDS.has(c.kind) &&
      typeof c.href === 'string' &&
      isAllowedCardHref(c.href) &&
      typeof c.title === 'string' &&
      typeof c.summary === 'string' &&
      (c.image === null || (typeof c.image === 'string' && c.image.startsWith('/')))
    )
  })
}
