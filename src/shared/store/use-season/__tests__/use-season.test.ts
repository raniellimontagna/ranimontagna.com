import { useSeason } from '../use-season'

const root = document.documentElement
const today = (month: number, day: number) =>
  vi.setSystemTime(new Date(2026, month - 1, day, 12, 0))

beforeEach(() => {
  vi.useFakeTimers({ toFake: ['Date'] })
  localStorage.clear()
  sessionStorage.clear()
  root.removeAttribute('data-season')
  useSeason.setState({ active: null, current: null })
})

afterEach(() => {
  vi.useRealTimers()
  vi.restoreAllMocks()
})

it('turns Christmas on in December', () => {
  today(12, 10)
  useSeason.getState().init()
  expect(useSeason.getState()).toMatchObject({ active: 'natal', current: 'natal' })
  expect(root).toHaveAttribute('data-season', 'natal')
})

it('has no season in July', () => {
  today(7, 15)
  useSeason.getState().init()
  expect(useSeason.getState()).toMatchObject({ active: null, current: null })
})

it('knows the season a visitor turned off, so the switch can bring it back', () => {
  today(12, 10)
  localStorage.setItem('season-off:natal-2026', '1')
  useSeason.getState().init()
  expect(useSeason.getState()).toMatchObject({ active: null, current: 'natal' })
})

it('turns the season off and on for this year', () => {
  today(12, 10)
  useSeason.getState().init()

  useSeason.getState().setEnabled(false)
  expect(root).not.toHaveAttribute('data-season')
  expect(localStorage.getItem('season-off:natal-2026')).toBe('1')
  expect(useSeason.getState()).toMatchObject({ active: null, current: 'natal' })

  useSeason.getState().setEnabled(true)
  expect(root).toHaveAttribute('data-season', 'natal')
  expect(localStorage.getItem('season-off:natal-2026')).toBeNull()
  expect(useSeason.getState().active).toBe('natal')
})

it('ends a preview for the tab when the visitor turns it off', () => {
  today(11, 15)
  sessionStorage.setItem('season-preview', 'natal')
  useSeason.getState().init()
  expect(useSeason.getState().active).toBe('natal')

  useSeason.getState().setEnabled(false)
  expect(sessionStorage.getItem('season-preview')).toBe('off')
  expect(root).not.toHaveAttribute('data-season')
  // A preview never leaves a lasting turn-off behind for the real season.
  expect(localStorage.getItem('season-off:natal-2026')).toBeNull()

  useSeason.getState().setEnabled(true)
  expect(sessionStorage.getItem('season-preview')).toBe('natal')
  expect(root).toHaveAttribute('data-season', 'natal')
})

it('still turns off when storage is blocked', () => {
  today(12, 10)
  useSeason.getState().init()
  vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  expect(() => useSeason.getState().setEnabled(false)).not.toThrow()
  expect(root).not.toHaveAttribute('data-season')
})

it('follows the date when storage is blocked at start', () => {
  today(12, 10)
  vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
    throw new Error('blocked')
  })
  useSeason.getState().init()
  expect(useSeason.getState().active).toBe('natal')
})
