import { render } from '@testing-library/react'
import { Picture } from '../picture'

const master = '/redesign/products/frame-klick.webp'

describe('Picture', () => {
  it('serves the static copies: AVIF first, WebP for the rest, never /_next/image', () => {
    const { container } = render(<Picture master={master} alt="Klick" sizes="60vw" fill />)
    const source = container.querySelector('picture > source')
    const image = container.querySelector('picture > img')
    expect(source).toHaveAttribute('type', 'image/avif')
    expect(source?.getAttribute('srcset')).toContain(
      '/redesign/copies/v1/redesign-products-frame-klick-2000.avif 2000w',
    )
    expect(source).toHaveAttribute('sizes', '60vw')
    expect(image?.getAttribute('srcset')).toContain('-640.webp 640w')
    expect(image).toHaveAttribute('alt', 'Klick')
    expect(container.innerHTML).not.toContain('/_next/image')
  })

  it('fills its box, or keeps the master’s intrinsic size', () => {
    const fill = render(<Picture master={master} alt="" sizes="60vw" fill className="object-top" />)
    expect(fill.container.querySelector('img')).toHaveClass(
      'absolute',
      'inset-0',
      'h-full',
      'w-full',
      'object-top',
    )
    fill.unmount()
    const intrinsic = render(
      <Picture master={master} alt="" sizes="60vw" className="h-auto w-full" />,
    )
    expect(intrinsic.container.querySelector('img')).toHaveAttribute('width', '2000')
    expect(intrinsic.container.querySelector('img')).toHaveAttribute('height', '1250')
  })

  it('is lazy unless it is the LCP, and passes data attributes to the image the motion drives', () => {
    const lazy = render(<Picture master={master} alt="" sizes="60vw" fill data-live-media="" />)
    const image = lazy.container.querySelector('img')
    expect(image).toHaveAttribute('loading', 'lazy')
    expect(image).toHaveAttribute('data-live-media')
    lazy.unmount()
    const lcp = render(<Picture master={master} alt="" sizes="60vw" fill priority />)
    expect(lcp.container.querySelector('img')).toHaveAttribute('loading', 'eager')
    expect(lcp.container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
  })
})
