import { fireEvent, render, screen } from '@testing-library/react'
import { SafeImage } from '../safe-image'

vi.mock('next/image', () => ({
  default: ({
    fill: _fill,
    priority: _priority,
    alt,
    ...props
  }: Record<string, unknown>) => (
    // biome-ignore lint/performance/noImgElement: test double for next/image
    <img alt={String(alt ?? '')} {...props} />
  ),
}))

describe('SafeImage', () => {
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
