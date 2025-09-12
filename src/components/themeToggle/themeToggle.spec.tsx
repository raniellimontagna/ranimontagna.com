import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { ThemeToggle } from './themeToggle'

// Mock next-intl
vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, params?: Record<string, string>) => {
    if (key === 'themeToggle.ariaLabel') {
      return `Switch to ${params?.mode} mode`
    }
    if (key === 'themeToggle.tooltip') {
      return `Switch to ${params?.mode} mode`
    }
    return key
  },
}))

// Mock useTheme hook
vi.mock('@/hooks/useTheme', () => ({
  useTheme: () => ({
    theme: 'dark',
    toggleTheme: vi.fn(),
    mounted: true,
  }),
}))

describe('ThemeToggle', () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
      },
      writable: true,
    })

    // Mock matchMedia
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    })
  })

  it('should render theme toggle button', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button).toBeDefined()
    expect(button.getAttribute('aria-label')).toBe('Switch to light mode')
  })

  it('should have proper accessibility attributes', () => {
    render(<ThemeToggle />)

    const button = screen.getByRole('button')
    expect(button.getAttribute('aria-label')).toBeTruthy()
    expect(button.getAttribute('title')).toBeTruthy()
  })
})
