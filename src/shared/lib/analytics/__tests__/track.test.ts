import { track } from '../track'

type UmamiWindow = Window & { umami?: { track: (event: string, data?: object) => void } }

afterEach(() => {
  delete (window as UmamiWindow).umami
})

it('does nothing when the analytics script is not there', () => {
  expect(() => track('season-off', { season: 'natal' })).not.toThrow()
})

it('hands the event to Umami', () => {
  const umami = { track: vi.fn() }
  ;(window as UmamiWindow).umami = umami
  track('season-gift', { season: 'natal', gift: 'ia', found: 1 })
  expect(umami.track).toHaveBeenCalledWith('season-gift', { season: 'natal', gift: 'ia', found: 1 })
})

it('never lets an analytics failure reach the page', () => {
  ;(window as UmamiWindow).umami = {
    track: () => {
      throw new Error('blocked')
    },
  }
  expect(() => track('season-off')).not.toThrow()
})
