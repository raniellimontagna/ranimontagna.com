import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { FeaturedCarousel } from '../featured-carousel'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority: _priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    // biome-ignore lint/performance/noImgElement: test double for next/image
  }) => <img alt={alt} {...props} />,
}))

describe('FeaturedCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('fills the featured media area and renders the gallery controls', () => {
    render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel
          images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
          alt="Lead Project"
        />
      </div>,
    )

    expect(screen.getByLabelText('Image carousel')).toHaveClass('absolute', 'inset-0')
    expect(screen.getByAltText('Lead Project')).toHaveAttribute('src', '/lead-1.jpg')
    expect(screen.getByAltText(/Lead Project.*2/)).toHaveAttribute('src', '/lead-2.jpg')
    expect(screen.getByRole('button', { name: 'Ver imagem 3' })).toBeInTheDocument()
  })

  it('autoplays slides and can be manually changed from the thumbnails', () => {
    render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel
          images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
          alt="Lead Project"
        />
      </div>,
    )

    expect(screen.getByAltText('Lead Project')).toHaveClass('opacity-100')
    expect(screen.getByText('1/3')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByAltText(/Lead Project.*2/)).toHaveClass('opacity-100')
    expect(screen.getByText('2/3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'Ver imagem 3' }))

    expect(screen.getByAltText(/Lead Project.*3/)).toHaveClass('opacity-100')
    expect(screen.getByText('3/3')).toBeInTheDocument()
  })

  it('pauses autoplay while hovered and resumes when the pointer leaves', () => {
    render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel
          images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
          alt="Lead Project"
        />
      </div>,
    )

    const carousel = screen.getByLabelText('Image carousel')

    fireEvent.mouseEnter(carousel)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByAltText('Lead Project')).toHaveClass('opacity-100')
    expect(screen.getByText('1/3')).toBeInTheDocument()

    fireEvent.mouseLeave(carousel)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByAltText(/Lead Project.*2/)).toHaveClass('opacity-100')
    expect(screen.getByText('2/3')).toBeInTheDocument()
  })

  it('does not render when there are no images', () => {
    const { container } = render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel images={[]} alt="Empty Project" />
      </div>,
    )

    expect(container.querySelector('section[aria-label="Image carousel"]')).toBeNull()
  })

  it('keeps a single image static and skips gallery controls', () => {
    render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel images={['/solo.jpg']} alt="Solo Project" />
      </div>,
    )

    expect(screen.getByAltText('Solo Project')).toHaveClass('opacity-100')
    expect(screen.queryByRole('button', { name: /Ver imagem/i })).not.toBeInTheDocument()
    expect(screen.queryByText('1/1')).not.toBeInTheDocument()
  })

  it('cleans the autoplay timer on unmount', () => {
    const clearIntervalSpy = vi.spyOn(globalThis, 'clearInterval')

    const { unmount } = render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel
          images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
          alt="Lead Project"
        />
      </div>,
    )

    unmount()

    expect(clearIntervalSpy).toHaveBeenCalled()
    clearIntervalSpy.mockRestore()
  })
})
