import { render, screen } from '@/tests/test-utils'
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
})
