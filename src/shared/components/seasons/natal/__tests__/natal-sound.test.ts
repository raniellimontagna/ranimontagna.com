import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playBell, playJingle } from '../natal-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('rings the bell and the jingle only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playBell()
  playJingle()
  expect(oscillators).not.toHaveBeenCalled()

  setSeasonSound(true)
  playBell()
  const afterBell = oscillators.mock.calls.length
  expect(afterBell).toBeGreaterThan(0)
  playJingle()
  expect(oscillators.mock.calls.length).toBeGreaterThan(afterBell)
})
