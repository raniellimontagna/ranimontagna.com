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
  getMessages: vi.fn().mockResolvedValue({ notFound: { title: 'Not found' } }),
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
}))

vi.mock('@/shared/components/spectral-background/spectral-background', () => ({
  SpectralBackground: () => <div data-testid="spectral-background" />,
}))

vi.mock('@/shared/components/web-vitals/web-vitals', () => ({
  WebVitals: ({ consentGranted }: { consentGranted?: boolean }) => (
    <div data-consent-granted={String(Boolean(consentGranted))} data-testid="web-vitals" />
  ),
}))

describe('LocaleLayout spectral background', () => {
  it('mounts the shared background exactly once before locale content', async () => {
    const layout = await LocaleLayout({
      children: <main data-testid="locale-content">Content</main>,
      params: Promise.resolve({ locale: 'pt' }),
    })

    const markup = renderToStaticMarkup(layout)
    const document = new DOMParser().parseFromString(markup, 'text/html')
    const bodyChildren = [...document.body.children]

    expect(document.querySelectorAll('[data-testid="spectral-background"]')).toHaveLength(1)
    expect(bodyChildren[0]?.getAttribute('href')).toBe('#main-content')
    expect(bodyChildren[1]?.getAttribute('data-testid')).toBe('spectral-background')
    expect(bodyChildren[2]?.getAttribute('data-testid')).toBe('locale-content')
  })

  it('mounts one inert metrics bridge until explicit consent exists', async () => {
    const layout = await LocaleLayout({
      children: <main id="main-content">Content</main>,
      params: Promise.resolve({ locale: 'pt' }),
    })

    const markup = renderToStaticMarkup(layout)
    const document = new DOMParser().parseFromString(markup, 'text/html')
    const bridges = document.querySelectorAll('[data-testid="web-vitals"]')

    expect(bridges).toHaveLength(1)
    expect(bridges[0]?.getAttribute('data-consent-granted')).toBe('false')
  })

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
