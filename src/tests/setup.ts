import '@testing-library/jest-dom/vitest'
import { setupDOMMocks } from './mocks'

setupDOMMocks()

vi.mock('next-intl', () => ({
  useTranslations: () => {
    const t = (key: string) => key
    t.raw = (key: string) => [key]
    t.rich = (key: string) => key
    return t
  },
  useLocale: () => 'pt',
}))

vi.mock('next-intl/routing', () => ({
  defineRouting: vi.fn((config: Record<string, unknown>) => config),
}))

vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  useSearchParams: () => new URLSearchParams(),
}))

// Mock the next-intl navigation helper so createNavigation() is never
// executed in test environments (it imports next/navigation internally
// using ESM bare specifiers that don't resolve in Vitest/Node).
vi.mock('@/shared/config/i18n/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    prefetch: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
  }),
  usePathname: () => '/',
  Link: ({ children, href }: { children: React.ReactNode; href: string }) =>
    `<a href="${href}">${children}</a>`,
  redirect: vi.fn(),
  permanentRedirect: vi.fn(),
  getPathname: vi.fn(),
}))

beforeAll(() => {
  vi.spyOn(console, 'log').mockImplementation(() => {})
})

afterAll(() => {
  vi.restoreAllMocks()
})
