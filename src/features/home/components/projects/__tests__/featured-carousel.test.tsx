import { act, fireEvent, render, screen } from '@/tests/test-utils'
import { FeaturedCarousel } from '../featured-carousel'

vi.mock('next/image', () => ({
  default: ({
    alt,
    fill: _fill,
    priority,
    ...props
  }: React.ImgHTMLAttributes<HTMLImageElement> & {
    fill?: boolean
    priority?: boolean
    // biome-ignore lint/performance/noImgElement: test double for next/image
  }) => <img alt={alt} data-priority={priority ? 'true' : undefined} {...props} />,
}))

describe('FeaturedCarousel', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    Object.defineProperty(document, 'visibilityState', {
      configurable: true,
      value: 'visible',
    })
    window.matchMedia = vi.fn().mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(private readonly callback: IntersectionObserverCallback) {}
        observe = (target: Element) =>
          this.callback(
            [
              {
                isIntersecting: true,
                intersectionRatio: 1,
                target,
              } as IntersectionObserverEntry,
            ],
            this as unknown as IntersectionObserver,
          )
        disconnect = vi.fn()
        unobserve = vi.fn()
        takeRecords = vi.fn()
      },
    )
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
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
    expect(screen.getByAltText('Lead Project')).not.toHaveAttribute('data-priority', 'true')
    expect(screen.queryByRole('img', { name: /Lead Project.*2/ })).not.toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'View image 3 of 3' })).toBeInTheDocument()
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

    expect(screen.getByRole('img', { name: 'Lead Project' })).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByRole('img', { name: /Lead Project.*2/ })).toBeInTheDocument()
    expect(screen.getByText('2/3')).toBeInTheDocument()

    fireEvent.click(screen.getByRole('button', { name: 'View image 3 of 3' }))

    expect(screen.getByRole('img', { name: /Lead Project.*3/ })).toBeInTheDocument()
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

    expect(screen.getByRole('img', { name: 'Lead Project' })).toBeInTheDocument()
    expect(screen.getByText('1/3')).toBeInTheDocument()

    fireEvent.mouseLeave(carousel)

    act(() => {
      vi.advanceTimersByTime(5000)
    })

    expect(screen.getByRole('img', { name: /Lead Project.*2/ })).toBeInTheDocument()
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

    expect(screen.getByAltText('Solo Project')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: /View image/i })).not.toBeInTheDocument()
    expect(screen.queryByText('1/1')).not.toBeInTheDocument()
  })

  it('cleans the autoplay timer on unmount', async () => {
    const { unmount } = render(
      <div className="relative aspect-video w-full">
        <FeaturedCarousel
          images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
          alt="Lead Project"
        />
      </div>,
    )

    await act(async () => undefined)
    expect(vi.getTimerCount()).toBeGreaterThan(0)
    unmount()

    expect(vi.getTimerCount()).toBe(0)
  })

  it('exposes localized controls and selected slide state', () => {
    render(
      <FeaturedCarousel
        images={['/lead-1.jpg', '/lead-2.jpg', '/lead-3.jpg']}
        alt="Proyecto"
        labels={{
          region: 'Carrusel de imágenes',
          pause: 'Pausar carrusel',
          resume: 'Reanudar carrusel',
          slide: (index, total) => `Ver imagen ${index} de ${total}`,
        }}
      />,
    )

    expect(screen.getByRole('region', { name: 'Carrusel de imágenes' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Pausar carrusel' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Ver imagen 1 de 3' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Ver imagen 2 de 3' })).toHaveAttribute(
      'aria-pressed',
      'false',
    )
  })

  it('stays paused offscreen and resumes once visible', () => {
    let observerCallback: IntersectionObserverCallback | undefined
    const disconnect = vi.fn()
    vi.stubGlobal(
      'IntersectionObserver',
      class {
        constructor(callback: IntersectionObserverCallback) {
        observerCallback = callback
        }
        observe = vi.fn()
        disconnect = disconnect
        unobserve = vi.fn()
        takeRecords = vi.fn()
      },
    )

    const { unmount } = render(
      <FeaturedCarousel images={['/lead-1.jpg', '/lead-2.jpg']} alt="Lead Project" />,
    )

    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('1/2')).toBeInTheDocument()

    act(() => {
      observerCallback?.(
        [{ isIntersecting: true, intersectionRatio: 1 } as IntersectionObserverEntry],
        {} as IntersectionObserver,
      )
    })
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('2/2')).toBeInTheDocument()

    unmount()
    expect(disconnect).toHaveBeenCalledOnce()
  })

  it('starts persistently paused for reduced motion and can resume by explicit request', () => {
    window.matchMedia = vi.fn().mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })

    render(<FeaturedCarousel images={['/lead-1.jpg', '/lead-2.jpg']} alt="Lead Project" />)

    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('1/2')).toBeInTheDocument()

    const resume = screen.getByRole('button', { name: 'Resume carousel' })
    fireEvent.click(resume)
    fireEvent.blur(resume, { relatedTarget: document.body })
    act(() => vi.advanceTimersByTime(5000))
    expect(screen.getByText('2/2')).toBeInTheDocument()
  })
})
