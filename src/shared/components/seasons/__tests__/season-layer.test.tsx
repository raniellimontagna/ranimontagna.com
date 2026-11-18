import { act, render, screen } from '@testing-library/react'
import { useRetroMode } from '@/shared/store/use-retro-mode/use-retro-mode'
import { useSeason } from '@/shared/store/use-season/use-season'
import { SeasonLayer } from '../season-layer'

const loaded = vi.hoisted(() => vi.fn())

vi.mock('../natal/natal-layer', () => {
  loaded()
  return { NatalLayer: () => <div data-testid="natal-layer" /> }
})
vi.mock('../reveillon/reveillon-layer', () => ({
  ReveillonLayer: ({ locale }: { locale: string }) => (
    <div data-testid="reveillon-layer" data-locale={locale} />
  ),
}))
vi.mock('../carnaval/carnaval-layer', () => ({
  CarnavalLayer: ({ locale }: { locale: string }) => (
    <div data-testid="carnaval-layer" data-locale={locale} />
  ),
}))

beforeEach(() => {
  useRetroMode.setState({ active: false, mode: null })
})

it('never downloads the Christmas layer out of season', async () => {
  useSeason.setState({ active: null, current: null, init: () => {} })
  render(<SeasonLayer locale="pt" />)
  await act(async () => {})
  expect(screen.queryByTestId('natal-layer')).toBeNull()
  expect(loaded).not.toHaveBeenCalled()
})

it('loads the Christmas layer in season', async () => {
  useSeason.setState({ active: 'natal', current: 'natal', init: () => {} })
  render(<SeasonLayer locale="pt" />)
  expect(await screen.findByTestId('natal-layer')).toBeInTheDocument()
})

it('steps aside while a retro world is open and comes back after', async () => {
  useSeason.setState({ active: 'natal', current: 'natal', init: () => {} })
  useRetroMode.setState({ active: true, mode: 'xp' })
  render(<SeasonLayer locale="pt" />)
  await act(async () => {})
  expect(screen.queryByTestId('natal-layer')).toBeNull()

  act(() => useRetroMode.setState({ active: false, mode: null }))
  expect(await screen.findByTestId('natal-layer')).toBeInTheDocument()
})

it('loads only the season that is on', async () => {
  useSeason.setState({ active: 'reveillon', current: 'reveillon', init: () => {} })
  render(<SeasonLayer locale="es" />)
  expect(await screen.findByTestId('reveillon-layer')).toHaveAttribute('data-locale', 'es')
  expect(screen.queryByTestId('natal-layer')).toBeNull()
})

it('loads the Carnival layer in its season', async () => {
  useSeason.setState({ active: 'carnaval', current: 'carnaval', init: () => {} })
  render(<SeasonLayer locale="en" />)
  expect(await screen.findByTestId('carnaval-layer')).toHaveAttribute('data-locale', 'en')
  expect(screen.queryByTestId('reveillon-layer')).toBeNull()
})
