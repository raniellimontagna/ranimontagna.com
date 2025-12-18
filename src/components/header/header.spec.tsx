import { render } from '@/tests/functions'
import { Header } from './header'

// Mock useRouter
vi.mock('next/navigation', async () => {
  const actual = await vi.importActual('next/navigation')
  return {
    ...actual,
    useRouter: () => ({
      push: vi.fn(),
    }),
    usePathname: () => '/pt',
  }
})

// Mock useTheme to return mounted: true
vi.mock('@/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    mounted: true,
    setTheme: vi.fn(),
    initTheme: vi.fn(),
  }),
}))

// Mock useCommandMenu
vi.mock('@/store/useCommandMenu/useCommandMenu', () => ({
  useCommandMenu: () => ({
    isOpen: false,
    setOpen: vi.fn(),
    toggle: vi.fn(),
  }),
}))

describe('Header', () => {
  it('should render the header component', () => {
    const { container } = render(<Header />)

    expect(container.querySelector('header')).toBeInTheDocument()
  })

  it('should render the navigation', () => {
    const { container } = render(<Header />)

    expect(container.querySelector('nav')).toBeInTheDocument()
  })
})
