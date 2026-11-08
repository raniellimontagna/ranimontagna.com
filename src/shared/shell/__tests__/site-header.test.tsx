import { render, screen } from '@/tests/test-utils'
import { SiteHeader } from '../site-header'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('SiteHeader', () => {
  it('links every home section, the blog and the projects', async () => {
    render(await SiteHeader())
    const nav = screen.getByRole('navigation', { name: 'nav.label' })
    const hrefs = Array.from(nav.querySelectorAll('a')).map((a) => a.getAttribute('href'))
    expect(hrefs).toEqual(['/#no-ar', '/#trajetoria', '/#atto', '/#escrita', '/blog', '/projects'])
  })

  it('links the name back home', async () => {
    render(await SiteHeader())
    expect(screen.getByRole('link', { name: 'Ranielli Montagna' })).toHaveAttribute('href', '/')
  })

  it('transitions the translate property it slides on', async () => {
    render(await SiteHeader())
    expect(document.querySelector('header')?.className).toContain('transition-[translate,')
  })

  it('gives the name link a 44 px tap target', async () => {
    render(await SiteHeader())
    expect(screen.getByRole('link', { name: 'Ranielli Montagna' }).className).toContain('min-h-11')
  })

  it('shows the RM mark next to the name', async () => {
    render(await SiteHeader())
    const link = screen.getByRole('link', { name: 'Ranielli Montagna' })
    expect(link.querySelector('svg[data-rm-mark]')).not.toBeNull()
  })
})
