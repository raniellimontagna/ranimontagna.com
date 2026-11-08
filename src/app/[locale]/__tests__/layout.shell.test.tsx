import { renderToStaticMarkup } from 'react-dom/server'
import LocaleLayout from '../layout'

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('next-intl', () => ({
  hasLocale: vi.fn().mockReturnValue(true),
  NextIntlClientProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}))

vi.mock('next-intl/server', () => ({
  setRequestLocale: vi.fn(),
  getMessages: vi
    .fn()
    .mockResolvedValue({ notFound: { title: 'Not found' }, vega: { label: 'Vega' } }),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/shared/shell', () => ({
  SiteHeader: () => <header data-testid="site-header" />,
  SiteFooter: () => <footer data-testid="site-footer" />,
  VegaLauncher: () => <button type="button" data-testid="vega-launcher" />,
  ShellWidgets: () => null,
}))

vi.mock('@/shared/components/retro-mode/retro-mode', () => ({
  RetroExperience: () => <div data-testid="retro-experience" />,
}))

describe('LocaleLayout shell', () => {
  it('renders the skip link, the shell around the page and no spectral background', async () => {
    const layout = await LocaleLayout({
      children: <main data-testid="locale-content">Content</main>,
      params: Promise.resolve({ locale: 'pt' }),
    })

    const markup = renderToStaticMarkup(layout)
    const document = new DOMParser().parseFromString(markup, 'text/html')
    const order = [...document.body.children].map(
      (child) => child.getAttribute('data-testid') ?? child.getAttribute('href') ?? child.tagName,
    )

    expect(document.querySelector('[data-testid="spectral-background"]')).toBeNull()
    expect(order.slice(0, 6)).toEqual([
      '#main-content',
      'retro-experience',
      'site-header',
      'locale-content',
      'site-footer',
      'vega-launcher',
    ])
  })

  it.each(['pt', 'en', 'es'])(
    'renders one canonical Person and WebSite entity for %s',
    async (locale) => {
      const layout = await LocaleLayout({
        children: <main id="main-content">Content</main>,
        params: Promise.resolve({ locale }),
      })

      const markup = renderToStaticMarkup(layout)
      const document = new DOMParser().parseFromString(markup, 'text/html')
      const entities = [...document.querySelectorAll('script[type="application/ld+json"]')].map(
        (script) => JSON.parse(script.textContent ?? '{}') as { '@id'?: string; '@type'?: string },
      )

      expect(entities.filter((entity) => entity['@type'] === 'Person')).toHaveLength(1)
      expect(entities.filter((entity) => entity['@type'] === 'WebSite')).toHaveLength(1)
      expect(entities.find((entity) => entity['@type'] === 'Person')?.['@id']).toMatch(/#person$/)
    },
  )

  it('renders a localized first-focusable skip link to the page main target', async () => {
    const layout = await LocaleLayout({
      children: <main id="main-content">Content</main>,
      params: Promise.resolve({ locale: 'pt' }),
    })

    const markup = renderToStaticMarkup(layout)
    const document = new DOMParser().parseFromString(markup, 'text/html')
    const firstBodyElement = document.body.firstElementChild
    const skipLink = document.querySelector('a[href="#main-content"]')

    expect(firstBodyElement).toBe(skipLink)
    expect(skipLink?.textContent).toBe('skipToContent')
    expect(skipLink?.classList.contains('focus:translate-y-0')).toBe(true)
  })
})
