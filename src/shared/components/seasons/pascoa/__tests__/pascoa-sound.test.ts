import { installFakeAudio } from '@/tests/mocks/audio'
import { setSeasonSound } from '../../shared/season-sound'
import { playChimes, playPloc } from '../pascoa-sound'

afterEach(() => {
  setSeasonSound(false)
  vi.restoreAllMocks()
})

it('knocks and chimes only with the season sound on', () => {
  const { oscillators } = installFakeAudio()
  playPloc()
  playChimes()
  expect(oscillators).not.toHaveBeenCalled()
  setSeasonSound(true)
  playPloc()
  expect(oscillators).toHaveBeenCalledTimes(2)
  playChimes()
  expect(oscillators).toHaveBeenCalledTimes(6)
})
