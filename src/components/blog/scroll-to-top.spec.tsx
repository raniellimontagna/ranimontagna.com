import { fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { ScrollToTop } from './scroll-to-top'

describe('ScrollToTop', () => {
  beforeEach(() => {
    // Mock window.scrollTo
    window.scrollTo = vi.fn()
    // Reset scroll position
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 0,
    })
  })

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('should not be visible initially when scroll is at top', () => {
    render(<ScrollToTop />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })
    expect(button).toHaveClass('opacity-0')
    expect(button).toHaveClass('pointer-events-none')
  })

  it('should become visible after scrolling past threshold', () => {
    render(<ScrollToTop threshold={300} />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })

    // Simulate scrolling
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500,
    })
    fireEvent.scroll(window)

    expect(button).toHaveClass('opacity-100')
    expect(button).not.toHaveClass('pointer-events-none')
  })

  it('should hide when scrolling back above threshold', () => {
    render(<ScrollToTop threshold={300} />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })

    // Scroll down
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 500,
    })
    fireEvent.scroll(window)
    expect(button).toHaveClass('opacity-100')

    // Scroll back up
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 200,
    })
    fireEvent.scroll(window)
    expect(button).toHaveClass('opacity-0')
  })

  it('should scroll to top when clicked', () => {
    render(<ScrollToTop />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })

    fireEvent.click(button)

    expect(window.scrollTo).toHaveBeenCalledWith({
      top: 0,
      behavior: 'smooth',
    })
  })

  it('should not render when enabled is false', () => {
    const { container } = render(<ScrollToTop enabled={false} />)
    expect(container.firstChild).toBeNull()
  })

  it('should use custom threshold', () => {
    render(<ScrollToTop threshold={1000} />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })

    // Scroll to 800 (below threshold)
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 800,
    })
    fireEvent.scroll(window)
    expect(button).toHaveClass('opacity-0')

    // Scroll to 1200 (above threshold)
    Object.defineProperty(window, 'scrollY', {
      writable: true,
      value: 1200,
    })
    fireEvent.scroll(window)
    expect(button).toHaveClass('opacity-100')
  })

  it('should have proper accessibility attributes', () => {
    render(<ScrollToTop />)
    const button = screen.getByRole('button', { name: /voltar ao topo/i })

    expect(button).toHaveAttribute('type', 'button')
    expect(button).toHaveAttribute('aria-label', 'Voltar ao topo')
  })

  it('should clean up event listener on unmount', () => {
    const removeEventListenerSpy = vi.spyOn(window, 'removeEventListener')
    const { unmount } = render(<ScrollToTop />)

    unmount()

    expect(removeEventListenerSpy).toHaveBeenCalledWith('scroll', expect.any(Function))
  })
})
