import { render } from '@testing-library/react'
import { CASES } from '../../cases.data'
import { CaseCover } from '../case-cover'
import { BrowserFrame, PhoneFrame } from '../case-frames'

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
