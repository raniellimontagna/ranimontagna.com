import { render } from '@/tests/test-utils'
import { StaticImage } from '../static-image'

describe('StaticImage', () => {
  it('fetches a priority image at high priority, never lazily', () => {
    const { container } = render(
      <StaticImage src="/photo.webp" alt="a" width={100} height={100} priority />,
    )
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('fetchpriority')).toBe('high')
    expect(img.getAttribute('loading')).not.toBe('lazy')
  })

  it('leaves other images lazy and at the default priority', () => {
    const { container } = render(<StaticImage src="/photo.webp" alt="a" width={100} height={100} />)
    const img = container.querySelector('img') as HTMLImageElement
    expect(img.getAttribute('fetchpriority')).toBeNull()
    expect(img.getAttribute('loading')).toBe('lazy')
  })
})
