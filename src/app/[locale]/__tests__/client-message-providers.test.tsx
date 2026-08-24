import { renderToStaticMarkup } from 'react-dom/server'
import enMessages from '../../../../messages/en.json'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import LocaleLayout from '../layout'
import HomePage from '../page'
import BlogLayout from '../blog/layout'
import ProjectsLayout from '../projects/layout'

const mocks = vi.hoisted(() => ({
  getMessages: vi.fn(),
}))

vi.mock('next/navigation', () => ({
  notFound: vi.fn(),
}))

vi.mock('next-intl', () => ({
  hasLocale: vi.fn().mockReturnValue(true),
  NextIntlClientProvider: ({
    children,
    messages,
  }: {
    children: React.ReactNode
    messages?: unknown
  }) => <div data-client-messages={JSON.stringify(messages)}>{children}</div>,
}))

vi.mock('next-intl/server', () => ({
  getMessages: mocks.getMessages,
  getTranslations: vi.fn().mockResolvedValue((key: string) => key),
  setRequestLocale: vi.fn(),
}))

vi.mock('@/features/home', () => ({
  Home: ({
    headerContent,
    heroContent,
  }: {
    headerContent: React.ReactNode
    heroContent: React.ReactNode
  }) => (
    <main>
      {headerContent}
      {heroContent}
    </main>
  ),
}))

vi.mock('@/features/home/components/hero/hero', () => ({
  Hero: vi.fn(async () => <div>Hero</div>),
}))

vi.mock('@/features/home/components/home-header', () => ({
  HomeHeader: () => <div>Home header</div>,
}))

vi.mock('@/features/projects/components', () => ({
  ProjectsHeader: () => <div>Projects header</div>,
}))

vi.mock('@/features/blog/components', () => ({
  BlogHeader: () => <div>Blog header</div>,
}))

vi.mock('@/shared/components/spectral-background/spectral-background', () => ({
  SpectralBackground: () => <div data-testid="spectral-background" />,
}))

vi.mock('@/shared/components/web-vitals/web-vitals', () => ({
  WebVitals: () => null,
}))

function readProviderMessages(element: React.ReactNode): unknown[] {
  const markup = renderToStaticMarkup(element)
  const document = new DOMParser().parseFromString(markup, 'text/html')

  return [...document.querySelectorAll('[data-client-messages]')].map((provider) =>
    JSON.parse(provider.getAttribute('data-client-messages') ?? 'null'),
  )
}

describe('route-scoped client message providers', () => {
  beforeEach(() => {
    mocks.getMessages.mockResolvedValue(enMessages)
  })

  it('serializes only the not-found namespace in the locale shell', async () => {
    const layout = await LocaleLayout({
      children: <main>Content</main>,
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(readProviderMessages(layout)).toEqual([getClientMessages(enMessages, 'shell')])
  })

  it('serializes only home client-island namespaces on the home route', async () => {
    const page = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
    const [messages] = readProviderMessages(page)

    expect(messages).toEqual(getClientMessages(enMessages, 'home'))
    expect(messages).not.toHaveProperty('blog')
    expect(messages).not.toHaveProperty('projectsPage')
  })

  it('serializes only project client-island namespaces on the projects route', async () => {
    const layout = await ProjectsLayout({
      children: <div>Projects</div>,
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(readProviderMessages(layout)).toEqual([getClientMessages(enMessages, 'projects')])
  })

  it('serializes only blog client-island namespaces without article bodies', async () => {
    const layout = await BlogLayout({
      children: <article>Unique article body</article>,
      params: Promise.resolve({ locale: 'en' }),
    })
    const [messages] = readProviderMessages(layout)

    expect(messages).toEqual(getClientMessages(enMessages, 'blog'))
    expect(JSON.stringify(messages)).not.toContain('Unique article body')
  })
})
