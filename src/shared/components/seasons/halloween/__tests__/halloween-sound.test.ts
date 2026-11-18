import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playCackle, playSquash } from '../halloween-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('cackles and squashes only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playCackle()
  playSquash()
  expect(oscillators).not.toHaveBeenCalled()
  setSeasonSound(true)
  playSquash()
  expect(oscillators).toHaveBeenCalledTimes(2)
  playCackle()
  expect(oscillators).toHaveBeenCalledTimes(18)
})
