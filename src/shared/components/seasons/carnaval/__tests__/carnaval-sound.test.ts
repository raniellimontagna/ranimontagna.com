import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playBatucada, playWhistle } from '../carnaval-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('whistles and drums only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playWhistle()
  playBatucada()
  expect(oscillators).not.toHaveBeenCalled()

  setSeasonSound(true)
  playWhistle()
  expect(oscillators).toHaveBeenCalledTimes(2)
  playBatucada()
  expect(oscillators).toHaveBeenCalledTimes(14)
})
