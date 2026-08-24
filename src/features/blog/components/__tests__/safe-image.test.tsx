import { fireEvent, render, screen } from '@testing-library/react'
import { SafeImage } from '../safe-image'

const nextImageProps = vi.hoisted(() => [] as Record<string, unknown>[])

vi.mock('next/image', () => ({
  default: (props: Record<string, unknown>) => {
    nextImageProps.push(props)
    const {
      fill: _fill,
      preload: _preload,
      priority: _priority,
      fetchPriority: _fetchPriority,
      alt,
      ...imageProps
    } = props

    // biome-ignore lint/performance/noImgElement: test double for next/image
    return <img alt={String(alt ?? '')} {...imageProps} />
  },
}))

describe('SafeImage', () => {
  beforeEach(() => {
    nextImageProps.length = 0
  })

  it('emits responsive geometry and lazy loading by default', () => {
    render(
      <SafeImage
        src="https://images.unsplash.com/photo-1"
        alt="Cover"
        width={1200}
        height={630}
        sizes="(max-width: 640px) 100vw, 33vw"
      />,
    )

    const image = screen.getByRole('img', { name: 'Cover' })
    expect(image).toHaveAttribute('width', '1200')
    expect(image).toHaveAttribute('height', '630')
    expect(image).toHaveAttribute('sizes', '(max-width: 640px) 100vw, 33vw')
    expect(image).toHaveAttribute('loading', 'lazy')
  })

  it.each([
    ['the Next 16 preload prop', { preload: true }],
    ['the legacy priority prop', { priority: true }],
  ])('normalizes %s without emitting incompatible image props', (_label, props) => {
    render(
      <SafeImage
        src="https://images.unsplash.com/photo-1"
        alt="Critical cover"
        loading="lazy"
        fetchPriority="high"
        {...props}
      />,
    )

    expect(nextImageProps.at(-1)).toMatchObject({ preload: true })
    expect(nextImageProps.at(-1)).not.toHaveProperty('priority')
    expect(nextImageProps.at(-1)).not.toHaveProperty('loading')
    expect(nextImageProps.at(-1)).not.toHaveProperty('fetchPriority')
  })

  it('uses the bounded local fallback for an invalid URL and after an image error', () => {
    const { rerender } = render(
      <SafeImage src="https://unapproved.example/image.jpg" alt="Invalid cover" />,
    )
    expect(screen.getByRole('img', { name: 'Invalid cover' })).toHaveAttribute(
      'src',
      '/images/blog-fallback.webp',
    )

    rerender(<SafeImage src="https://images.unsplash.com/photo-1" alt="Valid cover" />)
    const image = screen.getByRole('img', { name: 'Valid cover' })
    fireEvent.error(image)
    expect(image).toHaveAttribute('src', '/images/blog-fallback.webp')
  })
})
