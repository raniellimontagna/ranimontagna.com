import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playBuild, playHit, playKey } from '../programador-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('clicks keys, chimes and plays the build only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playKey()
  playHit()
  playBuild()
  expect(oscillators).not.toHaveBeenCalled()
  setSeasonSound(true)
  playKey()
  expect(oscillators).toHaveBeenCalledTimes(2)
  playHit()
  expect(oscillators).toHaveBeenCalledTimes(4)
  playBuild()
  expect(oscillators).toHaveBeenCalledTimes(8)
})
