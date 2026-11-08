import { renderToStaticMarkup } from 'react-dom/server'
import { getClientMessages } from '@/shared/config/i18n/client-messages'
import enMessages from '../../../../messages/en.json'
import BlogLayout from '../blog/layout'
import LocaleLayout from '../layout'
import HomePage from '../page'
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
    heroContent,
    bodyContent,
  }: {
    heroContent: React.ReactNode
    bodyContent: React.ReactNode
  }) => (
    <main>
      {heroContent}
      {bodyContent}
    </main>
  ),
}))

vi.mock('@/features/home/components/hero/hero-2026', () => ({
  Hero2026: vi.fn(async () => <div>Hero</div>),
}))

vi.mock('@/features/home/components/home-body', () => ({
  HomeBody: vi.fn(async () => <div>Body</div>),
}))

function readProviderMessages(element: React.ReactNode): unknown[] {
  const markup = renderToStaticMarkup(element)
  const document = new DOMParser().parseFromString(markup, 'text/html')

  return [...document.querySelectorAll('[data-client-messages]')].map((provider) =>
    JSON.parse(provider.getAttribute('data-client-messages') ?? 'null'),
  )
}

vi.mock('@/shared/shell', () => ({
  SiteHeader: () => null,
  SiteFooter: () => null,
  VegaLauncher: () => null,
  ScrollProgress: () => null,
  ShellWidgets: () => null,
}))

describe('route-scoped client message providers', () => {
  beforeEach(() => {
    mocks.getMessages.mockResolvedValue(enMessages)
  })

  it('serializes the not-found and chat namespaces in the locale shell', async () => {
    const layout = await LocaleLayout({
      children: <main>Content</main>,
      params: Promise.resolve({ locale: 'en' }),
    })

    expect(readProviderMessages(layout)).toEqual([getClientMessages(enMessages, 'shell')])
  })

  it('serializes only home client-island namespaces on the home route', async () => {
    const page = await HomePage({ params: Promise.resolve({ locale: 'en' }) })
    const [messages] = readProviderMessages(page)
    const markup = renderToStaticMarkup(page)
    const document = new DOMParser().parseFromString(markup, 'text/html')
    const profilePage = document.querySelector('script[type="application/ld+json"]')

    expect(messages).toEqual(getClientMessages(enMessages, 'home'))
    expect(messages).not.toHaveProperty('blog')
    expect(messages).not.toHaveProperty('projectsPage')
    expect(JSON.parse(profilePage?.textContent ?? '{}')).toMatchObject({
      '@type': 'ProfilePage',
      mainEntity: { '@type': 'Person' },
    })
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
