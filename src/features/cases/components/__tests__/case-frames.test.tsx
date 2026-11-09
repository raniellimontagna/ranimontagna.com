import { render } from '@testing-library/react'
import { CASES } from '../../cases.data'
import { CaseCover } from '../case-cover'
import { BrowserFrame, CaseStill, PhoneFrame } from '../case-frames'

describe('device frames', () => {
  it('keep their screens in their own stacking context, so a screen layer never paints over the other frame', () => {
    const { container } = render(
      <>
        <BrowserFrame host="klick.ranimontagna.com">
          <span />
        </BrowserFrame>
        <PhoneFrame>
          <span />
        </PhoneFrame>
      </>,
    )
    const screens = container.querySelectorAll('[data-frame-screen]')
    expect(screens).toHaveLength(2)
    for (const screen of screens) expect(screen).toHaveClass('isolate')
  })
})

describe('CaseCover', () => {
  it('is decoration inside its card link: the card names the case, not the screenshots', () => {
    const { container } = render(<CaseCover study={CASES.klick} priority />)
    const images = container.querySelectorAll('img')
    expect(images.length).toBe(2)
    for (const image of images) expect(image).toHaveAttribute('alt', '')
  })
})

describe('CaseStill', () => {
  const master = '/redesign/cases/v1/klick-desk-evolucao.webp'

  it('serves the pre-sized static copies, AVIF first and WebP for the rest, never /_next/image', () => {
    const { container } = render(
      <CaseStill master={master} kind="desk" alt="Evolução" sizes="60vw" />,
    )
    const source = container.querySelector('picture > source')
    const image = container.querySelector('picture > img')
    expect(source).toHaveAttribute('type', 'image/avif')
    expect(source?.getAttribute('srcset')).toContain(
      '/redesign/cases/v1/sized/klick-desk-evolucao-2400.avif 2400w',
    )
    expect(source).toHaveAttribute('sizes', '60vw')
    expect(image?.getAttribute('srcset')).toContain(
      '/redesign/cases/v1/sized/klick-desk-evolucao-640.webp 640w',
    )
    expect(image).toHaveAttribute('src', '/redesign/cases/v1/sized/klick-desk-evolucao-1600.webp')
    expect(image).toHaveAttribute('alt', 'Evolução')
    expect(container.innerHTML).not.toContain('/_next/image')
  })

  it('loads lazily, unless it is the page’s LCP: then eagerly and at high priority', () => {
    const lazy = render(<CaseStill master={master} kind="desk" alt="" sizes="60vw" />)
    expect(lazy.container.querySelector('img')).toHaveAttribute('loading', 'lazy')
    expect(lazy.container.querySelector('img')).not.toHaveAttribute('fetchpriority')
    lazy.unmount()
    const lcp = render(<CaseStill master={master} kind="desk" alt="" sizes="60vw" priority />)
    expect(lcp.container.querySelector('img')).toHaveAttribute('loading', 'eager')
    expect(lcp.container.querySelector('img')).toHaveAttribute('fetchpriority', 'high')
  })
})
