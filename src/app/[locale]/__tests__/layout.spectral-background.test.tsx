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
}))

vi.mock('@/shared/components/spectral-background/spectral-background', () => ({
  SpectralBackground: () => <div data-testid="spectral-background" />,
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
    expect(bodyChildren[0]?.getAttribute('data-testid')).toBe('spectral-background')
    expect(bodyChildren[1]?.getAttribute('data-testid')).toBe('locale-content')
  })
})
