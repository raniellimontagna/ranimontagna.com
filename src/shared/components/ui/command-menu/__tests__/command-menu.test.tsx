import { fireEvent, render, screen, waitFor } from '@/tests/test-utils'
import { CommandMenu } from '../command-menu'

// Mocks
const mockPush = vi.fn()
const mockSetOpen = vi.fn()
const mockToggle = vi.fn()
const mockSetTheme = vi.fn()
const mockScrollIntoView = vi.fn()

vi.mock('next/navigation', () => ({
  useRouter: () => ({ push: mockPush }),
}))

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

vi.mock('@/shared/store/useCommandMenu/useCommandMenu', () => ({
  useCommandMenu: () => ({
    isOpen: true,
    setOpen: mockSetOpen,
    toggle: mockToggle,
  }),
}))

vi.mock('@/shared/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    setTheme: mockSetTheme,
  }),
}))

describe('CommandMenu Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    // Mock scrollIntoView on Element prototype to ensure it's available on all elements
    Element.prototype.scrollIntoView = mockScrollIntoView
    // Mock window.open
    vi.spyOn(window, 'open').mockImplementation(() => null)
  })

  afterEach(() => {
    vi.restoreAllMocks()
    // Clean up prototype mock if needed, though subsequent tests overwrite it.
    // Ideally: delete Element.prototype.scrollIntoView
    // biome-ignore lint/suspicious/noExplicitAny: Deleting mocked property
    delete (Element.prototype as any).scrollIntoView
  })

  it('renders when open', () => {
    render(<CommandMenu />)
    // Check that at least one element with the text exists
    const titles = screen.getAllByText('Global Command Menu')
    expect(titles.length).toBeGreaterThan(0)
    expect(screen.getByPlaceholderText('placeholder')).toBeInTheDocument()
  })

  it('navigates to section on selection (scroll)', async () => {
    render(<CommandMenu />)
    const mockElement = document.createElement('div')
    // Ensure the mock element has the mock method (redundant if prototype is mocked but safe)
    mockElement.scrollIntoView = mockScrollIntoView
    vi.spyOn(document, 'getElementById').mockReturnValue(mockElement)

    // Find "about" option
    const items = screen.getAllByRole('option')
    const aboutItem = items.find((item) => item.textContent?.includes('about'))
    if (!aboutItem) throw new Error('About item not found')

    fireEvent.click(aboutItem)

    expect(mockSetOpen).toHaveBeenCalledWith(false)
    await waitFor(() => {
      expect(mockScrollIntoView).toHaveBeenCalledWith({ behavior: 'smooth' })
    })
  })

  it('navigates to route on selection (router push)', () => {
    render(<CommandMenu />)
    vi.spyOn(document, 'getElementById').mockReturnValue(null)

    const items = screen.getAllByRole('option')
    const blogItem = items.find((item) => item.textContent?.includes('blog'))
    if (!blogItem) throw new Error('Blog item not found')

    fireEvent.click(blogItem)

    expect(mockSetOpen).toHaveBeenCalledWith(false)
    expect(mockPush).toHaveBeenCalledWith('/blog')
  })

  it('opens external link on selection', () => {
    render(<CommandMenu />)

    const items = screen.getAllByRole('option')
    const githubItem = items.find((item) => item.textContent?.includes('GitHub'))
    if (!githubItem) throw new Error('GitHub item not found')

    fireEvent.click(githubItem)

    expect(mockSetOpen).toHaveBeenCalledWith(false)
    expect(window.open).toHaveBeenCalledWith('https://github.com/raniellimontagna', '_blank')
  })

  it('changes theme on selection', () => {
    render(<CommandMenu />)

    const items = screen.getAllByRole('option')
    const darkItem = items.find((item) => item.textContent?.includes('dark'))
    if (!darkItem) throw new Error('Dark theme item not found')

    fireEvent.click(darkItem)

    expect(mockSetOpen).toHaveBeenCalledWith(false)
    expect(mockSetTheme).toHaveBeenCalledWith('dark')
  })
})
