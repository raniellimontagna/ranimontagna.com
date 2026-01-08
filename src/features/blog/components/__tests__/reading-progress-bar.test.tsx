import { act, render } from '@/tests/test-utils'
import { ReadingProgressBar } from '../reading-progress-bar'

describe('ReadingProgressBar Component', () => {
  it('updates progress on scroll', () => {
    // Mock scroll dimensions
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 2000, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true })
    Object.defineProperty(window, 'scrollY', { value: 0, writable: true })

    render(<ReadingProgressBar />)

    // Initial state: 0%
    const bar = document.querySelector('.bg-gradient-to-r')
    expect(bar).toHaveStyle({ width: '0%' })

    // Scroll to 50%
    act(() => {
      window.scrollY = 500
      window.dispatchEvent(new Event('scroll'))
    })

    expect(bar).toHaveStyle({ width: '50%' })

    // Scroll to 100%
    act(() => {
      window.scrollY = 1000
      window.dispatchEvent(new Event('scroll'))
    })
    expect(bar).toHaveStyle({ width: '100%' })
  })

  it('handles scrollHeight <= 0', () => {
    // If page is short, progress should stay 0 or not crash
    Object.defineProperty(document.documentElement, 'scrollHeight', { value: 500, writable: true })
    Object.defineProperty(window, 'innerHeight', { value: 1000, writable: true }) // no scroll

    render(<ReadingProgressBar />)
    const bar = document.querySelector('.bg-gradient-to-r')
    expect(bar).toHaveStyle({ width: '0%' })
  })
})
