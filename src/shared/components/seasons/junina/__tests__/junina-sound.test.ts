import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playAccordion, playForro } from '../junina-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('plays the accordion and the forró only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playAccordion()
  playForro()
  expect(oscillators).not.toHaveBeenCalled()
  setSeasonSound(true)
  playAccordion()
  expect(oscillators).toHaveBeenCalledTimes(6)
  playForro()
  expect(oscillators).toHaveBeenCalledTimes(30)
})
