// Only what the Atto site publishes (attodev.com.br, content/site.ts in the atto repo).
export const ATTO_CONTACT = {
  whatsappNumber: '5554999906417',
  site: 'https://attodev.com.br',
} as const

/** Same rule as the Atto site: the message travels pre-filled, nothing is sent without a click. */
export function attoWhatsappHref(message: string): string {
  return `https://wa.me/${ATTO_CONTACT.whatsappNumber}?text=${encodeURIComponent(message)}`
}

export type AttoCaseId = 'fronteira-sul-drones' | 'tala' | 'quadralize' | 'nan'

/** `image` is a real capture of the live site, framed; null when there is no public site. */
export const ATTO_CASES: readonly {
  id: AttoCaseId
  name: string
  url: string | null
  image: string | null
}[] = [
  {
    id: 'fronteira-sul-drones',
    name: 'Fronteira Sul Drones',
    url: 'https://fronteirasuldrones.com',
    image: '/redesign/atto/fronteira.webp',
  },
  { id: 'tala', name: 'TALA Drone Partners', url: null, image: null },
  {
    id: 'quadralize',
    name: 'Quadralize',
    url: 'https://quadralize.com.br',
    image: '/redesign/atto/quadralize.webp',
  },
  {
    id: 'nan',
    name: 'NaN Solutions',
    url: 'https://nansolutions.com.br',
    image: '/redesign/atto/nan.webp',
  },
]

export const ATTO_SERVICES = ['web', 'mobile', 'apis', 'ai', 'marketing'] as const
