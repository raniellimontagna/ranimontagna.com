import { act, fireEvent, render } from '@testing-library/react'
import { mockMatchMedia } from '@/tests/mocks/match-media'
import { NameLights } from '../name-lights'

const originalMatchMedia = window.matchMedia

function Hero() {
  return (
    <h1 data-hero-title aria-label="Ranielli Montagna">
      <span>Ranielli</span>
      <span>Montagna</span>
      <span data-season-slot="hero-lights" aria-hidden="true" />
    </h1>
  )
}

async function renderHero() {
  const view = render(
    <>
      <Hero />
      <NameLights />
    </>,
  )
  await act(async () => {})
  return view
}

const lights = () => document.querySelector('[data-name-lights]')

afterEach(() => {
  window.matchMedia = originalMatchMedia
})

it('hangs the lights inside the hero slot', async () => {
  await renderHero()
  const slot = document.querySelector('[data-season-slot="hero-lights"]')
  expect(slot?.querySelector('[data-name-lights]')).not.toBeNull()
  expect(lights()?.querySelectorAll('[data-bulb]').length).toBeGreaterThan(0)
})

it('frames the name: bulbs stand up over the first line and hang under the last', async () => {
  await renderHero()
  const bulbs = Array.from(document.querySelectorAll('[data-bulb]'))
  const up = bulbs.filter((bulb) => bulb.hasAttribute('data-up'))
  expect(up.length).toBeGreaterThan(0)
  expect(up.length).toBeLessThan(bulbs.length)
  expect(bulbs[0]).toHaveAttribute('data-up')
  expect(bulbs.at(-1)).not.toHaveAttribute('data-up')
})

it('keeps the lights steady with reduced motion, even after a click', async () => {
  await renderHero()
  expect(lights()).toHaveAttribute('data-pattern', 'steady')
  fireEvent.click(document.querySelector('[data-hero-title]') as Element)
  expect(lights()).toHaveAttribute('data-pattern', 'steady')
})

it('changes the pattern when the name is clicked', async () => {
  mockMatchMedia({})
  await renderHero()
  const title = document.querySelector('[data-hero-title]') as Element
  expect(lights()).toHaveAttribute('data-pattern', 'chase')
  fireEvent.click(title)
  expect(lights()).toHaveAttribute('data-pattern', 'twinkle')
  fireEvent.click(title)
  expect(lights()).toHaveAttribute('data-pattern', 'steady')
  fireEvent.click(title)
  expect(lights()).toHaveAttribute('data-pattern', 'chase')
})
