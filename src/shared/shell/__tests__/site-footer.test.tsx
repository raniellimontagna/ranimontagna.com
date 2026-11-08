import { readFileSync } from 'node:fs'
import { render, screen } from '@/tests/test-utils'
import { SiteFooter } from '../site-footer'

vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

describe('SiteFooter', () => {
  it('keeps all six retro secrets', async () => {
    render(await SiteFooter())
    const modes = Array.from(document.querySelectorAll('[data-retro-secret]')).map((el) =>
      el.getAttribute('data-retro-secret'),
    )
    expect(modes.sort()).toEqual(['dos', 'gameboy', 'ide', 'mac', 'newspaper', 'xp'])
  })

  it('links the blog and the projects', async () => {
    render(await SiteFooter())
    expect(screen.getByRole('link', { name: 'footer.blog' })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: 'footer.projects' })).toHaveAttribute(
      'href',
      '/projects',
    )
  })

  it('gives the footer links 44 px tap targets', async () => {
    render(await SiteFooter())
    for (const name of ['footer.blog', 'footer.projects']) {
      expect(screen.getByRole('link', { name }).className).toContain('min-h-11')
    }
  })
})

describe('root layout', () => {
  it('no longer renders the spectral background', () => {
    const source = readFileSync('src/app/[locale]/layout.tsx', 'utf8')
    expect(source).not.toContain('SpectralBackground')
    expect(source).toContain('SiteHeader')
    expect(source).toContain('SiteFooter')
  })
})
