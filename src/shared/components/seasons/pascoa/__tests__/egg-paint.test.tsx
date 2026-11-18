import { act, fireEvent, render } from '@testing-library/react'
import { EggPaint } from '../egg-paint'
import { playPloc } from '../pascoa-sound'

vi.mock('../pascoa-sound', () => ({ playPloc: vi.fn(() => () => {}) }))

it('paints the name in stripes, then dots and zigzags on each click, and cleans up', async () => {
  const { unmount } = render(
    <>
      <h1 data-hero-title aria-label="Ranielli Montagna">
        <span>Ranielli</span>
        <span data-season-slot="hero-lights" aria-hidden="true" />
      </h1>
      <EggPaint />
    </>,
  )
  await act(async () => {})
  const title = document.querySelector('[data-hero-title]') as HTMLElement
  expect(title).toHaveAttribute('data-pintura', 'listras')
  expect(title).toHaveAttribute('data-no-fireworks')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-pintura', 'bolinhas')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-pintura', 'zigue')
  fireEvent.click(title)
  expect(title).toHaveAttribute('data-pintura', 'listras')
  expect(playPloc).toHaveBeenCalledTimes(3)
  unmount()
  expect(title).not.toHaveAttribute('data-pintura')
  expect(title).not.toHaveAttribute('data-no-fireworks')
})
