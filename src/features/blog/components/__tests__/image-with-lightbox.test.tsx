import { fireEvent, waitFor } from '@testing-library/react'
import { render, screen } from '@/tests/test-utils'
import { ImageWithLightbox } from '../image-with-lightbox'

vi.mock('next-intl', () => ({
  useTranslations: () => (key: string, values?: { alt?: string }) => {
    const translations: Record<string, string> = {
      image: 'Image',
      zoomImage: `View larger: ${values?.alt ?? ''}`,
      zoomIn: 'Zoom in',
      viewerLoading: 'Loading image viewer…',
      viewerError: 'The image viewer could not be loaded.',
    }
    return translations[key] ?? key
  },
}))

interface LightboxProps {
  open: boolean
  close: () => void
  slides: Array<{ src: string; alt: string }>
}

// Mock yet-another-react-lightbox
vi.mock('yet-another-react-lightbox', () => ({
  default: ({ open, close, slides }: LightboxProps) => {
    if (!open) return null
    return (
      <div data-testid="lightbox">
        <button type="button" onClick={close} data-testid="lightbox-close">
          Close
        </button>
        {/* biome-ignore lint/performance/noImgElement: mock component for testing */}
        <img src={slides[0].src} alt={slides[0].alt} data-testid="lightbox-image" />
      </div>
    )
  },
}))

describe('ImageWithLightbox Component', () => {
  const mockSrc = 'https://images.unsplash.com/test-image.jpg'
  const mockAlt = 'Test image description'

  describe('Rendering', () => {
    it('renders image with src and alt', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const image = screen.getByAltText(mockAlt)
      expect(image).toBeInTheDocument()
      expect(image.getAttribute('src')).toContain(encodeURIComponent(mockSrc))
    })

    it('returns null when src is not provided', () => {
      const { container } = render(<ImageWithLightbox alt={mockAlt} />)
      expect(container.firstChild).toBeNull()
    })

    it('renders without alt text', () => {
      render(<ImageWithLightbox src={mockSrc} />)

      const button = screen.getByRole('button')
      expect(button).toBeInTheDocument()
      expect(button).toHaveAttribute('aria-label', 'View larger: Image')
    })

    it('displays caption when alt is provided', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const caption = screen.getByText(mockAlt)
      expect(caption).toBeInTheDocument()
      expect(caption).toHaveClass('text-sm', 'italic')
    })

    it('does not display caption when alt is not provided', () => {
      const { container } = render(<ImageWithLightbox src={mockSrc} />)

      const caption = container.querySelector('.text-sm.italic')
      expect(caption).not.toBeInTheDocument()
    })
  })

  describe('Zoom Indicator', () => {
    it('renders zoom icon', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const zoomIcon = screen.getByTitle('Zoom in')
      expect(zoomIcon).toBeInTheDocument()
    })
  })

  describe('Accessibility', () => {
    it('has proper aria-label with alt text', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', `View larger: ${mockAlt}`)
    })

    it('has proper aria-label without alt text', () => {
      render(<ImageWithLightbox src={mockSrc} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('aria-label', 'View larger: Image')
    })

    it('has proper button type', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const button = screen.getByRole('button')
      expect(button).toHaveAttribute('type', 'button')
    })

    it('has cursor-zoom-in class', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('cursor-zoom-in')
    })
  })

  describe('Lightbox Interaction', () => {
    it('loads the viewer only after activation', async () => {
      const loadLightbox = vi.fn(async () => (await import('yet-another-react-lightbox')).default)
      render(
        <ImageWithLightbox src={mockSrc} alt={mockAlt} loadLightbox={loadLightbox} />,
      )

      expect(loadLightbox).not.toHaveBeenCalled()
      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
      fireEvent.click(screen.getByRole('button', { name: `View larger: ${mockAlt}` }))

      await waitFor(() => expect(loadLightbox).toHaveBeenCalledTimes(1))
      expect(await screen.findByTestId('lightbox')).toBeInTheDocument()
    })

    it('opens lightbox when image is clicked', async () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const button = screen.getByRole('button', { name: `View larger: ${mockAlt}` })
      fireEvent.click(button)

      const lightbox = await screen.findByTestId('lightbox')
      expect(lightbox).toBeInTheDocument()
    })

    it('closes lightbox when close is triggered and restores trigger focus', async () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      // Open lightbox
      const openButton = screen.getByRole('button', { name: `View larger: ${mockAlt}` })
      fireEvent.click(openButton)

      expect(await screen.findByTestId('lightbox')).toBeInTheDocument()

      // Close lightbox
      const closeButton = screen.getByTestId('lightbox-close')
      fireEvent.click(closeButton)

      expect(screen.queryByTestId('lightbox')).not.toBeInTheDocument()
      await waitFor(() => expect(openButton).toHaveFocus())
    })

    it('lightbox is initially closed', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const lightbox = screen.queryByTestId('lightbox')
      expect(lightbox).not.toBeInTheDocument()
    })

    it('passes correct props to lightbox', async () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      // Open lightbox
      const button = screen.getByRole('button')
      fireEvent.click(button)

      const lightboxImage = await screen.findByTestId('lightbox-image')
      expect(lightboxImage).toHaveAttribute('src', mockSrc)
      expect(lightboxImage).toHaveAttribute('alt', mockAlt)
    })

    it('uses default alt text in lightbox when alt is not provided', async () => {
      render(<ImageWithLightbox src={mockSrc} />)

      // Open lightbox
      const button = screen.getByRole('button')
      fireEvent.click(button)

      const lightboxImage = await screen.findByTestId('lightbox-image')
      expect(lightboxImage).toHaveAttribute('alt', 'Image')
    })
  })

  describe('Image Loading', () => {
    it('has lazy loading attribute', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const image = screen.getByAltText(mockAlt)
      expect(image).toHaveAttribute('loading', 'lazy')
    })
  })

  describe('Styling', () => {
    it('has proper container classes', () => {
      const { container } = render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const span = container.querySelector('span.my-8.block')
      expect(span).toBeInTheDocument()
    })

    it('button has proper styling classes', () => {
      render(<ImageWithLightbox src={mockSrc} alt={mockAlt} />)

      const button = screen.getByRole('button')
      expect(button).toHaveClass(
        'group',
        'relative',
        'block',
        'w-full',
        'cursor-zoom-in',
        'overflow-hidden',
        'rounded-xl',
        'border',
      )
    })
  })
})
