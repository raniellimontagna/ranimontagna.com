import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { ScrollToTop } from '../scroll-to-top'

describe('ScrollToTop Component', () => {
  beforeEach(() => {
    // Default scroll to top 0
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })
    window.scrollTo = vi.fn()
  })

  it('is not rendered or focusable while scrollY is below the threshold', () => {
    render(<ScrollToTop threshold={400} />)
    expect(screen.queryByRole('button', { hidden: true })).not.toBeInTheDocument()
  })

  it('becomes visible when scrolled past threshold', () => {
    render(<ScrollToTop threshold={400} />)

    act(() => {
      window.scrollY = 401
      window.dispatchEvent(new Event('scroll'))
    })

    const button = screen.getByRole('button')
    expect(button).toHaveClass('opacity-100')
    expect(button).not.toHaveClass('pointer-events-none')
  })

  it('scrolls to top when clicked', () => {
    render(<ScrollToTop threshold={400} />)

    // Make visible
    act(() => {
      window.scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(window.scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'smooth' })
  })

  it('does not render if enabled is false', () => {
    render(<ScrollToTop enabled={false} />)
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })
})
