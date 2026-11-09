import { fireEvent, render, screen } from '@/tests/test-utils'
import { ATTO_CASES, attoWhatsappHref } from '../atto.data'
import { AttoSection } from '../atto-section'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('Atto data', () => {
  it('keeps the old site anchors for the Atto block (#services, #atto-front)', async () => {
    render(await AttoSection())
    const section = document.getElementById('atto') as HTMLElement
    for (const id of ['services', 'atto-front']) {
      expect(section.querySelector(`#${id}`)).not.toBeNull()
    }
  })

  it('builds the WhatsApp link like the Atto site', () => {
    expect(attoWhatsappHref('Oi, quero um app')).toBe(
      'https://wa.me/5554999906417?text=Oi%2C%20quero%20um%20app',
    )
  })

  it('shows only the cases the Atto site publishes', () => {
    expect(ATTO_CASES.map((c) => c.id)).toEqual([
      'fronteira-sul-drones',
      'tala',
      'quadralize',
      'nan',
    ])
  })
})

describe('AttoSection', () => {
  it('renders the Atto CTA as an external WhatsApp link', async () => {
    render(await AttoSection())
    const cta = screen.getByRole('link', { name: 'ctaWhatsapp' })
    expect(cta.getAttribute('href')).toBe(attoWhatsappHref('whatsappMessage'))
    expect(cta).toHaveAttribute('target', '_blank')
    expect(document.getElementById('atto')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: 'Atto' })).toBeInTheDocument()
  })

  it('lists the four cases, with details reachable by keyboard', async () => {
    render(await AttoSection())
    const summaries = document.querySelectorAll('details > summary')
    expect(summaries).toHaveLength(4)
    const first = summaries[0].parentElement as HTMLDetailsElement
    expect(first.open).toBe(false)
    fireEvent.click(summaries[0])
    expect(first.open).toBe(true)
    expect(screen.getByText('cases.fronteira-sul-drones.description')).toBeInTheDocument()
  })

  it('links a case site only when the Atto site lists one', async () => {
    render(await AttoSection())
    const links = screen.getAllByRole('link', { name: /visitSite/ })
    expect(links.map((a) => a.getAttribute('href'))).toEqual([
      'https://fronteirasuldrones.com',
      'https://quadralize.com.br',
      'https://nansolutions.com.br',
    ])
  })

  it('shows a real capture inside every case', async () => {
    render(await AttoSection())
    for (const item of ATTO_CASES) {
      const panel = document.querySelector(`[data-atto-case="${item.id}"]`) as HTMLElement
      const img = panel.querySelector('img')
      // Served from its static copies, named after the capture.
      expect(img?.getAttribute('src')).toMatch(
        /^\/redesign\/copies\/v1\/redesign-atto-[a-z-]+-\d+\.webp$/,
      )
    }
  })
})
