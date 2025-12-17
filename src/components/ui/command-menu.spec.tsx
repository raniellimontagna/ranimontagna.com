import { fireEvent, render } from '@testing-library/react'
import { CommandMenu } from './command-menu'
import { useCommandMenu } from '@/store/useCommandMenu/useCommandMenu'

// Mock ResizeObserver for cmdk
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
global.ResizeObserver = ResizeObserverMock

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string) => key,
}))

// Mock stores
vi.mock('@/store/useCommandMenu/useCommandMenu', () => ({
  useCommandMenu: vi.fn(() => ({
    isOpen: false, // Start closed to avoid cmdk rendering issues
    setOpen: vi.fn(),
    toggle: vi.fn(),
  })),
}))

vi.mock('@/store/useTheme/useTheme', () => ({
  useTheme: () => ({
    theme: 'light',
    mounted: true,
    setTheme: vi.fn(),
  }),
}))

// Mock useRouter
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
}))

describe('CommandMenu', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useCommandMenu).mockReturnValue({
      isOpen: false,
      setOpen: vi.fn(),
      toggle: vi.fn(),
    })
  })

  describe('keyboard shortcut', () => {
    it('should register keyboard listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      render(<CommandMenu />)

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      addEventListenerSpy.mockRestore()
    })

    it('should remove keyboard listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const { unmount } = render(<CommandMenu />)
      unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      removeEventListenerSpy.mockRestore()
    })

    it('should toggle menu on Cmd+K', () => {
      const mockToggle = vi.fn()
      vi.mocked(useCommandMenu).mockReturnValue({
        isOpen: false,
        setOpen: vi.fn(),
        toggle: mockToggle,
      })

      render(<CommandMenu />)

      fireEvent.keyDown(document, { key: 'k', metaKey: true })

      expect(mockToggle).toHaveBeenCalled()
    })

    it('should toggle menu on Ctrl+K', () => {
      const mockToggle = vi.fn()
      vi.mocked(useCommandMenu).mockReturnValue({
        isOpen: false,
        setOpen: vi.fn(),
        toggle: mockToggle,
      })

      render(<CommandMenu />)

      fireEvent.keyDown(document, { key: 'k', ctrlKey: true })

      expect(mockToggle).toHaveBeenCalled()
    })

    it('should not toggle menu on regular K key', () => {
      const mockToggle = vi.fn()
      vi.mocked(useCommandMenu).mockReturnValue({
        isOpen: false,
        setOpen: vi.fn(),
        toggle: mockToggle,
      })

      render(<CommandMenu />)

      fireEvent.keyDown(document, { key: 'k' })

      expect(mockToggle).not.toHaveBeenCalled()
    })
  })
})
